# 🎓 VIT DLR Portal
### Academic Audit & Daily Lecture Record Management System

A premium, high-performance web application designed for the **Information Technology Department** at **Vidyalankar Institute of Technology (VIT)**. This portal digitizes the manual Daily Lecture Record (DLR) process, providing real-time auditing, conflict detection, and automated report generation.

---

## ✨ Key Features

### 👨‍🏫 For Faculty
- **Dynamic Dashboard**: View today's personal teaching schedule at a glance.
- **Efficient Session Audit**: Record actual lecture timings, attendance, and topics covered in under 30 seconds.
- **LCS Compliance**: Audit Lecture Capture System (LCS) status and Smart Board PDF uploads.
- **History Tracking**: View past submissions and status of departmental approvals.
- **Auto-Reminders**: Get alerted for pending records from the previous day.

### 🔑 For Admins & HOD
- **Timetable Management**: Full CRUD operations for the departmental timetable (Monday to Sunday).
- **Conflict Detection**: Real-time warnings for room double-bookings or faculty overlaps.
- **Bulk Import/Export**: Import schedules from Excel/PDF or export the entire timetable.
- **Consolidated Reporting**: Generate formal PDF Daily Lecture Records with "Scheduled vs Actual" comparisons.
- **Official DLR Excel**: Export data directly into the official VIT departmental Excel template.
- **Approval Workflow**: Lock and approve daily audits with digital authority stamps.

---

## 🛠️ Tech Stack

- **Frontend**: React 18 (Vite), Tailwind CSS
- **Icons**: Lucide React
- **Backend & Auth**: Supabase (PostgreSQL)
- **Reporting**: jsPDF, jsPDF-AutoTable, SheetJS (XLSX)
- **Date Utilities**: date-fns
- **UI Components**: Custom premium Glassmorphism-inspired design system

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn
- A Supabase project

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/yash9769/dlr-portal.git

# Navigate to project directory
cd dlr-portal

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
1. Go to your Supabase SQL Editor.
2. Run the schema found in `supabase/schema.sql`.
3. (Optional) Run `supabase/full_seed.sql` to prepopulate faculty and timetable data.

### 5. Run Locally
```bash
npm run dev
```

---

## 📁 Project Structure

```text
src/
├── components/     # Reusable UI components (Layout, AuthGuard, etc.)
├── context/        # Auth and Language contexts
├── lib/            # External library configurations (Supabase client)
├── pages/          # Full page views (Dashboard, Timetable, Reports)
├── services/       # API wrappers and Export services (Excel/PDF)
├── utils/          # Helper functions and parsers
└── App.jsx         # Routing and core logic
supabase/
├── schema.sql      # Database tables, RLS, and Views
└── full_seed.sql   # Official IT Department seed data
```

---

## 📑 Implementation Details

### Conflict Detection Engine
The portal features a robust logic engine that checks for overlaps in:
1. **Room No**: Ensures no two sessions occupy the same room simultaneously.
2. **Faculty**: Prevents a professor from being assigned to two different locations at once.
3. **Division**: Ensures a class division doesn't have two conflicting subjects.

### Reporting Engine
- **PDF Generation**: Uses `jsPDF` to create a landscape-oriented consolidated report with highlight-based "substituted faculty" or "room changes" indicators.
- **Excel Mapping**: Custom mapping logic in `excelService.js` ensures that exported files match the exact formatting required by the VIT Academic Audit cell.

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.

---

**Developed for VIT IT Department**
*Simplifying academic audits through technology.*
