import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Building2, Fingerprint } from 'lucide-react';

export default function Profile() {
    const { user } = useAuth();

    const getInitials = (name) => {
        if (!name) return '??';
        return name.replace(/Dr\.|Prof\.|Mr\.|Ms\./g, '').trim()
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-10">
            <div className="bg-white rounded-3xl shadow-xl shadow-blue-50 border border-gray-100 overflow-hidden">
                {/* Profile Header Background */}
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>

                <div className="px-8 pb-10">
                    <div className="relative flex justify-between items-end -mt-16 mb-8">
                        <div className="h-32 w-32 bg-white rounded-3xl p-2 shadow-xl">
                            <div className="h-full w-full bg-blue-600 rounded-2xl flex items-center justify-center text-4xl font-black text-white tracking-widest">
                                {getInitials(user?.full_name)}
                            </div>
                        </div>
                        <div className="pb-2">
                            <span className="px-4 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">
                                {user?.role || 'Staff'}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">
                                {user?.full_name || 'Professor'}
                            </h1>
                            <p className="text-gray-500 font-medium text-sm mb-6 flex items-center">
                                <Building2 className="h-4 w-4 mr-2 text-blue-500" />
                                Department of Information Technology
                            </p>

                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email Address</p>
                                    <p className="text-sm font-bold text-gray-700 flex items-center">
                                        <Mail className="h-4 w-4 mr-2 text-blue-400" />
                                        {user?.email}
                                    </p>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">System Initials</p>
                                    <p className="text-sm font-bold text-gray-700 flex items-center">
                                        <Fingerprint className="h-4 w-4 mr-2 text-blue-400" />
                                        {getInitials(user?.full_name)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-100">
                                <h3 className="text-lg font-bold mb-4 flex items-center">
                                    <Shield className="h-5 w-5 mr-2" /> Security Details
                                </h3>
                                <div className="space-y-3 opacity-90">
                                    <div className="flex justify-between text-xs font-bold border-b border-white/20 pb-2">
                                        <span>User ID</span>
                                        <span className="font-mono">{user?.id?.slice(0, 8)}...</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold border-b border-white/20 pb-2">
                                        <span>Department</span>
                                        <span>INFT (VIT)</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold">
                                        <span>Login Activity</span>
                                        <span>Active Session</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-2 border-dashed border-gray-100 rounded-3xl">
                                <p className="text-xs text-center text-gray-400 font-medium italic">
                                    "Your profile data is synced with the VIT Faculty Master database. Contact the HOD office for profile updates."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
