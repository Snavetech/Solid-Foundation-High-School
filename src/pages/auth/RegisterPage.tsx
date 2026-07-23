import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SCHOOL_INFO } from '../../services/mockData';
import { feeService } from '../../services/feeService';
import { UserRole } from '../../types/database';
import { UserCheck, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

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
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
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

    // Match found! Create guardian record & link
    setTimeout(() => {
      const guardian = feeService.addGuardian(fullName, phone, email, relationship);
      feeService.updateStudent(match.id, { guardian_id: guardian.id });

      const user = feeService.switchDemoUser('parent');
      setLoading(false);
      setSuccessMsg(`Successfully verified student ${match.full_name}! Account created.`);
      
      setTimeout(() => {
        onLoginSuccess('parent');
        navigate('/parent/dashboard');
      }, 1000);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500 text-white text-2xl font-extrabold shadow-lg shadow-amber-500/20 mb-2">
            {SCHOOL_INFO.logo}
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Parent Self-Registration
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Verify your ward's admission number to claim and manage fee payments.
          </p>
        </div>

        <div className="mt-6 bg-slate-900/90 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10">
          
          {successMsg ? (
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-white">Registration Verified!</h3>
              <p className="text-xs text-slate-300">{successMsg}</p>
              <p className="text-[11px] text-amber-400">Redirecting to Parent Dashboard...</p>
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
