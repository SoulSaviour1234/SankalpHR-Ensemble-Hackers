import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, AlertCircle, ArrowLeft, Send } from 'lucide-react';
import { cn } from '../../utils/cn';
import { api } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

const NewTimeOff: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leaveType, setLeaveType] = useState<'paid' | 'sick' | 'unpaid'>('paid');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    const diff = e.getTime() - s.getTime();
    if (diff < 0) return 0;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = async () => {
    setError('');
    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }

    const days = calculateDays(startDate, endDate);
    if (days <= 0) {
      setError('End date must be on or after start date.');
      return;
    }

    if (leaveType === 'sick' && !file) {
      setError('Medical certificate attachment is mandatory for sick leave.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('type', leaveType);
      formData.append('startDate', new Date(startDate).toISOString());
      formData.append('endDate', new Date(endDate).toISOString());
      formData.append('allocationDays', String(days));
      if (file) {
        formData.append('attachment', file);
      }

      await api.timeOff.createRequest(formData);
      navigate('/timeoff');
    } catch (err: any) {
      setError(err.message || 'Failed to submit time-off request.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-50 transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Request Leave</h1>
            <p className="text-slate-500 font-medium">Fill in the details to apply for time off.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-50 shadow-sm space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['paid', 'sick', 'unpaid'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => { setLeaveType(type); setError(''); }}
              className={cn(
                "p-6 rounded-3xl border-2 transition-all text-left group",
                leaveType === type 
                  ? "border-hrms-lime bg-hrms-lime/5" 
                  : "border-gray-50 bg-slate-50/50 hover:border-gray-200"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                type === 'paid' ? "bg-blue-50 text-blue-500" :
                type === 'sick' ? "bg-red-50 text-red-500" : "bg-slate-200 text-slate-600"
              )}>
                {type === 'sick' ? <AlertCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
              </div>
              <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider">{type} Leave</h3>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">
                {type === 'paid' ? 'Annual vacation allocation' :
                 type === 'sick' ? 'Medical related absence' : 'Personal reasons (unpaid)'}
              </p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-hrms-lime outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-hrms-lime outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {leaveType === 'sick' && (
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Medical Certificate (Mandatory)</label>
            <input 
              type="file" 
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-4 bg-white border border-gray-100 text-slate-400 rounded-2xl text-sm font-bold hover:text-slate-600 transition-all"
          >
            DISCARD
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-8 py-4 bg-hrms-lime text-slate-900 rounded-2xl text-sm font-bold shadow-xl shadow-hrms-lime/20 hover:opacity-90 transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
            SUBMIT REQUEST
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewTimeOff;
