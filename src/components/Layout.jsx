import { Fragment, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
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
    Users,
    Activity,
    ChevronRight,
    Search
} from 'lucide-react';
import { clsx } from 'clsx';
import BugReportModal from './BugReportModal';
import PullToRefresh from './PullToRefresh';

export default function Layout() {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showBugModal, setShowBugModal] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        navigate('/login', { replace: true });
        await logout();
    };

    const navigation = [
        { name: 'Intelligence Hub', href: '/', icon: Home, current: location.pathname === '/' },
        { name: 'Audit History', href: '/history', icon: FileText, current: location.pathname === '/history' },
        { name: 'Master Schedule', href: '/schedule', icon: Calendar, current: location.pathname === '/schedule' },
        { name: 'Dept Reports', href: '/reports', icon: Activity, current: location.pathname === '/reports' },
        { name: 'Control Center', href: '/timetable', icon: Settings, current: location.pathname === '/timetable', adminOnly: true },
        { name: 'Faculty Registry', href: '/faculty', icon: Users, current: location.pathname === '/faculty', adminOnly: true },
        { name: 'Student Records', href: '/students', icon: Users, current: location.pathname === '/students', adminOnly: true },
        { name: 'System Pulse', href: '/bugs', icon: Bug, current: location.pathname === '/bugs', adminOnly: true },
        { name: 'Identity Profile', href: '/profile', icon: User, current: location.pathname === '/profile' },
        { name: 'System Protocol', href: '/system-info', icon: Info, current: location.pathname === '/system-info' },
    ];

    const role = user?.role?.toLowerCase() || '';
    const email = user?.email?.toLowerCase() || '';
    const isManagement = role === 'admin' || role === 'hod' || role === 'administrator' || email === 'admin@vit.edu.in';

    return (
        <div className="h-screen flex overflow-hidden bg-[#F8FAFC]">
            {/* Mobile Sidebar (Glassmorphism) - Logic kept for mobile menu toggle */}
            {(sidebarOpen) && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity duration-500" onClick={() => setSidebarOpen(false)}></div>
                    <div className="relative flex-1 flex flex-col max-w-[280px] w-full bg-white/95 backdrop-blur-xl shadow-2xl animate-in slide-in-from-left duration-500">
                        <div className="absolute top-6 right-4">
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="h-10 w-10 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:text-gray-900 transition-all border border-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex-1 h-0 pt-12 pb-4 overflow-y-auto px-6">
                            <div className="flex-shrink-0 flex items-center mb-12">
                                <Activity className="h-8 w-8 text-blue-600 mr-3" />
                                <span className="text-2xl tracking-tighter uppercase italic">
                                    <span className="text-gray-400 font-light">DLR</span>
                                    <span className="text-blue-600 font-black">.OS</span>
                                </span>
                            </div>
                            <nav className="space-y-1.5">
                                {navigation.map((item) => (
                                    (!item.adminOnly || isManagement) && (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={clsx(
                                                item.current
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
                                                'group flex items-center px-4 py-[1.125rem] text-[11px] font-black uppercase tracking-[0.05em] rounded-2xl transition-all duration-300'
                                            )}
                                        >
                                            <item.icon className={clsx(
                                                item.current ? 'text-white' : 'text-gray-400 group-hover:text-blue-600',
                                                "mr-4 h-5 w-5 transition-colors"
                                            )} strokeWidth={3} aria-hidden="true" />
                                            {item.name}
                                        </Link>
                                    )
                                ))}
                            </nav>
                        </div>
                        <div className="p-6 bg-gray-50/50 border-t border-gray-100">
                            <button
                                onClick={() => {
                                    setSidebarOpen(false);
                                    setShowBugModal(true);
                                }}
                                className="w-full mb-4 flex items-center justify-between px-4 py-3 text-[10px] font-black text-red-600 bg-white border border-red-100 rounded-2xl hover:bg-red-50 transition-all shadow-sm group"
                            >
                                <span className="flex items-center gap-3">
                                    <Bug className="h-4 w-4" />
                                    EMERGENCY REPORT
                                </span>
                                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-200 text-xs">
                                        {user?.full_name?.charAt(0)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] font-black text-gray-900 truncate uppercase leading-none mb-1">{user?.full_name}</p>
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{user?.role || (isManagement ? 'Administrator' : 'Faculty Member')}</p>
                                    </div>
                                </div>
                                <button onClick={handleLogout} className="p-3 text-gray-400 hover:text-red-600 transition-colors">
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Desktop Sidebar (Universal for large screens) */}
            <div className="hidden md:flex md:flex-shrink-0 w-72 bg-white border-r border-gray-100 relative z-30">
                <div className="flex flex-col h-full w-full">
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-12">
                            <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200">
                                <Activity className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl tracking-tighter uppercase italic leading-none">
                                <span className="text-gray-300 font-light">DLR</span>
                                <span className="text-blue-600 font-black">.OS</span>
                            </span>
                        </div>
                        <nav className="space-y-1.5 flex-1">
                            <p className="text-[10px] font-light text-gray-400 uppercase tracking-[0.4em] mb-4 ml-2 border-l-2 border-blue-500/20 pl-3">
                                Main <span className="text-gray-900 font-black">Terminal</span>
                            </p>
                            {navigation.map((item) => (
                                (!item.adminOnly || isManagement) && (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={clsx(
                                            item.current
                                                ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200/50 translate-x-1'
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
                                            'group flex items-center px-4 py-4 text-[11px] font-black uppercase tracking-[0.05em] rounded-2xl transition-all duration-500'
                                        )}
                                    >
                                        <item.icon className={clsx(
                                            item.current ? 'text-white' : 'text-gray-400 group-hover:text-blue-600',
                                            "mr-4 h-5 w-5 transition-colors"
                                        )} strokeWidth={3} aria-hidden="true" />
                                        {item.name}
                                    </Link>
                                )
                            ))}
                        </nav>
                    </div>
                    <div className="mt-auto p-8 border-t border-gray-50 bg-gray-50/30">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-gray-900 border-4 border-white shadow-xl flex items-center justify-center text-white font-black">
                                    {user?.full_name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-900 truncate uppercase tracking-tighter">{user?.full_name}</p>
                                    <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest leading-none">{user?.role || 'Administrator'}</p>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="p-3 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-xl shadow-sm border border-gray-100 group">
                                <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                        <button onClick={() => setShowBugModal(true)} className="w-full flex items-center justify-center gap-3 py-3 border border-red-100 bg-red-50/50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-100 transition-all active:scale-95">
                            <Bug className="h-4 w-4" />
                            System Support
                        </button>
                    </div>
                </div>
            </div>


            {/* Main content area */}
            <div className="flex flex-col w-0 flex-1 overflow-hidden min-h-0 bg-[#F8FAFC]">
                {/* Header (Premium Glassmorphism) */}
                <header className="h-16 flex items-center px-6 sticky top-0 z-40 bg-white/50 backdrop-blur-xl border-b border-gray-100 shrink-0 md:hidden justify-between">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="h-10 w-10 inline-flex items-center justify-center rounded-xl text-gray-500 hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-gray-100"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    {!isManagement && (
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></div>
                            <span className="text-sm tracking-tighter uppercase italic">
                                <span className="text-gray-400 font-light">DLR</span>
                                <span className="text-blue-600 font-black">.OS</span>
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                            <Activity className="h-4 w-4" />
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex flex-col min-h-0 relative z-0 focus:outline-none overflow-hidden scrollbar-hide">
                    <PullToRefresh>
                        <div className={clsx(!isManagement && "px-4 py-8 pb-32")}>
                            <Outlet />
                        </div>
                    </PullToRefresh>
                </main>

                {/* Mobile Tab Bar (Hidden on Desktop) */}
                <div className="md:hidden fixed bottom-6 left-6 right-6 h-20 bg-gray-900/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] px-8 flex justify-between items-center z-50 animate-in slide-in-from-bottom-12 duration-1000 border border-white/10">
                    <Link to="/" className={clsx("relative p-4 transition-all duration-500", location.pathname === '/' ? "text-blue-400 scale-125" : "text-gray-500")}>
                        <Home className="h-6 w-6" />
                        {location.pathname === '/' && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>}
                    </Link>
                    <Link to="/schedule" className={clsx("relative p-4 transition-all duration-500", location.pathname === '/schedule' ? "text-blue-400 scale-125" : "text-gray-500")}>
                        <Calendar className="h-6 w-6" />
                        {location.pathname === '/schedule' && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>}
                    </Link>
                    <Link to="/history" className={clsx("relative p-4 transition-all duration-500", location.pathname === '/history' ? "text-blue-400 scale-125" : "text-gray-500")}>
                        <FileText className="h-6 w-6" />
                        {location.pathname === '/history' && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>}
                    </Link>
                    <Link to="/profile" className={clsx("relative p-4 transition-all duration-500", location.pathname === '/profile' ? "text-blue-400 scale-125" : "text-gray-500")}>
                        <User className="h-6 w-6" />
                        {location.pathname === '/profile' && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>}
                    </Link>
                </div>

            </div>

            <BugReportModal
                isOpen={showBugModal}
                onClose={() => setShowBugModal(false)}
                user={user}
            />
        </div>
    );
}

