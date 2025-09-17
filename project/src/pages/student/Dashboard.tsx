import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Calendar, Video, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import UserCertificates from '../../components/certificates/UserCertificates';
import type { Course } from '../../types/course';

interface EnrolledCourse extends Course {
  completed_lessons: string[];
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch enrolled courses with course details
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select(`
            completed_lessons,
            courses (
              id,
              course_number,
              title,
              description,
              image,
              instructor,
              duration,
              level,
              category,
              is_virtual,
              meet_link,
              start_time,
              end_time
            )
          `)
          .eq('user_id', user.id);

        if (enrollmentsError) throw enrollmentsError;

        // Map the enrollments data to include both course info and completed lessons
        const validCourses = enrollments
          ?.filter(enrollment => enrollment.courses)
          .map(enrollment => ({
            ...enrollment.courses,
            completed_lessons: enrollment.completed_lessons || [],
            isVirtual: enrollment.courses.is_virtual,
            meetLink: enrollment.courses.meet_link,
            startTime: enrollment.courses.start_time,
            endTime: enrollment.courses.end_time
          })) || [];

        setEnrolledCourses(validCourses);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const addToCalendar = (course: EnrolledCourse) => {
    if (!course.startTime || !course.endTime || !course.meetLink) return;

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(course.title)}&details=${encodeURIComponent(`Join via Google Meet: ${course.meetLink}\n\n${course.description || ''}`)}&dates=${encodeURIComponent(new Date(course.startTime).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''))}/${encodeURIComponent(new Date(course.endTime).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''))}`;
    window.open(googleCalendarUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-sm p-6 mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.email}!
        </h1>
        <p className="mt-2 text-gray-600">
          View your upcoming virtual sessions and certificates
        </p>
      </motion.div>

      {/* Enrolled Courses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-12"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          My Virtual Sessions
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrolledCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              {course.image && (
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="h-5 w-5 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-600">
                    Virtual Session
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {course.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {course.description}
                </p>
                {course.isVirtual && (
                  <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                    <p className="text-sm font-medium text-indigo-900">
                      Session Details
                    </p>
                    {course.startTime && (
                      <p className="mt-1 text-sm text-indigo-700">
                        {new Date(course.startTime).toLocaleString()}
                      </p>
                    )}
                    {course.meetLink && (
                      <div className="mt-2 flex items-center gap-2">
                        <a
                          href={course.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
                        >
                          Join Google Meet
                          <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                        <button
                          onClick={() => addToCalendar(course)}
                          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          Add to Calendar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {enrolledCourses.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900">
                No courses enrolled yet
              </h3>
              <p className="mt-2 text-gray-600">
                Browse our courses and start learning today!
              </p>
              <a
                href="/courses"
                className="mt-4 inline-block bg-primary-600 text-white py-2 px-4 rounded hover:bg-primary-700 transition-colors"
              >
                Browse Courses
              </a>
            </div>
          )}
        </div>
      </motion.div>

      {/* Certificates Section */}
      <UserCertificates />
    </div>
  );
}