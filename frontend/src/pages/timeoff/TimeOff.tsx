import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  MoreVertical,
  Search,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';

const TimeOff: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [requests, setRequests] = useState([
    { id: '1', name: 'John Doe', type: 'Paid Time Off', start: 'July 15, 2026', end: 'July 17, 2026', days: 3, status: 'approved', remarks: 'Annual family trip', comment: 'Enjoy your holidays!' },
    { id: '2', name: 'Jane Smith', type: 'Sick Leave', start: 'July 20, 2026', end: 'July 21, 2026', days: 2, status: 'pending', remarks: 'Severe fever and cough', comment: '' },
    { id: '3', name: 'Mike Ross', type: 'Unpaid Leave', start: 'July 25, 2026', end: 'July 25, 2026', days: 1, status: 'rejected', remarks: 'Personal errand', comment: 'Resource crunch during this period.' },
  ]);

  const allocations = [
    { type: 'Paid Time Off', available: 24, total: 30, color: 'bg-hrms-blue text-blue-600 border-blue-100' },
    { type: 'Sick Time Off', available: 7, total: 10, color: 'bg-hrms-green text-green-600 border-green-100' },
  ];

  const handleAction = (id: string, newStatus: 'approved' | 'rejected') => {
    setRequests(requests.map(req => req.id === id ? { ...req, status: newStatus } : req));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Time Off</h1>
          <p className="text-slate-500 mt-1 font-medium">
            {isAdmin ? 'Manage and approve employee leave requests.' : 'Manage your leave balance and requests.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isAdmin && (
            <Link
              to="/timeoff/new"
              className="flex items-center gap-2 px-6 py-3 bg-hrms-lime text-slate-900 rounded-2xl text-sm font-bold shadow-xl shadow-hrms-lime/10 hover:opacity-90 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              NEW REQUEST
            </Link>
          )}
        </div>
      </div>

      {/* Allocation Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allocations.map((alloc, i) => (
          <div key={i} className={cn("p-8 rounded-[2.5rem] border shadow-sm relative overflow-hidden group", alloc.color)}>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">{alloc.type}</span>
                <Calendar className="w-4 h-4 opacity-40" />
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-bold">{alloc.available}</h3>
                <span className="text-sm font-bold opacity-60">/ {alloc.total} Days</span>
              </div>
              <p className="text-xs font-medium mt-1 opacity-70">Available for this year</p>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>
        ))}
        
        {/* Quick Help / Info */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm flex flex-col justify-center">
           <div className="flex items-center gap-3 text-slate-400 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Policy Note</span>
           </div>
           <p className="text-sm text-slate-500 leading-relaxed font-medium">
             Medical certificates are mandatory for sick leave requests exceeding 2 days.
           </p>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-900">
            {isAdmin ? 'All Requests' : 'My Requests'}
          </h3>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Filter requests..."
              className="pl-10 pr-4 py-2 bg-slate-50 border border-transparent rounded-xl text-xs w-48 focus:bg-white focus:border-gray-100 transition-all outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Period</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Days</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        req.type.includes('Sick') ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                      )}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900">{req.type}</p>
                          {req.remarks && (
                            <div className="group/note relative">
                              <MessageSquare className="w-3 h-3 text-slate-300 cursor-help" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover/note:opacity-100 transition-opacity pointer-events-none z-50">
                                {req.remarks}
                              </div>
                            </div>
                          )}
                        </div>
                        {isAdmin && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{req.name}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <span>{req.start}</span>
                      <ChevronRight className="w-3 h-3 text-slate-300" />
                      <span>{req.end}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-900">{req.days}</td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight flex items-center gap-1.5 w-fit",
                        req.status === 'approved' ? "bg-green-50 text-green-600" :
                        req.status === 'pending' ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-600"
                      )}>
                        {req.status === 'approved' ? <CheckCircle2 className="w-3 h-3" /> :
                         req.status === 'pending' ? <AlertCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {req.status}
                      </span>
                      {req.comment && (
                        <p className="text-[9px] text-slate-400 font-medium italic">"{req.comment}"</p>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    {isAdmin && req.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleAction(req.id, 'approved')}
                          className="px-3 py-1.5 bg-hrms-lime text-slate-900 rounded-lg text-[10px] font-bold shadow-sm hover:opacity-90 transition-all"
                        >
                          APPROVE
                        </button>
                        <button 
                          onClick={() => handleAction(req.id, 'rejected')}
                          className="px-3 py-1.5 bg-white border border-gray-100 text-slate-400 rounded-lg text-[10px] font-bold hover:text-red-500 hover:border-red-100 transition-all"
                        >
                          REJECT
                        </button>
                      </div>
                    ) : (
                      <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                         <MoreVertical className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimeOff;
