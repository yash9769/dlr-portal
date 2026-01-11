import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Clock, MapPin, Settings, CheckCircle2, AlertCircle, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function Dashboard() {
    const { user } = useAuth();
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [yesterdayPending, setYesterdayPending] = useState(0);

    useEffect(() => {
        async function fetchSchedule() {
            setLoading(true);
            try {
                if (user?.email) {
                    const today = new Date().toISOString().split('T')[0];
                    let { schedule: daySchedule, records } = await api.dlr.getReportData(today);
                    const { data: approval } = await api.dlr.getApprovalStatus(today);

                    // --- NEW: YESTERDAY PENDING CHECK ---
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split('T')[0];
                    const { schedule: yestSchedule, records: yestRecords } = await api.dlr.getReportData(yesterdayStr);

                    let yPendingCount = 0;
                    if (user.role === 'faculty') {
                        const { data: faculties } = await api.faculty.list();
                        const myFaculty = faculties.find(f => f.email === user.email);
                        if (myFaculty) {
                            yPendingCount = yestSchedule.filter(s =>
                                s.assigned_faculty_id === myFaculty.id &&
                                !yestRecords.some(r => r.timetable_id === s.id)
                            ).length;

                            daySchedule = daySchedule.filter(s => s.assigned_faculty_id === myFaculty.id);
                            records = records.filter(r => r.faculty_id === myFaculty.id);
                        }
                    } else {
                        // For Admin/HOD, show today's stats only on dashboard
                        yPendingCount = 0;
                    }
                    setYesterdayPending(yPendingCount);

                    // Combine schedule items with their records and calculate status
                    const enrichedSchedule = daySchedule.map(slot => {
                        const record = records.find(r => r.timetable_id === slot.id);
                        let status = 'Scheduled';
                        let statusColor = 'bg-blue-50 text-blue-700 border-blue-100';

                        if (approval) {
                            status = 'Locked (Approved)';
                            statusColor = 'bg-gray-100 text-gray-800 border-gray-200';
                        } else if (record) {
                            status = 'Submitted';
                            statusColor = 'bg-green-50 text-green-700 border-green-100';

                            // Check for conflict
                            const conflict = records.find(r =>
                                r.id !== record.id &&
                                r.room_no === record.room_no &&
                                ((r.actual_start_time >= record.actual_start_time && r.actual_start_time < record.actual_end_time) ||
                                    (record.actual_start_time >= r.actual_start_time && record.actual_start_time < r.actual_end_time))
                            );

                            if (conflict) {
                                status = 'Conflict';
                                statusColor = 'bg-red-50 text-red-700 border-red-100';
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
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100 border-t-blue-600"></div>
            <p className="mt-4 text-gray-500 font-medium">Fetching your schedule...</p>
        </div>
    );

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const submittedCount = schedule.filter(s => s.status === 'Submitted' || s.status.includes('Locked')).length;
    const progress = schedule.length > 0 ? (submittedCount / schedule.length) * 100 : 0;

    const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'hod' || user?.email?.toLowerCase() === 'admin@vit.edu';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <span className="text-gray-400 font-light">{greeting()},</span>
                        <span className="text-blue-600">{user?.full_name?.split(' ')[1] || 'Professor'}</span>
                    </h1>
                    <div className="mt-2 flex items-center text-gray-500 font-medium">
                        <CalendarDays className="h-4 w-4 mr-2 text-blue-500" />
                        {format(new Date(), 'EEEE, MMMM do, yyyy')}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Progress Card */}
                    {schedule.length > 0 && (
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 min-w-[280px]">
                            <div className="relative h-14 w-14 flex-shrink-0">
                                <svg className="h-full w-full" viewBox="0 0 36 36">
                                    <circle className="text-gray-100" strokeWidth="3" stroke="currentColor" fill="transparent" r="16" cx="18" cy="18" />
                                    <circle
                                        className="text-blue-600 transition-all duration-1000"
                                        strokeWidth="3"
                                        strokeDasharray={`${progress}, 100`}
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="16" cx="18" cy="18"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-gray-900">
                                    {Math.round(progress)}%
                                </div>
                            </div>
                            <div className="flex-1 text-right">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Today's Audit</p>
                                <p className="text-xl font-black text-gray-900">
                                    {submittedCount} <span className="text-gray-400 font-light text-sm">/ {schedule.length}</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Management Quick Link */}
                    {isAdmin && (
                        <button
                            onClick={() => navigate('/timetable')}
                            className="hidden lg:inline-flex items-center px-6 py-3 bg-gray-900 border border-transparent rounded-xl text-xs font-bold text-white uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-gray-200"
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            Timetable Setup
                        </button>
                    )}
                </div>
            </div>

            {/* Auto-Reminder Banner */}
            {yesterdayPending > 0 && (
                <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-500 p-2 rounded-xl">
                            <AlertCircle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-orange-900">Audit Alert: Pending Records</p>
                            <p className="text-xs text-orange-700 font-medium">You have {yesterdayPending} unsubmitted lecture record{yesterdayPending > 1 ? 's' : ''} from yesterday.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/history')}
                        className="px-4 py-2 bg-orange-600 font-black text-[10px] text-white uppercase tracking-widest rounded-lg hover:bg-orange-700 transition-colors shadow-lg shadow-orange-100"
                    >
                        Resolve Now
                    </button>
                </div>
            )}

            {/* Grid Section */}
            {schedule.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 shadow-sm">
                    <div className="bg-blue-50 p-4 rounded-full mb-4">
                        <Clock className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No Lectures Scheduled</h3>
                    <p className="text-gray-500 mt-1 max-w-xs text-center">You have no lectures assigned for today. Time to catch up on research!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {schedule.map((lecture) => (
                        <div key={lecture.id} className="group relative bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-2xl hover:border-blue-200 transition-all duration-500 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${lecture.statusColor}`}>
                                        {lecture.status === 'Submitted' ? <CheckCircle2 className="h-3 w-3 mr-1.5" /> : null}
                                        {lecture.status === 'Conflict' ? <AlertCircle className="h-3 w-3 mr-1.5" /> : null}
                                        {lecture.status}
                                    </span>
                                    <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
                                        {lecture.semester} - {lecture.division}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                                    {lecture.subject_name}
                                </h3>

                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                                    {lecture.subject_type || 'Lecture'}
                                </p>

                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center text-sm font-semibold text-gray-600">
                                        <div className="bg-gray-50 p-2 rounded-lg mr-3">
                                            <Clock className="h-4 w-4 text-blue-500" />
                                        </div>
                                        {lecture.start_time?.slice(0, 5)} - {lecture.end_time?.slice(0, 5)}
                                    </div>
                                    <div className="flex items-center text-sm font-semibold text-gray-600">
                                        <div className="bg-gray-50 p-2 rounded-lg mr-3">
                                            <MapPin className="h-4 w-4 text-blue-500" />
                                        </div>
                                        {lecture.room_no}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/entry/${lecture.id}`)}
                                disabled={lecture.isLocked}
                                className={`group relative w-full py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all overflow-hidden ${lecture.status === 'Submitted' || lecture.status.includes('Locked')
                                        ? 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-white'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-100 hover:shadow-blue-200'
                                    } ${lecture.isLocked ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                            >
                                <span className="relative z-10">
                                    {lecture.status === 'Submitted' ? 'Update Audit' : lecture.isLocked ? 'Record Locked' : 'Record Audit Now'}
                                </span>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Mobile Admin Link */}
            {isAdmin && (
                <button
                    onClick={() => navigate('/timetable')}
                    className="lg:hidden w-full mt-10 inline-flex items-center justify-center px-6 py-4 bg-gray-900 border border-transparent rounded-2xl text-xs font-bold text-white uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95"
                >
                    <Settings className="h-4 w-4 mr-2" />
                    Management Console
                </button>
            )}

            {/* Quote attribution */}
            <div className="mt-20 text-center">
                <div className="inline-block p-1 px-4 bg-gray-50 rounded-full border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Official IT Audit Portal • Vidyalankar Institute of Technology
                    </p>
                </div>
            </div>
        </div>
    );
}
