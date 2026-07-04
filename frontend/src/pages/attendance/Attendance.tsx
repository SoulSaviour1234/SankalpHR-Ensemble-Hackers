import React, { useState } from 'react';
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

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  
  const stats = [
    { label: 'Present Days', value: '18', icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
    { label: 'Leaves Taken', value: '2', icon: CalendarIcon, color: 'text-blue-600 bg-blue-50' },
    { label: 'Working Days', value: '22', icon: Clock3, color: 'text-slate-600 bg-slate-50' },
  ];

  // Mock Calendar Data
  const daysInMonth = Array.from({ length: 31 }, (_, i) => ({
    day: i + 1,
    status: Math.random() > 0.8 ? 'absent' : (Math.random() > 0.1 ? 'present' : 'leave')
  }));

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
                    onClick={() => setIsCheckedIn(true)}
                    className="px-6 py-2 bg-hrms-lime text-slate-900 rounded-xl text-xs font-bold shadow-sm hover:opacity-90 transition-all active:scale-95"
                  >
                    CHECK IN
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsCheckedIn(false)}
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
               <button className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4 text-slate-400" /></button>
               <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">July 2026</span>
               <button className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors"><ChevronRight className="w-4 h-4 text-slate-400" /></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-y-4 mb-4">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-slate-300">{d}</div>
            ))}
            {Array.from({ length: 3 }).map((_, i) => <div key={`empty-${i}`} />)}
            {daysInMonth.map((day) => (
              <div key={day.day} className="flex flex-col items-center gap-1">
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all relative group/day cursor-pointer",
                  day.day === 4 ? "bg-hrms-lime text-slate-900 shadow-lg shadow-hrms-lime/20" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                )}>
                  {day.day}
                  <div className={cn(
                    "absolute -bottom-1 w-1 h-1 rounded-full",
                    day.status === 'present' ? "bg-green-500" :
                    day.status === 'absent' ? "bg-red-500" : "bg-blue-500"
                  )} />
                </div>
              </div>
            ))}
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
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search employee..."
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-transparent rounded-xl text-xs w-48 focus:bg-white focus:border-gray-100 transition-all outline-none"
                />
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
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      {isAdmin ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden shadow-inner">
                             <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">Employee {i}</p>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">July 04, 2026</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-slate-700">July {i < 10 ? `0${i}` : i}, 2026</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-600">09:0{i} AM</td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-600">06:00 PM</td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-3 py-1 text-[10px] font-bold rounded-lg uppercase",
                        i % 3 === 0 ? "bg-red-50 text-red-600" : (i % 4 === 0 ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600")
                      )}>
                        {i % 3 === 0 ? 'Absent' : (i % 4 === 0 ? 'Leave' : 'Present')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
