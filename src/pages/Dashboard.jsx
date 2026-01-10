import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Clock, MapPin, Settings } from 'lucide-react';
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
                    const today = new Date().toISOString().split('T')[0];
                    let { schedule: daySchedule, records } = await api.dlr.getReportData(today);
                    const { data: approval } = await api.dlr.getApprovalStatus(today);

                    // ROLE ENFORCEMENT: Filter for Faculty
                    if (user.role === 'faculty') {
                        const { data: faculties } = await api.faculty.list();
                        const myFaculty = faculties.find(f => f.email === user.email);
                        if (myFaculty) {
                            daySchedule = daySchedule.filter(s => s.assigned_faculty_id === myFaculty.id);
                            records = records.filter(r => r.faculty_id === myFaculty.id);
                        } else {
                            daySchedule = [];
                            records = [];
                        }
                    }

                    // Combine schedule items with their records and calculate status
                    const enrichedSchedule = daySchedule.map(slot => {
                        const record = records.find(r => r.timetable_id === slot.id);
                        let status = 'Scheduled';
                        let statusColor = 'bg-blue-100 text-blue-800';

                        if (approval) {
                            status = 'Locked (Approved)';
                            statusColor = 'bg-gray-100 text-gray-800';
                        } else if (record) {
                            status = 'Submitted';
                            statusColor = 'bg-green-100 text-green-800';

                            // Check for conflict (same room, same time, different lecture)
                            const conflict = records.find(r =>
                                r.id !== record.id &&
                                r.room_no === record.room_no &&
                                ((r.actual_start_time >= record.actual_start_time && r.actual_start_time < record.actual_end_time) ||
                                    (record.actual_start_time >= r.actual_start_time && record.actual_start_time < r.actual_end_time))
                            );

                            if (conflict) {
                                status = 'Conflict Detected';
                                statusColor = 'bg-red-100 text-red-800';
                            }

                            if (record.remarks?.toLowerCase().includes('admin edit')) {
                                status = 'Edited by Admin';
                                statusColor = 'bg-yellow-100 text-yellow-800';
                            }
                        }

                        return { ...slot, record, status, statusColor, isLocked: !!approval };
                    });

                    setSchedule(enrichedSchedule);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchSchedule();
    }, [user]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading schedule...</span>
        </div>
    );

    const todayDate = new Date().toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.full_name || user?.email}</h1>
                    <p className="mt-1 text-sm text-gray-500">Today is {todayDate}.</p>
                </div>
                <div className="hidden sm:flex items-center space-x-3">
                    {(user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'hod' || user?.role?.toLowerCase() === 'administrator' || user?.email?.toLowerCase() === 'admin@vit.edu') && (
                        <button
                            onClick={() => navigate('/timetable')}
                            className="mr-4 inline-flex items-center px-4 py-2 border border-blue-600 shadow-sm text-[10px] font-bold uppercase tracking-widest rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-all active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)] border-b-2"
                        >
                            <Settings className="h-3.5 w-3.5 mr-2" />
                            Timetable Setup
                        </button>
                    )}
                    <div className="flex flex-col items-end mr-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Daily Summary</span>
                    </div>
                    <div className="flex space-x-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">
                            {schedule.filter(s => s.status === 'Scheduled').length} Pending
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-green-50 text-green-700 border border-green-100 shadow-sm">
                            {schedule.filter(s => s.status === 'Submitted' || s.status === 'Edited by Admin').length} Submitted
                        </span>
                        {schedule.some(s => s.status === 'Conflict Detected') && (
                            <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-100 shadow-sm animate-pulse">
                                {schedule.filter(s => s.status === 'Conflict Detected').length} Conflicts
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
                <ul className="divide-y divide-gray-200">
                    {schedule.length === 0 ? (
                        <li className="px-4 py-12 text-center">
                            <Clock className="mx-auto h-12 w-12 text-gray-300" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No lectures today</h3>
                            <p className="mt-1 text-sm text-gray-500">No lectures scheduled for {new Date().toLocaleString('en-us', { weekday: 'long' })}.</p>
                        </li>
                    ) : (
                        schedule.map((lecture) => (
                            <li key={lecture.id}>
                                <div className="block hover:bg-gray-50 transition-colors">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <p className="text-sm font-bold text-blue-600 truncate mr-3">
                                                    {lecture.subject_name}
                                                </p>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${lecture.statusColor}`}>
                                                    {lecture.status}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                Sem {lecture.semester} | Div {lecture.division} | {lecture.subject_type || 'Theory'}
                                            </div>
                                        </div>
                                        <div className="mt-3 sm:flex sm:justify-between items-end">
                                            <div className="sm:flex sm:space-x-6">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-blue-400" />
                                                    {lecture.start_time?.slice(0, 5)} - {lecture.end_time?.slice(0, 5)}
                                                </p>
                                                <p className="flex items-center text-sm text-gray-500 mt-1 sm:mt-0">
                                                    <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-blue-400" />
                                                    {lecture.room_no}
                                                </p>
                                            </div>
                                            <div className="mt-4 sm:mt-0">
                                                <button
                                                    onClick={() => navigate(`/entry/${lecture.id}`)}
                                                    disabled={lecture.status !== 'Scheduled' || lecture.isLocked}
                                                    className={`inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold uppercase tracking-wider rounded-md shadow-sm text-white transition-all
                                                        ${lecture.status === 'Scheduled' && !lecture.isLocked
                                                            ? 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                                                            : 'bg-gray-300 cursor-not-allowed opacity-60'
                                                        }`}
                                                >
                                                    {lecture.isLocked ? 'Locked' : (lecture.status === 'Scheduled' ? 'Submit Lecture Record' : 'Submitted')}
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
        </div>
    );
}
