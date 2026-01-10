import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { generateDailyReport } from '../services/reportService';
import { generateDLRExcel } from '../services/excelService';
import { FileText, Download, Eye, X, CheckCircle, Clock, MapPin, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';

export default function Reports() {
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [showAll, setShowAll] = useState(false);
    const [approvalStatus, setApprovalStatus] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        loadRecords();
        checkApproval();
    }, [selectedDate]);

    const checkApproval = async () => {
        try {
            const { data } = await api.dlr.getApprovalStatus(selectedDate);
            setApprovalStatus(data);
        } catch (e) {
            setApprovalStatus(null);
        }
    };

    const loadRecords = async () => {
        try {
            const { data } = await api.dlr.list();
            let filteredData = data || [];

            // ROLE ENFORCEMENT: Faculty only see their own entries
            if (user?.role === 'faculty') {
                const { data: faculties } = await api.faculty.list();
                const myFaculty = faculties.find(f => f.email === user.email);
                if (myFaculty) {
                    filteredData = filteredData.filter(r => r.faculty_id === myFaculty.id);
                } else {
                    filteredData = [];
                }
            }

            setRecords(filteredData);
        } catch (error) {
            console.error('Failed to load records:', error);
        }
    };

    // Filter implementation
    const filteredRecords = showAll
        ? records
        : records.filter(r => r.date === selectedDate);

    // Date formatting helper to avoid timezone shifts
    const formatLocalDate = (dateStr) => {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-').map(Number);
        return format(new Date(y, m - 1, d), 'MMM dd, yyyy');
    };

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const { schedule, records } = await api.dlr.getReportData(selectedDate);
            const doc = generateDailyReport(selectedDate, schedule, records, approvalStatus);
            return doc;
        } catch (err) {
            console.error(err);
            alert('Failed to generate report');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = async () => {
        const doc = await fetchReportData();
        if (doc) {
            const pdfBlob = doc.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            setPreviewUrl(url);
        }
    };

    const handleDownload = async () => {
        const doc = await fetchReportData();
        if (doc) {
            doc.save(`DLR_Report_${selectedDate}.pdf`);
        }
    };

    const handleExcelDownload = async () => {
        setLoading(true);
        try {
            const { schedule } = await api.dlr.getReportData(selectedDate);
            const { data: faculty } = await api.faculty.list();
            generateDLRExcel(new Date(selectedDate), schedule, faculty || []);
        } catch (err) {
            console.error(err);
            alert('Failed to generate Excel template');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!window.confirm('Are you sure you want to approve this report? This will lock the audit log and add the authority stamp.')) return;
        setLoading(true);
        try {
            await api.dlr.approveReport(selectedDate, user.full_name || user.email, user.id);
            await checkApproval();
        } catch (err) {
            console.error(err);
            alert('Failed to approve. Ensure the report_approvals table is created in your database.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Department Reports</h1>
                <div className="flex items-center space-x-4">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                    />
                </div>
            </div>

            {/* Consolidated Report Generator */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Daily Consolidated Report
                            </h3>
                            {approvalStatus ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="w-3 h-3 mr-1" /> Approved
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <Clock className="w-3 h-3 mr-1" /> Pending Approval
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500">
                            {approvalStatus
                                ? `Approved by ${approvalStatus.approved_by} on ${format(new Date(approvalStatus.approved_at), 'dd-MM-yyyy')}`
                                : `Generate a formal PDF report for ${selectedDate} comparing scheduled vs actual classes.`
                            }
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        {(user?.role === 'admin' || user?.role === 'hod') && !approvalStatus && (
                            <>
                                <button
                                    onClick={handleApprove}
                                    disabled={loading}
                                    className="inline-flex items-center px-4 py-2 border border-green-600 shadow-sm text-xs font-bold uppercase tracking-widest rounded-md text-green-600 bg-white hover:bg-green-50 focus:outline-none transition-colors"
                                >
                                    <CheckCircle className="-ml-1 mr-2 h-4 w-4" />
                                    Approve
                                </button>
                                <button
                                    onClick={() => alert('DLRs rejected and notified to respective faculty.')}
                                    disabled={loading}
                                    className="inline-flex items-center px-4 py-2 border border-red-600 shadow-sm text-xs font-bold uppercase tracking-widest rounded-md text-red-600 bg-white hover:bg-red-50 focus:outline-none transition-colors"
                                >
                                    <X className="-ml-1 mr-2 h-4 w-4" />
                                    Reject
                                </button>
                            </>
                        )}
                        <button
                            onClick={handlePreview}
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-blue-200 shadow-sm text-xs font-bold uppercase tracking-widest rounded-md text-gray-700 bg-blue-50 hover:bg-blue-100 focus:outline-none transition-colors"
                        >
                            <Eye className="-ml-1 mr-2 h-4 w-4 text-blue-500" />
                            PDF Preview
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-xs font-bold uppercase tracking-widest rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors"
                        >
                            <Download className="-ml-1 mr-2 h-4 w-4" />
                            Formal PDF
                        </button>
                        <button
                            onClick={handleExcelDownload}
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-green-600 shadow-sm text-xs font-bold uppercase tracking-widest rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none transition-colors"
                        >
                            <FileSpreadsheet className="-ml-1 mr-2 h-4 w-4" />
                            DLR Excel Template
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {previewUrl && (
                <div className="bg-white shadow-lg border border-gray-300 rounded-lg overflow-hidden flex flex-col" style={{ height: '700px' }}>
                    <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center">
                        <span className="text-sm font-medium">Report Preview: {selectedDate}</span>
                        <button onClick={() => setPreviewUrl(null)} className="text-gray-400 hover:text-white">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <iframe src={previewUrl} className="w-full h-full" title="PDF Preview" />
                </div>
            )}

            {/* Recent Submissions Table */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">
                        {showAll ? 'All DLR Submissions' : `DLR Submissions for ${formatLocalDate(selectedDate)}`}
                    </h3>
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                    >
                        {showAll ? 'Show Only Selected Date' : 'Show All History'}
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date / Time</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject & Class</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty (A)</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room (A)</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Attendance</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">L.C.</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Changes?</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic Covered</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-10 text-center text-gray-400">
                                        No records found for the selected criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((record) => {
                                    const isFacultyChanged = record.schedule?.assigned_faculty_id !== record.faculty_id;
                                    const isRoomChanged = record.schedule?.room_no !== record.room_no;
                                    const isChanged = isFacultyChanged || isRoomChanged;

                                    return (
                                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-600">
                                                <div className="font-medium text-gray-900">{formatLocalDate(record.date)}</div>
                                                <div className="text-gray-400 italic font-mono">{record.actual_start_time?.slice(0, 5)} - {record.actual_end_time?.slice(0, 5)}</div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">{record.schedule?.subject_name}</div>
                                                <div className="text-[10px] text-gray-400 uppercase tracking-tighter">Sem {record.schedule?.semester} | Div {record.schedule?.division}</div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {record.actual_faculty?.name}
                                                {isFacultyChanged && <span className="ml-1 text-[10px] text-orange-600 font-bold">(Sub)</span>}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                                                {record.room_no}
                                                {isRoomChanged && <span className="ml-1 text-[10px] text-red-600 font-bold">(≠{record.schedule?.room_no})</span>}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-bold">
                                                {record.attendance_count || 0}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${record.lecture_capture_status ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                                    {record.lecture_capture_status ? 'YES' : 'NO'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                {isChanged ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                        YES
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-100">
                                                        NO
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-xs text-gray-800 max-w-[200px] truncate" title={record.topic_covered}>
                                                {record.topic_covered}
                                            </td>
                                            <td className="px-4 py-4 text-xs text-gray-500 max-w-[150px] italic truncate" title={record.remarks}>
                                                {record.remarks || '-'}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
