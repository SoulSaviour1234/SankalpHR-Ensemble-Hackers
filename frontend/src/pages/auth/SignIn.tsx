import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, CheckCircle2, ChevronRight, AlertCircle, ShieldCheck, Briefcase } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';
import { api, setAuthToken, clearAuthSession } from '../../utils/api';

const SignIn: React.FC = () => {
  const [view, setView] = useState<'admin' | 'employee'>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await api.auth.signin({
        loginIdOrEmail: email,
        password: password
      });
      setAuthToken(res.token);
      login({
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role
      });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    }
  };

  const renderForm = () => (
    <div className="w-full max-w-md animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
          {view === 'admin' ? 'Admin Sign In' : 'Employee Sign In'}
        </h2>
        <p className="text-slate-500 font-medium">
          {view === 'admin' ? 'Manage your organization portal.' : 'Access your personal employee dashboard.'}
        </p>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
        <button
          onClick={() => { setView('admin'); setError(''); setEmail(''); setPassword(''); }}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all",
            view === 'admin' ? "bg-white text-black shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <ShieldCheck className={cn("w-4 h-4", view === 'admin' ? "text-hrms-lime" : "text-slate-400")} />
          ADMIN
        </button>
        <button
          onClick={() => { setView('employee'); setError(''); setEmail(''); setPassword(''); }}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all",
            view === 'employee' ? "bg-white text-black shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <Briefcase className={cn("w-4 h-4", view === 'employee' ? "text-hrms-blue" : "text-slate-400")} />
          EMPLOYEE
        </button>
      </div>

      <div className="mb-6">
        <p className="text-slate-500 font-medium text-sm">
          {view === 'admin' 
            ? 'Access the management console with your admin email.' 
            : 'Enter your system-assigned Login ID to access your profile.'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSignIn}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
              {view === 'admin' ? 'Work Email' : 'Login ID'}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-black transition-colors">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type={view === 'admin' ? 'email' : 'text'}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={view === 'admin' ? "admin@company.com" : "e.g. EMP001"}
                className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-hrms-lime focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2 ml-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <button type="button" className="text-[10px] font-bold text-hrms-text-secondary hover:text-black uppercase tracking-tighter">Forgot Password?</button>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-black transition-colors">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-hrms-lime focus:border-transparent transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-black"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-black text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-200 uppercase tracking-wider"
        >
          Sign In to Portal
          <ChevronRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-500 font-medium">
          Don't have an account?{' '}
          <Link to="/signup" className="text-black font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Left side - Information/Branding (Consistent with SignUp) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#F8FAFC] p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <img src="/102.jpeg" alt="HRMS Logo" className="w-12 h-12 object-contain" />
            <span className="text-2xl font-bold tracking-tight text-black">HRMS</span>
          </Link>

          <div className="max-w-md space-y-8">
            <h1 className="text-5xl font-bold leading-tight text-slate-900">
              Welcome back to <span className="text-hrms-text-secondary">Workforce</span> Central.
            </h1>
            <p className="text-lg text-slate-600 font-medium">
              Access your personalized dashboard, manage attendance, and stay connected with your team.
            </p>
            
            <div className="space-y-4 pt-4">
              {[
                "Secure multi-factor authentication",
                "Personalized employee dashboard",
                "Real-time attendance tracking",
                "Direct communication channels"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-hrms-lime flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-black" />
                  </div>
                  <span className="text-slate-700 font-bold text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-hrms-purple/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-hrms-lime/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex items-center gap-4 text-xs text-slate-400 font-bold tracking-widest uppercase">
          <span>Enterprise Grade</span>
          <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
          <span>Secure Infrastructure</span>
        </div>
      </div>

      {/* Right side - Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-white relative">
        {renderForm()}
      </div>
    </div>
  );
};

export default SignIn;
