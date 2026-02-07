import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import LectureEntryForm from './pages/LectureEntryForm';
import Schedule from './pages/Schedule';
import FacultyList from './pages/FacultyList';
import Reports from './pages/Reports';
import TimetableManager from './pages/TimetableManager';
import Profile from './pages/Profile';
import SubmissionHistory from './pages/SubmissionHistory';
import SystemInfo from './pages/SystemInfo';
import AttendanceTaker from './pages/AttendanceTaker';
import BugReports from './pages/BugReports';
import StudentMaster from './pages/StudentMaster';

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            {/* Common Routes (All Authenticated Users) */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/entry/:id" element={<LectureEntryForm />} />
                <Route path="/attendance/:id" element={<AttendanceTaker />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/history" element={<SubmissionHistory />} />
                <Route path="/system-info" element={<SystemInfo />} />
            </Route>

            {/* Admin/HOD Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'hod']}><Layout /></ProtectedRoute>}>
                <Route path="/timetable" element={<TimetableManager />} />
                <Route path="/faculty" element={<FacultyList />} />
                <Route path="/students" element={<StudentMaster />} />
                <Route path="/bugs" element={<BugReports />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
