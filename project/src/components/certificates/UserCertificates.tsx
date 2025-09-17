import { useState, useEffect } from 'react';
import { Award, Download, Calendar, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { generateCertificatePdf } from '../../lib/generateCertificatePdf';

interface Certificate {
  id: string;
  certificate_number: string;
  course_title: string;
  participant_name: string;
  issued_date: string;
  ce_hours: number;
  instructor: string;
  school_name: string;
  pdf_url?: string;
  course_number?: string;
  course_date?: string;
}

export default function UserCertificates() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchCertificates = async () => {
      try {
        // First try to get certificates where user_id matches
        const { data, error } = await supabase
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
          .eq('user_id', user.id)
          .order('issued_date', { ascending: false });

        if (error) throw error;
        
        // Then try to get certificates where external_email matches user's email
        const { data: externalCerts, error: externalError } = await supabase
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
          .eq('external_email', user.email)
          .order('issued_date', { ascending: false });

        if (externalError) throw externalError;
        
        // Combine both sets of certificates
        const allCertificates = [...(data || []), ...(externalCerts || [])];
        
        setCertificates(allCertificates);
      } catch (error) {
        console.error('Error fetching certificates:', error);
        toast.error('Failed to load certificates');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [user]);

  const handleDownloadPdf = (cert: Certificate) => {
    try {
      // Generate PDF data URL
      const pdfDataUrl = generateCertificatePdf({
        certificateNumber: cert.certificate_number || '',
        schoolName: cert.school_name || 'RealEdu',
        instructor: cert.instructor || '',
        courseTitle: cert.course_title || '',
        courseNumber: cert.course_number || '',
        courseDate: cert.course_date ? new Date(cert.course_date).toLocaleDateString() : new Date().toLocaleDateString(),
        participantName: cert.participant_name || '',
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">
          No certificates yet
        </h3>
        <p className="mt-2 text-gray-600">
          Complete courses to earn certificates and CE hours
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Award className="h-6 w-6 text-primary-600" />
        <h3 className="text-xl font-semibold">My Certificates</h3>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="bg-gradient-to-br from-teal-50 to-purple-50 rounded-lg p-6 border border-primary-600/10 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white p-2 rounded-full">
                <Award className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 line-clamp-2">
                  {cert.course_title}
                </h4>
                <p className="text-sm text-gray-500">
                  Certificate #{cert.certificate_number}
                </p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>CE Hours: {cert.ce_hours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Issued: {new Date(cert.issued_date).toLocaleDateString()}</span>
              </div>
            </div>
            
            <button
              onClick={() => handleDownloadPdf(cert)}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download Certificate
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}