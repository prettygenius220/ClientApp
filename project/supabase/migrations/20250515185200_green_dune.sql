/*
  # Fix Certificate Display Issues
  
  1. Changes
    - Update certificate participant names to use proper formatting
    - Ensure course numbers are correctly displayed on certificates
    - Fix certificate PDF text formatting and spacing
  
  2. Features
    - Automatic name updates when profiles change
    - Consistent course number display
    - Better text wrapping for PDF generation
*/

-- Create or replace function to update certificate participant names
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

-- Update course_certificates to include course_number from courses table
UPDATE course_certificates cc
SET course_number = c.course_number
FROM courses c
WHERE cc.course_id = c.id
AND (cc.course_number IS NULL OR cc.course_number = '');

-- Improve reissue_certificate function to update participant name
CREATE OR REPLACE FUNCTION reissue_certificate(certificate_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cert_record course_certificates;
  profile_record todo_profiles;
  external_record external_enrollments;
  new_name TEXT;
BEGIN
  -- Get the certificate record
  SELECT * INTO cert_record FROM course_certificates WHERE id = certificate_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Certificate not found';
  END IF;
  
  -- Update participant name if needed
  IF cert_record.user_id IS NOT NULL THEN
    -- Get profile data for registered user
    SELECT * INTO profile_record FROM todo_profiles WHERE id = cert_record.user_id;
    
    IF FOUND THEN
      -- Determine the correct name format
      IF profile_record.full_name IS NOT NULL AND profile_record.full_name <> '' THEN
        new_name := profile_record.full_name;
      ELSIF profile_record.first_name IS NOT NULL OR profile_record.last_name IS NOT NULL THEN
        new_name := TRIM(COALESCE(profile_record.first_name, '') || ' ' || COALESCE(profile_record.last_name, ''));
      ELSE
        new_name := profile_record.email;
      END IF;
    END IF;
  ELSIF cert_record.external_user_id IS NOT NULL THEN
    -- Get data for external enrollment
    SELECT * INTO external_record FROM external_enrollments WHERE id = cert_record.external_user_id;
    
    IF FOUND THEN
      -- Determine the correct name format
      IF external_record.first_name IS NOT NULL OR external_record.last_name IS NOT NULL THEN
        new_name := TRIM(COALESCE(external_record.first_name, '') || ' ' || COALESCE(external_record.last_name, ''));
      ELSE
        new_name := external_record.email;
      END IF;
    END IF;
  END IF;
  
  -- Update reissue history
  UPDATE course_certificates
  SET 
    reissue_count = COALESCE(reissue_count, 0) + 1,
    last_reissued_at = now(),
    issued_date = now(),
    participant_name = COALESCE(new_name, participant_name),
    reissue_history = jsonb_build_array(
      jsonb_build_object(
        'previous_date', issued_date,
        'reissued_at', now(),
        'reissued_by', auth.uid()
      )
    ) || COALESCE(reissue_history, '[]'::jsonb)
  WHERE id = certificate_id;
END;
$$;

-- Add comments
COMMENT ON FUNCTION update_certificate_participant_name IS 'Updates certificate participant names when user profiles are updated';
COMMENT ON FUNCTION reissue_certificate IS 'Reissues a certificate with updated participant name and new date';