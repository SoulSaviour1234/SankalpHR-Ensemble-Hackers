import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, Eye, EyeOff, CheckCircle2, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';
import { api, setAuthToken } from '../../utils/api';

const SignUp: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await api.auth.signupEmployee({ name, email, password });
      setAuthToken(res.token);
      login({
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role
      });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  const renderForm = () => (
    <div className="max-w-md w-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
        <p className="text-slate-500">Join the organization portal to manage your HR profile.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSignUp}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Full Name</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-black transition-colors">
                <User className="h-5 w-5" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="block w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-hrms-lime focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Work Email</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-black transition-colors">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@company.com"
                className="block w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-hrms-lime focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Password</label>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-black text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-200"
        >
          CREATE ACCOUNT
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
    <div className="min-h-screen bg-gradient-to-br from-[#f0fbd4] to-[#f5f5f5] flex overflow-hidden">
      {/* Left side - Information/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-white/40 p-12 flex-col justify-between relative overflow-hidden backdrop-blur-sm border-r border-white/50">
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
              Join your organization's digital workspace and manage your professional growth.
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

      {/* Right side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-transparent">
        {renderForm()}
      </div>
    </div>
  );
};

export default SignUp;
