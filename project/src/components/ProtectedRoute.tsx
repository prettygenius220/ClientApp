import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('todo_profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setIsAdmin(profile.role === 'admin');
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Show loading spinner while checking auth and admin status
  if (authLoading || loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        role="status"
        aria-label="Checking authentication"
      >
        <div 
          className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"
          aria-hidden="true"
        />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // For admin routes, check if user is admin
  if (window.location.pathname.startsWith('/admin') && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // For student dashboard, redirect admins to admin dashboard
  if (window.location.pathname === '/dashboard' && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Render protected content if all checks pass
  return <>{children}</>;
}