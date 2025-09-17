/*
  # Add Clients Management System
  
  1. New Tables
    - clients: Stores client information with user association
      - id (uuid, primary key)
      - created_at (timestamp)
      - name (text)
      - email (text)
      - phone (text)
      - company (text)
      - notes (text)
      - user_id (uuid, references auth.users)
  
  2. Security
    - Enable RLS
    - Users can only see their own clients
    - Admins can see all clients
*/

-- Create clients table
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
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    is_admin()
  );

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company);

-- Add comments
COMMENT ON TABLE clients IS 'Stores client information with user association';
COMMENT ON COLUMN clients.user_id IS 'The user who owns this client record';