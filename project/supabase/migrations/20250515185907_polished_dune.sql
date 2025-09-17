/*
  # Add Certificate Email Notification Trigger
  
  1. Changes
    - Add trigger to send email notification when certificates are issued
    - Add function to call the send-certificate edge function
    - Track email notification status
  
  2. Features
    - Automatic email notifications
    - PDF certificate attachments
    - Email tracking
*/

-- Add email notification tracking to course_certificates
ALTER TABLE course_certificates
ADD COLUMN IF NOT EXISTS email_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS email_sent_at timestamptz,
ADD COLUMN IF NOT EXISTS email_error text;

-- Create function to trigger certificate email notification
CREATE OR REPLACE FUNCTION trigger_certificate_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  http_status integer;
  http_response text;
BEGIN
  -- Call the edge function to send the certificate email
  SELECT
    status, content
  INTO
    http_status, http_response
  FROM
    http((
      'POST',
      CONCAT(current_setting('app.settings.supabase_url'), '/functions/v1/send-certificate'),
      ARRAY[
        ('Content-Type', 'application/json'),
        ('Authorization', CONCAT('Bearer ', current_setting('app.settings.service_role_key')))
      ],
      '{"certificateId":"' || NEW.id || '"}',
      5000
    ));

  -- Update certificate with email status
  IF http_status = 200 THEN
    UPDATE course_certificates
    SET 
      email_sent = true,
      email_sent_at = now()
    WHERE id = NEW.id;
  ELSE
    UPDATE course_certificates
    SET 
      email_sent = false,
      email_error = http_response
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Set up configuration for edge function calls
DO $$
BEGIN
  -- Set the Supabase URL and service role key for HTTP calls
  PERFORM set_config('app.settings.supabase_url', current_setting('SUPABASE_URL'), false);
  PERFORM set_config('app.settings.service_role_key', current_setting('SUPABASE_SERVICE_ROLE_KEY'), false);
EXCEPTION
  WHEN OTHERS THEN
    -- If the settings don't exist, create them
    PERFORM set_config('app.settings.supabase_url', 'https://ytjdouwglmlsnecjzzqg.supabase.co', true);
    PERFORM set_config('app.settings.service_role_key', current_setting('SUPABASE_SERVICE_ROLE_KEY', true), true);
END $$;

-- Create trigger for new certificates
CREATE TRIGGER send_certificate_email_trigger
  AFTER INSERT ON course_certificates
  FOR EACH ROW
  EXECUTE FUNCTION trigger_certificate_email();

-- Add comments
COMMENT ON COLUMN course_certificates.email_sent IS 'Whether the certificate email was sent successfully';
COMMENT ON COLUMN course_certificates.email_sent_at IS 'When the certificate email was sent';
COMMENT ON COLUMN course_certificates.email_error IS 'Error message if email sending failed';
COMMENT ON FUNCTION trigger_certificate_email IS 'Triggers the send-certificate edge function when a new certificate is created';