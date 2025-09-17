/*
  # Fix Certificate Email Functionality
  
  1. Changes
    - Create a new migration to fix certificate email functionality
    - Simplify the trigger function to avoid HTTP calls from PostgreSQL
    - Add email tracking columns to certificates table
  
  2. Security
    - Maintain existing security model
    - Ensure proper access control
*/

-- Make sure email tracking columns exist
ALTER TABLE course_certificates
ADD COLUMN IF NOT EXISTS email_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS email_sent_at timestamptz,
ADD COLUMN IF NOT EXISTS email_error text;

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS send_certificate_email_trigger ON course_certificates;
DROP FUNCTION IF EXISTS trigger_certificate_email();

-- Create simplified certificate email trigger function
CREATE OR REPLACE FUNCTION trigger_certificate_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- The actual email sending is handled by the edge function
  -- This function just logs the certificate creation for debugging
  
  RAISE LOG 'Certificate created: ID=%, Number=%, Recipient=%', 
    NEW.id, 
    NEW.certificate_number,
    NEW.participant_name;
  
  -- Return the NEW record to continue with the insert
  RETURN NEW;
END;
$$;

-- Create trigger for new certificates
CREATE TRIGGER send_certificate_email_trigger
  AFTER INSERT ON course_certificates
  FOR EACH ROW
  EXECUTE FUNCTION trigger_certificate_email();

-- Add comment explaining the function
COMMENT ON FUNCTION trigger_certificate_email IS 'Logs certificate creation and enables external email sending';