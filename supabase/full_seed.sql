-- COMPREHENSIVE VIT IT TIMETABLE (MON-SAT, 9 AM - 6 PM)
-- Includes full Thursday data for Sem 4 & Sem 6 based on official DLR PDF.

-- 1. Cleanup
TRUNCATE daily_lecture_records CASCADE;
TRUNCATE timetable CASCADE;
TRUNCATE faculty CASCADE;

-- 2. Faculty Setup (Standard UUIDs for reliability)
INSERT INTO faculty (id, name, designation, department, email, photo_url) VALUES
('00000000-0000-0000-0000-000000000001', 'Prof. Ajitkumar Khachane', 'Assistant Professor', 'IT', 'ark@vit.edu.in', '/ark.png'),
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

-- 3. Thursday Timetable (Exact replica of the PDF data)

-- SEM IV - Thursday
INSERT INTO timetable (semester, division, batch_strength, subject_name, subject_type, day_of_week, start_time, end_time, room_no, assigned_faculty_id) VALUES
('IV', 'A', 23, 'DBMS LAB', 'IT', 'Thursday', '09:00:00', '11:00:00', 'L07D', '00000000-0000-0000-0000-000000000017'),
('IV', 'A', 22, 'PY LAB', 'IT', 'Thursday', '09:00:00', '11:00:00', 'CC03', '00000000-0000-0000-0000-000000000011'),
('IV', 'A', 23, 'OS LAB', 'IT', 'Thursday', '09:00:00', '11:00:00', 'L07B', '00000000-0000-0000-0000-000000000012'),
('IV', 'A', 79, 'EM IV', 'IT', 'Thursday', '11:15:00', '13:15:00', 'E101', '00000000-0000-0000-0000-000000000016'),
('IV', 'A', 79, 'PY', 'IT', 'Thursday', '13:45:00', '15:45:00', 'E101', '00000000-0000-0000-0000-000000000011'),
('IV', 'B', 74, 'AT', 'IT', 'Thursday', '09:00:00', '11:00:00', 'E303', '00000000-0000-0000-0000-000000000014'),
('IV', 'B', 22, 'DBMS LAB', 'IT', 'Thursday', '11:15:00', '13:15:00', 'L07D', '00000000-0000-0000-0000-000000000002'),
('IV', 'B', 21, 'PY LAB', 'IT', 'Thursday', '11:15:00', '13:15:00', 'CC03', '00000000-0000-0000-0000-000000000011'),
('IV', 'B', 23, 'OS LAB', 'IT', 'Thursday', '11:15:00', '13:15:00', 'L07B', '00000000-0000-0000-0000-000000000012'),
('IV', 'B', 74, 'EM IV', 'IT', 'Thursday', '13:45:00', '15:45:00', 'E204', '00000000-0000-0000-0000-000000000016'),
('IV', 'C', 22, 'CN LAB', 'IT', 'Thursday', '09:00:00', '11:00:00', 'L11A', '00000000-0000-0000-0000-000000000019'),
('IV', 'C', 22, 'DBMS LAB', 'IT', 'Thursday', '09:00:00', '11:00:00', 'L07A', '00000000-0000-0000-0000-000000000018'),
('IV', 'C', 23, 'PY LAB', 'IT', 'Thursday', '09:00:00', '11:00:00', 'L11B', '00000000-0000-0000-0000-000000000004'),
('IV', 'C', 74, 'AT', 'IT', 'Thursday', '11:15:00', '13:15:00', 'E301', '00000000-0000-0000-0000-000000000014'),
('IV', 'C', 74, 'OS', 'IT', 'Thursday', '13:45:00', '15:45:00', 'E301', '00000000-0000-0000-0000-000000000012');

