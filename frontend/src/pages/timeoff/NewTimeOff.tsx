import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, AlertCircle, ArrowLeft, Send } from 'lucide-react';
import { cn } from '../../utils/cn';

const NewTimeOff: React.FC = () => {
  const navigate = useNavigate();
  const [leaveType, setLeaveType] = useState('Paid');
  
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Paid', 'Sick', 'Unpaid'].map((type) => (
            <button
              key={type}
              onClick={() => setLeaveType(type)}
              className={cn(
                "p-6 rounded-3xl border-2 transition-all text-left group",
                leaveType === type 
                  ? "border-hrms-lime bg-hrms-lime/5" 
                  : "border-gray-50 bg-slate-50/50 hover:border-gray-200"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                type === 'Paid' ? "bg-blue-50 text-blue-500" :
                type === 'Sick' ? "bg-red-50 text-red-500" : "bg-slate-200 text-slate-600"
              )}>
                {type === 'Sick' ? <AlertCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
              </div>
              <h3 className="font-bold text-slate-900">{type} Leave</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                {type === 'Paid' ? 'Annual vacation allocation' :
                 type === 'Sick' ? 'Medical related absence' : 'Personal reasons (unpaid)'}
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
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-hrms-lime outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Remarks</label>
          <textarea 
            rows={4}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-3xl text-sm focus:ring-2 focus:ring-hrms-lime outline-none transition-all resize-none"
            placeholder="Please provide a reason for your leave request..."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-4 bg-white border border-gray-100 text-slate-400 rounded-2xl text-sm font-bold hover:text-slate-600 transition-all"
          >
            DISCARD
          </button>
          <button 
            onClick={() => navigate('/timeoff')}
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
