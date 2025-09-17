import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Award, Download, Mail, Plus, Search, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../lib/utils';
import CertificateGenerator from './CertificateGenerator';
import IssueCertificateModal from './IssueCertificateModal';
import type { Course } from '../../types/course';

interface User {
  id: string;
  email: string;
  name: string;
  enrolled_at: string;
  last_accessed?: string;
  completed_lessons?: string[];
  is_external?: boolean;
}

interface EnrolledUsersListProps {
  course: Course;
}

export default function EnrolledUsersList({ course }: EnrolledUsersListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [showCertificateGenerator, setShowCertificateGenerator] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [showIssueCertificateModal, setShowIssueCertificateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [certificates, setCertificates] = useState<Record<string, any>>({});
  const [newUserFirstName, setNewUserFirstName] = useState('');
  const [newUserLastName, setNewUserLastName] = useState('');
  const [addingUser, setAddingUser] = useState(false);
  const [certificateStatus, setCertificateStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchEnrolledUsers();
  }, [course.id]);

  const fetchEnrolledUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch registered users enrolled in this course
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select(`
          id,
          user_id,
          created_at,
          last_accessed,
          completed_lessons,
          todo_profiles (
            email,
            first_name,
            last_name,
            full_name
          )
        `)
        .eq('course_id', course.id);

      if (enrollmentsError) throw enrollmentsError;

      // Fetch external enrollments for this course
      const { data: externalEnrollments, error: externalError } = await supabase
        .from('external_enrollments')
        .select('*')
        .eq('course_id', course.id);

      if (externalError) throw externalError;

      // Format registered users
      const registeredUsers = enrollments?.map(enrollment => ({
        id: enrollment.user_id,
        email: enrollment.todo_profiles.email,
        name: enrollment.todo_profiles.full_name || 
              (enrollment.todo_profiles.first_name || enrollment.todo_profiles.last_name ? 
                `${enrollment.todo_profiles.first_name || ''} ${enrollment.todo_profiles.last_name || ''}`.trim() : 
                enrollment.todo_profiles.email),
        first_name: enrollment.todo_profiles.first_name || '',
        last_name: enrollment.todo_profiles.last_name || '',
        enrolled_at: enrollment.created_at,
        last_accessed: enrollment.last_accessed,
        completed_lessons: enrollment.completed_lessons,
        is_external: false
      })) || [];

      // Format external users
      const externalUsers = externalEnrollments?.map(enrollment => ({
        id: enrollment.id,
        email: enrollment.email,
        name: (enrollment.first_name || enrollment.last_name ? 
               `${enrollment.first_name || ''} ${enrollment.last_name || ''}`.trim() : 
               enrollment.email),
        first_name: enrollment.first_name || '',
        last_name: enrollment.last_name || '',
        enrolled_at: enrollment.created_at,
        last_accessed: enrollment.last_accessed,
        completed_lessons: enrollment.completed_lessons,
        is_external: true
      })) || [];

      // Combine and sort by enrollment date
      const allUsers = [...registeredUsers, ...externalUsers].sort((a, b) => 
        new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime()
      );

      setUsers(allUsers);
      
      // Fetch certificate status for all users
      fetchCertificateStatus(allUsers);
    } catch (error) {
      console.error('Error fetching enrolled users:', error);
      toast.error('Failed to load enrolled users');
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificateStatus = async (users: User[]) => {
    try {
      // Prepare arrays for querying
      const regularUserIds = users.filter(u => !u.is_external).map(u => u.id);
      const externalUserIds = users.filter(u => u.is_external).map(u => u.id);
      
      // Query certificates for regular users
      let certificatesMap: Record<string, boolean> = {};
      
      if (regularUserIds.length > 0) {
        const { data: regularCerts } = await supabase
          .from('course_certificates')
          .select('user_id')
          .eq('course_id', course.id)
          .in('user_id', regularUserIds);
          
        regularCerts?.forEach(cert => {
          if (cert.user_id) certificatesMap[cert.user_id] = true;
        });
      }
      
      // Query certificates for external users
      if (externalUserIds.length > 0) {
        const { data: externalCerts } = await supabase
          .from('course_certificates')
          .select('external_user_id')
          .eq('course_id', course.id)
          .in('external_user_id', externalUserIds);
          
        externalCerts?.forEach(cert => {
          if (cert.external_user_id) certificatesMap[cert.external_user_id] = true;
        });
      }
      
      setCertificateStatus(certificatesMap);
     
     // Fetch all certificates for this course
     const { data: allCertificates } = await supabase
       .from('course_certificates')
       .select('*')
       .eq('course_id', course.id);
       
     if (allCertificates) {
       const certsMap: Record<string, any> = {};
       
       // Map certificates by user_id and external_user_id
       allCertificates.forEach(cert => {
         if (cert.user_id) certsMap[cert.user_id] = cert;
         if (cert.external_user_id) certsMap[cert.external_user_id] = cert;
       });
       
       setCertificates(certsMap);
     }
    } catch (error) {
      console.error('Error fetching certificate status:', error);
    }
  };

  const handleAddExternalUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUserEmail.trim()) {
      toast.error('Email is required');
      return;
    }

    setAddingUser(true);
    try {
      // Check if user is already enrolled
      const isAlreadyEnrolled = users.some(user => 
        user.email.toLowerCase() === newUserEmail.toLowerCase()
      );

      if (isAlreadyEnrolled) {
        toast.error('User is already enrolled in this course');
        return;
      }

      // Create external enrollment
      const { data, error } = await supabase
        .from('external_enrollments')
        .insert({
          email: newUserEmail.trim(),
          first_name: newUserFirstName.trim(),
          last_name: newUserLastName.trim(),
          course_id: course.id,
          enrolled_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select();

      if (error) throw error;

      toast.success('User added successfully');
      setNewUserEmail('');
      setNewUserFirstName('');
      setNewUserLastName('');
      setShowAddUser(false);
      fetchEnrolledUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('Failed to add user');
    } finally {
      setAddingUser(false);
    }
  };

  const handleDownloadCertificate = async (user: User) => {
    try {
      // Check if we already have the certificate data
      if (certificates[user.id]) {
        await downloadCertificatePdf(certificates[user.id]);
        return;
      }
      
      // Otherwise fetch the certificate
      const { data: cert, error } = await supabase
        .from('course_certificates')
        .select(`
          id,
          certificate_number,
          course_title,
          participant_name,
          issued_date,
          ce_hours,
          instructor,
          school_name,
          pdf_url,
          course_number,
          course_date
        `)
        .eq('course_id', course.id)
        .eq(user.is_external ? 'external_user_id' : 'user_id', user.id)
        .single();
        
      if (error) throw error;
      if (!cert) {
        toast.error('Certificate not found');
        return;
      }
      
      // Cache the certificate data
      setCertificates(prev => ({
        ...prev,
        [user.id]: cert
      }));
      
      await downloadCertificatePdf(cert);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate');
    }
  };
  
  const downloadCertificatePdf = async (cert: any) => {
    // Import the generateCertificatePdf function
    try {      
      // Generate PDF data URL with proper course number and formatting
      const pdfDataUrl = generateCertificatePdf({
        certificateNumber: cert.certificate_number || 'N/A',
        schoolName: cert.school_name || 'RealEdu',
        instructor: cert.instructor || course.instructor,
        courseTitle: cert.course_title || course.title,
        courseNumber: cert.course_number || course.course_number || '',
        courseDate: cert.course_date ? new Date(cert.course_date).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }) : cert.issued_date ? new Date(cert.issued_date).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }) : course.startTime ? new Date(course.startTime).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }) : new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }), 
        participantName: cert.participant_name || 'Certificate Recipient',
        ceHours: cert.ce_hours || 0,
        issuedDate: cert.issued_date || new Date().toISOString()
      });

      // Create a link element and trigger download
      const link = document.createElement('a');
      link.href = pdfDataUrl;
      link.download = `${cert.certificate_number || 'certificate'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate certificate PDF');
    }
  };

  const handleIssueCertificate = (user: User) => {
    setSelectedUser(user);
    setShowIssueCertificateModal(true);
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUserSelection = (user: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id);
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAddUser(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add External User
          </button>
          {selectedUsers.length > 0 && (
            <button
              onClick={() => setShowCertificateGenerator(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Award className="h-4 w-4 mr-2" />
              Generate Certificates ({selectedUsers.length})
            </button>
          )}
        </div>
      </div>

      {/* User list */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={selectedUsers.length === users.length}
                      onChange={() => {
                        if (selectedUsers.length === users.length) {
                          setSelectedUsers([]);
                        } else {
                          setSelectedUsers([...users]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrolled
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Access
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={selectedUsers.some(u => u.id === user.id)}
                      onChange={() => toggleUserSelection(user)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                        {user.is_external && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            External
                          </span>
                        )}
                        {certificateStatus[user.id] && (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Certificate Issued
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.enrolled_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_accessed ? formatDate(user.last_accessed) : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.completed_lessons?.length || 0} lessons completed
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full" 
                        style={{ width: `${(user.completed_lessons?.length || 0) / (course.lessons?.length || 1) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleIssueCertificate(user)}
                      disabled={certificateStatus[user.id]}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                      title={certificateStatus[user.id] ? "Certificate already issued" : "Issue certificate"}
                    >
                      <Award className={`h-5 w-5 ${certificateStatus[user.id] ? 'text-gray-400' : ''}`} />
                    </button>
                    <button
                     onClick={() => handleDownloadCertificate(user)}
                      className="text-indigo-600 hover:text-indigo-900"
                     title="Download certificate"
                     disabled={!certificateStatus[user.id]}
                    >
                     <Download className={`h-5 w-5 ${!certificateStatus[user.id] ? 'text-gray-400' : ''}`} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add External User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add External User</h3>
            <form onSubmit={handleAddExternalUser} className="space-y-4">
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label 
                  htmlFor="firstName" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={newUserFirstName}
                  onChange={(e) => setNewUserFirstName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label 
                  htmlFor="lastName" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={newUserLastName}
                  onChange={(e) => setNewUserLastName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingUser || !newUserEmail}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
                >
                  {addingUser ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Generator Modal */}
      {showCertificateGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Generate Certificates</h3>
            <CertificateGenerator
              courseId={course.id}
              courseName={course.title}
              instructor={course.instructor}
              ceHours={3}
              selectedUsers={selectedUsers.filter(user => !certificateStatus[user.id])}
              onSuccess={() => {
                setShowCertificateGenerator(false);
                setSelectedUsers([]);
                fetchEnrolledUsers();
              }}
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowCertificateGenerator(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Certificate Modal */}
      {showIssueCertificateModal && selectedUser && (
        <IssueCertificateModal
          course={course}
          userId={selectedUser.id}
          userEmail={selectedUser.email}
          userName={selectedUser.name}
          isExternal={selectedUser.is_external}
          onClose={() => {
            setShowIssueCertificateModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            fetchEnrolledUsers();
            setShowIssueCertificateModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}