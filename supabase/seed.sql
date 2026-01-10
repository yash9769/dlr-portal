-- Seed Data for DLR Portal

-- 1. Insert Faculty
INSERT INTO faculty (id, name, designation, department, email) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Amit Kumar', 'Assistant Professor', 'IT', 'amit.kumar@vit.edu.in'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Priya Sharma', 'Associate Professor', 'IT', 'priya.sharma@vit.edu.in'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Dr. John Doe', 'Professor', 'IT', 'john.doe@vit.edu.in');

-- 2. Insert Timetable (Sample for Monday)
INSERT INTO timetable (semester, division, batch_strength, subject_name, subject_type, day_of_week, start_time, end_time, room_no, assigned_faculty_id) VALUES
('VI', 'A', 60, 'Cloud Computing', 'IT', 'Monday', '10:00:00', '11:00:00', '504', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('VI', 'A', 60, 'Web Technology', 'IT', 'Monday', '11:00:00', '12:00:00', '504', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
('VI', 'A', 60, 'AI & ML', 'IT', 'Tuesday', '10:00:00', '11:00:00', '302', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

-- 3. Insert a DLR Record (Sample)
INSERT INTO daily_lecture_records (timetable_id, date, actual_start_time, actual_end_time, room_no, faculty_id, attendance_count, topic_covered, remarks, lecture_capture_status) 
SELECT 
  id, 
  CURRENT_DATE, 
  '10:00:00', 
  '11:00:00', 
  '504', 
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
  55, 
  'Intro to AWS', 
  'All good', 
  true
FROM timetable WHERE subject_name = 'Cloud Computing' LIMIT 1;
