import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Clock, Calendar, CheckCircle2, History, Filter, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function SubmissionHistory() {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilter, setShowFilter] = useState(false);
    const [filterDate, setFilterDate] = useState('');

    useEffect(() => {
        async function fetchHistory() {
            setLoading(true);
            try {
                if (user?.id) {
                    const { data: records } = await api.dlr.listSubmissions();

                    // Filter for records submitted by the current user
                    // This ensures "My History" is accurate regardless of role or faculty mapping
                    const myRecords = records.filter(r => r.submitted_by === user.id);

                    // Sort by date descending
                    myRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setHistory(myRecords);
                    setFilteredHistory(myRecords);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchHistory();
    }, [user]);

    useEffect(() => {
        if (!filterDate) {
            setFilteredHistory(history);
        } else {
            setFilteredHistory(history.filter(r => r.date === filterDate));
        }
    }, [filterDate, history]);

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
                <div className="flex gap-2 relative">
                    {showFilter && (
                        <input
                            type="date"
                            className="text-xs p-2 border border-gray-200 rounded-lg shadow-sm"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    )}
                    <button
                        onClick={() => setShowFilter(!showFilter)}
                        className={`p-2 border rounded-lg hover:bg-gray-50 shadow-sm transition-colors ${showFilter ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-500'}`}
                    >
                        <Filter className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {filteredHistory.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
                    <History className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500">No submissions found in the records.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredHistory.map((record) => (
                        <div key={record.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                            {/* Status Indicator Strip */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${record.lecture_capture_status ? 'bg-green-500' : 'bg-gray-200'}`}></div>

                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 tracking-tight leading-none mb-1">
                                        {record.subject_name || 'Lecture Session'}
                                    </h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {format(new Date(record.date), 'dd MMM')} • {record.actual_start_time?.slice(0, 5)}
                                    </p>
                                </div>
                                <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${record.lecture_capture_status
                                    ? 'bg-green-50 text-green-700 border-green-100'
                                    : 'bg-gray-50 text-gray-400 border-gray-100'
                                    }`}>
                                    {record.lecture_capture_status ? 'LC Active' : 'No LC'}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 py-3 border-t border-gray-50 mt-1">
                                <div className="flex-1">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Room</p>
                                    <p className="text-sm font-bold text-gray-900">{record.room_no}</p>
                                </div>
                                <div className="flex-1 border-l border-gray-50 pl-4">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Attendance</p>
                                    <p className="text-sm font-bold text-gray-900">{record.attendance_count || '0'}</p>
                                </div>
                                <div className="flex-1 border-l border-gray-50 pl-4">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Topic</p>
                                    <p className="text-xs font-medium text-gray-900 truncate max-w-[80px]">
                                        {record.topic_covered || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {record.remarks && (
                                <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg italic border border-gray-100">
                                    "{record.remarks}"
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
