/*
  # Create audit logs table

  1. New Tables
    - `audit_logs`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key to companies)
      - `user_id` (uuid, foreign key to user_profiles)
      - `table_name` (text, required)
      - `record_id` (uuid, required)
      - `action` (enum: insert, update, delete)
      - `old_values` (jsonb, nullable)
      - `new_values` (jsonb, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `audit_logs` table
    - Add policies for admins to read audit logs

  3. Indexes
    - Index on company_id for company queries
    - Index on user_id for user activity
    - Index on table_name for table-specific logs
    - Index on created_at for time-based queries
    - Index on record_id for record-specific logs
*/

-- Create enum for audit actions
CREATE TYPE audit_action AS ENUM ('insert', 'update', 'delete');

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action audit_action NOT NULL,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_table_created ON audit_logs(company_id, table_name, created_at);

-- RLS Policies
CREATE POLICY "Admins can read audit logs for their company"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION create_audit_log(
  p_company_id uuid,
  p_user_id uuid,
  p_table_name text,
  p_record_id uuid,
  p_action audit_action,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO audit_logs (
    company_id,
    user_id,
    table_name,
    record_id,
    action,
    old_values,
    new_values
  ) VALUES (
    p_company_id,
    p_user_id,
    p_table_name,
    p_record_id,
    p_action,
    p_old_values,
    p_new_values
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
