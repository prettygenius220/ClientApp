import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Video, Clock, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import type { Course } from '../../types/course';

export default function FeaturedCourseAd() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nextCourse, setNextCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const fetchNextCourse = async () => {
      try {
        // Get current date and time for filtering
        const now = new Date();

        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('published', true)
          .eq('is_virtual', true)
          .gt('start_time', now.toISOString())
          .order('start_time', { ascending: true })
          .limit(1)
          .single();

        if (error) {
          if (error.code !== 'PGRST116') { // Not found error
            console.error('Error fetching next course:', error);
          }
          return;
        }

        const course = {
          ...data,
          isVirtual: data.is_virtual,
          meetLink: data.meet_link,
          startTime: data.start_time,
          endTime: data.end_time
        };

        setNextCourse(course);

        if (user && course) {
          const { data: enrollments } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_id', course.id);

          setIsEnrolled(enrollments && enrollments.length > 0);
        }
      } catch (error) {
        console.error('Error fetching next course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNextCourse();
  }, [user]);

  useEffect(() => {
    if (!nextCourse?.startTime) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(nextCourse.startTime!).getTime();
      const difference = start - now;

      if (difference <= 0) {
        setTimeLeft(null);
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [nextCourse]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!nextCourse || !timeLeft) return null;

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

  const handleEnroll = async () => {
    if (!user) {
      toast.error('Please sign in to enroll in courses');
      navigate('/login');
      return;
    }

    if (!nextCourse) return;

    try {
      const { error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: nextCourse.id,
          completed_lessons: [],
          last_accessed: new Date().toISOString()
        });

      if (error) throw error;
      
      setIsEnrolled(true);
      toast.success('Successfully enrolled in course!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error('Failed to enroll in course');
    }
  };

  const handleAddToCalendar = () => {
    if (!nextCourse?.startTime || !nextCourse?.endTime || !nextCourse?.meetLink) {
      toast.error('Course details are incomplete');
      return;
    }

    const startTime = new Date(nextCourse.startTime).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const endTime = new Date(nextCourse.endTime).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    
    const url = [
      'https://calendar.google.com/calendar/render',
      '?action=TEMPLATE',
      `&text=${encodeURIComponent(nextCourse.title)}`,
      `&details=${encodeURIComponent(`Join via Google Meet: ${nextCourse.meetLink}\n\n${nextCourse.description}`)}`,
      `&dates=${startTime}/${endTime}`
    ].join('');

    window.open(url, '_blank');
  };

  return (
    <section className="bg-gradient-to-r from-teal-50 to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden relative z-10"
        >
          <div className="p-8 flex flex-col md:flex-row gap-8">
            {/* Course Image */}
            <div className="w-full md:w-1/3">
              <img
                src={nextCourse.image}
                alt={nextCourse.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>

            {/* Course Details */}
            <div className="w-full md:w-2/3 space-y-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <Video className="h-5 w-5" />
                <span className="text-sm font-medium">Next Virtual Session</span>
              </div>

              <h3 className="text-2xl font-bold text-gray-900">
                {nextCourse.title}
              </h3>

              <p className="text-gray-600">{nextCourse.description}</p>

              {/* Course Info */}
              {isEnrolled ? (
                <div className="w-full mt-4 py-2 text-center bg-green-100 text-green-800 rounded-lg border border-green-500 font-medium">
                  Enrolled
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  className="w-full mt-4 py-4 text-lg font-medium bg-gradient-to-r from-teal-600 to-purple-600 text-white rounded-lg hover:from-teal-700 hover:to-purple-700 transition-all shadow-md"
                >
                  Enroll Now
                </button>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
                <div>
                  <p className="text-sm text-gray-500">Instructor</p>
                  <p className="font-medium">{nextCourse.instructor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">{nextCourse.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Level</p>
                  <p className="font-medium">{nextCourse.level}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium">${nextCourse.price}</p>
                </div>
              </div>

              {/* Session Time */}
              <div className="bg-indigo-50 p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  <h4 className="font-semibold text-indigo-900">Session Time</h4>
                </div>
                <p className="text-indigo-700">
                  {formatDateTime(nextCourse.startTime)}
                </p>
                <div className="mt-2">
                  {nextCourse.meetLink && (
                    <a
                      href={nextCourse.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Join Google Meet
                    </a>
                  )}
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="bg-indigo-50 p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-indigo-600" />
                  <h4 className="font-semibold text-indigo-900">Starting In</h4>
                </div>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <span className="text-3xl font-bold text-indigo-600">{timeLeft.days}</span>
                    <p className="text-sm text-indigo-900">Days</p>
                  </div>
                  <div>
                    <span className="text-3xl font-bold text-indigo-600">{timeLeft.hours}</span>
                    <p className="text-sm text-indigo-900">Hours</p>
                  </div>
                  <div>
                    <span className="text-3xl font-bold text-indigo-600">{timeLeft.minutes}</span>
                    <p className="text-sm text-indigo-900">Minutes</p>
                  </div>
                  <div>
                    <span className="text-3xl font-bold text-indigo-600">{timeLeft.seconds}</span>
                    <p className="text-sm text-indigo-900">Seconds</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 relative z-20">
                {isEnrolled ? (
                  <>
                    <button
                      onClick={handleAddToCalendar}
                      className="flex-1 inline-flex justify-center items-center gap-2 px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      <Calendar className="h-5 w-5" />
                      Add to Calendar
                    </button>
                    {nextCourse.meetLink && (
                      <a
                        href={nextCourse.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex justify-center items-center px-6 py-3 bg-gradient-to-r from-teal-600 to-purple-600 text-white rounded-lg hover:from-teal-700 hover:to-purple-700 transition-all"
                      >
                        Join Session
                      </a>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleAddToCalendar}
                      className="flex-1 inline-flex justify-center items-center gap-2 px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      <Calendar className="h-5 w-5" />
                      Add to Calendar
                    </button>
                    <button
                      onClick={handleEnroll}
                      className="flex-1 inline-flex justify-center items-center px-6 py-3 bg-gradient-to-r from-teal-600 to-purple-600 text-white rounded-lg hover:from-teal-700 hover:to-purple-700 transition-all"
                    >
                      Enroll Now
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}