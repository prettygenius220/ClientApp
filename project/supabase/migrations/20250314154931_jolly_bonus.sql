/*
  # Update Certificates Schema
  
  1. Changes
    - Add course_number and course_date to certificates table
    - Update existing certificates with course details
  
  2. Features
    - Better certificate tracking
    - More detailed certificate information
*/

-- Add new columns to course_certificates if they don't exist
ALTER TABLE course_certificates
ADD COLUMN IF NOT EXISTS course_number text,
ADD COLUMN IF NOT EXISTS course_date timestamptz;

-- Update existing certificates with course details
UPDATE course_certificates cc
SET 
  course_number = c.course_number,
  course_date = c.start_time
FROM courses c
WHERE cc.course_id = c.id
AND cc.course_number IS NULL;

-- Add comments
COMMENT ON COLUMN course_certificates.course_number IS 'Course number for reference';
COMMENT ON COLUMN course_certificates.course_date IS 'Date the course was taken';