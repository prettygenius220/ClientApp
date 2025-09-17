import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Register() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);

  const navigate = useNavigate();
  const { signUp } = useAuth();

  // Check for external enrollment token
  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');

      if (!token || !email) {
        setVerifying(false);
        return;
      }

      try {
        // Verify token and get enrollment details
        const { data: enrollment, error } = await supabase
          .from('external_enrollments')
          .select('*')
          .eq('verification_token', token)
          .eq('email', email)
          .single();

        if (error) throw error;

        if (!enrollment) {
          toast.error('Invalid or expired enrollment link');
          return;
        }

        if (new Date(enrollment.token_expires_at) < new Date()) {
          toast.error('Enrollment link has expired');
          return;
        }

        // Pre-fill form with enrollment data
        setEmail(enrollment.email);
        setFirstName(enrollment.first_name || '');
        setLastName(enrollment.last_name || '');
      } catch (error) {
        console.error('Error verifying token:', error);
        toast.error('Invalid enrollment link');
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [searchParams]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      // First sign up the user
      await signUp(email, password);

      // Get the new user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id) {
        throw new Error('Failed to get user ID');
      }

      // Check for external enrollment
      const token = searchParams.get('token');
      if (token) {
        const { data: enrollment } = await supabase
          .from('external_enrollments')
          .select('*')
          .eq('verification_token', token)
          .eq('email', email)
          .single();

        if (enrollment) {
          // Update external enrollment
          await supabase
            .from('external_enrollments')
            .update({ account_created: true })
            .eq('id', enrollment.id);
        }
      }

      // Update the profile with first and last name
      const { error: updateError } = await supabase
        .from('todo_profiles')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim()
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      toast.success('Account created successfully!');
      // New users are always redirected to student dashboard
      navigate('/dashboard');
    } catch (error: any) {
      if (error.message?.includes('email_address_invalid')) {
        toast.error('Please enter a valid email address');
      } else if (error.message?.includes('already registered')) {
        toast.error('This email is already registered');
      } else {
        toast.error('Failed to create account. Please try again.');
      }
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 
          className="text-2xl font-bold text-center mb-6"
          id="register-title"
        >
          Create an Account
        </h2>
        <form 
          onSubmit={handleSubmit} 
          className="space-y-4"
          aria-labelledby="register-title"
        >
          <div>
            <label 
              htmlFor="firstName" 
              className="block text-sm font-medium text-gray-700"
            >
              First Name *
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
              aria-required="true"
              minLength={2}
              placeholder="Enter your first name"
            />
          </div>

          <div>
            <label 
              htmlFor="lastName" 
              className="block text-sm font-medium text-gray-700"
            >
              Last Name *
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
              aria-required="true"
              minLength={2}
              placeholder="Enter your last name"
            />
          </div>

          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700"
            >
              Email *
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!searchParams.get('token')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
              aria-required="true"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700"
            >
              Password *
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              minLength={6}
              required
              aria-required="true"
              autoComplete="new-password"
              placeholder="At least 6 characters"
            />
            <p className="mt-1 text-sm text-gray-500">
              Must be at least 6 characters long
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="text-indigo-600 hover:text-indigo-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}