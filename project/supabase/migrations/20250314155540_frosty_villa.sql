/*
  # Enable External User Certificates
  
  1. Changes
    - Add external_user_id to course_certificates
    - Add constraint to ensure either user_id or external_user_id is set
    - Update RLS policies to handle external certificates
  
  2. Security
    - Maintain RLS protection
    - Admin-only access for external certificates
*/

-- Add external_user_id to course_certificates
ALTER TABLE course_certificates
ADD COLUMN IF NOT EXISTS external_user_id uuid REFERENCES external_enrollments(id);

-- Add constraint to ensure either user_id or external_user_id is set
ALTER TABLE course_certificates
ADD CONSTRAINT certificates_user_check 
CHECK (
  (user_id IS NOT NULL AND external_user_id IS NULL) OR
  (user_id IS NULL AND external_user_id IS NOT NULL)
);

-- Add unique constraint for external users
ALTER TABLE course_certificates
ADD CONSTRAINT course_certificates_external_user_course_key
UNIQUE (external_user_id, course_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view own certificates" ON course_certificates;
DROP POLICY IF EXISTS "Admins can manage certificates" ON course_certificates;

CREATE POLICY "Users can view own certificates"
  ON course_certificates
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    external_user_id IN (
      SELECT id FROM external_enrollments WHERE email = auth.jwt()->>'email'
    ) OR
    is_admin()
  );

CREATE POLICY "Admins can manage certificates"
  ON course_certificates
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_certificates_external_user ON course_certificates(external_user_id);

-- Add comments
COMMENT ON COLUMN course_certificates.external_user_id IS 'Reference to external enrollment for non-registered users';