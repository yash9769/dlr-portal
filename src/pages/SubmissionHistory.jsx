import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Clock, Calendar, CheckCircle2, History, Filter, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function SubmissionHistory() {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHistory() {
            setLoading(true);
            try {
                if (user?.email) {
                    // Fetch all records for this faculty
                    const { data: faculties } = await api.faculty.list();
                    const myFaculty = faculties.find(f => f.email === user.email);

                    if (myFaculty) {
                        const { data: records } = await api.dlr.listSubmissions();
                        // Filter for current faculty
                        const myRecords = records.filter(r => r.faculty_id === myFaculty.id);

                        // Sort by date descending
                        myRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
                        setHistory(myRecords);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchHistory();
    }, [user]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading history...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <History className="h-6 w-6 text-blue-600" />
                        Audit Submission History
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Review your past lecture capture and audit submissions.</p>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white shadow-sm">
                        <Filter className="h-4 w-4 text-gray-500" />
                    </button>
                </div>
            </div>

            {history.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
                    <History className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500">No submissions found in the records.</p>
                </div>
            ) : (
                <div className="bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date / Time</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">LC Status</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Attendance</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {history.map((record) => (
                                <tr key={record.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900">{format(new Date(record.date), 'dd MMM yyyy')}</span>
                                            <span className="text-[10px] text-gray-400 font-bold flex items-center">
                                                <Clock className="h-3 w-3 mr-1" /> {record.actual_start_time?.slice(0, 5)} - {record.actual_end_time?.slice(0, 5)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-blue-600">{record.subject_name || 'Lecture'}</span>
                                            <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Room {record.room_no}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        {record.lecture_capture_successful ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-green-50 text-green-700 border border-green-100 uppercase tracking-widest">
                                                Successful
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-gray-50 text-gray-500 border border-gray-100 uppercase tracking-widest">
                                                Not Enabled
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-black text-gray-700">{record.attendance_count || '0'}</span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest">
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
