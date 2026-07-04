-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Employee" (
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
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockoutUntil" DATETIME,
    CONSTRAINT "Employee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Employee" ("about", "accountNumber", "bankName", "certifications", "companyId", "dateOfBirth", "dateOfJoining", "department", "email", "empCode", "gender", "id", "ifscCode", "interestsAndHobbies", "jobPosition", "location", "loginId", "manager", "maritalStatus", "mobile", "mustChangePassword", "name", "nationality", "panNo", "passwordHash", "personalEmail", "profilePictureUrl", "residingAddress", "resumeUrl", "role", "skills", "uanNo", "whatILoveAboutMyJob") SELECT "about", "accountNumber", "bankName", "certifications", "companyId", "dateOfBirth", "dateOfJoining", "department", "email", "empCode", "gender", "id", "ifscCode", "interestsAndHobbies", "jobPosition", "location", "loginId", "manager", "maritalStatus", "mobile", "mustChangePassword", "name", "nationality", "panNo", "passwordHash", "personalEmail", "profilePictureUrl", "residingAddress", "resumeUrl", "role", "skills", "uanNo", "whatILoveAboutMyJob" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_loginId_key" ON "Employee"("loginId");
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
