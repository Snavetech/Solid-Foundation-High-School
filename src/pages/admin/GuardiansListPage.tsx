import React, { useState, useMemo } from 'react';
import { feeService } from '../../services/feeService';
import { Guardian } from '../../types/database';
import { Users, Search, Plus, Phone, Mail, GraduationCap, X, Filter, ArrowUpDown, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export const GuardiansListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'defaulting' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'children_desc' | 'children_asc' | 'debt_desc' | 'debt_asc'>('name');

  const [showAddModal, setShowAddModal] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('Father');

  const classes = feeService.getClasses();
  const guardians = feeService.getGuardians();
  const students = feeService.getStudents();

  // Compute guardian financial summaries and linked wards info
  const guardianSummaries = useMemo(() => {
    return guardians.map(g => {
      const linkedWards = students.filter(s => s.guardian_id === g.id);
      let totalBilled = 0;
      let totalPaid = 0;
      let totalOwed = 0;

      const wardsWithSummary = linkedWards.map(w => {
        const sum = feeService.getStudentFeeSummary(w.id);
        if (sum) {
          totalBilled += sum.total_fees_due;
          totalPaid += sum.total_paid;
          totalOwed += sum.balance_owed;
        }
        return { student: w, summary: sum };
      });

      return {
        guardian: g,
        wards: wardsWithSummary,
        totalBilled,
        totalPaid,
        totalOwed,
        numChildren: linkedWards.length,
        isDefaulting: totalOwed > 0
      };
    });
  }, [guardians, students]);

  // Filter & Sort Guardians
  const filteredAndSorted = useMemo(() => {
    return guardianSummaries.filter(item => {
      const g = item.guardian;
      const matchesSearch = g.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (g.phone && g.phone.includes(searchTerm)) ||
                            (g.email && g.email.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesClass = !classFilter || item.wards.some(w => w.student.class_id === classFilter);

      const matchesStatus = !statusFilter || statusFilter === 'all' ||
                            (statusFilter === 'defaulting' && item.isDefaulting) ||
                            (statusFilter === 'paid' && !item.isDefaulting);

      return matchesSearch && matchesClass && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'children_desc') return b.numChildren - a.numChildren;
      if (sortBy === 'children_asc') return a.numChildren - b.numChildren;
      if (sortBy === 'debt_desc') return b.totalOwed - a.totalOwed;
      if (sortBy === 'debt_asc') return a.totalOwed - b.totalOwed;
      return a.guardian.full_name.localeCompare(b.guardian.full_name);
    });
  }, [guardianSummaries, searchTerm, classFilter, statusFilter, sortBy]);

  const defaultingCount = guardianSummaries.filter(g => g.isDefaulting).length;
  const paidCount = guardianSummaries.filter(g => !g.isDefaulting && g.numChildren > 0).length;

  const handleAddGuardian = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) return;

    feeService.addGuardian(fullName, phone, email, relationship);
    setShowAddModal(false);
    setFullName('');
    setPhone('');
    setEmail('');
    setRelationship('Father');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Guardians Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered parents and sponsors &bull; <span className="font-bold text-rose-600">{defaultingCount} Defaulting</span> | <span className="font-bold text-emerald-600">{paidCount} Paid in Full</span>
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Guardian
        </button>
      </div>

      {/* Search, Class Filter, Status Filter & Sorting Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by guardian name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {/* Filter by Ward's Class */}
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        >
          <option value="">All Ward Classes</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>
              Ward Class: {c.name} {c.arm}
            </option>
          ))}
        </select>

        {/* Filter by Payment Status (Defaulting vs Complete) */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        >
          <option value="all">All Payment Statuses</option>
          <option value="defaulting">⚠️ Defaulting Parents (Owes Balance)</option>
          <option value="paid">✓ Complete Payment Parents (Fully Cleared)</option>
        </select>

        {/* Sort By Options */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        >
          <option value="name">Sort: Name (A to Z)</option>
          <option value="children_desc">Sort: Most Wards (Highest to Lowest)</option>
          <option value="children_asc">Sort: Least Wards (Lowest to Highest)</option>
          <option value="debt_desc">Sort: Highest Debt Balance Owed</option>
          <option value="debt_asc">Sort: Lowest / Zero Debt</option>
        </select>

      </div>

      {/* Guardians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAndSorted.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
            No guardian records match the selected filters.
          </div>
        ) : (
          filteredAndSorted.map(({ guardian: g, wards, totalBilled, totalPaid, totalOwed, numChildren, isDefaulting }) => {
            return (
              <div key={g.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{g.full_name}</h3>
                    <span className="text-xs font-semibold text-slate-400">{g.relationship || 'Guardian'}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold shrink-0">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                </div>

                {/* Payment Status Badge */}
                <div className="pt-1">
                  {isDefaulting ? (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs flex items-center justify-between">
                      <span className="font-extrabold text-rose-800 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" /> Defaulting Parent
                      </span>
                      <span className="font-black text-rose-700 text-xs">Owes ₦{totalOwed.toLocaleString('en-NG')}</span>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center justify-between">
                      <span className="font-extrabold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Complete Payment
                      </span>
                      <span className="font-extrabold text-emerald-700 text-xs">Cleared 100%</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-900">{g.phone || 'No phone'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{g.email || 'No email'}</span>
                  </div>
                </div>

                {/* Linked Wards */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-600" /> Linked Wards
                    </span>
                    <span className="font-extrabold text-indigo-700 text-[10px] bg-indigo-100/80 px-2 py-0.2 rounded-full">
                      {numChildren} {numChildren === 1 ? 'Child' : 'Children'}
                    </span>
                  </div>
                  {wards.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No students linked</p>
                  ) : (
                    wards.map(({ student: w, summary }) => (
                      <div key={w.id} className="text-xs font-semibold text-slate-800 flex items-center justify-between border-t border-slate-200/60 pt-1.5">
                        <div>
                          <span className="block font-bold text-slate-900">{w.full_name}</span>
                          <span className="text-[10px] font-mono text-slate-500">{w.school_class?.name} {w.school_class?.arm}</span>
                        </div>
                        <div className="text-right">
                          {summary && summary.balance_owed > 0 ? (
                            <span className="text-[11px] font-bold text-rose-600">Owes ₦{summary.balance_owed.toLocaleString('en-NG')}</span>
                          ) : (
                            <span className="text-[11px] font-bold text-emerald-600">Paid ✓</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Guardian Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" /> Add New Guardian
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGuardian} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Guardian Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chief Anthony Ezenwa"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 08031234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. ezenwa@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Sponsor">Sponsor</option>
                </select>
              </div>

              {/* Auto-provisioning info note */}
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-[11px] text-indigo-800 space-y-0.5">
                <span className="font-bold block">🔑 Account Auto-Provisioning:</span>
                <span>The parent will log in using their <strong className="font-mono">Email Address</strong> with default password <strong className="font-mono">parent123</strong>.</span>
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
                  Save Guardian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
