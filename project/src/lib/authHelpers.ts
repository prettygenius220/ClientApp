/**
 * Authentication Helper Functions
 * 
 * Bulletproof email system that bypasses Supabase SMTP issues
 * and uses direct Mailgun API for reliable email delivery.
 */

import { supabase } from './supabase';
import { toast } from 'react-hot-toast';

interface AuthResult {
  success: boolean;
  error?: string;
  debugInfo?: string;
}

/**
 * Bulletproof password reset that bypasses Supabase SMTP entirely
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  try {
    console.log('🔐 Starting bulletproof password reset for:', email);
    
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Email validation failed:', email);
      return {
        success: false,
        error: 'Invalid email format',
        debugInfo: 'Email validation failed'
      };
    }

    // Check if user exists in our system first
    console.log('🔍 Checking if user exists in todo_profiles...');
    const { data: profile, error: profileError } = await supabase
      .from('todo_profiles')
      .select('id, email')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (profileError || !profile) {
      console.log('❌ User not found in todo_profiles:', email, profileError?.message);
      // Don't reveal if user exists for security
      return {
        success: true,
        debugInfo: `User ${email} not found in system - ${profileError?.message || 'No error'}`
      };
    }

    console.log('✅ User found in system:', profile.id);
    console.log('🚀 Using direct Mailgun service (bypassing Supabase SMTP)');

    // Generate a secure reset token
    const resetToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    
    console.log('🔑 Generated reset token:', resetToken.substring(0, 8) + '...');
    console.log('⏰ Token expires at:', expiresAt.toISOString());

    // Store the reset token in our database
    console.log('💾 Storing reset token in database...');
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .upsert({
        user_id: profile.id,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
        used: false
      });

    if (tokenError) {
      console.error('❌ Error storing reset token:', tokenError);
      throw new Error('Failed to create reset token');
    }
    
    console.log('✅ Reset token stored successfully');

    // Create reset URL with our custom token
    const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    console.log('🔗 Reset URL created:', resetUrl.substring(0, 50) + '...');
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0d9488 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">RealEdu</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Iowa Real Estate CE Provider</p>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>
          <p>Hello,</p>
          <p>You requested a password reset for your RealEdu account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #0d9488 0%, #7c3aed 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">Reset Your Password</a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #0d9488;">${resetUrl}</p>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
            <p>For assistance, contact us at <a href="mailto:info@realedu.co" style="color: #0d9488;">info@realedu.co</a></p>
            <p style="margin-top: 20px;">
              <strong>RealEdu</strong><br>
              4817 University Avenue, Suite D<br>
              Cedar Falls, Iowa 50613
            </p>
          </div>
        </div>
      </div>
    `;

    const textContent = `Reset Your RealEdu Password

Hello,

You requested a password reset for your RealEdu account.

Click this link to reset your password: ${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request this reset, please ignore this email.

For assistance, contact us at info@realedu.co

RealEdu
4817 University Avenue, Suite D
Cedar Falls, Iowa 50613`;

    console.log('📧 Preparing email content...');
    console.log('📧 HTML length:', html.length);
    console.log('📧 Text length:', textContent.length);
    
    // Send email using our backup Mailgun service
    console.log('🌐 Calling Edge Function...');
    const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-backup`;
    console.log('🌐 Edge Function URL:', edgeFunctionUrl);
    
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-backup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        to: email,
        subject: 'Reset Your RealEdu Password',
        html,
        text: textContent,
        type: 'password-reset'
      })
    });

    console.log('📡 Edge Function response status:', response.status);
    console.log('📡 Edge Function response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📡 Edge Function response body:', responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse Edge Function response:', parseError);
      throw new Error(`Invalid response from Edge Function: ${responseText}`);
    }
    
    console.log('📋 Parsed Edge Function result:', result);

    if (!result.success) {
      console.error('❌ Edge Function returned error:', result);
      throw new Error(result.error || 'Backup email service failed');
    }

    console.log('🎉 Password reset email sent via direct Mailgun service');
    console.log('📧 Mailgun Message ID:', result.mailgunId);
    
    return {
      success: true,
      debugInfo: `✅ Sent via direct Mailgun service - Message ID: ${result.mailgunId || 'N/A'} - Timestamp: ${result.timestamp || 'N/A'}`
    };

  } catch (error: any) {
    console.error('💥 Unexpected error in resetPassword:', error);
    return {
      success: false,
      error: error.message || 'Unexpected error',
      debugInfo: `💥 Unexpected error: ${error.message} - Stack: ${error.stack?.split('\n')[0]}`
    };
  }
}

/**
 * Validates a custom reset token and updates the user's password
 */
