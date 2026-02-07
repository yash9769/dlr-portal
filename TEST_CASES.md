# 📋 **DLR Portal – Functional Test Cases**

---

## 1️⃣ AUTHENTICATION & ACCESS CONTROL

### TC-AUTH-01: Valid Admin Login
**Steps**
1. Open login page
2. Enter valid admin email & password
3. Click Login

**Expected Result**
* Admin redirected to Dashboard
* Admin role visible
* Admin-only menu items visible

---

### TC-AUTH-02: Invalid Credentials
**Steps**
1. Enter invalid email or password
2. Click Login

**Expected Result**
* Error message displayed
* No page navigation

---

### TC-AUTH-03: Unauthorized Role Access
**Steps**
1. Login as Faculty
2. Try accessing `/timetable` or `/faculty-master`

**Expected Result**
* Access denied
* Redirect to Dashboard or error page

---

### TC-AUTH-04: Session Timeout
**Steps**
1. Login
2. Stay idle beyond timeout
3. Click any button

**Expected Result**
* Session expired
* Redirect to login

---

## 2️⃣ DASHBOARD FUNCTIONALITY

### TC-DASH-01: Dashboard Data Load
**Steps**
1. Login
2. Open Dashboard

**Expected Result**
* Total lectures count visible
* Today’s schedule displayed
* No console errors

---

### TC-DASH-02: “Fill DLR” Button Visibility
**Steps**
1. Login as Faculty
2. Open Dashboard

**Expected Result**
* “Fill DLR” shown only for today’s lectures
* Button disabled if already submitted

---

### TC-DASH-03: Lecture Status Indicator
**Steps**
1. Submit DLR for a lecture
2. Return to Dashboard

**Expected Result**
* Status changes to “Submitted”
* Fill button disabled

---

## 3️⃣ TEACHING / WEEKLY SCHEDULE

### TC-SCH-01: Weekly Schedule Load
**Steps**
1. Navigate to “Teaching Timetable”

**Expected Result**
* Lectures grouped by day
* Correct subject, time, room shown

---

### TC-SCH-02: No Lecture Day
**Steps**
1. View a day with no lectures

**Expected Result**
* Message: “No lectures scheduled”

---

### TC-SCH-03: Room Conflict Indicator
**Steps**
1. Add two lectures with same room & overlapping time
2. View schedule

**Expected Result**
* Conflict indicator visible
* Warning tooltip shown

---

## 4️⃣ TIMETABLE SETUP (ADMIN)

### TC-TT-01: Add Individual Slot
**Steps**
1. Fill slot details
2. Click “Add to Timetable”

**Expected Result**
* Slot added successfully
* Appears in Current Schedule table

---

### TC-TT-02: Missing Mandatory Fields
**Steps**
1. Leave subject or time empty
2. Click Add

**Expected Result**
* Validation error
* Slot not created

---

### TC-TT-03: Overlapping Slot Detection
**Steps**
1. Add slot overlapping existing slot
2. Click Add

**Expected Result**
* Warning displayed
* Admin confirmation required

---

### TC-TT-04: Delete Slot
**Steps**
1. Click delete icon on slot

**Expected Result**
* Confirmation popup
* Slot removed after confirmation

---

### TC-TT-05: Clear All Button
**Steps**
1. Click “Clear All”

**Expected Result**
* Confirmation modal
* All timetable entries removed

---

## 5️⃣ BULK IMPORT / EXPORT

### TC-IMP-01: Valid Excel Import
**Steps**
1. Upload correct Excel format
2. Click Import

**Expected Result**
* All rows imported
* No errors

---

### TC-IMP-02: Invalid Column Excel
**Steps**
1. Upload Excel missing required headers

**Expected Result**
* Clear error message
* Import rejected

---

### TC-EXP-01: Export Timetable to Excel
**Steps**
1. Click “Export to Excel”

**Expected Result**
* Excel downloaded
* Data matches timetable

---

## 6️⃣ DLR FORM (FACULTY)

### TC-DLR-01: Open DLR Form
**Steps**
1. Click “Fill DLR”

**Expected Result**
* DLR form opens
* Timetable data pre-filled

---

### TC-DLR-02: Same Faculty Button
**Steps**
1. Click “Same Faculty”

**Expected Result**
* Actual faculty auto-filled
* Fields locked

---

### TC-DLR-03: Different Faculty Flow
**Steps**
1. Select “Different Faculty”
2. Change faculty name

**Expected Result**
* Faculty dropdown enabled
* Remarks mandatory

---

### TC-DLR-04: Attendance Validation
**Steps**
1. Enter attendance greater than batch strength
2. Submit

**Expected Result**
* Validation error
* Submission blocked

---

### TC-DLR-05: Submit DLR
**Steps**
1. Fill mandatory fields
2. Click Submit

**Expected Result**
* Success message
* Status updated to Submitted

---

## 7️⃣ REPORTS & RECORDS

### TC-REP-01: Daily Report Generation
**Steps**
1. Select date
2. Click “Preview”

**Expected Result**
* Report preview loads
* All lectures shown

---

### TC-REP-02: Download PDF
**Steps**
1. Click “Download PDF”

**Expected Result**
* PDF downloaded
* Matches official DLR format

---

### TC-REP-03: Export DLR Excel
**Steps**
1. Click “Export Excel”

**Expected Result**
* Excel generated
* Timetable fields filled
* Actual fields blank if not submitted

---

### TC-REP-04: Approved Report Lock
**Steps**
1. Approve report
2. Try editing DLR

**Expected Result**
* Editing disabled
* Read-only mode

---

## 8️⃣ LECTURE CAPTURE TRACKING

### TC-LC-01: Auto Generation of LC Sheet
**Steps**
1. Generate report

**Expected Result**
* LC sheet created
* Only LC-enabled rooms listed

---

### TC-LC-02: Lecture Number Sequence
**Steps**
1. Verify LC rows

**Expected Result**
* Lecture numbers increment correctly

---

### TC-LC-03: Mic Used Default
**Steps**
1. View LC sheet

**Expected Result**
* Mic used defaults to “Yes”

---

## 9️⃣ ROLE & DATA SECURITY

### TC-SEC-01: Faculty Data Isolation
**Steps**
1. Login as Faculty A
2. Try viewing Faculty B DLR

**Expected Result**
* Access denied

---

### TC-SEC-02: Admin Edit Audit
**Steps**
1. Admin edits submitted DLR

**Expected Result**
* Edit logged with timestamp & admin name

---

## 🔟 ERROR HANDLING & UX

### TC-ERR-01: Network Failure
**Steps**
1. Disconnect internet
2. Submit DLR

**Expected Result**
* Error message
* Data not lost

---

### TC-ERR-02: Page Refresh Protection
**Steps**
1. Fill DLR
2. Refresh before submit

**Expected Result**
* Warning or auto-save

---

## ✅ FINAL NOTE FOR ANTIGRAVITY

> All test cases must validate **button click, backend response, database update, UI feedback, and role enforcement**. Any deviation must be logged as a functional or security defect.
