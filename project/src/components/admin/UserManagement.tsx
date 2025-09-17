import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { UserCog, Shield, User, Key, Edit, Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { USER_ROLES } from '../../lib/constants';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';
import Button from '../ui/button';
import UserPasswordReset from './UserPasswordReset';
import EditUserModal from './EditUserModal';

interface Profile {
  id: string;
  email: string;
  role: string;
  created_at: string;
  first_name?: string | null;
  last_name?: string | null;
}

export default function UserManagement() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [resettingUser, setResettingUser] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [userCertificates, setUserCertificates] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('todo_profiles')
        .select('id, email, role, created_at, first_name, last_name')
        .order('role', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
    
    // Fetch certificate counts for each user
    try {
      const { data: certCounts, error: certError } = await supabase
        .from('course_certificates')
        .select('user_id, count(*)')
        .group('user_id');

      if (certError) throw certError;
      
      const countMap: Record<string, number> = {};
      certCounts?.forEach(item => {
        countMap[item.user_id] = parseInt(item.count);
      });
      
      setUserCertificates(countMap);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === USER_ROLES.ADMIN ? USER_ROLES.USER : USER_ROLES.ADMIN;

    try {
      const { error } = await supabase
        .from('todo_profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
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
      <div className="flex items-center gap-2">
        <UserCog className="h-6 w-6 text-indigo-600" />
        <h2 className="text-xl font-semibold">User Management</h2>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Certificates</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {user.role === USER_ROLES.ADMIN ? (
                    <Shield className="h-4 w-4 text-indigo-600" />
                  ) : (
                    <User className="h-4 w-4 text-gray-400" />
                  )}
                  <span>{user.email}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.role === USER_ROLES.ADMIN 
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.role}
                </span>
              </TableCell>
              <TableCell>
                {new Date(user.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {userCertificates[user.id] ? (
                  <span className="inline-flex items-center gap-1">
                    <Award className="h-4 w-4 text-primary-600" />
                    {userCertificates[user.id]}
                  </span>
                ) : (
                  <span className="text-gray-400">None</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toggleUserRole(user.id, user.role)}
                    className="mr-1"
                  >
                    {user.role === USER_ROLES.ADMIN ? 'Remove Admin' : 'Make Admin'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setResettingUser(user.email)}
                    className="mr-1"
                  >
                    <Key className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditingUser(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {resettingUser && (
        <UserPasswordReset
          userEmail={resettingUser}
          onClose={() => setResettingUser(null)}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  );
}