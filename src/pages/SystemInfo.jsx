import React from 'react';
import {
    Database,
    FileSpreadsheet,
    Users,
    ArrowRight,
    Server,
    Layout,
    ClipboardCheck,
    FileOutput,
    ShieldCheck,
    Cpu,
    Workflow,
    Activity,
    Cloud,
    Lock
} from 'lucide-react';

export default function SystemInfo() {
    return (
        <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8 mt-4 animate-in fade-in duration-1000">
            <div className="max-w-7xl mx-auto space-y-16">

                {/* Header Section */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4 border border-blue-100 shadow-sm shadow-blue-50">
                        <Activity className="h-3 w-3" />
                        <span>System Intelligence</span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-tight">
                        Platform <span className="text-blue-600">Architecture</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg text-gray-500 font-medium">
                        A deep dive into the high-performance workflow, secured data processing, and enterprise-grade reporting engine of the DLR Portal.
                    </p>
                </div>

                {/* Workflow Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                    {/* Decorative Connection Line (Desktop) */}
                    <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-100 via-indigo-100 to-green-100 -translate-y-1/2 z-0"></div>

                    {[
                        {
                            step: '01',
                            title: 'Inputs (IP)',
                            icon: Users,
                            color: 'blue',
                            items: ['Faculty Profiles & Roles', 'Weekly Schedules', 'Daily Lecture Entries', 'Student Attendance']
                        },
                        {
                            step: '02',
                            title: 'Processing',
                            icon: Cpu,
                            color: 'indigo',
                            items: ['Data Validation Layer', 'RBAC Enforcement', 'Database Transactions', 'Conflict Detection']
                        },
                        {
                            step: '03',
                            title: 'Storage',
                            icon: Database,
                            color: 'purple',
                            items: ['Relational Schema', 'Historical Archives', 'Real-time Sync Engine', 'Secure Blobs']
                        },
                        {
                            step: '04',
                            title: 'Outputs (OP)',
                            icon: FileOutput,
                            color: 'green',
                            items: ['Automated Excel DLR', 'PDF Audit Reports', 'Analytics Dashboards', 'Compliance Exports']
                        }
                    ].map((step, idx) => (
                        <div key={idx} className="relative z-10 group">
                            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:border-blue-200 transition-all duration-500 hover:-translate-y-2 h-full flex flex-col">
                                <div className={`h-16 w-16 rounded-2xl bg-${step.color}-50 flex items-center justify-center text-${step.color}-600 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-${step.color}-100/50`}>
                                    <step.icon className="h-8 w-8" />
                                </div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className={`text-[10px] font-black text-${step.color}-600/50 uppercase tracking-widest`}>{step.step}</span>
                                    <h3 className="text-xl font-black text-gray-900">{step.title}</h3>
                                </div>
                                <ul className="space-y-3 flex-1">
                                    {step.items.map((item, i) => (
                                        <li key={i} className="flex items-center text-sm font-bold text-gray-500 group-hover:text-gray-700 transition-colors">
                                            <div className={`h-1.5 w-1.5 rounded-full bg-${step.color}-400 mr-3 shrink-0`}></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Detailed Flow Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Stack Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group h-full flex flex-col justify-between">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                                <Workflow className="h-40 w-40" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                                    <Server className="h-4 w-4 text-blue-400" />
                                    Technical Core
                                </h3>
                                <div className="space-y-6 relative">
                                    {[
                                        { label: 'Frontend Framework', value: 'React 19 + Vite', icon: Layout },
                                        { label: 'Styling Engine', value: 'Tailwind CSS 4.0', icon: Activity },
                                        { label: 'Backend as a Service', value: 'Supabase PostgreSQL', icon: Cloud },
                                        { label: 'Security Layer', value: 'JWT + Row Level Security', icon: Lock }
                                    ].map((tech, i) => (tech &&
                                        <div key={i} className="flex items-center gap-4 group/item">
                                            <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover/item:bg-blue-600 transition-colors">
                                                <tech.icon className="h-5 w-5 text-blue-400 group-hover/item:text-white" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">{tech.label}</p>
                                                <p className="text-sm font-bold text-white tracking-tight">{tech.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/10">
                                <p className="text-xs text-gray-400 leading-relaxed font-medium">
                                    Optimized for both desktop and mobile responsiveness, ensuring VIT faculty can perform audits from any device, anywhere.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Detailed Journey */}
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden flex flex-col">
                        <div className="bg-gray-50 p-8 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-black text-gray-900 flex items-center gap-3">
                                <ShieldCheck className="h-6 w-6 text-blue-600" />
                                Processing Lifecycle
                            </h3>
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                                Optimized v2.4
                            </span>
                        </div>
                        <div className="p-8 space-y-2 flex-1">
                            {[
                                {
                                    title: 'Secure Authentication',
                                    desc: 'User sessions are managed via enterprise-grade Supabase Auth, determining hierarchical permissions (Faculty, HOD, Admin) and loading custom dashboard layouts in milliseconds.',
                                    icon: ShieldCheck,
                                    status: 'Verified'
                                },
                                {
                                    title: 'Dynamic State Initialization',
                                    desc: 'On boot, the platform aggregates real-time timetable data and pending audit requirements, establishing a synchronized state across the global context for instant interaction.',
                                    icon: Layout,
                                    status: 'Optimized'
                                },
                                {
                                    title: 'Atomic Data Commitments',
                                    desc: 'Every lecture audit is treated as a database transaction, undergoing strict validation checks to prevent overlaps and ensure high-fidelity session tracking.',
                                    icon: ClipboardCheck,
                                    status: 'Atomic'
                                },
                                {
                                    title: 'High-Fidelity Reporting',
                                    desc: 'Our proprietary reporting engine transforms complex relational datasets into VIT-approved Excel and PDF formats, maintaining precise academic layout standards.',
                                    icon: FileSpreadsheet,
                                    status: 'Real-time'
                                }
                            ].map((journey, i) => (
                                <div key={i} className="flex gap-6 p-6 rounded-3xl hover:bg-gray-50 transition-all duration-300 group/j">
                                    <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-blue-600 group-hover/j:bg-white border border-transparent group-hover/j:border-blue-100 shadow-sm transition-all shrink-0">
                                        <journey.icon className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-lg font-black text-gray-900">{journey.title}</h4>
                                            <span className="text-[10px] font-bold text-gray-400 bg-gray-100/50 px-2 py-0.5 rounded uppercase tracking-widest">{journey.status}</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-500 leading-relaxed max-w-xl group-hover:text-gray-600">
                                            {journey.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Insight */}
                <div className="p-8 bg-blue-600 rounded-[2.5rem] shadow-2xl shadow-blue-200 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
                        </svg>
                    </div>
                    <div className="relative flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                        <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <Activity className="h-8 w-8 text-white" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black tracking-tight">System Integrity & Compliance</h3>
                            <p className="text-blue-100 text-sm font-medium">The DLR Portal adheres to VIT Academic Audit Cell standards for digital transformation.</p>
                        </div>
                    </div>
                    <div className="relative shrink-0">
                        <div className="px-6 py-3 bg-white text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-blue-900/20 active:scale-95 transition-transform cursor-pointer">
                            View Compliance PDF
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

