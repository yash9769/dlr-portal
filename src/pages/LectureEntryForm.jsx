import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Save, ArrowLeft, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LectureEntryForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [timetableEntry, setTimetableEntry] = useState(null);
    const [facultyList, setFacultyList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        actual_start_time: '',
        actual_end_time: '',
        room_no: '',
        faculty_id: '',
        attendance_count: '',
        topic_covered: '',
        lecture_capture_status: false,
        smart_board_pdf_status: false,
        remarks: ''
    });

    useEffect(() => {
        async function loadData() {
            try {
                // 1. Fetch Timetable Metadata
                const { data: allTimetable } = await api.timetable.getAll();
                const entry = allTimetable?.find(t => t.id === id);

                if (entry) {
                    setTimetableEntry(entry);
                    setFormData(prev => ({
                        ...prev,
                        actual_start_time: entry.start_time?.slice(0, 5),
                        actual_end_time: entry.end_time?.slice(0, 5),
                        room_no: entry.room_no,
                        faculty_id: entry.assigned_faculty_id
                    }));
                }

                // 2. Fetch Faculty List
                const { data: faculty } = await api.faculty.list();
                setFacultyList(faculty || []);

            } catch (error) {
                console.error(error);
                toast.error('Failed to load lecture details');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id]);

    // "Same Faculty" Logic
    const handleSameFaculty = () => {
        if (!timetableEntry) return;
        setFormData(prev => ({
            ...prev,
            faculty_id: timetableEntry.assigned_faculty_id,
            actual_start_time: timetableEntry.start_time?.slice(0, 5),
            actual_end_time: timetableEntry.end_time?.slice(0, 5),
            room_no: timetableEntry.room_no,
            remarks: ''
        }));
        toast.success('Reset to scheduled details');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await api.dlr.submit({
                timetable_id: id,
                ...formData,
                submitted_by: user?.id
            });

            toast.success('Lecture Record Submitted Successfully!');
            navigate('/');
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit record');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!timetableEntry) return <div>Lecture not found</div>;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center">
                    <button onClick={() => navigate('/')} className="mr-4 text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Lecture Entry</h1>
                </div>
                <button
                    type="button"
                    onClick={handleSameFaculty}
                    className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none"
                >
                    <Users className="mr-2 h-4 w-4" />
                    Same as Scheduled
                </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        {timetableEntry.subject_name} ({timetableEntry.subject_type})
                    </h3>
                    <p className="text-sm text-gray-500">
                        {timetableEntry.semester} - {timetableEntry.division} | {timetableEntry.day_of_week}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Faculty Selection */}
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Faculty</label>
                            <select
                                value={formData.faculty_id}
                                onChange={e => setFormData({ ...formData, faculty_id: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="">Select Faculty...</option>
                                {facultyList.map(f => (
                                    <option key={f.id} value={f.id}>{f.name} ({f.department})</option>
                                ))}
                            </select>
                            {/* Validation / Highlight: Check if selected ID != scheduled ID */}
                            {timetableEntry.assigned_faculty_id && formData.faculty_id && timetableEntry.assigned_faculty_id !== formData.faculty_id && (
                                <p className="mt-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                                    ⚠ <strong>Faculty Change Detected</strong>: You are marking a substitution.
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start Time</label>
                            <input
                                type="time"
                                required
                                value={formData.actual_start_time}
                                onChange={e => setFormData({ ...formData, actual_start_time: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">End Time</label>
                            <input
                                type="time"
                                required
                                value={formData.actual_end_time}
                                onChange={e => setFormData({ ...formData, actual_end_time: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Room No</label>
                            <input
                                type="text"
                                required
                                value={formData.room_no}
                                onChange={e => setFormData({ ...formData, room_no: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            {timetableEntry.room_no && formData.room_no && timetableEntry.room_no !== formData.room_no && (
                                <p className="mt-1 text-xs text-red-500 font-medium">
                                    ⚠ Room Changed (Scheduled: {timetableEntry.room_no})
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Attendance Count</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.attendance_count}
                                onChange={e => setFormData({ ...formData, attendance_count: Number(e.target.value) })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    {/* Section 2: Content & Validation */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Topic Covered</label>
                        <textarea
                            rows={3}
                            required
                            value={formData.topic_covered}
                            onChange={e => setFormData({ ...formData, topic_covered: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <div className="flex items-center space-x-8">
                        <div className="relative flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="lc_status"
                                    name="lc_status"
                                    type="checkbox"
                                    checked={formData.lecture_capture_status}
                                    onChange={e => setFormData({ ...formData, lecture_capture_status: e.target.checked })}
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="lc_status" className="font-medium text-gray-700">Lecture Captured</label>
                                <p className="text-gray-500">Video recorded & uploaded to LMS?</p>
                            </div>
                        </div>

                        <div className="relative flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="sb_status"
                                    name="sb_status"
                                    type="checkbox"
                                    checked={formData.smart_board_pdf_status}
                                    onChange={e => setFormData({ ...formData, smart_board_pdf_status: e.target.checked })}
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="sb_status" className="font-medium text-gray-700">Smart Board PDF</label>
                                <p className="text-gray-500">Board notes exported & saved?</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Remarks (Optional)</label>
                        <textarea
                            rows={2}
                            value={formData.remarks}
                            onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Any deviations from schedule..."
                        />
                    </div>

                    <div className="pt-5 flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
