import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, Save, CheckSquare, Square, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AttendanceTaker() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timetableEntry, setTimetableEntry] = useState(null);
    const [selectedStudents, setSelectedStudents] = useState(new Set());
    const [selectedBatch, setSelectedBatch] = useState('All');

    // Key for local storage persistence
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `attendance_${id}_${today}`;

    useEffect(() => {
        async function loadData() {
            try {
                // Fetch Timetable Info
                const { data: allTimetable } = await api.timetable.getAll();
                const entry = allTimetable?.find(t => t.id === id);
                setTimetableEntry(entry);

                if (entry) {
                    // Fetch all students for this division to allow batch filtering
                    const { data: studentData } = await api.students.list({
                        division: entry.division
                    });
                    setStudents(studentData || []);

                    // Set default filter if entry has a batch
                    if (entry.batch) {
                        setSelectedBatch(entry.batch);
                    }

                    // Load saved attendance from local storage
                    const saved = localStorage.getItem(storageKey);
                    if (saved) {
                        const parsed = JSON.parse(saved);
                        setSelectedStudents(new Set(parsed.selectedIds));
                    }
                }
            } catch (error) {
                console.error(error);
                toast.error('Failed to load session details');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id, storageKey]);

    const filteredStudents = selectedBatch === 'All'
        ? students
        : students.filter(s => s.batch === selectedBatch);

    const availableBatches = ['All', ...new Set(students.map(s => s.batch).filter(Boolean))].sort();

    const toggleStudent = (studentId) => {
        const newSelected = new Set(selectedStudents);
        if (newSelected.has(studentId)) {
            newSelected.delete(studentId);
        } else {
            newSelected.add(studentId);
        }
        setSelectedStudents(newSelected);
        saveToStorage(newSelected);
    };

    const markAll = (present) => {
        if (present) {
            const allIds = filteredStudents.map(s => s.id);
            const newSet = new Set([...selectedStudents, ...allIds]);
            setSelectedStudents(newSet);
            saveToStorage(newSet);
        } else {
            // Only reset visible students or reset all? 
            // Resetting only visible seems more intuitive for "filtering"
            const visibleIds = new Set(filteredStudents.map(s => s.id));
            const newSet = new Set([...selectedStudents].filter(id => !visibleIds.has(id)));
            setSelectedStudents(newSet);
            saveToStorage(newSet);
        }
    };

    const saveToStorage = (currentSet) => {
        const data = {
            selectedIds: Array.from(currentSet),
            count: currentSet.size,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(storageKey, JSON.stringify(data));
    };

    const handleSaveAndExit = () => {
        saveToStorage(selectedStudents);
        toast.success('Attendance Synced with DLR Audit');
        navigate(`/entry/${id}`);
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!timetableEntry) return <div className="p-10 text-center">Session not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-30 flex items-center justify-between shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                    <ArrowLeft className="h-6 w-6 text-gray-900" />
                </button>
                <div className="text-center">
                    <h1 className="text-sm font-black text-gray-900 uppercase tracking-tight">Attendance</h1>
                    <p className="text-[10px] items-center text-gray-500 font-bold uppercase tracking-wide">
                        {timetableEntry.subject_name} ({timetableEntry.division}{timetableEntry.batch ? ` - ${timetableEntry.batch}` : ''})
                    </p>
                </div>
                <div className="w-10"></div>
            </div>

            <div className="max-w-xl mx-auto px-4 mt-6">

                {/* Stats Card */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center mb-6">
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Present</p>
                        <p className="text-2xl font-black text-green-600">{selectedStudents.size}</p>
                    </div>
                    <div className="h-8 w-px bg-gray-100"></div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Absent</p>
                        <p className="text-2xl font-black text-red-500">{students.length - selectedStudents.size}</p>
                    </div>
                    <div className="h-8 w-px bg-gray-100"></div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total</p>
                        <p className="text-2xl font-black text-gray-800">{students.length}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => markAll(true)}
                        className="flex-1 py-2 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-blue-100 transition-colors"
                    >
                        Mark Visible Present
                    </button>
                    <button
                        onClick={() => markAll(false)}
                        className="flex-1 py-2 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Reset Visible
                    </button>
                </div>

                {/* Batch Filter */}
                {availableBatches.length > 1 && (
                    <div className="mb-6">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">Filter by Batch</p>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                            {availableBatches.map(batch => (
                                <button
                                    key={batch}
                                    onClick={() => setSelectedBatch(batch)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedBatch === batch
                                            ? 'bg-gray-900 text-white shadow-lg'
                                            : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                                        }`}
                                >
                                    {batch === 'All' ? 'All Students' : `Batch ${batch}`}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* List */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {filteredStudents.length === 0 ? (
                        <div className="p-10 text-center">
                            <Users className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                            <p className="text-gray-400 text-sm">No students found for {timetableEntry.division} {selectedBatch !== 'All' ? ` (Batch ${selectedBatch})` : ''}</p>
                        </div>
                    ) : (
                        filteredStudents.map((student) => {
                            const isSelected = selectedStudents.has(student.id);
                            return (
                                <div
                                    key={student.id}
                                    onClick={() => toggleStudent(student.id)}
                                    className={`flex items-center justify-between p-4 border-b border-gray-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {student.roll_no}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                                                {student.name}
                                            </p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                                                Roll No: {student.roll_no}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`p-1 rounded-lg ${isSelected ? 'text-blue-600' : 'text-gray-300'}`}>
                                        {isSelected ? <CheckSquare className="h-6 w-6" /> : <Square className="h-6 w-6" />}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Floating Action Button for Save */}
            <div className="fixed bottom-6 left-0 right-0 px-4 max-w-xl mx-auto z-20">
                <button
                    onClick={handleSaveAndExit}
                    className="w-full bg-gray-900 text-white font-black text-sm uppercase tracking-widest py-4 rounded-3xl shadow-2xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    <Save className="h-5 w-5" />
                    Sync & Return to DLR
                </button>
            </div>
        </div>
    );
}
