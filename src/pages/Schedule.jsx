import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/useAuth';
import toast from 'react-hot-toast';
import { Calendar, Clock, MapPin, Search, Save, Trash2, Printer, Download, Filter, Activity, ChevronRight, Layers } from 'lucide-react';
import { exportToExcel } from '../utils/timetableParser';

export default function Schedule() {
    const { user } = useAuth();
    const [entries, setEntries] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [filters, setFilters] = useState({
        faculty: '',
        room: '',
        division: '',
        day: '',
        semester: ''
    });
    const [viewMode, setViewMode] = useState('visual'); // Default to visual for this page

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const { data: tt } = await api.timetable.getAll();
                const { data: fac } = await api.faculty.list();
                setEntries(tt || []);
                setFacultyList(fac || []);

                // If user is faculty, set their default filter
                if (user?.role === 'faculty' && fac) {
                    const myFaculty = fac.find(f => f.email === user.email);
                    if (myFaculty) {
                        setFilters(prev => ({ ...prev, faculty: myFaculty.id }));
                    }
                }
            } catch (error) {
                console.error('Failed to load schedule data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [user]);

    const filteredEntries = entries.filter(e => {
        const matchFaculty = !filters.faculty || e.assigned_faculty_id === filters.faculty;
        const matchRoom = !filters.room || e.room_no.toLowerCase().includes(filters.room.toLowerCase()) || e.subject_name.toLowerCase().includes(filters.room.toLowerCase());
        const matchDivision = !filters.division || e.division === filters.division;
        const matchDay = !filters.day || e.day_of_week === filters.day;
        const matchSemester = !filters.semester || e.semester === filters.semester;
        return matchFaculty && matchRoom && matchDivision && matchDay && matchSemester;
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100 border-t-blue-600"></div>
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Rendering Grid...</p>
        </div>
    );

    const activeFacultyName = filters.faculty ? facultyList.find(f => f.id === filters.faculty)?.name : null;

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in duration-1000">
            <style>
                {`
                @media print {
                    @page { size: landscape; margin: 1cm; }
                    body { background: white !important; }
                    .no-print, nav, header, aside, .tabs-container { display: none !important; }
                    .printable-grid { 
                        position: static !important;
                        width: 100% !important; 
                        border: 1px solid #eee !important;
                        margin-bottom: 2rem;
                    }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                `}
            </style>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 no-print">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-widest border border-blue-100 shadow-sm">
                        <Calendar className="h-3 w-3" />
                        <span>Academic Planner</span>
                    </div>
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                            Master <span className="text-blue-600">Timetable</span>
                        </h1>
                        <p className="mt-2 text-gray-500 font-medium">
                            {activeFacultyName ? (
                                <span className="flex items-center gap-2">
                                    Personal Schedule for <span className="text-gray-900 font-bold underline decoration-blue-500/30 decoration-4">{activeFacultyName}</span>
                                </span>
                            ) : 'Master institutional schedule covering all departments and faculty clusters.'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white p-4 rounded-[1.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
                    <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase border border-blue-100">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        Theory
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-[10px] font-black uppercase border border-green-100">
                        <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                        Lab
                    </div>
                </div>
            </div>

            {/* FILTERS SECTION */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 mb-10 no-print transition-all hover:shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                    <Filter className="h-4 w-4 text-blue-600" />
                    <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Filter Parameters</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Division</label>
                        <select
                            className="w-full bg-gray-50 border-2 border-transparent p-3.5 rounded-2xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-900 font-bold"
                            value={filters.division}
                            onChange={e => setFilters({ ...filters, division: e.target.value })}
                        >
                            <option value="">All Divisions</option>
                            {Array.from(new Set(entries.map(e => e.division))).sort().map(d => <option key={d} value={d}>Division {d}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Semester</label>
                        <select
                            className="w-full bg-gray-50 border-2 border-transparent p-3.5 rounded-2xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-900 font-bold"
                            value={filters.semester}
                            onChange={e => setFilters({ ...filters, semester: e.target.value })}
                        >
                            <option value="">All Semesters</option>
                            {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].map(s => <option key={s} value={s}>Semester {s}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Faculty</label>
                        <select
                            className="w-full bg-gray-50 border-2 border-transparent p-3.5 rounded-2xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-900 font-bold"
                            value={filters.faculty}
                            onChange={e => setFilters({ ...filters, faculty: e.target.value })}
                        >
                            <option value="">All Faculty</option>
                            {facultyList.sort((a, b) => (a.name || '').localeCompare(b.name || '')).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Day</label>
                        <select
                            className="w-full bg-gray-50 border-2 border-transparent p-3.5 rounded-2xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-900 font-bold"
                            value={filters.day}
                            onChange={e => setFilters({ ...filters, day: e.target.value })}
                        >
                            <option value="">All Days</option>
                            {days.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quick Search</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                placeholder="Room or Subject..."
                                className="w-full bg-gray-50 border-2 border-transparent p-3.5 pl-12 rounded-2xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-900 font-bold placeholder:text-gray-300"
                                value={filters.room}
                                onChange={e => setFilters({ ...filters, room: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-50 flex justify-end">
                    <button
                        onClick={() => setFilters({ faculty: '', room: '', division: '', day: '', semester: '' })}
                        className="px-6 py-3 text-[10px] font-black text-red-500 hover:text-white hover:bg-red-500 border-2 border-red-50 rounded-2xl transition-all uppercase tracking-widest active:scale-95"
                    >
                        Reset Application Filters
                    </button>
                </div>
            </div>

            {/* VIEW MODE TABS */}
            <div className="flex items-center gap-8 mb-8 no-print tabs-container border-b border-gray-100">
                <button
                    onClick={() => setViewMode('list')}
                    className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${viewMode === 'list' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    List Archive
                    {viewMode === 'list' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full"></div>}
                </button>
                <button
                    onClick={() => setViewMode('visual')}
                    className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${viewMode === 'visual' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Visual Intelligence Grid
                    {viewMode === 'visual' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full"></div>}
                </button>
            </div>

            {viewMode === 'list' ? (
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    {['Ref', 'Subject Cluster', 'Classification', 'Lead Faculty', 'Schedule', 'Venue'].map(h => (
                                        <th key={h} className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-50">
                                {filteredEntries.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <Layers className="h-10 w-10 text-gray-200 mb-4" />
                                                <p className="text-sm font-bold text-gray-400">No synchronized entries found for the current selection.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEntries.map((e, idx) => (
                                        <tr key={e.id} className="hover:bg-blue-50/30 transition-colors group cursor-default">
                                            <td className="px-8 py-5 whitespace-nowrap text-[10px] font-black text-gray-300 group-hover:text-blue-200 uppercase tabular-nums">#{e.id.slice(0, 4)}</td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors">{e.subject_name}</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{e.subject_type}</div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="inline-flex items-center px-2.5 py-1 bg-gray-50 rounded-lg text-[10px] font-black text-gray-600 uppercase border border-gray-100 italic">
                                                    Sem {e.semester} • Div {e.division} {e.batch && `[B${e.batch}]`}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600 border border-blue-200">
                                                        {e.assigned_faculty?.name?.split(' ').map(n => n[0]).join('') || '?'}
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-700">{e.assigned_faculty?.name || 'Unassigned'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="text-sm font-black text-gray-900">{e.day_of_week}</div>
                                                <div className="text-[10px] font-bold text-gray-400 tabular-nums uppercase">{e.start_time?.slice(0, 5)} - {e.end_time?.slice(0, 5)}</div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm font-black text-gray-900">
                                                    <MapPin className="h-3.5 w-3.5 text-blue-500" />
                                                    {e.room_no}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="space-y-16">
                    {filters.division && filters.semester ? (
                        (() => {
                            const sem = filters.semester;
                            const div = filters.division;
                            const divEntries = filteredEntries;

                            const yearMap = {
                                'I': 'FE', 'II': 'FE',
                                'III': 'SE', 'IV': 'SE',
                                'V': 'TE', 'VI': 'TE',
                                'VII': 'BE', 'VIII': 'BE'
                            };
                            const year = yearMap[sem] || '??';

                            return (
                                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/40 border border-gray-100 overflow-hidden printable-grid animation-fade-in relative">
                                    <div className="bg-gray-900 p-8 flex justify-between items-center group overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                                            <Layers className="h-32 w-32 text-white" />
                                        </div>
                                        <h3 className="relative z-10 text-2xl font-black text-white italic uppercase flex items-center gap-4">
                                            <div className="w-1.5 h-10 bg-blue-600 rounded-full shrink-0"></div>
                                            {year} <span className="text-gray-500 font-light">/</span> Semester {sem} <span className="text-gray-500 font-light">/</span> Division {div}
                                        </h3>
                                        <div className="relative z-10 text-[10px] font-black text-blue-400 bg-white/5 px-6 py-2.5 rounded-2xl uppercase tracking-[0.2em] border border-white/10 backdrop-blur-md">
                                            {divEntries.length} Active Slots
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                                    <th className="p-8 sticky left-0 z-20 bg-gray-50/80 backdrop-blur-md border-r border-gray-100 min-w-[140px]">
                                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Timeline</div>
                                                    </th>
                                                    {days.map(day => (
                                                        <th key={day} className="p-8 min-w-[280px] border-r border-gray-50/50 group/th">
                                                            <div className="text-base font-black text-gray-900 uppercase tracking-tight group-hover/th:text-blue-600 transition-colors">{day}</div>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {timeSlots.map((time, timeIdx) => (
                                                    <tr key={time} className="group hover:bg-gray-50/30 transition-colors">
                                                        <td className="p-8 sticky left-0 z-20 bg-white group-hover:bg-gray-50 text-center border-r border-gray-100">
                                                            <div className="text-lg font-black text-gray-900 tabular-nums leading-none mb-2">{time}</div>
                                                            <div className="text-[10px] font-black text-gray-300 uppercase italic tracking-widest">{timeSlots[timeIdx + 1] || '18:00'}</div>
                                                        </td>
                                                        {days.map(day => {
                                                            const lectures = divEntries.filter(s =>
                                                                s.day_of_week === day &&
                                                                s.start_time?.startsWith(time.split(':')[0])
                                                            );

                                                            return (
                                                                <td key={`${day}-${time}`} className="p-4 min-w-[280px] align-top relative border-r border-gray-50/30">
                                                                    {lectures.length > 0 ? (
                                                                        <div className={`grid ${lectures.length > 1 ? 'grid-cols-1' : 'grid-cols-1'} gap-4`}>
                                                                            {lectures.map(lecture => (
                                                                                <div
                                                                                    key={lecture.id}
                                                                                    className={`group/card p-6 rounded-[2rem] border-2 transition-all hover:shadow-2xl active:scale-95 cursor-pointer flex flex-col gap-4 relative overflow-hidden ${(lecture.subject_type || '').toLowerCase().includes('lab')
                                                                                            ? 'bg-green-50/30 border-green-100/50 hover:border-green-300 hover:bg-white'
                                                                                            : 'bg-blue-50/30 border-blue-100/50 hover:border-blue-300 hover:bg-white'
                                                                                        }`}
                                                                                >
                                                                                    <div className="flex justify-between items-start gap-3">
                                                                                        <h4 className="text-lg font-black text-gray-900 leading-tight tracking-tight group-hover/card:text-blue-600 transition-colors">
                                                                                            {lecture.subject_name}
                                                                                        </h4>
                                                                                        <span className={`px-2 py-0.5 rounded-lg font-black uppercase text-[8px] tracking-[0.1em] whitespace-nowrap shadow-sm ${(lecture.subject_type || '').toLowerCase().includes('lab')
                                                                                                ? 'bg-green-500 text-white'
                                                                                                : 'bg-blue-600 text-white'
                                                                                            }`}>
                                                                                            {lecture.subject_type?.slice(0, 3)}
                                                                                        </span>
                                                                                    </div>

                                                                                    <div className="space-y-3">
                                                                                        <div className="inline-flex items-center text-[10px] font-black text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 group-hover/card:bg-blue-50 group-hover/card:border-blue-100 group-hover/card:text-blue-700 transition-all">
                                                                                            <User className="h-3 w-3 mr-2 text-blue-500" />
                                                                                            {lecture.assigned_faculty?.name || 'Unassigned'}
                                                                                        </div>

                                                                                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-dashed border-gray-200 group-hover/card:border-blue-100 transition-colors">
                                                                                            <div className="flex items-center text-[10px] font-black text-gray-400">
                                                                                                <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-300 group-hover/card:text-indigo-400 transition-colors" />
                                                                                                ROOM {lecture.room_no}
                                                                                            </div>
                                                                                            {lecture.batch && (
                                                                                                <div className="text-[10px] font-black text-white bg-gray-900 px-2 py-0.5 rounded-lg uppercase tracking-tighter">
                                                                                                    B{lecture.batch}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="h-full min-h-[120px] rounded-[2rem] border-2 border-dashed border-gray-50 group-hover:bg-white/50 transition-all flex items-center justify-center">
                                                                            <div className="h-2 w-2 rounded-full bg-gray-50"></div>
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
                        <div className="bg-white rounded-[3rem] p-32 text-center border-2 border-dashed border-gray-100 shadow-xl shadow-gray-100 group">
                            <div className="w-32 h-32 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border-4 border-blue-100 group-hover:scale-110 transition-transform duration-700">
                                <Search className="h-16 w-16 text-blue-500" />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter leading-none mb-6">Awaiting Parameters</h3>
                            <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] max-w-sm mx-auto leading-loose px-10">
                                Utilize the targeting filters above to synchronize with a specific <span className="text-blue-600 underline">Academic Division</span> cluster.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Print / Legend Footer */}
            <div className="mt-16 bg-gray-900 rounded-[2.5rem] p-8 sm:p-12 text-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] no-print relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-45 transition-transform duration-1000">
                    <Activity className="h-48 w-48" />
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl font-black tracking-tight mb-2 italic">Institutional Compliance</h3>
                            <p className="text-gray-400 font-medium max-w-lg">The Master Timetable is the authoritative source for academic scheduling at Vidyalankar. Any discrepancies should be reported to the IT Department Audit Cell.</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-8">
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">Theory Session Protocol</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)] animate-pulse"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-200">Lab & Practical Methodology</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="text-center sm:text-right">
                            <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1">Official Payload</div>
                            <div className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.5em] leading-none">VERIFIED SECURE v2.0</div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => {
                                    try {
                                        exportToExcel(filteredEntries);
                                        toast.success('Excel Generated!');
                                    } catch (e) {
                                        toast.error('Export failed');
                                    }
                                }}
                                className="px-8 py-5 bg-white text-gray-900 text-[10px] font-black uppercase tracking-[0.25em] rounded-[1.5rem] hover:bg-blue-600 hover:text-white transition-all active:scale-95 flex items-center gap-4 shadow-2xl"
                            >
                                <Download className="h-5 w-5" />
                                Export Engine
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="p-5 bg-white/5 hover:bg-white/10 text-white rounded-[1.5rem] border border-white/10 transition-all active:scale-95 backdrop-blur-sm group/btn"
                            >
                                <Printer className="h-6 w-6 group-hover/btn:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

