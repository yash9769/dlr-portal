import { supabase } from '../lib/supabase';

export const api = {
    auth: {
        login: async (email, password) => {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            // Fetch profile data to get role
            if (data.user) {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .maybeSingle(); // Use maybeSingle to avoid 406 errors
                if (profileError) console.error('Profile fetch error:', profileError);

                const userWithRole = { ...data.user, ...(profile || {}) };
                return { user: userWithRole, error: null };
            }
            return { user: null, error: null };
        },
        logout: async () => {
            return await supabase.auth.signOut();
        },
        getUser: async () => {
            // Check for active session first
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return null;

            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .maybeSingle(); // Use maybeSingle to avoid 406 errors
                if (error) {
                    console.error('Error fetching profile:', error);
                    return user; // Return basic user if profile fails
                }
                return { ...user, ...(profile || {}) };
            }
            return null;
        },
        onAuthStateChange: (callback) => {
            return supabase.auth.onAuthStateChange(callback);
        }
    },

    faculty: {
        list: async () => {
            const { data, error } = await supabase
                .from('faculty')
                .select('*')
                .order('name');
            if (error) throw error;
            return { data };
        }
    },

    timetable: {
        getByFaculty: async (facultyId) => {
            const { data, error } = await supabase
                .from('timetable')
                .select(`
          *,
          assigned_faculty:faculty(name)
        `)
                .eq('assigned_faculty_id', facultyId);
            if (error) throw error;
            return { data };
        },
        getAll: async () => {
            const { data, error } = await supabase
                .from('timetable')
                .select(`
          *,
          assigned_faculty:faculty(name)
        `)
                .order('start_time');
            if (error) throw error;
            return { data };
        },
        create: async (entry) => {
            const { data, error } = await supabase.from('timetable').insert(entry);
            if (error) throw error;
            return { data };
        },
        delete: async (id) => {
            const { error } = await supabase.from('timetable').delete().eq('id', id);
            if (error) throw error;
            return { error: null };
        }
    },

    dlr: {
        submit: async (record) => {
            const { data, error } = await supabase
                .from('daily_lecture_records')
                .insert(record)
                .select()
                .single();
            if (error) throw error;
            return { data };
        },
        list: async () => {
            const { data, error } = await supabase
                .from('daily_lecture_records')
                .select(`
                    *,
                    actual_faculty:faculty(name),
                    schedule:timetable(subject_name, semester, division, assigned_faculty_id, room_no)
                `)
                .order('date', { ascending: false })
                .order('created_at', { ascending: false });
            if (error) throw error;
            return { data };
        },
        listSubmissions: async () => {
            const { data, error } = await supabase
                .from('daily_lecture_records')
                .select(`
                    *,
                    actual_faculty:faculty(name),
                    schedule:timetable(subject_name, semester, division, assigned_faculty_id, room_no)
                `)
                .order('date', { ascending: false });
            if (error) throw error;
            return { data };
        },
        getReportData: async (date) => {
            // Fix: Use local date construction to avoid timezone shifts
            const [y, m, d] = date.split('-').map(Number);
            const dayOfWeek = new Date(y, m - 1, d).toLocaleString('en-us', { weekday: 'long' });

            const { data: schedule, error: sError } = await supabase
                .from('timetable')
                .select(`*, assigned_faculty:faculty(*)`)
                .eq('day_of_week', dayOfWeek);
            if (sError) throw sError;

            const { data: records, error: rError } = await supabase
                .from('daily_lecture_records')
                .select(`
                    *,
                    actual_faculty:faculty(*),
                    schedule:timetable(subject_name, semester, division)
                `)
                .eq('date', date);
            if (rError) throw rError;

            return { schedule: schedule || [], records: records || [] };
        },
        approveReport: async (date, approvedBy, approvedById) => {
            const { data, error } = await supabase
                .from('report_approvals')
                .upsert({ date, approved_by: approvedBy, approved_by_id: approvedById });
            if (error) throw error;
            return { data };
        },
        getApprovalStatus: async (date) => {
            const { data, error } = await supabase
                .from('report_approvals')
                .select('*')
                .eq('date', date)
                .maybeSingle();
            if (error) return { data: null };
            return { data };
        }
    }
};
