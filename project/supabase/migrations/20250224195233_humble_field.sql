/*
  # Add course certificates functionality

  1. New Tables
    - course_certificates: Stores generated course completion certificates
    - certificate_templates: Stores certificate templates for courses
  
  2. Security
    - Enable RLS
    - Admin-only certificate generation
    - User certificate access control
  
  3. Features
    - Certificate tracking per course
    - Template management
    - Certificate metadata
*/

-- Create certificate templates table
CREATE TABLE IF NOT EXISTS certificate_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  course_id uuid REFERENCES courses NOT NULL,
  template_name text NOT NULL,
  template_html text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE(course_id, template_name)
);

-- Create course certificates table
CREATE TABLE IF NOT EXISTS course_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  course_id uuid REFERENCES courses NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  template_id uuid REFERENCES certificate_templates NOT NULL,
  certificate_number text NOT NULL UNIQUE,
  school_name text NOT NULL,
  instructor text NOT NULL,
  course_title text NOT NULL,
  participant_name text NOT NULL,
  ce_hours numeric NOT NULL,
  issued_date timestamptz DEFAULT now(),
  pdf_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE(course_id, user_id)
);

-- Enable RLS
ALTER TABLE certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_certificates ENABLE ROW LEVEL SECURITY;

-- Certificate template policies
CREATE POLICY "Admins can manage certificate templates"
  ON certificate_templates FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Users can view certificate templates"
  ON certificate_templates FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM enrollments
    WHERE user_id = auth.uid()
    AND course_id = certificate_templates.course_id
  ) OR is_admin());

-- Course certificate policies
CREATE POLICY "Users can view own certificates"
  ON course_certificates FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Admins can manage certificates"
  ON course_certificates FOR ALL
  TO authenticated
  USING (is_admin());

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_cert_templates_course ON certificate_templates(course_id);
CREATE INDEX IF NOT EXISTS idx_course_certs_course ON course_certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_course_certs_user ON course_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_course_certs_template ON course_certificates(template_id);
CREATE INDEX IF NOT EXISTS idx_course_certs_number ON course_certificates(certificate_number);

-- Add comments
COMMENT ON TABLE certificate_templates IS 'Stores certificate templates for courses';
COMMENT ON TABLE course_certificates IS 'Stores generated course completion certificates';
COMMENT ON COLUMN course_certificates.certificate_number IS 'Unique certificate identification number';
COMMENT ON COLUMN course_certificates.ce_hours IS 'Number of continuing education hours';