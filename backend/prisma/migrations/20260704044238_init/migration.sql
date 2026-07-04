-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "loginId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "personalEmail" TEXT,
    "mobile" TEXT,
    "passwordHash" TEXT NOT NULL,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "role" TEXT NOT NULL DEFAULT 'employee',
    "jobPosition" TEXT,
    "department" TEXT,
    "manager" TEXT,
    "location" TEXT,
    "dateOfJoining" DATETIME,
    "dateOfBirth" DATETIME,
    "nationality" TEXT,
    "gender" TEXT,
    "maritalStatus" TEXT,
    "residingAddress" TEXT,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "ifscCode" TEXT,
    "panNo" TEXT,
    "uanNo" TEXT,
    "empCode" TEXT,
    "profilePictureUrl" TEXT,
    "resumeUrl" TEXT,
    "about" TEXT,
    "skills" TEXT NOT NULL DEFAULT '[]',
    "certifications" TEXT NOT NULL DEFAULT '[]',
    "whatILoveAboutMyJob" TEXT,
    "interestsAndHobbies" TEXT,
    CONSTRAINT "Employee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SalaryInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "wageType" TEXT NOT NULL DEFAULT 'fixed',
    "wageAmount" REAL NOT NULL,
    "wagePeriod" TEXT NOT NULL DEFAULT 'monthly',
    "workingDaysPerWeek" INTEGER NOT NULL DEFAULT 5,
    "breakTime" REAL NOT NULL DEFAULT 1.0,
    "components" TEXT NOT NULL DEFAULT '[]',
    "pfEmployeePercent" REAL NOT NULL DEFAULT 12.0,
    "pfEmployerPercent" REAL NOT NULL DEFAULT 12.0,
    "professionalTax" REAL NOT NULL DEFAULT 200.0,
    CONSTRAINT "SalaryInfo_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "checkIn" DATETIME,
    "checkOut" DATETIME,
    "workHours" REAL NOT NULL DEFAULT 0.0,
    "extraHours" REAL NOT NULL DEFAULT 0.0,
    "status" TEXT NOT NULL DEFAULT 'absent',
    CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TimeOffRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "allocationDays" REAL NOT NULL,
    "attachmentUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT "TimeOffRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TimeOffAllocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "totalDays" REAL NOT NULL,
    "usedDays" REAL NOT NULL DEFAULT 0.0,
    "remainingDays" REAL NOT NULL,
    CONSTRAINT "TimeOffAllocation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_loginId_key" ON "Employee"("loginId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryInfo_employeeId_key" ON "SalaryInfo"("employeeId");