-- SEM VI - Thursday
INSERT INTO timetable (semester, division, batch_strength, subject_name, subject_type, day_of_week, start_time, end_time, room_no, assigned_faculty_id) VALUES
('VI', 'A', 80, 'SC', 'IT', 'Thursday', '09:00:00', '11:00:00', 'E201', '00000000-0000-0000-0000-000000000013'),
('VI', 'A', 38, 'DFE', 'IT', 'Thursday', '09:00:00', '11:00:00', 'E301', '00000000-0000-0000-0000-000000000010'),
-- SATURDAY
('VI', 'A', 80, 'Library Hour', 'IT', 'Saturday', '09:30:00', '11:30:00', 'LIB', '00000000-0000-0000-0000-000000000018'),
('VI', 'A', 80, 'Placement Training', 'IT', 'Saturday', '11:45:00', '13:45:00', 'AUDI', '00000000-0000-0000-0000-000000000020'),
('VI', 'A', 80, 'Soft Skills', 'IT', 'Saturday', '14:30:00', '16:30:00', 'AUDI', '00000000-0000-0000-0000-000000000020'),
('IV', 'A', 80, 'Skill Development', 'IT', 'Saturday', '09:00:00', '11:00:00', 'E101', '00000000-0000-0000-0000-000000000001'),
('IV', 'B', 74, 'Tech Talk', 'IT', 'Saturday', '11:15:00', '13:15:00', 'AUDI', '00000000-0000-0000-0000-000000000006'),
('IV', 'C', 74, 'Aptitude Test', 'IT', 'Saturday', '14:00:00', '16:00:00', 'E301', '00000000-0000-0000-0000-000000000012'),
('VI', 'A', 34, 'SSEH', 'IT', 'Thursday', '09:00:00', '11:00:00', 'E204', '00000000-0000-0000-0000-000000000006'),
('VI', 'A', 80, 'PGM', 'IT', 'Thursday', '11:15:00', '13:15:00', 'E201', '00000000-0000-0000-0000-000000000010'),
('VI', 'A', 27, 'SC LAB', 'IT', 'Thursday', '13:45:00', '15:45:00', 'L07B', '00000000-0000-0000-0000-000000000013'),
('VI', 'A', 27, 'CC LAB', 'IT', 'Thursday', '13:45:00', '15:45:00', 'L11B', '00000000-0000-0000-0000-000000000009'),
('VI', 'A', 17, 'STQA LAB', 'IT', 'Thursday', '13:45:00', '15:45:00', 'L07C', '00000000-0000-0000-0000-000000000007'),
('VI', 'B', 25, 'DEVOPS LAB', 'IT', 'Thursday', '09:00:00', '11:00:00', 'CC02', '00000000-0000-0000-0000-000000000008'),
('VI', 'B', 26, 'SC LAB', 'IT', 'Thursday', '11:15:00', '13:15:00', 'L11A', '00000000-0000-0000-0000-000000000013'),
('VI', 'B', 25, 'STQA LAB', 'IT', 'Thursday', '11:15:00', '13:15:00', 'L07E', '00000000-0000-0000-0000-000000000007'),
('VI', 'B', 14, 'PGM LAB', 'IT', 'Thursday', '11:15:00', '13:15:00', 'L07A', '00000000-0000-0000-0000-000000000005'),
('VI', 'B', 25, 'PGM LAB', 'IT', 'Thursday', '13:45:00', '15:45:00', 'L11A', '00000000-0000-0000-0000-000000000010'),
('VI', 'C', 27, 'CC LAB', 'IT', 'Thursday', '09:00:00', '11:00:00', 'L07E', '00000000-0000-0000-0000-000000000009'),
('VI', 'C', 26, 'STQA LAB', 'IT', 'Thursday', '09:00:00', '11:00:00', 'L07C', '00000000-0000-0000-0000-000000000007'),
('VI', 'C', 27, 'DEVOPS LAB', 'IT', 'Thursday', '11:15:00', '13:15:00', 'CC02', '00000000-0000-0000-0000-000000000008'),
('VI', 'C', 27, 'CC LAB', 'IT', 'Thursday', '11:15:00', '13:15:00', 'L11B', '00000000-0000-0000-0000-000000000009'),
('VI', 'C', 26, 'STQA LAB', 'IT', 'Thursday', '13:45:00', '15:45:00', 'L07A', '00000000-0000-0000-0000-000000000015');

-- 4. Comprehensive Schedule for Remaining Weekdays (Mon, Tue, Wed, Fri) and Conflicts

