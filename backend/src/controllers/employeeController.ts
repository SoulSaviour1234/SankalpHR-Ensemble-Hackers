import { Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/db';
import { generateLoginId } from '../utils/loginGenerator';
import { generateTemporaryPassword } from '../utils/passwordGenerator';
import { AuthenticatedRequest } from '../middleware/auth';

// 1. Create Employee (Admin Only)
export const createEmployee = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminCompanyId = req.user?.companyId;
    if (!adminCompanyId) {
      return res.status(400).json({ error: 'Admin company association not found.' });
    }

    const {
      name,
      email,
      personalEmail,
      mobile,
      jobPosition,
      department,
      manager,
      location,
      dateOfJoining,
      dateOfBirth,
      nationality,
      gender,
      maritalStatus,
      residingAddress,
      bankName,
      accountNumber,
      ifscCode,
      panNo,
      uanNo,
      empCode,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and Email are required.' });
    }

    // Check if email already exists
    const existingEmail = await prisma.employee.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return res.status(400).json({ error: 'Employee email already exists.' });
    }

    // Retrieve company name to generate Login ID
    const company = await prisma.company.findUnique({
      where: { id: adminCompanyId },
    });
    if (!company) {
      return res.status(404).json({ error: 'Company not found.' });
    }

    // Calculate Serial Number: Count of employees who joined in the same year in this company
    const joiningDate = dateOfJoining ? new Date(dateOfJoining) : new Date();
    const joiningYear = joiningDate.getFullYear();
    const startOfYear = new Date(joiningYear, 0, 1);
    const endOfYear = new Date(joiningYear, 11, 31, 23, 59, 59, 999);

    const yearJoinedCount = await prisma.employee.count({
      where: {
        companyId: adminCompanyId,
        dateOfJoining: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
    });

    const serialNumber = yearJoinedCount + 1;
    const loginId = generateLoginId(company.name, name, joiningDate, serialNumber);

    // Generate System Temporary Password
    const tempPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Create Employee
    const employee = await prisma.employee.create({
      data: {
        companyId: adminCompanyId,
        loginId,
        name,
        email,
        personalEmail: personalEmail || null,
        mobile: mobile || null,
        passwordHash,
        mustChangePassword: true, // Must change password on first login
        role: 'employee',
        jobPosition: jobPosition || null,
        department: department || null,
        manager: manager || null,
        location: location || null,
        dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        nationality: nationality || null,
        gender: gender || null,
        maritalStatus: maritalStatus || null,
        residingAddress: residingAddress || null,
        bankName: bankName || null,
        accountNumber: accountNumber || null,
        ifscCode: ifscCode || null,
        panNo: panNo || null,
        uanNo: uanNo || null,
        empCode: empCode || null,
        skills: '[]',
        certifications: '[]',
      },
    });

    // Create Default Salary Info
    await prisma.salaryInfo.create({
      data: {
        employeeId: employee.id,
        wageType: 'fixed',
        wageAmount: 30000.0, // Default base wage
        wagePeriod: 'monthly',
        workingDaysPerWeek: 5,
        breakTime: 1.0,
        components: '[]',
        pfEmployeePercent: 12.0,
        pfEmployerPercent: 12.0,
        professionalTax: 200.0,
      },
    });

    // Create default Time Off Allocations
    await prisma.timeOffAllocation.createMany({
      data: [
        { employeeId: employee.id, type: 'paid', totalDays: 24, usedDays: 0, remainingDays: 24 },
        { employeeId: employee.id, type: 'sick', totalDays: 7, usedDays: 0, remainingDays: 7 },
        { employeeId: employee.id, type: 'unpaid', totalDays: 0, usedDays: 0, remainingDays: 0 },
      ],
    });

    return res.status(201).json({
      message: 'Employee account created successfully.',
      employee: {
        id: employee.id,
        loginId: employee.loginId,
        name: employee.name,
        email: employee.email,
        role: employee.role,
      },
      tempPassword, // Return raw password so HR can share it with the employee
    });
  } catch (error: any) {
    console.error('Error creating employee:', error);
    return res.status(500).json({ error: error.message || 'Failed to create employee.' });
  }
};

