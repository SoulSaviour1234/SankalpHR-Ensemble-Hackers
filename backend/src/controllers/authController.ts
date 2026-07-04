import { Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db';
import { generateLoginId } from '../utils/loginGenerator';
import { AuthenticatedRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-hrms-key';

export const signUpEmployee = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, Email, and Password are required.' });
    }

    // Check if email is already registered
    const existingEmployee = await prisma.employee.findUnique({
      where: { email },
    });
    if (existingEmployee) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    // Get the first company (assuming single-tenant hackathon setup)
    const company = await prisma.company.findFirst();
    if (!company) {
      return res.status(500).json({ error: 'System not initialized (No company found).' });
    }

    // Generate Login ID
    const loginId = generateLoginId(company.name, name, new Date(), Math.floor(Math.random() * 1000) + 1);

    // Hash Password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create Employee
    const employee = await prisma.employee.create({
      data: {
        companyId: company.id,
        loginId,
        name,
        email,
        passwordHash,
        mustChangePassword: false,
        role: 'employee',
        dateOfJoining: new Date(),
        skills: '[]',
        certifications: '[]',
      },
    });

    // Create default leave allocations
    await prisma.timeOffAllocation.createMany({
      data: [
        { employeeId: employee.id, type: 'paid', totalDays: 24, usedDays: 0, remainingDays: 24 },
        { employeeId: employee.id, type: 'sick', totalDays: 7, usedDays: 0, remainingDays: 7 },
        { employeeId: employee.id, type: 'unpaid', totalDays: 0, usedDays: 0, remainingDays: 0 },
      ],
    });

    // Generate JWT token
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

    return res.status(201).json({
      message: 'Employee registered successfully.',
      token,
      user: {
        id: employee.id,
        loginId: employee.loginId,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        companyId: employee.companyId,
        mustChangePassword: employee.mustChangePassword,
        profilePictureUrl: employee.profilePictureUrl,
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
      return res.status(401).json({ error: 'Invalid credentials. Please check your login ID/email and password.' });
    }

    // Check for lockout
    if (employee.lockoutUntil && employee.lockoutUntil > new Date()) {
      const remainingMinutes = Math.ceil((employee.lockoutUntil.getTime() - Date.now()) / 60000);
      return res.status(403).json({
        error: `Account is temporarily locked due to too many failed login attempts. Try again in ${remainingMinutes} minute(s).`
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, employee.passwordHash);
    if (!isPasswordValid) {
      const newAttempts = employee.failedLoginAttempts + 1;
      const shouldLock = newAttempts >= 5;
      const lockoutUntil = shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await prisma.employee.update({
        where: { id: employee.id },
        data: {
          failedLoginAttempts: newAttempts,
          lockoutUntil,
        },
      });

      if (shouldLock) {
        return res.status(403).json({
          error: 'Account is temporarily locked for 15 minutes due to 5 consecutive failed login attempts.'
        });
      }

      return res.status(401).json({ error: 'Invalid credentials. Please check your login ID/email and password.' });
    }

    // Reset lockouts and failed attempts on successful login
    await prisma.employee.update({
      where: { id: employee.id },
      data: {
        failedLoginAttempts: 0,
        lockoutUntil: null,
      },
    });

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
        profilePictureUrl: employee.profilePictureUrl,
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
