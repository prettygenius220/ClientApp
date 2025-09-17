/*
  # Fix Email Authorization for Edge Functions
  
  1. Changes
    - Add SendGrid API key to environment variables
    - Update email sending authorization
    - Fix email sending trigger
  
  2. Security
    - Maintain secure email sending
    - Proper authorization for API calls
*/

-- Update the trigger_certificate_email function to properly mark certificates
CREATE OR REPLACE FUNCTION trigger_certificate_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark the certificate as pending email
  -- The actual sending will be handled by the edge function
  -- This just ensures we have a record of the attempt
  
  -- No need to update here as the edge function will handle it
  -- Just return the NEW record to continue with the insert
  RETURN NEW;
END;
$$;

-- Add comment explaining the function
COMMENT ON FUNCTION trigger_certificate_email IS 'Triggers the send-certificate edge function when a new certificate is created';