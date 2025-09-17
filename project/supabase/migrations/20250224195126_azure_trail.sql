/*
  # Add course certificates functionality

  1. New Tables
    - certificates: Stores generated course completion certificates
  
  2. Security
    - Enable RLS
    - Admin-only certificate generation
    - User certificate access control
  
  3. Features
    - Certificate tracking
    - Certificate metadata
    - Admin generation capabilities
*/

-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL,
  course_id uuid REFERENCES courses NOT NULL,
  certificate_number text NOT NULL UNIQUE,
  school_name text NOT NULL,
  instructor text NOT NULL,
  course_title text NOT NULL,
  participant_name text NOT NULL,
  ce_hours numeric NOT NULL,
  issued_date timestamptz DEFAULT now(),
  pdf_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Certificate policies
CREATE POLICY "Users can view own certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Admins can manage certificates"
  ON certificates FOR ALL
  TO authenticated
  USING (is_admin());

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course ON certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON certificates(certificate_number);

-- Add comments
COMMENT ON TABLE certificates IS 'Stores course completion certificates';
COMMENT ON COLUMN certificates.certificate_number IS 'Unique certificate identification number';
COMMENT ON COLUMN certificates.ce_hours IS 'Number of continuing education hours';