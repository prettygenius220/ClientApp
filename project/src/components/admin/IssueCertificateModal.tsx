import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { generateCertificatePdf } from '../../lib/generateCertificatePdf';
import type { Course } from '../../types/course';

enum RecipientType {
  REGISTERED_USER = 'registered',
  EXTERNAL_ENROLLMENT = 'external_enrollment',
  DIRECT_CERTIFICATE = 'direct_certificate'
}

interface IssueCertificateModalProps {
  course: Course;
  userId?: string;
  userEmail?: string;
  userName?: string;
  isExternal?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function IssueCertificateModal({
  course,
  userId,
  userEmail,
  userName,
  isExternal = false,
  onClose,
  onSuccess
}: IssueCertificateModalProps) {
  const [ceHours, setCeHours] = useState('1');
  const [loading, setLoading] = useState(false);
  const [recipientType, setRecipientType] = useState<RecipientType>(
    userId ? (isExternal ? RecipientType.EXTERNAL_ENROLLMENT : RecipientType.REGISTERED_USER) : RecipientType.DIRECT_CERTIFICATE
  );
  const [directEmail, setDirectEmail] = useState('');
  const [directFirstName, setDirectFirstName] = useState('');
  const [directLastName, setDirectLastName] = useState('');

  const generateCertificateNumber = () => {
    // Format the course prefix properly
    const coursePrefix = course?.course_number?.split('-')[0] || '000';
    // Use formatted date for better readability in certificate number
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${coursePrefix}-${timestamp}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ceHours || parseFloat(ceHours) <= 0) {
      toast.error('Please enter valid CE hours');
      return;
    }

    setLoading(true);
    try {
      const certificateNumber = generateCertificateNumber();

      // Handle different recipient types
      if (recipientType === RecipientType.DIRECT_CERTIFICATE) {
        // Validate direct certificate inputs
        if (!directEmail.trim()) {
          toast.error('Email is required');
          setLoading(false);
          return;
        }
        
        // First and last name are recommended but not required
        if (!directFirstName.trim() && !directLastName.trim()) {
          toast.error('First and last name are required');
          setLoading(false);
          return;
        }
        
        // Issue certificate directly using RPC function
        console.log('Issuing external certificate with params:', {
          p_course_id: course.id,
          p_email: directEmail.trim(),
          p_first_name: directFirstName.trim(),
          p_last_name: directLastName.trim(),
          p_ce_hours: parseFloat(ceHours)
        });
        
        const { data, error } = await supabase.rpc('issue_external_certificate', {
          p_course_id: course.id,
          p_email: directEmail.trim(),
          p_first_name: directFirstName.trim(),
          p_last_name: directLastName.trim(),
          p_ce_hours: parseFloat(ceHours)
        });
        
        if (error) throw error;
        
        // Get the newly created certificate
        const { data: newCert, error: fetchError } = await supabase
          .from('course_certificates')
          .select('*')
          .eq('id', data)
          .single();
          
        if (fetchError) throw fetchError;
        
        // Ensure participant name is properly formatted
        const participantName = directFirstName && directLastName ? 
          `${directFirstName} ${directLastName}`.trim() : 
          directFirstName || directLastName || directEmail;
          
        // Generate PDF
        const pdfDataUrl = generateCertificatePdf({
          certificateNumber: newCert.certificate_number,
          schoolName: 'RealEdu',
          instructor: course.instructor,
          courseTitle: course.title,
          courseNumber: course.course_number || '',
          courseDate: new Date().toLocaleDateString(),
          participantName,
          ceHours: parseFloat(ceHours),
          issuedDate: newCert.issued_date
        });
        
        // Download the certificate
        const link = document.createElement('a');
        link.href = pdfDataUrl;
        link.download = `${newCert.certificate_number}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Original flow for registered users and external enrollments
        const issuedDate = new Date().toISOString();

        // Check if certificate already exists for this user and course
        console.log('Checking for existing certificate:', {
          course_id: course.id,
          user_id_or_external: isExternal ? 'external_user_id' : 'user_id',
          userId
        });
        
        const { data: existingCert, error: checkError } = await supabase
          .from('course_certificates')
          .select('*')
          .eq('course_id', course.id)
          .eq(isExternal ? 'external_user_id' : 'user_id', userId)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking existing certificate:', checkError);
          throw new Error('Error checking existing certificate');
        }

        if (existingCert) {
          // If certificate exists, update it instead of creating a new one
          console.log('Reissuing existing certificate:', existingCert.id);
          const { error: updateError } = await supabase.rpc('reissue_certificate', {
            certificate_id: existingCert.id
          });
          
          if (updateError) throw updateError;
          
          // Get the updated certificate
          const { data: updatedCert, error: fetchError } = await supabase
            .from('course_certificates')
            .select(`
              id, 
              certificate_number, 
              school_name, 
              instructor, 
              course_title, 
              participant_name, 
              ce_hours, 
              issued_date, 
              course_number, 
              course_date
            `)
            .eq('id', existingCert.id)
            .single();
            
          if (fetchError) throw fetchError;
          
          // Generate PDF with updated information
          const pdfDataUrl = generateCertificatePdf({
            certificateNumber: updatedCert.certificate_number,
            schoolName: updatedCert.school_name || 'RealEdu',
            instructor: updatedCert.instructor || course.instructor,
            courseTitle: updatedCert.course_title || course.title,
            courseNumber: course.course_number || '',
            courseDate: course.startTime ? new Date(course.startTime).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            }) : new Date().toLocaleDateString(),
            participantName: updatedCert.participant_name || '',
            ceHours: updatedCert.ce_hours || parseFloat(ceHours),
            issuedDate: updatedCert.issued_date
          });
          
          // Download the updated certificate
          const link = document.createElement('a');
          link.href = pdfDataUrl;
          link.download = `${updatedCert.certificate_number}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          toast.success('Certificate reissued successfully');
          onSuccess();
          onClose();
          return;
        }
        
        // Get user's name if not provided or use email as fallback
        let participantName = userName;
        if (!participantName && userId) {
          if (!isExternal) {
            const { data: profile, error: profileError } = await supabase
              .from('todo_profiles')
              .select('first_name, last_name, full_name')
              .eq('id', userId)
              .single();

            if (profileError) {
              console.error('Error fetching profile:', profileError);
              participantName = userEmail || 'Certificate Recipient';
            } else {
            // Ensure we have a proper name format
              if (profile.full_name && profile.full_name.trim() !== '') {
                participantName = profile.full_name;
              } else if (profile.first_name || profile.last_name) { 
                participantName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || userEmail;
              } else {
                participantName = userEmail || 'Certificate Recipient';
              }
            }
          } else {
            const { data: externalUser, error: externalError } = await supabase
              .from('external_enrollments')
              .select('first_name, last_name')
              .eq('id', userId)
              .single();

            if (externalError) {
              console.error('Error fetching external user:', externalError);
              participantName = userEmail || 'Certificate Recipient';
            } else {
              // Ensure we have a proper name format
              if (externalUser.first_name || externalUser.last_name) {
                participantName = `${externalUser.first_name || ''} ${externalUser.last_name || ''}`.trim() || userEmail;
              } else {
                participantName = userEmail || 'Certificate Recipient';
              }
            }
          }
        }

        // Get course details
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('course_number, start_time')
          .eq('id', course.id)
          .single();

        if (courseError) throw courseError;

        const courseDate = courseData.start_time 
          ? new Date(courseData.start_time).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            }) 
          : new Date().toLocaleDateString();

