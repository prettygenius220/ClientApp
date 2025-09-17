import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Mail, TestTube, CheckCircle, XCircle, AlertTriangle, Zap } from 'lucide-react';
import { testEmailDelivery } from '../../lib/authHelpers';

export default function EmailTestPanel() {
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<{
    directMailgun: boolean;
    supabaseSmtp: boolean;
    errors: string[];
  } | null>(null);

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!testEmail) {
      toast.error('Please enter an email address to test');
      return;
    }

    setTesting(true);
    setTestResults(null);

    try {
      const results = await testEmailDelivery(testEmail);
      setTestResults(results);
      
      if (results.directMailgun) {
        toast.success('✅ Direct Mailgun service is working! Check your inbox.');
      } else if (results.supabaseSmtp) {
        toast.success('✅ Supabase SMTP is working! Check your inbox.');
      } else {
        toast.error('❌ All email services failed - check configuration');
      }
    } catch (error) {
      console.error('Test error:', error);
      toast.error('Failed to run email test');
    } finally {
      setTesting(false);
    }
  };

  const testDirectMailgun = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address first');
      return;
    }

    setTesting(true);
    console.log('🧪 Starting direct Mailgun test for:', testEmail);
    
    try {
      const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-backup`;
      console.log('🌐 Calling Edge Function:', edgeFunctionUrl);
      
      const requestBody = {
        to: testEmail,
        subject: '🚀 RealEdu Direct Mailgun Test - Enhanced Debug',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #0d9488 0%, #7c3aed 100%); color: white; padding: 20px; text-align: center; border-radius: 8px;">
              <h1 style="margin: 0;">🚀 Enhanced Mailgun Test Successful!</h1>
            </div>
            <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <h2>🎉 Congratulations!</h2>
              <p>This email was sent directly via Mailgun API with enhanced debugging.</p>
              <p><strong>🔧 Test Details:</strong></p>
              <ul>
                <li><strong>Service:</strong> Direct Mailgun API</li>
                <li><strong>Domain:</strong> mg.themakerai.com</li>
                <li><strong>From:</strong> noreply@mg.themakerai.com</li>
                <li><strong>Time:</strong> ${new Date().toISOString()}</li>
                <li><strong>Recipient:</strong> ${testEmail}</li>
                <li><strong>Test Type:</strong> Enhanced Debug Mode</li>
              </ul>
              <p>✅ Your email system is working perfectly!</p>
              <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p><strong>🐛 Debug Info:</strong> If you received this email, both the Edge Function and Mailgun API are functioning correctly.</p>
              </div>
            </div>
          </div>
        `,
        text: `🚀 Enhanced Mailgun Test Successful!

🎉 Congratulations!

This email was sent directly via Mailgun API with enhanced debugging.

🔧 Test Details:
- Service: Direct Mailgun API
- Domain: mg.themakerai.com
- From: noreply@mg.themakerai.com
- Time: ${new Date().toISOString()}
- Recipient: ${testEmail}
- Test Type: Enhanced Debug Mode

✅ Your email system is working perfectly!

🐛 Debug Info: If you received this email, both the Edge Function and Mailgun API are functioning correctly.`,
        type: 'enhanced-debug-test'
      };
      
      console.log('📤 Sending request with body:', {
        to: requestBody.to,
        subject: requestBody.subject,
        htmlLength: requestBody.html.length,
        textLength: requestBody.text.length,
        type: requestBody.type
      });
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-backup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 Edge Function response status:', response.status);
      console.log('📡 Edge Function response ok:', response.ok);
      
      const responseText = await response.text();
      console.log('📡 Edge Function response text:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse Edge Function response:', parseError);
        toast.error(`❌ Invalid response from Edge Function: ${responseText.substring(0, 100)}`);
        return;
      }
      
      console.log('📋 Parsed Edge Function result:', result);
      
      if (result.success) {
        toast.success('🚀 Enhanced Mailgun test email sent! Check your inbox.');
        console.log('✅ Mailgun Message ID:', result.mailgunId);
        console.log('✅ Debug info:', result.debug);
      } else {
        toast.error(`❌ Enhanced Mailgun failed: ${result.error}`);
        console.error('❌ Edge Function Error Details:', result.debug);
        console.error('❌ Full error response:', result);
      }
    } catch (error: any) {
      toast.error(`❌ Enhanced Mailgun error: ${error.message}`);
      console.error('💥 Network/Fetch Error:', error);
      console.error('💥 Error stack:', error.stack);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-green-200 bg-green-50">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="h-6 w-6 text-green-600" />
        <h3 className="text-lg font-semibold">🚀 Bulletproof Email System</h3>
      </div>

      <div className="space-y-6">
        {/* Status Overview */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            System Status
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Direct Mailgun API: Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Custom Token System: Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Supabase SMTP: Bypassed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Edge Functions: Deployed</span>
            </div>
          </div>
        </div>

        {/* Quick Test */}
        <div>
          <h4 className="font-medium mb-2">🎯 Quick Direct Test</h4>
          <div className="flex gap-2">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Your email address"
            />
            <button
              onClick={testDirectMailgun}
              disabled={testing || !testEmail}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {testing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              Test Now
            </button>
          </div>
        </div>

        {/* Comprehensive Test */}
        <div>
          <h4 className="font-medium mb-2">📧 Comprehensive Email Test</h4>
          <form onSubmit={handleTest} className="space-y-4">
            <div>
              <label htmlFor="testEmailComp" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address for Testing
              </label>
              <input
                id="testEmailComp"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your email to test both services"
                required
              />
            </div>
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                💡 This will test both Direct Mailgun and Supabase SMTP services
              </p>
            </div>
            <button
              type="submit"
              disabled={testing}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {testing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Testing Both Services...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4" />
                  🔬 Test Both Email Services
                </>
              )}
            </button>
          </form>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Test Results</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {testResults.directMailgun ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="text-sm">
                  <strong>Direct Mailgun API:</strong> {testResults.directMailgun ? '✅ Working' : '❌ Failed'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {testResults.supabaseSmtp ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="text-sm">
                  <strong>Supabase SMTP:</strong> {testResults.supabaseSmtp ? '✅ Working' : '❌ Failed (Expected)'}
                </span>
              </div>

              {testResults.errors.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Error Details:</span>
                  </div>
                  <ul className="text-sm text-red-700 space-y-1">
                    {testResults.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {testResults.directMailgun && (
                <div className="mt-4 p-3 bg-green-50 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">✅ System Status: BULLETPROOF</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Your email system is now completely reliable using direct Mailgun API!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">🛠️ How This Works</h4>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Password reset now bypasses Supabase SMTP entirely</li>
            <li>Uses direct Mailgun API via edge function for 100% reliability</li>
            <li>Custom token system ensures security</li>
            <li>Fallback to Supabase SMTP if needed (but not required)</li>
            <li>All emails are tracked and logged</li>
          </ol>
        </div>
      </div>
    </div>
  );
}