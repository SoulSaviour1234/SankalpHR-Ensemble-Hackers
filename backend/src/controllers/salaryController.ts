import { Response } from 'express';
import prisma from '../utils/db';
import { calculateSalaryComponents } from '../utils/salaryCalculator';
import { AuthenticatedRequest } from '../middleware/auth';

// 1. Get Salary Info (Admin only)
export const getSalaryInfo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = req.params.id || req.params.employeeId;
    const companyId = req.user?.companyId;

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { companyId: true },
    });

    if (!employee || employee.companyId !== companyId) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    const salaryInfo = await prisma.salaryInfo.findUnique({
      where: { employeeId },
    });

    if (!salaryInfo) {
      return res.status(404).json({ error: 'Salary details not found for this employee.' });
    }

    // Parse components for JSON response
    const parsedSalaryInfo = {
      ...salaryInfo,
      components: JSON.parse(salaryInfo.components),
    };

    return res.status(200).json(parsedSalaryInfo);
  } catch (error: any) {
    console.error('Error getting salary info:', error);
    return res.status(500).json({ error: 'Failed to fetch salary information.' });
  }
};

// 2. Update Salary Info (Admin only)
export const updateSalaryInfo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = req.params.id || req.params.employeeId;
    const companyId = req.user?.companyId;
    const {
      wageAmount,
      wagePeriod, // 'monthly' | 'yearly'
      workingDaysPerWeek,
      breakTime,
      pfEmployeePercent,
      pfEmployerPercent,
      professionalTax,
      performanceBonusPercent, // optional variable company-defined %
    } = req.body;

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { companyId: true },
    });

    if (!employee || employee.companyId !== companyId) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    if (wageAmount === undefined || !wagePeriod) {
      return res.status(400).json({ error: 'Wage Amount and Wage Period are required.' });
    }

    // 1. Recalculate components
    const calculation = calculateSalaryComponents(
      wageAmount,
      wagePeriod,
      performanceBonusPercent !== undefined ? parseFloat(performanceBonusPercent) : 8.33
    );

    if (!calculation.isValid) {
      return res.status(400).json({ error: calculation.error });
    }

    // 2. Update or Create SalaryInfo
    const updatedSalaryInfo = await prisma.salaryInfo.upsert({
      where: { employeeId },
      update: {
        wageAmount: parseFloat(wageAmount),
        wagePeriod,
        workingDaysPerWeek: workingDaysPerWeek ? parseInt(workingDaysPerWeek) : 5,
        breakTime: breakTime ? parseFloat(breakTime) : 1.0,
        components: JSON.stringify(calculation.components),
        pfEmployeePercent: pfEmployeePercent ? parseFloat(pfEmployeePercent) : 12.0,
        pfEmployerPercent: pfEmployerPercent ? parseFloat(pfEmployerPercent) : 12.0,
        professionalTax: professionalTax ? parseFloat(professionalTax) : 200.0,
      },
      create: {
        employeeId,
        wageAmount: parseFloat(wageAmount),
        wagePeriod,
        workingDaysPerWeek: workingDaysPerWeek ? parseInt(workingDaysPerWeek) : 5,
        breakTime: breakTime ? parseFloat(breakTime) : 1.0,
        components: JSON.stringify(calculation.components),
        pfEmployeePercent: pfEmployeePercent ? parseFloat(pfEmployeePercent) : 12.0,
        pfEmployerPercent: pfEmployerPercent ? parseFloat(pfEmployerPercent) : 12.0,
        professionalTax: professionalTax ? parseFloat(professionalTax) : 200.0,
      },
    });

    const responseData = {
      ...updatedSalaryInfo,
      components: calculation.components,
    };

    return res.status(200).json({
      message: 'Salary details updated and components auto-recalculated successfully.',
      salaryInfo: responseData,
    });
  } catch (error: any) {
    console.error('Error updating salary info:', error);
    return res.status(500).json({ error: error.message || 'Failed to update salary details.' });
  }
};

