import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Plus, Trash2, Upload, FileText, Users, Search, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

export default function StudentMaster() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef(null);

    // Filter State
    const [filters, setFilters] = useState({
        division: '',
        year: '',
        search: ''
    });

    // New Student State
    const [newStudent, setNewStudent] = useState({
        roll_no: '',
        name: '',
        branch: 'IT',
        division: 'A',
        year: 'TE',
        semester: 'VI',
        batch: ''
    });

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            const { data } = await api.students.list();
            setStudents(data || []);
        } catch (error) {
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.students.create(newStudent);
            toast.success('Student added successfully');
            setNewStudent(prev => ({ ...prev, roll_no: '', name: '' }));
            loadStudents();
        } catch (error) {
            toast.error('Failed to add student');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this student?')) return;
        try {
            await api.students.delete(id);
            toast.success('Student deleted');
            loadStudents();
        } catch (error) {
            toast.error('Failed to delete student');
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImporting(true);
        const toastId = toast.loading('Reading file...');

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            // Map keys (handle common variations)
            const mappedStudents = jsonData.map(row => {
                const roll = row['Roll No'] || row['Roll'] || row['roll_no'] || row['RollNo'];
                const name = row['Name'] || row['Student Name'] || row['Full Name'];
                const div = row['Division'] || row['Div'] || newStudent.division;
                const year = row['Year'] || newStudent.year;

                if (!roll || !name) return null;

                return {
                    roll_no: roll.toString(),
                    name: name,
                    division: div.toString().toUpperCase(),
                    year: year.toString().toUpperCase(),
                    branch: row['Branch'] || 'IT',
                    batch: row['Batch'] || row['batch'] || ''
                };
            }).filter(Boolean);

            if (mappedStudents.length === 0) {
                toast.error('No valid student data found in file', { id: toastId });
                return;
            }

            if (confirm(`Found ${mappedStudents.length} students. Import them?`)) {
                await api.students.bulkCreate(mappedStudents);
                toast.success(`Successfully imported ${mappedStudents.length} students`, { id: toastId });
                loadStudents();
            } else {
                toast.dismiss(toastId);
            }
        } catch (error) {
            console.error(error);
            toast.error('Import failed: ' + error.message, { id: toastId });
        } finally {
            setImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const filteredStudents = students.filter(s => {
        const matchDiv = !filters.division || s.division === filters.division;
        const matchYear = !filters.year || s.year === filters.year;
        const matchSearch = !filters.search ||
            s.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            s.roll_no.toString().includes(filters.search);
        return matchDiv && matchYear && matchSearch;
    }).sort((a, b) => a.roll_no.localeCompare(b.roll_no, undefined, { numeric: true }));

    const years = ['FE', 'SE', 'TE', 'BE'];
    const divisions = ['A', 'B', 'C', 'D'];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Student Master</h1>
                    <p className="text-sm text-gray-500 font-medium">Manage student roll calls and divisions</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".xlsx, .xls"
                    />
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center text-sm font-bold transition-all shadow-lg shadow-green-100"
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Import Excel
                    </button>
                </div>
            </div>

            {/* Quick Add Form */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Plus className="h-4 w-4 text-blue-600" />
                    Add Individual Student
                </h3>
                <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Roll No</label>
                        <input
                            type="text"
                            required
                            className="w-full border-gray-200 border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newStudent.roll_no}
                            onChange={e => setNewStudent({ ...newStudent, roll_no: e.target.value })}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Student Name</label>
                        <input
                            type="text"
                            required
                            className="w-full border-gray-200 border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newStudent.name}
                            onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Year</label>
                        <select
                            className="w-full border-gray-200 border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newStudent.year}
                            onChange={e => setNewStudent({ ...newStudent, year: e.target.value })}
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Division</label>
                        <select
                            className="w-full border-gray-200 border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newStudent.division}
                            onChange={e => setNewStudent({ ...newStudent, division: e.target.value })}
                        >
                            {divisions.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Batch (Optional)</label>
                        <select
                            className="w-full border-gray-200 border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newStudent.batch}
                            onChange={e => setNewStudent({ ...newStudent, batch: e.target.value })}
                        >
                            <option value="">N/A</option>
                            <option value="B1">B1</option>
                            <option value="B2">B2</option>
                            <option value="B3">B3</option>
                            <option value="B4">B4</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-100 transition-all"
                        >
                            Add Student
                        </button>
                    </div>
                </form>
            </div >

            {/* Filters */}
            < div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap items-center gap-4" >
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or roll no..."
                        className="w-full pl-10 pr-4 py-2 border-gray-200 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={filters.search}
                        onChange={e => setFilters({ ...filters, search: e.target.value })}
                    />
                </div>
                <select
                    className="border-gray-200 border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={filters.year}
                    onChange={e => setFilters({ ...filters, year: e.target.value })}
                >
                    <option value="">All Years</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select
                    className="border-gray-200 border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={filters.division}
                    onChange={e => setFilters({ ...filters, division: e.target.value })}
                >
                    <option value="">All Divisions</option>
                    {divisions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div >

            {/* Students Table */}
            < div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden" >
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Roll No</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Branch</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Year/Div</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-4 h-12 bg-gray-50/50"></td>
                                    </tr>
                                ))
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <Users className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                                        <p className="text-gray-400 font-medium">No students found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map(student => (
                                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-900">
                                            {student.roll_no}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">{student.name}</div>
                                            <div className="text-[10px] text-gray-400 font-medium">Added on {new Date(student.created_at).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter">
                                                {student.branch}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="text-sm font-bold text-gray-700">{student.year} - {student.division}</div>
                                            {student.batch && <div className="text-[10px] font-black text-blue-600 uppercase">Batch {student.batch}</div>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => handleDelete(student.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div >
        </div >
    );
}
