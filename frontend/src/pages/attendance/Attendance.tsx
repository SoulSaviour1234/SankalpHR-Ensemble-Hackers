import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock3,
  Search
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';
import { api, Attendance as AttendanceType } from '../../utils/api';
import { useAttendance } from '../../context/AttendanceContext';

const mockEmployeeLogs: AttendanceType[] = [
  {
    id: 'mock-1',
    employeeId: 'self',
    date: '2026-07-03T00:00:00.000Z',
    checkIn: '2026-07-03T09:05:00.000Z',
    checkOut: '2026-07-03T17:45:00.000Z',
    status: 'present',
    workHours: 7.67,
    extraHours: 0
  },
  {
    id: 'mock-2',
    employeeId: 'self',
    date: '2026-07-02T00:00:00.000Z',
    checkIn: '2026-07-02T08:58:00.000Z',
    checkOut: '2026-07-02T17:30:00.000Z',
    status: 'present',
    workHours: 7.53,
    extraHours: 0
  },
  {
    id: 'mock-3',
    employeeId: 'self',
    date: '2026-07-01T00:00:00.000Z',
    checkIn: null,
    checkOut: null,
    status: 'leave',
    workHours: 0,
    extraHours: 0
  },
  {
    id: 'mock-4',
    employeeId: 'self',
    date: '2026-06-30T00:00:00.000Z',
    checkIn: '2026-06-30T09:12:00.000Z',
    checkOut: '2026-06-30T18:15:00.000Z',
    status: 'present',
    workHours: 8.05,
    extraHours: 0.05
  },
  {
    id: 'mock-5',
    employeeId: 'self',
    date: '2026-06-29T00:00:00.000Z',
    checkIn: '2026-06-29T09:00:00.000Z',
    checkOut: '2026-06-29T17:30:00.000Z',
    status: 'present',
    workHours: 7.5,
    extraHours: 0
  },
  {
    id: 'mock-6',
    employeeId: 'self',
    date: '2026-06-26T00:00:00.000Z',
    checkIn: '2026-06-26T08:55:00.000Z',
    checkOut: '2026-06-26T17:45:00.000Z',
    status: 'present',
    workHours: 7.83,
    extraHours: 0
  },
  {
    id: 'mock-7',
    employeeId: 'self',
    date: '2026-06-25T00:00:00.000Z',
    checkIn: '2026-06-25T09:02:00.000Z',
    checkOut: '2026-06-25T18:00:00.000Z',
    status: 'present',
    workHours: 7.97,
    extraHours: 0
  },
  {
    id: 'mock-8',
    employeeId: 'self',
    date: '2026-06-24T00:00:00.000Z',
    checkIn: '2026-06-24T09:05:00.000Z',
    checkOut: '2026-06-24T17:30:00.000Z',
    status: 'present',
    workHours: 7.42,
    extraHours: 0
  },
  {
    id: 'mock-9',
    employeeId: 'self',
    date: '2026-06-23T00:00:00.000Z',
    checkIn: '2026-06-23T08:50:00.000Z',
    checkOut: '2026-06-23T17:50:00.000Z',
    status: 'present',
    workHours: 8.0,
    extraHours: 0
  },
  {
    id: 'mock-10',
    employeeId: 'self',
    date: '2026-06-22T00:00:00.000Z',
    checkIn: null,
    checkOut: null,
    status: 'leave',
    workHours: 0,
    extraHours: 0
  }
];

