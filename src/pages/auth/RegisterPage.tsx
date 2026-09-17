import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SCHOOL_INFO } from '../../services/mockData';
import { feeService } from '../../services/feeService';
import { UserRole } from '../../types/database';
import { UserCheck, ArrowRight, ArrowLeft, CheckCircle2, Mail, ShieldCheck, Key } from 'lucide-react';
import emailjs from '@emailjs/browser';

interface RegisterPageProps {
  onLoginSuccess: (role: UserRole) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [admissionNo, setAdmissionNo] = useState('');
  const [surname, setSurname] = useState('');
  const [relationship, setRelationship] = useState('Father');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'sent' | 'fallback' | 'error' | null>(null);
  const [registeredInfo, setRegisteredInfo] = useState<{
    fullName: string;
    email: string;
    studentName: string;
    admissionNo: string;
  } | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check student match in feeService
    const students = feeService.getStudents();
    const match = students.find(
      s => s.admission_no.trim().toLowerCase() === admissionNo.trim().toLowerCase() &&
           s.full_name.toLowerCase().includes(surname.trim().toLowerCase())
    );

    if (!match) {
      setTimeout(() => {
        setLoading(false);
        setError(`No active student found matching Admission No "${admissionNo}" and surname "${surname}". Please check details or contact the Bursary.`);
      }, 500);
      return;
    }

    // Match found! Create guardian record & link in bursary database
    const guardian = feeService.addGuardian(
      fullName,
      phone,
      email,
      relationship,
      match.full_name,
      match.admission_no
    );
    feeService.updateStudent(match.id, { guardian_id: guardian.id });

    // Send Real Email via EmailJS using environment keys
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (serviceId && templateId && publicKey) {
      try {
        const res = await emailjs.send(
          serviceId,
          templateId,
          {
            to_email: email.trim(),
            email: email.trim(),
            user_email: email.trim(),
            recipient_email: email.trim(),
            parent_name: fullName.trim(),
            name: fullName.trim(),
            student_name: match.full_name,
            admission_no: match.admission_no,
            default_password: 'parent123',
            portal_url: window.location.origin + '/login',
            login_url: window.location.origin + '/login'
          },
          publicKey
        );
        console.log('EmailJS response:', res.status, res.text);
        setEmailStatus('sent');
      } catch (emailErr: any) {
        console.warn('Real email dispatch failed:', emailErr);
        setEmailStatus('error');
      }
    } else {
      setEmailStatus('fallback');
    }

    feeService.switchDemoUser('parent');
    setLoading(false);
    setRegisteredInfo({
      fullName,
      email,
      studentName: match.full_name,
      admissionNo: match.admission_no
    });
  };

  const handleProceedToDashboard = () => {
    onLoginSuccess('parent');
    navigate('/parent/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg shadow-amber-500/10 mb-3 p-2">
            <img src={SCHOOL_INFO.logo} alt="SFCHS Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Parent Self-Registration
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Verify your ward's admission number to claim and manage fee payments.
          </p>
        </div>

        <div className="mt-6 bg-slate-900/90 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10">
          
          {registeredInfo ? (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <Mail className="w-7 h-7 animate-pulse" />
                </div>
                <h3 className="text-lg font-black text-white">Registration Verified!</h3>
                <p className="text-xs text-slate-300">
                  Account verified for ward <span className="text-amber-400 font-bold">{registeredInfo.studentName}</span> ({registeredInfo.admissionNo}).
                </p>
              </div>

              {/* Email Envelope / Status Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px]">
                  <span className="text-slate-400 font-semibold">Delivery Status:</span>
                  {emailStatus === 'sent' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Sent to Inbox (EmailJS)
                    </span>
                  ) : emailStatus === 'error' ? (
                    <span className="inline-flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Stored in Portal Mailbox
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched to Mailbox
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recipient Email:</span>
                    <span className="text-white font-medium">{registeredInfo.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Portal Login:</span>
                    <span className="text-amber-400 font-mono font-bold">{registeredInfo.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Default Password:</span>
                    <span className="text-emerald-400 font-mono font-bold">parent123</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-900/40 text-[11px] text-indigo-300 flex items-start gap-2">
                  <Mail className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
                  <span>
                    {emailStatus === 'sent'
                      ? `A real email has been sent to ${registeredInfo.email} and also saved in your Portal Mailbox.`
                      : 'A copy of your credentials has been stored in your Portal Mailbox (top navigation bar).'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceedToDashboard}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-600/25 transition"
              >
                Proceed to Parent Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleRegister}>
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Parent/Guardian Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g. Engr. Patrick Chukwuma"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="parent@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="08012345678"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-950/30 border border-amber-900/50 rounded-xl space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <UserCheck className="w-4 h-4" /> Ward Verification Info
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Student Admission Number
                  </label>
                  <input
                    type="text"
                    required
                    value={admissionNo}
                    onChange={(e) => setAdmissionNo(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. SFHS/2023/042"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Student Surname
                  </label>
                  <input
                    type="text"
                    required
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. Chukwuma"
                  />
                </div>
              </div>

              {error && (
                <div className="text-xs text-red-400 bg-red-950/50 border border-red-900/60 rounded-xl p-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-600/25 transition"
              >
                {loading ? 'Verifying Student Record...' : 'Verify Ward & Register'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800 pt-4">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-amber-400 hover:text-amber-300 flex items-center justify-center gap-1 mt-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
