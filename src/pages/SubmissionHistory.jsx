import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/useAuth';
import { Clock, Calendar, CheckCircle2, History, Filter, AlertTriangle, Search, ChevronRight, FileText, MapPin, Users as UsersIcon } from 'lucide-react';
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

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100 border-t-blue-600"></div>
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing History...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-10 animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">
                        <History className="h-3 w-3" />
                        <span>Audit Archive</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                        Submission <span className="text-blue-600">Log</span>
                    </h1>
                    <p className="text-gray-500 font-medium max-w-xl">Review your historical lecture capture records, attendance logs, and departmental submissions.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 p-1 pl-4 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all duration-300 ${showFilter ? 'w-auto' : 'w-12 overflow-hidden border-transparent bg-transparent shadow-none'}`}>
                        {showFilter && (
                            <input
                                type="date"
                                className="text-xs font-bold text-gray-700 bg-transparent outline-none py-1"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                        )}
                        <button
                            onClick={() => setShowFilter(!showFilter)}
                            className={`p-3 rounded-xl transition-all active:scale-95 ${showFilter ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-gray-400 border border-gray-100 hover:text-gray-600 shadow-sm'}`}
                        >
                            <Filter className="h-4 w-4" />
                        </button>
                    </div>
                    {filterDate && (
                        <button
                            onClick={() => setFilterDate('')}
                            className="px-4 py-2 text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-50 rounded-xl border border-red-100"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {filteredHistory.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-gray-100 group">
                    <div className="h-20 w-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                        <History className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">No Records Found</h3>
                    <p className="text-gray-500 font-medium max-w-sm mx-auto">There are no matching submissions in your history log. Filter by another date or try again later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredHistory.map((record) => (
                        <div key={record.id} className="group relative bg-white rounded-[2rem] p-6 border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:border-blue-200 transition-all duration-500">
                            {/* Decorative Top Accent */}
                            <div className={`absolute top-0 left-6 right-6 h-1 rounded-b-full transition-all duration-500 ${record.lecture_capture_status ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-gray-100'}`}></div>

                            <div className="pt-2">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex flex-col gap-1">
                                        <div className="px-2.5 py-1 bg-gray-50 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-widest w-fit">
                                            {format(new Date(record.date), 'EEEE, MMM do')}
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight line-clamp-1">
                                            {record.subject_name || 'Generic Session'}
                                        </h3>
                                    </div>
                                    <div className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border flex items-center gap-1.5 whitespace-nowrap ${record.lecture_capture_status
                                        ? 'bg-green-50 text-green-700 border-green-100'
                                        : 'bg-gray-50 text-gray-400 border-gray-100'
                                        }`}>
                                        <div className={`h-1.5 w-1.5 rounded-full ${record.lecture_capture_status ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                        {record.lecture_capture_status ? 'LCS Active' : 'No LCS'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="p-3 bg-gray-50/50 rounded-2xl border border-transparent group-hover:border-gray-100 transition-colors">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Timing</p>
                                        <div className="flex items-center gap-1.5 text-gray-900">
                                            <Clock className="h-3 w-3 text-blue-500" />
                                            <span className="text-xs font-black">{record.actual_start_time?.slice(0, 5)}</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50/50 rounded-2xl border border-transparent group-hover:border-gray-100 transition-colors">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Room</p>
                                        <div className="flex items-center gap-1.5 text-gray-900">
                                            <MapPin className="h-3 w-3 text-indigo-500" />
                                            <span className="text-xs font-black">{record.room_no}</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50/50 rounded-2xl border border-transparent group-hover:border-gray-100 transition-colors">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Count</p>
                                        <div className="flex items-center gap-1.5 text-gray-900">
                                            <UsersIcon className="h-3 w-3 text-purple-500" />
                                            <span className="text-xs font-black">{record.attendance_count || '0'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-3 bg-blue-50/30 rounded-2xl border border-blue-50 text-blue-900">
                                        <FileText className="h-4 w-4 shrink-0 mt-0.5" />
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 text-blue-600/70">Topic Covered</p>
                                            <p className="text-xs font-bold leading-relaxed truncate">{record.topic_covered || 'No topic details provided.'}</p>
                                        </div>
                                    </div>

                                    {record.remarks && (
                                        <div className="flex items-start gap-3 p-3 bg-orange-50/30 rounded-2xl border border-orange-50 text-orange-900">
                                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-orange-400" />
                                            <div className="overflow-hidden">
                                                <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 text-orange-600/70">Faculty Remarks</p>
                                                <p className="text-xs font-medium italic leading-relaxed truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">"{record.remarks}"</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">ID: {record.id.slice(0, 8)}</span>
                                    <button className="text-[10px] font-black text-blue-600 flex items-center gap-1 group/btn hover:translate-x-1 transition-transform">
                                        Review Entry
                                        <ChevronRight className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

