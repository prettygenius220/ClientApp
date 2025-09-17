/*
  # Create Token Tables for Custom Authentication

  1. New Tables
    - `password_reset_tokens` - Stores secure password reset tokens
    - `magic_link_tokens` - Stores secure magic link tokens

  2. Security
    - Enable RLS on both tables
    - Add policies for user access
    - Add cleanup for expired tokens

  3. Features
    - Secure token generation
    - Expiration handling
    - Usage tracking
*/

-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES todo_profiles(id) NOT NULL,
  token uuid UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create magic link tokens table
CREATE TABLE IF NOT EXISTS magic_link_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES todo_profiles(id) NOT NULL,
  token uuid UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE magic_link_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for password reset tokens
CREATE POLICY "Users can manage their own reset tokens"
  ON password_reset_tokens
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for magic link tokens
CREATE POLICY "Users can manage their own magic link tokens"
  ON magic_link_tokens
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_magic_link_tokens_token ON magic_link_tokens(token);
CREATE INDEX IF NOT EXISTS idx_magic_link_tokens_user_id ON magic_link_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_magic_link_tokens_expires_at ON magic_link_tokens(expires_at);

-- Function to cleanup expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM password_reset_tokens WHERE expires_at < now();
  DELETE FROM magic_link_tokens WHERE expires_at < now();
END;
$$;

-- Add table comments
COMMENT ON TABLE password_reset_tokens IS 'Stores secure password reset tokens with expiration';
COMMENT ON TABLE magic_link_tokens IS 'Stores secure magic link tokens with expiration';