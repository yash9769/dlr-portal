import { supabase } from '../lib/supabase';
import { Capacitor } from '@capacitor/core';

export const api = {
    auth: {
        login: async (email, password) => {
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) return { user: null, error };

                // Fetch profile data to get role
                if (data.user) {
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', data.user.id)
                        .maybeSingle();
                    if (profileError) console.error('Profile fetch error:', profileError);

                    const userWithRole = { ...data.user, ...(profile || {}) };
                    return { user: userWithRole, error: null };
                }
                return { user: null, error: null };
            } catch (err) {
                return { user: null, error: err };
            }
        },
        logout: async () => {
            return await supabase.auth.signOut();
        },
        loginWithGoogle: async () => {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: Capacitor.isNativePlatform()
                        ? 'com.yashodhan.dlr://login-callback'
                        : window.location.origin,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                },
            });
            if (error) throw error;
            return { data };
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
                    // Fallback: Use email to grant admin role if profile fetch fails
                    if (user.email === 'admin@vit.edu.in') {
                        return { ...user, role: 'admin' };
                    }
                    return user;
                }

                // Fallback: If profile exists but role is missing/null, check email
                const finalRole = profile?.role || ((user.email === 'admin@vit.edu.in') ? 'admin' : 'faculty');

                return { ...user, ...profile, role: finalRole };
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
        update: async (id, updates) => {
            const { data, error } = await supabase
                .from('daily_lecture_records')
                .update(updates)
                .eq('id', id)
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
        approveReport: async (date, approvedBy, approverId) => {
            const { data, error } = await supabase
                .from('report_approvals')
                .upsert({
                    report_date: date,
                    approved_by: approvedBy,
                    approver_id: approverId,
                    status: 'approved',
                    approved_at: new Date().toISOString()
                }, { onConflict: 'report_date' });
            if (error) throw error;
            return { data };
        },
        getApprovalStatus: async (date) => {
            const { data, error } = await supabase
                .from('report_approvals')
                .select('*')
                .eq('report_date', date)
                .maybeSingle();
            if (error) return { data: null };
            return { data };
        }
    },
    bugs: {
        submit: async (report) => {
            const { data, error } = await supabase
                .from('bug_reports')
                .insert(report)
                .select()
                .single();
            if (error) throw error;
            return { data };
        },
        list: async () => {
            try {
                // 1. Fetch bug reports first
                const { data: reports, error: reportsError } = await supabase
                    .from('bug_reports')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (reportsError) throw reportsError;
                if (!reports || reports.length === 0) return { data: [] };

                // 2. Collect unique user IDs
                const userIds = [...new Set(reports.map(r => r.user_id))].filter(Boolean);

                // 3. Fetch profiles for these users
                const { data: profiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, full_name, email')
                    .in('id', userIds);

                if (profilesError) {
                    console.warn('Could not fetch profiles for bug reports:', profilesError);
                }

                // 4. Merge profiles into reports
                const mergedData = reports.map(report => ({
                    ...report,
                    profiles: profiles?.find(p => p.id === report.user_id) || null
                }));

                return { data: mergedData };
            } catch (err) {
                console.error('Bugs list fetch failed:', err);
                throw err;
            }
        },
        updateStatus: async (id, status) => {
            const updates = { status };
            if (status === 'resolved') {
                updates.resolved_at = new Date().toISOString();
            }
            const { data, error } = await supabase
                .from('bug_reports')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return { data };
        }
    },
    students: {
        list: async (filters = {}) => {
            let query = supabase.from('students').select('*').order('roll_no');
            if (filters.division) query = query.eq('division', filters.division);
            if (filters.year) query = query.eq('year', filters.year);
            if (filters.batch) query = query.eq('batch', filters.batch);
            const { data, error } = await query;
            if (error) throw error;
            return { data };
        },
        create: async (student) => {
            const { data, error } = await supabase.from('students').insert(student);
            if (error) throw error;
            return { data };
        },
        delete: async (id) => {
            const { error } = await supabase.from('students').delete().eq('id', id);
            if (error) throw error;
            return { error: null };
        },
        bulkCreate: async (students) => {
            const { data, error } = await supabase
                .from('students')
                .upsert(students, {
                    onConflict: 'roll_no,division,year',
                    ignoreDuplicates: false
                });
            if (error) throw error;
            return { data };
        },
        deleteAll: async () => {
            const { error } = await supabase.from('students').delete().not('id', 'is', null);
            if (error) throw error;
            return { error: null };
        }
    }
};