// 2. Get Employees (All authenticated)
export const getEmployees = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company association not found.' });
    }

    const { search } = req.query;

    const selectFields: any = {
      id: true,
      loginId: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
      jobPosition: true,
      department: true,
      location: true,
      profilePictureUrl: true,
    };

    if (req.user?.role === 'admin') {
      selectFields.salaryInfo = true;
    }

    const employees = (await prisma.employee.findMany({
      where: {
        companyId,
        ...(search
          ? {
              OR: [
                { name: { contains: String(search) } },
                { email: { contains: String(search) } },
                { loginId: { contains: String(search) } },
                { jobPosition: { contains: String(search) } },
                { department: { contains: String(search) } },
              ],
            }
          : {}),
      },
      select: selectFields,
    })) as any[];

    // Calculate current day status indicator for each employee:
    // Green (present) = checked in today (checkIn is present, checkOut is null, or present today)
    // Airplane (on leave) = has an approved time-off request active today
    // Yellow (absent) = no check-in and no approved time-off request today
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const attendancesToday = await prisma.attendance.findMany({
      where: {
        employee: { companyId },
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    const activeLeavesToday = await prisma.timeOffRequest.findMany({
      where: {
        employee: { companyId },
        status: 'approved',
        startDate: { lte: todayEnd },
        endDate: { gte: todayStart },
      },
    });

    const employeesWithStatus = employees.map((emp) => {
      const empId = emp.id as string;
      const attendance = attendancesToday.find((att) => att.employeeId === empId);
      const leave = activeLeavesToday.find((l) => l.employeeId === empId);

      let status = 'absent'; // Default yellow
      if (leave) {
        status = 'leave'; // Airplane icon
      } else if (attendance) {
        if (attendance.checkIn && !attendance.checkOut) {
          status = 'present'; // Green dot (currently checked in)
        } else if (attendance.checkIn && attendance.checkOut) {
          status = 'present'; // Checked in and out (already completed shift today)
        }
      }

      return {
        ...emp,
        status,
      };
    });

    return res.status(200).json(employeesWithStatus);
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    return res.status(500).json({ error: 'Failed to fetch employee list.' });
  }
};

// 3. Get Employee By ID
export const getEmployeeById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;
    const currentUserRole = req.user?.role;
    const companyId = req.user?.companyId;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        company: true,
        salaryInfo: true,
      },
    });

    if (!employee || employee.companyId !== companyId) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    // Role-based logic:
    // If not Admin or Self, hide salary info and sensitive Private Info fields
    const isSelf = currentUserId === employee.id;
    const isAdmin = currentUserRole === 'admin';

    const safeEmployee: any = { ...employee };
    delete safeEmployee.passwordHash;

    if (!isAdmin) {
      // Hide Salary Info
      delete safeEmployee.salaryInfo;
    }

    // If it's another employee (not self and not admin), restrict private info fields too
    if (!isSelf && !isAdmin) {
      // Keep only public directory information
      const publicFields = [
        'id',
        'loginId',
        'name',
        'email',
        'mobile',
        'companyId',
        'company',
        'jobPosition',
        'department',
        'manager',
        'location',
        'dateOfJoining',
        'profilePictureUrl',
        'about',
        'skills',
        'certifications',
        'whatILoveAboutMyJob',
        'interestsAndHobbies',
      ];
      Object.keys(safeEmployee).forEach((key) => {
        if (!publicFields.includes(key)) {
          delete safeEmployee[key];
        }
      });
    }

    return res.status(200).json(safeEmployee);
  } catch (error: any) {
    console.error('Error fetching employee:', error);
    return res.status(500).json({ error: 'Failed to fetch employee details.' });
  }
};

