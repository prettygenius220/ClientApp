/*
  # Enhance External Certificate Functionality
  
  1. Changes
    - Add function to issue certificates to external users
    - Add function to check if a certificate exists for an email
    - Update RLS policies to allow viewing certificates by email
  
  2. Security
    - Maintain admin-only access for issuing certificates
    - Ensure proper data validation
    - Prevent duplicate certificates
*/

-- Create or replace function to issue certificates to external users
CREATE OR REPLACE FUNCTION issue_external_certificate(
  p_course_id uuid,
  p_email text,
  p_first_name text,
  p_last_name text,
  p_ce_hours numeric
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_course_record courses;
  v_certificate_number text;
  v_certificate_id uuid;
  v_participant_name text;
BEGIN
  -- Check if admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only administrators can issue external certificates';
  END IF;
  
  -- Validate inputs
  IF p_email IS NULL OR p_email = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;
  
  IF p_ce_hours IS NULL OR p_ce_hours <= 0 THEN
    RAISE EXCEPTION 'CE hours must be greater than zero';
  END IF;
  
  -- Check if certificate already exists for this email and course
  IF certificate_exists_for_email(p_course_id, p_email) THEN
    RAISE EXCEPTION 'A certificate already exists for this email address';
  END IF;
  
  -- Get course details
  SELECT * INTO v_course_record FROM courses WHERE id = p_course_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Course not found';
  END IF;
  
  -- Generate certificate number
  v_certificate_number := 
    COALESCE(SPLIT_PART(v_course_record.course_number, '-', 1), '000') || 
    '-' || 
    TO_CHAR(NOW(), 'YYYYMMDD') || 
    '-' || 
    UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
  
  -- Handle empty names gracefully
  IF p_first_name IS NULL OR p_first_name = '' OR p_last_name IS NULL OR p_last_name = '' THEN
    v_participant_name := p_email;
  ELSE
    v_participant_name := TRIM(p_first_name || ' ' || p_last_name);
  END IF;
  
  -- Insert certificate
  INSERT INTO course_certificates (
    course_id,
    external_email,
    external_first_name,
    external_last_name,
    certificate_number,
    school_name,
    instructor,
    course_title,
    participant_name,
    ce_hours,
    issued_date,
    pdf_status,
    course_number,
    course_date
  ) VALUES (
    p_course_id,
    p_email,
    p_first_name,
    p_last_name,
    v_certificate_number,
    'RealEdu',
    v_course_record.instructor,
    v_course_record.title,
    v_participant_name,
    p_ce_hours,
    NOW(),
    'completed',
    v_course_record.course_number,
    v_course_record.start_time
  )
  RETURNING id INTO v_certificate_id;
  
  RETURN v_certificate_id;
END;
$$;

-- Create or replace function to check if a certificate exists for an email
CREATE OR REPLACE FUNCTION certificate_exists_for_email(
  p_course_id uuid,
  p_email text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM course_certificates 
    WHERE course_id = p_course_id AND (
      external_email = p_email OR
      EXISTS (
        SELECT 1 FROM todo_profiles
        WHERE id = course_certificates.user_id AND email = p_email
      ) OR
      EXISTS (
        SELECT 1 FROM external_enrollments
        WHERE id = course_certificates.external_user_id AND email = p_email
      )
    )
  );
END;
$$;

-- Update RLS policy for viewing certificates
DROP POLICY IF EXISTS "Users can view own certificates" ON course_certificates;

CREATE POLICY "Users can view own certificates"
  ON course_certificates
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    external_user_id IN (
      SELECT id FROM external_enrollments
      WHERE email = (auth.jwt()->>'email')
    ) OR
    external_email = (auth.jwt()->>'email') OR
    is_admin()
  );

-- Add comments
COMMENT ON FUNCTION issue_external_certificate IS 'Issues a certificate to an external user with validation and duplicate checking';
COMMENT ON FUNCTION certificate_exists_for_email IS 'Checks if a certificate already exists for a given email and course';