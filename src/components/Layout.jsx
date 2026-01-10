import { Fragment, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Home,
    Calendar,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    User
} from 'lucide-react';
import { clsx } from 'clsx';

export default function Layout() {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/', icon: Home, current: location.pathname === '/' },
        { name: 'My Schedule', href: '/schedule', icon: Calendar, current: location.pathname === '/schedule' },
        { name: 'Reports', href: '/reports', icon: FileText, current: location.pathname === '/reports' }, // Removed adminOnly for demo
        { name: 'Timetable Set', href: '/timetable', icon: Settings, current: location.pathname === '/timetable' }, // New Item
        { name: 'Faculty List', href: '/faculty', icon: User, current: location.pathname === '/faculty', adminOnly: true },
    ];

    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
            {/* Mobile sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 flex z-40 md:hidden">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-blue-700">
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                type="button"
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <X className="h-6 w-6 text-white" />
                            </button>
                        </div>
                        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                            <div className="flex-shrink-0 flex items-center px-4 text-white font-bold text-xl">
                                DLR Portal
                            </div>
                            <nav className="mt-5 px-2 space-y-1">
                                {navigation.map((item) => (
                                    (!item.adminOnly || user?.role === 'admin') && (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={clsx(
                                                item.current ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-600 hover:text-white',
                                                'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                                            )}
                                        >
                                            <item.icon className="mr-4 h-6 w-6 text-blue-300" aria-hidden="true" />
                                            {item.name}
                                        </Link>
                                    )
                                ))}
                            </nav>
                        </div>
                        <div className="flex-shrink-0 flex border-t border-blue-800 p-4">
                            <button onClick={logout} className="flex-shrink-0 group block w-full flex items-center">
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-white group-hover:text-blue-100">Sign Out</p>
                                </div>
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
                                    (!item.adminOnly || user?.role === 'admin') && (
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
                                    <p className="text-sm font-medium text-white">{user?.full_name}</p>
                                    <button onClick={logout} className="text-xs font-medium text-blue-200 group-hover:text-white">
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content area */}
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
                    <button
                        type="button"
                        className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
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
        </div>
    );
}
