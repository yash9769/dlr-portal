import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { generateDailyReport } from '../services/reportService';
import { FileText, Download, Eye, X, CheckCircle, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';

export default function Reports() {
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        loadRecords();
    }, []);

    const loadRecords = async () => {
        try {
            const { data } = await api.dlr.list();
            setRecords(data || []);
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
            const doc = generateDailyReport(selectedDate, schedule, records);
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

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Reports & Records</h1>
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            Daily Consolidated Report
                        </h3>
                        <p className="text-sm text-gray-500">
                            Generate a formal PDF report for {selectedDate} comparing scheduled vs actual classes.
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={handlePreview}
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                        >
                            <Eye className="-ml-1 mr-2 h-4 w-4 text-gray-500" />
                            Preview
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors"
                        >
                            <Download className="-ml-1 mr-2 h-4 w-4" />
                            Download PDF
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date / Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject & Class</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-400">
                                        No records found for the selected criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <div className="font-medium text-gray-900">{formatLocalDate(record.date)}</div>
                                            <div className="text-xs text-gray-400">{record.actual_start_time} - {record.actual_end_time}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">{record.schedule?.subject_name}</div>
                                            <div className="text-xs text-blue-500">Sem {record.schedule?.semester} | Div {record.schedule?.division} | Room {record.room_no}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {record.actual_faculty?.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                            {record.topic_covered}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex flex-col gap-1">
                                                {record.lecture_capture_status && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircle className="w-3 h-3 mr-1" /> LC Done
                                                    </span>
                                                )}
                                                {record.smart_board_pdf_status && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                        <CheckCircle className="w-3 h-3 mr-1" /> SB PDF
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
