-- SECURITY DOCUMENTATION & AUDIT LOG
-- Status: LOCKED 🔒
-- Date: 2026-01-30
-- Auditor: Antigravity Agent

/* 
 1. ROW LEVEL SECURITY (RLS) AUDIT
 ---------------------------------
 ALL Tables must have RLS enabled and explicit policies.

 TABLE: profiles
 - SELECT: Public (User discovery)
 - INSERT: Self (Registration)
 - UPDATE: Self (Profile edits)
 - DELETE: None (Admin manual only)

 TABLE: faculty
 - SELECT: Authenticated (Read-only reference)
 - INSERT: Admin Only
 - UPDATE: Admin Only
 - DELETE: Admin Only

 TABLE: timetable
 - SELECT: Authenticated (Read-only reference)
 - INSERT: Admin Only
 - UPDATE: Admin Only
 - DELETE: Admin Only

 TABLE: daily_lecture_records (CRITICAL)
 - SELECT: 
    - Faculty: See OWN records only (auth.uid() = submitted_by)
    - Admin/HOD: See ALL records
 - INSERT: 
    - Strict check: auth.uid() MUST match submitted_by
 - UPDATE:
    - Strict check: auth.uid() MUST match submitted_by
 - DELETE:
    - Admin Only

 TABLE: report_approvals
 - SELECT: Authenticated (Transparency)
 - INSERT: Admin/HOD Only (Approvals)
 - UPDATE: None (Immutable history preferred, or Admin fix)

 2. DATA INTEGRITY AUDIT
 -----------------------
 - Student Attendance:
    - Now stored in 'student_attendance' JSONB column in DB.
    - Source of Truth: SERVER (Database).
    - Fallback: LocalStorage (only for legacy/draft resilience).
 
 - Audit Types:
    - 'submitted_by' tracks the UUID of the faculty.
    - 'approved_by_id' tracks the UUID of the HOD/Admin.
    - All timestamps use UTC.

 3. FAILURE MODES & RECOVERY
 ---------------------------
 - Network Cut: Frontend caches to LocalStorage; Retry logic recommended.
 - Token Leak: RLS prevents accessing others' data even with valid token.
 - Malicious Input: DB Constraints (Check > 0, Strings) + Backend Validation.

*/

-- VERIFICATION QUERY
-- Run this to check if any tables are insecure (RLS Disabled)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
