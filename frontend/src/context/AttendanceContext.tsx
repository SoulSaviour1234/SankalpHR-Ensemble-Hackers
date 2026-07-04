import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, Attendance } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

interface AttendanceContextType {
  isCheckedIn: boolean;
  todayLog: Attendance | null;
  loading: boolean;
  checkIn: () => Promise<void>;
  checkOut: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [todayLog, setTodayLog] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshStatus = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.attendance.myLogs();
      const todayStr = new Date().toISOString().split('T')[0];
      const log = res.logs.find(l => l.date.startsWith(todayStr));
      
      setTodayLog(log || null);
      if (log && log.checkIn && !log.checkOut) {
        setIsCheckedIn(true);
      } else {
        setIsCheckedIn(false);
      }
    } catch (e) {
      console.error('Failed to load attendance status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, [user]);

  const checkIn = async () => {
    try {
      setLoading(true);
      await api.attendance.checkIn();
      await refreshStatus();
      window.dispatchEvent(new Event('attendance-update'));
    } catch (e: any) {
      throw new Error(e.message || 'Failed to check in.');
    } finally {
      setLoading(false);
    }
  };

  const checkOut = async () => {
    try {
      setLoading(true);
      await api.attendance.checkOut();
      await refreshStatus();
      window.dispatchEvent(new Event('attendance-update'));
    } catch (e: any) {
      throw new Error(e.message || 'Failed to check out.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AttendanceContext.Provider value={{ isCheckedIn, todayLog, loading, checkIn, checkOut, refreshStatus }}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
