# Human Resource Management System (HRMS) — Full Build Prompt

Copy everything below into your AI IDE (Cursor / Bolt / Windsurf / v0 / Claude Code) as the project brief.

---

## 1. Project Summary

Build a full-stack **Human Resource Management System (HRMS)** web app with two roles — **Employee** and **Admin/HR Officer** — covering: authentication, an employee directory, employee profiles (with salary and private info), attendance tracking (check-in/check-out), and time-off requests with an approval workflow.

**Suggested stack** (swap freely, but state your choice to the AI IDE):
- Frontend: React + TypeScript, Tailwind CSS, React Router
- Backend: Node.js/Express or a BaaS (Supabase/Firebase) with Postgres
- Auth: Custom auth with system-generated Login IDs (see §4.1) — not email/OAuth-only
- File storage: for resumes, profile pictures, and sick-leave attachments

---

## 2. Roles & Permissions

| Feature | Employee | Admin / HR Officer |
|---|---|---|
| Sign up | ❌ (cannot self-register) | ✅ creates employee accounts |
| View own profile | ✅ full edit | ✅ |
| View other employees' profiles | ✅ view-only (click a card) | ✅ view-only |
| Salary Info tab | ❌ hidden | ✅ visible & editable |
| Attendance — own records | ✅ | ✅ |
| Attendance — all employees | ❌ | ✅ (current day, all staff) |
| Time Off — own requests | ✅ create/view | ✅ |
| Time Off — all requests | ❌ | ✅ view all |
| Time Off — Approve/Reject | ❌ | ✅ |

---

## 3. Screens & Routes

1. **`/signin`** — Sign In
2. **`/signup`** — Sign Up (only reachable by Admin/HR creating a new employee; not a public self-serve route)
3. **`/dashboard`** — Employee directory (default landing page after login)
4. **`/profile/:id`** — Employee profile (view-only when viewing someone else; editable tabs when viewing own)
5. **`/attendance`** — Attendance list/check-in-out
6. **`/timeoff`** — Time off list + allocation summary
7. **`/timeoff/new`** — Time Off Request modal/page

Persistent top navbar on all authenticated pages: **Company Logo | Employees | Attendance | Time Off** (left/center) and **Avatar → dropdown (My Profile, Log Out)** (right).

---

## 4. Business Logic (critical — pulled directly from the spec notes)

### 4.1 Sign In / Sign Up
- Sign Up page fields: Company Name, Upload Logo, Name, Email, Phone, Password, Confirm Password. This is used **once**, by the company/Admin, not by individual employees.
- **Login ID auto-generation format:** `[First 2 letters of company] + [First 2 letters of employee first name + first 2 letters of last name] + [Year of joining] + [Serial number of joining that year]`
  - Example: `OIJODO20220001` → `OI` (Odoo India, company) + `JODO` (John Doe) + `2022` (joining year) + `0001` (serial number for that year).
- Normal employees **cannot self-register**. When an Admin/HR Officer creates a new employee record, the system auto-generates that employee's Login ID using the format above.
- The employee's initial password is **also system-generated** on account creation. The employee must log in and change this password on first use.
- Sign In fields: Login ID / Email, Password → "SIGN IN" button; link to Sign Up for the company-admin flow only.

### 4.2 Dashboard / Employee Directory (landing page after login)
- Grid of employee cards. Each card shows: profile picture, employee name, and a **status indicator** in the top-right corner:
  - 🟢 Green dot = present in office
  - ✈️ Airplane icon = on leave
  - 🟡 Yellow dot = absent (no time-off filed, not checked in)
- Cards are **clickable** → opens that employee's profile in **view-only / non-editable** mode.
- Includes a search bar to filter employees.

### 4.3 Employee Profile
- Header: avatar, name, company, job position/department shown as chips.
- Clicking the avatar shows a dropdown with **My Profile** and **Log Out**.
- Tabs: **My Profile**, **Resume**, **Private Info**, **Salary Info** (Admin-only, see §4.4), **Security**.
- "My Profile" tab includes free-text sections: About, Skills (with "+ Add Skills"), Certification, "What I love about my job", "My interests and hobbies".
- **Private Info tab fields:** Date of Birth, Nationality, Gender, Marital Status, Personal Email, Residing Address, Bank Name, Account Number, IFSC Code, PAN No, UAN No, Emp Code, Date of Joining, Job Position, Department, Manager, Location, Mobile, Email.

