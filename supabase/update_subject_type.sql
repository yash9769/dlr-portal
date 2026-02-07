-- Migration: Update timetable subject_type constraint
-- Description: Allow Lecture, Lab, Tutorial, Project instead of just IT/Offered

ALTER TABLE timetable
DROP CONSTRAINT IF EXISTS timetable_subject_type_check;

ALTER TABLE timetable
ADD CONSTRAINT timetable_subject_type_check
CHECK (subject_type IN ('Lecture', 'Lab', 'Tutorial', 'Project', 'IT', 'Offered'));
