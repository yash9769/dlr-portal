-- SECURITY HARDENING: RLS Policies for DLR System
-- Run this in your Supabase SQL Editor

-- 1. Reset existing policies on daily_lecture_records
DROP POLICY IF EXISTS "Faculty can insert records" ON daily_lecture_records;
DROP POLICY IF EXISTS "Faculty can view all records" ON daily_lecture_records;
DROP POLICY IF EXISTS "Faculty can update own records" ON daily_lecture_records;
DROP POLICY IF EXISTS "Faculty view own, Admin view all" ON daily_lecture_records;
DROP POLICY IF EXISTS "Faculty insert own DLR only" ON daily_lecture_records;
DROP POLICY IF EXISTS "Faculty update own DLR only" ON daily_lecture_records;

-- Reset NEW policies if rerunning
DROP POLICY IF EXISTS "drl_select_policy" ON daily_lecture_records;
DROP POLICY IF EXISTS "dlr_insert_policy" ON daily_lecture_records;
DROP POLICY IF EXISTS "dlr_update_policy" ON daily_lecture_records;
DROP POLICY IF EXISTS "dlr_delete_policy" ON daily_lecture_records;

-- 2. SELECT: Faculty see own entries, Admin/HOD see everything
CREATE POLICY "drl_select_policy" ON daily_lecture_records
FOR SELECT USING (
  auth.uid() = submitted_by 
  OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'hod')
  )
);

-- 3. INSERT: Users can only insert records where they are the submitter
CREATE POLICY "dlr_insert_policy" ON daily_lecture_records
FOR INSERT
WITH CHECK (
  auth.uid() = submitted_by
);

-- 4. UPDATE: Users can only update their own records
CREATE POLICY "dlr_update_policy" ON daily_lecture_records
FOR UPDATE
USING (
  auth.uid() = submitted_by
)
WITH CHECK (
  auth.uid() = submitted_by
);

-- 5. DELETE: Only Admins can delete records
CREATE POLICY "dlr_delete_policy" ON daily_lecture_records
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);