### 4.4 Salary Info Tab (Admin/HR only — must be hidden from employee's own view)
- **Wage Type:** Fixed wage, entered as Monthly or Yearly (toggle) with a working-days-per-week and break-time setting.
- **Salary Components** — each with Computation Type (**Fixed Amount** or **% of Wage**) and an auto-computed Value:
  | Component | Default calculation |
  |---|---|
  | Basic Salary | 50% of Wage |
  | House Rent Allowance (HRA) | 50% of Basic |
  | Standard Allowance | Fixed ₹4,167/month |
  | Performance Bonus | 8.33% of Basic (variable, company-defined %) |
  | Leave Travel Allowance (LTA) | 8.333% of Basic |
  | Fixed Allowance | Wage − sum of all other components |
- **Validation rule:** the sum of all components must never exceed the defined Wage.
- Component values must **auto-recalculate whenever the Wage changes**.
- **Provident Fund (PF):** both Employee and Employer contributions, each configurable (default 12% of Basic), with helper text "PF is calculated based on the basic salary."
- **Professional Tax:** fixed deduction field (default ₹200), configurable.
- Worked example to replicate in seed/test data: Wage = ₹50,000/month → Basic = ₹25,000, HRA = ₹12,500, Standard Allowance = ₹4,167, PF (each side) = ₹3,000, Professional Tax = ₹200.

### 4.5 Attendance
- Employees mark attendance via a **Check In / Check Out** control (shown as a "systray"-style widget). On successful Check In, a status dot switches from red → green.
- **Attendance List view:**
  - Employees see only their **own** day-wise attendance for the current month by default (columns: Date, Check In, Check Out, Work Hours, Extra Hours).
  - Admin/HR Officers see **all employees'** attendance for the current day, plus date/month navigation (prev/next arrows, month picker).
  - Summary tiles: Count of days present, Leaves count, Total working days.
- Attendance data is the source of truth for payroll: unpaid leave or missing attendance automatically reduces the number of payable days used in payslip computation.

### 4.6 Time Off
- Allocation summary cards per employee: e.g. "Paid Time Off — 24 Days Available", "Sick Time Off — 07 Days Available."
- **List view** columns: Name, Start Date, End Date, Time Off Type, Status. Admin/HR see all employees' requests with **Approve/Reject** actions; employees see only their own (read-only status).
- **"NEW" button** opens the **Time Off Request form** (modal) with fields:
  - Employee (auto-filled for self, selectable for Admin)
  - Time Off Type — dropdown: **Paid Time Off, Sick Leave, Unpaid Leave**
  - Validity Period — date range (From / To)
  - Allocation — number of days
  - Attachment — optional upload (required context: "for sick leave certificate")
  - **Submit** / **Discard** buttons

---

## 5. Suggested Data Models

```
Company { id, name, logoUrl }

Employee {
  id, loginId (auto-generated), name, email, personalEmail, mobile,
  passwordHash, mustChangePassword: bool,
  role: 'admin' | 'employee',
  jobPosition, department, manager, location,
  dateOfJoining, dateOfBirth, nationality, gender, maritalStatus,
  residingAddress, bankName, accountNumber, ifscCode, panNo, uanNo, empCode,
  profilePictureUrl, resumeUrl, about, skills[], certifications[],
  whatILoveAboutMyJob, interestsAndHobbies
}

SalaryInfo {
  employeeId, wageType: 'fixed', wageAmount, wagePeriod: 'monthly'|'yearly',
  workingDaysPerWeek, breakTime,
  components: [{ name, computationType: 'fixed'|'percent', value, computedAmount }],
  pfEmployeePercent, pfEmployerPercent, professionalTax
}

Attendance {
  id, employeeId, date, checkIn, checkOut, workHours, extraHours, status
}

TimeOffRequest {
  id, employeeId, type: 'paid'|'sick'|'unpaid',
  startDate, endDate, allocationDays, attachmentUrl,
  status: 'pending'|'approved'|'rejected'
}

TimeOffAllocation { employeeId, type, totalDays, usedDays, remainingDays }
```

---

## 6. Design Notes
- Clean, card-based enterprise UI (similar reference point: Odoo HR module).
- Consistent top navbar across all authenticated screens.
- Status colors: green (present/approved), yellow (absent/pending), red (checked-out/rejected).
- Placeholder "[Employee Name]" / Lorem Ipsum text in the wireframe should be replaced with real dynamic data bindings, not left as static copy.

---

## 7. Build Instructions for the AI IDE

> Build this HRMS as described above. Start with: (1) the data models and auth system with the auto-generated Login ID logic in §4.1, (2) the Employee Directory dashboard with status-indicator cards, (3) the Employee Profile with role-gated Salary Info tab and auto-calculating salary components per §4.4, (4) Attendance check-in/out and list views per §4.5, and (5) Time Off request/approval workflow per §4.6. Enforce the role-based permission table in §2 throughout. Use realistic seed data matching the worked salary example in §4.4.
