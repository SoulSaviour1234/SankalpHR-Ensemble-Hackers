import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  Calendar, 
  LogOut,
  CreditCard
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { icon: Users, label: isAdmin ? 'Employees' : 'My Team', path: '/dashboard', adminOnly: true },
    { icon: Clock, label: 'Attendance', path: '/attendance' },
    { icon: Calendar, label: 'Time Off', path: '/timeoff' },
    { icon: CreditCard, label: 'Payroll', path: isAdmin ? '/payroll' : '/profile/me?tab=Salary' },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.label === 'Employees' && !isAdmin) return false;
    return true;
  });

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      <div className="px-4 py-6 w-full flex items-center justify-center">
        <img src="/Horizontal_logo_lockup.png" alt="HRMS Logo Lockup" className="w-full h-auto object-contain -ml-4 scale-110" />
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path.split('?')[0];
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-hrms-lime text-black shadow-sm"
                  : "text-hrms-text-secondary hover:bg-gray-50 hover:text-hrms-text-primary"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-50">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-gray-100 flex items-center justify-center font-bold text-slate-400 text-xs">
            <img 
              src={user?.profilePictureUrl ? `http://localhost:5000${user.profilePictureUrl}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}`} 
              alt="User" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-hrms-text-primary truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-hrms-text-secondary truncate capitalize">{user?.role || 'Role'}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-hrms-text-secondary hover:text-hrms-text-primary transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;