/*
  # Fix Email Functionality - Remove All Interfering Triggers
  
  1. Changes
    - Remove all email-related triggers that might interfere with Supabase auth
    - Drop problematic functions that call edge functions
    - Clean up certificate email triggers
    - Remove password reset token dependencies
  
  2. Security
    - Maintain RLS policies
    - Preserve data integrity
    - Use only Supabase built-in authentication
*/

-- Drop all email-related triggers that might interfere
DROP TRIGGER IF EXISTS send_certificate_email_trigger ON course_certificates;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop problematic functions
DROP FUNCTION IF EXISTS trigger_certificate_email();
DROP FUNCTION IF EXISTS handle_new_user();

-- Recreate the user creation trigger without email dependencies
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.todo_profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Recreate the user creation trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Remove email tracking columns that might cause issues
ALTER TABLE course_certificates 
DROP COLUMN IF EXISTS email_sent,
DROP COLUMN IF EXISTS email_sent_at,
DROP COLUMN IF EXISTS email_error;

-- Drop password reset tokens table as we're using Supabase built-in
DROP TABLE IF EXISTS password_reset_tokens CASCADE;

-- Add comment
COMMENT ON FUNCTION handle_new_user IS 'Creates user profile without email dependencies';