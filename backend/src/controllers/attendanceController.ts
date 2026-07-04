import { Response } from 'express';
import prisma from '../utils/db';
import { AuthenticatedRequest } from '../middleware/auth';

// Helper to get start and end of a specific date
const getDateRange = (dateStr?: string) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  return { date: start, start, end };
};

// 1. Check In (Employee / Admin Self)
export const checkIn = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = req.user?.id;
    if (!employeeId) {
      return res.status(400).json({ error: 'User details not found.' });
    }

    const { start, end, date } = getDateRange();

    // Check if check-in already exists for today
    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    if (existing && existing.checkIn) {
      return res.status(400).json({ error: 'You are already checked in for today.' });
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        id: existing?.id || 'temp-id',
      },
      update: {
        checkIn: new Date(),
        status: 'present',
      },
      create: {
        employeeId,
        date,
        checkIn: new Date(),
        status: 'present',
      },
    });

    return res.status(200).json({
      message: 'Checked in successfully. Status: Present.',
      attendance,
    });
  } catch (error: any) {
    console.error('Check-in error:', error);
    return res.status(500).json({ error: 'Failed to record check-in.' });
  }
};

// 2. Check Out (Employee / Admin Self)
export const checkOut = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = req.user?.id;
    if (!employeeId) {
      return res.status(400).json({ error: 'User details not found.' });
    }

    const { start, end } = getDateRange();

    // Find today's check-in
    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ error: 'You have not checked in today yet.' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ error: 'You have already checked out today.' });
    }

    const checkOutTime = new Date();
    const checkInTime = new Date(attendance.checkIn);

    // Retrieve salary info to check the breakTime
    const salaryInfo = await prisma.salaryInfo.findUnique({
      where: { employeeId },
    });
    const breakHours = salaryInfo?.breakTime || 1.0; // default 1 hour break

    // Calculate total hours
    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    const totalHours = diffMs / (1000 * 60 * 60);

    // Net work hours = total hours minus break, but never less than 0
    let workHours = Math.max(0, totalHours - breakHours);

    // Calculate Extra Hours (overtime if workHours exceeds 8 hours)
    let extraHours = 0.0;
    if (workHours > 8.0) {
      extraHours = workHours - 8.0;
      workHours = 8.0; // cap regular work hours at 8
    }

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: checkOutTime,
        workHours: parseFloat(workHours.toFixed(2)),
        extraHours: parseFloat(extraHours.toFixed(2)),
      },
    });

    return res.status(200).json({
      message: 'Checked out successfully.',
      attendance: updated,
    });
  } catch (error: any) {
    console.error('Check-out error:', error);
    return res.status(500).json({ error: 'Failed to record check-out.' });
  }
};

// 3. Get Own Attendance logs (Self)
export const getOwnAttendance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = req.user?.id;
    if (!employeeId) {
      return res.status(400).json({ error: 'User details not found.' });
    }

    const now = new Date();
    const year = req.query.year ? parseInt(String(req.query.year)) : now.getFullYear();
    const month = req.query.month ? parseInt(String(req.query.month)) : now.getMonth(); // 0-indexed

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const logs = await prisma.attendance.findMany({
      where: {
        employeeId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Compute stats
    const presentDays = logs.filter((log) => log.status === 'present').length;
    const leaveDays = logs.filter((log) => log.status === 'leave').length;

    // Calculate total weekdays in this month so far
    let totalWorkingDays = 0;
    const tempDate = new Date(startOfMonth);
    const lastDayToCount = now.getMonth() === month && now.getFullYear() === year ? now : endOfMonth;

    while (tempDate <= lastDayToCount) {
      const day = tempDate.getDay();
      if (day !== 0 && day !== 6) {
        totalWorkingDays++;
      }
      tempDate.setDate(tempDate.getDate() + 1);
    }

    return res.status(200).json({
      summary: {
        presentCount: presentDays,
        leavesCount: leaveDays,
        totalWorkingDays,
      },
      logs,
    });
  } catch (error: any) {
    console.error('Get own attendance error:', error);
    return res.status(500).json({ error: 'Failed to fetch attendance logs.' });
  }
};

// 4. Get All Attendance logs (Admin only)
export const getAllAttendance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { date } = req.query; // format 'YYYY-MM-DD'

    const { start, end } = getDateRange(date ? String(date) : undefined);

    const logs = await prisma.attendance.findMany({
      where: {
        employee: { companyId },
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            loginId: true,
            jobPosition: true,
            department: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    return res.status(200).json({
      date: start.toISOString().split('T')[0],
      logs,
    });
  } catch (error: any) {
    console.error('Get all attendance error:', error);
    return res.status(500).json({ error: 'Failed to fetch all attendance logs.' });
  }
};
