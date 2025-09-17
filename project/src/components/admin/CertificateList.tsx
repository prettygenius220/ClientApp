import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Award, Download, Search, Filter, RefreshCw, Calendar, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../lib/utils';
import { generateCertificatePdf } from '../../lib/generateCertificatePdf';

interface Certificate {
  id: string;
  certificate_number: string;
  course_title: string;
  participant_name: string;
  issued_date: string;
  ce_hours: number;
  pdf_url?: string;
  course_id: string;
  email_sent?: boolean;
  email_sent_at?: string;
  instructor: string;
  school_name: string;
  reissue_count?: number;
  last_reissued_at?: string;
  course_number?: string;
  course_date?: string;
  user_id?: string;
  external_user_id?: string;
  external_email?: string;
}

interface GroupedCertificates {
  [courseId: string]: {
    courseTitle: string;
    certificates: Certificate[];
  };
}

export default function CertificateList() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch certificates with course info
        const { data: certificatesData, error: certificatesError } = await supabase
          .from('course_certificates')
          .select(`*`)
          .order('issued_date', { ascending: false });

        if (certificatesError) throw certificatesError;

        // Fetch unique courses
        const uniqueCourses = Array.from(
          new Set(certificatesData?.map(cert => ({
            id: cert.course_id,
            title: cert.course_title
          })) || [])
        );

        setCertificates(certificatesData || []);
        setCourses(uniqueCourses);
      } catch (error) {
        console.error('Error fetching certificates:', error);
        toast.error('Failed to load certificates');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownloadPdf = (cert: Certificate) => {
    try {
      // Generate PDF data URL
      const pdfDataUrl = generateCertificatePdf({
        certificateNumber: cert.certificate_number || 'N/A',
        schoolName: cert.school_name || 'RealEdu',
        instructor: cert.instructor || '',
        courseTitle: cert.course_title || '',
        courseNumber: cert.course_number || '',
        courseDate: cert.course_date ? new Date(cert.course_date).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }) : cert.issued_date ? new Date(cert.issued_date).toLocaleDateString('en-US', {
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
      link.download = `${cert.certificate_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate certificate PDF');
    }
  };

  const reissueCertificate = async (certificateId: string) => {
    try {
      // Call the reissue_certificate function
      const { error } = await supabase.rpc('reissue_certificate', {
        certificate_id: certificateId
      });
      
      if (error) throw error;
      
      // Refresh the certificate list
      const { data: updatedCert, error: fetchError } = await supabase
        .from('course_certificates')
        .select(`
          id,
          certificate_number,
          course_id,
          course_title,
          participant_name,
          issued_date,
          ce_hours,
          reissue_count,
          last_reissued_at,
          instructor,
          school_name,
          course_number,
          course_date,
          user_id,
          external_user_id,
          external_email
        `)
        .eq('id', certificateId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Update the certificate in the local state
      setCertificates(prev => 
        prev.map(cert => 
          cert.id === certificateId 
            ? { ...cert, issued_date: updatedCert.issued_date, reissue_count: updatedCert.reissue_count, last_reissued_at: updatedCert.last_reissued_at } 
            : cert
        )
      );
      
      // Generate and download the updated certificate
      handleDownloadPdf({
        ...updatedCert,
      });

      toast.success('Certificate reissued successfully');
    }
    catch (error) {
      console.error('Error reissuing certificate:', error);
      toast.error(`Failed to reissue certificate: ${error.message}`);
    }
  };

  const sendCertificateEmail = async (certificateId: string) => {
    try {
      setSendingEmail(certificateId);
      const loadingToast = toast.loading('Sending certificate email...');
      
      // Call the send-certificate edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-certificate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ certificateId })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('Edge function response:', data);
      
      if (data === null || data === undefined) {
        toast.dismiss(loadingToast);
        toast.error('No response from edge function');
        return;
      }

      if (!data.success) {
        console.error('Edge Function returned error in data:', data);
        toast.dismiss(loadingToast);
        toast.error(data.error || 'Failed to send certificate email');
        return;
      }
      
      // Update the certificate in the local state
      setCertificates(prev => 
        prev.map(cert => 
          cert.id === certificateId 
            ? { ...cert, email_sent: true, email_sent_at: new Date().toISOString() } 
            : cert
        )
      );
      
      toast.dismiss(loadingToast);
      toast.success('Certificate email sent successfully');
    } catch (error) {
      console.error('Error sending certificate email:', error);
      toast.dismiss();
      
      // Show a more detailed error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to send certificate email';
        
      toast.error(errorMessage);
    } finally {
      setSendingEmail(null);
    }
  };

  // Group certificates by course
  const groupedCertificates: GroupedCertificates = certificates
    .filter(cert => {
      const matchesSearch = 
        cert.certificate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.course_title.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCourse = selectedCourse === 'all' || cert.course_id === selectedCourse;
      
      return matchesSearch && matchesCourse;
    })
    .reduce((groups, cert) => {
      const courseId = cert.course_id;
      if (!groups[courseId]) {
        groups[courseId] = {
          courseTitle: cert.course_title,
          certificates: []
        };
      }
      groups[courseId].certificates.push(cert);
      return groups;
    }, {} as GroupedCertificates);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with search and filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Award className="h-6 w-6 text-indigo-600" />
          Certificates
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search certificates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Certificates grouped by course */}
      <div className="space-y-8">
        {Object.entries(groupedCertificates).map(([courseId, group]) => (
          <div key={courseId} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {group.courseTitle}
              </h3>
              <p className="text-sm text-gray-500">
                {group.certificates.length} certificates issued
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Certificate Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CE Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issued Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {group.certificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Award className="h-5 w-5 text-indigo-600 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {cert.certificate_number || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="font-medium">{cert.participant_name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cert.ce_hours}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(cert.issued_date)}
                          {cert.reissue_count > 0 && (
                            <div className="text-xs text-indigo-600 flex items-center mt-1">
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Reissued {cert.reissue_count} {cert.reissue_count === 1 ? 'time' : 'times'}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => sendCertificateEmail(cert.id)}
                          disabled={sendingEmail === cert.id}
                          className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2 ${
                            sendingEmail === cert.id ? 'opacity-75 cursor-not-allowed' : ''
                          }`}
                          title={cert.email_sent ? "Resend certificate email" : "Send certificate email"}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          {sendingEmail === cert.id ? 'Sending...' : cert.email_sent ? "Resend" : "Email"}
                        </button>
                        
                        <button
                          onClick={() => reissueCertificate(cert.id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Reissue
                        </button>

                        <button
                          onClick={() => handleDownloadPdf(cert)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {Object.keys(groupedCertificates).length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No certificates found
            </h3>
            <p className="mt-2 text-gray-500">
              {searchTerm || selectedCourse !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No certificates have been issued yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}