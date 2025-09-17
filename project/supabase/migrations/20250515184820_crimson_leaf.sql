/*
  # Fix Certificate Participant Name Updates
  
  1. Changes
    - Add trigger to update certificate participant_name when user profile is updated
    - Ensure certificates reflect the current user name
    - Fix formatting issues with participant names
  
  2. Features
    - Automatic name synchronization
    - Proper name formatting
    - Consistent certificate display
*/

-- Create a function to update certificate names when profiles are updated
CREATE OR REPLACE FUNCTION update_certificate_participant_name()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update participant_name in certificates when user profile is updated
  UPDATE course_certificates
  SET participant_name = 
    CASE
      WHEN NEW.full_name IS NOT NULL AND NEW.full_name <> '' THEN NEW.full_name
      WHEN NEW.first_name IS NOT NULL OR NEW.last_name IS NOT NULL THEN
        TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''))
      ELSE NEW.email
    END
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update certificate names when profiles are updated
DROP TRIGGER IF EXISTS update_certificate_names_on_profile_update ON todo_profiles;

CREATE TRIGGER update_certificate_names_on_profile_update
  AFTER UPDATE OF first_name, last_name, full_name ON todo_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_certificate_participant_name();

-- Update existing certificates with current profile names
DO $$
DECLARE
  cert_record RECORD;
  profile_record RECORD;
  new_name TEXT;
BEGIN
  FOR cert_record IN 
    SELECT cc.id, cc.user_id, cc.participant_name
    FROM course_certificates cc
    WHERE cc.user_id IS NOT NULL
  LOOP
    -- Get the current profile data
    SELECT id, email, first_name, last_name, full_name
    INTO profile_record
    FROM todo_profiles
    WHERE id = cert_record.user_id;
    
    IF FOUND THEN
      -- Determine the correct name format
      IF profile_record.full_name IS NOT NULL AND profile_record.full_name <> '' THEN
        new_name := profile_record.full_name;
      ELSIF profile_record.first_name IS NOT NULL OR profile_record.last_name IS NOT NULL THEN
        new_name := TRIM(COALESCE(profile_record.first_name, '') || ' ' || COALESCE(profile_record.last_name, ''));
      ELSE
        new_name := profile_record.email;
      END IF;
      
      -- Update the certificate if the name has changed
      IF new_name <> cert_record.participant_name THEN
        UPDATE course_certificates
        SET participant_name = new_name
        WHERE id = cert_record.id;
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- Add comments
COMMENT ON FUNCTION update_certificate_participant_name IS 'Updates certificate participant names when user profiles are updated';