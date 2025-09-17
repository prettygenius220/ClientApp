import React from 'react';
import { User, UserCog, Users, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Profile = Database['public']['Tables']['todo_profiles']['Row'];

export default function UserList() {
  const [users, setUsers] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user } = useAuth();

  React.useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;

      try {
        // First verify admin status
        const { data: profile, error: profileError } = await supabase
          .from('todo_profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError || profile.role !== 'admin') {
          console.error('Not authorized to view user list');
          setLoading(false);
          return;
        }

        // Fetch all users if admin
        const { data, error } = await supabase
          .from('todo_profiles')
          .select('*')
          .order('role', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching users:', error);
          return;
        }

        setUsers(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todo_profiles'
        },
        () => {
          // Refresh the user list when changes occur
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Group users by role
  const admins = users.filter(user => user.role === 'admin');
  const regularUsers = users.filter(user => user.role === 'user');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <UserCog className="h-6 w-6 text-indigo-600" />
        <h2 className="text-xl font-semibold">Admin Dashboard</h2>
      </div>
      
      {/* Admins Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-medium">Administrators</h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {admins.length}
          </span>
        </div>
        <div className="space-y-3">
          {admins.map((profile) => (
            <div
              key={profile.id}
              className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="font-medium">{profile.email}</p>
                  <p className="text-sm text-indigo-600">Administrator</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                Joined {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Regular Users Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium">Users</h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {regularUsers.length}
          </span>
        </div>
        <div className="space-y-3">
          {regularUsers.map((profile) => (
            <div
              key={profile.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">{profile.email}</p>
                  <p className="text-sm text-gray-500">Regular User</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                Joined {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}