const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper to get token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper to set token in localStorage
export const setAuthToken = (token: string) => {
  localStorage.setItem('token', token);
};

// Helper to clear session
export const clearAuthSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Generic request wrapper
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  // Add Auth token if available
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Set Content-Type to JSON if it's not a FormData upload
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return data as T;
}

// -------------------------------------------------------------
// API TYPES
// -------------------------------------------------------------
export interface Company {
  id: string;
  name: string;
  logoUrl?: string | null;
}

export interface Employee {
  id: string;
  loginId: string;
  name: string;
  email: string;
  personalEmail?: string | null;
  mobile?: string | null;
  role: 'admin' | 'employee';
  jobPosition?: string | null;
  department?: string | null;
  manager?: string | null;
  location?: string | null;
  dateOfJoining?: string | null;
  dateOfBirth?: string | null;
  nationality?: string | null;
  gender?: string | null;
  maritalStatus?: string | null;
  residingAddress?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
  panNo?: string | null;
  uanNo?: string | null;
  empCode?: string | null;
  profilePictureUrl?: string | null;
  resumeUrl?: string | null;
  about?: string | null;
  skills: string; // JSON string of skills
  certifications: string; // JSON string of certifications
  whatILoveAboutMyJob?: string | null;
  interestsAndHobbies?: string | null;
  status?: 'present' | 'absent' | 'leave';
  salaryInfo?: SalaryInfo;
}

export interface SalaryComponent {
  name: string;
  computationType: 'fixed' | 'percent';
  value: number;
  computedAmount: number;
}

export interface SalaryInfo {
  id: string;
  employeeId: string;
  wageType: string;
  wageAmount: number;
  wagePeriod: 'monthly' | 'yearly';
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
  checkIn?: string | null;
  checkOut?: string | null;
  workHours: number;
  extraHours: number;
  status: 'present' | 'absent' | 'leave';
  employee?: {
    id: string;
    name: string;
    loginId: string;
    jobPosition?: string;
    department?: string;
    profilePictureUrl?: string;
  };
}

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  type: 'paid' | 'sick' | 'unpaid';
  startDate: string;
  endDate: string;
  allocationDays: number;
  attachmentUrl?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  employee?: {
    id: string;
    name: string;
    loginId: string;
    jobPosition?: string;
    department?: string;
  };
}

export interface TimeOffAllocation {
  id: string;
  employeeId: string;
  type: 'paid' | 'sick' | 'unpaid';
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}

// -------------------------------------------------------------
// API CLIENT IMPLEMENTATION
// -------------------------------------------------------------
export const api = {
  // 1. Auth Endpoint Methods
  auth: {
    signupEmployee: (data: { name: string; email: string; password: string }) => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      
      return request<{ message: string; token: string; user: any }>('/auth/signup', {
        method: 'POST',
        body: formData, // the backend uses upload.none() which parses multipart form data
      });
    },
    signin: (credentials: { loginIdOrEmail: string; password: string }) => {
      return request<{ message: string; token: string; user: any }>('/auth/signin', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },
    changePassword: (data: { oldPassword?: string; newPassword: string }) => {
      return request<{ message: string }>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  // 2. Employees Endpoint Methods
  employees: {
    list: (search?: string) => {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      return request<Employee[]>(`/employees${query}`);
    },
    get: (id: string) => {
      return request<Employee>(`/employees/${id}`);
    },
    create: (data: Partial<Employee>) => {
      return request<{ message: string; employee: any; tempPassword?: string }>('/employees', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    updateProfile: (id: string, data: {
      about?: string;
      skills?: string[] | string;
      certifications?: string[] | string;
      whatILoveAboutMyJob?: string;
      interestsAndHobbies?: string;
    }) => {
      return request<{ message: string; employee: Employee }>(`/employees/${id}/profile`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    updatePrivateInfo: (id: string, data: Partial<Employee>) => {
      return request<{ message: string; employee: Employee }>(`/employees/${id}/private-info`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    uploadFile: (id: string, file: File, fileType: 'avatar' | 'resume') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);
      return request<{ message: string; fileUrl: string; employeeId: string }>(`/employees/${id}/upload`, {
        method: 'POST',
        body: formData,
      });
    },
  },

  // 3. Salary Endpoint Methods
  salary: {
    get: (employeeId: string) => {
      return request<SalaryInfo>(`/employees/${employeeId}/salary`);
    },
    update: (employeeId: string, data: {
      wageAmount: number;
      wagePeriod: 'monthly' | 'yearly';
      workingDaysPerWeek?: number;
      breakTime?: number;
      pfEmployeePercent?: number;
      pfEmployerPercent?: number;
      professionalTax?: number;
      performanceBonusPercent?: number;
    }) => {
      return request<{ message: string; salaryInfo: SalaryInfo }>(`/employees/${employeeId}/salary`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
  },

  // 4. Attendance Endpoint Methods
  attendance: {
    checkIn: () => {
      return request<{ message: string; attendance: Attendance }>('/attendance/checkin', {
        method: 'POST',
      });
    },
    checkOut: () => {
      return request<{ message: string; attendance: Attendance }>('/attendance/checkout', {
        method: 'POST',
      });
    },
    myLogs: (year?: number, month?: number) => {
      const query = [
        year ? `year=${year}` : '',
        month !== undefined ? `month=${month}` : '',
      ].filter(Boolean).join('&');
      return request<{
        summary: { presentCount: number; leavesCount: number; totalWorkingDays: number };
        logs: Attendance[];
      }>(`/attendance/my-logs${query ? `?${query}` : ''}`);
    },
    allLogs: (date?: string) => {
      const query = date ? `?date=${date}` : '';
      return request<{ date: string; logs: Attendance[] }>(`/attendance/all-logs${query}`);
    },
  },

  // 5. Time Off Endpoint Methods
  timeOff: {
    requests: () => {
      return request<TimeOffRequest[]>('/time-off/requests');
    },
    allocations: (employeeId?: string) => {
      const query = employeeId ? `?employeeId=${employeeId}` : '';
      return request<TimeOffAllocation[]>(`/time-off/allocations${query}`);
    },
    createRequest: (formData: FormData) => {
      // Must be FormData to support optional attachments upload
      return request<{ message: string; request: TimeOffRequest }>('/time-off/requests', {
        method: 'POST',
        body: formData,
      });
    },
    updateStatus: (requestId: string, status: 'approved' | 'rejected') => {
      return request<{ message: string; request: TimeOffRequest }>(`/time-off/requests/${requestId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    },
  },
};
