/*
  # Add course management tables and policies

  1. New Tables
    - courses: Stores course information
    - enrollments: Tracks user course enrollments
    - lessons: Stores course lesson content
  
  2. Security
    - Enable RLS on all tables
    - Admin-only course management
    - Enrollment access control
  
  3. Features
    - Course CRUD operations
    - Enrollment tracking
    - Progress monitoring
*/

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  title text NOT NULL,
  description text,
  image text,
  price numeric NOT NULL,
  instructor text NOT NULL,
  duration text NOT NULL,
  level text NOT NULL CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  category text NOT NULL,
  published boolean DEFAULT false
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  course_id uuid REFERENCES courses ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  video_url text,
  duration text,
  order_number integer NOT NULL,
  UNIQUE (course_id, order_number)
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL,
  course_id uuid REFERENCES courses NOT NULL,
  completed_lessons uuid[] DEFAULT ARRAY[]::uuid[],
  last_accessed timestamptz,
  UNIQUE (user_id, course_id)
);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Course policies
CREATE POLICY "Public can view published courses"
  ON courses FOR SELECT
  USING (published = true OR is_admin());

CREATE POLICY "Admins can manage courses"
  ON courses FOR ALL
  TO authenticated
  USING (is_admin());

-- Lesson policies
CREATE POLICY "Users can view lessons of enrolled courses"
  ON lessons FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE user_id = auth.uid()
      AND course_id = lessons.course_id
    ) OR is_admin()
  );

CREATE POLICY "Admins can manage lessons"
  ON lessons FOR ALL
  TO authenticated
  USING (is_admin());

-- Enrollment policies
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
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(published);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(course_id, order_number);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);

-- Add comments
COMMENT ON TABLE courses IS 'Stores course information and content';
COMMENT ON TABLE lessons IS 'Individual lessons within courses';
COMMENT ON TABLE enrollments IS 'Tracks user enrollment and progress in courses';