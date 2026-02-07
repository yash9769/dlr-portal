-- Add weekend lectures for Prof. Ajitkumar Khachane (ARK)
-- ID: 00000000-0000-0000-0000-000000000001
-- Subject Type must be 'IT' or 'Offered'

-- Friday Lectures
INSERT INTO timetable (semester, division, batch_strength, subject_name, subject_type, day_of_week, start_time, end_time, room_no, assigned_faculty_id) VALUES
('V', 'A', 60, 'CNS', 'IT', 'Friday', '09:00:00', '10:00:00', '101', '00000000-0000-0000-0000-000000000001'),
('V', 'A', 20, 'CNS Lab', 'IT', 'Friday', '10:00:00', '11:00:00', 'L1', '00000000-0000-0000-0000-000000000001');

-- Saturday Lectures
INSERT INTO timetable (semester, division, batch_strength, subject_name, subject_type, day_of_week, start_time, end_time, room_no, assigned_faculty_id) VALUES
('VIII', 'A', 60, 'Project Guidance', 'IT', 'Saturday', '11:15:00', '12:15:00', 'L2', '00000000-0000-0000-0000-000000000001');