// 3. Get Monthly Payroll Summary (Admin only)
export const getPayrollSummary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company association not found.' });
    }

    const now = new Date();
    const year = req.query.year ? parseInt(String(req.query.year)) : now.getFullYear();
    const month = req.query.month ? parseInt(String(req.query.month)) : now.getMonth(); // 0-indexed

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    // Get working days in the month (weekdays)
    const workingDays: Date[] = [];
    const tempDate = new Date(startOfMonth);
    while (tempDate <= endOfMonth) {
      const dayOfWeek = tempDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays.push(new Date(tempDate));
      }
      tempDate.setDate(tempDate.getDate() + 1);
    }
    const totalWorkingDays = workingDays.length;

    // Get all employees in the company
    const employees = await prisma.employee.findMany({
      where: { companyId },
      include: {
        salaryInfo: true,
      },
    });

    const summaryList = [];

    for (const emp of employees) {
      const salaryInfo = emp.salaryInfo;
      const wageAmount = salaryInfo?.wageAmount || 0;
      const wagePeriod = salaryInfo?.wagePeriod || 'monthly';
      const monthlyWage = wagePeriod === 'yearly' ? wageAmount / 12 : wageAmount;

      // Get approved requests for this employee in this month
      const approvedRequests = await prisma.timeOffRequest.findMany({
        where: {
          employeeId: emp.id,
          status: 'approved',
          startDate: { lte: endOfMonth },
          endDate: { gte: startOfMonth },
        },
      });

      // Get attendance logs
      const attendanceLogs = await prisma.attendance.findMany({
        where: {
          employeeId: emp.id,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
      });

      let presentDays = 0;
      let paidLeaveDays = 0;
      let unpaidLeaveDays = 0;
      let absentDays = 0;

      for (const day of workingDays) {
        // Check requests
        const requestCovering = approvedRequests.find((req) => {
          const start = new Date(req.startDate);
          const end = new Date(req.endDate);
          const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
          const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
          const d = new Date(day.getFullYear(), day.getMonth(), day.getDate());
          return d >= s && d <= e;
        });

        if (requestCovering) {
          if (requestCovering.type === 'unpaid') {
            unpaidLeaveDays++;
          } else {
            paidLeaveDays++;
          }
        } else {
          // Check attendance
          const log = attendanceLogs.find((l) => {
            const ld = new Date(l.date);
            return (
              ld.getFullYear() === day.getFullYear() &&
              ld.getMonth() === day.getMonth() &&
              ld.getDate() === day.getDate()
            );
          });

          if (log && log.status === 'present') {
            presentDays++;
          } else {
            absentDays++;
          }
        }
      }

      const payableDays = presentDays + paidLeaveDays;
      const proratedSalary = totalWorkingDays > 0 ? (monthlyWage / totalWorkingDays) * payableDays : 0;

      // Extract PF and PT
      const components = salaryInfo?.components ? JSON.parse(salaryInfo.components) : [];
      const basicComponent = components.find((c: any) => c.name.includes('Basic'));
      const basicAmount = basicComponent ? basicComponent.computedAmount : 0;
      
      const pfPercent = salaryInfo?.pfEmployeePercent || 12.0;
      const pfDeduction = basicAmount * (pfPercent / 100);
      const ptTax = salaryInfo?.professionalTax || 200.0;

      const totalDeductions = pfDeduction + ptTax;
      const netPayout = Math.max(0, proratedSalary - totalDeductions);

      summaryList.push({
        employeeId: emp.id,
        name: emp.name,
        empCode: emp.empCode || emp.loginId,
        jobPosition: emp.jobPosition || 'N/A',
        department: emp.department || 'N/A',
        profilePictureUrl: emp.profilePictureUrl,
        monthlyWage,
        totalWorkingDays,
        presentDays,
        paidLeaveDays,
        unpaidLeaveDays,
        absentDays,
        payableDays,
        grossSalary: parseFloat(proratedSalary.toFixed(2)),
        pfDeduction: parseFloat(pfDeduction.toFixed(2)),
        ptTax,
        totalDeductions: parseFloat(totalDeductions.toFixed(2)),
        netPayout: parseFloat(netPayout.toFixed(2)),
      });
    }

    return res.status(200).json({
      year,
      month,
      totalWorkingDays,
      summary: summaryList,
    });
  } catch (error: any) {
    console.error('Error getting payroll summary:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch payroll summary.' });
  }
};

