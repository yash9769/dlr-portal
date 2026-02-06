-- Comprehensive Seed Data mirroring the VIT official PDF
-- Date context: 08-01-2026 (Thursday)

-- 1. CLear previous entries to avoid conflicts
TRUNCATE daily_lecture_records CASCADE;
TRUNCATE timetable CASCADE;
TRUNCATE faculty CASCADE;

-- 2. Insert Faculty based on Page 5 of PDF
INSERT INTO faculty (id, name, designation, department, email) VALUES
('00000000-0000-0000-0000-000000000001', 'Prof. Ajitkumar Khachane', 'Assistant Professor', 'IT', 'ark@vit.edu.in'),
('00000000-0000-0000-0000-000000000002', 'Prof. Akshay Loke', 'Assistant Professor', 'IT', 'avl@vit.edu'),
('00000000-0000-0000-0000-000000000003', 'Prof. Aniket Kundu', 'Assistant Professor', 'IT', 'ak@vit.edu'),
('00000000-0000-0000-0000-000000000004', 'Prof. Bhanu Tekwani', 'Assistant Professor', 'IT', 'bgt@vit.edu'),
('00000000-0000-0000-0000-000000000005', 'Prof. Debarati Ghosal', 'Assistant Professor', 'IT', 'dg@vit.edu'),
('00000000-0000-0000-0000-000000000006', 'Dr. Dilip Motwani', 'Professor', 'IT', 'dm@vit.edu'),
('00000000-0000-0000-0000-000000000007', 'Prof. Deepali Shrikhande', 'Assistant Professor', 'IT', 'dsj@vit.edu'),
('00000000-0000-0000-0000-000000000008', 'Prof. Dhanashree Tamhane', 'Assistant Professor', 'IT', 'dst@vit.edu'),
('00000000-0000-0000-0000-000000000009', 'Prof. Kanchan Dhuri', 'Assistant Professor', 'IT', 'kgd@vit.edu'),
('00000000-0000-0000-0000-000000000010', 'Prof. Neha Kudu', 'Assistant Professor', 'IT', 'nkr@vit.edu'),
('00000000-0000-0000-0000-000000000011', 'Prof. Pallavi Kharat', 'Assistant Professor', 'IT', 'pck@vit.edu'),
('00000000-0000-0000-0000-000000000012', 'Prof. Rasika Ransing', 'Assistant Professor', 'IT', 'rsr@vit.edu'),
('00000000-0000-0000-0000-000000000013', 'Prof. Shashikant Mahajan', 'Assistant Professor', 'IT', 'sm@vit.edu'),
('00000000-0000-0000-0000-000000000014', 'Prof. Santosh Tamboli', 'Assistant Professor', 'IT', 'st@vit.edu'),
('00000000-0000-0000-0000-000000000015', 'Dr. Sushopti Gawade', 'Associate Professor', 'IT', 'sdg@vit.edu'),
('00000000-0000-0000-0000-000000000016', 'Dr. Uday Kashid', 'Professor', 'IT', 'usk@vit.edu'),
('00000000-0000-0000-0000-000000000017', 'Prof. Varsha Bhosale', 'Assistant Professor', 'IT', 'vb@vit.edu'),
('00000000-0000-0000-0000-000000000018', 'Dr. Vidya Chitre', 'Professor & Head', 'IT', 'vdc@vit.edu'),
('00000000-0000-0000-0000-000000000019', 'Prof. Vinita Bhandiwad', 'Assistant Professor', 'IT', 'vvb@vit.edu'),
('00000000-0000-0000-0000-000000000020', 'Prof. Sampada Pawar', 'Assistant Professor', 'IT', 'sam@vit.edu');

-- 3. Insert Timetable matching Page 1 & 2 of PDF (Thursday)

-- SEM IV - DIV A
INSERT INTO timetable (semester, division, batch_strength, subject_name, subject_type, day_of_week, start_time, end_time, room_no, assigned_faculty_id) VALUES
('IV', 'A', 23, 'DBMS LAB', 'IT', 'Thursday', '09:00:00', '11:00:00', 'L07D', '00000000-0000-0000-0000-000000000017'),
('IV', 'A', 22, 'PY LAB', 'IT', 'Thursday', '09:00:00', '11:00:00', 'CC03', '00000000-0000-0000-0000-000000000011'),
('IV', 'A', 23, 'OS LAB', 'IT', 'Thursday', '09:00:00', '11:00:00', 'L07B', '00000000-0000-0000-0000-000000000012'),
('IV', 'A', 79, 'EM IV', 'IT', 'Thursday', '11:15:00', '13:15:00', 'E101', '00000000-0000-0000-0000-000000000016'),
('IV', 'A', 79, 'PY', 'IT', 'Thursday', '13:45:00', '15:45:00', 'E101', '00000000-0000-0000-0000-000000000011');

-- SEM VI - DIV A, B, C (Page 2)
INSERT INTO timetable (semester, division, batch_strength, subject_name, subject_type, day_of_week, start_time, end_time, room_no, assigned_faculty_id) VALUES
('VI', 'A', 80, 'SC', 'IT', 'Thursday', '09:00:00', '11:00:00', 'E201', '00000000-0000-0000-0000-000000000013'),
('VI', 'A', 38, 'DFE', 'IT', 'Thursday', '09:00:00', '11:00:00', 'E301', '00000000-0000-0000-0000-000000000010'),
('VI', 'A', 80, 'PGM', 'IT', 'Thursday', '11:15:00', '13:15:00', 'E201', '00000000-0000-0000-0000-000000000010'),
('VI', 'B', 25, 'DEVOPS LAB', 'IT', 'Thursday', '09:00:00', '11:00:00', 'CC02', '00000000-0000-0000-0000-000000000008'),
('VI', 'B', 26, 'SC LAB', 'IT', 'Thursday', '11:15:00', '13:15:00', 'L11A', '00000000-0000-0000-0000-000000000013'),
('VI', 'C', 27, 'CC LAB', 'IT', 'Thursday', '09:00:00', '11:00:00', 'L07E', '00000000-0000-0000-0000-000000000009');
