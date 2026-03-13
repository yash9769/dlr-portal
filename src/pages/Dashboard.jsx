import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/useAuth';
import { Clock, MapPin, Settings, CheckCircle2, AlertCircle, CalendarDays, Activity, ChevronRight, User } from 'lucide-react';
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
                        yPendingCount = 0;
                    }
                    setYesterdayPending(yPendingCount);

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
        <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)]">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100 border-t-blue-600"></div>
            <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Warming up your dash...</p>
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
    const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'hod' || user?.email?.toLowerCase() === 'admin@vit.edu.in';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 animate-in fade-in duration-1000">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-widest border border-blue-100 shadow-sm">
                        <Activity className="h-3 w-3" />
                        <span>Intelligence Hub</span>
                    </div>
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                            <span className="text-gray-400 font-light">{greeting()},</span><br />
                            <span className="text-blue-600 font-black">{user?.full_name?.split(' ')[1] || 'Professor'}</span>
                        </h1>
                        <div className="mt-4 flex items-center text-gray-500 font-bold uppercase tracking-widest text-[10px] space-x-3">
                            <span className="flex items-center">
                                <CalendarDays className="h-3.5 w-3.5 mr-2 text-blue-500" />
                                {format(new Date(), 'EEEE, MMMM do')}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                            <span className="flex items-center">
                                <Activity className="h-3.5 w-3.5 mr-2 text-green-500" />
                                Live Status
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Progress Card */}
                    {schedule.length > 0 && (
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center gap-8 min-w-[320px] group hover:-translate-y-1 transition-all duration-500">
                            <div className="relative h-20 w-20 flex-shrink-0">
                                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                                    <circle className="text-gray-100" strokeWidth="2.5" stroke="currentColor" fill="transparent" r="16" cx="18" cy="18" />
                                    <circle
                                        className="text-blue-600 transition-all duration-1000 ease-out"
                                        strokeWidth="2.5"
                                        strokeDasharray={`${progress}, 100`}
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="16" cx="18" cy="18"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-gray-900">
                                    {Math.round(progress)}%
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Audit Progress</p>
                                <p className="text-3xl font-black text-gray-900 leading-none">
                                    {submittedCount} <span className="text-gray-400 font-light text-base">/ {schedule.length}</span>
                                </p>
                                <div className="mt-3 flex gap-1">
                                    {[...Array(schedule.length)].map((_, i) => (
                                        <div key={i} className={`h-1.5 flex-1 rounded-full ${i < submittedCount ? 'bg-blue-600' : 'bg-gray-100'}`}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Management Quick Link */}
                    {isAdmin && (
                        <button
                            onClick={() => navigate('/timetable')}
                            className="w-full sm:w-auto px-8 py-5 bg-gray-900 rounded-[1.5rem] text-[10px] font-black text-white uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-95 shadow-2xl shadow-gray-400 group flex items-center gap-4"
                        >
                            <Settings className="h-5 w-5 text-blue-400 group-hover:rotate-90 transition-transform duration-500" />
                            <span>System Admin</span>
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                        </button>
                    )}
                </div>
            </div>

            {/* Auto-Reminder Banner */}
            {yesterdayPending > 0 && (
                <div className="mb-12 p-1 bg-gradient-to-r from-orange-400 to-amber-500 rounded-[2rem] shadow-xl shadow-orange-100/50 animate-in fade-in slide-in-from-top-6 duration-700">
                    <div className="bg-white rounded-[1.9rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6 text-center sm:text-left">
                            <div className="bg-orange-100 p-4 rounded-2xl shrink-0 border border-orange-200 shadow-inner">
                                <AlertCircle className="h-8 w-8 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 leading-tight mb-1 uppercase italic tracking-tight">Pending Audits Detected</h3>
                                <p className="text-sm text-gray-500 font-medium">You have <span className="text-orange-600 font-black">{yesterdayPending} records</span> from previous sessions that require immediate attention.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/history')}
                            className="group shrink-0 px-8 py-4 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-black transition-all active:scale-95 flex items-center gap-3 shadow-xl"
                        >
                            Audit Archive
                            <ChevronRight className="h-4 w-4 text-orange-400 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            )}

            {/* Grid Section */}
            <div>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                        <div className="h-1 w-8 bg-blue-600 rounded-full"></div>
                        Today's Sessions
                    </h2>
                </div>

                {schedule.length === 0 ? (
                    <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-gray-100 shadow-sm animation-float">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-blue-100 shadow-inner">
                            <Clock className="h-10 w-10 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 uppercase italic tracking-tight leading-none mb-3">Clear Schedule</h3>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] max-w-sm mx-auto leading-relaxed">
                            No lectures assigned for today. Your workstation is synchronized and up-to-date.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {schedule.map((lecture) => (
                            <div key={lecture.id} className="group relative bg-white border border-gray-100 rounded-[2.5rem] p-8 hover:shadow-2xl hover:border-blue-200 transition-all duration-700 flex flex-col justify-between overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-1000 rotate-12">
                                    <Activity className="h-32 w-32" />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border flex items-center gap-1.5 ${lecture.statusColor}`}>
                                            <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse"></div>
                                            {lecture.status}
                                        </div>
                                        <div className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl uppercase tracking-widest flex items-center gap-2 shadow-sm">
                                            {lecture.semester}-{lecture.division}
                                            {lecture.batch && (
                                                <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded-lg text-[8px] border border-blue-400">
                                                    B{lecture.batch}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors tracking-tight">
                                        {lecture.subject_name}
                                    </h3>

                                    <div className="flex items-center gap-2 mb-8">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${lecture.subject_type?.toLowerCase() === 'lab' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                            {lecture.subject_type || 'Lecture'}
                                        </span>
                                    </div>

                                    <div className="space-y-4 mb-10">
                                        <div className="flex items-center gap-4 group/item">
                                            <div className="h-10 w-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-transparent group-hover/item:border-blue-100 group-hover/item:bg-white transition-all">
                                                <Clock className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Time Slot</p>
                                                <p className="text-sm font-black text-gray-900 tabular-nums lowercase">{lecture.start_time?.slice(0, 5)} - {lecture.end_time?.slice(0, 5)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 group/item">
                                            <div className="h-10 w-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-transparent group-hover/item:border-blue-100 group-hover/item:bg-white transition-all">
                                                <MapPin className="h-5 w-5 text-indigo-500" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Venue</p>
                                                <p className="text-sm font-black text-gray-900 tracking-tight uppercase">Room {lecture.room_no}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/entry/${lecture.id}`)}
                                    disabled={lecture.isLocked}
                                    className={`relative z-10 w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all overflow-hidden border-b-4 active:border-b-0 active:translate-y-1 ${lecture.status === 'Submitted' || lecture.status.includes('Locked')
                                        ? 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                                        : 'bg-blue-600 text-white border-blue-800 hover:bg-blue-700 shadow-xl shadow-blue-100'
                                        } ${lecture.isLocked ? 'opacity-50 cursor-not-allowed border-none translate-y-0' : ''}`}
                                >
                                    {lecture.status === 'Submitted' ? 'Update Entry' : lecture.isLocked ? 'Record Locked' : 'Capture Audit Now'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quote attribution */}
            <div className="mt-24 text-center border-t border-gray-100 pt-10">
                <div className="inline-flex items-center gap-4 px-6 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse">
                    <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                        VIT IT PORTAL • DIGITAL ACADEMIC COMPLIANCE v2.0
                    </p>
                    <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                </div>
            </div>
        </div>
    );
}

