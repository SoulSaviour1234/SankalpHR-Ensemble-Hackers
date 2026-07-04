import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Clock, Calendar, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <Link to="/dashboard" className="flex ml-2 md:mr-24">
              <img src="/Horizontal_logo_lockup.png" alt="HRMS Logo Lockup" className="h-12 w-auto object-contain" />
            </Link>
            <div className="hidden md:flex space-x-8 ml-10">
              <Link to="/dashboard" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
                <Users className="w-5 h-5 mr-1" />
                <span>Employees</span>
              </Link>
              <Link to="/attendance" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
                <Clock className="w-5 h-5 mr-1" />
                <span>Attendance</span>
              </Link>
              <Link to="/timeoff" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
                <Calendar className="w-5 h-5 mr-1" />
                <span>Time Off</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center ml-3">
              <div>
                <button
                  type="button"
                  className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300"
                  id="user-menu-button"
                  aria-expanded="false"
                  data-dropdown-toggle="dropdown-user"
                  onClick={() => navigate('/profile/me')}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <User className="w-5 h-5" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
