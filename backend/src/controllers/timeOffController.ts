import { Response } from 'express';
import prisma from '../utils/db';
import { AuthenticatedRequest } from '../middleware/auth';

// 1. Get Time Off Requests
export const getTimeOffRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const companyId = req.user?.companyId;

    if (role === 'admin') {
      // Admin sees all employee requests in their company
      const requests = await prisma.timeOffRequest.findMany({
        where: {
          employee: { companyId },
        },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              loginId: true,
              jobPosition: true,
              department: true,
            },
          },
        },
        orderBy: {
          startDate: 'desc',
        },
      });
      return res.status(200).json(requests);
    } else {
      // Employee sees only their own requests
      const requests = await prisma.timeOffRequest.findMany({
        where: {
          employeeId: userId,
        },
        orderBy: {
          startDate: 'desc',
        },
      });
      return res.status(200).json(requests);
    }
  } catch (error: any) {
    console.error('Get time off requests error:', error);
    return res.status(500).json({ error: 'Failed to fetch time-off requests.' });
  }
};

// 2. Get Allocations
export const getTimeOffAllocations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const companyId = req.user?.companyId;
    
    // Admin can query a specific employee ID, otherwise default to self
    let targetEmployeeId = userId;
    if (role === 'admin' && req.query.employeeId) {
      targetEmployeeId = String(req.query.employeeId);
    }

    // Verify employee belongs to company
    const employee = await prisma.employee.findUnique({
      where: { id: targetEmployeeId },
    });

    if (!employee || employee.companyId !== companyId) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    const allocations = await prisma.timeOffAllocation.findMany({
      where: { employeeId: targetEmployeeId },
    });

    return res.status(200).json(allocations);
  } catch (error: any) {
    console.error('Get allocations error:', error);
    return res.status(500).json({ error: 'Failed to fetch allocations.' });
  }
};

// 3. Create Time Off Request
export const createTimeOffRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const role = req.user?.role;
    const companyId = req.user?.companyId;
    
    let { employeeId, type, startDate, endDate, allocationDays } = req.body;
    const file = req.file;

    // Default to self for employees
    if (role !== 'admin' || !employeeId) {
      employeeId = req.user?.id;
    }

    if (!type || !startDate || !endDate || !allocationDays) {
      return res.status(400).json({ error: 'Type, Start Date, End Date, and Allocation Days are required.' });
    }

    // Check employee validity
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee || employee.companyId !== companyId) {
      return res.status(404).json({ error: 'Employee not found or unauthorized.' });
    }

    const parsedDays = parseFloat(allocationDays);
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validation: Sick leave attachment check
    if (type === 'sick' && !file) {
      return res.status(400).json({ error: 'Sick leave requests require an attachment certificate.' });
    }

    // Validation: Check allocation limit (except unpaid)
    if (type !== 'unpaid') {
      const allocation = await prisma.timeOffAllocation.findFirst({
        where: { employeeId, type },
      });

      if (!allocation || allocation.remainingDays < parsedDays) {
        return res.status(400).json({
          error: `Insufficient leave balance. You have ${allocation ? allocation.remainingDays : 0} days remaining for ${type} leave. Requested: ${parsedDays} days.`,
        });
      }
    }

    const attachmentUrl = file ? `/uploads/${file.filename}` : null;

    const request = await prisma.timeOffRequest.create({
      data: {
        employeeId,
        type,
        startDate: start,
        endDate: end,
        allocationDays: parsedDays,
        attachmentUrl,
        status: 'pending',
      },
    });

    return res.status(201).json({
      message: 'Time-off request submitted successfully.',
      request,
    });
  } catch (error: any) {
    console.error('Create time off request error:', error);
    return res.status(500).json({ error: error.message || 'Failed to submit time-off request.' });
  }
};

// 4. Approve/Reject Request (Admin only)
export const approveOrRejectRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' | 'rejected'
    const companyId = req.user?.companyId;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status is required and must be "approved" or "rejected".' });
    }

    const request = await prisma.timeOffRequest.findUnique({
      where: { id },
      include: {
        employee: true,
      },
    });

    if (!request || request.employee.companyId !== companyId) {
      return res.status(404).json({ error: 'Time-off request not found.' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: `Request has already been ${request.status}.` });
    }

    if (status === 'rejected') {
      const updated = await prisma.timeOffRequest.update({
        where: { id },
        data: { status: 'rejected' },
      });
      return res.status(200).json({ message: 'Request rejected successfully.', request: updated });
    }

    // IF APPROVED:
    // 1. Deduct leave balance if not unpaid
    if (request.type !== 'unpaid') {
      const allocation = await prisma.timeOffAllocation.findFirst({
        where: { employeeId: request.employeeId, type: request.type },
      });

      if (!allocation || allocation.remainingDays < request.allocationDays) {
        return res.status(400).json({ error: 'Cannot approve request. Insufficient leave balance remaining.' });
      }

      const updatedUsed = allocation.usedDays + request.allocationDays;
      const updatedRemaining = allocation.remainingDays - request.allocationDays;

      await prisma.timeOffAllocation.update({
        where: { id: allocation.id },
        data: {
          usedDays: updatedUsed,
          remainingDays: updatedRemaining,
        },
      });
    }

    // Update request status
    const updatedRequest = await prisma.timeOffRequest.update({
      where: { id },
      data: { status: 'approved' },
    });

    // 2. Mark days as 'leave' in Attendance table
    // Loop through dates from startDate to endDate
    const start = new Date(request.startDate);
    const end = new Date(request.endDate);
    
    // Set to midnight for date comparisons/keys
    const loopDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const stopDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    const attendanceUpdates = [];
    while (loopDate <= stopDate) {
      // Check if it's a weekday
      const day = loopDate.getDay();
      if (day !== 0 && day !== 6) { // Monday-Friday
        const dateKey = new Date(loopDate);
        
        // Find existing attendance for that day
        const existingAttendance = await prisma.attendance.findFirst({
          where: {
            employeeId: request.employeeId,
            date: dateKey,
          },
        });

        if (existingAttendance) {
          // Update status to leave, clear checkin/out
          attendanceUpdates.push(
            prisma.attendance.update({
              where: { id: existingAttendance.id },
              data: {
                status: 'leave',
                checkIn: null,
                checkOut: null,
                workHours: 0.0,
                extraHours: 0.0,
              },
            })
          );
        } else {
          // Create new leave record
          attendanceUpdates.push(
            prisma.attendance.create({
              data: {
                employeeId: request.employeeId,
                date: dateKey,
                status: 'leave',
                workHours: 0.0,
                extraHours: 0.0,
              },
            })
          );
        }
      }
      loopDate.setDate(loopDate.getDate() + 1);
    }

    if (attendanceUpdates.length > 0) {
      await prisma.$transaction(attendanceUpdates);
    }

    return res.status(200).json({
      message: 'Request approved successfully, balances updated, and leave attendance logged.',
      request: updatedRequest,
    });
  } catch (error: any) {
    console.error('Approve/reject time off error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update request.' });
  }
};
