import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { generateLoginId } from '../src/utils/loginGenerator';
import { calculateSalaryComponents } from '../src/utils/salaryCalculator';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.timeOffRequest.deleteMany({});
  await prisma.timeOffAllocation.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.salaryInfo.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.company.deleteMany({});

  // 1. Create Company
  const company = await prisma.company.create({
    data: {
      name: 'Odoo India',
      logoUrl: '/logo.svg', // static logo path
    },
  });
  console.log(`Created company: ${company.name}`);

  // Read admin credentials from .env
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@company.com';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminPass123';

  // Hash passwords
  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const employeePasswordHash = await bcrypt.hash('EmployeePass123', 10);

  // 2. Create Admin Employee
  const adminLoginId = generateLoginId(company.name, 'HR Admin', new Date('2026-01-01'), 1);
  const admin = await prisma.employee.create({
    data: {
      companyId: company.id,
      loginId: adminLoginId,
      name: 'HR Admin',
      email: ADMIN_EMAIL,
      personalEmail: 'admin.personal@gmail.com',
      mobile: '+919999999999',
      passwordHash: adminPasswordHash,
      mustChangePassword: false, // Seeded users can log in directly
      role: 'admin',
      jobPosition: 'HR Director',
      department: 'Human Resources',
      location: 'Mumbai Office',
      dateOfJoining: new Date('2026-01-01'),
      dateOfBirth: new Date('1985-05-15'),
      nationality: 'Indian',
      gender: 'Male',
      maritalStatus: 'Married',
      residingAddress: 'Flat 402, Sea Breeze, Bandra, Mumbai',
      skills: JSON.stringify(['Talent Acquisition', 'Payroll', 'Employee Relations']),
      certifications: JSON.stringify(['SHRM-CP', 'HRCI-PHR']),
      about: 'Experienced HR Professional heading operations in Odoo India.',
    },
  });
  console.log(`Created admin: ${admin.name} (Login ID: ${admin.loginId})`);

  // Admin Salary Info (just standard yearly/monthly info)
  const adminSalaryComponents = calculateSalaryComponents(150000, 'monthly');
  await prisma.salaryInfo.create({
    data: {
      employeeId: admin.id,
      wageType: 'fixed',
      wageAmount: 150000,
      wagePeriod: 'monthly',
      workingDaysPerWeek: 5,
      breakTime: 1.0,
      components: JSON.stringify(adminSalaryComponents.components),
      pfEmployeePercent: 12.0,
      pfEmployerPercent: 12.0,
      professionalTax: 200.0,
    },
  });

  // Admin allocations
  await prisma.timeOffAllocation.createMany({
    data: [
      { employeeId: admin.id, type: 'paid', totalDays: 24, usedDays: 0, remainingDays: 24 },
      { employeeId: admin.id, type: 'sick', totalDays: 7, usedDays: 0, remainingDays: 7 },
      { employeeId: admin.id, type: 'unpaid', totalDays: 0, usedDays: 0, remainingDays: 0 },
    ],
  });

  // 3. Create Employee 1: John Doe (Matches the section 4.4 worked example exactly)
  // Join Year 2022. Serial 1 for that year. Name: John Doe
  const johnLoginId = 'OIJODO20220001'; // Force match the spec example format
  const john = await prisma.employee.create({
    data: {
      companyId: company.id,
      loginId: johnLoginId,
      name: 'John Doe',
      email: 'john.doe@company.com',
      personalEmail: 'john.doe.personal@gmail.com',
      mobile: '+919876543210',
      passwordHash: employeePasswordHash,
      mustChangePassword: true, // Must change on first use
      role: 'employee',
      jobPosition: 'Software Engineer',
      department: 'Engineering',
      manager: 'HR Admin',
      location: 'Pune Office',
      dateOfJoining: new Date('2022-06-15'),
      dateOfBirth: new Date('1996-08-24'),
      nationality: 'Indian',
      gender: 'Male',
      maritalStatus: 'Single',
      residingAddress: '12-A, Green Meadows Apartments, Hinjewadi, Pune',
      bankName: 'HDFC Bank',
      accountNumber: '50100456123987',
      ifscCode: 'HDFC0000104',
      panNo: 'ABCDE1234F',
      uanNo: '100123456789',
      empCode: 'EMP2022001',
      skills: JSON.stringify(['React', 'TypeScript', 'Node.js', 'PostgreSQL']),
      certifications: JSON.stringify(['AWS Certified Cloud Practitioner', 'Oracle Java SE 11 Programmer']),
      about: 'Passionate full stack developer loving to build clean enterprise software systems.',
      whatILoveAboutMyJob: 'The freedom to design robust system architecture and working with modern web tech.',
      interestsAndHobbies: 'Playing guitar, hiking on weekends, and solving competitive programming puzzles.',
    },
  });
  console.log(`Created employee: ${john.name} (Login ID: ${john.loginId})`);

  // John Doe Salary Info: Wage = 50,000/month
  // Basic: 25,000, HRA: 12,500, Standard: 4,167, PF: 3,000 (12%), ProTax: 200.
  // Performance Bonus (8.33% of Basic = 2082.50)
  // LTA (8.333% of Basic = 2083.25)
  // Fixed Allowance = 50000 - (25000 + 12500 + 4167 + 2082.50 + 2083.25) = 4167.25
  const johnComponents = [
    { name: 'Basic Salary', computationType: 'percent', value: 50.0, computedAmount: 25000.0 },
    { name: 'House Rent Allowance (HRA)', computationType: 'percent', value: 50.0, computedAmount: 12500.0 },
    { name: 'Standard Allowance', computationType: 'fixed', value: 4167.0, computedAmount: 4167.0 },
    { name: 'Performance Bonus', computationType: 'percent', value: 8.33, computedAmount: 2082.50 },
    { name: 'Leave Travel Allowance (LTA)', computationType: 'percent', value: 8.333, computedAmount: 2083.25 },
    { name: 'Fixed Allowance', computationType: 'fixed', value: 4167.25, computedAmount: 4167.25 }
  ];

  await prisma.salaryInfo.create({
    data: {
      employeeId: john.id,
      wageType: 'fixed',
      wageAmount: 50000,
      wagePeriod: 'monthly',
      workingDaysPerWeek: 5,
      breakTime: 1.0,
      components: JSON.stringify(johnComponents),
      pfEmployeePercent: 12.0,
      pfEmployerPercent: 12.0,
      professionalTax: 200.0,
    },
  });

  // John allocations (Paid 24, Sick 7)
  await prisma.timeOffAllocation.createMany({
    data: [
      { employeeId: john.id, type: 'paid', totalDays: 24, usedDays: 0, remainingDays: 24 },
      { employeeId: john.id, type: 'sick', totalDays: 7, usedDays: 0, remainingDays: 7 },
      { employeeId: john.id, type: 'unpaid', totalDays: 0, usedDays: 0, remainingDays: 0 },
    ],
  });

  // 4. Create Employee 2: Jane Smith
  const janeLoginId = 'OIJASM20230001'; // Odoo India, Jane Smith, 2023, serial 1
  const jane = await prisma.employee.create({
    data: {
      companyId: company.id,
      loginId: janeLoginId,
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      personalEmail: 'jane.smith.personal@gmail.com',
      mobile: '+919876543211',
      passwordHash: employeePasswordHash,
      mustChangePassword: false, // already changed / active
      role: 'employee',
      jobPosition: 'UI/UX Designer',
      department: 'Design',
      manager: 'HR Admin',
      location: 'Mumbai Office',
      dateOfJoining: new Date('2023-08-10'),
      dateOfBirth: new Date('1998-03-12'),
      nationality: 'Indian',
      gender: 'Female',
      maritalStatus: 'Single',
      residingAddress: 'Flat 704, Royal Palms, Goregaon, Mumbai',
      bankName: 'ICICI Bank',
      accountNumber: '000401569874',
      ifscCode: 'ICIC0000004',
      panNo: 'WXYZR5678S',
      uanNo: '100123456790',
      empCode: 'EMP2023002',
      skills: JSON.stringify(['Figma', 'Adobe XD', 'Prototyping', 'User Research']),
      certifications: JSON.stringify(['Google UX Design Certificate', 'Interaction Design Foundation Member']),
      about: 'Creative UX designer dedicated to making complex systems simple and delightful.',
      whatILoveAboutMyJob: 'Collaborating with engineers and solving user frustrations.',
      interestsAndHobbies: 'Painting, pottery, and playing table tennis.',
    },
  });
  console.log(`Created employee: ${jane.name} (Login ID: ${jane.loginId})`);

  // Jane Salary Info: Wage = 80,000/month
  const janeSalaryComponents = calculateSalaryComponents(80000, 'monthly');
  await prisma.salaryInfo.create({
    data: {
      employeeId: jane.id,
      wageType: 'fixed',
      wageAmount: 80000,
      wagePeriod: 'monthly',
      workingDaysPerWeek: 5,
      breakTime: 1.0,
      components: JSON.stringify(janeSalaryComponents.components),
      pfEmployeePercent: 12.0,
      pfEmployerPercent: 12.0,
      professionalTax: 200.0,
    },
  });

  // Jane allocations (Paid 24 total, 2 used. Sick 7 total, 1 used)
  await prisma.timeOffAllocation.createMany({
    data: [
      { employeeId: jane.id, type: 'paid', totalDays: 24, usedDays: 2, remainingDays: 22 },
      { employeeId: jane.id, type: 'sick', totalDays: 7, usedDays: 1, remainingDays: 6 },
      { employeeId: jane.id, type: 'unpaid', totalDays: 0, usedDays: 0, remainingDays: 0 },
    ],
  });

  // 5. Seed Attendance Logs
  // Let's seed for John and Jane for the last few weekdays relative to current date (July 2026)
  const today = new Date();
  const getPastDate = (daysAgo: number, hour: number, minute: number = 0) => {
    const d = new Date(today);
    d.setDate(today.getDate() - daysAgo);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  // Find weekdays in last 5 days
  const attendanceRecords = [];
  for (let i = 1; i <= 5; i++) {
    const checkDate = getPastDate(i, 9);
    const dayOfWeek = checkDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Weekdays only
      // John present
      const johnIn = getPastDate(i, 9, Math.floor(Math.random() * 15)); // 9:00 - 9:15 AM
      const johnOut = getPastDate(i, 18, Math.floor(Math.random() * 20)); // 6:00 - 6:20 PM
      const johnDiff = (johnOut.getTime() - johnIn.getTime()) / (1000 * 60 * 60); // hours
      const johnWork = Math.min(johnDiff - 1, 8.0); // subtract break, cap at 8h
      const johnExtra = Math.max(0, johnDiff - 1 - 8.0); // extra hours

      attendanceRecords.push({
        employeeId: john.id,
        date: new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate()),
        checkIn: johnIn,
        checkOut: johnOut,
        workHours: parseFloat(johnWork.toFixed(2)),
        extraHours: parseFloat(johnExtra.toFixed(2)),
        status: 'present',
      });

      // Jane present
      const janeIn = getPastDate(i, 8, 45 + Math.floor(Math.random() * 15)); // 8:45 - 9:00 AM
      const janeOut = getPastDate(i, 17, 30 + Math.floor(Math.random() * 30)); // 5:30 - 6:00 PM
      const janeDiff = (janeOut.getTime() - janeIn.getTime()) / (1000 * 60 * 60);
      const janeWork = Math.min(janeDiff - 1, 8.0);
      const janeExtra = Math.max(0, janeDiff - 1 - 8.0);

      attendanceRecords.push({
        employeeId: jane.id,
        date: new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate()),
        checkIn: janeIn,
        checkOut: janeOut,
        workHours: parseFloat(janeWork.toFixed(2)),
        extraHours: parseFloat(janeExtra.toFixed(2)),
        status: 'present',
      });
    }
  }

  // Add a check-in for John TODAY (present now)
  const johnTodayIn = new Date();
  johnTodayIn.setHours(9, 5, 0, 0);
  attendanceRecords.push({
    employeeId: john.id,
    date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    checkIn: johnTodayIn,
    checkOut: null,
    workHours: 0.0,
    extraHours: 0.0,
    status: 'present',
  });

  // Jane is on leave today (approved request)
  attendanceRecords.push({
    employeeId: jane.id,
    date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    checkIn: null,
    checkOut: null,
    workHours: 0.0,
    extraHours: 0.0,
    status: 'leave',
  });

  for (const record of attendanceRecords) {
    await prisma.attendance.create({
      data: record,
    });
  }
  console.log(`Seeded ${attendanceRecords.length} attendance records.`);

  // 6. Seed Time Off Requests
  // Jane's active approved leave (today)
  const leaveStart = new Date(today);
  const leaveEnd = new Date(today);
  
  await prisma.timeOffRequest.create({
    data: {
      employeeId: jane.id,
      type: 'paid',
      startDate: new Date(leaveStart.getFullYear(), leaveStart.getMonth(), leaveStart.getDate(), 9),
      endDate: new Date(leaveEnd.getFullYear(), leaveEnd.getMonth(), leaveEnd.getDate(), 18),
      allocationDays: 1,
      status: 'approved',
      attachmentUrl: null,
    },
  });

  // John has a pending sick leave request (sick leave certificate upload context)
  const johnSickStart = getPastDate(7, 9);
  const johnSickEnd = getPastDate(6, 18);
  await prisma.timeOffRequest.create({
    data: {
      employeeId: john.id,
      type: 'sick',
      startDate: johnSickStart,
      endDate: johnSickEnd,
      allocationDays: 2,
      status: 'pending',
      attachmentUrl: '/uploads/sick_cert_john.pdf',
    },
  });

  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
