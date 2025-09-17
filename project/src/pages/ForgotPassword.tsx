import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Key, AlertCircle, CheckCircle } from 'lucide-react';
import { resetPassword, sendMagicLink } from '../lib/authHelpers';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [method, setMethod] = useState<'password' | 'magic'>('password');
  const [debugInfo, setDebugInfo] = useState<string>('');

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

    setLoading(true);
    setDebugInfo('🔐 Starting forgot password process...');

    try {
      console.log(`🚀 Starting ${method} request for:`, email);
      setDebugInfo(`🚀 Starting ${method} request for: ${email}`);

      let result;
      if (method === 'password') {
        console.log('🔑 Calling resetPassword function...');
        setDebugInfo(prev => prev + '\n🔑 Calling resetPassword function...');
        result = await resetPassword(email);
      } else {
        console.log('✨ Calling sendMagicLink function...');
        setDebugInfo(prev => prev + '\n✨ Calling sendMagicLink function...');
        result = await sendMagicLink(email);
      }

      console.log('📋 Auth function result:', result);
      setDebugInfo(prev => prev + `\n📋 Result: ${result.success ? '✅ Success' : '❌ Failed'}`);
      if (result.debugInfo) {
        setDebugInfo(prev => prev + `\n🔍 Details: ${result.debugInfo}`);
      }

      if (!result.success) {
        console.error(`❌ ${method} request failed:`, result.error);
        setDebugInfo(prev => prev + `\n❌ Error: ${result.error}`);
        
        // Handle specific error cases
        if (result.error?.includes('rate limit') || result.error?.includes('too many')) {
          toast.error('Too many attempts. Please wait 60 seconds before trying again.');
          return;
        }
        
        if (result.error?.includes('network') || result.error?.includes('fetch')) {
          toast.error('Network error. Please check your connection and try again.');
          return;
        }
        
        // Generic error
        toast.error(`Unable to send email: ${result.error}`);
        return;
      }

      console.log(`🎉 ${method} request successful`);
      setDebugInfo(prev => prev + `\n🎉 ${method} request completed successfully!`);
      toast.success('If an account exists with this email, you will receive instructions shortly.');
      setSent(true);
      
    } catch (error: any) {
      console.error('💥 Unexpected error:', error);
      setDebugInfo(prev => prev + `\n💥 Unexpected error: ${error.message}\n📚 Stack: ${error.stack?.split('\n')[0]}`);
      toast.error(`Unexpected error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="mb-4">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
          <p className="text-gray-600 mb-4">
            If an account exists with <strong>{email}</strong>, you will receive instructions shortly.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Please check your inbox and spam folder. The email should arrive within 2-3 minutes.
          </p>
          
          {/* Debug info for development */}
          {import.meta.env.DEV && debugInfo && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-left text-xs text-gray-600">
              <strong>Debug Info:</strong>
              <pre className="whitespace-pre-wrap">{debugInfo}</pre>
            </div>
          )}
          
          <div className="space-y-2">
            <button
              onClick={() => {
                setSent(false);
                setEmail('');
                setDebugInfo('');
              }}
              className="w-full text-indigo-600 hover:text-indigo-500 text-sm"
            >
              Try a different email
            </button>
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

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Reset Your Password
        </h2>

        <div className="mb-6">
          <div className="flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setMethod('password')}
              className={`flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-l-md border ${
                method === 'password'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 hover:text-indigo-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Key className="w-4 h-4 mr-2" />
              Reset Password
            </button>
            <button
              type="button"
              onClick={() => setMethod('magic')}
              className={`flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                method === 'magic'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 hover:text-indigo-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Mail className="w-4 h-4 mr-2" />
              Magic Link
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {method === 'password' 
              ? 'Send a link to reset your password'
              : 'Send a link to sign in without a password'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
              autoComplete="email"
              placeholder="Enter your email address"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full flex items-center justify-center bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              `Send ${method === 'password' ? 'Reset Instructions' : 'Magic Link'}`
            )}
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
          Remember your password?{' '}
          <Link 
            to="/login"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Sign in
          </Link>
        </p>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center text-xs text-gray-500">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>For assistance, contact support at info@realedu.co</span>
          </div>
        </div>
      </div>
    </div>
  );
}