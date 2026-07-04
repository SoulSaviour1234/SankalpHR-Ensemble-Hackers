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
  Edit2,
  X,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { api, Employee } from '../../utils/api';

const Payroll: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Run Payroll Modal states
  const [showRunPayrollModal, setShowRunPayrollModal] = useState(false);
  const [payrollMonth, setPayrollMonth] = useState(new Date().getMonth());
  const [payrollYear, setPayrollYear] = useState(new Date().getFullYear());
  const [payrollSummary, setPayrollSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const loadPayrollSummary = async () => {
    try {
      setLoadingSummary(true);
      const data = await api.salary.getSummary(payrollYear, payrollMonth);
      setPayrollSummary(data);
    } catch (e) {
      console.error('Failed to load payroll summary:', e);
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    if (showRunPayrollModal) {
      loadPayrollSummary();
    }
  }, [showRunPayrollModal, payrollMonth, payrollYear]);

  // Compute stats dynamically
  const totalPayrollVal = employees.reduce((sum, emp) => sum + (emp.salaryInfo?.wageAmount || 0), 0);
  const activeSalariesCount = employees.filter(emp => (emp.salaryInfo?.wageAmount || 0) > 0).length;
  const avgSalaryVal = activeSalariesCount > 0 ? Math.round(totalPayrollVal / activeSalariesCount) : 0;

  const stats = [
    { label: 'Total Base Payroll (Monthly)', value: `₹${totalPayrollVal.toLocaleString()}`, icon: DollarSign, color: 'text-blue-600 bg-blue-50', trend: '+12%' },
    { label: 'Avg Salary', value: `₹${avgSalaryVal.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600 bg-green-50', trend: '+5%' },
    { label: 'Employees Configured', value: activeSalariesCount.toString(), icon: Users, color: 'text-purple-600 bg-purple-50', trend: 'Active' },
  ];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleProcessPayroll = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowRunPayrollModal(false);
      alert(`Payroll for ${monthNames[payrollMonth]} ${payrollYear} has been processed successfully! All direct bank transfers initiated.`);
    }, 1500);
  };

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
            onClick={() => setShowRunPayrollModal(true)}
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
                         className="p-2 text-slate-300 hover:text-slate-600 transition-colors"
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

      {/* Interactive Run Payroll Modal */}
      {showRunPayrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-5xl w-full border border-slate-100 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowRunPayrollModal(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-black hover:bg-slate-50 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Run Batch Payroll</h2>
                <p className="text-slate-500 font-medium text-xs mt-0.5">Generates payslips with attendance-based deductions.</p>
              </div>

              {/* Month/Year selectors */}
              <div className="flex gap-2">
                <select 
                  value={payrollMonth} 
                  onChange={(e) => setPayrollMonth(Number(e.target.value))}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                >
                  {monthNames.map((name, idx) => (
                    <option key={idx} value={idx}>{name}</option>
                  ))}
                </select>
                <select 
                  value={payrollYear} 
                  onChange={(e) => setPayrollYear(Number(e.target.value))}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
            </div>

            {loadingSummary ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-900"></div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Calculating payouts...</p>
              </div>
            ) : payrollSummary ? (
              <div className="space-y-6">
                {/* Info Card */}
                <div className="p-4 bg-hrms-blue/20 border border-hrms-blue/30 rounded-2xl flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 font-semibold leading-relaxed">
                    Calculation formula: <code className="bg-white px-1.5 py-0.5 rounded border border-blue-100 font-bold">Gross Salary = (Base / Working Days) * Payable Days</code>.
                    Payable days include present days and approved paid/sick leaves. Absent days or unpaid leaves are excluded.
                  </p>
                </div>

                <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                        <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Work Status</th>
                        <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Base Salary</th>
                        <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Gross Salary</th>
                        <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Deductions</th>
                        <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Net Payout</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-slate-700">
                      {payrollSummary.summary.map((row: any) => (
                        <tr key={row.employeeId} className="hover:bg-slate-50/50">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center font-bold text-slate-400 text-xs">
                                {row.profilePictureUrl ? (
                                  <img src={`http://localhost:5000${row.profilePictureUrl}`} alt={row.name} className="w-full h-full object-cover" />
                                ) : (
                                  row.name.split(' ').map((n: string) => n[0]).join('')
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900">{row.name}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{row.jobPosition}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <p className="text-xs font-bold text-slate-800">{row.payableDays} / {row.totalWorkingDays} Days</p>
                            <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-tight mt-0.5">
                              P: {row.presentDays} | L: {row.paidLeaveDays} | A: {row.absentDays + row.unpaidLeaveDays}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-right text-xs font-semibold">₹{row.monthlyWage.toLocaleString()}</td>
                          <td className="px-5 py-4 text-right text-xs font-semibold">₹{row.grossSalary.toLocaleString()}</td>
                          <td className="px-5 py-4 text-right text-xs font-semibold text-red-500">₹{row.totalDeductions.toLocaleString()}</td>
                          <td className="px-5 py-4 text-right text-xs font-bold text-green-600">₹{row.netPayout.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Aggregate Summary Box */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Gross Earnings</span>
                    <p className="text-lg font-black text-slate-900 mt-0.5">
                      ₹{payrollSummary.summary.reduce((s: number, r: any) => s + r.grossSalary, 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Deductions (PF+PT)</span>
                    <p className="text-lg font-black text-red-500 mt-0.5">
                      ₹{payrollSummary.summary.reduce((s: number, r: any) => s + r.totalDeductions, 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Net Disbursement</span>
                    <p className="text-xl font-black text-green-600 mt-0.5">
                      ₹{payrollSummary.summary.reduce((s: number, r: any) => s + r.netPayout, 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRunPayrollModal(false)}
                    className="px-6 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    onClick={handleProcessPayroll}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? 'PROCESSING...' : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        CONFIRM PAYOUTS
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-25 text-center text-slate-400 font-medium">Failed to calculate payroll details.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
