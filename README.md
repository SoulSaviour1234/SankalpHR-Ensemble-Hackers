# SankalpHR - Human Resource Management System

Welcome to the HRMS project! This is a full-stack web application designed for a hackathon. The backend is built with Node.js/Express and Prisma ORM (SQLite database), and the frontend is built with React/Vite.

---

## 🚀 Getting Started

Follow these simple steps to run the application locally on your machine after cloning.

### 1. Backend Setup

Open a terminal and navigate to the `backend` directory:

1. **Install dependencies:**
   ```bash
   pnpm install
   # or: npm install
   ```

2. **Setup environment variables:**
   Copy the example environment file to create your own local `.env` file:
   ```bash
   copy .env.example .env
   ```

3. **Optional: Reset / Reseed the Database:**
   The SQLite database (`dev.db`) is already checked into the repository with pre-seeded data, so **you can skip this step**! If you ever want to reset it back to default seed state:
   ```bash
   pnpm db:setup
   # or: npm run db:setup
   ```

4. **Start the Backend server:**
   ```bash
   pnpm dev
   # or: npm run dev
   ```
   The backend server will run at: `http://localhost:5000`

---

### 2. Frontend Setup

Open a new terminal window and navigate to the `frontend` directory:

1. **Install dependencies:**
   ```bash
   pnpm install
   # or: npm install
   ```

2. **Start the Frontend development server:**
   ```bash
   pnpm dev
   # or: npm run dev
   ```
   The frontend application will start running at: `http://localhost:5173` (or the port specified in your console).

---

## 🔑 Seeding / Login Credentials

The database comes seeded with mock users for testing out the roles:

### 1. Admin Portal
- **Email:** `admin@company.com`
- **Password:** `AdminPass123` *(defined in backend/.env)*

### 2. Employee Portal (John Doe)
- **Login ID:** `OIJODO20220001` (or `john.doe@company.com`)
- **Password:** `EmployeePass123`

### 3. Employee Portal (Jane Smith)
- **Login ID:** `OIJASM20230001` (or `jane.smith@company.com`)
- **Password:** `EmployeePass123`

---

## 🔒 Security Features
- **Brute-force protection:** Accounts get locked out for 15 minutes after 5 consecutive failed login attempts.
- **Obscured Errors:** Prevents username/email enumeration.
- **Secrets Management:** Local configuration secrets (`.env` files) are securely ignored via `.gitignore` and won't be pushed. The SQLite database (`dev.db`) is tracked in the repository so collaborators don't need to rebuild it manually.
