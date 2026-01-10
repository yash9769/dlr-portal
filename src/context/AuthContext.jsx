import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initialize Auth Session
        api.auth.getUser().then(user => {
            setUser(user);
            setLoading(false);
        });

        // Optional: Listen for auth changes (Supabase specific)
        const { data: { subscription } } = api.auth.onAuthStateChange((_event, session) => {
            // Refresh user details on change
            if (session?.user) {
                api.auth.getUser().then(u => setUser(u));
            } else {
                setUser(null);
            }
        });

        return () => subscription?.unsubscribe();
    }, []);

    const login = async (email, password) => {
        const { user, error } = await api.auth.login(email, password);
        if (user) {
            setUser(user);
            return { success: true };
        }
        return { success: false, error };
    };

    const logout = async () => {
        await api.auth.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
