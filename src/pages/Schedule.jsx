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

    // Group by day mock helper
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const groupedSchedule = days.map(day => ({
        day,
        lectures: schedule.filter(s => s.day_of_week === day).sort((a, b) => a.start_time.localeCompare(b.start_time))
    }));

    if (loading) return <div className="p-6">Loading schedule...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 uppercase tracking-tight">Teaching Timetable</h1>

            <div className="space-y-6">
                {groupedSchedule.map(({ day, lectures }) => (
                    <div key={day} className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{day}</h3>
                        </div>
                        {lectures.length === 0 ? (
                            <div className="px-4 py-4 text-sm text-gray-500">No lectures scheduled.</div>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {lectures.map(lecture => {
                                    // Check for conflicts within the current loaded schedule
                                    const conflict = schedule.find(s =>
                                        s.id !== lecture.id &&
                                        s.day_of_week === lecture.day_of_week &&
                                        s.room_no === lecture.room_no &&
                                        ((s.start_time >= lecture.start_time && s.start_time < lecture.end_time) ||
                                            (lecture.start_time >= s.start_time && lecture.start_time < s.end_time))
                                    );

                                    return (
                                        <li key={lecture.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center">
                                                        <span className="text-sm font-bold text-blue-700">
                                                            {lecture.subject_name}
                                                        </span>
                                                        {conflict && (
                                                            <div className="ml-3 group relative flex items-center">
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                                                    ⚠ Room Conflict
                                                                </span>
                                                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                                                                    Room {lecture.room_no} is also booked for another class during this time.
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="mt-1 flex flex-wrap items-center text-[10px] font-bold uppercase tracking-wider text-gray-400 gap-y-1">
                                                        <span className="text-blue-600">Sem {lecture.semester}</span>
                                                        <span className="mx-1.5 text-gray-300">|</span>
                                                        <span className="text-blue-600">Div {lecture.division}</span>
                                                        <span className="mx-1.5 text-gray-300">|</span>
                                                        <span>{lecture.subject_type || 'Theory'}</span>
                                                        <span className="mx-1.5 text-gray-300">|</span>
                                                        <span className="text-gray-600">{lecture.start_time?.slice(0, 5)} - {lecture.end_time?.slice(0, 5)}</span>
                                                        <span className="mx-1.5 text-gray-300">|</span>
                                                        <span>Strength: {lecture.batch_strength || '60'}</span>
                                                    </div>
                                                    <div className="mt-2 flex items-center text-sm font-bold text-gray-700">
                                                        <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-blue-500" />
                                                        {lecture.room_no}
                                                        {conflict && (
                                                            <span className="ml-3 inline-flex items-center text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 animate-pulse">
                                                                ⚠ Room Conflict Detected
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
