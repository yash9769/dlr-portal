import { useAuth } from '../context/useAuth';
import { User, Mail, Shield, Building2, Fingerprint, Clock, CheckCircle, Smartphone, MapPin, BadgeCheck, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

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
    const initials = getInitials(displayName);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-10 animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="mb-10">
                <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-3">
                    <User className="h-3 w-3" />
                    <span>Account Settings</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                    My <span className="text-blue-600">Profile</span>
                </h1>
                <p className="mt-2 text-gray-500 font-medium">Manage your personal information and account preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Card & Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Main Profile Identity Card */}
                    <div className="relative bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden group">
                        {/* Decorative Background Mesh */}
                        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-br from-blue-600 via-indigo-700 to-indigo-900">
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.8),transparent)]"></div>
                        </div>

                        <div className="relative pt-24 px-6 sm:px-10 pb-10">
                            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8 text-center sm:text-left">
                                {/* Avatar with status ring */}
                                <div className="relative h-40 w-40 shrink-0">
                                    <div className="absolute -inset-2 bg-white/20 backdrop-blur-md rounded-[2rem]"></div>
                                    <div className="relative h-full w-full bg-white rounded-[1.8rem] p-2 shadow-2xl overflow-hidden ring-4 ring-white">
                                        {user?.photo_url ? (
                                            <img
                                                src={user.photo_url}
                                                alt={displayName}
                                                className="h-full w-full object-cover rounded-[1.4rem]"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-[1.4rem] flex items-center justify-center text-4xl font-black text-blue-600 tracking-wider">
                                                {initials}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute bottom-2 right-2 h-8 w-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                                        <BadgeCheck className="h-4 w-4 text-white" />
                                    </div>
                                </div>

                                <div className="flex-1 pb-2">
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                                        <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-200">
                                            {displayRole}
                                        </span>
                                        <span className="px-3 py-1 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-gray-200/50 flex items-center gap-1.5">
                                            <Building2 className="h-3 w-3" />
                                            {user?.department || 'Information Technology'}
                                        </span>
                                    </div>
                                    <h2 className="text-4xl font-black text-white sm:text-gray-900 transition-colors duration-500 sm:group-hover:text-blue-600">
                                        {displayName}
                                    </h2>
                                    <div className="mt-2 flex items-center justify-center sm:justify-start text-gray-400 font-bold text-[10px] uppercase tracking-widest gap-4">
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="h-3 w-3" />
                                            Mumbai, VIT
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="h-3 w-3" />
                                            Member since 2024
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100 mb-8" />

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="p-5 bg-gray-50/50 rounded-3xl border border-gray-100 hover:border-blue-200 hover:bg-white hover:shadow-xl hover:shadow-blue-50/50 transition-all duration-300 group/item">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Professional Email</p>
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-blue-600 shadow-sm group-hover/item:scale-110 transition-transform">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <span className="text-gray-900 font-bold truncate">{user?.email || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="p-5 bg-gray-50/50 rounded-3xl border border-gray-100 hover:border-blue-200 hover:bg-white hover:shadow-xl hover:shadow-blue-50/50 transition-all duration-300 group/item">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Faculty Initials</p>
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-indigo-600 shadow-sm group-hover/item:scale-110 transition-transform">
                                            <Fingerprint className="h-5 w-5" />
                                        </div>
                                        <span className="text-gray-900 font-bold tracking-widest">{initials}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Status Info */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2.5rem] p-8 border border-blue-100/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                            <Shield className="h-32 w-32 text-blue-600" />
                        </div>
                        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-xl shadow-blue-200/50 shrink-0">
                                <CheckCircle className="h-8 w-8" />
                            </div>
                            <div className="text-center sm:text-left">
                                <h3 className="text-xl font-black text-blue-900 mb-2">Authenticated & Verified</h3>
                                <p className="text-sm text-blue-700 font-medium leading-relaxed max-w-xl">
                                    Your account is currently <span className="text-green-600 font-black">Active</span> and synced with the central VIT DLR system.
                                    You have full authorization to manage academic records, audit lecture capture systems, and access departmental analytics.
                                </p>
                                <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-4">
                                    <div className="px-3 py-1 bg-white/50 backdrop-blur-sm rounded-lg text-[10px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                                        Real-time Sync Active
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar Stats */}
                <div className="space-y-6">
                    {/* Metadata Card */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                        <div className="bg-gray-900 p-6">
                            <h3 className="text-white font-black text-sm flex items-center gap-2 uppercase tracking-widest">
                                <Shield className="h-4 w-4 text-blue-400" />
                                System Metadata
                            </h3>
                        </div>
                        <div className="p-6 space-y-2">
                            {[
                                { label: 'Database UUID', value: user?.id?.slice(0, 10).toUpperCase(), icon: Fingerprint, color: 'text-blue-500' },
                                { label: 'Dept Code', value: 'INFT', icon: Building2, color: 'text-indigo-500' },
                                { label: 'Access Level', value: displayRole, icon: Shield, color: 'text-purple-500' },
                                { label: 'Compliance', value: 'Verified', icon: BadgeCheck, color: 'text-green-500', isStatus: true }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors group/meta">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-xl bg-gray-50 flex items-center justify-center ${item.color} group-hover/meta:bg-white shadow-sm transition-colors`}>
                                            <item.icon className="h-4 w-4" />
                                        </div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{item.label}</span>
                                    </div>
                                    <span className={`text-xs font-black ${item.isStatus ? 'text-green-600' : 'text-gray-900 font-mono'}`}>
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 pt-2 border-t border-gray-50">
                            <div className="bg-green-50/50 rounded-2xl p-4 flex items-center justify-between group cursor-default">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                                        <div className="absolute inset-0 h-3 w-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-green-800 uppercase tracking-widest leading-none">Status</span>
                                        <span className="text-xs font-bold text-green-600 mt-1">Active Session</span>
                                    </div>
                                </div>
                                <div className="text-[10px] font-bold text-gray-400">
                                    {format(new Date(), 'HH:mm')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Support Card */}
                    <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                        <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-blue-600 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-4">Need Help?</h3>
                        <p className="text-xs text-gray-400 font-medium leading-relaxed mb-6">
                            For profile corrections, role updates, or departmental transfers, please coordinate with the HOD office or System Admin.
                        </p>
                        <button className="w-full py-3 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-2 group/btn">
                            Contact Support
                            <ExternalLink className="h-3 w-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                        </button>
                    </div>

                    <div className="px-6 py-4 flex items-center justify-center gap-2">
                        <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">VIT-DLR v2.0</span>
                        <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

