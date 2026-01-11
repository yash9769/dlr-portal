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

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/entry/:id" element={<LectureEntryForm />} />
                <Route path="/faculty" element={<FacultyList />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/timetable" element={<TimetableManager />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/history" element={<SubmissionHistory />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}
