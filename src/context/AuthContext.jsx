import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AuthContext } from './AuthContextInstance';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initialize Auth Session
        const initAuth = async () => {
            const timeoutPromise = new Promise((resolve) =>
                setTimeout(() => {
                    console.warn('Auth initialization timed out after 5s');
                    resolve(null);
                }, 5000)
            );

            try {
                const user = await Promise.race([api.auth.getUser(), timeoutPromise]);

                if (user) setUser(user);
            } catch (error) {
                console.error('Auth initialization error:', error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // Optional: Listen for auth changes (Supabase specific)
        const { data: { subscription } } = api.auth.onAuthStateChange((_event, session) => {
            // Refresh user details on change
            if (session?.user) {
                api.auth.getUser().then(u => setUser(u)).catch(err => console.error('Auth change refresh error:', err));
            } else {
                setUser(null);
            }
        });

        return () => subscription?.unsubscribe();
    }, []);

    const login = async (email, password) => {
        try {
            const { user, error } = await api.auth.login(email, password);
            if (user) {
                setUser(user);
                return { success: true };
            }
            return { success: false, error };
        } catch (err) {
            return { success: false, error: err };
        }
    };

    const loginWithGoogle = async () => {
        try {
            await api.auth.loginWithGoogle();
        } catch (error) {
            return { success: false, error };
        }
    };

    const logout = async () => {
        await api.auth.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, loading }}>
            {loading ? (
                <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600 font-bold">Checking authentication...</p>
                    <p className="text-xs text-gray-400 mt-2">If this takes too long, check Supabase connection.</p>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
}
