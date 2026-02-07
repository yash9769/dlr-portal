# 🧪 DLR Portal – Frontend Button & Click Test Cases

**Scope:**
Verify that every button, link, icon, toggle, dropdown, and clickable UI element is clickable, responsive, visible, and performs its intended UI action.

---

## 1️⃣ AUTH & GLOBAL BUTTONS

### BTN-01: Login Button
**Location:** Login page
**Action:** Click “Login”
**Expected UI Result:**
* Button shows loading / disabled state
* Redirects after successful login
* Shows error on invalid input

### BTN-02: Logout Button
**Location:** Sidebar (bottom)
**Action:** Click “Sign Out”
**Expected UI Result:**
* Session cleared
* Redirect to login page

### BTN-03: Browser Refresh Protection
**Action:** Refresh page after login
**Expected UI Result:**
* User remains logged in
* No blank screen / crash

---

## 2️⃣ SIDEBAR NAVIGATION BUTTONS

### BTN-04: Dashboard Button
**Click:** Dashboard
**Expected:**
* Dashboard page loads
* Active highlight visible
* URL updates correctly

### BTN-05: Teaching Timetable Button
**Click:** Teaching Timetable
**Expected:**
* Timetable view loads
* No console errors

### BTN-06: Department Reports Button
**Click:** Department Reports
**Expected:**
* Reports page loads
* Date selector visible

### BTN-07: Timetable Setup Button
**Click:** Timetable Setup
**Expected:**
* Admin timetable page loads
* Form visible

### BTN-08: Faculty Master Button
**Click:** Faculty Master
**Expected:**
* Faculty list loads
* Add / view options visible

---

## 3️⃣ DASHBOARD BUTTONS

### BTN-09: “Fill DLR” Button
**Click:** Fill DLR
**Expected:**
* DLR form opens
* No page freeze

### BTN-10: Disabled Fill DLR Button
**Condition:** DLR already submitted
**Expected:**
* Button disabled
* Tooltip or visual indication

---

## 4️⃣ TIMETABLE SETUP (ADMIN)

### BTN-11: Add to Timetable Button
**Click:** + Add to Timetable
**Expected:**
* Slot added
* Button shows feedback (spinner / success)

### BTN-12: Delete Slot Button (🗑)
**Click:** Delete icon
**Expected:**
* Confirmation popup appears
* Slot removed on confirm

### BTN-13: Clear All Button
**Click:** Clear All
**Expected:**
* Confirmation modal
* All slots cleared only after confirm

### BTN-14: Bulk Import Button
**Click:** Bulk Import (Excel/PDF)
**Expected:**
* File picker opens
* Accepts correct file types

### BTN-15: Export to Excel Button
**Click:** Export to Excel
**Expected:**
* File downloads
* No UI freeze

---

## 5️⃣ FILTER & DROPDOWN CONTROLS

### BTN-16: Filter Faculty Dropdown
**Click:** Faculty dropdown
**Expected:**
* Options visible
* Selection updates UI list

### BTN-17: Filter Room Search
**Click:** Room search input
**Expected:**
* Text input works
* Results filter live

### BTN-18: Filter Division Dropdown
**Click:** Division dropdown
**Expected:**
* Timetable filters correctly

### BTN-19: Clear Filters Button
**Click:** Clear Filters
**Expected:**
* Filters reset
* Full list visible

---

## 6️⃣ REPORTS PAGE BUTTONS

### BTN-20: Date Picker
**Click:** Date selector
**Expected:**
* Calendar opens
* Date change reloads report

### BTN-21: Preview Button
**Click:** Preview
**Expected:**
* PDF preview loads
* Scroll works

### BTN-22: Download PDF Button
**Click:** Download PDF
**Expected:**
* File downloads
* Button shows loading state

### BTN-23: Export Excel Button
**Click:** Export Excel
**Expected:**
* Excel file downloads
* No UI error

---

## 7️⃣ DLR FORM BUTTONS

### BTN-24: Same Faculty Button
**Click:** Same Faculty
**Expected:**
* Fields auto-filled
* Fields disabled

### BTN-25: Different Faculty Button
**Click:** Different Faculty
**Expected:**
* Faculty dropdown enabled
* Remarks field activated

### BTN-26: Submit DLR Button
**Click:** Submit
**Expected:**
* Validation occurs
* Success toast on submit

### BTN-27: Cancel / Back Button
**Click:** Cancel / Back
**Expected:**
* Returns to previous page
* No data loss warning if untouched

---

## 8️⃣ ICONS & MICRO-INTERACTIONS

### BTN-28: Delete Icon Hover
**Action:** Hover delete icon
**Expected:**
* Tooltip appears
* Cursor changes to pointer

### BTN-29: Disabled Button Hover
**Action:** Hover disabled button
**Expected:**
* Tooltip explains why disabled

### BTN-30: Scroll + Click Stability
**Action:** Scroll and click buttons rapidly
**Expected:**
* No misclicks
* No accidental navigation

---

## 9️⃣ ERROR & EDGE UI TESTS

### BTN-31: Double Click Protection
**Action:** Double click Submit / Add buttons
**Expected:**
* Single action only
* No duplicate entries

### BTN-32: Button on Slow Network
**Action:** Throttle network
**Expected:**
* Loading state visible
* Button disabled during request

---

## ✅ FINAL DELIVERY NOTE FOR ANTIGRAVITY

Each test must confirm:
✔ Button is visible
✔ Button is clickable
✔ Button gives visual feedback
✔ Button performs expected UI action
✔ No console errors occur
