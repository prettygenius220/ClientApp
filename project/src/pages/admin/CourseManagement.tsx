import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { PlusCircle, Edit, Trash2, Users, Video } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Course } from '../../types/course';
import CreateCourseModal from '../../components/admin/CreateCourseModal';
import EditCourseModal from '../../components/admin/EditCourseModal';
import EnrolledUsersList from '../../components/admin/EnrolledUsersList';

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our Course type
      const transformedCourses = data?.map(course => ({
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

  const togglePublished = async (courseId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ published: !currentStatus })
        .eq('id', courseId);

      if (error) throw error;

      setCourses(courses.map(course =>
        course.id === courseId
          ? { ...course, published: !currentStatus }
          : course
      ));

      toast.success(`Course ${currentStatus ? 'unpublished' : 'published'} successfully`);
    } catch (error) {
      console.error('Error toggling course status:', error);
      toast.error('Failed to update course status');
    }
  };

  const deleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      // First delete any certificate templates for this course
      const { error: templateError } = await supabase
        .from('certificate_templates')
        .delete()
        .eq('course_id', courseId);

      if (templateError) throw templateError;

      // Then delete the course
      const { error: courseError } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (courseError) throw courseError;

      setCourses(courses.filter(course => course.id !== courseId));
      toast.success('Course deleted successfully');
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
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
      {selectedCourse ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">{selectedCourse.title}</h2>
              <p className="text-sm text-gray-500">Course #{selectedCourse.course_number}</p>
            </div>
            <button
              onClick={() => setSelectedCourse(null)}
              className="text-gray-600 hover:text-gray-900"
            >
              Back to Courses
            </button>
          </div>
          <EnrolledUsersList course={selectedCourse} />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Course Management</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              <PlusCircle className="h-5 w-5" />
              Add Course
            </button>
          </div>

          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                      Course Number
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[300px]">
                      Course
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                      Instructor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                      Session Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courses.map((course) => (
                    <tr key={course.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                        {course.course_number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={course.image}
                              alt=""
                            />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {course.title}
                              </span>
                              {course.isVirtual && (
                                <Video className="h-4 w-4 text-indigo-600" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {course.level} • {course.duration}
                            </div>
                            {course.isVirtual && course.meetLink && (
                              <a
                                href={course.meetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-indigo-600 hover:text-indigo-500"
                              >
                                Join Google Meet
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {course.instructor}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {course.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {course.startTime ? (
                          formatDateTime(course.startTime)
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => togglePublished(course.id, course.published || false)}
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            course.published
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {course.published ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedCourse(course)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View participants"
                          >
                            <Users className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setEditingCourse(course)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit course"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => deleteCourse(course.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete course"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {showCreateModal && (
        <CreateCourseModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchCourses}
        />
      )}

      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSuccess={fetchCourses}
        />
      )}
    </div>
  );
}