INSERT INTO timetable (semester, division, batch_strength, subject_name, subject_type, day_of_week, start_time, end_time, room_no, assigned_faculty_id) VALUES
-- MONDAY
('IV', 'A', 79, 'EM IV', 'IT', 'Monday', '09:00:00', '11:00:00', 'E101', '00000000-0000-0000-0000-000000000016'),
('IV', 'A', 79, 'OS', 'IT', 'Monday', '11:15:00', '13:15:00', 'E101', '00000000-0000-0000-0000-000000000012'),
('VI', 'A', 80, 'SC', 'IT', 'Monday', '09:00:00', '11:00:00', 'E201', '00000000-0000-0000-0000-000000000013'),
('VI', 'A', 80, 'CC', 'IT', 'Monday', '11:15:00', '13:15:00', 'E201', '00000000-0000-0000-0000-000000000009'),
('IV', 'B', 74, 'AT', 'IT', 'Monday', '09:00:00', '11:00:00', 'E204', '00000000-0000-0000-0000-000000000014'),
('IV', 'B', 74, 'PY', 'IT', 'Monday', '11:15:00', '13:15:00', 'E204', '00000000-0000-0000-0000-000000000011'),

-- TUESDAY (Includes ROOM CONFLICT at 09:00 in E101)
('IV', 'A', 79, 'PY', 'IT', 'Tuesday', '09:00:00', '11:00:00', 'E101', '00000000-0000-0000-0000-000000000011'),
('VI', 'A', 80, 'PGM', 'IT', 'Tuesday', '09:00:00', '11:00:00', 'E101', '00000000-0000-0000-0000-000000000010'), -- CONFLICT: Same room E101 as IV-A
('IV', 'B', 74, 'OS', 'IT', 'Tuesday', '11:15:00', '13:15:00', 'E204', '00000000-0000-0000-0000-000000000012'),
('VI', 'B', 80, 'DFE', 'IT', 'Tuesday', '11:15:00', '13:15:00', 'E301', '00000000-0000-0000-0000-000000000010'),

-- WEDNESDAY (Includes PROFESSOR CONFLICT at 11:15 with Dr. Uday Kashid)
('IV', 'A', 79, 'AT', 'IT', 'Wednesday', '09:00:00', '11:00:00', 'E101', '00000000-0000-0000-0000-000000000014'),
('VI', 'A', 80, 'CN', 'IT', 'Wednesday', '09:00:00', '11:00:00', 'E201', '00000000-0000-0000-0000-000000000019'),
('IV', 'B', 74, 'EM IV', 'IT', 'Wednesday', '11:15:00', '13:15:00', 'E101', '00000000-0000-0000-0000-000000000016'), -- Prof Uday Kashid
('VI', 'B', 80, 'Ethics', 'IT', 'Wednesday', '11:15:00', '13:15:00', 'E303', '00000000-0000-0000-0000-000000000016'), -- CONFLICT: Same Prof Uday Kashid

-- FRIDAY
('IV', 'A', 79, 'CN LAB', 'IT', 'Friday', '09:00:00', '11:00:00', 'L11A', '00000000-0000-0000-0000-000000000019'),
('VI', 'A', 80, 'STQA', 'IT', 'Friday', '09:00:00', '11:00:00', 'E201', '00000000-0000-0000-0000-000000000007'),
('IV', 'B', 74, 'DBMS', 'IT', 'Friday', '11:15:00', '13:15:00', 'E204', '00000000-0000-0000-0000-000000000017'),
('VI', 'B', 80, 'CC', 'IT', 'Friday', '11:15:00', '13:15:00', 'E301', '00000000-0000-0000-0000-000000000009'),

-- SUNDAY (Workshops/Extra)
('IV', 'A', 80, 'Workshop on GenAI', 'IT', 'Sunday', '10:00:00', '13:00:00', 'AUDI', '00000000-0000-0000-0000-000000000006'),
('VI', 'B', 74, 'Industry Expert Talk', 'IT', 'Sunday', '11:00:00', '13:00:00', 'E303', '00000000-0000-0000-0000-000000000018');

-- 4.1. Specific Schedule for Prof. Ajitkumar Khachane (ARK) - For Demo
INSERT INTO timetable (semester, division, batch_strength, subject_name, subject_type, day_of_week, start_time, end_time, room_no, assigned_faculty_id) VALUES
('IV', 'A', 80, 'Java Programming', 'IT', 'Monday', '14:00:00', '16:00:00', 'CC02', '00000000-0000-0000-0000-000000000001'),
('VI', 'B', 74, 'Web Technology', 'IT', 'Wednesday', '09:00:00', '11:00:00', 'E204', '00000000-0000-0000-0000-000000000001'),
('IV', 'B', 74, 'Java Lab', 'IT', 'Friday', '14:00:00', '16:00:00', 'L07C', '00000000-0000-0000-0000-000000000001');

