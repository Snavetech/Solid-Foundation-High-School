import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SCHOOL_INFO } from '../../services/mockData';
import { KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        <div className="text-center">
          <img
            src={SCHOOL_INFO.logo}
            alt="SFCHS Logo"
            className="w-16 h-16 object-contain rounded-2xl mx-auto shadow-xl bg-white p-1 border border-slate-800 mb-3"
          />
          <h2 className="text-xl font-bold text-white tracking-tight">
            Reset Password
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {SCHOOL_INFO.name} Bursary Portal
          </p>
        </div>

        <div className="mt-6 bg-slate-900 py-8 px-6 shadow-xl rounded-2xl border border-slate-800 sm:px-10">
          {submitted ? (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Reset Link Dispatched</h3>
              <p className="text-xs text-slate-400">
                If an account exists for <span className="text-slate-200 font-semibold">{email}</span>, a secure password reset link has been sent.
              </p>
              <div className="pt-2">
                <Link to="/login" className="text-xs text-blue-400 font-bold hover:underline inline-flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Account Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. parent@gmail.com"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition shadow-md"
              >
                Send Password Reset Email
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
