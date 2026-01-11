import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Save, ArrowLeft, Users, Clock, MapPin, CheckCircle2, Mic, BookOpen, AlertCircle } from 'lucide-react';
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

    const [alreadySubmitted, setAlreadySubmitted] = useState(false);

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

                // 2. Check if already submitted (for any date, but usually today)
                const today = new Date().toISOString().split('T')[0];
                const { records } = await api.dlr.getReportData(today);
                const existing = records.find(r => r.timetable_id === id);
                if (existing) {
                    setAlreadySubmitted(true);
                    setFormData({
                        ...existing,
                        actual_start_time: existing.actual_start_time?.slice(0, 5),
                        actual_end_time: existing.actual_end_time?.slice(0, 5),
                    });
                }

                // 3. Fetch Faculty List
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
                actual_start_time: formData.actual_start_time,
                actual_end_time: formData.actual_end_time,
                room_no: formData.room_no,
                faculty_id: formData.faculty_id,
                attendance_count: parseInt(formData.attendance_count) || 0,
                topic_covered: formData.topic_covered,
                lecture_capture_status: formData.lecture_capture_status,
                smart_board_pdf_status: formData.smart_board_pdf_status,
                remarks: formData.remarks,
                submitted_by: user?.id,
                date: new Date().toISOString().split('T')[0] // Always submit for today
            });

            toast.success('Audit Record Submitted!');
            navigate('/');
        } catch (error) {
            console.error(error);
            toast.error('Submission failed. Room might be double-booked.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100 border-t-blue-600"></div>
        </div>
    );

    if (!timetableEntry) return <div className="p-10 text-center font-bold">Lecture not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Mobile Header */}
            <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-30 flex items-center justify-between">
                <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                    <ArrowLeft className="h-6 w-6 text-gray-900" />
                </button>
                <h1 className="text-lg font-black text-gray-900 uppercase tracking-tight">Audit Session</h1>
                <div className="w-10"></div> {/* Spacer */}
            </div>

            <div className="max-w-xl mx-auto px-4 mt-6">
                {/* Session Summary Card */}
                <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-100 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                            {timetableEntry.subject_type || 'Lecture'}
                        </span>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Scheduled Slot</p>
                            <p className="text-sm font-black">{timetableEntry.start_time?.slice(0, 5)} - {timetableEntry.end_time?.slice(0, 5)}</p>
                        </div>
                    </div>
                    <h2 className="text-2xl font-black tracking-tight mb-2">{timetableEntry.subject_name}</h2>
                    <div className="flex items-center gap-4 text-sm font-medium opacity-90">
                        <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {timetableEntry.room_no}</span>
                        <span className="opacity-40">|</span>
                        <span>Sem {timetableEntry.semester} - {timetableEntry.division}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {alreadySubmitted && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <p className="text-sm font-bold text-green-800">This record is already in the official audit.</p>
                        </div>
                    )}

                    {/* Faculty Section */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 text-blue-500" /> Session Conducted By
                        </h3>
                        <select
                            disabled={alreadySubmitted}
                            value={formData.faculty_id}
                            onChange={e => setFormData({ ...formData, faculty_id: e.target.value })}
                            className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                        >
                            <option value="">Select Faculty...</option>
                            {facultyList.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={handleSameFaculty}
                            className="mt-4 w-full text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 py-2 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors"
                        >
                            Assigned Faculty (Reset)
                        </button>
                    </div>

                    {/* Attendance & Content */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Headcount</label>
                                <input
                                    type="number"
                                    required
                                    placeholder="0"
                                    disabled={alreadySubmitted}
                                    value={formData.attendance_count}
                                    onChange={e => setFormData({ ...formData, attendance_count: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-lg font-black text-gray-900 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Actual Room</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Room No"
                                    disabled={alreadySubmitted}
                                    value={formData.room_no}
                                    onChange={e => setFormData({ ...formData, room_no: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-lg font-black text-gray-900 focus:ring-2 focus:ring-blue-500 uppercase"
                                />
                            </div>
                        </div>

                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block flex items-center gap-2">
                            <BookOpen className="h-3.5 w-3.5 text-blue-500" /> Topics Covered
                        </label>
                        <textarea
                            rows={3}
                            required
                            placeholder="Write brief topics..."
                            disabled={alreadySubmitted}
                            value={formData.topic_covered}
                            onChange={e => setFormData({ ...formData, topic_covered: e.target.value })}
                            className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 mb-4"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Audit Start</label>
                                <input
                                    type="time"
                                    required
                                    disabled={alreadySubmitted}
                                    value={formData.actual_start_time}
                                    onChange={e => setFormData({ ...formData, actual_start_time: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-sm font-black text-gray-900 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Audit End</label>
                                <input
                                    type="time"
                                    required
                                    disabled={alreadySubmitted}
                                    value={formData.actual_end_time}
                                    onChange={e => setFormData({ ...formData, actual_end_time: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-sm font-black text-gray-900 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Lecture Capture Toggles */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Mic className="h-3.5 w-3.5 text-blue-500" /> Lecture Capture Audit
                        </h3>

                        <div className="space-y-4">
                            <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${formData.lecture_capture_status ? 'bg-blue-50 border-blue-200 shadow-md shadow-blue-50' : 'bg-gray-50 border-gray-100'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-xl ${formData.lecture_capture_status ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                        <Mic className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">L.C. Enabled</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Video + Audio Record</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    disabled={alreadySubmitted}
                                    checked={formData.lecture_capture_status}
                                    onChange={e => setFormData({ ...formData, lecture_capture_status: e.target.checked })}
                                    className="h-6 w-6 rounded-lg text-blue-600 focus:ring-blue-500 border-gray-200"
                                />
                            </label>

                            <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${formData.smart_board_pdf_status ? 'bg-green-50 border-green-200 shadow-md shadow-green-50' : 'bg-gray-50 border-gray-100'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-xl ${formData.smart_board_pdf_status ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">PDF Uploaded</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Published on V-Refer</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    disabled={alreadySubmitted || !formData.lecture_capture_status}
                                    checked={formData.smart_board_pdf_status}
                                    onChange={e => setFormData({ ...formData, smart_board_pdf_status: e.target.checked })}
                                    className="h-6 w-6 rounded-lg text-green-600 focus:ring-green-500 border-gray-200"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Remarks</label>
                        <textarea
                            rows={2}
                            placeholder="Optional notes..."
                            disabled={alreadySubmitted}
                            value={formData.remarks}
                            onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                            className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {!alreadySubmitted && (
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-blue-600 text-white font-black text-sm uppercase tracking-widest py-5 rounded-3xl shadow-2xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                <Save className="h-5 w-5" />
                                {submitting ? 'Authenticating Audit...' : 'Submit Session Audit'}
                            </button>
                            <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-6">
                                Securing transmission with academic audit server...
                            </p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
