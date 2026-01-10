-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Extends Supabase Auth)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  role text check (role in ('admin', 'faculty', 'hod', 'student')) default 'faculty',
  department text default 'General',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Public read, User can update own
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile." on profiles for update using (auth.uid() = id);


-- 2. Faculty Table (Master List)
create table faculty (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  designation text,
  department text not null,
  email text unique, -- Optional link to auth user later
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Admin all, Others read-only
alter table faculty enable row level security;
create policy "Faculty list viewable by authenticated users" on faculty for select to authenticated using (true);
create policy "Admins can insert faculty" on faculty for insert to authenticated with check (true);
create policy "Admins can update faculty" on faculty for update to authenticated using (true);
create policy "Admins can delete faculty" on faculty for delete to authenticated using (true);


-- 3. Timetable Table (The "Truth" source)
create table timetable (
  id uuid default uuid_generate_v4() primary key,
  semester text not null, -- e.g., "IV", "VI"
  division text not null, -- e.g., "A", "B"
  batch_strength integer,
  subject_name text not null,
  subject_type text check (subject_type in ('IT', 'Offered')), -- Ownership
  day_of_week text not null, -- e.g., "Monday"
  start_time time not null,
  end_time time not null,
  room_no text not null,
  assigned_faculty_id uuid references faculty(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table timetable enable row level security;
create policy "Timetable viewable by authenticated users" on timetable for select to authenticated using (true);
create policy "Admins can insert timetable" on timetable for insert to authenticated with check (true);
create policy "Admins can update timetable" on timetable for update to authenticated using (true);
create policy "Admins can delete timetable" on timetable for delete to authenticated using (true);


-- 4. Daily Lecture Records (The actual entries)
create table daily_lecture_records (
  id uuid default uuid_generate_v4() primary key,
  timetable_id uuid references timetable(id), -- Link to original schedule
  date date not null default current_date,
  
  -- Actual Validation Fields
  actual_start_time time,
  actual_end_time time,
  room_no text not null,
  faculty_id uuid references faculty(id) not null, -- The faculty who *actually* took it
  
  -- Content
  topic_covered text,
  attendance_count integer,
  
  -- Flags
  lecture_capture_status boolean default false,
  smart_board_pdf_status boolean default false,
  
  -- Assignments (Simplified JSONB or separate columns)
  assignments_collected_last_week boolean default false,
  assignments_given_coming_week boolean default false,
  assignments_graded_previous_week boolean default false,
  
  remarks text,
  
  -- Meta
  submitted_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Constraints
  constraint attendance_positive check (attendance_count >= 0)
);

alter table daily_lecture_records enable row level security;
create policy "Faculty can insert records" on daily_lecture_records for insert to authenticated with check (true);
create policy "Faculty can view all records" on daily_lecture_records for select to authenticated using (true);
create policy "Faculty can update own records" on daily_lecture_records for update using (auth.uid() = submitted_by);


-- 5. Lecture Capture Logs (Auto-derived or separate entry if needed, but likely a view or derived from DLR)
-- For now, we'll keep it as a view for reporting, but if manual extra data needed:
create view lecture_capture_report as
select 
  dlr.id,
  dlr.date,
  dlr.room_no,
  t.semester,
  t.division,
  t.subject_name,
  f.name as faculty_name,
  dlr.actual_start_time,
  dlr.actual_end_time,
  dlr.lecture_capture_status,
  dlr.remarks
from daily_lecture_records dlr
join faculty f on dlr.faculty_id = f.id
left join timetable t on dlr.timetable_id = t.id
where dlr.lecture_capture_status = true;
