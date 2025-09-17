import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface CreateCourseModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCourseModal({ onClose, onSuccess }: CreateCourseModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    course_number: '',
    title: '',
    description: '',
    image: '',
    price: '',
    instructor: '',
    duration: '',
    level: 'Beginner',
    category: '',
    is_virtual: false,
    meet_link: '',
    start_time: '',
    end_time: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate virtual course fields
      if (formData.is_virtual) {
        if (!formData.meet_link) {
          throw new Error('Google Meet link is required for virtual courses');
        }
        if (!formData.start_time) {
          throw new Error('Start time is required for virtual courses');
        }
        if (!formData.end_time) {
          throw new Error('End time is required for virtual courses');
        }
      }

      // Format dates to ISO strings
      const startTime = formData.start_time ? new Date(formData.start_time).toISOString() : null;
      const endTime = formData.end_time ? new Date(formData.end_time).toISOString() : null;

      const { error } = await supabase
        .from('courses')
        .insert({
          course_number: formData.course_number,
          title: formData.title,
          description: formData.description,
          image: formData.image,
          price: parseFloat(formData.price),
          instructor: formData.instructor,
          duration: formData.duration,
          level: formData.level,
          category: formData.category,
          published: false,
          is_virtual: formData.is_virtual,
          meet_link: formData.is_virtual ? formData.meet_link : null,
          start_time: startTime,
          end_time: endTime
        });

      if (error) throw error;

      toast.success('Course created successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating course:', error);
      toast.error(error.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-md my-8">
        <h2 className="text-xl font-semibold mb-4">Add New Course</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="course_number" className="block text-sm font-medium text-gray-700 mb-1">
              Course Number
            </label>
            <input
              id="course_number"
              name="course_number"
              type="text"
              value={formData.course_number}
              onChange={handleChange}
              placeholder="Enter course number"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase"
            />
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Course Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              id="image"
              name="image"
              type="url"
              value={formData.image}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price ($)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="instructor" className="block text-sm font-medium text-gray-700 mb-1">
              Instructor
            </label>
            <input
              id="instructor"
              name="instructor"
              type="text"
              value={formData.instructor}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration
            </label>
            <input
              id="duration"
              name="duration"
              type="text"
              placeholder="e.g., 1 hour"
              value={formData.duration}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
              Level
            </label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select a level...</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              id="category"
              name="category"
              type="text"
              placeholder="e.g., Residential, Commercial"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="is_virtual"
                checked={formData.is_virtual}
                onChange={(e) => setFormData(prev => ({ ...prev, is_virtual: e.target.checked }))}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">Virtual Course (Google Meet)</span>
            </label>
          </div>

          {formData.is_virtual && (
            <>
              <div>
                <label htmlFor="meet_link" className="block text-sm font-medium text-gray-700 mb-1">
                  Google Meet Link *
                </label>
                <input
                  id="meet_link"
                  name="meet_link"
                  type="url"
                  required
                  value={formData.meet_link}
                  onChange={handleChange}
                  placeholder="https://meet.google.com/..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time (Central Time) *
                </label>
                <input
                  id="start_time"
                  name="start_time"
                  type="datetime-local"
                  required
                  value={formData.start_time}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time (Central Time) *
                </label>
                <input
                  id="end_time"
                  name="end_time"
                  type="datetime-local"
                  required
                  value={formData.end_time}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2 pt-4">
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
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}