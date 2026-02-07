import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, MapPin } from 'lucide-react';

export default function Schedule() {
    const { user } = useAuth();
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSchedule() {
            if (user?.email) {
                // Lookup faculty ID by email to match Timetable
                let facultyId = null;
                if (user.role === 'faculty') {
                    const { data: fac } = await api.faculty.list();
                    const found = fac?.find(f => f.email === user.email);
                    facultyId = found ? found.id : null;
                }

                const { data } = facultyId
                    ? await api.timetable.getByFaculty(facultyId)
                    : await api.timetable.getAll();

                setSchedule(data || []);
            }
            setLoading(false);
        }
        fetchSchedule();
    }, [user]);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Generate time slots (rows) - find min and max times or use standard hours
    const timeSlots = [
        '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
    ];

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600"></div>
            <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">Loading Master Timetable...</p>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">
                        Visual <span className="text-blue-600">Timetable</span>
                    </h1>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">
                        {user.role === 'faculty' ? `Assigned Schedule: ${user.full_name}` : 'IT Department Master Schedule'}
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        Theory
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-black uppercase">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        Lab
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-50 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="p-6 sticky left-0 z-20 bg-gray-50 border-r border-gray-100 min-w-[120px]">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time / Day</div>
                                </th>
                                {days.map(day => (
                                    <th key={day} className="p-6 min-w-[240px]">
                                        <div className="text-sm font-black text-gray-900 uppercase tracking-tight">{day}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {timeSlots.map((time, timeIdx) => (
                                <tr key={time} className="group hover:bg-gray-50/30 transition-colors">
                                    <td className="p-6 sticky left-0 z-20 bg-white group-hover:bg-gray-50 text-center border-r border-gray-100">
                                        <div className="text-sm font-black text-gray-900 tabular-nums">{time}</div>
                                        <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase">to {timeSlots[timeIdx + 1] || '18:00'}</div>
                                    </td>
                                    {days.map(day => {
                                        const lectures = schedule.filter(s =>
                                            s.day_of_week === day &&
                                            s.start_time?.startsWith(time.split(':')[0])
                                        );

                                        return (
                                            <td key={`${day}-${time}`} className="p-3 min-w-[240px] align-top relative">
                                                {lectures.length > 0 ? (
                                                    <div className={`grid ${lectures.length > 1 ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'} gap-3`}>
                                                        {lectures.map(lecture => (
                                                            <div
                                                                key={lecture.id}
                                                                className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] hover:shadow-xl active:scale-95 cursor-pointer flex flex-col gap-3 ${(lecture.subject_type || '').toLowerCase().includes('lab')
                                                                    ? 'bg-green-50/50 border-green-100 hover:border-green-300'
                                                                    : 'bg-blue-50/50 border-blue-100 hover:border-blue-300'
                                                                    }`}
                                                            >
                                                                <div className="flex justify-between items-start gap-2">
                                                                    <h4 className="text-sm font-black text-gray-900 leading-tight">
                                                                        {lecture.subject_name}
                                                                    </h4>
                                                                    <div className="flex flex-col">
                                                                        <span className={`text-[10px] px-2 py-0.5 rounded-lg font-black uppercase w-fit mb-1 ${(lecture.subject_type || '').toLowerCase().includes('lab')
                                                                            ? 'bg-green-200 text-green-800'
                                                                            : 'bg-blue-200 text-blue-800'
                                                                            }`}>
                                                                            {lecture.semester} - {lecture.division}
                                                                        </span>
                                                                        {lecture.batch && (
                                                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">
                                                                                Batch {lecture.batch}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-wrap gap-2">
                                                                    <div className="flex items-center text-[10px] font-bold text-gray-600">
                                                                        <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                                                                        {lecture.room_no}
                                                                    </div>
                                                                    <div className="flex items-center text-[10px] font-bold text-gray-600">
                                                                        <Clock className="h-3 w-3 mr-1 text-gray-400" />
                                                                        {lecture.start_time?.slice(0, 5)}
                                                                    </div>
                                                                </div>

                                                                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                                                                    <div className="flex items-center">
                                                                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[8px] font-black text-gray-500 mr-1.5 ring-2 ring-white">
                                                                            {(lecture.assigned_faculty?.name || 'U').charAt(0)}
                                                                        </div>
                                                                        <span className="text-[10px] font-black text-gray-700 truncate max-w-[100px]">
                                                                            {lecture.assigned_faculty?.name || 'Unassigned'}
                                                                        </span>
                                                                    </div>
                                                                    {/* Indicators for multi-hour lectures */}
                                                                    {lecture.end_time?.split(':')[0] - lecture.start_time?.split(':')[0] > 1 && (
                                                                        <span className="text-[8px] bg-gray-900 text-white px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">
                                                                            Extended
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="h-full min-h-[100px] flex items-center justify-center border-2 border-dashed border-gray-50 rounded-2xl group-hover:border-gray-100 transition-colors">
                                                        {/* Empty Slot */}
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Print / Legend Footer */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-gray-900 rounded-3xl text-white shadow-2xl">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/20"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">Theory Session</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/20"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-200">Lab Practice</span>
                    </div>
                </div>
                <button
                    onClick={() => window.print()}
                    className="w-full sm:w-auto px-6 py-2 bg-white/10 hover:bg-white text-white hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/20"
                >
                    Print Timetable
                </button>
            </div>
        </div>
    );
}