-- 5. Filled Daily Lecture Records (Simulating Faculty Submissions for Friday 16/01/2026)
-- We insert records linking to the Friday timetable entries we created above.

DO $$
DECLARE
    -- Faculty IDs (matching the UUIDs inserted in Step 2)
    fid_vb_19 uuid := '00000000-0000-0000-0000-000000000019'; -- Prof. Vinita Bhandiwad (VB)
    fid_ds_07 uuid := '00000000-0000-0000-0000-000000000007'; -- Prof. Deepali Shrikhande (DS)
    fid_vb_17 uuid := '00000000-0000-0000-0000-000000000017'; -- Prof. Varsha Bhosale (VB)
    fid_kd_09 uuid := '00000000-0000-0000-0000-000000000009'; -- Prof. Kanchan Dhuri (KD)
    
    -- Timetable IDs
    tid_iv_a_cn uuid;
    tid_vi_a_stqa uuid;
    tid_iv_b_dbms uuid;
    tid_vi_b_cc uuid;
BEGIN
    -- 1. Get Timetable IDs for Friday Classes
    -- IV-A, CN LAB, 09:00-11:00
    SELECT id INTO tid_iv_a_cn FROM timetable WHERE day_of_week = 'Friday' AND semester = 'IV' AND division = 'A' AND subject_name = 'CN LAB' LIMIT 1;
    
    -- VI-A, STQA, 09:00-11:00
    SELECT id INTO tid_vi_a_stqa FROM timetable WHERE day_of_week = 'Friday' AND semester = 'VI' AND division = 'A' AND subject_name = 'STQA' LIMIT 1;
    
    -- IV-B, DBMS, 11:15-13:15
    SELECT id INTO tid_iv_b_dbms FROM timetable WHERE day_of_week = 'Friday' AND semester = 'IV' AND division = 'B' AND subject_name = 'DBMS' LIMIT 1;
    
    -- VI-B, CC, 11:15-13:15
    SELECT id INTO tid_vi_b_cc FROM timetable WHERE day_of_week = 'Friday' AND semester = 'VI' AND division = 'B' AND subject_name = 'CC' LIMIT 1;

    -- 2. Insert DLRs (Date: 2026-01-16)
    
    -- Record 1: IV-A CN LAB (Prof VB - Vinita)
    INSERT INTO daily_lecture_records (
        timetable_id, date, actual_start_time, actual_end_time, room_no, faculty_id, 
        topic_covered, attendance_count, lecture_capture_status, submitted_by
    ) VALUES (
        tid_iv_a_cn, '2026-01-16', '09:00:00', '11:00:00', 'L11A', fid_vb_19,
        'Network Layer Protocols', 22, false, null
    );

    -- Record 2: VI-A STQA (Prof DS)
    INSERT INTO daily_lecture_records (
        timetable_id, date, actual_start_time, actual_end_time, room_no, faculty_id, 
        topic_covered, attendance_count, lecture_capture_status, submitted_by
    ) VALUES (
        tid_vi_a_stqa, '2026-01-16', '09:00:00', '11:00:00', 'E201', fid_ds_07,
        'Black Box Testing Techniques', 75, true, null
    );

    -- Record 3: IV-B DBMS (Prof VB - Varsha)
    INSERT INTO daily_lecture_records (
        timetable_id, date, actual_start_time, actual_end_time, room_no, faculty_id, 
        topic_covered, attendance_count, lecture_capture_status, submitted_by
    ) VALUES (
        tid_iv_b_dbms, '2026-01-16', '11:15:00', '13:15:00', 'E204', fid_vb_17,
        'Normalization Forms (1NF, 2NF)', 70, true, null
    );

    -- Record 4: VI-B CC (Prof KD)
    INSERT INTO daily_lecture_records (
        timetable_id, date, actual_start_time, actual_end_time, room_no, faculty_id, 
        topic_covered, attendance_count, lecture_capture_status, submitted_by
    ) VALUES (
        tid_vi_b_cc, '2026-01-16', '11:15:00', '13:15:00', 'E301', fid_kd_09,
        'Virtualization Types', 78, true, null
    );

END $$;
