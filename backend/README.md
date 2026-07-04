# HRMS Backend Server API

This is the Express + Prisma + SQLite backend server for the Human Resource Management System (HRMS).

## Setup & Running

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Database Setup**:
   Prisma handles the SQLite database. Set up migrations and seed sample data:
   ```bash
   pnpm db:setup
   ```
   *This command runs migrations to create tables in `dev.db` and runs `prisma/seed.ts` to insert company, employee, salary, attendance, and time-off data.*

3. **Run Server in Development Mode**:
   ```bash
   pnpm dev
   ```
   *The server runs by default on `http://localhost:5000`.*

4. **Production Build & Start**:
   ```bash
   pnpm build
   pnpm start
   ```

---

## Seed / Test Data Accounts

You can test the system using these pre-seeded accounts:

### 1. Admin/HR Account
- **Login ID**: `OIHRAD20260001`
- **Password**: `AdminPass123`
- **Role**: `admin`
- **Company**: Odoo India

### 2. Employee Account (John Doe - worked salary example in §4.4)
- **Login ID**: `OIJODO20220001`
- **Password**: `EmployeePass123`
- **Role**: `employee`
- **Wage**: ₹50,000 / month
- **Salary Components**:
  - Basic Salary: ₹25,000
  - HRA: ₹12,500
  - Standard Allowance: ₹4,167
  - Performance Bonus: ₹2,082.50
  - LTA: ₹2,083.25
  - Fixed Allowance: ₹4,167.25
- **Allocations**: 24 Days Paid Leave, 7 Days Sick Leave

### 3. Employee Account (Jane Smith)
- **Login ID**: `OIJASM20230001`
- **Password**: `EmployeePass123`
- **Role**: `employee`
- **Wage**: ₹80,000 / month

---

## API Documentation

All routes are prefixed with `/api`.
Private endpoints require the `Authorization` header with a bearer token:
`Authorization: Bearer <JWT_TOKEN>`

### 1. Authentication (`/api/auth`)

#### Sign Up (Company Admin)
- **Endpoint**: `POST /auth/signup`
- **Headers**: `Content-Type: multipart/form-data`
- **Fields**:
  - `companyName` (text)
  - `name` (text)
  - `email` (text)
  - `phone` (text, optional)
  - `password` (text)
  - `logo` (file upload, optional)
- **Response**: Creates company and generates login ID + token.

#### Sign In
- **Endpoint**: `POST /auth/signin`
- **Body**:
  ```json
  {
    "loginIdOrEmail": "OIJODO20220001",
    "password": "EmployeePass123"
  }
  ```
- **Response**: JWT session token, user role info, and `mustChangePassword` flag.

#### Change Password
- **Endpoint**: `POST /auth/change-password`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "oldPassword": "EmployeePass123",
    "newPassword": "MySecretNewPassword"
  }
  ```

---

### 2. Employees Directory (`/api/employees`)

#### Create Employee
- **Endpoint**: `POST /employees`
- **Headers**: `Authorization: Bearer <token>` (Admin Only)
- **Body**:
  ```json
  {
    "name": "Alex Mercer",
    "email": "alex.mercer@company.com",
    "jobPosition": "QA Engineer",
    "department": "Engineering",
    "dateOfJoining": "2026-07-04"
  }
  ```
- **Response**: Creates profile, generates Login ID (e.g., `OIALME20260001`), generates random temporary password, and sets up default leave allocations (24 Paid, 7 Sick) and default salary layout.

#### Employee List (Dashboard Card Grid)
- **Endpoint**: `GET /employees?search=<term>`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Array of employee summary cards including their live status code:
  - `status`: `'present'` (Green) | `'absent'` (Yellow) | `'leave'` (Airplane)

#### Get Profile details
- **Endpoint**: `GET /employees/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Single employee JSON object. Role rules applied:
  - If viewing someone else, returns basic public details.
  - If Admin or Self, returns full details (Private Info tab).
  - If Admin, includes the `salaryInfo` object. (Hidden for Self/Employees).

