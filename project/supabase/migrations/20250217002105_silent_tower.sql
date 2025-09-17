/*
  # Add Communication Tracking Tables

  1. New Tables
    - communications: Tracks all client communications
    - email_templates: Stores reusable email templates
  
  2. Changes
    - Add communication tracking
    - Template management
    - Audit logging
  
  3. Security
    - RLS policies for communications
    - Template access control
*/

-- Create communications table
CREATE TABLE IF NOT EXISTS communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  client_id uuid REFERENCES clients NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL CHECK (type IN ('email', 'sms')),
  subject text,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  name text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  user_id uuid REFERENCES auth.users,
  is_global boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Create communications policies
CREATE POLICY "Users can view their own communications"
  ON communications
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    is_admin()
  );

CREATE POLICY "Users can insert communications"
  ON communications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
  );

-- Create email templates policies
CREATE POLICY "Users can view global and own templates"
  ON email_templates
  FOR SELECT
  TO authenticated
  USING (
    is_global = true OR
    user_id = auth.uid() OR
    is_admin()
  );

CREATE POLICY "Users can manage their own templates"
  ON email_templates
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    is_admin()
  );

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_communications_client_id ON communications(client_id);
CREATE INDEX IF NOT EXISTS idx_communications_user_id ON communications(user_id);
CREATE INDEX IF NOT EXISTS idx_communications_type ON communications(type);
CREATE INDEX IF NOT EXISTS idx_email_templates_user_id ON email_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_is_global ON email_templates(is_global);

-- Add comments
COMMENT ON TABLE communications IS 'Tracks all client communications (emails and SMS)';
COMMENT ON TABLE email_templates IS 'Stores reusable email templates';
COMMENT ON COLUMN communications.type IS 'Type of communication (email or sms)';
COMMENT ON COLUMN communications.metadata IS 'Additional data like delivery status, click tracking, etc.';
COMMENT ON COLUMN email_templates.is_global IS 'Whether the template is available to all users';