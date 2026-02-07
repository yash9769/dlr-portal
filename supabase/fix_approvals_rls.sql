-- Fix RLS policies for report_approvals

-- 1. Drop all existing policies to clear confusion
DROP POLICY IF EXISTS "Everyone can view approvals" ON report_approvals;
DROP POLICY IF EXISTS "Only Admins/HODs can insert approvals" ON report_approvals;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON report_approvals;
DROP POLICY IF EXISTS "Allow select for authenticated users" ON report_approvals;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON report_approvals;

-- 2. Enable RLS
ALTER TABLE report_approvals ENABLE ROW LEVEL SECURITY;

-- 3. Policy: SELECT (Everyone can see)
CREATE POLICY "view_approvals"
ON report_approvals
FOR SELECT
TO authenticated
USING (true);

-- 4. Policy: INSERT (Admins/HODs only)
CREATE POLICY "insert_approvals"
ON report_approvals
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'hod')
  )
);

-- 5. Policy: UPDATE (Admins/HODs only)
CREATE POLICY "update_approvals"
ON report_approvals
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'hod')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'hod')
  )
);