export async function validateResetTokenAndUpdatePassword(
  token: string, 
  email: string, 
  newPassword: string
): Promise<AuthResult> {
  try {
    console.log('Validating custom reset token...');

    // Validate the token
    const { data: tokenData, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (tokenError || !tokenData) {
      return {
        success: false,
        error: 'Invalid or expired reset token',
        debugInfo: 'Token not found or already used'
      };
    }

    // Check if token has expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return {
        success: false,
        error: 'Reset token has expired',
        debugInfo: 'Token expired'
      };
    }

    // Verify the email matches
    const { data: profile, error: profileError } = await supabase
      .from('todo_profiles')
      .select('id, email')
      .eq('id', tokenData.user_id)
      .single();

    if (profileError || !profile || profile.email !== email.toLowerCase().trim()) {
      return {
        success: false,
        error: 'Invalid reset request',
        debugInfo: 'Email mismatch'
      };
    }

    // Update the user's password using admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      tokenData.user_id,
      { password: newPassword }
    );

    if (updateError) {
      throw updateError;
    }

    // Mark token as used
    await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('token', token);

    return {
      success: true,
      debugInfo: 'Password updated successfully'
    };

  } catch (error: any) {
    console.error('Error validating token and updating password:', error);
    return {
      success: false,
      error: error.message || 'Failed to update password',
      debugInfo: `Error: ${error.message}`
    };
  }
}

/**
 * Enhanced magic link with direct Mailgun service
 */
export async function sendMagicLink(email: string): Promise<AuthResult> {
  try {
    console.log('Starting magic link for:', email);
    
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: 'Invalid email format',
        debugInfo: 'Email validation failed'
      };
    }

    // Check if user exists in our system first
    const { data: profile, error: profileError } = await supabase
      .from('todo_profiles')
      .select('id, email')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (profileError || !profile) {
      console.log('User not found in todo_profiles:', email);
      // Don't reveal if user exists for security
      return {
        success: true,
        debugInfo: `User ${email} not found in system`
      };
    }

    console.log('User found, generating magic link token');

    // Generate a secure magic link token
    const magicToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store the magic link token
    const { error: tokenError } = await supabase
      .from('magic_link_tokens')
      .upsert({
        user_id: profile.id,
        token: magicToken,
        expires_at: expiresAt.toISOString(),
        used: false
      });

    if (tokenError) {
      console.error('Error storing magic link token:', tokenError);
      throw new Error('Failed to create magic link token');
    }

    // Create magic link URL
    const magicUrl = `${window.location.origin}/magic-login?token=${magicToken}&email=${encodeURIComponent(email)}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0d9488 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">RealEdu</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Iowa Real Estate CE Provider</p>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1f2937; margin-top: 0;">Sign In to Your Account</h2>
          <p>Hello,</p>
          <p>You requested a magic link to sign in to your RealEdu account.</p>
          <p>Click the button below to sign in:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicUrl}" style="background: linear-gradient(135deg, #0d9488 0%, #7c3aed 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">Sign In Now</a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #0d9488;">${magicUrl}</p>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If you didn't request this link, please ignore this email.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
            <p>For assistance, contact us at <a href="mailto:info@realedu.co" style="color: #0d9488;">info@realedu.co</a></p>
            <p style="margin-top: 20px;">
              <strong>RealEdu</strong><br>
              4817 University Avenue, Suite D<br>
              Cedar Falls, Iowa 50613
            </p>
          </div>
        </div>
      </div>
    `;

    // Send email using our backup Mailgun service
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-backup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        to: email,
        subject: 'Sign In to Your RealEdu Account',
        html,
        text: `Sign In to Your RealEdu Account

Hello,

You requested a magic link to sign in to your RealEdu account.

Click this link to sign in: ${magicUrl}

This link will expire in 1 hour for security reasons.

If you didn't request this link, please ignore this email.

For assistance, contact us at info@realedu.co

RealEdu
4817 University Avenue, Suite D
Cedar Falls, Iowa 50613`,
        type: 'magic-link'
      })
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Magic link service failed');
    }

    console.log('Magic link sent via direct Mailgun service');
    return {
      success: true,
      debugInfo: `Sent via direct Mailgun service - Message ID: ${result.mailgunId || 'N/A'}`
    };

  } catch (error: any) {
    console.error('Unexpected error in sendMagicLink:', error);
    return {
      success: false,
      error: error.message || 'Unexpected error',
      debugInfo: `Unexpected error: ${error.message}`
    };
  }
}

