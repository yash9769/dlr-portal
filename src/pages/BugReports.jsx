import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/useAuth';
import { Bug, CheckCircle, Clock, AlertTriangle, User, MoreHorizontal, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function BugReports() {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const { data } = await api.bugs.list();
            setReports(data || []);
        } catch (error) {
            console.error(error);
            toast.error(`Failed to load bug reports: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.bugs.updateStatus(id, newStatus);
            toast.success(`Status updated to ${newStatus}`);
            fetchReports(); // Refresh
        } catch (error) {
            console.error(error);
            toast.error('Update failed');
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
            case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'open': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="p-10 text-center"><div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-1000">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-full text-[10px] font-black text-red-600 uppercase tracking-widest border border-red-100 shadow-sm shadow-red-50">
                        <Bug className="h-3.5 w-3.5" />
                        <span>System Pulse</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                        Issue <span className="text-red-600">Reports</span>
                    </h1>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                        <div className="h-1 w-8 bg-red-600 rounded-full"></div>
                        Technical Support Terminal
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {reports.length === 0 ? (
                    <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 shadow-xl shadow-gray-200/20 animation-float">
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-green-100 shadow-inner">
                            <CheckCircle className="h-10 w-10 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 uppercase italic tracking-tight leading-none mb-3">System Optimized</h3>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] max-w-sm mx-auto leading-relaxed">
                            No active bug reports detected. The platform is running at peak performance parameters.
                        </p>
                    </div>
                ) : (
                    reports.map((report) => (
                        <div key={report.id} className="relative bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:border-red-200 transition-all duration-700 flex flex-col group overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-1000 rotate-12">
                                <AlertTriangle className="h-32 w-32" />
                            </div>

                            <div className="relative z-10 flex-1">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex gap-2">
                                        <span className={`px-3 py-1.5 text-[9px] font-black rounded-xl border uppercase tracking-widest shadow-sm ${getStatusColor(report.status)}`}>
                                            {report.status.replace('_', ' ')}
                                        </span>
                                        <span className={`px-3 py-1.5 text-[9px] font-black rounded-xl border uppercase tracking-widest shadow-sm ${getSeverityColor(report.severity)}`}>
                                            {report.severity}
                                        </span>
                                    </div>
                                    <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400">
                                        <Clock className="h-4 w-4" />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[11px] font-black text-red-600 uppercase tracking-[0.1em] mb-2">Issue Description</p>
                                        <h3 className="text-xl font-black text-gray-900 leading-tight tracking-tight group-hover:text-red-700 transition-colors">
                                            {report.description}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 group/user">
                                        <div className="h-12 w-12 rounded-xl bg-white border-2 border-white shadow-md flex items-center justify-center text-lg font-black text-gray-900">
                                            {(report.profiles?.full_name || 'U').charAt(0)}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Reporter</p>
                                            <p className="text-sm font-black text-gray-900 truncate tracking-tight">{report.profiles?.full_name || 'Anonymous'}</p>
                                            <p className="text-[10px] font-bold text-blue-600 lowercase tracking-tight opacity-70">{report.profiles?.email}</p>
                                        </div>
                                    </div>

                                    {report.steps_to_reproduce && (
                                        <div className="bg-red-50/30 p-5 rounded-2xl border border-red-50/50">
                                            <div className="flex items-center gap-2 mb-3">
                                                <MessageSquare className="h-3.5 w-3.5 text-red-400" />
                                                <span className="text-[11px] font-black text-red-800 uppercase tracking-widest">Diagnostic Details</span>
                                            </div>
                                            <p className="text-sm text-gray-600 font-medium leading-relaxed italic border-l-2 border-red-200 pl-3">
                                                {report.steps_to_reproduce}
                                            </p>
                                        </div>
                                    )}

                                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between text-[11px] font-black text-gray-400 uppercase tracking-tighter">
                                        <span className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-gray-300"></div>
                                            ID: #{report.id.slice(0, 8)}
                                        </span>
                                        <span>{format(new Date(report.created_at), 'MMM dd, HH:mm')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3 relative z-10">
                                {report.status !== 'resolved' && (
                                    <button
                                        onClick={() => handleStatusUpdate(report.id, 'resolved')}
                                        className="flex-1 py-4 bg-white hover:bg-green-600 hover:text-white text-green-700 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-gray-100 border border-green-100 transition-all flex items-center justify-center gap-2 active:scale-95 border-b-4 hover:border-b-green-700 active:border-b-0"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Resolve
                                    </button>
                                )}
                                {report.status === 'open' && (
                                    <button
                                        onClick={() => handleStatusUpdate(report.id, 'in_progress')}
                                        className="flex-1 py-4 bg-gray-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-gray-900/10 transition-all flex items-center justify-center gap-2 active:scale-95 border-b-4 border-black active:border-b-0"
                                    >
                                        <Clock className="h-4 w-4 text-blue-400" />
                                        Deploy
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
