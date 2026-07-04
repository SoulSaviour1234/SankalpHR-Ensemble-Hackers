import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Phone, User, Eye, EyeOff, CheckCircle2, ChevronRight, Briefcase, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';

type SignUpType = 'admin' | 'employee';

const SignUp: React.FC = () => {
  const [signUpType, setSignUpType] = useState<SignUpType>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAdminSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock signup
    login({
      id: 'admin-1',
      name: 'New Admin',
      email: 'admin@company.com',
      role: 'admin'
    });
    navigate('/dashboard');
  };

  const handleEmployeeSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock activation/signup
    login({
      id: 'emp-1',
      name: 'New Employee',
      email: 'employee@company.com',
      role: 'employee'
    });
    navigate('/dashboard');
  };

  const renderAdminForm = () => (
    <div className="max-w-md w-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Portal</h2>
        <p className="text-slate-500">Enter organizational and admin details to begin.</p>
      </div>

      {/* Role Switcher Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
        <button
          onClick={() => setSignUpType('admin')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all",
            signUpType === 'admin' ? "bg-white text-black shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <ShieldCheck className={cn("w-4 h-4", signUpType === 'admin' ? "text-hrms-lime" : "text-slate-400")} />
          ADMIN
        </button>
        <button
          onClick={() => setSignUpType('employee')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all",
            signUpType === 'employee' ? "bg-white text-black shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <Briefcase className={cn("w-4 h-4", signUpType === 'employee' ? "text-hrms-blue" : "text-slate-400")} />
          EMPLOYEE
        </button>
      </div>

      <form className="space-y-5" onSubmit={handleAdminSignUp}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Company Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-black transition-colors">
                  <Building2 className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ensemble Hackers Ltd."
                  className="block w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-hrms-lime focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-black transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Admin Name"
                  className="block w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-hrms-lime focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Work Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-black transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="admin@company.com"
                  className="block w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-hrms-lime focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Phone Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-black transition-colors">
                  <Phone className="h-5 w-5" />
                </div>
                <input
                  type="tel"
                  required
                  placeholder="+91 00000 00000"
                  className="block w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-hrms-lime focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Password</label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-hrms-lime focus:border-transparent transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-black"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Confirm</label>
              <div className="relative group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-hrms-lime focus:border-transparent transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-black"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-black text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-200"
        >
          CREATE PORTAL ACCOUNT
          <ChevronRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-500 font-medium">
          Already have an account?{' '}
          <Link to="/signin" className="text-black font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );

  const renderEmployeeForm = () => (
    <div className="max-w-md w-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">First Login?</h2>
        <p className="text-slate-500">Enter your system-generated credentials to activate your account.</p>
      </div>

      {/* Role Switcher Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
        <button
          onClick={() => setSignUpType('admin')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all",
            signUpType === 'admin' ? "bg-white text-black shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <ShieldCheck className={cn("w-4 h-4", signUpType === 'admin' ? "text-hrms-lime" : "text-slate-400")} />
          ADMIN
        </button>
        <button
          onClick={() => setSignUpType('employee')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all",
            signUpType === 'employee' ? "bg-white text-black shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <Briefcase className={cn("w-4 h-4", signUpType === 'employee' ? "text-hrms-blue" : "text-slate-400")} />
          EMPLOYEE
        </button>
      </div>

      <form className="space-y-6" onSubmit={handleEmployeeSignUp}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">System Login ID</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-black transition-colors">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <input
                type="text"
                required
                placeholder="Ex: ENJODO20240001"
                className="block w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-hrms-blue/50 focus:border-transparent transition-all outline-none"
              />
            </div>
            <p className="mt-2 text-[10px] text-slate-400 italic">Check your welcome email from HR for your unique Login ID.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Temporary Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-black transition-colors">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="block w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-hrms-blue/50 focus:border-transparent transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-black"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-hrms-blue text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all active:scale-[0.98] shadow-xl shadow-blue-100"
        >
          ACTIVATE ACCOUNT
          <ChevronRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-500 font-medium">
          Already have an account?{' '}
          <Link to="/signin" className="text-black font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Left side - Information/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#F8FAFC] p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <img src="/102.jpeg" alt="HRMS Logo" className="w-12 h-12 object-contain" />
            <span className="text-2xl font-bold tracking-tight text-black">HRMS</span>
          </div>

          <div className="max-w-md space-y-8">
            <h1 className="text-5xl font-bold leading-tight text-slate-900">
              Transform your <span className="text-hrms-text-secondary">HR Workflow</span> with intelligence.
            </h1>
            <p className="text-lg text-slate-600">
              {signUpType === 'employee' 
                ? "Join your organization's digital workspace and manage your professional growth."
                : "Set up your organization's portal in minutes and start managing your team more efficiently."}
            </p>
            
            <div className="space-y-4 pt-4">
              {[
                "Custom Login ID generation",
                "Automated payroll & salary components",
                "Advanced attendance tracking",
                "Integrated time-off workflows"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-hrms-lime flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-black" />
                  </div>
                  <span className="text-slate-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-hrms-purple/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-hrms-lime/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex items-center gap-4 text-sm text-slate-400 font-medium tracking-widest uppercase">
          <span>Enterprise Grade</span>
          <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
          <span>Secure Infrastructure</span>
        </div>
      </div>

      {/* Right side - Registration Form / Selection */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-white">
        {signUpType === 'admin' && renderAdminForm()}
        {signUpType === 'employee' && renderEmployeeForm()}
      </div>
    </div>
  );
};

export default SignUp;
