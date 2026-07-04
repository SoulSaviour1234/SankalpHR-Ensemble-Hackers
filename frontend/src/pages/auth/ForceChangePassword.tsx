import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, ChevronRight, AlertCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../utils/api';

const ForceChangePassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    try {
      await api.auth.changePassword({ newPassword });
      setSuccess(true);
      
      // Update state and localStorage
      updateUser({ mustChangePassword: false });
      
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fbd4] to-[#f5f5f5] flex items-center justify-center p-8">
      <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-hrms-lime/20 rounded-full -mr-20 -mt-20 blur-2xl"></div>
        
        <div className="relative z-10 mb-8 text-center">
          <div className="w-16 h-16 bg-hrms-lime/30 text-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Change Password</h2>
          <p className="text-slate-500 font-medium text-sm leading-relaxed">
            Hi {user?.name.split(' ')[0]}, for security purposes, you are required to change your temporary password on your first sign in.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-xs font-semibold">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-600 animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p className="text-xs font-semibold">Password updated successfully! Redirecting...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">New Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-black transition-colors">
                  <Lock className="h-4 w-4" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-black transition-colors">
                  <Lock className="h-4 w-4" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-hrms-lime focus:border-transparent transition-all outline-none" 
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={success}
            className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-black text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-200 uppercase tracking-wider disabled:opacity-50"
          >
            Update and Proceed
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForceChangePassword;
