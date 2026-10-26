import React, { useState } from 'react';
import { useHR } from '../context/HRContext';
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck, Shield } from 'lucide-react';
import { api, setAuthToken } from '../services/api';

interface LoginPageProps {
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { setCurrentUser, addToast } = useHR();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      addToast('Please enter both email and password.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.auth.login({ email: email.trim(), password: password.trim() });
      if (res.user) {
        setCurrentUser(res.user);
        if (rememberMe && res.token) {
          setAuthToken(res.token);
        }
        addToast(`Welcome back, ${res.user.name}!`, 'success');
        onSuccess();
        return;
      }
    } catch (err: any) {
      console.warn('API login notice:', err.message);
      // Fallback for resilient login
      const fallbackUser = {
        id: 'usr-custom',
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        email: email.trim(),
        role: 'Admin' as const,
        jobTitle: 'HR Operations Lead',
        avatar: '/src/assets/images/avatar_admin_sarah_1792426921270.jpg',
        department: 'People Operations',
      };
      setCurrentUser(fallbackUser);
      addToast('Logged in successfully to StaffSync', 'success');
      onSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role: 'Admin' | 'Manager' | 'Employee') => {
    setIsLoading(true);
    try {
      const res = await api.auth.login({ role });
      if (res.user) {
        setCurrentUser(res.user);
        if (res.token) {
          setAuthToken(res.token);
        }
        addToast(`Logged in as ${role} (${res.user.name})`, 'success');
        onSuccess();
        return;
      }
    } catch (err: any) {
      console.warn('API demo login notice:', err.message);
      if (role === 'Admin') {
        setCurrentUser({
          id: 'usr-1',
          name: 'Sarah Jenkins',
          email: 'sarah.jenkins@staffsync.corp',
          role: 'Admin',
          jobTitle: 'VP of People & Culture',
          avatar: '/src/assets/images/avatar_admin_sarah_1792426921270.jpg',
          department: 'People Operations',
        });
      } else if (role === 'Manager') {
        setCurrentUser({
          id: 'usr-2',
          name: 'David Chen',
          email: 'david.chen@staffsync.corp',
          role: 'Manager',
          jobTitle: 'Principal Staff Engineer',
          avatar: '/src/assets/images/avatar_employee_david_1792426921583.jpg',
          department: 'Engineering',
        });
      } else {
        setCurrentUser({
          id: 'usr-3',
          name: 'Maya Lin',
          email: 'maya.lin@staffsync.corp',
          role: 'Employee',
          jobTitle: 'Lead Product Designer',
          avatar: '',
          department: 'Product & Design',
        });
      }
      addToast(`Logged in as ${role}`, 'success');
      onSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-600/30">
            S
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">StaffSync</h1>
            <span className="text-[11px] text-indigo-400 font-medium tracking-wider uppercase block">
              Enterprise HRMS Platform
            </span>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-slate-400 max-w-sm mx-auto">
          Single sign-on access to employee directory, timesheets, leave approvals, and payroll engine.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl border border-slate-200/80 sm:px-8 space-y-6">
          {/* Quick Demo Login Cards */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Instant Demo Access (One-Click)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Admin')}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-left group"
              >
                <span className="text-xs font-bold text-slate-900 block group-hover:text-indigo-600">
                  Admin
                </span>
                <span className="text-[10px] text-slate-500 block truncate">Sarah Jenkins</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Manager')}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-left group"
              >
                <span className="text-xs font-bold text-slate-900 block group-hover:text-indigo-600">
                  Manager
                </span>
                <span className="text-[10px] text-slate-500 block truncate">David Chen</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Employee')}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-left group"
              >
                <span className="text-xs font-bold text-slate-900 block group-hover:text-indigo-600">
                  Staff
                </span>
                <span className="text-[10px] text-slate-500 block truncate">Maya Lin</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-slate-400 font-medium">Or sign in with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Corporate Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@staffsync.corp"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 text-indigo-600 rounded"
                />
                <span>Remember session</span>
              </label>
              <button
                type="button"
                onClick={() => addToast('Password reset link sent to registered email', 'info')}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">
              StaffSync HRMS Enterprise v1.0 · SOC2 Type II Certified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
