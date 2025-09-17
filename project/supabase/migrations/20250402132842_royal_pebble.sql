/*
  # Enable Direct Certificate Issuance for External Users
  
  1. Changes
    - Add direct certificate issuance for external users without accounts
    - Update certificate constraints to allow external users without enrollment
    - Add new columns for tracking external recipients
  
  2. Security
    - Maintain RLS policies
    - Admin-only access for external certificates
    - Proper validation for certificate issuance
*/

-- Add external recipient tracking to course_certificates
ALTER TABLE course_certificates
ADD COLUMN IF NOT EXISTS external_email text,
ADD COLUMN IF NOT EXISTS external_first_name text,
ADD COLUMN IF NOT EXISTS external_last_name text;

-- Modify the user constraint to allow external certificates without enrollment
ALTER TABLE course_certificates DROP CONSTRAINT IF EXISTS certificates_user_check;

ALTER TABLE course_certificates
ADD CONSTRAINT certificates_user_check 
CHECK (
  (user_id IS NOT NULL AND external_user_id IS NULL AND external_email IS NULL) OR
  (user_id IS NULL AND external_user_id IS NOT NULL AND external_email IS NULL) OR
  (user_id IS NULL AND external_user_id IS NULL AND external_email IS NOT NULL)
);

-- Create function to issue certificate to external user without account
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
BEGIN
  -- Check if admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only administrators can issue external certificates';
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
    p_first_name || ' ' || p_last_name,
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

-- Update RLS policies to include external email certificates
DROP POLICY IF EXISTS "Users can view own certificates" ON course_certificates;

CREATE POLICY "Users can view own certificates"
  ON course_certificates
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    external_user_id IN (
      SELECT id FROM external_enrollments WHERE email = auth.jwt()->>'email'
    ) OR 
    external_email = auth.jwt()->>'email' OR
    is_admin()
  );

-- Add comments
COMMENT ON COLUMN course_certificates.external_email IS 'Email for external certificate recipients without accounts';
COMMENT ON COLUMN course_certificates.external_first_name IS 'First name for external certificate recipients';
COMMENT ON COLUMN course_certificates.external_last_name IS 'Last name for external certificate recipients';
COMMENT ON FUNCTION issue_external_certificate IS 'Issues a certificate to an external user without requiring an account or enrollment';