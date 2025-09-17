/*
  # Add Course Number Field
  
  1. Changes
    - Add course_number column to courses table
    - Add unique constraint for course_number
    - Add index for faster lookups
  
  2. Security
    - Maintain existing RLS policies
    - No changes to permissions required
*/

-- Add course_number column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'courses' AND column_name = 'course_number'
  ) THEN
    ALTER TABLE courses 
    ADD COLUMN course_number text;

    -- Add unique constraint
    ALTER TABLE courses
    ADD CONSTRAINT courses_course_number_unique UNIQUE (course_number);

    -- Add index for faster lookups
    CREATE INDEX IF NOT EXISTS idx_courses_course_number ON courses(course_number);
  END IF;
END $$;

-- Add comment
COMMENT ON COLUMN courses.course_number IS 'Unique course identifier in format ABC-123 or ABCD-1234';