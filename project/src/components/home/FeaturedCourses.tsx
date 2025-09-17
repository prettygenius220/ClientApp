import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import CourseCard from '../courses/CourseCard';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Course } from '../../types/course';
import { Video, Calendar, ExternalLink } from 'lucide-react';

export default function FeaturedCourses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const handleEnroll = async (course: Course) => {
    if (!user) {
      toast.error('Please sign in to enroll in courses');
      navigate('/login');
      return;
    }

    try {
      // Create enrollment
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: course.id,
          completed_lessons: [],
          last_accessed: new Date().toISOString()
        });

      if (enrollError) throw enrollError;
      
      // Update local state
      setCourses(prevCourses => 
        prevCourses.map(c => 
          c.id === course.id ? {...c, isEnrolled: true} : c
        )
      );
      
      toast.success('Successfully enrolled in course!');
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error('Failed to enroll in course');
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Check if Supabase client is properly initialized
        if (!supabase) {
          throw new Error('Supabase client is not initialized');
        }
        
        // Get current date to filter out past courses
        const now = new Date(); // Current date and time
        
        // Fetch upcoming courses
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('published', true)
          .gt('start_time', now.toISOString()) // Only show courses in the future
          .order('start_time', { ascending: true }) 
          .limit(6);

        if (error) throw error;
        
        // If user is logged in, check enrollments
        let enrollments: Record<string, boolean> = {};
        if (supabase.auth.getUser) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: userEnrollments } = await supabase
              .from('enrollments')
              .select('course_id')
              .eq('user_id', user.id);
              
            if (userEnrollments) {
              enrollments = userEnrollments.reduce((acc, enrollment) => {
                acc[enrollment.course_id] = true;
                return acc;
              }, {} as Record<string, boolean>);
            }
          }
        }
        
        // Transform the data to match our Course type
        const transformedCourses = data?.map(course => ({
          ...course,
          isVirtual: course.is_virtual,
          meetLink: course.meet_link,
          startTime: course.start_time,
          endTime: course.end_time,
          isEnrolled: enrollments[course.id] || false
        })) || [];
        
        setCourses(transformedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to load courses. Please try again later.');
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Retry
        </button>
      </div>
    );
  }
  
  // If no upcoming courses, show a message
  if (courses.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              2025 Education Calendar
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              No future courses currently scheduled. Check back soon for new offerings!
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            2025 Education Calendar
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Join our virtual sessions with industry experts
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3 relative z-10"
        >
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {course.description}
                </p>
                
                {/* Enrollment status or button */}
                {course.isEnrolled ? (
                  <div className="mb-3">
                    <div className="px-3 py-1 bg-green-100 text-green-800 rounded-md border border-green-500 text-sm font-medium inline-block">
                      Enrolled
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEnroll(course);
                    }}
                    className="w-full mb-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
                  >
                    Enroll Now
                  </button>
                )}
                
                {course.startTime && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>
                      {new Date(course.startTime).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {course.meetLink && (
                    <a
                      href={course.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 bg-indigo-50 hover:bg-indigo-200 text-indigo-700 rounded-md text-sm transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Google Meet
                    </a>
                  )}
                  <a
                    href={`/courses`}
                    className="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 transition-colors"
                  >
                    View Details
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <a
            href="/courses"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
          >
            View All Courses
          </a>
        </motion.div>
      </div>
    </section>
  );
}