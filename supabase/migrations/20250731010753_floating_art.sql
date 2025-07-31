/*
  # Create obligations table

  1. New Tables
    - `obligations`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key to companies)
      - `client_id` (uuid, foreign key to clients)
      - `title` (text, required)
      - `description` (text, nullable)
      - `obligation_type` (enum: federal, state, municipal, other)
      - `due_date` (date, required)
      - `status` (enum: pending, completed, overdue, cancelled)
      - `priority` (enum: low, medium, high, urgent)
      - `assigned_to` (uuid, foreign key to user_profiles, nullable)
      - `completed_at` (timestamp, nullable)
      - `completed_by` (uuid, foreign key to user_profiles, nullable)
      - `notes` (text, nullable)
      - `created_by` (uuid, foreign key to user_profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `obligations` table
    - Add policies for company members to manage obligations

  3. Indexes
    - Index on company_id for company queries
    - Index on client_id for client obligations
    - Index on due_date for deadline queries
    - Index on status for filtering
    - Index on assigned_to for user assignments
    - Composite index on (company_id, status, due_date) for dashboard queries
*/

-- Create enums for obligation types and statuses
CREATE TYPE obligation_type AS ENUM ('federal', 'state', 'municipal', 'other');
CREATE TYPE obligation_status AS ENUM ('pending', 'completed', 'overdue', 'cancelled');
CREATE TYPE obligation_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TABLE IF NOT EXISTS obligations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  obligation_type obligation_type NOT NULL DEFAULT 'other',
  due_date date NOT NULL,
  status obligation_status NOT NULL DEFAULT 'pending',
  priority obligation_priority NOT NULL DEFAULT 'medium',
  assigned_to uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  completed_at timestamptz,
  completed_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  notes text,
  created_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_completion CHECK (
    (status = 'completed' AND completed_at IS NOT NULL AND completed_by IS NOT NULL) OR
    (status != 'completed' AND completed_at IS NULL AND completed_by IS NULL)
  )
);

-- Enable RLS
ALTER TABLE obligations ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_obligations_company_id ON obligations(company_id);
CREATE INDEX IF NOT EXISTS idx_obligations_client_id ON obligations(client_id);
CREATE INDEX IF NOT EXISTS idx_obligations_due_date ON obligations(due_date);
CREATE INDEX IF NOT EXISTS idx_obligations_status ON obligations(status);
CREATE INDEX IF NOT EXISTS idx_obligations_assigned_to ON obligations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_obligations_created_by ON obligations(created_by);
CREATE INDEX IF NOT EXISTS idx_obligations_priority ON obligations(priority);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_obligations_company_status_due ON obligations(company_id, status, due_date);
CREATE INDEX IF NOT EXISTS idx_obligations_assigned_status ON obligations(assigned_to, status) WHERE assigned_to IS NOT NULL;

-- RLS Policies
CREATE POLICY "Company members can manage their obligations"
  ON obligations
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_obligations_updated_at
  BEFORE UPDATE ON obligations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update status to overdue
CREATE OR REPLACE FUNCTION update_overdue_obligations()
RETURNS void AS $$
BEGIN
  UPDATE obligations 
  SET status = 'overdue', updated_at = now()
  WHERE status = 'pending' 
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Function to mark obligation as completed
CREATE OR REPLACE FUNCTION complete_obligation(obligation_id uuid, user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE obligations 
  SET 
    status = 'completed',
    completed_at = now(),
    completed_by = user_id,
    updated_at = now()
  WHERE id = obligation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
