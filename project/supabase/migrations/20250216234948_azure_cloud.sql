/*
  # Add Leads Table
  
  1. New Tables
    - leads: Stores lead information with contact details
  
  2. Security
    - RLS enabled
    - Admin access to all leads
    - Users can only view their own submissions
*/

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  phone text,
  message text,
  status text DEFAULT 'new',
  user_id uuid REFERENCES auth.users
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create leads policies
CREATE POLICY "Users can insert leads"
  ON leads
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own leads"
  ON leads
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    is_admin()
  );

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- Add comments
COMMENT ON TABLE leads IS 'Stores lead generation form submissions';
COMMENT ON COLUMN leads.status IS 'Lead status (new, contacted, qualified, converted)';