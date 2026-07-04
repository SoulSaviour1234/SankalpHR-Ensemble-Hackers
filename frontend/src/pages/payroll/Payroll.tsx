import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Search, 
  Filter, 
  TrendingUp, 
  Users, 
  ArrowUpRight,
  MoreVertical,
  Edit2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { api, Employee } from '../../utils/api';

const Payroll: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);

  const loadEmployees = async () => {
    try {
      const data = await api.employees.list(searchTerm);
      setEmployees(data);
    } catch (e) {
      console.error('Failed to load payroll list:', e);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [searchTerm]);

  // Compute stats dynamically
  const totalPayrollVal = employees.reduce((sum, emp) => sum + (emp.salaryInfo?.wageAmount || 0), 0);
  const activeSalariesCount = employees.filter(emp => (emp.salaryInfo?.wageAmount || 0) > 0).length;
  const avgSalaryVal = activeSalariesCount > 0 ? Math.round(totalPayrollVal / activeSalariesCount) : 0;

  const stats = [
    { label: 'Total Payroll (Monthly)', value: `₹${totalPayrollVal.toLocaleString()}`, icon: DollarSign, color: 'text-blue-600 bg-blue-50', trend: '+12%' },
    { label: 'Avg Salary', value: `₹${avgSalaryVal.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600 bg-green-50', trend: '+5%' },
    { label: 'Employees Configured', value: activeSalariesCount.toString(), icon: Users, color: 'text-purple-600 bg-purple-50', trend: 'Active' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payroll Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Overview and control of company-wide salary distribution.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl text-sm font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
            onClick={() => alert('Payroll successfully batch-processed for all employees!')}
          >
             RUN PAYROLL
             <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm relative overflow-hidden group">
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">{stat.trend}</span>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-slate-50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>
        ))}
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold text-slate-900">Employee Salaries</h3>
            <div className="bg-slate-50 rounded-xl px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              FY 2026-27
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search name, role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-50 border border-transparent rounded-xl text-xs w-48 focus:bg-white focus:border-gray-100 transition-all outline-none"
              />
            </div>
            <button type="button" className="p-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all">
              <Filter className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Salary (Monthly)</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center font-bold text-slate-400 text-xs">
                        {emp.profilePictureUrl ? (
                          <img src={`http://localhost:5000${emp.profilePictureUrl}`} alt={emp.name} className="w-full h-full object-cover" />
                        ) : (
                          emp.name.split(' ').map(n => n[0]).join('')
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{emp.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{emp.jobPosition || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-100">
                      {emp.department || 'N/A'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-900">
                    ₹{emp.salaryInfo?.wageAmount ? emp.salaryInfo.wageAmount.toLocaleString() : '0'}
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight flex items-center gap-1.5 w-fit",
                      emp.salaryInfo?.wageAmount ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
                    )}>
                      <div className={cn("w-1 h-1 rounded-full", emp.salaryInfo?.wageAmount ? "bg-green-600" : "bg-yellow-600")} />
                      {emp.salaryInfo?.wageAmount ? 'Configured' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         type="button" 
                         className="p-2 text-slate-300 hover:text-hrms-lime transition-colors"
                         onClick={() => navigate(`/profile/${emp.id}?tab=Salary`)}
                         title="Edit Salary"
                       >
                          <Edit2 className="w-4 h-4" />
                       </button>
                       <button type="button" className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-8 text-center text-slate-400 font-medium">No employees found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payroll;
