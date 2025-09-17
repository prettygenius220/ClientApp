import { useState, useEffect } from 'react';
import { Clock, Video, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Course } from '../../types/course';

interface CourseCardProps {
  course: Course;
  hidePrice?: boolean;
  hideStats?: boolean;
}

export default function CourseCard({ course, hidePrice = false, hideStats = false }: CourseCardProps) {
  const { user } = useAuth();
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isUpcoming, setIsUpcoming] = useState(false);
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is enrolled in this course
    const checkEnrollment = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', course.id);

        if (error) {
          console.error('Error checking enrollment:', error);
          return;
        }

        // User is enrolled if we found any matching rows
        setIsEnrolled(data && data.length > 0);
      } catch (error) {
        console.error('Error checking enrollment:', error);
      }
    };

    checkEnrollment();
    
    // Check if course is upcoming
    if (course.startTime) {
      const now = new Date();
      const courseDate = new Date(course.startTime);
      
      // Format the date for display
      setFormattedDate(formatDateTime(course.startTime));
      
      // Check if course is upcoming
      setIsUpcoming(courseDate > now);
    }
  }, [user, course.id]);

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZone: 'America/Chicago'
    }).format(new Date(dateString));
  };

  const handleEnroll = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    if (!user) {
      toast.error('Please sign in to enroll in courses');
      return;
    }

    if (isEnrolled) {
      toast.error('You are already enrolled in this course');
      return;
    }

    setEnrolling(true);
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
      
      // If it's a virtual course, create calendar event
      if (course.isVirtual && course.meetLink && course.startTime && course.endTime) {
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(course.title)}&details=${encodeURIComponent(`Join via Google Meet: ${course.meetLink}\n\n${course.description}`)}&dates=${encodeURIComponent(new Date(course.startTime).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''))}/${encodeURIComponent(new Date(course.endTime).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''))}`;
        window.open(googleCalendarUrl, '_blank');
      }

      setIsEnrolled(true);
      toast.success('Successfully enrolled in course!');
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error('Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="flex-shrink-0">
        <img
          className="h-48 w-full object-cover"
          src={course.image}
          alt={course.title}
        />
      </div>
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div className="flex-1">
          {course.course_number && (
            <p className="text-sm text-gray-500 mb-1">
              Course #{course.course_number}
            </p>
          )}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-primary-600">
              {course.category}
            </p>
            {course.isVirtual && (
              <span className="flex items-center text-sm text-indigo-600">
                <Video className="h-4 w-4 mr-1" />
                Virtual
              </span>
            )}
          </div>
          <div className="block mt-2">
            <h3 className="text-xl font-semibold text-gray-900">
              {course.title}
            </h3>
            <p className="mt-3 text-base text-gray-500">
              {course.description}
            </p>
            {formattedDate && (
              <div className="mt-3 flex items-center text-sm text-indigo-600 font-medium">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formattedDate}</span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="sr-only">{course.instructor}</span>
              <img
                className="h-10 w-10 rounded-full"
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor)}&background=0EA5E9&color=fff`}
                alt={course.instructor}
              />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {course.instructor}
              </p>
              <div className="flex space-x-1 text-sm text-gray-500">
                <span>{course.level}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                {course.duration}
              </div>
              {course.isVirtual && course.meetLink && isUpcoming && (
                <a
                  href={course.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-indigo-600 hover:text-indigo-500"
                >
                  <Video className="h-4 w-4 mr-1" />
                  Join Meet
                </a>
              )}
            </div>
            {!hidePrice && course.price && (
              <p className="text-xl font-bold text-primary-600">
                ${course.price.toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={handleEnroll}
            disabled={enrolling || isEnrolled}
            className={`mt-4 w-full py-2 px-4 rounded-md transition-colors ${
              isEnrolled
                ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            } disabled:opacity-50`}
          >
            {isEnrolled ? 'Enrolled' : enrolling ? 'Enrolling...' : 'Enroll Now'}
          </button>
        </div>
      </div>
    </div>
  );
}