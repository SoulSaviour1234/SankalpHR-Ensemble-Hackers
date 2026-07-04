import { Response } from 'express';
import prisma from '../utils/db';
import { calculateSalaryComponents } from '../utils/salaryCalculator';
import { AuthenticatedRequest } from '../middleware/auth';

// 1. Get Salary Info (Admin only)
export const getSalaryInfo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { employeeId } = req.params;
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
    const { employeeId } = req.params;
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
