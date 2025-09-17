import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Key, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { isValidEmail } from '../../lib/utils';

interface UserPasswordResetProps {
  userEmail: string;
  onClose: () => void;
}

export default function UserPasswordReset({ userEmail, onClose }: UserPasswordResetProps) {
  const [method, setMethod] = useState<'password' | 'magic'>('password');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!isValidEmail(userEmail)) {
      toast.error('Invalid email address');
      return;
    }

    setLoading(true);

    try {
      if (method === 'password') {
        const { error } = await supabase.auth.resetPasswordForEmail(
          userEmail,
          {
            redirectTo: `${window.location.origin}/reset-password`,
          }
        );

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email: userEmail,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          }
        });

        if (error) {
          throw error;
        }
      }

      toast.success(`${method === 'password' ? 'Password reset' : 'Magic link'} email sent successfully`);
      onClose();
    } catch (error: any) {
      console.error('Reset error:', error);
      
      if (error.message?.includes('rate limit')) {
        toast.error('Too many attempts. Please try again later.');
      } else if (error.message?.includes('not found')) {
        toast.error('User not found.');
      } else {
        toast.error('Unable to send email at this time. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      role="dialog"
      aria-labelledby="reset-user-title"
      aria-describedby="reset-user-description"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 
          id="reset-user-title"
          className="text-lg font-semibold mb-4"
        >
          Reset User Access
        </h3>
        <p 
          id="reset-user-description"
          className="text-gray-600 mb-6"
        >
          Send a {method === 'password' ? 'password reset link' : 'magic link'} to:
          <br />
          <span className="font-medium">{userEmail}</span>
        </p>

        <div className="mb-6">
          <div className="flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setMethod('password')}
              className={`flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-l-md ${
                method === 'password'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:text-indigo-600 border border-gray-300'
              }`}
            >
              <Key className="w-4 h-4 mr-2" />
              Reset Password
            </button>
            <button
              type="button"
              onClick={() => setMethod('magic')}
              className={`flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-r-md ${
                method === 'magic'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:text-indigo-600 border border-gray-300'
              }`}
            >
              <Mail className="w-4 h-4 mr-2" />
              Magic Link
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={handleReset}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}