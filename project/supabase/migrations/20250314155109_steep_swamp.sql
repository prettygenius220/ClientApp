/*
  # Add External User Account Creation Support
  
  1. Changes
    - Add verification token and expiry to external_enrollments
    - Add account creation status tracking
    - Add email template for account creation
  
  2. Security
    - Secure token generation
    - Time-limited verification
    - Email validation
*/

-- Add account creation fields to external_enrollments
ALTER TABLE external_enrollments
ADD COLUMN IF NOT EXISTS verification_token uuid DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS token_expires_at timestamptz DEFAULT (now() + interval '7 days'),
ADD COLUMN IF NOT EXISTS account_created boolean DEFAULT false;

-- Create email templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert account creation email template
INSERT INTO email_templates (name, subject, content)
VALUES (
  'account_creation',
  'Complete Your RealEdu Account Setup',
  '<!DOCTYPE html>
  <html>
  <body>
    <h2>Welcome to RealEdu!</h2>
    <p>You''ve been enrolled in: {{course_title}}</p>
    <p>To access your course and certificate, please create your account:</p>
    <p><a href="{{signup_url}}">Click here to create your account</a></p>
    <p>This link will expire in 7 days.</p>
    <p>Best regards,<br>The RealEdu Team</p>
  </body>
  </html>'
) ON CONFLICT DO NOTHING;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_external_enrollments_token ON external_enrollments(verification_token);
CREATE INDEX IF NOT EXISTS idx_external_enrollments_expires ON external_enrollments(token_expires_at);

-- Add comments
COMMENT ON COLUMN external_enrollments.verification_token IS 'Token for account creation verification';
COMMENT ON COLUMN external_enrollments.token_expires_at IS 'Expiration timestamp for verification token';
COMMENT ON COLUMN external_enrollments.account_created IS 'Whether the user has created their account';