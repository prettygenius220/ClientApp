import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { validateMagicLinkToken } from '../lib/authHelpers';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function MagicLogin() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    const handleMagicLink = async () => {
      try {
        console.log('Processing custom magic link authentication...');
        setDebugInfo('Processing magic link...');

        if (!token || !email) {
          console.log('Missing token or email in URL');
          setDebugInfo('Missing token or email in URL');
          throw new Error('Invalid magic link. Missing token or email.');
        }

        console.log('Validating magic link token...');
        setDebugInfo(prev => prev + '\nValidating token...');

        const result = await validateMagicLinkToken(token, email);

        if (!result.success) {
          console.error('Magic link validation failed:', result.error);
          setDebugInfo(prev => prev + `\nValidation failed: ${result.error}`);
          throw new Error(result.error || 'Magic link validation failed');
        }

        // Get user profile for role-based redirect
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('Failed to get user session after magic link');
        }

        const { data: profile, error: profileError } = await supabase
          .from('todo_profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          setDebugInfo(prev => prev + `\nProfile error: ${profileError.message}`);
          throw new Error('Failed to fetch user profile');
        }

        console.log('Magic link authentication successful');
        setDebugInfo(prev => prev + '\nAuthentication successful');
        
        toast.success('Successfully signed in!');
        
        // Redirect based on role
        if (profile.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
        
      } catch (error: any) {
        console.error('Error handling magic link:', error);
        setError(error.message || 'An error occurred during authentication');
        setDebugInfo(prev => prev + `\nFinal error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    // Process magic link with a small delay
    const timer = setTimeout(handleMagicLink, 1000);
    return () => clearTimeout(timer);
  }, [navigate, token, email]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            Processing magic link...
          </p>
          <p className="text-sm text-gray-500">
            Please wait while we authenticate you
          </p>
          
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

  if (error) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="mb-4">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Authentication Failed</h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          
          {/* Debug info for development */}
          {import.meta.env.DEV && debugInfo && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-left text-xs text-gray-600">
              <strong>Debug Info:</strong>
              <pre className="whitespace-pre-wrap">{debugInfo}</pre>
            </div>
          )}
          
          <div className="space-y-2">
            <Link
              to="/forgot-password"
              className="block w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700"
            >
              Request New Magic Link
            </Link>
            <Link
              to="/login"
              className="block w-full text-gray-600 hover:text-gray-500 text-sm"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // This should not be reached if everything works correctly
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="mb-4">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
        </div>
        <p className="text-gray-600">
          Authentication successful! Redirecting...
        </p>
      </div>
    </div>
  );
}