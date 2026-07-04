import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plane, 
  User, 
  Clock, 
  Calendar, 
  LogOut, 
  Bell, 
  ChevronRight,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';
import { api, Employee } from '../../utils/api';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // If no user, it's handled by ProtectedRoute, but for safety:
  if (!user) return null;

  return (
    <div className="space-y-8 -m-6 p-6 min-h-[calc(100vh-4rem)]">
      {user.role === 'employee' ? <EmployeeDashboard /> : <AdminDashboard />}
    </div>
  );
};

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [activities, setActivities] = useState<any[]>([]);
  const [attendanceRate, setAttendanceRate] = useState('0%');
  const [upcomingLeave, setUpcomingLeave] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const quickAccess = [
    { label: 'Profile', icon: User, path: `/profile/${user?.id}`, color: 'bg-hrms-blue text-blue-600' },
    { label: 'Attendance', icon: Clock, path: '/attendance', color: 'bg-hrms-lime text-green-700' },
    { label: 'Leave Requests', icon: Calendar, path: '/timeoff', color: 'bg-hrms-purple text-purple-600' },
    { label: 'Logout', icon: LogOut, path: '/signin', color: 'bg-hrms-orange text-orange-600' },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch attendance logs
        const attendanceRes = await api.attendance.myLogs();
        const logs = attendanceRes.logs;

        // Fetch leave requests
        const requests = await api.timeOff.requests();

        // Calculate attendance rate (present days / total working days in logs)
        const presentCount = attendanceRes.summary.presentCount;
        const totalWorkDays = attendanceRes.summary.totalWorkingDays;
        const rate = totalWorkDays > 0 ? ((presentCount / totalWorkDays) * 100).toFixed(1) + '%' : '100%';
        setAttendanceRate(rate);

        // Find upcoming approved leave
        const today = new Date();
        const upcoming = requests
          .filter(req => req.status === 'approved' && new Date(req.startDate) > today)
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];
        setUpcomingLeave(upcoming);

        // Build activities list dynamically
        const list = [];

        // Check if checked in today
        const todayStr = today.toISOString().split('T')[0];
        const todayLog = logs.find(l => l.date.startsWith(todayStr));
        if (todayLog && todayLog.checkIn) {
          list.push({
            title: 'Checked In',
            time: new Date(todayLog.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            description: 'You successfully checked in for the day.',
            type: 'success',
            date: new Date(todayLog.checkIn),
          });
        }

        // Add recent attendance check-ins from previous days
        logs.filter(l => !l.date.startsWith(todayStr) && l.checkIn).slice(0, 2).forEach(log => {
          list.push({
            title: 'Checked In',
            time: new Date(log.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            description: `Worked for ${log.workHours} hours. Check-in: ${new Date(log.checkIn!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            type: 'success',
            date: new Date(log.checkIn!),
          });
        });

        // Add leave request updates
        requests.slice(0, 2).forEach(req => {
          let reqType = 'info';
          if (req.status === 'approved') reqType = 'success';
          if (req.status === 'rejected') reqType = 'warning';

          list.push({
            title: `Leave ${req.status.charAt(0).toUpperCase() + req.status.slice(1)}`,
            time: new Date(req.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            description: `Your request for ${req.type.toUpperCase()} leave (${new Date(req.startDate).toLocaleDateString()} - ${new Date(req.endDate).toLocaleDateString()}) has been ${req.status}.`,
            type: reqType,
            date: new Date(req.startDate),
          });
        });

        // Sort by date desc
        list.sort((a, b) => b.date.getTime() - a.date.getTime());
        setActivities(list.slice(0, 4));

      } catch (err) {
        console.error('Failed to load employee dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    const handleGlobalUpdate = () => {
      fetchDashboardData();
    };
    window.addEventListener('attendance-update', handleGlobalUpdate);
    return () => {
      window.removeEventListener('attendance-update', handleGlobalUpdate);
    };
  }, []);

  const handleQuickAccessClick = (item: typeof quickAccess[0]) => {
    if (item.label === 'Logout') {
      logout();
      navigate('/signin');
    } else {
      navigate(item.path);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Good Morning, {user?.name.split(' ')[0]}</h1>
          <p className="text-slate-500 mt-1 font-medium">Here's what's happening today.</p>
        </div>
        <div className="p-2 bg-white rounded-2xl shadow-sm border border-gray-50">
           <Bell className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickAccess.map((item) => (
          <button
            key={item.label}
            onClick={() => handleQuickAccessClick(item)}
            className="group p-6 bg-white rounded-3xl border border-gray-50 hover:border-hrms-lime hover:shadow-xl hover:shadow-hrms-lime/10 transition-all text-left relative overflow-hidden"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", item.color)}>
              <item.icon className="w-6 h-6" />
            </div>
            <span className="font-bold text-slate-900 block">{item.label}</span>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
            <button onClick={() => navigate('/attendance')} className="text-sm font-bold text-hrms-text-secondary hover:text-black">View All</button>
          </div>
          <div className="bg-white rounded-3xl border border-gray-50 overflow-hidden shadow-sm min-h-[150px] flex flex-col justify-center">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-900"></div>
              </div>
            ) : activities.length > 0 ? (
              activities.map((activity, i) => (
                <div key={i} className={cn("p-6 flex gap-4 items-start", i !== activities.length - 1 && "border-b border-gray-50")}>
                  <div className={cn(
                    "mt-1.5 w-2 h-2 rounded-full flex-shrink-0",
                    activity.type === 'success' ? "bg-green-500" : 
                    activity.type === 'info' ? "bg-blue-500" : "bg-yellow-500"
                  )} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-slate-900 text-sm">{activity.title}</h4>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{activity.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{activity.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-400 text-sm font-medium py-8">No recent activity logs.</p>
            )}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">My Summary</h2>
          <div className="bg-black p-8 rounded-3xl text-white relative overflow-hidden shadow-xl shadow-slate-200">
             <div className="relative z-10">
               <div className="flex items-center gap-2 text-hrms-lime mb-4">
                 <TrendingUp className="w-4 h-4" />
                 <span className="text-[10px] font-bold uppercase tracking-widest">Attendance Rate</span>
               </div>
               <div className="text-4xl font-bold mb-1">{attendanceRate}</div>
               <p className="text-slate-400 text-sm font-medium">For the current month</p>
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-hrms-lime/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          </div>
          
          <div className="bg-hrms-lime/20 p-8 rounded-3xl border border-hrms-lime/30">
            <h3 className="text-slate-900 font-bold mb-1 text-sm">Upcoming Leave</h3>
            {upcomingLeave ? (
              <>
                <p className="text-slate-600 text-xs font-bold uppercase tracking-tight mb-4">{upcomingLeave.type} Leave</p>
                <div className="flex items-center justify-between">
                   <span className="text-sm font-bold text-slate-900">
                     {new Date(upcomingLeave.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} - {new Date(upcomingLeave.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                   </span>
                   <span className="px-3 py-1 bg-white/50 rounded-lg text-[9px] font-bold uppercase tracking-tighter text-green-700">Approved</span>
                </div>
              </>
            ) : (
              <p className="text-slate-500 text-xs font-semibold py-4">No upcoming leaves scheduled.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  React.useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await api.employees.list(searchTerm);
        setEmployees(data);
      } catch (err) {
        console.error('Failed to fetch employees:', err);
      }
    };
    fetchEmployees();
  }, [searchTerm]);

  const stats = [
    { label: 'Total Employees', value: employees.length.toString(), icon: Users, color: 'bg-hrms-blue text-blue-600' },
    { label: 'Present Today', value: employees.filter(e => e.status === 'present').length.toString(), icon: CheckCircle2, color: 'bg-hrms-green text-green-600' },
    { label: 'On Leave', value: employees.filter(e => e.status === 'leave').length.toString(), icon: Plane, color: 'bg-hrms-orange text-orange-600' },
    { label: 'Absent', value: employees.filter(e => e.status === 'absent').length.toString(), icon: AlertCircle, color: 'bg-hrms-purple text-purple-600' },
  ];

  const filteredEmployees = employees;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome, {user?.name.split(' ')[0]}</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage your workforce and operations.</p>
        </div>
        
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm w-full md:w-72 shadow-sm focus:outline-none focus:ring-2 focus:ring-hrms-lime transition-all"
          />
        </div>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Employee Directory</h2>
          <button className="text-sm font-bold text-hrms-text-secondary hover:text-black">Switch View</button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEmployees.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} onClick={() => navigate(`/profile/${employee.id}`)} />
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-slate-400 font-medium">No employees found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const EmployeeCard = ({ employee, onClick }: { employee: Employee; onClick: () => void }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-6 rounded-3xl border border-gray-50 hover:border-hrms-lime hover:shadow-xl hover:shadow-hrms-lime/10 transition-all cursor-pointer group relative overflow-hidden shadow-sm"
    >
      <div className="absolute top-4 right-4">
        <StatusIndicator status={employee.status} />
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-2xl bg-gray-50 mb-4 overflow-hidden border-2 border-transparent group-hover:border-hrms-lime transition-all group-hover:scale-105 shadow-inner">
          <img src={employee.profilePictureUrl ? `http://localhost:5000${employee.profilePictureUrl}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}`} alt={employee.name} className="w-full h-full object-cover" />
        </div>
        
        <h3 className="font-bold text-slate-900 group-hover:text-black transition-colors">{employee.name}</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{employee.role}</p>
        
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-lg uppercase tracking-tight">
            {employee.department || 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};

const StatusIndicator = ({ status }: { status: Employee['status'] }) => {
  switch (status) {
    case 'present':
      return <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-sm ring-4 ring-green-50" title="Present" />;
    case 'leave':
      return <div className="bg-blue-50 p-1.5 rounded-full ring-4 ring-blue-50" title="On Leave"><Plane className="w-3 h-3 text-blue-500" /></div>;
    case 'absent':
      return <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-white shadow-sm ring-4 ring-yellow-50" title="Absent" />;
    default:
      return null;
  }
};

export default Dashboard;
