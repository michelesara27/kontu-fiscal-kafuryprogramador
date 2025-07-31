/*
  # Create reminders table

  1. New Tables
    - `reminders`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key to companies)
      - `obligation_id` (uuid, foreign key to obligations, nullable)
      - `client_id` (uuid, foreign key to clients, nullable)
      - `title` (text, required)
      - `message` (text, required)
      - `reminder_type` (enum: obligation_due, custom, system)
      - `remind_at` (timestamp, required)
      - `status` (enum: pending, sent, cancelled)
      - `sent_at` (timestamp, nullable)
      - `created_by` (uuid, foreign key to user_profiles)
      - `assigned_to` (uuid, foreign key to user_profiles, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `reminders` table
    - Add policies for company members to manage reminders

  3. Indexes
    - Index on company_id for company queries
    - Index on remind_at for scheduling
    - Index on status for filtering
    - Index on obligation_id for obligation-related reminders
    - Index on assigned_to for user assignments
*/

-- Create enums for reminder types and statuses
CREATE TYPE reminder_type AS ENUM ('obligation_due', 'custom', 'system');
CREATE TYPE reminder_status AS ENUM ('pending', 'sent', 'cancelled');

CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  obligation_id uuid REFERENCES obligations(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  reminder_type reminder_type NOT NULL DEFAULT 'custom',
  remind_at timestamptz NOT NULL,
  status reminder_status NOT NULL DEFAULT 'pending',
  sent_at timestamptz,
  created_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL NOT NULL,
  assigned_to uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_reminder_sent CHECK (
    (status = 'sent' AND sent_at IS NOT NULL) OR
    (status != 'sent' AND sent_at IS NULL)
  ),
  CONSTRAINT valid_reminder_context CHECK (
    (reminder_type = 'obligation_due' AND obligation_id IS NOT NULL) OR
    (reminder_type != 'obligation_due')
  )
);

-- Enable RLS
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reminders_company_id ON reminders(company_id);
CREATE INDEX IF NOT EXISTS idx_reminders_remind_at ON reminders(remind_at);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);
CREATE INDEX IF NOT EXISTS idx_reminders_obligation_id ON reminders(obligation_id);
CREATE INDEX IF NOT EXISTS idx_reminders_client_id ON reminders(client_id);
CREATE INDEX IF NOT EXISTS idx_reminders_assigned_to ON reminders(assigned_to);
CREATE INDEX IF NOT EXISTS idx_reminders_created_by ON reminders(created_by);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_reminders_company_status_remind ON reminders(company_id, status, remind_at);
CREATE INDEX IF NOT EXISTS idx_reminders_pending_due ON reminders(remind_at) WHERE status = 'pending';

-- RLS Policies
CREATE POLICY "Company members can manage their reminders"
  ON reminders
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create reminders for obligations
CREATE OR REPLACE FUNCTION create_obligation_reminder(
  p_obligation_id uuid,
  p_days_before integer DEFAULT 3
)
RETURNS uuid AS $$
DECLARE
  v_obligation obligations%ROWTYPE;
  v_reminder_id uuid;
BEGIN
  -- Get obligation details
  SELECT * INTO v_obligation FROM obligations WHERE id = p_obligation_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Obligation not found';
  END IF;
  
  -- Create reminder
  INSERT INTO reminders (
    company_id,
    obligation_id,
    client_id,
    title,
    message,
    reminder_type,
    remind_at,
    created_by
  ) VALUES (
    v_obligation.company_id,
    v_obligation.id,
    v_obligation.client_id,
    'Obrigação vencendo: ' || v_obligation.title,
    'A obrigação "' || v_obligation.title || '" vence em ' || p_days_before || ' dias.',
    'obligation_due',
    (v_obligation.due_date - INTERVAL '1 day' * p_days_before)::timestamptz,
    v_obligation.created_by
  ) RETURNING id INTO v_reminder_id;
  
  RETURN v_reminder_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
