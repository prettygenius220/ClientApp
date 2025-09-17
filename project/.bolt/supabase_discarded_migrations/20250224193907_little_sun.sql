/*
  # Add Role and Create Lead/Client Tables
  
  1. Changes
    - Add role column to profiles if missing
    - Create leads and clients tables
    - Set up RLS policies
    - Add indexes and comments
  
  2. Security
    - Enable RLS on new tables
    - Create secure admin check function
    - Add appropriate policies
*/

-- Add role to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'todo_profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE todo_profiles 
    ADD COLUMN role text NOT NULL DEFAULT 'user';

    ALTER TABLE todo_profiles
    ADD CONSTRAINT todo_profiles_role_check
    CHECK (role IN ('admin', 'user'));
  END IF;
END $$;

-- Create leads table if it doesn't exist
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

-- Create clients table if it doesn't exist
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  email text,
  phone text,
  company text,
  notes text,
  user_id uuid REFERENCES auth.users NOT NULL
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create secure admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM todo_profiles WHERE id = auth.uid();
  RETURN user_role = 'admin';
END;
$$;

-- Create leads policies with existence check
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'leads' AND policyname = 'Users can insert leads'
  ) THEN
    CREATE POLICY "Users can insert leads"
      ON leads
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'leads' AND policyname = 'Users can view own leads'
  ) THEN
    CREATE POLICY "Users can view own leads"
      ON leads
      FOR SELECT
      TO authenticated
      USING (
        user_id = auth.uid() OR
        is_admin()
      );
  END IF;
END $$;

-- Create clients policy with existence check
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'clients' AND policyname = 'Users can manage their own clients'
  ) THEN
    CREATE POLICY "Users can manage their own clients"
      ON clients
      FOR ALL
      TO authenticated
      USING (
        user_id = auth.uid() OR
        is_admin()
      );
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company);

-- Add comments
COMMENT ON TABLE leads IS 'Stores lead generation form submissions';
COMMENT ON TABLE clients IS 'Stores client information with user association';
COMMENT ON COLUMN leads.status IS 'Lead status (new, contacted, qualified, converted)';
COMMENT ON COLUMN clients.user_id IS 'The user who owns this client record';