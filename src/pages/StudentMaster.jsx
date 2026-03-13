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
        batch: '',
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

    const handleClearAll = async () => {
        if (!confirm('CRITICAL: This will permanently delete ALL student records. This action cannot be undone. Are you absolutely sure?')) return;
        if (!confirm('Final confirmation: Delete all students for academic year reset?')) return;

        setLoading(true);
        try {
            await api.students.deleteAll();
            toast.success('All student records cleared');
            loadStudents();
        } catch (error) {
            console.error(error);
            toast.error('Failed to clear students: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (filteredStudents.length === 0) {
            toast.error('No data to export');
            return;
        }

        const data = filteredStudents.map(s => ({
            'Roll No': s.roll_no,
            'Name': s.name,
            'Year': s.year,
            'Division': s.division,
            'Batch': s.batch || 'N/A',
            'Branch': s.branch
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Students");

        const fileName = `StudentMaster_${filters.year || 'ALL'}_${filters.division || 'ALL'}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        toast.success('Exported to Excel');
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImporting(true);
        const toastId = toast.loading('Reading workbook...');

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            let allImportedStudents = [];

            // 1. Identify Year from filename
            const fileName = file.name.toUpperCase();
            let detectedYear = '';
            if (fileName.includes('FE')) detectedYear = 'FE';
            else if (fileName.includes('SE')) detectedYear = 'SE';
            else if (fileName.includes('TE')) detectedYear = 'TE';
            else if (fileName.includes('BE')) detectedYear = 'BE';

            // Ask user to confirm year for the WHOLE file to be safe
            const finalYear = prompt(`Detected Year: ${detectedYear || 'Unknown'}. Please confirm the Year (FE/SE/TE/BE) for this file:`, detectedYear || 'TE');

            if (!finalYear || !['FE', 'SE', 'TE', 'BE'].includes(finalYear.toUpperCase())) {
                toast.error('Invalid year. Import cancelled.', { id: toastId });
                setImporting(false);
                return;
            }
            const academicYear = finalYear.toUpperCase();

            for (const sheetName of workbook.SheetNames) {
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

                if (jsonData.length === 0) continue;

                // Identify Division and Batch from sheet name
                let sheetDivision = 'A';
                let sheetBatch = null;

                const nameUpper = sheetName.toUpperCase();

                // If sheet name is something like "B1" or "BATCH 1"
                const sheetBatchMatch = nameUpper.match(/BATCH\s?(\d|I+)/) || nameUpper.match(/\bB(\d)\b/);
                if (sheetBatchMatch) {
                    let b = sheetBatchMatch[1];
                    if (b === 'I') b = '1';
                    sheetBatch = 'B' + b;
                }

                // Try to find Division (A-D)
                const divMatch = nameUpper.match(/\b([A-D])\b/);
                if (divMatch) {
                    sheetDivision = divMatch[1];
                }

                console.log(`Parsing Sheet: ${sheetName} -> Div: ${sheetDivision}, Batch: ${sheetBatch || 'None'}`);

                // Find Header Row
                let headerRow = -1;
                let rollIdx = -1, nameIdx = -1;

                for (let i = 0; i < Math.min(jsonData.length, 50); i++) {
                    const row = (jsonData[i] || []).map(v => String(v || '').toLowerCase().trim());

                    // Specific search for Roll No
                    let roll = row.findIndex(v => v === 'roll no' || v === 'rollno' || v === 'roll' || v === 'roll_no');
                    if (roll === -1) roll = row.findIndex(v => v.includes('roll') && !v.includes('name'));

                    // Specific search for Name
                    let name = row.findIndex(v => v === 'name' || v === 'student name' || v === 'candidate name' || v === 'student_name');
                    if (name === -1) name = row.findIndex(v => v.includes('name') && !v.includes('roll'));
                    if (name === -1) name = row.findIndex(v => v.includes('student') && !v.includes('roll'));

                    if (roll !== -1 && name !== -1 && roll !== name) {
                        headerRow = i;
                        rollIdx = roll;
                        nameIdx = name;
                        break;
                    }
                }

                if (headerRow === -1) continue;

                let currentBatch = sheetBatch; // Start with sheet-level batch

                for (let i = headerRow + 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (!row || row.length === 0) continue;

                    const rollVal = String(row[rollIdx] || '').trim();
                    const nameVal = String(row[nameIdx] || '').trim();

                    // Detect Batch Indicators in Row
                    const rowStr = row.join(' ');
                    if (rowStr.includes('Batch') || rowStr.includes('Group') || /\bB[1-4]\b/.test(rowStr)) {
                        const batchMatch = rowStr.match(/Batch\s?(\d|I+)/i) || rowStr.match(/\bB(\d)\b/i) || rowStr.match(/Group\s?(\d)/i);
                        if (batchMatch) {
                            let b = batchMatch[1].toUpperCase();
                            if (b === 'I') b = '1';
                            currentBatch = 'B' + b;
                        }
                        // Don't continue if there's a roll number in this row too (rare but possible)
                        if (!rollVal || !/\d/.test(rollVal)) continue;
                    }

                    // Skip invalid roll numbers
                    if (!rollVal || rollVal === 'undefined' || rollVal === 'null' || !/\d/.test(rollVal)) {
                        continue;
                    }

                    allImportedStudents.push({
                        roll_no: rollVal,
                        name: nameVal,
                        division: sheetDivision,
                        year: academicYear,
                        branch: 'IT',
                        batch: currentBatch || null
                    });
                }
            }

            if (allImportedStudents.length === 0) {
                toast.error('No valid student data found in file', { id: toastId });
                return;
            }

            // Deduplicate: If the same student (Roll + Year + Div) appears twice in the SAME file, 
            // PostgREST upsert will fail with "cannot affect row a second time".
            // Priority: Keep the record that HAS a batch if duplicates are found.
            const uniqueStudentsMap = new Map();
            for (const s of allImportedStudents) {
                const key = `${s.roll_no}-${s.year}-${s.division}`.toUpperCase();
                if (!uniqueStudentsMap.has(key) || (!uniqueStudentsMap.get(key).batch && s.batch)) {
                    uniqueStudentsMap.set(key, s);
                }
            }
            const uniqueStudents = Array.from(uniqueStudentsMap.values());

            const proceed = confirm(`Found ${uniqueStudents.length} unique students for ${academicYear}.\nReady to IMPORT (Append) these records?`);

            if (!proceed) {
                toast.dismiss(toastId);
                setImporting(false);
                return;
            }

            toast.loading(`Uploading ${uniqueStudents.length} students...`, { id: toastId });
            await api.students.bulkCreate(uniqueStudents);

            toast.success(`Successfully imported ${uniqueStudents.length} students for ${academicYear}`, { id: toastId });
            loadStudents();
        } catch (error) {
            console.error(error);
            toast.error('Import failed: ' + (error.message || 'Unknown error'), { id: toastId });
        } finally {
            setImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const filteredStudents = students.filter(s => {
        const matchDiv = !filters.division || s.division === filters.division;
        const matchYear = !filters.year || s.year === filters.year;
        const matchBatch = !filters.batch || s.batch === filters.batch;
        const matchSearch = !filters.search ||
            s.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            s.roll_no.toString().includes(filters.search);
        return matchDiv && matchYear && matchBatch && matchSearch;
    }).sort((a, b) => a.roll_no.localeCompare(b.roll_no, undefined, { numeric: true }));

    const years = ['FE', 'SE', 'TE', 'BE'];
    const divisions = ['A', 'B', 'C', 'D'];
    const batches = ['B1', 'B2', 'B3', 'B4'];

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
                        onClick={handleExport}
                        className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl flex items-center text-sm font-bold hover:bg-gray-50 transition-all"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </button>
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="bg-gray-900 border border-transparent text-white px-4 py-2 rounded-xl flex items-center text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-200"
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Quick Import
                    </button>
                    <button
                        onClick={handleClearAll}
                        className="bg-red-50 text-red-600 px-4 py-2 rounded-xl flex items-center text-sm font-bold hover:bg-red-100 transition-all"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All
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
                <select
                    className="border-gray-200 border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={filters.batch}
                    onChange={e => setFilters({ ...filters, batch: e.target.value })}
                >
                    <option value="">All Batches</option>
                    {batches.map(b => <option key={b} value={b}>{b}</option>)}
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
