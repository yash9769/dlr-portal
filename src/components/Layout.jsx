import { Fragment, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Home,
    Calendar,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    User,
    Info,
    Bug,
    Users
} from 'lucide-react';
import { clsx } from 'clsx';
import BugReportModal from './BugReportModal';

export default function Layout() {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showBugModal, setShowBugModal] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        // Navigate to login immediately to avoid ProtectedRoute capturing the current location state
        navigate('/login', { replace: true });
        await logout();
    };

    const navigation = [
        { name: 'Dashboard', href: '/', icon: Home, current: location.pathname === '/' },
        { name: 'Audit History', href: '/history', icon: FileText, current: location.pathname === '/history' },
        { name: 'Teaching Timetable', href: '/schedule', icon: Calendar, current: location.pathname === '/schedule' },
        { name: 'Department Reports', href: '/reports', icon: FileText, current: location.pathname === '/reports' },
        { name: 'Timetable Setup', href: '/timetable', icon: Settings, current: location.pathname === '/timetable', adminOnly: true },
        { name: 'Faculty Master', href: '/faculty', icon: User, current: location.pathname === '/faculty', adminOnly: true },
        { name: 'Student Master', href: '/students', icon: Users, current: location.pathname === '/students', adminOnly: true },
        { name: 'System Issues', href: '/bugs', icon: Bug, current: location.pathname === '/bugs', adminOnly: true },
        { name: 'My Profile', href: '/profile', icon: User, current: location.pathname === '/profile' },
        { name: 'System Info', href: '/system-info', icon: Info, current: location.pathname === '/system-info' },
    ];

    const role = user?.role?.toLowerCase() || '';
    const email = user?.email?.toLowerCase() || '';
    const isManagement = role === 'admin' || role === 'hod' || role === 'administrator' || email === 'admin@vit.edu.in';

    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
            {/* Mobile sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 flex z-40 md:hidden">
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)}></div>
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
                        <div className="absolute top-12 right-0 -mr-12 pt-2">
                            <button
                                type="button"
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <X className="h-6 w-6 text-white" />
                            </button>
                        </div>
                        <div className="flex-1 h-0 pt-16 pb-4 overflow-y-auto">
                            <div className="flex-shrink-0 flex items-center px-4">
                                <span className="text-2xl font-black text-blue-600 tracking-tighter">DLR<span className="text-gray-900">Portal</span></span>
                            </div>
                            <nav className="mt-8 px-2 space-y-2">
                                {navigation.map((item) => (
                                    (!item.adminOnly || isManagement) && (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={clsx(
                                                item.current ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                                'group flex items-center px-4 py-3 text-base font-bold rounded-xl transition-all'
                                            )}
                                        >
                                            <item.icon className={clsx(
                                                item.current ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500',
                                                "mr-4 h-6 w-6 transition-colors"
                                            )} aria-hidden="true" />
                                            {item.name}
                                        </Link>
                                    )
                                ))}
                            </nav>
                        </div>
                        <div className="flex-shrink-0 flex flex-col gap-2 border-t border-gray-100 p-4 bg-gray-50">
                            <button
                                onClick={() => {
                                    setSidebarOpen(false);
                                    setShowBugModal(true);
                                }}
                                className="w-full flex items-center px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                            >
                                <Bug className="mr-3 h-5 w-5" />
                                Report an Issue
                            </button>
                            <button onClick={handleLogout} className="flex-shrink-0 group block w-full flex items-center justify-between mt-2">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                        {user?.full_name?.charAt(0)}
                                    </div>
                                    <div className="ml-3 text-left">
                                        <p className="text-sm font-bold text-gray-900 group-hover:text-blue-900">{user?.full_name}</p>
                                        <p className="text-xs font-medium text-gray-500">{isManagement ? 'Administrator' : 'Faculty Member'}</p>
                                    </div>
                                </div>
                                <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Static sidebar for desktop */}
            <div className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <div className="flex flex-col h-0 flex-1 bg-blue-700">
                        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                            <div className="flex items-center flex-shrink-0 px-4 text-white font-bold text-xl">
                                DLR Portal
                            </div>
                            <nav className="mt-5 flex-1 px-2 space-y-1">
                                {navigation.map((item) => (
                                    (!item.adminOnly || isManagement) && (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={clsx(
                                                item.current ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-600 hover:text-white',
                                                'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                                            )}
                                        >
                                            <item.icon className="mr-3 h-6 w-6 text-blue-300" aria-hidden="true" />
                                            {item.name}
                                        </Link>
                                    )
                                ))}
                            </nav>
                        </div>
                        <div className="flex-shrink-0 flex border-t border-blue-800 p-4">
                            <div className="flex items-center">
                                <div>
                                    <div className="h-9 w-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                        {user?.full_name?.charAt(0)}
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest mb-0.5">
                                        {isManagement ? (role === 'hod' ? 'Head of Dept' : 'Administrator') : 'Faculty'}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-white leading-none">{user?.full_name || user?.email}</p>
                                        {isManagement && <span className="bg-green-400 text-black text-[8px] font-bold px-1 rounded">PRO</span>}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <button onClick={handleLogout} className="text-[10px] font-medium text-blue-300 hover:text-white border-b border-blue-600">
                                            Sign Out
                                        </button>
                                        <button onClick={() => setShowBugModal(true)} className="text-[10px] font-medium text-red-300 hover:text-white border-b border-red-500 whitespace-nowrap">
                                            Report Issue
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content area */}
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <div className="md:hidden pl-2 pt-10 sm:pl-3 sm:pt-10">
                    <button
                        type="button"
                        className="h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <Menu className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>
                <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
                    <Outlet />
                </main>
            </div>

            <BugReportModal
                isOpen={showBugModal}
                onClose={() => setShowBugModal(false)}
                user={user}
            />
        </div>
    );
}
