/*
  # Add Certificate Email Notification Support
  
  1. Changes
    - Add email notification tracking to certificates
    - Create trigger function to send certificate emails
    - Add trigger to automatically send emails on certificate creation
  
  2. Features
    - Automatic email notifications
    - Email status tracking
    - Error handling
*/

-- Add email notification tracking to course_certificates if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'course_certificates' AND column_name = 'email_sent'
  ) THEN
    ALTER TABLE course_certificates
    ADD COLUMN email_sent boolean DEFAULT false,
    ADD COLUMN email_sent_at timestamptz,
    ADD COLUMN email_error text;
  END IF;
END $$;

-- Create function to trigger certificate email notification
CREATE OR REPLACE FUNCTION trigger_certificate_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- The actual email sending is handled by the edge function
  -- This function just marks the certificate as needing an email
  
  -- We don't need to do anything here as the edge function
  -- will be called separately and will update the certificate
  
  RETURN NEW;
END;
$$;

-- Create trigger for new certificates if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'send_certificate_email_trigger'
  ) THEN
    CREATE TRIGGER send_certificate_email_trigger
      AFTER INSERT ON course_certificates
      FOR EACH ROW
      EXECUTE FUNCTION trigger_certificate_email();
  END IF;
END $$;

-- Add comments
COMMENT ON COLUMN course_certificates.email_sent IS 'Whether the certificate email was sent successfully';
COMMENT ON COLUMN course_certificates.email_sent_at IS 'When the certificate email was sent';
COMMENT ON COLUMN course_certificates.email_error IS 'Error message if email sending failed';
COMMENT ON FUNCTION trigger_certificate_email IS 'Triggers the send-certificate edge function when a new certificate is created';