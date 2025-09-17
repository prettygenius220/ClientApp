/*
  # Add External User Enrollment Support
  
  1. Changes
    - Add external_enrollments table for non-registered users
    - Add email verification status tracking
    - Add enrollment notification tracking
  
  2. Security
    - Enable RLS
    - Admin-only access control
    - Email validation
*/

-- Create external enrollments table
CREATE TABLE IF NOT EXISTS external_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  email text NOT NULL,
  first_name text,
  last_name text,
  course_id uuid REFERENCES courses NOT NULL,
  enrolled_by uuid REFERENCES todo_profiles(id) NOT NULL,
  completed_lessons uuid[] DEFAULT ARRAY[]::uuid[],
  last_accessed timestamptz,
  email_verified boolean DEFAULT false,
  verification_sent_at timestamptz,
  notification_sent_at timestamptz
);

-- Enable RLS
ALTER TABLE external_enrollments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage external enrollments"
  ON external_enrollments
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_external_enrollments_email ON external_enrollments(email);
CREATE INDEX IF NOT EXISTS idx_external_enrollments_course ON external_enrollments(course_id);

-- Add comments
COMMENT ON TABLE external_enrollments IS 'Tracks course enrollments for users not yet registered on the platform';
COMMENT ON COLUMN external_enrollments.enrolled_by IS 'Admin who created the enrollment';
COMMENT ON COLUMN external_enrollments.email_verified IS 'Whether the user has verified their email';
COMMENT ON COLUMN external_enrollments.verification_sent_at IS 'When the verification email was last sent';
COMMENT ON COLUMN external_enrollments.notification_sent_at IS 'When the enrollment notification was last sent';