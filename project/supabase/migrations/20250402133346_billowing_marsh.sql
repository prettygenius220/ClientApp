/*
  # Enhance External Certificate Functionality
  
  1. Changes
    - Add course_number and course_date to certificates when issuing to external users
    - Update issue_external_certificate function to handle missing names
    - Improve error handling in certificate functions
  
  2. Security
    - Maintain admin-only access for issuing external certificates
    - Ensure proper data validation
*/

-- Update the issue_external_certificate function with improved handling
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

-- Create a function to check if a certificate exists for an email
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

-- Add comments
COMMENT ON FUNCTION issue_external_certificate IS 'Issues a certificate to an external user with improved validation and error handling';
COMMENT ON FUNCTION certificate_exists_for_email IS 'Checks if a certificate already exists for a given email and course';