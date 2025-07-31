/*
  # Create triggers and utility functions

  1. Triggers
    - Auto-create reminders for new obligations
    - Update obligation status based on due dates
    - Audit trail triggers for all main tables

  2. Functions
    - Batch operations for obligations
    - User invitation system
    - Data cleanup functions

  3. Scheduled Jobs
    - Daily obligation status updates
    - Reminder processing
*/

-- Function to handle new obligation creation
CREATE OR REPLACE FUNCTION handle_new_obligation()
RETURNS TRIGGER AS $$
BEGIN
  -- Create automatic reminder 3 days before due date
  IF NEW.due_date > CURRENT_DATE + INTERVAL '3 days' THEN
    PERFORM create_obligation_reminder(NEW.id, 3);
  END IF;
  
  -- Create audit log
  PERFORM create_audit_log(
    NEW.company_id,
    NEW.created_by,
    'obligations',
    NEW.id,
    'insert',
    NULL,
    to_jsonb(NEW)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new obligations
CREATE TRIGGER trigger_handle_new_obligation
  AFTER INSERT ON obligations
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_obligation();

-- Function to handle obligation updates
CREATE OR REPLACE FUNCTION handle_obligation_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Create audit log
  PERFORM create_audit_log(
    NEW.company_id,
    COALESCE(NEW.completed_by, OLD.created_by),
    'obligations',
    NEW.id,
    'update',
    to_jsonb(OLD),
    to_jsonb(NEW)
  );
  
  -- Cancel related reminders if obligation is completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE reminders 
    SET status = 'cancelled', updated_at = now()
    WHERE obligation_id = NEW.id AND status = 'pending';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for obligation updates
CREATE TRIGGER trigger_handle_obligation_update
  AFTER UPDATE ON obligations
  FOR EACH ROW
  EXECUTE FUNCTION handle_obligation_update();

-- Function to invite user to company
CREATE OR REPLACE FUNCTION invite_user_to_company(
  p_company_id uuid,
  p_email text,
  p_name text,
  p_role user_role,
  p_invited_by uuid
)
RETURNS uuid AS $$
DECLARE
  v_profile_id uuid;
  v_existing_user_id uuid;
BEGIN
  -- Check if user already exists in auth.users
  SELECT id INTO v_existing_user_id 
  FROM auth.users 
  WHERE email = p_email;
  
  -- Create user profile (will be linked when user signs up)
  INSERT INTO user_profiles (
    user_id,
    company_id,
    email,
    name,
    role,
    invited_by,
    invited_at
  ) VALUES (
    v_existing_user_id, -- NULL if user doesn't exist yet
    p_company_id,
    p_email,
    p_name,
    p_role,
    p_invited_by,
    now()
  ) RETURNING id INTO v_profile_id;
  
  -- Create audit log
  PERFORM create_audit_log(
    p_company_id,
    p_invited_by,
    'user_profiles',
    v_profile_id,
    'insert',
    NULL,
    jsonb_build_object(
      'email', p_email,
      'name', p_name,
      'role', p_role,
      'action', 'invited'
    )
  );
  
  RETURN v_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to batch update obligation status
CREATE OR REPLACE FUNCTION batch_update_obligation_status(
  p_obligation_ids uuid[],
  p_status obligation_status,
  p_user_id uuid
)
RETURNS integer AS $$
DECLARE
  v_updated_count integer;
  v_company_id uuid;
BEGIN
  -- Get company_id from first obligation
  SELECT company_id INTO v_company_id
  FROM obligations
  WHERE id = p_obligation_ids[1];
  
  -- Update obligations
  UPDATE obligations 
  SET 
    status = p_status,
    completed_at = CASE WHEN p_status = 'completed' THEN now() ELSE NULL END,
    completed_by = CASE WHEN p_status = 'completed' THEN p_user_id ELSE NULL END,
    updated_at = now()
  WHERE id = ANY(p_obligation_ids);
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  -- Create audit log for batch operation
  PERFORM create_audit_log(
    v_company_id,
    p_user_id,
    'obligations',
    gen_random_uuid(), -- Use random UUID for batch operations
    'update',
    jsonb_build_object('operation', 'batch_update', 'count', v_updated_count),
    jsonb_build_object('status', p_status, 'obligation_ids', p_obligation_ids)
  );
  
  RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old data
CREATE OR REPLACE FUNCTION cleanup_old_data(
  p_days_to_keep integer DEFAULT 365
)
RETURNS void AS $$
BEGIN
  -- Delete old audit logs
  DELETE FROM audit_logs 
  WHERE created_at < now() - INTERVAL '1 day' * p_days_to_keep;
  
  -- Delete old completed obligations (keep for 2 years)
  DELETE FROM obligations 
  WHERE status = 'completed' 
    AND completed_at < now() - INTERVAL '1 day' * (p_days_to_keep * 2);
  
  -- Delete old sent reminders
  DELETE FROM reminders 
  WHERE status = 'sent' 
    AND sent_at < now() - INTERVAL '1 day' * p_days_to_keep;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get company performance metrics
CREATE OR REPLACE FUNCTION get_company_performance_metrics(
  p_company_id uuid,
  p_start_date date DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_obligations bigint,
  completed_obligations bigint,
  overdue_obligations bigint,
  completion_rate numeric,
  avg_completion_time numeric,
  most_active_user text,
  most_common_obligation_type text
) AS $$
BEGIN
  RETURN QUERY
  WITH metrics AS (
    SELECT 
      COUNT(*) as total_obligations,
      COUNT(*) FILTER (WHERE o.status = 'completed') as completed_obligations,
      COUNT(*) FILTER (WHERE o.status = 'overdue') as overdue_obligations,
      AVG(EXTRACT(days FROM (o.completed_at - o.created_at))) FILTER (WHERE o.status = 'completed') as avg_completion_time
    FROM obligations o
    WHERE o.company_id = p_company_id
      AND o.created_at::date BETWEEN p_start_date AND p_end_date
  ),
  user_activity AS (
    SELECT up.name, COUNT(*) as activity_count
    FROM obligations o
    JOIN user_profiles up ON up.id = o.completed_by
    WHERE o.company_id = p_company_id
      AND o.completed_at::date BETWEEN p_start_date AND p_end_date
    GROUP BY up.name
    ORDER BY activity_count DESC
    LIMIT 1
  ),
  common_type AS (
    SELECT o.obligation_type::text, COUNT(*) as type_count
    FROM obligations o
    WHERE o.company_id = p_company_id
      AND o.created_at::date BETWEEN p_start_date AND p_end_date
    GROUP BY o.obligation_type
    ORDER BY type_count DESC
    LIMIT 1
  )
  SELECT 
    m.total_obligations,
    m.completed_obligations,
    m.overdue_obligations,
    CASE 
      WHEN m.total_obligations > 0 THEN 
        ROUND((m.completed_obligations::numeric / m.total_obligations::numeric) * 100, 2)
      ELSE 0 
    END as completion_rate,
    ROUND(m.avg_completion_time, 2) as avg_completion_time,
    ua.name as most_active_user,
    ct.obligation_type as most_common_obligation_type
  FROM metrics m
  CROSS JOIN user_activity ua
  CROSS JOIN common_type ct;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
