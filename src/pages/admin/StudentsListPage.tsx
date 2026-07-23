import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { feeService } from '../../services/feeService';
import { Student, SchoolClass, Guardian } from '../../types/database';
import { Search, Plus, Filter, Eye, GraduationCap, X } from 'lucide-react';

export const StudentsListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Student Form State
  const [admissionNo, setAdmissionNo] = useState('');
  const [fullName, setFullName] = useState('');
  const [classId, setClassId] = useState('');
  const [guardianId, setGuardianId] = useState('');

  const classes = feeService.getClasses();
  const guardians = feeService.getGuardians();
  const students = feeService.getStudents();

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.admission_no.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !selectedClassFilter || s.class_id === selectedClassFilter;
    return matchesSearch && matchesClass;
  });

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!admissionNo || !fullName || !classId || !guardianId) return;

    feeService.addStudent({
      admission_no: admissionNo,
      full_name: fullName,
      class_id: classId,
      guardian_id: guardianId,
      status: 'active'
    });

    setShowAddModal(false);
    setAdmissionNo('');
    setFullName('');
    setClassId('');
    setGuardianId('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Directory</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Manage student admissions, class assignments, and fee accounts
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
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
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 shadow-xs font-medium"
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
                        s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
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
                <label className="block font-semibold text-slate-700 mb-1">Admission Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SFHS/2026/105"
                  value={admissionNo}
                  onChange={(e) => setAdmissionNo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                />
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
                <label className="block font-semibold text-slate-700 mb-1">Linked Guardian</label>
                <select
                  required
                  value={guardianId}
                  onChange={(e) => setGuardianId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Guardian...</option>
                  {guardians.map(g => (
                    <option key={g.id} value={g.id}>{g.full_name} ({g.phone})</option>
                  ))}
                </select>
              </div>

              {/* Auto-provisioning info note */}
              <div className="p-3 bg-violet-50 border border-violet-200 rounded-xl text-[11px] text-violet-800 space-y-0.5">
                <span className="font-bold block">🔑 Account Auto-Provisioning:</span>
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 shadow-md"
                >
                  Register Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
