import React, { useState } from 'react';
import { SCHOOL_INFO } from '../../services/mockData';
import { feeService } from '../../services/feeService';
import { Settings, ShieldCheck, KeyRound, Lock, User, GraduationCap, Mail, Phone, CheckCircle2, AlertCircle, Building2, Download, RefreshCw, Database, Sparkles } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const currentUser = feeService.getCurrentUser();

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

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

  const handleUpdateBursar = (e: React.FormEvent) => {
    e.preventDefault();
    setBursarMsg(null);
    if (!bursarName.trim() || !bursarEmail.trim()) {
      setBursarMsg({ type: 'error', text: 'Bursar name and email address are required.' });
      return;
    }

    setBursarLoading(true);
    setTimeout(() => {
      const res = feeService.updateBursarProfile({
        full_name: bursarName,
        email: bursarEmail,
        phone: bursarPhone,
        password: bursarPassword
      });
      setBursarLoading(false);
      if (res.success) {
        setBursarMsg({ type: 'success', text: res.message });
      }
    }, 400);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-5">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" /> Bursary Staff & Account Management
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Super Admin feature: Assign, update, or change the Bursar's profile and login credentials
          </p>
        </div>
        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-indigo-200/60">
          Super Admin Privileged
        </span>
      </div>

      {bursarMsg && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
          bursarMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {bursarMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{bursarMsg.text}</span>
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

        <button
          type="submit"
          disabled={bursarLoading}
          className="py-3 px-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{bursarLoading ? 'Saving Bursar Credentials...' : 'Save Bursar Credentials'}</span>
        </button>
      </form>
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
const CloudDatabaseCard: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState(feeService.getSyncStatus());
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const unsub = feeService.subscribe(() => {
      setSyncStatus(feeService.getSyncStatus());
    });
    return () => unsub();
  }, []);

  const handlePullNow = async () => {
    setIsSyncing(true);
    setFeedback(null);
    try {
      await feeService.pullCloudData(true);
      setFeedback('Cloud records synced with this computer.');
    } catch (e: any) {
      setFeedback(`Sync issue: ${e?.message || 'Connection delayed'}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleSeedCloud = async () => {
    if (!window.confirm("Upload current local data to Supabase cloud? This will ensure other computers receive all current classes, students, and payment records.")) {
      return;
    }
    setIsUploading(true);
    setFeedback(null);
    try {
      await feeService.seedCloudDatabase();
      setFeedback('Current database successfully pushed to Supabase cloud!');
    } catch (e: any) {
      setFeedback(`Upload failed: ${e?.message || 'Error uploading records'}`);
    } finally {
      setIsUploading(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'Not configured';

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-5">
      <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" /> Multi-Device Cloud Persistence & Live Sync
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Real-time synchronization across Bursar and Super Admin computers via Supabase PostgreSQL & WebSockets
          </p>
        </div>
        <div className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border flex items-center gap-1.5 w-fit ${
          syncStatus.status === 'synced'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
            : syncStatus.status === 'syncing'
            ? 'bg-indigo-50 text-indigo-700 border-indigo-200/60'
            : 'bg-amber-50 text-amber-700 border-amber-200/60'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            syncStatus.status === 'synced' ? 'bg-emerald-500 animate-pulse' : syncStatus.status === 'syncing' ? 'bg-indigo-500 animate-ping' : 'bg-amber-500'
          }`} />
          <span>{syncStatus.status === 'synced' ? 'Active Realtime Sync' : syncStatus.status === 'syncing' ? 'Syncing...' : 'Local Cache Active'}</span>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs font-bold text-indigo-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="space-y-3 text-xs">
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold text-slate-500 uppercase text-[10px] block">Connected Database</span>
              <span className="font-mono font-bold text-slate-900 text-xs">{supabaseUrl}</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Changes made by Bursar or Super Admin propagate automatically in real-time.
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handlePullNow}
            disabled={isSyncing}
            className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Refreshing...' : 'Sync Cloud Now'}</span>
          </button>

          <button
            type="button"
            onClick={handleSeedCloud}
            disabled={isUploading}
            className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Uploading Data...' : 'Push Current Records to Cloud'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
