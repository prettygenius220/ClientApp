import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CertificateGeneratorProps {
  courseId: string;
  courseName: string;
  instructor: string;
  ceHours: number;
  selectedUsers: { id: string; email: string }[];
  onSuccess: () => void;
}

export default function CertificateGenerator({
  courseId,
  courseName,
  instructor,
  ceHours,
  selectedUsers,
  onSuccess
}: CertificateGeneratorProps) {
  const [generating, setGenerating] = useState(false);

  const generateCertificateNumber = () => {
    // Get course details to ensure correct course number format
    const coursePrefix = course?.course_number?.split('-')[0] || '000';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${coursePrefix}-${timestamp}-${random}`;
  };

  const generateCertificates = async () => {
    setGenerating(true);
    try {
      // Check for existing certificates before generating new ones
      const existingCertificatesQuery = await Promise.all([
        // Check for registered users
        supabase
          .from('course_certificates')
          .select('user_id')
          .eq('course_id', courseId)
          .in('user_id', selectedUsers.filter(u => !u.is_external).map(u => u.id)),
        // Check for external users
        supabase
          .from('course_certificates')
          .select('external_user_id')
          .eq('course_id', courseId)
          .in('external_user_id', selectedUsers.filter(u => u.is_external).map(u => u.id))
      ]);
      
      // Collect all user IDs that already have certificates
      const existingUserIds = new Set();
      
      if (existingCertificatesQuery[0].data) {
        existingCertificatesQuery[0].data.forEach(cert => {
          if (cert.user_id) existingUserIds.add(cert.user_id);
        });
      }
      
      if (existingCertificatesQuery[1].data) {
        existingCertificatesQuery[1].data.forEach(cert => {
          if (cert.external_user_id) existingUserIds.add(cert.external_user_id);
        });
      }
      
      // Filter out users who already have certificates
      const usersToProcess = selectedUsers.filter(user => !existingUserIds.has(user.id));
      
      if (usersToProcess.length === 0) {
        toast.warning('All selected users already have certificates for this course');
        setGenerating(false);
        return;
      }
      
      const schoolName = 'RealEdu';
      
      // Get course details including course number and start time
      const { data: courseDetails, error: courseError } = await supabase
        .from('courses')
        .select('course_number, start_time')
        .eq('id', courseId)
        .single();
        
      if (courseError) throw courseError;

      // Get user profiles to get full names
      let userNames = new Map();
      
      // Process registered users - get their full names from profiles
      const registeredUserIds = usersToProcess
        .filter(u => !u.is_external)
        .map(u => u.id);
        
      if (registeredUserIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('todo_profiles')
          .select('id, email, first_name, last_name, full_name')
          .in('id', registeredUserIds);

        if (profilesError) throw profilesError;
        
        profiles?.forEach(p => {
          // Ensure we have a proper name format
          let name = p.full_name;
          if (!name || name.trim() === '') {
            if (p.first_name || p.last_name) {
              name = `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email;
            } else {
              name = p.email;
            }
          }
          userNames.set(p.id, name);
        });
      }
      
      // Process external users - get their names from enrollments
      const externalUserIds = usersToProcess
        .filter(u => u.is_external)
        .map(u => u.id);
        
      if (externalUserIds.length > 0) {
        const { data: externalUsers, error: externalError } = await supabase
          .from('external_enrollments')
          .select('id, email, first_name, last_name')
          .in('id', externalUserIds);
          
        if (externalError) throw externalError;
        
        externalUsers?.forEach(u => {
          // Ensure we have a proper name format
          let name = '';
          if (u.first_name || u.last_name) {
            name = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email;
          } else {
            name = u.email;
          }
          userNames.set(u.id, name);
        });
      }

      // Create certificates for each user
      const certificates = usersToProcess.map(user => {
        const isExternal = !!user.is_external;

        // Get the user's name, prioritizing the name from the database
        let userName = userNames.get(user.id);
        
        // If no name from database, try to use the name from the user object
        if (!userName || userName.trim() === '') {
          if (user.first_name || user.last_name) {
            userName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
          } else if (user.name && user.name.trim() !== '') {
            userName = user.name;
          } else {
            userName = user.email;
          }
        }

        return {
          [isExternal ? 'external_user_id' : 'user_id']: user.id,
          course_id: courseId,
          certificate_number: generateCertificateNumber(),
          school_name: schoolName,
          instructor,
          course_title: courseName,
          participant_name: userName,
          ce_hours: ceHours,
          issued_date: new Date().toISOString(), 
          course_number: courseDetails.course_number,
          course_date: courseDetails.start_time
        };
      });

      const { data, error } = await supabase
        .from('course_certificates')
        .insert(certificates)
        .select();

      if (error) throw error;

      toast.success('Certificates generated successfully');
      if (usersToProcess.length < selectedUsers.length) {
        toast.info(`${selectedUsers.length - usersToProcess.length} users already had certificates`);
      }
      onSuccess();
    } catch (error) {
      console.error('Error generating certificates:', error);
      toast.error('Failed to generate certificates');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Award className="h-6 w-6 text-indigo-600" />
        <h3 className="text-lg font-semibold">Generate Certificates</h3>
      </div>

      <div className="mb-6">
        <h4 className="font-medium mb-2">Course Details</h4>
        <div className="text-sm text-gray-600">
          <p>Course: {courseName}</p>
          <p>Instructor: {instructor}</p>
          <p>CE Hours: {ceHours}</p>
          <p>Selected Users: {selectedUsers.length}</p>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={generateCertificates}
          disabled={generating || selectedUsers.length === 0}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {generating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              Generating...
            </>
          ) : (
            <>
              <Award className="h-5 w-5" />
              Generate Certificates
            </>
          )}
        </button>

        {selectedUsers.length === 0 ? (
          <p className="text-sm text-red-600">
            Please select at least one user to generate certificates
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            Note: Only users without existing certificates will receive new certificates
          </p>
        )}
      </div>
    </div>
  );
}