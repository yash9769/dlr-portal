import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Building2, Fingerprint, Clock, CheckCircle } from 'lucide-react';

export default function Profile() {
    const { user } = useAuth();

    const getInitials = (name) => {
        if (!name) return '??';
        return name.replace(/Dr\.|Prof\.|Mr\.|Ms\./g, '').trim()
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const displayName = user?.full_name || user?.email?.split('@')[0] || 'Faculty Member';
    const displayRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Faculty';

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Profile Header Background */}
                <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-800 relative">
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>

                <div className="px-6 sm:px-10 pb-10">
                    <div className="relative flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-8 gap-6 text-center sm:text-left">
                        <div className="h-32 w-32 bg-white rounded-2xl p-1.5 shadow-lg overflow-hidden shrink-0">
                            {user?.photo_url ? (
                                <img
                                    src={user.photo_url}
                                    alt={displayName}
                                    className="h-full w-full object-cover rounded-xl bg-gray-100"
                                />
                            ) : (
                                <div className="h-full w-full bg-blue-50 rounded-xl flex items-center justify-center text-3xl font-bold text-blue-600 tracking-wider border border-blue-100">
                                    {getInitials(displayName)}
                                </div>
                            )}
                        </div>

                        <div className="pb-2 flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">
                                {displayName}
                            </h1>
                            <p className="text-gray-500 font-medium flex items-center justify-center sm:justify-start gap-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 uppercase tracking-wide">
                                    {displayRole}
                                </span>
                                <span className="text-gray-300">|</span>
                                <span className="flex items-center text-sm">
                                    <Building2 className="h-3.5 w-3.5 mr-1.5" />
                                    {user?.department || 'Information Technology'}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Personal Info */}
                        <div className="lg:col-span-2 space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center border-b border-gray-100 pb-2">
                                <User className="h-5 w-5 mr-2 text-blue-600" />
                                Personal Information
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:border-blue-200 transition-colors">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                                    <div className="flex items-center text-gray-700 font-medium">
                                        <div className="p-1.5 bg-white rounded-lg shadow-sm mr-3 text-blue-500">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <span className="truncate">{user?.email || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:border-blue-200 transition-colors">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Faculty ID / Initials</p>
                                    <div className="flex items-center text-gray-700 font-medium">
                                        <div className="p-1.5 bg-white rounded-lg shadow-sm mr-3 text-blue-500">
                                            <Fingerprint className="h-4 w-4" />
                                        </div>
                                        <span>{getInitials(displayName)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                                <div className="flex items-start">
                                    <Clock className="h-5 w-5 text-blue-600 mt-0.5 mr-3 shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-bold text-blue-900">Account Status</h4>
                                        <p className="text-sm text-blue-700 mt-1">
                                            Your account is currently <span className="font-bold text-green-600">Active</span> and synced with the central DLR system.
                                            You typically have access to manage daily lecture records and view department reports.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: System & Security */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
                                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                                    <h3 className="text-sm font-bold text-gray-700 flex items-center">
                                        <Shield className="h-4 w-4 mr-2 text-gray-500" />
                                        System Metadata
                                    </h3>
                                </div>
                                <div className="p-5 space-y-4 flex-1">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-xs text-gray-500 font-medium">Database UUID</span>
                                        <code className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">
                                            {user?.id?.slice(0, 8)}...
                                        </code>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-xs text-gray-500 font-medium">Department Code</span>
                                        <span className="text-xs font-bold text-gray-700">INFT</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-xs text-gray-500 font-medium">Last Login</span>
                                        <span className="text-xs font-bold text-green-600 flex items-center">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                                            Active Session
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-xs text-gray-500 font-medium">Data Compliance</span>
                                        <span className="text-xs font-bold text-blue-600 flex items-center">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Verified
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 border-t border-gray-100">
                                    <p className="text-[10px] text-center text-gray-400 italic">
                                        For profile corrections, please contact the HOD office.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
