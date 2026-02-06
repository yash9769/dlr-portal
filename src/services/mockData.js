import { addDays, startOfWeek } from 'date-fns';

export const MOCK_USERS = [
    {
        id: 'admin-1',
        email: 'admin@vit.edu',
        full_name: 'Department Admin',
        role: 'admin',
        department: 'Information Technology'
    },
    {
        id: 'fac-1',
        email: 'faculty@vit.edu',
        full_name: 'Amit Kumar',
        role: 'faculty',
        department: 'Information Technology'
    },
    {
        id: 'hod-1',
        email: 'hod@vit.edu',
        full_name: 'Dr. HOD',
        role: 'hod',
        department: 'Information Technology'
    }
];

export const MOCK_FACULTY = [
    { id: 'fac-1', name: 'Amit Kumar', designation: 'Assistant Professor', department: 'IT' },
    { id: 'fac-2', name: 'Priya Sharma', designation: 'Associate Professor', department: 'IT' },
    { id: 'fac-3', name: 'Dr. John Doe', designation: 'Professor', department: 'IT' }
];

export const MOCK_TIMETABLE = [
    {
        id: 'tt-1',
        semester: 'VI',
        division: 'A',
        subject_name: 'Cloud Computing',
        subject_type: 'IT',
        day_of_week: 'Monday',
        start_time: '10:00',
        end_time: '11:00',
        room_no: '504',
        assigned_faculty_id: 'fac-1'
    },
    {
        id: 'tt-2',
        semester: 'VI',
        division: 'A',
        subject_name: 'Web Technology',
        subject_type: 'IT',
        day_of_week: 'Monday',
        start_time: '11:00',
        end_time: '12:00',
        room_no: '504',
        assigned_faculty_id: 'fac-2'
    },
    {
        id: 'tt-3',
        semester: 'VI',
        division: 'A',
        subject_name: 'AI & ML',
        subject_type: 'IT',
        day_of_week: 'Tuesday',
        start_time: '10:00',
        end_time: '11:00',
        room_no: '302',
        assigned_faculty_id: 'fac-1'
    }
];

export const MOCK_DLR_RECORDS = []; // Will store in-memory submissions here