// 4. Update Profile Info (Admin or Self)
export const updateProfileInfo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { about, skills, certifications, whatILoveAboutMyJob, interestsAndHobbies } = req.body;

    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    // Update
    const updated = await prisma.employee.update({
      where: { id },
      data: {
        about: about !== undefined ? about : employee.about,
        skills: skills !== undefined ? (typeof skills === 'string' ? skills : JSON.stringify(skills)) : employee.skills,
        certifications: certifications !== undefined ? (typeof certifications === 'string' ? certifications : JSON.stringify(certifications)) : employee.certifications,
        whatILoveAboutMyJob: whatILoveAboutMyJob !== undefined ? whatILoveAboutMyJob : employee.whatILoveAboutMyJob,
        interestsAndHobbies: interestsAndHobbies !== undefined ? interestsAndHobbies : employee.interestsAndHobbies,
      },
    });

    const safeEmployee: any = { ...updated };
    delete safeEmployee.passwordHash;

    return res.status(200).json({
      message: 'Profile updated successfully.',
      employee: safeEmployee,
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Failed to update profile information.' });
  }
};

// 5. Update Private Info (Admin or Self)
export const updatePrivateInfo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      personalEmail,
      mobile,
      dateOfBirth,
      nationality,
      gender,
      maritalStatus,
      residingAddress,
      bankName,
      accountNumber,
      ifscCode,
      panNo,
      uanNo,
      empCode,
      jobPosition,
      department,
      manager,
      location,
      dateOfJoining,
    } = req.body;

    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    // Only Admin can update employment details (job position, department, manager, location, date of joining, empCode)
    const isAdmin = req.user?.role === 'admin';
    const updateData: any = {
      personalEmail: personalEmail !== undefined ? personalEmail : employee.personalEmail,
      mobile: mobile !== undefined ? mobile : employee.mobile,
      dateOfBirth: dateOfBirth !== undefined ? (dateOfBirth ? new Date(dateOfBirth) : null) : employee.dateOfBirth,
      nationality: nationality !== undefined ? nationality : employee.nationality,
      gender: gender !== undefined ? gender : employee.gender,
      maritalStatus: maritalStatus !== undefined ? maritalStatus : employee.maritalStatus,
      residingAddress: residingAddress !== undefined ? residingAddress : employee.residingAddress,
      bankName: bankName !== undefined ? bankName : employee.bankName,
      accountNumber: accountNumber !== undefined ? accountNumber : employee.accountNumber,
      ifscCode: ifscCode !== undefined ? ifscCode : employee.ifscCode,
      panNo: panNo !== undefined ? panNo : employee.panNo,
      uanNo: uanNo !== undefined ? uanNo : employee.uanNo,
    };

    if (isAdmin) {
      updateData.empCode = empCode !== undefined ? empCode : employee.empCode;
      updateData.jobPosition = jobPosition !== undefined ? jobPosition : employee.jobPosition;
      updateData.department = department !== undefined ? department : employee.department;
      updateData.manager = manager !== undefined ? manager : employee.manager;
      updateData.location = location !== undefined ? location : employee.location;
      updateData.dateOfJoining = dateOfJoining !== undefined ? (dateOfJoining ? new Date(dateOfJoining) : null) : employee.dateOfJoining;
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    const safeEmployee: any = { ...updated };
    delete safeEmployee.passwordHash;

    return res.status(200).json({
      message: 'Private info updated successfully.',
      employee: safeEmployee,
    });
  } catch (error: any) {
    console.error('Error updating private info:', error);
    return res.status(500).json({ error: 'Failed to update private information.' });
  }
};

// 6. Upload Attachments (Profile Pic and Resume)
export const uploadAttachment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { fileType } = req.body; // 'avatar' | 'resume'
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    if (fileType === 'resume' && req.user?.id !== id) {
      return res.status(403).json({ error: 'Permission denied. Only the employee can upload or update their own resume.' });
    }

    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    const fileUrl = `/uploads/${file.filename}`;

    const updateData: any = {};
    if (fileType === 'avatar') {
      updateData.profilePictureUrl = fileUrl;
    } else if (fileType === 'resume') {
      updateData.resumeUrl = fileUrl;
    } else {
      return res.status(400).json({ error: 'Invalid file type specified.' });
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      message: 'File uploaded successfully.',
      fileUrl,
      employeeId: updated.id,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Failed to upload attachment.' });
  }
};
