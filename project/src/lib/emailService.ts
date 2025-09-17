/**
 * Email Service
 * 
 * Centralized email service that handles different email providers
 * and provides fallback mechanisms for reliable email delivery.
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Validates email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Sends email using Mailgun API
 * This is a backup method for when Supabase SMTP fails
 */
export async function sendEmailViaMailgun(options: EmailOptions): Promise<EmailResponse> {
  try {
    // This would be called from an edge function with proper API keys
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      success: true,
      messageId: result.id,
    };
  } catch (error) {
    console.error('Mailgun email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Validates email configuration
 */
export function validateEmailConfig(): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check if we're in production
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // Production checks
    if (!import.meta.env.VITE_SUPABASE_URL) {
      issues.push('Missing VITE_SUPABASE_URL');
    }
    if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
      issues.push('Missing VITE_SUPABASE_ANON_KEY');
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Creates a standardized email template
 */
export function createEmailTemplate(
  title: string,
  content: string,
  actionUrl?: string,
  actionText?: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0d9488 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">RealEdu</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Iowa Real Estate CE Provider</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1f2937; margin-top: 0;">${title}</h2>
        <div style="margin: 20px 0;">
          ${content}
        </div>
        
        ${actionUrl && actionText ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${actionUrl}" 
               style="background: linear-gradient(135deg, #0d9488 0%, #7c3aed 100%); 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 6px; 
                      font-weight: bold; 
                      display: inline-block;">
              ${actionText}
            </a>
          </div>
        ` : ''}
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
          <p>If you didn't request this email, you can safely ignore it.</p>
          <p>For assistance, contact us at <a href="mailto:info@realedu.co" style="color: #0d9488;">info@realedu.co</a></p>
          <p style="margin-top: 20px;">
            <strong>RealEdu</strong><br>
            4817 University Avenue, Suite D<br>
            Cedar Falls, Iowa 50613
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}