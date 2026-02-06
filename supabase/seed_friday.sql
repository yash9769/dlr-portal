-- Add Friday Lectures for active visibility
INSERT INTO timetable (semester, division, batch_strength, subject_name, subject_type, day_of_week, start_time, end_time, room_no, assigned_faculty_id) 
SELECT 'VI', 'A', 60, 'DevOps', 'IT', 'Friday', '10:00:00', '11:00:00', '504', id 
FROM faculty WHERE email = 'amit.kumar@vit.edu.in';

INSERT INTO timetable (semester, division, batch_strength, subject_name, subject_type, day_of_week, start_time, end_time, room_no, assigned_faculty_id) 
SELECT 'VI', 'B', 60, 'Cyber Security', 'IT', 'Friday', '11:00:00', '12:00:00', '302', id 
FROM faculty WHERE email = 'amit.kumar@vit.edu.in';
