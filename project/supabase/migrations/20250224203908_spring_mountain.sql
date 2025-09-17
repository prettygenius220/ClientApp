/*
  # Fix Enrollments Table Relationships

  1. Changes
    - Add foreign key relationship between enrollments and todo_profiles
    - Update enrollments table structure
    - Add necessary indexes
  
  2. Security
    - Maintain existing RLS policies
    - Ensure proper access control
*/

-- Drop existing enrollments table if it exists
DROP TABLE IF EXISTS enrollments CASCADE;

-- Recreate enrollments table with proper relationships
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES todo_profiles(id) NOT NULL,
  course_id uuid REFERENCES courses NOT NULL,
  completed_lessons uuid[] DEFAULT ARRAY[]::uuid[],
  last_accessed timestamptz,
  UNIQUE (user_id, course_id)
);

-- Enable RLS
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Create enrollment policies
CREATE POLICY "Users can view own enrollments"
  ON enrollments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can enroll in courses"
  ON enrollments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own enrollment progress"
  ON enrollments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);

-- Add comments
COMMENT ON TABLE enrollments IS 'Tracks user enrollment and progress in courses';
COMMENT ON COLUMN enrollments.user_id IS 'References todo_profiles instead of auth.users directly';
COMMENT ON COLUMN enrollments.completed_lessons IS 'Array of completed lesson IDs';
COMMENT ON COLUMN enrollments.last_accessed IS 'Timestamp of last course access';