import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Plus, Trash2, Save, Upload, FileText, AlertCircle, Check, Download } from 'lucide-react';
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
        division: ''
    });

    // New Entry State
    const [newEntry, setNewEntry] = useState({
        semester: 'VI',
        division: 'A',
        batch_strength: 60,
        subject_name: '',
        subject_type: 'IT',
        day_of_week: 'Monday',
        start_time: '10:00:00',
        end_time: '11:00:00',
        room_no: '',
        assigned_faculty_id: ''
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
                    conflicts.push(`${entry.room_no} is already occupied by ${existing.subject_name}`);
                }
                // 2. Faculty Conflict
                if (entry.assigned_faculty_id && existing.assigned_faculty_id === entry.assigned_faculty_id) {
                    const facultyName = facultyList.find(f => f.id === entry.assigned_faculty_id)?.name || 'This faculty';
                    conflicts.push(`${facultyName} is already assigned to ${existing.subject_name}`);
                }
                // 3. Division Conflict
                if (existing.semester === entry.semester && existing.division === entry.division) {
                    conflicts.push(`Division ${entry.semester}-${entry.division} already has ${existing.subject_name} scheduled`);
                }
            }
        });

        return conflicts;
    };

    const handleAdd = async (e) => {
        e.preventDefault();

        // Conflict Check
        const conflicts = checkConflicts(newEntry);
        if (conflicts.length > 0) {
            const proceed = window.confirm(
                `POTENTIAL CONFLICTS DETECTED:\n\n` +
                conflicts.map(c => `• ${c}`).join('\n') +
                `\n\nDo you still want to save this slot?`
            );
            if (!proceed) return;
        }

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
        return matchFaculty && matchRoom && matchDivision;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Timetable Setup (Admin)</h1>
                <div className="flex gap-2">
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
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-sm"
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Bulk Import (Excel/PDF)
                    </button>
                    <button
                        onClick={() => {
                            try {
                                exportToExcel(entries);
                                toast.success('Exporting Timetable...');
                            } catch (err) {
                                console.error('Export error:', err);
                                toast.error('Failed to export: ' + err.message);
                            }
                        }}
                        disabled={entries.length === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export to Excel
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('Are you sure? This will delete all current slots!')) {
                                entries.forEach(e => api.timetable.delete(e.id));
                                setTimeout(loadData, 1000);
                                toast.success('Clearing timetable...');
                            }
                        }}
                        className="text-red-600 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-lg flex items-center transition-colors"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All
                    </button>
                </div>
            </div>

            {/* INFO ALERT */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            <strong>Tip:</strong> For best results with Excel import, use columns like: <code className="bg-blue-100 px-1 rounded">Subject</code>, <code className="bg-blue-100 px-1 rounded">Day</code>, <code className="bg-blue-100 px-1 rounded">Start Time</code>, <code className="bg-blue-100 px-1 rounded">End Time</code>, <code className="bg-blue-100 px-1 rounded">Faculty</code>, and <code className="bg-blue-100 px-1 rounded">Room</code>.
                        </p>
                        <p className="text-xs text-blue-500 mt-1 italic">
                            If you encounter a "Worker failed" error, please refresh the page (Ctrl + F5).
                        </p>
                    </div>
                </div>
            </div>

            {/* ADD FORM */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <Plus className="h-5 w-5 mr-2 text-blue-600" />
                    Add Individual Slot
                </h3>
                <form onSubmit={handleAdd} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <div className="col-span-1">
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
                        <label className="block text-xs font-medium text-gray-500 mb-1">Day of Week</label>
                        <select
                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newEntry.day_of_week}
                            onChange={e => setNewEntry({ ...newEntry, day_of_week: e.target.value })}
                        >
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Start Time</label>
                        <input type="time" className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={newEntry.start_time} onChange={e => setNewEntry({ ...newEntry, start_time: e.target.value })} />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">End Time</label>
                        <input type="time" className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={newEntry.end_time} onChange={e => setNewEntry({ ...newEntry, end_time: e.target.value })} />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Faculty</label>
                        <select
                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
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
                        <label className="block text-xs font-medium text-gray-500 mb-1">Room No (e.g. E503)</label>
                        <input
                            placeholder="E503"
                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                            value={newEntry.room_no}
                            onChange={e => setNewEntry({ ...newEntry, room_no: e.target.value })}
                        />
                    </div>

                    <div className="col-span-2 flex items-end">
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded flex items-center justify-center transition-colors">
                            <Plus className="h-4 w-4 mr-2" /> Add to Timetable
                        </button>
                    </div>
                </form>
            </div>

            {/* FILTERS */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Filter Faculty</label>
                    <select
                        className="w-full border border-gray-300 p-2 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
                        value={filters.faculty}
                        onChange={e => setFilters({ ...filters, faculty: e.target.value })}
                    >
                        <option value="">All Faculty</option>
                        {facultyList.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Filter Room</label>
                    <input
                        placeholder="Search room..."
                        className="w-full border border-gray-300 p-2 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
                        value={filters.room}
                        onChange={e => setFilters({ ...filters, room: e.target.value })}
                    />
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Filter Division</label>
                    <select
                        className="w-full border border-gray-300 p-2 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
                        value={filters.division}
                        onChange={e => setFilters({ ...filters, division: e.target.value })}
                    >
                        <option value="">All Divisions</option>
                        {Array.from(new Set(entries.map(e => e.division))).sort().map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <button
                    onClick={() => setFilters({ faculty: '', room: '', division: '' })}
                    className="text-xs font-medium text-blue-600 mb-2 hover:underline"
                >
                    Clear Filters
                </button>
            </div>

            {/* TABLE LIST */}
            <div className="bg-white shadow-sm border border-gray-100 overflow-hidden sm:rounded-lg">
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
                                            <div className="text-xs text-blue-500">{e.semester} Sem | Div {e.division}</div>
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
        </div>
    );
}
