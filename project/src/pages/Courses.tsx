import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CourseGrid from '../components/courses/CourseGrid';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import type { Course } from '../types/course';

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        
        // Get current date to filter out past courses
        const now = new Date();
        
        // Fetch published courses
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .eq('published', true)
          .gte('start_time', now.toISOString()) // Only show courses happening today or in the future
          .order('start_time', { ascending: true });

        if (coursesError) throw coursesError;

        // If user is logged in, fetch their enrollments
        if (user) {
          const { data: enrollmentsData, error: enrollmentsError } = await supabase
            .from('enrollments')
            .select('course_id')
            .eq('user_id', user.id);

          if (enrollmentsError) throw enrollmentsError;

          setEnrolledCourseIds(new Set(enrollmentsData?.map(e => e.course_id)));
        }

        // Transform the data to match our Course type
        const transformedCourses = coursesData?.map(course => ({
          ...course,
          isVirtual: course.is_virtual,
          meetLink: course.meet_link,
          startTime: course.start_time,
          endTime: course.end_time
        })) || [];
        
        setCourses(transformedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600" />
      </div>
    );
  }
  
  if (courses.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Browse Our Courses
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Learn from industry experts and start your real estate investing journey today
          </p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-12 rounded-lg shadow-sm text-center"
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-4">No upcoming courses available</h2>
          <p className="text-gray-600">
            We don't have any courses scheduled for future dates. Please check back later for new course offerings.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Browse Our Courses
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          Learn from industry experts and start your real estate investing journey today
        </p>
      </motion.div>
      <CourseGrid courses={courses} />
    </div>
  );
}