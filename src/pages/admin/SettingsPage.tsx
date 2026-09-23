import React, { useState, useEffect } from 'react';
import { SCHOOL_INFO } from '../../services/mockData';
import { feeService } from '../../services/feeService';
import { emailService, updateEmailJSConfig } from '../../services/emailService';
import { Settings, ShieldCheck, KeyRound, Lock, User, GraduationCap, Mail, Phone, CheckCircle2, AlertCircle, Building2, Download, RefreshCw, Database, Sparkles, Send, Copy, ExternalLink, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const currentUser = feeService.getCurrentUser();

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-white rounded-3xl border border-slate-100 shadow-xs">
        <p className="text-slate-500 font-bold">Please log in to view portal settings.</p>
      </div>
    );
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = feeService.changePassword(currentPassword, newPassword);
      setLoading(false);
      if (res.success) {
        setMessage({ type: 'success', text: res.message });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: res.message });
      }
    }, 400);
  };

  const isParent = currentUser.role === 'parent';
  const isStudent = currentUser.role === 'student';
  const isAdminOrBursar = currentUser.role === 'super_admin' || currentUser.role === 'bursar';
  const currentSchoolInfo = feeService.getSchoolInfo();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account & Portal Settings</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            {isAdminOrBursar
              ? 'Master branding details, security credentials, and technical backend infrastructure'
              : 'Manage your portal security, login credentials, and account password'}
          </p>
        </div>
        <div className="px-3.5 py-1.5 bg-violet-50 text-violet-700 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 border border-violet-200/60">
          <User className="w-4 h-4 text-violet-600" />
          <span className="capitalize">{currentUser.role.replace('_', ' ')} Account</span>
        </div>
      </div>

      {/* Role Profile Info Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-violet-500/20 shrink-0">
            {currentUser.full_name.charAt(0)}
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">{currentUser.full_name}</h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              {isStudent && (
                <>Admission Number: <span className="font-mono font-bold text-violet-700">{currentUser.admission_no || 'SFHS/2026/001'}</span></>
              )}
              {isParent && (
                <>Guardian Email: <span className="font-semibold text-slate-700">{currentUser.email || 'patrick.chukwuma@gmail.com'}</span></>
              )}
              {isAdminOrBursar && (
                <>{currentSchoolInfo.name} ({currentUser.role === 'super_admin' ? 'Super Administrator' : 'Head Bursar'})</>
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-100">
          {isStudent && (
            <>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">Student Login ID</span>
                <span className="font-mono font-black text-slate-900 text-sm">{currentUser.admission_no || 'SFHS/2026/001'}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">Provisioned Access</span>
                <span className="font-semibold text-slate-800">Added by Bursary Office</span>
              </div>
            </>
          )}

          {isParent && (
            <>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">Registered Guardian Email</span>
                <span className="font-semibold text-slate-900 text-xs">{currentUser.email || 'patrick.chukwuma@gmail.com'}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">Portal Access Type</span>
                <span className="font-semibold text-slate-800">Verified Guardian & Fee Sponsor</span>
              </div>
            </>
          )}

          {isAdminOrBursar && (
            <>
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">Campus Address</span>
                <span className="font-semibold text-slate-800">{currentSchoolInfo.address}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">Contact Info</span>
                <span className="font-semibold text-slate-800">{currentSchoolInfo.phone} | {currentSchoolInfo.email}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Super Admin Privileged Section: Branding Editor */}
      {currentUser.role === 'super_admin' && (
        <SchoolBrandingCard initialInfo={currentSchoolInfo} />
      )}

      {/* Super Admin Privileged Section: Bursar Account Management Card */}
      {currentUser.role === 'super_admin' && (() => {
        const bursar = feeService.getBursarProfile();
        return <BursarManagementCard initialBursar={bursar} />;
      })()}

      {/* Super Admin Privileged Section: EmailJS Credentials & Live Dispatch Test */}
      {currentUser.role === 'super_admin' && (
        <EmailConfigurationCard />
      )}

      {/* Super Admin Privileged Section: Database Backup & Factory Reset */}
      {currentUser.role === 'super_admin' && (
        <SystemBackupCard />
      )}

      {/* Live Cloud Database & Multi-Device Sync Card */}
      {currentUser.role === 'super_admin' && (
        <CloudDatabaseCard />
      )}

      {/* Change Password Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-violet-600" /> Change Account Password
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Update your security password to protect your portal account
            </p>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              CURRENT PASSWORD *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:bg-white"
              placeholder="Enter current password..."
            />
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Default initial password: <span className="font-mono font-bold text-slate-700">{isStudent ? 'student123' : isParent ? 'parent123' : 'password123'}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                NEW PASSWORD *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:bg-white"
                placeholder="Min 6 characters..."
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                CONFIRM NEW PASSWORD *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:bg-white"
                placeholder="Re-enter new password..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="py-3 px-5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-violet-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            <span>{loading ? 'Updating Password...' : 'Update Password'}</span>
          </button>
        </form>
      </div>

    </div>
  );
};

interface BursarCardProps {
  initialBursar: ReturnType<typeof feeService.getBursarProfile>;
}

const BursarManagementCard: React.FC<BursarCardProps> = ({ initialBursar }) => {
  const [bursarName, setBursarName] = useState(initialBursar.full_name);
  const [bursarEmail, setBursarEmail] = useState(initialBursar.email || 'bursary@solidfoundationhigh.edu.ng');
  const [bursarPhone, setBursarPhone] = useState(initialBursar.phone || '08059876543');
  const [bursarPassword, setBursarPassword] = useState(initialBursar.password || 'password123');

  const [bursarMsg, setBursarMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [bursarLoading, setBursarLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  const handleUpdateBursar = async (e: React.FormEvent) => {
    e.preventDefault();
    setBursarMsg(null);
    if (!bursarName.trim() || !bursarEmail.trim()) {
      setBursarMsg({ type: 'error', text: 'Bursar name and email address are required.' });
      return;
    }

    setBursarLoading(true);
    // 1. Update Bursar Profile in feeService and local storage
    const res = feeService.updateBursarProfile({
      full_name: bursarName,
      email: bursarEmail,
      phone: bursarPhone,
      password: bursarPassword
    });

    // 2. Dispatch real onboarding credentials email via EmailJS
    const emailRes = await emailService.sendBursarCredentialsEmail({
      full_name: bursarName,
      email: bursarEmail,
      phone: bursarPhone,
      password: bursarPassword
    });

    setBursarLoading(false);
    if (res.success) {
      if (emailRes.success) {
        setBursarMsg({
          type: 'success',
          text: `Bursar account registered successfully! Official login credentials dispatched to ${bursarEmail} via EmailJS.`
        });
      } else {
        setBursarMsg({
          type: 'error',
          text: `Bursar credentials saved, but real email dispatch failed: ${emailRes.error}. You can click "Resend Credentials Email" below to retry.`
        });
      }
    }
  };

  const handleResendCredentialsEmail = async () => {
    if (!bursarEmail.trim()) {
      setBursarMsg({ type: 'error', text: 'Please provide a valid Bursar email address.' });
      return;
    }

    setEmailSending(true);
    setBursarMsg(null);

    const emailRes = await emailService.sendBursarCredentialsEmail({
      full_name: bursarName,
      email: bursarEmail,
      phone: bursarPhone,
      password: bursarPassword
    });

    setEmailSending(false);
    if (emailRes.success) {
      setBursarMsg({
        type: 'success',
        text: `Official login credentials successfully dispatched to ${bursarEmail} via EmailJS!`
      });
    } else {
      setBursarMsg({
        type: 'error',
        text: `Failed to send email to ${bursarEmail}: ${emailRes.error}`
      });
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-5">
      <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" /> Bursary Staff & Account Registration
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Super Admin feature: Register, assign, and dispatch real login credentials to the Bursar via email
          </p>
        </div>
        <span className="self-start sm:self-auto px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-indigo-200/60">
          Super Admin Privileged
        </span>
      </div>

      {bursarMsg && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-start gap-2.5 border ${
          bursarMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {bursarMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed">{bursarMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleUpdateBursar} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              BURSAR FULL NAME *
            </label>
            <input
              type="text"
              required
              value={bursarName}
              onChange={(e) => setBursarName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/30 focus:bg-white"
              placeholder="e.g. Mrs. Grace Nwosu"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              BURSAR EMAIL ADDRESS (LOGIN ID) *
            </label>
            <input
              type="email"
              required
              value={bursarEmail}
              onChange={(e) => setBursarEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/30 focus:bg-white"
              placeholder="e.g. bursary@solidfoundationhigh.edu.ng"
            />
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Real welcome email with password will be sent here</p>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              PHONE NUMBER
            </label>
            <input
              type="text"
              value={bursarPhone}
              onChange={(e) => setBursarPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/30 focus:bg-white"
              placeholder="e.g. 08059876543"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              BURSAR LOGIN PASSWORD
            </label>
            <input
              type="text"
              required
              value={bursarPassword}
              onChange={(e) => setBursarPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/30 focus:bg-white"
              placeholder="Default: password123"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={bursarLoading || emailSending}
            className="py-3 px-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{bursarLoading ? 'Registering & Dispatching Email...' : 'Save & Send Bursar Email'}</span>
          </button>

          <button
            type="button"
            onClick={handleResendCredentialsEmail}
            disabled={bursarLoading || emailSending}
            className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-indigo-600" />
            <span>{emailSending ? 'Sending Real Email...' : 'Resend Credentials Email'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

/* EmailJS Credentials & Live Test Card for Super Admin */
const EmailConfigurationCard: React.FC = () => {
  const currentConfig = emailService.getConfig();
  const [serviceId, setServiceId] = useState(currentConfig.serviceId);
  const [templateId, setTemplateId] = useState(currentConfig.templateId);
  const [publicKey, setPublicKey] = useState(currentConfig.publicKey);

  const [testEmail, setTestEmail] = useState('skygraphics45@gmail.com');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; text: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmailJSConfig(serviceId, templateId, publicKey);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handleSendTest = async () => {
    if (!testEmail.trim()) return;
    setTesting(true);
    setTestResult(null);

    // Save active config first so test uses it immediately
    updateEmailJSConfig(serviceId, templateId, publicKey);

    const res = await emailService.sendTestEmail(testEmail.trim());
    setTesting(false);
    if (res.success) {
      setTestResult({
        success: true,
        text: `Email dispatched successfully! Please check your inbox at ${testEmail} (and Spam/Junk folder).`
      });
    } else {
      setTestResult({
        success: false,
        text: `EmailJS Error: ${res.error}`
      });
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-5">
      <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" /> EmailJS Configuration & Live Test
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Real-time credentials management and instant email delivery diagnostic tester
          </p>
        </div>
        <span className="self-start sm:self-auto px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-indigo-200/60">
          Super Admin Privileged
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-700 mb-1 font-bold">SERVICE ID *</label>
            <input
              type="text"
              required
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-indigo-500/30"
              placeholder="e.g. service_9whclxh"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-bold">TEMPLATE ID *</label>
            <input
              type="text"
              required
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-indigo-500/30"
              placeholder="e.g. template_xxxxxxx"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-bold">PUBLIC KEY *</label>
            <input
              type="text"
              required
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-indigo-500/30"
              placeholder="e.g. w7Cte7CcydMY36F8M"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl transition shadow-xs flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Save Email Credentials</span>
          </button>
          {saveSuccess && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Saved successfully! Active across all registrations.
            </span>
          )}
        </div>
      </form>

      {/* Live Email Test Box */}
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Send className="w-4 h-4 text-indigo-600" /> Live Email Delivery Diagnostic
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">Test template validity instantly</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter destination email e.g. skygraphics45@gmail.com"
            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={handleSendTest}
            disabled={testing || !testEmail.trim()}
            className="py-2 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0"
          >
            {testing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Dispatching Test...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send Test Email</span>
              </>
            )}
          </button>
        </div>

        {testResult && (
          <div className={`p-3 rounded-xl text-xs font-bold border flex items-start gap-2 ${
            testResult.success
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{testResult.text}</span>
          </div>
        )}
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900 space-y-1">
        <div className="font-bold flex items-center gap-1 text-amber-950">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          Where to find your Template ID:
        </div>
        <p>
          Visit <a href="https://dashboard.emailjs.com/admin/templates" target="_blank" rel="noreferrer" className="font-bold underline text-indigo-700">https://dashboard.emailjs.com/admin/templates</a>. Your Template ID is displayed directly under your template's title (e.g., <code className="font-mono bg-amber-100/80 px-1 py-0.5 rounded font-bold">template_xxxxxxx</code>). If you recently created or renamed your template, copy and paste its ID above, click <strong>Save Email Credentials</strong>, and test with <strong>Send Test Email</strong>.
        </p>
      </div>
    </div>
  );
};

/* School Branding Editor Card for Super Admin */
const SchoolBrandingCard: React.FC<{ initialInfo: typeof SCHOOL_INFO }> = ({ initialInfo }) => {
  const [name, setName] = useState(initialInfo.name);
  const [motto, setMotto] = useState(initialInfo.motto);
  const [address, setAddress] = useState(initialInfo.address);
  const [phone, setPhone] = useState(initialInfo.phone);
  const [email, setEmail] = useState(initialInfo.email);
  const [logo, setLogo] = useState(initialInfo.logo);

  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    setTimeout(() => {
      feeService.updateSchoolInfo({ name, motto, address, phone, email, logo });
      setSaving(false);
      setMsg({ type: 'success', text: 'School branding and contact details updated successfully. Changes applied system-wide.' });
    }, 400);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-5">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-violet-600" /> School Branding & Contact Info
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Super Admin feature: Edit official school name, motto, address, and logo URL rendered on receipts
          </p>
        </div>
        <span className="px-3 py-1 bg-violet-50 text-violet-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-violet-200/60">
          Branding Control
        </span>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
          msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      <form onSubmit={handleSaveBranding} className="space-y-4 max-w-3xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 mb-1">SCHOOL NAME *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-violet-500/30"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1">MOTTO / SLOGAN *</label>
            <input
              type="text"
              required
              value={motto}
              onChange={(e) => setMotto(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-violet-500/30"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1">BURSARY CONTACT EMAIL *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-violet-500/30"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1">BURSARY PHONE NUMBER *</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-violet-500/30"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-700 mb-1">CAMPUS ADDRESS *</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-violet-500/30"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="py-3 px-5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center gap-2"
        >
          <Building2 className="w-4 h-4" />
          <span>{saving ? 'Updating Branding...' : 'Save School Branding'}</span>
        </button>
      </form>
    </div>
  );
};

/* Database Backup & Factory Reset Card for Super Admin */
const SystemBackupCard: React.FC = () => {
  const [downloading, setDownloading] = useState(false);

  const handleExportBackup = () => {
    setDownloading(true);
    setTimeout(() => {
      const jsonStr = feeService.exportSystemBackup();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SFHS_System_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloading(false);
    }, 400);
  };

  const handleResetDefaults = () => {
    if (window.confirm("CAUTION: Are you sure you want to reset all portal data to factory defaults? This action will clear custom payments and restore initial mock records.")) {
      feeService.resetToFactoryDefaults();
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-5">
      <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-600" /> Database Backup & Emergency Controls
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Super Admin feature: Export full portal database JSON backups or restore factory defaults
          </p>
        </div>
        <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-amber-200/60 w-fit">
          Data Management
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
          <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
            <Download className="w-4 h-4 text-indigo-600" /> Export System Backup (JSON)
          </h4>
          <p className="text-[11px] text-slate-500 leading-tight font-medium">
            Download a full JSON archive containing all profiles, students, guardians, payment ledgers, and digital receipts.
          </p>
          <button
            type="button"
            onClick={handleExportBackup}
            disabled={downloading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Generating JSON...' : 'Export Backup File'}</span>
          </button>
        </div>

        <div className="p-4 bg-rose-50/50 border border-rose-200/80 rounded-2xl space-y-2">
          <h4 className="font-extrabold text-rose-900 text-xs flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4 text-rose-600" /> Reset to Factory Defaults
          </h4>
          <p className="text-[11px] text-rose-700 leading-tight font-medium">
            Resets portal local storage back to clean initial mock dataset for testing or a fresh academic year.
          </p>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restore Factory Defaults</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* Live Cloud Database & Multi-Device Sync Card */
const SUPABASE_MIGRATION_SQL = `-- ==============================================================================
-- SOLID FOUNDATION HIGH SCHOOL: DEFINITIVE CLOUD DATABASE FIX & REALTIME SYNC
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vufmlngnsrtyaaalnqor/sql/new
-- ==============================================================================

-- 1. DROP EXISTING TABLES & CONSTRAINTS CLEANLY
-- Drops old tables with UUID columns and dummy seed data
DROP TABLE IF EXISTS receipts CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS fee_structures CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS guardians CASCADE;
DROP TABLE IF EXISTS session_terms CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. CREATE CLEAN TABLES WITH TEXT PRIMARY KEYS & COMPATIBLE STRING IDs
CREATE TABLE classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  arm TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE session_terms (
  id TEXT PRIMARY KEY,
  session TEXT NOT NULL,
  term TEXT NOT NULL,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE guardians (
  id TEXT PRIMARY KEY,
  profile_id TEXT,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  relationship TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE students (
  id TEXT PRIMARY KEY,
  admission_no TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  class_id TEXT,
  guardian_id TEXT,
  status TEXT DEFAULT 'active',
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fee_structures (
  id TEXT PRIMARY KEY,
  class_id TEXT,
  session_term_id TEXT,
  fee_item TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  is_compulsory BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  fee_structure_id TEXT,
  amount NUMERIC NOT NULL,
  method TEXT NOT NULL,
  reference TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'success',
  recorded_by TEXT,
  paid_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE receipts (
  id TEXT PRIMARY KEY,
  payment_id TEXT NOT NULL,
  receipt_no TEXT UNIQUE NOT NULL,
  pdf_url TEXT,
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  admission_no TEXT,
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PERMISSIVE ROW LEVEL SECURITY POLICIES (ALLOW ANON CLIENT READ & WRITE)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read/write profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write classes" ON classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write session_terms" ON session_terms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write guardians" ON guardians FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write students" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write fee_structures" ON fee_structures FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write payments" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write receipts" ON receipts FOR ALL USING (true) WITH CHECK (true);

-- 4. ENABLE REALTIME WEBSOCKET BROADCASTING ACROSS ALL DEVICES
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE students; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE guardians; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE payments; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE receipts; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE classes; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE session_terms; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE fee_structures; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE profiles; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

ALTER TABLE students REPLICA IDENTITY FULL;
ALTER TABLE guardians REPLICA IDENTITY FULL;
ALTER TABLE payments REPLICA IDENTITY FULL;
ALTER TABLE receipts REPLICA IDENTITY FULL;
ALTER TABLE classes REPLICA IDENTITY FULL;
ALTER TABLE session_terms REPLICA IDENTITY FULL;
ALTER TABLE fee_structures REPLICA IDENTITY FULL;
ALTER TABLE profiles REPLICA IDENTITY FULL;`;

const CloudDatabaseCard: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState(feeService.getSyncStatus());
  const [cloudStats, setCloudStats] = useState(feeService.getCloudStats());
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showSqlDrawer, setShowSqlDrawer] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    const unsub = feeService.subscribe(() => {
      setSyncStatus(feeService.getSyncStatus());
      setCloudStats(feeService.getCloudStats());
    });
    return () => unsub();
  }, []);

  const handlePullNow = async () => {
    setIsSyncing(true);
    setFeedback(null);
    try {
      await feeService.pullCloudData(true);
      setFeedback({ type: 'success', text: 'Cloud records synchronized successfully with this computer.' });
    } catch (e: any) {
      setFeedback({ type: 'error', text: `Sync issue: ${e?.message || 'Connection delayed'}` });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handlePushToCloud = async () => {
    if (!window.confirm("Upload all local records (students, classes, guardians, payments) to Supabase cloud? This ensures all other computers and devices receive all registered students.")) {
      return;
    }
    setIsUploading(true);
    setFeedback(null);
    try {
      const res = await feeService.pushLocalDataToCloud();
      if (res.success) {
        setFeedback({ type: 'success', text: res.message });
      } else {
        setFeedback({ type: 'error', text: res.message });
      }
    } catch (e: any) {
      setFeedback({ type: 'error', text: `Upload failed: ${e?.message || 'Error uploading records'}` });
    } finally {
      setIsUploading(false);
      setTimeout(() => setFeedback(null), 7000);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_MIGRATION_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'Not configured';
  const hasDiscrepancy = cloudStats.cloudStudents !== null && cloudStats.cloudStudents < cloudStats.localStudents;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-6">
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" /> Multi-Device Cloud Persistence & Realtime Sync
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Automatic multi-device synchronization across Bursar and Super Admin computers via Supabase PostgreSQL & WebSockets
          </p>
        </div>
        <div className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full border flex items-center gap-1.5 w-fit ${
          syncStatus.status === 'synced' && !hasDiscrepancy
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
            : hasDiscrepancy
            ? 'bg-amber-50 text-amber-700 border-amber-200/60'
            : syncStatus.status === 'syncing'
            ? 'bg-indigo-50 text-indigo-700 border-indigo-200/60'
            : 'bg-rose-50 text-rose-700 border-rose-200/60'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            syncStatus.status === 'synced' && !hasDiscrepancy
              ? 'bg-emerald-500 animate-pulse'
              : hasDiscrepancy
              ? 'bg-amber-500'
              : syncStatus.status === 'syncing'
              ? 'bg-indigo-500 animate-ping'
              : 'bg-rose-500'
          }`} />
          <span>
            {syncStatus.status === 'synced' && !hasDiscrepancy
              ? 'Realtime Synced'
              : hasDiscrepancy
              ? 'Unsynced Local Data'
              : syncStatus.status === 'syncing'
              ? 'Syncing...'
              : 'Cloud Connection Issue'}
          </span>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 border ${
          feedback.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Sync Status Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
          <span className="font-bold text-slate-400 uppercase text-[10px] block">Local Students (This Device)</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{cloudStats.localStudents}</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Stored in local browser cache</span>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
          <span className="font-bold text-slate-400 uppercase text-[10px] block">Cloud Students (Supabase)</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            {cloudStats.cloudStudents !== null ? cloudStats.cloudStudents : 'Checking...'}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Available to other devices & computers</span>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
          <span className="font-bold text-slate-400 uppercase text-[10px] block">Cross-Device Status</span>
          <span className={`text-sm font-extrabold mt-1.5 block ${
            hasDiscrepancy ? 'text-amber-600' : 'text-emerald-600'
          }`}>
            {hasDiscrepancy ? 'Needs Cloud Upload' : 'Fully Synchronized'}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {hasDiscrepancy
              ? `${cloudStats.localStudents - (cloudStats.cloudStudents || 0)} local record(s) pending upload`
              : 'All devices see identical records'}
          </span>
        </div>
      </div>

      {/* Discrepancy Action Banner */}
      {hasDiscrepancy && (
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-amber-900">Synchronize Registered Students Across Devices</p>
              <p className="text-amber-700 text-[11px] mt-0.5">
                This computer has {cloudStats.localStudents} students while the cloud database currently has {cloudStats.cloudStudents}.
                Click &ldquo;Push All Records to Cloud&rdquo; to propagate all {cloudStats.localStudents} students to every other device.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handlePushToCloud}
            disabled={isUploading}
            className="py-2 px-3.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-xl shadow-xs transition shrink-0 flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Uploading...' : 'Push to Cloud Now'}</span>
          </button>
        </div>
      )}

      {/* Error Message Alert */}
      {syncStatus.errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-extrabold block">Supabase Sync Notice:</span>
            <span className="font-mono text-[11px]">{syncStatus.errorMessage}</span>
            {syncStatus.errorMessage.includes('uuid') && (
              <p className="text-[11px] text-rose-700 font-semibold mt-1">
                Your Supabase tables currently enforce UUID primary keys instead of TEXT strings. Please run the SQL Migration below in your Supabase SQL Editor to enable full string ID cross-device sync.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="button"
          onClick={handlePushToCloud}
          disabled={isUploading}
          className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
        >
          <Database className={`w-3.5 h-3.5 ${isUploading ? 'animate-pulse' : ''}`} />
          <span>{isUploading ? 'Uploading Records...' : `Push All Records to Cloud (${cloudStats.localStudents} Students)`}</span>
        </button>

        <button
          type="button"
          onClick={handlePullNow}
          disabled={isSyncing}
          className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Refreshing...' : 'Pull Latest from Cloud'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowSqlDrawer(!showSqlDrawer)}
          className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl transition flex items-center gap-2"
        >
          <KeyRound className="w-3.5 h-3.5 text-slate-500" />
          <span>Supabase SQL Migration Script</span>
          {showSqlDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Collapsible Supabase SQL Drawer */}
      {showSqlDrawer && (
        <div className="p-5 bg-slate-900 text-slate-100 rounded-2xl space-y-4 text-xs border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" /> Supabase Database Schema Migration
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Run this one-time SQL script in your Supabase SQL Editor to allow text primary keys and enable live WebSocket cross-device sync.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://supabase.com/dashboard/project/vufmlngnsrtyaaalnqor/sql/new"
                target="_blank"
                rel="noreferrer"
                className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition"
              >
                <span>Open SQL Editor</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                type="button"
                onClick={handleCopySql}
                className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition shadow-xs"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedSql ? 'SQL Copied!' : 'Copy Migration SQL'}</span>
              </button>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto font-mono text-[11px] bg-slate-950 p-4 rounded-xl text-slate-300 border border-slate-800/80 leading-relaxed whitespace-pre-wrap select-all">
            {SUPABASE_MIGRATION_SQL}
          </div>
        </div>
      )}
    </div>
  );
};
