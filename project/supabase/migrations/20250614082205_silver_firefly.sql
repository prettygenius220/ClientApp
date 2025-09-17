/*
  # Fix Certificate Email Trigger Function
  
  1. Changes
    - Enable http extension for PostgreSQL
    - Update trigger_certificate_email function to call Edge Function
    - Fix email sending for certificates
  
  2. Features
    - Automatic email notifications when certificates are created
    - Proper HTTP call to Edge Function
    - Email status tracking
*/

-- Enable the http extension if not already enabled
CREATE EXTENSION IF NOT EXISTS http;

-- Update the trigger_certificate_email function to call the Edge Function
CREATE OR REPLACE FUNCTION trigger_certificate_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_response json;
  v_status int;
  v_url text := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-certificate';
  v_service_key text := current_setting('app.settings.service_role_key', true);
BEGIN
  -- Make HTTP request to the Edge Function
  SELECT
    status, content::json INTO v_status, v_response
  FROM
    http((
      'POST',
      v_url,
      ARRAY[
        ('Content-Type', 'application/json'),
        ('Authorization', 'Bearer ' || v_service_key)
      ],
      '{"certificateId":"' || NEW.id || '"}',
      5000
    ));

  -- Log the response for debugging
  RAISE NOTICE 'Edge function response: status=%, content=%', v_status, v_response;
  
  -- Update certificate with email status based on response
  IF v_status = 200 AND (v_response->>'success')::boolean = true THEN
    -- Success case - no need to update as the Edge Function will handle it
    RAISE NOTICE 'Certificate email triggered successfully for certificate ID: %', NEW.id;
  ELSE
    -- Error case - update certificate with error
    UPDATE course_certificates
    SET 
      email_error = 'Failed to trigger email: ' || COALESCE(v_response->>'error', 'Unknown error')
    WHERE id = NEW.id;
    
    RAISE NOTICE 'Failed to trigger certificate email for ID: %, Error: %', 
      NEW.id, 
      COALESCE(v_response->>'error', 'Unknown error');
  END IF;

  RETURN NEW;
END;
$$;

-- Set up configuration for edge function calls if not already set
DO $$
BEGIN
  -- Try to get the current settings
  BEGIN
    PERFORM current_setting('app.settings.supabase_url');
    PERFORM current_setting('app.settings.service_role_key');
  EXCEPTION
    WHEN OTHERS THEN
      -- If the settings don't exist, create them
      PERFORM set_config('app.settings.supabase_url', 'https://ytjdouwglmlsnecjzzqg.supabase.co', true);
      PERFORM set_config('app.settings.service_role_key', (
        SELECT current_setting('SUPABASE_SERVICE_ROLE_KEY', true)
      ), true);
  END;
END $$;

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS send_certificate_email_trigger ON course_certificates;

CREATE TRIGGER send_certificate_email_trigger
  AFTER INSERT ON course_certificates
  FOR EACH ROW
  EXECUTE FUNCTION trigger_certificate_email();

-- Add comments
COMMENT ON FUNCTION trigger_certificate_email IS 'Triggers the send-certificate edge function when a new certificate is created';