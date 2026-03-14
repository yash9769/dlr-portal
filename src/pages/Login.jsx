import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Lock, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            console.log('Login attempt started for:', email);
            const result = await login(email, password);
            console.log('Login result:', result);

            if (result.success) {
                toast.success('Successfully logged in!');
                navigate(from, { replace: true });
            } else {
                const errorMessage = result.error?.message || result.error || 'Invalid login credentials';
                setError(errorMessage);
                toast.error(errorMessage);
            }
        } catch (err) {
            console.error('Login crash error:', err);
            const genericError = `CRASH: ${err.message || 'Unknown error'}`;
            setError(genericError);
            toast.error(genericError);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/30 rounded-full blur-[120px]"></div>

            <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in duration-1000">
                <div className="bg-white/80 backdrop-blur-3xl rounded-[3.5rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden">
                    <div className="p-10 sm:p-14">
                        {/* Branding */}
                        <div className="flex flex-col items-center mb-10 text-center">
                            <div className="h-16 w-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
                                <Lock className="h-8 w-8 text-white" />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-sm font-black text-blue-600 uppercase tracking-[0.4em] mb-2 leading-none">Security Terminal</h1>
                                <div className="text-4xl sm:text-5xl tracking-tighter uppercase italic leading-none">
                                    <span className="text-gray-400 font-light">DLR</span>
                                    <span className="text-gray-900 font-black">.OS</span>
                                </div>
                            </div>
                        </div>

                        {/* Google Auth Section */}
                        <div className="mb-10">
                            <button
                                onClick={() => loginWithGoogle()}
                                type="button"
                                className="w-full h-14 bg-white/50 hover:bg-white border border-gray-100 rounded-2xl shadow-sm text-[11px] font-black uppercase tracking-widest text-gray-900 flex items-center justify-center gap-4 transition-all active:scale-95 group"
                            >
                                <svg className="h-5 w-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Authenticate via Google
                            </button>
                        </div>

                        <div className="relative mb-10">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.3em]">
                                <span className="px-4 bg-white/20 backdrop-blur rounded-full text-gray-400">Direct Entry Override</span>
                            </div>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Authorized Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-14 pl-14 pr-6 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-300"
                                        placeholder="user@vit.edu.in"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Access Key</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-14 pl-14 pr-6 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-300"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 animate-shake">
                                    <div className="h-2 w-2 rounded-full bg-red-600"></div>
                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-tight">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 border-b-4 border-blue-800 disabled:border-b-0 mt-4"
                            >
                                {submitting ? 'initializing context...' : 'Initiate Session'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