/**
 * Validates a magic link token and signs the user in
 */
export async function validateMagicLinkToken(token: string, email: string): Promise<AuthResult> {
  try {
    console.log('Validating magic link token...');

    // Validate the token
    const { data: tokenData, error: tokenError } = await supabase
      .from('magic_link_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (tokenError || !tokenData) {
      return {
        success: false,
        error: 'Invalid or expired magic link',
        debugInfo: 'Token not found or already used'
      };
    }

    // Check if token has expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return {
        success: false,
        error: 'Magic link has expired',
        debugInfo: 'Token expired'
      };
    }

    // Verify the email matches
    const { data: profile, error: profileError } = await supabase
      .from('todo_profiles')
      .select('id, email')
      .eq('id', tokenData.user_id)
      .single();

    if (profileError || !profile || profile.email !== email.toLowerCase().trim()) {
      return {
        success: false,
        error: 'Invalid magic link request',
        debugInfo: 'Email mismatch'
      };
    }

    // Sign the user in using admin API
    const { data: authData, error: authError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: profile.email
    });

    if (authError) {
      throw authError;
    }

    // Mark token as used
    await supabase
      .from('magic_link_tokens')
      .update({ used: true })
      .eq('token', token);

    // Set the session
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: authData.properties.access_token,
      refresh_token: authData.properties.refresh_token
    });

    if (sessionError) {
      throw sessionError;
    }

    return {
      success: true,
      debugInfo: 'Magic link authentication successful'
    };

  } catch (error: any) {
    console.error('Error validating magic link token:', error);
    return {
      success: false,
      error: error.message || 'Failed to authenticate',
      debugInfo: `Error: ${error.message}`
    };
  }
}

/**
 * Comprehensive email delivery test
 */
export async function testEmailDelivery(email: string): Promise<{
  directMailgun: boolean;
  supabaseSmtp: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  let directMailgun = false;
  let supabaseSmtp = false;

  // Test direct Mailgun service first (our primary method now)
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-backup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        to: email,
        subject: 'RealEdu Email Test - Direct Mailgun',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Email Test Successful!</h2>
            <p>This email was sent via direct Mailgun API to test the email delivery system.</p>
            <p>If you received this, the direct Mailgun service is working correctly.</p>
            <p>Time: ${new Date().toISOString()}</p>
          </div>
        `,
        type: 'test'
      })
    });

    const result = await response.json();
    if (result.success) {
      directMailgun = true;
    } else {
      errors.push(`Direct Mailgun: ${result.error}`);
    }
  } catch (error: any) {
    errors.push(`Direct Mailgun: ${error.message}`);
  }

  // Test Supabase SMTP (secondary test)
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/reset-password` }
    );
    
    if (!error) {
      supabaseSmtp = true;
    } else {
      errors.push(`Supabase SMTP: ${error.message}`);
    }
  } catch (error: any) {
    errors.push(`Supabase SMTP: ${error.message}`);
  }

  return {
    directMailgun,
    supabaseSmtp,
    errors
  };
}