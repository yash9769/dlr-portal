import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Plus, Trash2, Save, Upload, FileText, AlertCircle, Check, Download, MapPin, Clock, Calculator, Search, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { parseExcelTimetable, mapToTimetableSchema, parsePDFTimetable, exportToExcel } from '../utils/timetableParser';

export default function TimetableManager() {
    const [entries, setEntries] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef(null);

    // Filter State
    const [filters, setFilters] = useState({
        faculty: '',
        room: '',
        division: '',
        day: '',
        semester: ''
    });
    const [sortBy, setSortBy] = useState('day_time');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'visual'

    // New Entry State
    const [newEntry, setNewEntry] = useState({
        semester: 'VI',
        division: 'A',
        batch_strength: 60,
        subject_name: '',
        subject_type: 'Lecture',
        day_of_week: 'Monday',
        start_time: '10:00:00',
        end_time: '11:00:00',
        room_no: '',
        assigned_faculty_id: '',
        batch: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const { data: tt } = await api.timetable.getAll();
            const { data: fac } = await api.faculty.list();
            setEntries(tt || []);
            setFacultyList(fac || []);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const checkConflicts = (entry) => {
        const conflicts = [];

        // Time overlap helper
        const isTimeOverlap = (s1, e1, s2, e2) => {
            return (s1 < e2 && s2 < e1);
        };

        const newStart = entry.start_time;
        const newEnd = entry.end_time;

        entries.forEach(existing => {
            if (existing.day_of_week === entry.day_of_week && isTimeOverlap(existing.start_time, existing.end_time, newStart, newEnd)) {
                // 1. Room Conflict
                if (existing.room_no === entry.room_no) {
                    conflicts.push({ type: 'room', msg: `Room ${entry.room_no} is already occupied by ${existing.subject_name}` });
                }
                // 2. Faculty Conflict
                if (entry.assigned_faculty_id && existing.assigned_faculty_id === entry.assigned_faculty_id) {
                    const facultyName = facultyList.find(f => f.id === entry.assigned_faculty_id)?.name || 'This faculty';
                    conflicts.push({ type: 'faculty', msg: `${facultyName} is already assigned to ${existing.subject_name} (${existing.semester}-${existing.division})` });
                }
                // 3. Division Conflict (Only if NOT Lab, or same batch)
                if (existing.semester === entry.semester && existing.division === entry.division) {
                    const isLab = (entry.subject_type || '').toLowerCase().includes('lab');
                    const isExistingLab = (existing.subject_type || '').toLowerCase().includes('lab');

                    if (!isLab || !isExistingLab || (entry.batch && existing.batch && entry.batch === existing.batch) || (!entry.batch && !existing.batch)) {
                        conflicts.push({ type: 'division', msg: `Division ${entry.semester}-${entry.division} ${entry.batch ? `Batch ${entry.batch}` : ''} already has ${existing.subject_name} scheduled` });
                    }
                }
            }
        });

        return conflicts;
    };

    const [submitting, setSubmitting] = useState(false);
    const [currentConflicts, setCurrentConflicts] = useState([]);

    // Real-time conflict check
    useEffect(() => {
        // Only check if essential fields are filled to avoid too many checks on empty form
        if (!newEntry.subject_name && !newEntry.room_no && !newEntry.assigned_faculty_id) {
            setCurrentConflicts([]);
            return;
        }
        const conflicts = checkConflicts(newEntry);
        setCurrentConflicts(conflicts);
    }, [newEntry, entries, facultyList]); // Added facultyList to dependencies for faculty name resolution

    const handleAdd = async (e) => {
        e.preventDefault();

        // Conflict Check
        if (currentConflicts.length > 0) {
            const proceed = window.confirm(
                `⚠ TIMETABLE CLASH DETECTED:\n\n` +
                currentConflicts.map(c => `• ${c.msg}`).join('\n') +
                `\n\nDo you still want to save this slot?`
            );
            if (!proceed) {
                toast.error('Slot not added due to conflicts.');
                return;
            }
        }

        setSubmitting(true);
        try {
            // FIX: Ensure empty UUID string is sent as null
            const payload = { ...newEntry };
            if (!payload.assigned_faculty_id || payload.assigned_faculty_id === '') {
                payload.assigned_faculty_id = null;
            }

            await api.timetable.create(payload);
            toast.success('Added to Timetable');
            // Clear fields but keep defaults for sem/div
            setNewEntry(prev => ({ ...prev, subject_name: '', room_no: '' }));
            loadData();
        } catch (error) {
            console.error(error);
            const msg = error.message || error.code || 'Check permissions (RLS policies)';
            toast.error('Failed to add entry: ' + msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this slot?')) return;
        try {
            await api.timetable.delete(id);
            toast.success('Deleted');
            loadData();
        } catch (error) {
            console.error(error);
            const msg = error.message || error.code || 'Check permissions (RLS policies)';
            toast.error('Failed delete: ' + msg);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImporting(true);
        const toastId = toast.loading(`Parsing ${file.name}...`);

        try {
            let rawData;
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                rawData = await parseExcelTimetable(file);
            } else if (file.name.endsWith('.pdf')) {
                rawData = await parsePDFTimetable(file, facultyList);
            } else {
                toast.error('Unsupported file format. Use Excel or PDF.', { id: toastId });
                setImporting(false);
                return;
            }

            const mappedData = mapToTimetableSchema(rawData, facultyList);

            if (mappedData.length === 0) {
                toast.error('No valid entries found. Please check file format.', { id: toastId });
                setImporting(false);
                return;
            }

            if (confirm(`Found ${mappedData.length} slots. Import them now?`)) {
                toast.loading(`Importing ${mappedData.length} slots...`, { id: toastId });

                const { error } = await api.timetable.create(mappedData);

                if (error) throw error;

                toast.success(`Successfully imported ${mappedData.length} slots!`, { id: toastId });
                loadData();
            } else {
                toast.dismiss(toastId);
            }
        } catch (error) {
            console.error('Import error:', error);
            toast.error('Failed to import: ' + error.message, { id: toastId });
        } finally {
            setImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const filteredEntries = entries.filter(e => {
        const matchFaculty = !filters.faculty || e.assigned_faculty_id === filters.faculty;
        const matchRoom = !filters.room || e.room_no.toLowerCase().includes(filters.room.toLowerCase());
        const matchDivision = !filters.division || e.division === filters.division;
        const matchDay = !filters.day || e.day_of_week === filters.day;
        const matchSemester = !filters.semester || e.semester === filters.semester;
        return matchFaculty && matchRoom && matchDivision && matchDay && matchSemester;
    }).sort((a, b) => {
        if (sortBy === 'day_time') {
            const days = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7 };
            const dayDiff = (days[a.day_of_week] || 8) - (days[b.day_of_week] || 8);
            if (dayDiff !== 0) return dayDiff;
            return a.start_time.localeCompare(b.start_time);
        }
        if (sortBy === 'subject') return a.subject_name.localeCompare(b.subject_name);
        if (sortBy === 'faculty') return (a.assigned_faculty?.name || '').localeCompare(b.assigned_faculty?.name || '');
        if (sortBy === 'room') return a.room_no.localeCompare(b.room_no);
        return 0;
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
            <style>
                {`
                @media print {
                    @page { size: landscape; margin: 1cm; }
                    body { background: white !important; }
                    .no-print, nav, header, aside, .form-container, .tabs-container { display: none !important; }
                    .printable-grid { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100% !important; 
                        border: none !important;
                        shadow: none !important;
                    }
                    .printable-grid table { width: 100% !important; }
                    .printable-grid .sticky { position: static !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                `}
            </style>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 no-print">
                <h1 className="text-2xl font-bold text-gray-900">Timetable Setup (Admin)</h1>
                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".xlsx, .xls, .pdf"
                    />
                    <button
                        onClick={() => fileInputRef.current.click()}
                        disabled={importing}
                        className="flex-1 lg:flex-none justify-center bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl flex items-center transition-all border border-gray-200 shadow-sm font-bold text-xs uppercase tracking-widest"
                    >
                        <Upload className="h-4 w-4 mr-2 text-green-600" />
                        Bulk Import
                    </button>
                    <button
                        onClick={() => {
                            try {
                                exportToExcel(filteredEntries);
                                toast.success('Excel file generated!');
                            } catch (err) {
                                console.error('Export error:', err);
                                toast.error('Failed to export Excel: ' + err.message);
                            }
                        }}
                        disabled={filteredEntries.length === 0}
                        className="flex-1 lg:flex-none justify-center bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl flex items-center transition-all border border-gray-200 shadow-sm font-bold text-xs uppercase tracking-widest disabled:opacity-50"
                    >
                        <Download className="h-4 w-4 mr-2 text-blue-600" />
                        Export Excel
                    </button>
                    <button
                        onClick={async () => {
                            const target = filters.division ? `DIV ${filters.semester}-${filters.division}` : 'ALL entries';
                            if (!confirm(`Are you sure you want to clear ${target}? This cannot be undone.`)) return;

                            try {
                                setLoading(true);
                                // If filtered, we delete one by one or via a new RPC if exists. 
                                // For now, we use the existing delete in a loop if filtered, or a full clear if not.
                                // But let's keep it safe.
                                for (const e of filteredEntries) {
                                    await api.timetable.delete(e.id);
                                }
                                toast.success('Cleared successfully');
                                loadData();
                            } catch (err) {
                                toast.error('Failed to clear');
                            } finally {
                                setLoading(false);
                            }
                        }}
                        disabled={filteredEntries.length === 0}
                        className="flex-1 lg:flex-none justify-center bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 px-4 py-2 rounded-xl flex items-center transition-all border border-gray-200 shadow-sm font-bold text-xs uppercase tracking-widest disabled:opacity-50"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear {filters.division ? 'Filtered' : 'All'}
                    </button>
                    <button
                        onClick={() => {
                            setViewMode('visual');
                            toast.success('Preparing PDF layout...');
                            setTimeout(() => window.print(), 500);
                        }}
                        disabled={filteredEntries.length === 0}
                        className="flex-1 lg:flex-none justify-center bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl flex items-center transition-all shadow-lg font-bold text-xs uppercase tracking-widest disabled:opacity-50"
                    >
                        <Printer className="h-4 w-4 mr-2" />
                        Print / PDF
                    </button>
                </div>
            </div>

            {/* INFO ALERT */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8 no-print">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            <strong>Tip:</strong> The system now supports flexible Excel headers! You can use columns like <code className="bg-blue-100 px-1 rounded">Subject</code>, <code className="bg-blue-100 px-1 rounded">Day</code>, <code className="bg-blue-100 px-1 rounded">Start Time</code>, <code className="bg-blue-100 px-1 rounded">Faculty</code>, etc. Variations like "Start_Time", "Teacher", or "Course Name" are also accepted.
                        </p>
                        <p className="text-xs text-blue-500 mt-1 italic">
                            If you encounter a "Worker failed" error, please refresh the page (Ctrl + F5).
                        </p>
                    </div>
                </div>
            </div>

            {/* ADD FORM */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8 no-print form-container">
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <Plus className="h-5 w-5 mr-2 text-blue-600" />
                    Add Individual Slot
                </h3>
                <form onSubmit={handleAdd} className="grid grid-cols-1 gap-4 sm:grid-cols-4 lg:grid-cols-6">
                    {/* Row 1: Core Slot Info */}
                    <div className="col-span-1 sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Subject Name</label>
                        <input
                            placeholder="e.g. Machine Learning"
                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                            value={newEntry.subject_name}
                            onChange={e => setNewEntry({ ...newEntry, subject_name: e.target.value })}
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                        <select
                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newEntry.subject_type}
                            onChange={e => setNewEntry({ ...newEntry, subject_type: e.target.value })}
                        >
                            <option>Lecture</option>
                            <option>Lab</option>
                            <option>Tutorial</option>
                            <option>Project</option>
                        </select>
                    </div>

                    {newEntry.subject_type === 'Lab' && (
                        <div className="col-span-1 animate-in slide-in-from-left-2 duration-300">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Batch</label>
                            <select
                                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50/50"
                                value={newEntry.batch}
                                onChange={e => setNewEntry({ ...newEntry, batch: e.target.value })}
                            >
                                <option value="">Entire Div</option>
                                <option value="B1">Batch B1</option>
                                <option value="B2">Batch B2</option>
                                <option value="B3">Batch B3</option>
                                <option value="B4">Batch B4</option>
                            </select>
                        </div>
                    )}

                    <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Sem</label>
                        <select
                            className={`w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none ${currentConflicts.some(c => c.type === 'division') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                            value={newEntry.semester}
                            onChange={e => setNewEntry({ ...newEntry, semester: e.target.value })}
                        >
                            <option>I</option>
                            <option>II</option>
                            <option>III</option>
                            <option>IV</option>
                            <option>V</option>
                            <option>VI</option>
                            <option>VII</option>
                            <option>VIII</option>
                        </select>
                    </div>

                    <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Div</label>
                        <input
                            placeholder="A"
                            className={`w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none uppercase ${currentConflicts.some(c => c.type === 'division') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                            required
                            value={newEntry.division}
                            onChange={e => setNewEntry({ ...newEntry, division: e.target.value.toUpperCase() })}
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Strength</label>
                        <input
                            type="number"
                            placeholder="60"
                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newEntry.batch_strength}
                            onChange={e => setNewEntry({ ...newEntry, batch_strength: parseInt(e.target.value) || 0 })}
                        />
                    </div>

                    {/* Row 2: Timing & Location */}
                    <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Day</label>
                        <select
                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newEntry.day_of_week}
                            onChange={e => setNewEntry({ ...newEntry, day_of_week: e.target.value })}
                        >
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d}>{d}</option>)}
                        </select>
                    </div>

                    <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Start</label>
                        <input type="time" className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={newEntry.start_time} onChange={e => setNewEntry({ ...newEntry, start_time: e.target.value })} />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">End</label>
                        <input type="time" className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={newEntry.end_time} onChange={e => setNewEntry({ ...newEntry, end_time: e.target.value })} />
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Faculty</label>
                        <select
                            className={`w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none ${currentConflicts.some(c => c.type === 'faculty') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                            value={newEntry.assigned_faculty_id}
                            onChange={e => setNewEntry({ ...newEntry, assigned_faculty_id: e.target.value })}
                        >
                            <option value="">Select Faculty</option>
                            {facultyList.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Room No</label>
                        <input
                            placeholder="E503"
                            className={`w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none ${currentConflicts.some(c => c.type === 'room') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                            required
                            value={newEntry.room_no}
                            onChange={e => setNewEntry({ ...newEntry, room_no: e.target.value })}
                        />
                    </div>

                    {currentConflicts.length > 0 && (
                        <div className="col-span-1 sm:col-span-4 lg:col-span-6 bg-red-50 border-2 border-red-200 p-4 rounded-xl flex items-start gap-3 animate-pulse">
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-black text-red-700 uppercase tracking-tight">Timetable Clash Detected</h4>
                                <ul className="mt-1 space-y-1">
                                    {currentConflicts.map((c, i) => (
                                        <li key={i} className="text-xs font-bold text-red-600 flex items-center gap-1">
                                            <span>•</span> {c.msg}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    <div className="col-span-1 sm:col-span-4 lg:col-span-6 flex justify-end mt-2">
                        <button type="submit" disabled={submitting} className={`w-full sm:w-auto px-8 font-medium py-2 rounded flex items-center justify-center transition-colors ${submitting ? 'bg-blue-400 cursor-wait' : currentConflicts.length > 0 ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
                            {submitting ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/50 border-t-white mr-2"></div> : currentConflicts.length > 0 ? <AlertCircle className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                            {submitting ? 'Adding Slot...' : currentConflicts.length > 0 ? 'Ignore & Add Anyway' : 'Add Slot'}
                        </button>
                    </div>
                </form>
            </div>

            {/* FILTERS & SORTING */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 mb-8 no-print">
                <div className="flex flex-col lg:flex-row gap-6 items-end">
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {/* Filter Division (Prominent) */}
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Select Division</label>
                            <select
                                className="w-full border-2 border-blue-100 bg-blue-50/50 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-blue-700 font-bold transition-all"
                                value={filters.division}
                                onChange={e => setFilters({ ...filters, division: e.target.value })}
                            >
                                <option value="">All Divisions</option>
                                {Array.from(new Set(entries.map(e => e.division))).sort().map(d => <option key={d} value={d}>Division {d}</option>)}
                            </select>
                        </div>

                        {/* Filter Semester */}
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Semester</label>
                            <select
                                className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                value={filters.semester}
                                onChange={e => setFilters({ ...filters, semester: e.target.value })}
                            >
                                <option value="">All Semesters</option>
                                {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].map(s => <option key={s} value={s}>Semester {s}</option>)}
                            </select>
                        </div>

                        {/* Filter Faculty */}
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Faculty</label>
                            <select
                                className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                value={filters.faculty}
                                onChange={e => setFilters({ ...filters, faculty: e.target.value })}
                            >
                                <option value="">All Faculty</option>
                                {facultyList.sort((a, b) => (a.name || '').localeCompare(b.name || '')).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>
                        </div>

                        {/* Filter Day */}
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Day</label>
                            <select
                                className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                value={filters.day}
                                onChange={e => setFilters({ ...filters, day: e.target.value })}
                            >
                                <option value="">All Days</option>
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        {/* Filter Room */}
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Room / Search</label>
                            <input
                                placeholder="Search slots..."
                                className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                value={filters.room}
                                onChange={e => setFilters({ ...filters, room: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex lg:flex-col gap-2 w-full lg:w-48">
                        <select
                            className="flex-1 w-full border border-blue-200 bg-blue-50/30 p-2.5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 text-blue-600 font-black uppercase tracking-widest"
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                        >
                            <option value="day_time">Sort: Timing</option>
                            <option value="subject">Sort: Subject</option>
                            <option value="faculty">Sort: Faculty</option>
                            <option value="room">Sort: Room</option>
                        </select>
                        <button
                            onClick={() => {
                                setFilters({ faculty: '', room: '', division: '', day: '', semester: '' });
                                setSortBy('day_time');
                            }}
                            className="flex-1 w-full text-[10px] font-black text-red-500 hover:text-white hover:bg-red-500 border border-red-200 p-2.5 rounded-xl transition-all uppercase tracking-widest"
                        >
                            Reset All
                        </button>
                    </div>
                </div>
            </div>

            {/* VIEW TABS */}
            {/* VIEW MODE TABS */}
            <div className="flex border-b border-gray-200 mb-6 no-print tabs-container">
                <button
                    onClick={() => setViewMode('list')}
                    className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${viewMode === 'list' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    List View
                </button>
                <button
                    onClick={() => setViewMode('visual')}
                    className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${viewMode === 'visual' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    Visual Grid
                </button>
            </div>

            {/* TABLE LIST / VISUAL GRID */}
            {viewMode === 'list' ? (
                <div className="bg-white shadow-sm border border-gray-100 overflow-hidden sm:rounded-lg">
                    {/* ... list view content ... */}
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700">
                            Current Schedule {filteredEntries.length !== entries.length ? `(${filteredEntries.length} of ${entries.length} slots)` : `(${entries.length} slots)`}
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day/Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredEntries.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-gray-400">
                                            No entries found matching filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEntries.map(e => (
                                        <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                <span className="font-medium text-gray-900">{e.day_of_week}</span>
                                                <div className="text-xs text-gray-400 mt-0.5">{e.start_time} - {e.end_time}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">{e.subject_name}</div>
                                                <div className="text-xs text-blue-500">{e.semester} Sem | Div {e.division} {e.batch ? `| Batch ${e.batch}` : ''}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex items-center">
                                                    <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 mr-2 uppercase">
                                                        {(e.assigned_faculty?.name || 'U').charAt(0)}
                                                    </div>
                                                    <span className="text-gray-700">{e.assigned_faculty?.name || 'Unassigned'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 font-mono text-xs">{e.room_no}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                                <button onClick={() => handleDelete(e.id)} className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors">
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="space-y-12">
                    {filters.division && filters.semester ? (
                        (() => {
                            const sem = filters.semester;
                            const div = filters.division;
                            const divEntries = filteredEntries;

                            // Derive Year (FE/SE/TE/BE)
                            const yearMap = {
                                'I': 'FE', 'II': 'FE',
                                'III': 'SE', 'IV': 'SE',
                                'V': 'TE', 'VI': 'TE',
                                'VII': 'BE', 'VIII': 'BE'
                            };
                            const year = yearMap[sem] || '??';

                            return (
                                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden printable-grid animation-fade-in">
                                    <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex justify-between items-center group">
                                        <h3 className="text-xl font-black text-gray-900 italic uppercase flex items-center gap-3">
                                            <div className="w-2 h-8 bg-blue-600 rounded-full group-hover:h-10 transition-all"></div>
                                            {year} - Semester {sem} - Division {div}
                                        </h3>
                                        <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-widest border border-blue-100 shadow-sm">
                                            {divEntries.length} Slots Found
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50/30 border-b border-gray-100">
                                                    <th className="p-6 sticky left-0 z-20 bg-gray-50 border-r border-gray-100 min-w-[120px]">
                                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time / Day</div>
                                                    </th>
                                                    {days.map(day => (
                                                        <th key={day} className="p-6 min-w-[240px] border-r border-gray-50/50">
                                                            <div className="text-sm font-black text-gray-900 uppercase tracking-tight">{day}</div>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {timeSlots.map((time, timeIdx) => (
                                                    <tr key={time} className="group hover:bg-gray-50/20 transition-colors">
                                                        <td className="p-6 sticky left-0 z-20 bg-white group-hover:bg-gray-50 text-center border-r border-gray-100">
                                                            <div className="text-sm font-black text-gray-900 tabular-nums">{time}</div>
                                                            <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase italic">to {timeSlots[timeIdx + 1] || '18:00'}</div>
                                                        </td>
                                                        {days.map(day => {
                                                            const lectures = divEntries.filter(s =>
                                                                s.day_of_week === day &&
                                                                s.start_time?.startsWith(time.split(':')[0])
                                                            );

                                                            return (
                                                                <td key={`${day}-${time}`} className="p-3 min-w-[240px] align-top relative border-r border-gray-50/30">
                                                                    {lectures.length > 0 ? (
                                                                        <div className={`grid ${lectures.length > 1 ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'} gap-3`}>
                                                                            {lectures.map(lecture => (
                                                                                <div
                                                                                    key={lecture.id}
                                                                                    className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] hover:shadow-xl active:scale-95 cursor-pointer flex flex-col gap-2 relative group-item ${(lecture.subject_type || '').toLowerCase().includes('lab')
                                                                                        ? 'bg-green-50/50 border-green-100 hover:border-green-300'
                                                                                        : 'bg-blue-50/50 border-blue-100 hover:border-blue-300'
                                                                                        }`}
                                                                                >
                                                                                    <button
                                                                                        onClick={(e) => { e.stopPropagation(); handleDelete(lecture.id); }}
                                                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-red-100 text-red-400 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center opacity-0 group-item:opacity-100 transition-all shadow-sm z-10"
                                                                                    >
                                                                                        <Trash2 className="h-3 w-3" />
                                                                                    </button>

                                                                                    <div className="flex justify-between items-start gap-2">
                                                                                        <h4 className="text-sm font-black text-gray-900 leading-tight">
                                                                                            {lecture.subject_name}
                                                                                        </h4>
                                                                                        <span className={`text-[8px] px-2 py-0.5 rounded-lg font-black uppercase whitespace-nowrap ${(lecture.subject_type || '').toLowerCase().includes('lab')
                                                                                            ? 'bg-green-200 text-green-800'
                                                                                            : 'bg-blue-200 text-blue-800'
                                                                                            }`}>
                                                                                            {lecture.subject_type}
                                                                                        </span>
                                                                                    </div>

                                                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                                                        <div className="flex items-center text-[10px] font-black text-blue-600">
                                                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5 ring-2 ring-blue-100"></div>
                                                                                            {lecture.assigned_faculty?.name || 'Unassigned'}
                                                                                        </div>
                                                                                        <div className="flex items-center text-[10px] font-bold text-gray-500">
                                                                                            <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                                                                                            {lecture.room_no}
                                                                                        </div>
                                                                                        {lecture.batch && (
                                                                                            <div className="text-[10px] font-black text-green-600 uppercase tracking-tighter bg-green-100 px-1.5 rounded">
                                                                                                Batch {lecture.batch}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="h-full min-h-[100px] flex items-center justify-center border-2 border-dashed border-gray-50/50 rounded-2xl group-hover:border-gray-100 transition-colors">
                                                                            {/* Empty Slot */}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })()
                    ) : (
                        <div className="bg-white rounded-[2rem] p-24 text-center border-2 border-dashed border-gray-100 shadow-sm animation-float">
                            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-blue-100 shadow-inner">
                                <Search className="h-10 w-10 text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 uppercase italic tracking-tight">Select Division & Semester</h3>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-3 max-w-sm mx-auto leading-relaxed">
                                Please use the filters above to select a specific <span className="text-blue-600">Class</span> to manage their timetable
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* SCHEDULE SUMMARY / AUDIT SECTION */}
            {!loading && entries.length > 0 && (
                <div className="mt-12 bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden no-print">
                    <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                <Calculator className="h-5 w-5 text-blue-600" />
                                Schedule <span className="text-blue-600">Audit Summary</span>
                            </h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Verification of weekly lecture & lab coverage</p>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.entries((filters.division ? filteredEntries : entries).reduce((acc, e) => {
                                const key = `${e.semester}-${e.division}`;
                                if (!acc[key]) acc[key] = { lectures: 0, labs: { B1: 0, B2: 0, B3: 0, B4: 0, Entire: 0 }, total: 0 };
                                const isLab = (e.subject_type || '').toLowerCase().includes('lab');
                                if (isLab) {
                                    if (e.batch) acc[key].labs[e.batch] = (acc[key].labs[e.batch] || 0) + 1;
                                    else acc[key].labs.Entire = (acc[key].labs.Entire || 0) + 1;
                                } else {
                                    acc[key].lectures++;
                                }
                                acc[key].total++;
                                return acc;
                            }, {})).sort().map(([div, stats]) => (
                                <div key={div} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:border-blue-200 transition-colors">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-lg font-black text-gray-900 italic">DIV {div}</span>
                                        <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-1 rounded-lg uppercase">
                                            {stats.total} Total Slots
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm font-bold text-gray-600">
                                            <span>Theoretical Lectures</span>
                                            <span className="text-blue-600 px-2 py-0.5 bg-blue-50 rounded-md">{stats.lectures}</span>
                                        </div>

                                        <div className="h-px bg-gray-200 my-2"></div>

                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Practical Batches</div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {Object.entries(stats.labs).map(([batch, count]) => (
                                                <div key={batch} className={`flex justify-between items-center p-2 rounded-xl border ${count > 0 ? 'bg-green-50 border-green-100' : 'bg-gray-100/50 border-gray-100 opacity-50'}`}>
                                                    <span className="text-[10px] font-black text-gray-600">{batch}</span>
                                                    <span className={`text-[10px] font-black ${count > 0 ? 'text-green-700' : 'text-gray-400'}`}>{count} Labs</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Status Check */}
                                        <div className="mt-4 pt-3 border-t border-dashed border-gray-200">
                                            {stats.lectures > 0 && Object.values(stats.labs).some(c => c > 0) ? (
                                                <div className="flex items-center gap-2 text-[9px] font-black text-green-600 uppercase">
                                                    <Check className="h-3 w-3" /> Balanced Schedule
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-[9px] font-black text-orange-500 uppercase">
                                                    <AlertCircle className="h-3 w-3" /> Coverage Check Recommended
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
