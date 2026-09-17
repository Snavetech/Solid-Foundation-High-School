import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { feeService } from '../../services/feeService';
import { Student, SchoolClass, Guardian } from '../../types/database';
import { Search, Plus, Filter, Eye, GraduationCap, X, Users, Mail, CheckCircle2, RefreshCw, AlertCircle, Key } from 'lucide-react';
import { emailService } from '../../services/emailService';

export const StudentsListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Add Student Form State
  const [admissionNo, setAdmissionNo] = useState('');
  const [fullName, setFullName] = useState('');
  const [classId, setClassId] = useState('');
  const [guardianMode, setGuardianMode] = useState<'existing' | 'new'>('existing');
  const [guardianId, setGuardianId] = useState('');
  const [guardianSearch, setGuardianSearch] = useState('');
  const [isGuardianDropdownOpen, setIsGuardianDropdownOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  // New Guardian Form State (for simultaneous parent+student registration)
  const [newGuardianName, setNewGuardianName] = useState('');
  const [newGuardianPhone, setNewGuardianPhone] = useState('');
  const [newGuardianEmail, setNewGuardianEmail] = useState('');
  const [newGuardianRel, setNewGuardianRel] = useState('Father');

  const [classes, setClasses] = useState(feeService.getClasses());
  const [guardians, setGuardians] = useState(feeService.getGuardians());
  const [students, setStudents] = useState(feeService.getStudents());

  // Listen for real-time changes across devices
  useEffect(() => {
    const updateFromService = () => {
      setClasses(feeService.getClasses());
      setGuardians(feeService.getGuardians());
      setStudents(feeService.getStudents());
    };

    const unsubscribe = feeService.subscribe(updateFromService);
    return () => unsubscribe();
  }, []);

  const selectedGuardian = guardians.find(g => g.id === guardianId);

  const filteredGuardians = useMemo(() => {
    if (!guardianSearch.trim()) return guardians;
    const q = guardianSearch.toLowerCase();
    return guardians.filter(g =>
      g.full_name.toLowerCase().includes(q) ||
      (g.phone && g.phone.includes(q)) ||
      (g.email && g.email.toLowerCase().includes(q))
    );
  }, [guardians, guardianSearch]);

  // Duplicate Admission Number Validation
  const duplicateStudent = admissionNo.trim()
    ? students.find(s => s.admission_no.trim().toLowerCase() === admissionNo.trim().toLowerCase())
    : null;
  const isDuplicateAdmission = Boolean(duplicateStudent);
  const duplicateStudentName = duplicateStudent?.full_name;

  const handleOpenAddModal = () => {
    const nextAdm = feeService.generateNextAdmissionNumber();
    setAdmissionNo(nextAdm);
    setGuardianId('');
    setGuardianSearch('');
    setIsGuardianDropdownOpen(false);
    setShowAddModal(true);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.admission_no.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !selectedClassFilter || s.class_id === selectedClassFilter;
    return matchesSearch && matchesClass;
  });

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admissionNo || !fullName || !classId) return;

    setIsSubmitting(true);
    let finalGuardianId = guardianId;
    let guardianEmailToSend = '';
    let guardianNameToSend = '';

    // If creating a new guardian at the same time:
    if (guardianMode === 'new') {
      if (!newGuardianName.trim()) {
        setIsSubmitting(false);
        return;
      }
      const createdGuardian = feeService.addGuardian(
        newGuardianName.trim(),
        newGuardianPhone.trim(),
        newGuardianEmail.trim(),
        newGuardianRel,
        fullName.trim(),
        admissionNo.trim()
      );
      finalGuardianId = createdGuardian.id;
      guardianEmailToSend = newGuardianEmail.trim();
      guardianNameToSend = newGuardianName.trim();
    } else {
      const existing = guardians.find(g => g.id === guardianId);
      if (existing) {
        guardianEmailToSend = existing.email || '';
        guardianNameToSend = existing.full_name;
      }
    }

    if (!finalGuardianId) {
      setIsSubmitting(false);
      return;
    }

    feeService.addStudent({
      admission_no: admissionNo.trim(),
      full_name: fullName.trim(),
      class_id: classId,
      guardian_id: finalGuardianId,
      status: 'active'
    });

    // Send real welcome email to the parent if email exists
    let emailSent = false;
    let emailError = '';

    if (guardianEmailToSend) {
      const emailRes = await emailService.sendStudentWelcomeEmail({
        guardian_name: guardianNameToSend || 'Parent / Guardian',
        guardian_email: guardianEmailToSend,
        student_name: fullName.trim(),
        admission_no: admissionNo.trim(),
        default_password: 'parent123'
      });
      emailSent = emailRes.success;
      if (!emailRes.success && emailRes.error) {
        emailError = emailRes.error;
      }
    }

    // Refresh state
    setStudents(feeService.getStudents());
    setGuardians(feeService.getGuardians());
    setShowAddModal(false);
    setIsSubmitting(false);

    // Reset inputs
    setAdmissionNo('');
    setFullName('');
    setClassId('');
    setGuardianId('');
    setNewGuardianName('');
    setNewGuardianPhone('');
    setNewGuardianEmail('');
    setNewGuardianRel('Father');
    setGuardianMode('existing');

    if (emailSent) {
      setSuccessToast(`Student "${fullName}" registered & official welcome email dispatched to parent (${guardianEmailToSend})!`);
    } else if (guardianEmailToSend && emailError) {
      setSuccessToast(`Student "${fullName}" registered! (Note: Real email delivery to ${guardianEmailToSend} failed: ${emailError})`);
    } else {
      setSuccessToast(`Student "${fullName}" registered successfully!`);
    }
    setTimeout(() => setSuccessToast(null), 7000);
  };

  return (
    <div className="space-y-6">
      
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center justify-between shadow-sm">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {successToast}
          </span>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Directory</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Manage student admissions, class assignments, and fee accounts
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-md shadow-violet-500/20 transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Register New Student
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by student name or admission number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 shadow-xs"
          />
        </div>

        <select
          value={selectedClassFilter}
          onChange={(e) => setSelectedClassFilter(e.target.value)}
          className="bg-white border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-700 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500/30 shadow-xs shrink-0"
        >
          <option value="">All Classes</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} {c.arm}
            </option>
          ))}
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Admission No</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Class</th>
                <th className="py-3.5 px-4">Linked Guardian</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No student records found matching search.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-violet-700">
                      {s.admission_no}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {s.full_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-xl font-bold text-slate-800 text-[11px]">
                        {s.school_class?.name} {s.school_class?.arm}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {s.guardian ? (
                        <div>
                          <span className="font-semibold text-slate-800">{s.guardian.full_name}</span>
                          <span className="block text-[11px] text-slate-400">{s.guardian.phone}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unlinked</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 capitalize">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        s.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/admin/students/${s.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold rounded-xl transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-violet-600" /> Fee Ledger
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" /> Register New Student
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">Admission Number</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSpinning(true);
                      const next = feeService.generateNextAdmissionNumber(admissionNo);
                      setAdmissionNo(next);
                      setTimeout(() => setIsSpinning(false), 400);
                    }}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1 rounded-lg border border-blue-200/80 transition shadow-2xs active:scale-95"
                    title="Generate next sequential unique admission number"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin text-blue-800' : ''}`} />
                    Auto-Generate
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. SFHS/2026/152"
                    value={admissionNo}
                    onChange={(e) => setAdmissionNo(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 font-mono text-xs ${
                      isDuplicateAdmission
                        ? 'border-rose-400 bg-rose-50 text-rose-900 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {admissionNo && !isDuplicateAdmission && (
                    <span className="absolute right-3 top-2.5 text-[10px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Unique
                    </span>
                  )}
                </div>
                {isDuplicateAdmission ? (
                  <p className="mt-1 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Admission number is already assigned to {duplicateStudentName}.
                  </p>
                ) : (
                  <p className="mt-1 text-[10px] text-slate-400">
                    Auto-generated to prevent duplicates.
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Okeke Chisom Mary"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Class</label>
                <select
                  required
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Class...</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.arm}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-semibold text-slate-700">Linked Parent / Guardian</label>
                  <div className="flex rounded-lg bg-slate-100 p-0.5 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setGuardianMode('existing')}
                      className={`px-2 py-1 rounded-md transition ${guardianMode === 'existing' ? 'bg-white shadow-xs text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Existing Parent
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuardianMode('new')}
                      className={`px-2 py-1 rounded-md transition ${guardianMode === 'new' ? 'bg-white shadow-xs text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      + Add New Parent
                    </button>
                  </div>
                </div>

                {guardianMode === 'existing' ? (
                  <div className="space-y-1.5">
                    {selectedGuardian && !isGuardianDropdownOpen ? (
                      <div className="flex items-center justify-between p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{selectedGuardian.full_name}</div>
                            <div className="text-[10px] text-slate-500">
                              {selectedGuardian.phone || 'No phone'} &bull; {selectedGuardian.email || 'No email'} &bull; <span className="italic">{selectedGuardian.relationship || 'Guardian'}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsGuardianDropdownOpen(true);
                            setGuardianSearch('');
                          }}
                          className="text-xs font-bold text-blue-700 hover:text-blue-800 bg-white border border-blue-200 px-2.5 py-1 rounded-lg shadow-2xs shrink-0"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            placeholder="Type to search parent by name, phone, or email..."
                            value={guardianSearch}
                            onChange={(e) => {
                              setGuardianSearch(e.target.value);
                              setIsGuardianDropdownOpen(true);
                            }}
                            onFocus={() => setIsGuardianDropdownOpen(true)}
                            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 font-medium"
                          />
                          {guardianSearch && (
                            <button
                              type="button"
                              onClick={() => setGuardianSearch('')}
                              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Search Results Dropdown List */}
                        <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl bg-white shadow-md divide-y divide-slate-100">
                          {filteredGuardians.length === 0 ? (
                            <div className="p-3 text-center text-slate-400 text-xs">
                              No guardian found matching "{guardianSearch}".
                              <button
                                type="button"
                                onClick={() => {
                                  setGuardianMode('new');
                                  setNewGuardianName(guardianSearch);
                                }}
                                className="block mx-auto mt-1 font-bold text-blue-600 hover:underline"
                              >
                                + Register As New Parent
                              </button>
                            </div>
                          ) : (
                            filteredGuardians.map(g => (
                              <button
                                key={g.id}
                                type="button"
                                onClick={() => {
                                  setGuardianId(g.id);
                                  setIsGuardianDropdownOpen(false);
                                  setGuardianSearch('');
                                }}
                                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-blue-50/70 transition ${
                                  guardianId === g.id ? 'bg-blue-50 text-blue-900 font-bold' : 'text-slate-700'
                                }`}
                              >
                                <div>
                                  <div className="font-semibold text-slate-900">{g.full_name}</div>
                                  <div className="text-[10px] text-slate-400">
                                    {g.phone || 'No phone'} &bull; {g.email || 'No email'} &bull; <span className="italic">{g.relationship || 'Guardian'}</span>
                                  </div>
                                </div>
                                {guardianId === g.id && (
                                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {!guardianId && !isGuardianDropdownOpen && (
                      <p className="text-[11px] text-rose-500 font-semibold mt-1">
                        Please search and select an existing guardian above.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-2.5">
                    <div className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" /> New Parent Information
                    </div>
                    <div>
                      <label className="block font-medium text-slate-600 mb-0.5 text-[11px]">Parent Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Emeka Okafor"
                        value={newGuardianName}
                        onChange={(e) => setNewGuardianName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-medium text-slate-600 mb-0.5 text-[11px]">Parent Email (for Welcome Mail)</label>
                        <input
                          type="email"
                          placeholder="parent@email.com"
                          value={newGuardianEmail}
                          onChange={(e) => setNewGuardianEmail(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-600 mb-0.5 text-[11px]">Parent Phone</label>
                        <input
                          type="tel"
                          placeholder="08012345678"
                          value={newGuardianPhone}
                          onChange={(e) => setNewGuardianPhone(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-medium text-slate-600 mb-0.5 text-[11px]">Relationship</label>
                      <select
                        value={newGuardianRel}
                        onChange={(e) => setNewGuardianRel(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Sponsor">Sponsor</option>
                      </select>
                    </div>
                    {newGuardianEmail && (
                      <div className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-1.5 flex items-center gap-1 font-semibold">
                        <Mail className="w-3 h-3 text-emerald-600 shrink-0" />
                        A real welcome email will be dispatched to {newGuardianEmail} upon registration!
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Auto-provisioning info note */}
              <div className="p-3 bg-violet-50 border border-violet-200 rounded-xl text-[11px] text-violet-800 space-y-0.5">
                <span className="font-bold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                  Account Auto-Provisioning:
                </span>
                <span>The student will log in using their <strong className="font-mono">Admission Number</strong> with default password <strong className="font-mono">student123</strong>.</span>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isDuplicateAdmission}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Registering & Dispatching Email...' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
