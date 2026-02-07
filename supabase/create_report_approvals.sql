-- Create the report_approvals table if it doesn't exist
CREATE TABLE IF NOT EXISTS report_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_date DATE NOT NULL UNIQUE,
    approved_by TEXT NOT NULL,
    approver_id UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ DEFAULT NOW(),
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE report_approvals ENABLE ROW LEVEL SECURITY;

-- Policies for report_approvals
DROP POLICY IF EXISTS "Everyone can view approvals" ON report_approvals;
CREATE POLICY "Everyone can view approvals"
ON report_approvals FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can insert approvals" ON report_approvals;
CREATE POLICY "Admins can insert approvals"
ON report_approvals FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'hod')
    )
);

DROP POLICY IF EXISTS "Admins can delete approvals" ON report_approvals;
CREATE POLICY "Admins can delete approvals"
ON report_approvals FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'hod')
    )
);

-- Ensure profiles table has correct policies too (just in case)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);
