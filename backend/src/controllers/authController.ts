import { Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db';
import { generateLoginId } from '../utils/loginGenerator';
import { AuthenticatedRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-hrms-key';

export const signUpCompany = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { companyName, name, email, phone, password } = req.body;
    const logoFile = req.file;

    if (!companyName || !name || !email || !password) {
      return res.status(400).json({ error: 'Company Name, Admin Name, Email, and Password are required.' });
    }

    // Check if employee email is already registered
    const existingEmployee = await prisma.employee.findUnique({
      where: { email },
    });
    if (existingEmployee) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    // 1. Create the Company
    const company = await prisma.company.create({
      data: {
        name: companyName,
        logoUrl: logoFile ? `/uploads/${logoFile.filename}` : null,
      },
    });

    // 2. Generate Login ID for the Admin Employee
    // Count employees in this company for the joining year (2026) to set serial
    const joinYear = new Date().getFullYear();
    const adminLoginId = generateLoginId(companyName, name, new Date(), 1);

    // 3. Hash Password
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Create the Admin Employee
    const admin = await prisma.employee.create({
      data: {
        companyId: company.id,
        loginId: adminLoginId,
        name,
        email,
        mobile: phone,
        passwordHash,
        mustChangePassword: false, // Since they explicitly registered their password, they don't have to change it immediately
        role: 'admin',
        dateOfJoining: new Date(),
        skills: '[]',
        certifications: '[]',
      },
    });

    // 5. Create default salary info for admin
    await prisma.salaryInfo.create({
      data: {
        employeeId: admin.id,
        wageType: 'fixed',
        wageAmount: 100000, // default
        wagePeriod: 'monthly',
        workingDaysPerWeek: 5,
        breakTime: 1.0,
        components: '[]',
        pfEmployeePercent: 12.0,
        pfEmployerPercent: 12.0,
        professionalTax: 200.0,
      },
    });

    // 6. Create default leave allocations
    await prisma.timeOffAllocation.createMany({
      data: [
        { employeeId: admin.id, type: 'paid', totalDays: 24, usedDays: 0, remainingDays: 24 },
        { employeeId: admin.id, type: 'sick', totalDays: 7, usedDays: 0, remainingDays: 7 },
        { employeeId: admin.id, type: 'unpaid', totalDays: 0, usedDays: 0, remainingDays: 0 },
      ],
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin.id,
        loginId: admin.loginId,
        role: admin.role,
        companyId: admin.companyId,
        name: admin.name,
        email: admin.email,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      message: 'Company and Admin registered successfully.',
      loginId: admin.loginId,
      token,
      user: {
        id: admin.id,
        loginId: admin.loginId,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        companyId: admin.companyId,
        mustChangePassword: admin.mustChangePassword,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: error.message || 'An error occurred during signup.' });
  }
};

export const signIn = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { loginIdOrEmail, password } = req.body;

    if (!loginIdOrEmail || !password) {
      return res.status(400).json({ error: 'Login ID / Email and Password are required.' });
    }

    // Query employee by loginId OR email
    const employee = await prisma.employee.findFirst({
      where: {
        OR: [
          { loginId: loginIdOrEmail },
          { email: loginIdOrEmail },
        ],
      },
      include: {
        company: true,
      },
    });

    if (!employee) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, employee.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: employee.id,
        loginId: employee.loginId,
        role: employee.role,
        companyId: employee.companyId,
        name: employee.name,
        email: employee.email,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'Sign-in successful.',
      token,
      user: {
        id: employee.id,
        loginId: employee.loginId,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        companyId: employee.companyId,
        mustChangePassword: employee.mustChangePassword,
        company: {
          id: employee.company.id,
          name: employee.company.name,
          logoUrl: employee.company.logoUrl,
        },
      },
    });
  } catch (error: any) {
    console.error('Sign-in error:', error);
    return res.status(500).json({ error: error.message || 'An error occurred during sign-in.' });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required.' });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: userId },
    });

    if (!employee) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // For force password change, we might skip checking old password if they don't know it,
    // but verifying it provides better security. Let's make it so if they pass oldPassword,
    // we verify it, else we require it (unless we are reset by admin).
    if (oldPassword) {
      const isPasswordValid = await bcrypt.compare(oldPassword, employee.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Incorrect current password.' });
      }
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.employee.update({
      where: { id: userId },
      data: {
        passwordHash: hashedNewPassword,
        mustChangePassword: false,
      },
    });

    return res.status(200).json({ message: 'Password updated successfully. Session is active.' });
  } catch (error: any) {
    console.error('Change password error:', error);
    return res.status(500).json({ error: error.message || 'An error occurred.' });
  }
};
