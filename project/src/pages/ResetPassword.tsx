import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { validateResetTokenAndUpdatePassword } from '../lib/authHelpers';
import { CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [tokenChecking, setTokenChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [debugInfo, setDebugInfo] = useState('');
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Password strength checker
  useEffect(() => {
    if (password.length === 0) {
      setPasswordStrength('weak');
      return;
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) setPasswordStrength('weak');
    else if (score <= 3) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  }, [password]);

  useEffect(() => {
    const validateToken = async () => {
      try {
        console.log('Validating reset token...');
        setDebugInfo('Validating reset token...');
        
        if (!token || !email) {
          console.log('Missing token or email in URL');
          setDebugInfo('Missing token or email in URL');
          toast.error('Invalid reset link. Please request a new password reset.');
          navigate('/forgot-password');
          return;
        }

        // Check if token exists and is valid
        const { data: tokenData, error: tokenError } = await supabase
          .from('password_reset_tokens')
          .select('*')
          .eq('token', token)
          .eq('used', false)
          .single();

        if (tokenError || !tokenData) {
          console.log('Token not found or already used');
          setDebugInfo('Token not found or already used');
          toast.error('Invalid or expired reset link. Please request a new password reset.');
          navigate('/forgot-password');
          return;
        }

        // Check if token has expired
        if (new Date(tokenData.expires_at) < new Date()) {
          console.log('Token has expired');
          setDebugInfo('Token has expired');
          toast.error('Reset link has expired. Please request a new password reset.');
          navigate('/forgot-password');
          return;
        }

        // Verify the email matches
        const { data: profile, error: profileError } = await supabase
          .from('todo_profiles')
          .select('id, email')
          .eq('id', tokenData.user_id)
          .single();

        if (profileError || !profile || profile.email !== email.toLowerCase().trim()) {
          console.log('Email mismatch or profile not found');
          setDebugInfo('Email mismatch or profile not found');
          toast.error('Invalid reset request. Please request a new password reset.');
          navigate('/forgot-password');
          return;
        }

        console.log('Token validation successful');
        setDebugInfo('Token validation successful');
        setValidToken(true);
        
      } catch (error: any) {
        console.error('Error validating token:', error);
        setDebugInfo(`Error validating token: ${error.message}`);
        toast.error('Invalid reset link. Please request a new password reset.');
        navigate('/forgot-password');
      } finally {
        setTokenChecking(false);
      }
    };

    validateToken();
  }, [token, email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordStrength === 'weak') {
      toast.error('Please choose a stronger password');
      return;
    }

    if (!token || !email) {
      toast.error('Invalid reset request');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting to update password with custom token...');
      setDebugInfo('Updating password...');
      
      const result = await validateResetTokenAndUpdatePassword(token, email, password);

      if (!result.success) {
        console.error('Password update failed:', result.error);
        setDebugInfo(`Password update failed: ${result.error}`);
        toast.error(result.error || 'Failed to update password');
        return;
      }

      console.log('Password updated successfully');
      setDebugInfo('Password updated successfully');
      toast.success('Password updated successfully! You can now sign in with your new password.');
      
      // Redirect to login
      navigate('/login');
      
    } catch (error: any) {
      console.error('Error updating password:', error);
      setDebugInfo(`Error updating password: ${error.message}`);
      toast.error('Failed to update password. Please try requesting a new reset link.');
    } finally {
      setLoading(false);
    }
  };

  if (tokenChecking) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Validating reset link...</p>
          
          {/* Debug info for development */}
          {import.meta.env.DEV && debugInfo && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-left text-xs text-gray-600">
              <strong>Debug Info:</strong>
              <pre className="whitespace-pre-wrap">{debugInfo}</pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="mb-4">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          
          {/* Debug info for development */}
          {import.meta.env.DEV && debugInfo && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-left text-xs text-gray-600">
              <strong>Debug Info:</strong>
              <pre className="whitespace-pre-wrap">{debugInfo}</pre>
            </div>
          )}
          
          <Link
            to="/forgot-password"
            className="inline-flex items-center justify-center w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
    }
  };

  const getPasswordStrengthWidth = () => {
    switch (passwordStrength) {
      case 'weak': return 'w-1/3';
      case 'medium': return 'w-2/3';
      case 'strong': return 'w-full';
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Create New Password</h2>
          <p className="text-gray-600 mt-2">
            Enter a strong password for your account
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-10"
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Enter new password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            
            {/* Password strength indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Password strength:</span>
                  <span className={`font-medium ${
                    passwordStrength === 'weak' ? 'text-red-600' :
                    passwordStrength === 'medium' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                  </span>
                </div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()} ${getPasswordStrengthWidth()}`} />
                </div>
              </div>
            )}
          </div>

          <div>
            <label 
              htmlFor="confirmPassword" 
              className="block text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </label>
            <div className="mt-1 relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-10 ${
                  confirmPassword && password !== confirmPassword 
                    ? 'border-red-300' 
                    : 'border-gray-300'
                }`}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Password Requirements:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li className={password.length >= 6 ? 'text-green-700' : ''}>
                • At least 6 characters
              </li>
              <li className={/[A-Z]/.test(password) ? 'text-green-700' : ''}>
                • At least one uppercase letter (recommended)
              </li>
              <li className={/[0-9]/.test(password) ? 'text-green-700' : ''}>
                • At least one number (recommended)
              </li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading || password !== confirmPassword || passwordStrength === 'weak'}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>

        {/* Debug info for development */}
        {import.meta.env.DEV && debugInfo && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-left text-xs text-gray-600">
            <strong>Debug Info:</strong>
            <pre className="whitespace-pre-wrap">{debugInfo}</pre>
          </div>
        )}

        <p className="mt-4 text-center text-sm text-gray-600">
          <Link 
            to="/login"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}