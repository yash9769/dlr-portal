-- Add JSONB column for detailed student attendance
-- Run this in your Supabase SQL Editor

ALTER TABLE daily_lecture_records 
ADD COLUMN IF NOT EXISTS student_attendance JSONB;

-- Comment on column for clarity
COMMENT ON COLUMN daily_lecture_records.student_attendance IS 'Stores the full list of students with present/absent status { id, name, present }';
