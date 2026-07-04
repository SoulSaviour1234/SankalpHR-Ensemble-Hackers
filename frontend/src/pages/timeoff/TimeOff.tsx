import React, { useState, useEffect } from 'react';
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
  FileDown
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';
import { api, TimeOffRequest, TimeOffAllocation } from '../../utils/api';

const TimeOff: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [allocations, setAllocations] = useState<TimeOffAllocation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    try {
      const reqData = await api.timeOff.requests();
      setRequests(reqData);

      const allocData = await api.timeOff.allocations(isAdmin ? undefined : user?.id);
      setAllocations(allocData);
    } catch (e) {
      console.error('Failed to load time-off data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleAction = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      await api.timeOff.updateStatus(id, newStatus);
      loadData();
    } catch (e: any) {
      alert(e.message || 'Failed to update request status.');
    }
  };

  const filteredRequests = requests.filter(req => {
    const searchLower = searchTerm.toLowerCase();
    const matchesName = req.employee?.name.toLowerCase().includes(searchLower) || false;
    const matchesType = req.type.toLowerCase().includes(searchLower);
    return matchesName || matchesType;
  });

  const getAllocationColor = (type: string) => {
    switch (type) {
      case 'paid':
        return 'bg-hrms-blue text-blue-600 border-blue-100';
      case 'sick':
        return 'bg-hrms-green text-green-600 border-green-100';
      default:
        return 'bg-slate-200 text-slate-600 border-slate-300';
    }
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
          <Link
            to="/timeoff/new"
            className="flex items-center gap-2 px-6 py-3 bg-hrms-lime text-slate-900 rounded-2xl text-sm font-bold shadow-xl shadow-hrms-lime/10 hover:opacity-90 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            NEW REQUEST
          </Link>
        </div>
      </div>

      {/* Allocation Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allocations.map((alloc) => (
          <div key={alloc.id} className={cn("p-8 rounded-[2.5rem] border shadow-sm relative overflow-hidden group", getAllocationColor(alloc.type))}>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">{alloc.type} Time Off</span>
                <Calendar className="w-4 h-4 opacity-40" />
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-bold">{alloc.remainingDays}</h3>
                <span className="text-sm font-bold opacity-60">/ {alloc.totalDays} Days</span>
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
             Medical certificates are mandatory for sick leave requests.
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        req.type === 'sick' ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                      )}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 uppercase">{req.type} Leave</p>
                          {req.attachmentUrl && (
                            <a 
                              href={`http://localhost:5000${req.attachmentUrl}`} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-black transition-colors"
                              title="Download Attachment"
                            >
                              <FileDown className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        {isAdmin && req.employee && (
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{req.employee.name}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <span>{new Date(req.startDate).toLocaleDateString()}</span>
                      <ChevronRight className="w-3 h-3 text-slate-300" />
                      <span>{new Date(req.endDate).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-900">{req.allocationDays}</td>
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
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-8 text-center text-slate-400 font-medium">No requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimeOff;
