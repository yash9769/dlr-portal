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
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const groupedSchedule = days.map(day => ({
        day,
        lectures: schedule.filter(s => s.day_of_week === day).sort((a, b) => a.start_time.localeCompare(b.start_time))
    }));

    if (loading) return <div className="p-6">Loading schedule...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Weekly Schedule</h1>

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
                                {lectures.map(lecture => (
                                    <li key={lecture.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-blue-600">
                                                    {lecture.subject_name} ({lecture.subject_type})
                                                </span>
                                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                                    <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                    {lecture.start_time} - {lecture.end_time}
                                                    <span className="mx-2">|</span>
                                                    <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                    {lecture.room_no}
                                                    <span className="mx-2">|</span>
                                                    Sem {lecture.semester} - {lecture.division}
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
