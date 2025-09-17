import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { USER_ROLES } from '../lib/constants';
import UserManagement from '../components/admin/UserManagement';
import LeadManagement from '../components/admin/LeadManagement';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;

      try {
        const { data: profile, error } = await supabase
          .from('todo_profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (profile.role !== USER_ROLES.ADMIN) {
          toast.error('Access denied');
          navigate('/');
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        toast.error('An error occurred');
        navigate('/');
      }
    };

    checkAdminStatus();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Manage users, leads, and system settings
        </p>
      </div>

      <div className="space-y-8">
        {/* Lead Management Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <LeadManagement />
        </div>

        {/* User Management Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <UserManagement />
        </div>
      </div>
    </div>
  );
}