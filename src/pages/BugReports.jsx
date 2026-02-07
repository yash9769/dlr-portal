import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
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
            toast.error('Failed to load bug reports');
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-8 flex items-center gap-3">
                <Bug className="h-6 w-6 text-red-600" />
                System Issue Reports
            </h1>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {reports.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                        <CheckCircle className="mx-auto h-16 w-16 text-green-400 mb-4" />
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">No Active Issues</h3>
                        <p className="mt-2 text-sm text-gray-500 font-medium">The system is running perfectly! Reports will appear here.</p>
                    </div>
                ) : (
                    reports.map((report) => (
                        <div key={report.id} className="bg-white overflow-hidden shadow-xl shadow-blue-50/50 rounded-3xl border border-gray-100 flex flex-col group hover:border-blue-200 transition-all">
                            <div className="p-6 flex-1">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex gap-2">
                                        <span className={`px-3 py-1 text-[10px] font-black rounded-full border ${getStatusColor(report.status)} uppercase tracking-widest`}>
                                            {report.status.replace('_', ' ')}
                                        </span>
                                        <span className={`px-3 py-1 text-[10px] font-black rounded-full border ${getSeverityColor(report.severity)} uppercase tracking-widest`}>
                                            {report.severity}
                                        </span>
                                    </div>
                                    <Clock className="h-4 w-4 text-gray-300" />
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Issue Reported</h4>
                                        <p className="text-lg font-black text-gray-900 leading-tight">
                                            {report.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="h-10 w-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-sm font-black text-gray-900 shadow-sm">
                                            {(report.profiles?.full_name || 'U').charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Reporter</p>
                                            <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">
                                                {report.profiles?.full_name || 'Anonymous User'}
                                            </p>
                                            <p className="text-[9px] font-medium text-gray-500">{report.profiles?.email}</p>
                                        </div>
                                    </div>

                                    {report.steps_to_reproduce && (
                                        <div className="mt-4 bg-red-50/50 p-4 rounded-2xl border border-red-50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MessageSquare className="h-3 w-3 text-red-400" />
                                                <h5 className="text-[10px] font-black text-red-600 uppercase tracking-widest">Details & Steps</h5>
                                            </div>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed italic">"{report.steps_to_reproduce}"</p>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                        <span>Report ID: #{report.id.slice(0, 8)}</span>
                                        <span>{format(new Date(report.created_at), 'MMM dd, HH:mm')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 flex gap-2">
                                {report.status !== 'resolved' && (
                                    <button
                                        onClick={() => handleStatusUpdate(report.id, 'resolved')}
                                        className="flex-1 py-3 bg-white hover:bg-green-600 hover:text-white text-green-700 text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-sm border border-green-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Close Issue
                                    </button>
                                )}
                                {report.status === 'open' && (
                                    <button
                                        onClick={() => handleStatusUpdate(report.id, 'in_progress')}
                                        className="flex-1 py-3 bg-white hover:bg-blue-600 hover:text-white text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-sm border border-blue-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Clock className="h-4 w-4" />
                                        Investigate
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
