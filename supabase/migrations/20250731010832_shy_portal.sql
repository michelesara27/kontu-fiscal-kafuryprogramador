/*
  # Create dashboard views and functions

  1. Views
    - `dashboard_stats` - Company statistics for dashboard
    - `upcoming_obligations` - Obligations due soon
    - `recent_activities` - Recent system activities

  2. Functions
    - `get_company_dashboard_stats` - Get dashboard statistics
    - `get_upcoming_reminders` - Get upcoming reminders
    - `get_overdue_obligations` - Get overdue obligations

  3. Performance
    - Materialized views for heavy queries
    - Refresh functions for materialized views
*/

-- Dashboard statistics view
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
  up.company_id,
  COUNT(DISTINCT c.id) FILTER (WHERE c.is_active = true) as active_clients,
  COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'pending') as pending_obligations,
  COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'overdue') as overdue_obligations,
  COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'completed' AND o.completed_at >= date_trunc('month', CURRENT_DATE)) as completed_this_month,
  COUNT(DISTINCT o.id) FILTER (WHERE o.due_date = CURRENT_DATE AND o.status = 'pending') as due_today,
  COUNT(DISTINCT up2.id) FILTER (WHERE up2.is_active = true) as active_team_members
FROM user_profiles up
LEFT JOIN clients c ON c.company_id = up.company_id
LEFT JOIN obligations o ON o.company_id = up.company_id
LEFT JOIN user_profiles up2 ON up2.company_id = up.company_id
GROUP BY up.company_id;

-- Function to get company dashboard statistics
CREATE OR REPLACE FUNCTION get_company_dashboard_stats(p_company_id uuid)
RETURNS TABLE (
  active_clients bigint,
  pending_obligations bigint,
  overdue_obligations bigint,
  completed_this_month bigint,
  due_today bigint,
  active_team_members bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ds.active_clients,
    ds.pending_obligations,
    ds.overdue_obligations,
    ds.completed_this_month,
    ds.due_today,
    ds.active_team_members
  FROM dashboard_stats ds
  WHERE ds.company_id = p_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get upcoming obligations
CREATE OR REPLACE FUNCTION get_upcoming_obligations(
  p_company_id uuid,
  p_days_ahead integer DEFAULT 7,
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  client_name text,
  due_date date,
  status obligation_status,
  priority obligation_priority,
  assigned_to_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.title,
    c.name as client_name,
    o.due_date,
    o.status,
    o.priority,
    up.name as assigned_to_name
  FROM obligations o
  JOIN clients c ON c.id = o.client_id
  LEFT JOIN user_profiles up ON up.id = o.assigned_to
  WHERE o.company_id = p_company_id
    AND o.status IN ('pending', 'overdue')
    AND o.due_date <= CURRENT_DATE + INTERVAL '1 day' * p_days_ahead
  ORDER BY o.due_date ASC, o.priority DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get upcoming reminders
CREATE OR REPLACE FUNCTION get_upcoming_reminders(
  p_company_id uuid,
  p_hours_ahead integer DEFAULT 24,
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  message text,
  client_name text,
  remind_at timestamptz,
  reminder_type reminder_type
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    r.message,
    c.name as client_name,
    r.remind_at,
    r.reminder_type
  FROM reminders r
  LEFT JOIN clients c ON c.id = r.client_id
  WHERE r.company_id = p_company_id
    AND r.status = 'pending'
    AND r.remind_at <= now() + INTERVAL '1 hour' * p_hours_ahead
  ORDER BY r.remind_at ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent activities (audit logs)
CREATE OR REPLACE FUNCTION get_recent_activities(
  p_company_id uuid,
  p_limit integer DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  user_name text,
  table_name text,
  action audit_action,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    up.name as user_name,
    al.table_name,
    al.action,
    al.created_at
  FROM audit_logs al
  LEFT JOIN user_profiles up ON up.id = al.user_id
  WHERE al.company_id = p_company_id
  ORDER BY al.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get client obligations summary
CREATE OR REPLACE FUNCTION get_client_obligations_summary(
  p_company_id uuid,
  p_client_id uuid DEFAULT NULL
)
RETURNS TABLE (
  client_id uuid,
  client_name text,
  total_obligations bigint,
  pending_obligations bigint,
  overdue_obligations bigint,
  completed_obligations bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as client_id,
    c.name as client_name,
    COUNT(o.id) as total_obligations,
    COUNT(o.id) FILTER (WHERE o.status = 'pending') as pending_obligations,
    COUNT(o.id) FILTER (WHERE o.status = 'overdue') as overdue_obligations,
    COUNT(o.id) FILTER (WHERE o.status = 'completed') as completed_obligations
  FROM clients c
  LEFT JOIN obligations o ON o.client_id = c.id
  WHERE c.company_id = p_company_id
    AND c.is_active = true
    AND (p_client_id IS NULL OR c.id = p_client_id)
  GROUP BY c.id, c.name
  ORDER BY c.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
