-- Migration: Fix bug_reports RLS and profile join issues
-- Run this in Supabase SQL Editor to make admin-visible bugs work

BEGIN;

-- 1. Add proper profile reference column (matches profiles.id = auth.users.id)
ALTER TABLE bug_reports 
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- 2. Remove broken policies
DROP POLICY IF EXISTS "Users can view their own bug reports" ON bug_reports;
DROP POLICY IF EXISTS "Admins can view all bug reports" ON bug_reports;
DROP POLICY IF EXISTS "Admins can update bug reports" ON bug_reports;

-- 3. Corrected RLS policies (no broken joins)
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

-- Users INSERT own bugs
CREATE POLICY "Users insert own bugs" ON bug_reports 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users SELECT own bugs (direct auth.users reference)
CREATE POLICY "Users select own bugs" ON bug_reports 
FOR SELECT USING (auth.uid() = user_id);

-- Admins SELECT/UPDATE ALL bugs (profiles check only)
CREATE POLICY "Admins full access" ON bug_reports 
FOR ALL USING (
  auth.role() = 'authenticated' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'hod', 'administrator')
  )
);

-- 4. Backfill profile_id for existing records
UPDATE bug_reports 
SET profile_id = auth.users.id 
FROM auth.users 
WHERE bug_reports.user_id = auth.users.id;

COMMIT;