const mockAdminLogs = (selectedDateStr: string): any[] => [
  {
    id: 'admin-mock-1',
    employeeId: 'emp-1',
    date: `${selectedDateStr}T00:00:00.000Z`,
    checkIn: `${selectedDateStr}T09:02:00.000Z`,
    checkOut: `${selectedDateStr}T17:45:00.000Z`,
    status: 'present',
    employee: {
      id: 'emp-1',
      name: 'Aarav Sharma',
      loginId: 'aarav.sharma',
      jobPosition: 'Software Engineer',
      department: 'Technology',
      profilePictureUrl: null
    }
  },
  {
    id: 'admin-mock-2',
    employeeId: 'emp-2',
    date: `${selectedDateStr}T00:00:00.000Z`,
    checkIn: `${selectedDateStr}T08:55:00.000Z`,
    checkOut: `${selectedDateStr}T17:30:00.000Z`,
    status: 'present',
    employee: {
      id: 'emp-2',
      name: 'Priya Patel',
      loginId: 'priya.patel',
      jobPosition: 'UX Designer',
      department: 'Design',
      profilePictureUrl: null
    }
  },
  {
    id: 'admin-mock-3',
    employeeId: 'emp-3',
    date: `${selectedDateStr}T00:00:00.000Z`,
    checkIn: null,
    checkOut: null,
    status: 'leave',
    employee: {
      id: 'emp-3',
      name: 'Rahul Verma',
      loginId: 'rahul.verma',
      jobPosition: 'Product Manager',
      department: 'Product',
      profilePictureUrl: null
    }
  },
  {
    id: 'admin-mock-4',
    employeeId: 'emp-4',
    date: `${selectedDateStr}T00:00:00.000Z`,
    checkIn: `${selectedDateStr}T09:15:00.000Z`,
    checkOut: `${selectedDateStr}T18:00:00.000Z`,
    status: 'present',
    employee: {
      id: 'emp-4',
      name: 'Sneha Reddy',
      loginId: 'sneha.reddy',
      jobPosition: 'HR Manager',
      department: 'Human Resources',
      profilePictureUrl: null
    }
  },
  {
    id: 'admin-mock-5',
    employeeId: 'emp-5',
    date: `${selectedDateStr}T00:00:00.000Z`,
    checkIn: null,
    checkOut: null,
    status: 'absent',
    employee: {
      id: 'emp-5',
      name: 'Vikram Malhotra',
      loginId: 'vikram.malhotra',
      jobPosition: 'Marketing Lead',
      department: 'Marketing',
      profilePictureUrl: null
    }
  },
  {
    id: 'admin-mock-6',
    employeeId: 'emp-6',
    date: `${selectedDateStr}T00:00:00.000Z`,
    checkIn: `${selectedDateStr}T09:00:00.000Z`,
    checkOut: `${selectedDateStr}T17:30:00.000Z`,
    status: 'present',
    employee: {
      id: 'emp-6',
      name: 'Ananya Iyer',
      loginId: 'ananya.iyer',
      jobPosition: 'Data Scientist',
      department: 'Technology',
      profilePictureUrl: null
    }
  },
  {
    id: 'admin-mock-7',
    employeeId: 'emp-7',
    date: `${selectedDateStr}T00:00:00.000Z`,
    checkIn: `${selectedDateStr}T08:48:00.000Z`,
    checkOut: `${selectedDateStr}T17:45:00.000Z`,
    status: 'present',
    employee: {
      id: 'emp-7',
      name: 'Kabir Gupta',
      loginId: 'kabir.gupta',
      jobPosition: 'QA Engineer',
      department: 'Technology',
      profilePictureUrl: null
    }
  },
  {
    id: 'admin-mock-8',
    employeeId: 'emp-8',
    date: `${selectedDateStr}T00:00:00.000Z`,
    checkIn: `${selectedDateStr}T09:10:00.000Z`,
    checkOut: `${selectedDateStr}T17:30:00.000Z`,
    status: 'present',
    employee: {
      id: 'emp-8',
      name: 'Meera Nair',
      loginId: 'meera.nair',
      jobPosition: 'Finance Analyst',
      department: 'Finance',
      profilePictureUrl: null
    }
  }
];

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { isCheckedIn, checkIn, checkOut } = useAttendance();
  const [logs, setLogs] = useState<AttendanceType[]>([]);
  const [summary, setSummary] = useState({ presentCount: 0, leavesCount: 0, totalWorkingDays: 0 });
  const [adminLogs, setAdminLogs] = useState<AttendanceType[]>([]);

  // Calendar states
  const todayDate = new Date();
  const [selectedYear, setSelectedYear] = useState(todayDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(todayDate.getMonth()); // 0-indexed
  const [adminSearch, setAdminSearch] = useState('');
  const [selectedAdminDate, setSelectedAdminDate] = useState(todayDate.toISOString().split('T')[0]);
  
  const loadData = async () => {
    try {
      if (isAdmin) {
        const res = await api.attendance.allLogs(selectedAdminDate);
        const realLogs = res.logs;
        const mockLogs = mockAdminLogs(selectedAdminDate);
        const combined = [...realLogs];
        
        mockLogs.forEach(mock => {
          if (!realLogs.some(real => real.employee?.id === mock.employee.id)) {
            combined.push(mock);
          }
        });
        setAdminLogs(combined);
      } else {
        const res = await api.attendance.myLogs(selectedYear, selectedMonth);
        const realLogs = res.logs;
        const combined = [...realLogs];
        
        mockEmployeeLogs.forEach(mock => {
          const mockDate = new Date(mock.date);
          if (mockDate.getMonth() === selectedMonth && mockDate.getFullYear() === selectedYear) {
            const mockDateStr = mockDate.toISOString().split('T')[0];
            if (!realLogs.some(real => new Date(real.date).toISOString().split('T')[0] === mockDateStr)) {
              combined.push(mock);
            }
          }
        });
        
        combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setLogs(combined);
        
        const presentCount = combined.filter(l => l.status === 'present').length;
        const leavesCount = combined.filter(l => l.status === 'leave').length;
        const absentCount = combined.filter(l => l.status === 'absent').length;
        
        setSummary({
          presentCount,
          leavesCount,
          totalWorkingDays: presentCount + leavesCount + absentCount
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();

    // Listen for global attendance changes (e.g. from TopHeader)
    const handleGlobalUpdate = () => {
      loadData();
    };
    window.addEventListener('attendance-update', handleGlobalUpdate);
    return () => {
      window.removeEventListener('attendance-update', handleGlobalUpdate);
    };
  }, [isAdmin, selectedYear, selectedMonth, selectedAdminDate]);

  const handleCheckIn = async () => {
    try {
      await checkIn();
    } catch (e: any) {
      alert(e.message || 'Failed to check in.');
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut();
    } catch (e: any) {
      alert(e.message || 'Failed to check out.');
    }
  };
  
  const stats = isAdmin ? [
    { label: 'Present Today', value: adminLogs.filter(l => l.status === 'present').length.toString(), icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
    { label: 'On Leave Today', value: adminLogs.filter(l => l.status === 'leave').length.toString(), icon: CalendarIcon, color: 'text-blue-600 bg-blue-50' },
    { label: 'Absent Today', value: adminLogs.filter(l => l.status === 'absent').length.toString(), icon: Clock3, color: 'text-slate-600 bg-slate-50' },
  ] : [
    { label: 'Present Days', value: summary.presentCount.toString(), icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
    { label: 'Leaves Taken', value: summary.leavesCount.toString(), icon: CalendarIcon, color: 'text-blue-600 bg-blue-50' },
    { label: 'Working Days', value: summary.totalWorkingDays.toString(), icon: Clock3, color: 'text-slate-600 bg-slate-50' },
  ];

  const filteredAdminLogs = adminLogs.filter(log => {
    if (!log.employee) return false;
    const term = adminSearch.toLowerCase();
    return (
      log.employee.name.toLowerCase().includes(term) ||
      (log.employee.department && log.employee.department.toLowerCase().includes(term)) ||
      (log.employee.jobPosition && log.employee.jobPosition.toLowerCase().includes(term))
    );
  });

  const displayLogs = isAdmin ? filteredAdminLogs : logs;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Generate days in the selected month with real attendance status
  const daysInSelectedMonthCount = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay();

  const daysInMonth = Array.from({ length: daysInSelectedMonthCount }, (_, i) => {
    const day = i + 1;
    const checkDateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const log = logs.find(l => {
      const logDateStr = new Date(l.date).toISOString().split('T')[0];
      return logDateStr === checkDateStr;
    });

    let status: 'present' | 'absent' | 'leave' | 'weekend' | 'future' | 'none' = 'none';
    const dateObj = new Date(selectedYear, selectedMonth, day);
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (dateObj > todayDate) {
      status = 'future';
    } else if (log) {
      status = log.status as 'present' | 'absent' | 'leave';
    } else if (isWeekend) {
      status = 'weekend';
    } else {
      status = 'absent';
    }

    return {
      day,
      status: status as string,
      log
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Attendance</h1>
          <p className="text-slate-500 mt-1 font-medium">
            {isAdmin ? 'Monitor company-wide attendance.' : 'Track your daily check-ins and work hours.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isAdmin && (
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 px-4">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full animate-pulse", isCheckedIn ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500")} />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                  {isCheckedIn ? 'Working' : 'Off-duty'}
                </span>
              </div>
              <div className="h-4 w-[1px] bg-gray-100" />
              <div className="flex gap-2">
                {!isCheckedIn ? (
                  <button 
                    onClick={handleCheckIn}
                    className="px-6 py-2 bg-hrms-lime text-slate-900 rounded-xl text-xs font-bold shadow-sm hover:opacity-90 transition-all active:scale-95"
                  >
                    CHECK IN
                  </button>
                ) : (
                  <button 
                    onClick={handleCheckOut}
                    className="px-6 py-2 bg-white border border-gray-100 text-slate-900 rounded-xl text-xs font-bold shadow-sm hover:bg-gray-50 transition-all active:scale-95"
                  >
                    CHECK OUT
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly View & Staff Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar View */}
        <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-gray-50 shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900">Attendance Calendar</h3>
            <div className="flex items-center gap-2">
               <button onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4 text-slate-400" /></button>
               <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{monthNames[selectedMonth]} {selectedYear}</span>
               <button onClick={handleNextMonth} className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors"><ChevronRight className="w-4 h-4 text-slate-400" /></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-y-4 mb-4">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-slate-300">{d}</div>
            ))}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
            {daysInMonth.map((day) => {
              const isToday = day.day === todayDate.getDate() && selectedMonth === todayDate.getMonth() && selectedYear === todayDate.getFullYear();
              return (
                <div key={day.day} className="flex flex-col items-center gap-1">
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all relative group/day cursor-pointer",
                    isToday ? "bg-hrms-lime text-slate-900 shadow-lg shadow-hrms-lime/20" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                  )}>
                    {day.day}
                    {day.status !== 'future' && day.status !== 'weekend' && day.status !== 'none' && (
                      <div className={cn(
                        "absolute -bottom-1 w-1 h-1 rounded-full",
                        day.status === 'present' ? "bg-green-500" :
                        day.status === 'absent' ? "bg-red-500" : "bg-blue-500"
                      )} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Leave</span>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-900">
              {isAdmin ? 'Staff Attendance Logs' : 'Detailed Records'}
            </h3>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <input 
                  type="date"
                  value={selectedAdminDate}
                  onChange={(e) => setSelectedAdminDate(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-transparent rounded-xl text-xs outline-none focus:bg-white focus:border-gray-100 transition-all"
                />
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search employee..."
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-50 border border-transparent rounded-xl text-xs w-48 focus:bg-white focus:border-gray-100 transition-all outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isAdmin ? 'Employee' : 'Date'}</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Check In</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Check Out</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      {isAdmin && log.employee ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden shadow-inner">
                             <img src={log.employee.profilePictureUrl ? `http://localhost:5000${log.employee.profilePictureUrl}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(log.employee.name)}`} alt="User" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{log.employee.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{new Date(log.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-slate-700">{new Date(log.date).toLocaleDateString()}</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-600">
                      {log.checkIn ? new Date(log.checkIn).toLocaleTimeString() : '-'}
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-600">
                      {log.checkOut ? new Date(log.checkOut).toLocaleTimeString() : '-'}
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-3 py-1 text-[10px] font-bold rounded-lg uppercase",
                        log.status === 'absent' ? "bg-red-50 text-red-600" : (log.status === 'leave' ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600")
                      )}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {displayLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-8 text-center text-slate-400 font-medium">No records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
