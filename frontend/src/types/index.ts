export interface Company {
  id: string;
  name: string;
  logoUrl: string;
}

export type UserRole = 'admin' | 'employee';

export interface Employee {
  id: string;
  loginId: string;
  name: string;
  email: string;
  personalEmail: string;
  mobile: string;
  role: UserRole;
  jobPosition: string;
  department: string;
  manager?: string;
  location: string;
  dateOfJoining: string;
  dateOfBirth: string;
  nationality: string;
  gender: string;
  maritalStatus: string;
  residingAddress: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  panNo: string;
  uanNo: string;
  empCode: string;
  profilePictureUrl?: string;
  resumeUrl?: string;
  about?: string;
  skills: string[];
  certifications: string[];
  whatILoveAboutMyJob?: string;
  interestsAndHobbies?: string;
  status: 'present' | 'absent' | 'on-leave';
}

export type WagePeriod = 'monthly' | 'yearly';
export type ComputationType = 'fixed' | 'percent';

export interface SalaryComponent {
  name: string;
  computationType: ComputationType;
  value: number;
  computedAmount: number;
}

export interface SalaryInfo {
  employeeId: string;
  wageType: 'fixed';
  wageAmount: number;
  wagePeriod: WagePeriod;
  workingDaysPerWeek: number;
  breakTime: number;
  components: SalaryComponent[];
  pfEmployeePercent: number;
  pfEmployerPercent: number;
  professionalTax: number;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  workHours?: number;
  extraHours?: number;
  status: 'present' | 'absent' | 'on-leave';
}

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  type: 'paid' | 'sick' | 'unpaid';
  startDate: string;
  endDate: string;
  allocationDays: number;
  attachmentUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface TimeOffAllocation {
  employeeId: string;
  type: 'paid' | 'sick' | 'unpaid';
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}
