import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { SCHOOL_INFO } from '../../services/mockData';
import { feeService } from '../../services/feeService';
import { UserRole } from '../../types/database';
import { LogIn, ArrowRight, User, KeyRound, ShieldCheck, GraduationCap, Users, Lock } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (role: UserRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routeRole = searchParams.get('role') as UserRole | null;

  const [identifier, setIdentifier] = useState('bursary@solidfoundationhigh.edu.ng');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (routeRole === 'super_admin') {
      setIdentifier('admin@solidfoundationhigh.edu.ng');
      setPassword('password123');
    } else if (routeRole === 'bursar') {
      setIdentifier('bursary@solidfoundationhigh.edu.ng');
      setPassword('password123');
    } else if (routeRole === 'parent') {
      setIdentifier('patrick.chukwuma@gmail.com');
      setPassword('parent123');
    } else if (routeRole === 'student') {
      setIdentifier('SFHS/2026/001');
      setPassword('student123');
    }
  }, [routeRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const res = feeService.authenticateUser(identifier, password);
      setLoading(false);
      if (res.success) {
        onLoginSuccess(res.role);
        if (res.role === 'parent') {
          navigate('/parent/dashboard');
        } else if (res.role === 'student') {
          navigate('/student/dashboard');
        } else {
          navigate('/admin/dashboard');
        }
      } else {
        setError(res.message || 'Invalid credentials provided.');
      }
    }, 400);
  };

  const handleSelectPreset = (presetIdentifier: string, presetPass: string) => {
    setIdentifier(presetIdentifier);
    setPassword(presetPass);
  };

  return (
    <div className="min-h-screen bg-[#f0f3f9] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md mx-auto w-full space-y-6 relative z-10">
        
        {/* School Branding Header */}
        <div className="text-center space-y-2">
          <img
            src={SCHOOL_INFO.logo}
            alt="SFCHS Logo"
            className="w-20 h-20 object-contain rounded-2xl mx-auto shadow-xl bg-white p-1 border border-slate-100 mb-1"
          />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {SCHOOL_INFO.name}
          </h1>
          <p className="text-xs font-bold text-violet-600 italic">
            "{SCHOOL_INFO.motto}"
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
            {SCHOOL_INFO.address}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 space-y-5">
          
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <LogIn className="w-5 h-5 text-violet-600" />
              Portal Sign In
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Parents & Students enter your provided Email or Admission Number
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Email or Admission No */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Email Address or Admission Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:bg-white font-medium transition"
                  placeholder="e.g. SFHS/2026/001 or parent@gmail.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:bg-white font-medium transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl p-3 font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 transition"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          {/* Preset Demo Logins */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block text-center">
              Quick Demo Login Accounts
            </span>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => handleSelectPreset('SFHS/2026/001', 'student123')}
                className="p-2 rounded-xl bg-violet-50 text-violet-800 hover:bg-violet-100 transition flex items-center gap-1.5 justify-center border border-violet-200"
              >
                <GraduationCap className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                <span className="truncate">Student (SFHS/2026/001)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('patrick.chukwuma@gmail.com', 'parent123')}
                className="p-2 rounded-xl bg-indigo-50 text-indigo-800 hover:bg-indigo-100 transition flex items-center gap-1.5 justify-center border border-indigo-200"
              >
                <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">Parent (Email)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('bursary@solidfoundationhigh.edu.ng', 'password123')}
                className="p-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition flex items-center gap-1.5 justify-center border border-emerald-200"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Bursar Account</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('admin@solidfoundationhigh.edu.ng', 'password123')}
                className="p-2 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 transition flex items-center gap-1.5 justify-center border border-amber-200"
              >
                <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">Super Admin</span>
              </button>
            </div>
          </div>

          {/* Provision Notice */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-center text-[11px] text-slate-500 font-medium space-y-1">
            <div className="flex items-center justify-center gap-1 text-slate-700 font-bold">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              Official School Provisioning
            </div>
            <p>
              Student and parent accounts are provisioned upon admission by the School Bursary. Login credentials are automatically dispatched to the registered parent email address.
            </p>
          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 font-semibold">
          &copy; {new Date().getFullYear()} {SCHOOL_INFO.name} &bull; "Knowledge is Wealth"
        </p>

      </div>
    </div>
  );
};
