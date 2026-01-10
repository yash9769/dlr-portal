import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { user } = useAuth();
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchSchedule() {
            setLoading(true);
            try {
                if (user?.email) {
                    // Logic: If faculty -> get assigned. If admin or unknown -> get all.
                    let facultyId = null;

                    // Only try to find faculty ID if we think we are faculty or if no role is set (default)
                    const { data: fac } = await api.faculty.list();
                    const found = fac?.find(f => f.email === user.email);
                    if (found) {
                        facultyId = found.id;
                    }

                    // DIAGNOSTIC FORCE FETCH
                    console.log('Fetching ALL timetable data for connection test...');
                    const { data: allData, error } = await api.timetable.getAll();

                    if (error) {
                        console.error('Supabase Error:', error);
                        alert(`Database Error: ${error.message}`);
                    }

                    const data = allData || [];

                    // Filter for "Today"
                    const today = new Date().toLocaleString('en-us', { weekday: 'long' });

                    let finalSchedule = data.filter(t => t.day_of_week === today);

                    // FALLBACK: If today empty, just show EVERYTHING so user sees *something*
                    if (finalSchedule.length === 0) {
                        console.warn('Today empty, using fallback');
                        finalSchedule = data;
                    }

                    setSchedule(finalSchedule);
                }
            } catch (err) {
                console.error(err);
                alert(`App Error: ${err.message}`);
            } finally {
                setLoading(false);
            }
        }
        fetchSchedule();
    }, [user]);

    if (loading) return <div className="p-6">Loading schedule...</div>;

    const todayDate = new Date().toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.full_name || user?.email}</h1>
            <p className="mt-1 text-sm text-gray-500 mb-2">Today is {todayDate}.</p>

            {/* DEBUG INFO */}
            <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                <strong>Debug Info:</strong> Logged in as: {user?.email} | Role: {user?.role || 'None'} <br />
                If you see no lectures, ensure your email matches a faculty entry in the database.
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
                <div className="p-5">
                    <div className="flex items-center">
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Total Lectures Today</dt>
                                <dd className="text-lg font-medium text-gray-900">{schedule.length}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Today's Schedule</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {schedule.length === 0 ? (
                        <li className="px-4 py-4 sm:px-6 text-gray-500 text-center">
                            No lectures scheduled for today ({new Date().toLocaleString('en-us', { weekday: 'long' })}).
                            <br />
                            <span className="text-xs text-gray-400">(Check "My Schedule" for other days)</span>
                        </li>
                    ) : (
                        schedule.map((lecture) => (
                            <li key={lecture.id}>
                                <div className="block hover:bg-gray-50">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-blue-600 truncate">
                                                {lecture.subject_name} ({lecture.subject_type})
                                            </p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Scheduled
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500 mr-6">
                                                    <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                    {lecture.start_time} - {lecture.end_time}
                                                </p>
                                                <p className="flex items-center text-sm text-gray-500 mr-6">
                                                    <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                    {lecture.room_no}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                <button
                                                    onClick={() => navigate(`/entry/${lecture.id}`)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                                                >
                                                    Fill DLR
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* DIAGNOSTIC PANEL - REMOVE LATER */}
            <div className="mt-8 p-4 bg-gray-900 text-green-400 rounded-lg overflow-auto font-mono text-xs">
                <h3 className="text-white font-bold mb-2">Diagnostic Data (Share this if empty)</h3>
                <div>
                    <strong>User:</strong> {user ? `${user.email} (${user.role})` : 'Not Logged In'}
                </div>
                <div className="mt-2">
                    <strong>Schedule Items Found:</strong> {schedule.length}
                </div>
                <div className="mt-2">
                    <strong>Raw Schedule Dump (First 3):</strong>
                    <pre>{JSON.stringify(schedule.slice(0, 3), null, 2)}</pre>
                </div>
            </div>
        </div>
    );
}
