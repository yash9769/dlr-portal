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
    Cpu
} from 'lucide-react';

export default function SystemInfo() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header Section */}
                <div className="text-center animate-fade-in-down">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                        System Architecture
                    </h1>
                    <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
                        Understanding the Workflow, Inputs, and Outputs of the DLR Portal
                    </p>
                </div>

                {/* Main Workflow Visualization */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="px-3 bg-gray-50 text-lg font-medium text-gray-900">
                            End-to-End Data Flow
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Step 1: Input */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 transform transition duration-500 hover:scale-105 border-t-4 border-blue-500">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mx-auto mb-6">
                            <Users className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 text-center mb-4">1. Inputs (IP)</h3>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Faculty Profiles & Roles
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Weekly Timetable Schedules
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Daily Lecture Entries
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Attendance & Remarks
                            </li>
                        </ul>
                    </div>

                    {/* Step 2: Processing */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 transform transition duration-500 hover:scale-105 border-t-4 border-indigo-500 relative">
                        {/* Mobile Arrow */}
                        <div className="md:hidden absolute -top-6 left-1/2 transform -translate-x-1/2">
                            <ArrowRight className="h-8 w-8 text-gray-400 rotate-90" />
                        </div>
                        {/* Desktop Arrow */}
                        <div className="hidden md:block absolute -left-6 top-1/2 transform -translate-y-1/2">
                            <ArrowRight className="h-8 w-8 text-gray-400" />
                        </div>

                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mx-auto mb-6">
                            <Cpu className="h-8 w-8 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 text-center mb-4">2. Processing</h3>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Data Validation & Sanitization
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Role-Based Access Control
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Database Transactions (Supabase)
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Audit Logging & Tracking
                            </li>
                        </ul>
                    </div>

                    {/* Step 3: Storage */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 transform transition duration-500 hover:scale-105 border-t-4 border-purple-500 relative">
                        {/* Mobile Arrow */}
                        <div className="md:hidden absolute -top-6 left-1/2 transform -translate-x-1/2">
                            <ArrowRight className="h-8 w-8 text-gray-400 rotate-90" />
                        </div>
                        {/* Desktop Arrow */}
                        <div className="hidden md:block absolute -left-6 top-1/2 transform -translate-y-1/2">
                            <ArrowRight className="h-8 w-8 text-gray-400" />
                        </div>

                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mx-auto mb-6">
                            <Database className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 text-center mb-4">3. Storage</h3>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <code>faculty</code> & <code>profiles</code> Tables
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <code>lectures</code> & <code>timetable</code> Records
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Secure Cloud Storage
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Real-time Sync
                            </li>
                        </ul>
                    </div>

                    {/* Step 4: Output */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 transform transition duration-500 hover:scale-105 border-t-4 border-green-500 relative">
                        {/* Mobile Arrow */}
                        <div className="md:hidden absolute -top-6 left-1/2 transform -translate-x-1/2">
                            <ArrowRight className="h-8 w-8 text-gray-400 rotate-90" />
                        </div>
                        {/* Desktop Arrow */}
                        <div className="hidden md:block absolute -left-6 top-1/2 transform -translate-y-1/2">
                            <ArrowRight className="h-8 w-8 text-gray-400" />
                        </div>

                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mx-auto mb-6">
                            <FileOutput className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 text-center mb-4">4. Outputs (OP)</h3>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Automated Excel Reports
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                PDF Summaries
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Compliance Dashboards
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Historical Archives
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Detailed System Flow Section */}
                <div className="bg-white overflow-hidden shadow-xl rounded-2xl">
                    <div className="px-4 py-5 sm:px-6 bg-gray-900">
                        <h3 className="text-lg leading-6 font-medium text-white flex items-center">
                            <Server className="mr-2 h-5 w-5" />
                            Detailed System Flow
                        </h3>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                        <dl className="sm:divide-y sm:divide-gray-200">

                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 hover:bg-gray-50 transition">
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                    <ShieldCheck className="mr-2 h-5 w-5 text-blue-500" />
                                    Authentication
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    User logs in securely via Supabase Auth. The system determines the role (Faculty, HOD, Admin) to grant appropriate permissions and load the correct dashboard interface.
                                </dd>
                            </div>

                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 hover:bg-gray-50 transition">
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                    <Layout className="mr-2 h-5 w-5 text-indigo-500" />
                                    Dashboard Initialization
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    The dashboard fetches user-specific data: upcoming classes from the <code>timetable</code>, pending submissions, and recent activity logs. The interface is dynamically generated based on this state.
                                </dd>
                            </div>

                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 hover:bg-gray-50 transition">
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                    <ClipboardCheck className="mr-2 h-5 w-5 text-purple-500" />
                                    Data Entry & Validation
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    Faculty enters lecture details. The system validates inputs (e.g., matching dates, non-empty topics) in real-time. Upon submission, a transaction is committed to the database, ensuring data integrity.
                                </dd>
                            </div>

                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 hover:bg-gray-50 transition">
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                    <FileSpreadsheet className="mr-2 h-5 w-5 text-green-500" />
                                    Reporting Engine
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    On request, the system queries the aggregated data, structures it into the required academic format (DLR), and utilizes the <code>xlsx</code> library to render a downloadable binary Excel file for the user.
                                </dd>
                            </div>

                        </dl>
                    </div>
                </div>

                <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <Server className="h-5 w-5 text-blue-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                                Technical Stack
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <p>
                                    Built with <strong>React + Vite</strong> for the frontend, styled with <strong>Tailwind CSS</strong>, and powered by <strong>Supabase</strong> for the backend database and authentication.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
