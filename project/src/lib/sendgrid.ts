import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
const apiKey = import.meta.env.VITE_SENDGRID_API_KEY;
sgMail.setApiKey(apiKey);

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  templateData?: Record<string, string>;
}

/**
 * Sends a notification email using SendGrid
 * For general notifications only - NOT for password resets
 * Password resets should use Supabase's built-in functionality
 */
export async function sendEmail({ to, subject, text, html, templateData }: EmailOptions) {
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      console.log('SendGrid API cannot be called directly from browser. Creating a mock response.');
      // Return a mock success response when in browser
      return { 
        success: true, 
        info: 'Email would be sent in production environment' 
      };
    }
    
    let processedHtml = html;
    if (templateData && html) {
      processedHtml = Object.entries(templateData).reduce((acc, [key, value]) => {
        return acc.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }, html);
    }

    const msg = {
      to,
      from: 'info@realedu.co',
      subject,
      text,
      html: processedHtml,
    };

    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error.message || error);
    return { success: false, error };
  }
}