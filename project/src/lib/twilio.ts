import twilio from 'twilio';

// Initialize Twilio client
const client = twilio(
  import.meta.env.VITE_TWILIO_ACCOUNT_SID,
  import.meta.env.VITE_TWILIO_AUTH_TOKEN
);

interface SMSOptions {
  to: string;
  message: string;
}

/**
 * Sends an SMS using Twilio
 */
export async function sendSMS({ to, message }: SMSOptions) {
  try {
    const response = await client.messages.create({
      body: message,
      to,
      from: import.meta.env.VITE_TWILIO_PHONE_NUMBER,
    });
    return { success: true, messageId: response.sid };
  } catch (error) {
    console.error('Twilio error:', error);
    return { success: false, error };
  }
}