#### Update Profile Information
- **Endpoint**: `PUT /employees/:id/profile`
- **Headers**: `Authorization: Bearer <token>` (Admin or Self)
- **Body**:
  ```json
  {
    "about": "Updated biography...",
    "skills": ["React", "TypeScript"],
    "certifications": ["AWS Practitioner"],
    "whatILoveAboutMyJob": "Collaborative culture",
    "interestsAndHobbies": "Chess, photography"
  }
  ```

#### Update Private Info
- **Endpoint**: `PUT /employees/:id/private-info`
- **Headers**: `Authorization: Bearer <token>` (Admin or Self)
- **Body**: Fields like bank details, residence, PAN, UAN. Note: Employment details like `jobPosition` or `dateOfJoining` can only be updated by the Admin.

#### Upload Profile Picture or Resume
- **Endpoint**: `POST /employees/:id/upload`
- **Headers**: `Authorization: Bearer <token>`
- **Fields**:
  - `file` (file upload)
  - `fileType` ('avatar' | 'resume')

---

### 3. Salary Info (`/api/employees/:employeeId/salary`)

#### Get Salary Details
- **Endpoint**: `GET /employees/:employeeId/salary`
- **Headers**: `Authorization: Bearer <token>` (Admin Only)

#### Update Salary & Auto-Recalculate Components
- **Endpoint**: `PUT /employees/:employeeId/salary`
- **Headers**: `Authorization: Bearer <token>` (Admin Only)
- **Body**:
  ```json
  {
    "wageAmount": 50000,
    "wagePeriod": "monthly",
    "workingDaysPerWeek": 5,
    "breakTime": 1.0,
    "pfEmployeePercent": 12,
    "pfEmployerPercent": 12,
    "professionalTax": 200
  }
  ```
- **Validation**: Ensures components sum does not exceed `wageAmount`. If valid, components recalculate automatically and store under JSON string in database.

---

### 4. Attendance Widget & Logs (`/api/attendance`)

#### Check In
- **Endpoint**: `POST /attendance/checkin`
- **Headers**: `Authorization: Bearer <token>`

#### Check Out
- **Endpoint**: `POST /attendance/checkout`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Computes net work hours and extra hours (overtime) after deducting break time from employee's salary settings.

#### My Logs (Monthly views & tiles)
- **Endpoint**: `GET /attendance/my-logs?year=2026&month=6`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "summary": {
      "presentCount": 5,
      "leavesCount": 1,
      "totalWorkingDays": 22
    },
    "logs": [ ... ]
  }
  ```

#### All Employee Logs (Admin Daily grid)
- **Endpoint**: `GET /attendance/all-logs?date=2026-07-04`
- **Headers**: `Authorization: Bearer <token>` (Admin Only)

---

### 5. Time Off (`/api/time-off`)

#### Time Off Request List
- **Endpoint**: `GET /time-off/requests`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Lists requests (Employee sees own only; Admin sees all requests in company).

#### Leave Allocation Summary Cards
- **Endpoint**: `GET /time-off/allocations?employeeId=<optional>`
- **Headers**: `Authorization: Bearer <token>`

#### Create Time Off Request
- **Endpoint**: `POST /time-off/requests`
- **Headers**: `Authorization: Bearer <token>`
- **Fields**:
  - `employeeId` (optional for Admins filing for others)
  - `type` ('paid' | 'sick' | 'unpaid')
  - `startDate` (ISO string/date)
  - `endDate` (ISO string/date)
  - `allocationDays` (number)
  - `attachment` (file upload, required if type is 'sick')

#### Approve or Reject Request
- **Endpoint**: `PUT /time-off/requests/:id/status`
- **Headers**: `Authorization: Bearer <token>` (Admin Only)
- **Body**:
  ```json
  {
    "status": "approved" // or "rejected"
  }
  ```
- **Side Effects**: If approved, deducts allocation days from database balances, and inserts 'leave' attendance logs for all weekdays in that range.
