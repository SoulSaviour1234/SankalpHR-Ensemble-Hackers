import React from 'react';
import { Search, Settings } from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { cn } from '../../utils/cn';

const TopHeader: React.FC = () => {
  const { isCheckedIn, checkIn, checkOut, loading } = useAttendance();

  const handleToggleAttendance = async () => {
    try {
      if (isCheckedIn) {
        await checkOut();
      } else {
        await checkIn();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to toggle attendance status.');
    }
  };

  return (
    <header className="h-16 bg-transparent flex items-center justify-between px-8 mt-2">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search employee or actions..."
          className="pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-full text-xs w-64 focus:outline-none focus:ring-2 focus:ring-hrms-lime shadow-sm transition-all font-medium text-slate-700"
        />
      </div>

      {/* Quick Check-In / Check-Out & Settings */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-white p-1.5 pl-3 rounded-full border border-gray-100 shadow-sm">
          <div className="flex items-center gap-1.5 mr-1">
            <div className={cn("w-2 h-2 rounded-full", isCheckedIn ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500")} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
              {isCheckedIn ? 'Working' : 'Off-duty'}
            </span>
          </div>
          
          <button
            type="button"
            disabled={loading}
            onClick={handleToggleAttendance}
            className={cn(
              "px-4 py-1.5 rounded-full text-[10px] font-black tracking-wider transition-all active:scale-95 cursor-pointer",
              isCheckedIn 
                ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50" 
                : "bg-hrms-lime text-slate-900 shadow-sm shadow-hrms-lime/20 hover:opacity-90"
            )}
          >
            {loading ? '...' : (isCheckedIn ? 'CHECK OUT' : 'CHECK IN')}
          </button>
        </div>

        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full border border-transparent hover:border-gray-100 shadow-sm transition-all cursor-pointer">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default TopHeader;