        // Generate PDF data URL
        const pdfDataUrl = generateCertificatePdf({
          certificateNumber,
          schoolName: 'RealEdu',
          instructor: course.instructor,
          courseTitle: course.title,
          courseNumber: courseData.course_number || '',
          courseDate,
          participantName: participantName || 'Certificate Recipient',
          ceHours: parseFloat(ceHours),
          issuedDate
        });

        // Create certificate record
        console.log('Creating new certificate:', {
          type: isExternal ? 'external_user_id' : 'user_id',
          userId,
          course_id: course.id,
          certificate_number: certificateNumber
        });
        
        const { data: certificate, error: certError } = await supabase
          .from('course_certificates')
          .insert({
            [isExternal ? 'external_user_id' : 'user_id']: userId,
            course_id: course.id,
            certificate_number: certificateNumber,
            school_name: 'RealEdu',
            instructor: course.instructor,
            course_title: course.title,
            participant_name: participantName,
            ce_hours: parseFloat(ceHours),
            issued_date: issuedDate, 
            pdf_status: 'completed',
            course_number: courseData.course_number,
            course_date: courseData.start_time
          })
          .select()
          .single();

        if (certError) throw certError;

        // Open PDF in new tab
        const link = document.createElement('a');
        link.href = pdfDataUrl;
        link.download = `${certificateNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      toast.success('Certificate issued successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error issuing certificate:', error.message || error);
      toast.error('Failed to issue certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md z-50">
        <h3 className="text-lg font-semibold mb-4">Issue Certificate</h3>
        
        {/* Recipient Type Selector */}
        {!userId && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certificate Recipient
            </label>
            <div className="flex flex-col space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-indigo-600"
                  name="recipientType"
                  value={RecipientType.DIRECT_CERTIFICATE}
                  checked={recipientType === RecipientType.DIRECT_CERTIFICATE}
                  onChange={() => setRecipientType(RecipientType.DIRECT_CERTIFICATE)}
                />
                <span className="ml-2">Issue directly to recipient</span>
              </label>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Direct Certificate Fields */}
          {recipientType === RecipientType.DIRECT_CERTIFICATE && (
            <>
              <div>
                <label 
                  htmlFor="directEmail" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Recipient Email *
                </label>
                <input
                  id="directEmail"
                  type="email"
                  value={directEmail}
                  onChange={(e) => setDirectEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label 
                  htmlFor="directFirstName" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  First Name *
                </label>
                <input
                  id="directFirstName"
                  type="text"
                  value={directFirstName}
                  onChange={(e) => setDirectFirstName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label 
                  htmlFor="directLastName" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last Name *
                </label>
                <input
                  id="directLastName"
                  type="text"
                  value={directLastName}
                  onChange={(e) => setDirectLastName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            </>
          )}
          
          {/* Existing User Certificate Info */}
          {recipientType !== RecipientType.DIRECT_CERTIFICATE && (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Certificate will be issued to:
              </p>
              <p className="font-medium">
                {userName || userEmail}
              </p>
            </div>
          )}
          
          <div>
            <label 
              htmlFor="ceHours" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              CE Hours
            </label>
            <input
              id="ceHours"
              type="number"
              min="0.5"
              step="0.5"
              value={ceHours}
              onChange={(e) => setCeHours(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
            >
              {loading ? 'Issuing...' : 'Issue Certificate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}