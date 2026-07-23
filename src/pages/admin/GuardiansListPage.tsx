import React, { useState } from 'react';
import { feeService } from '../../services/feeService';
import { Guardian } from '../../types/database';
import { Users, Search, Plus, Phone, Mail, GraduationCap, X } from 'lucide-react';

export const GuardiansListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('Father');

  const guardians = feeService.getGuardians();
  const students = feeService.getStudents();

  const filteredGuardians = guardians.filter(g =>
    g.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.phone && g.phone.includes(searchTerm)) ||
    (g.email && g.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            Registered parents and sponsors linked to students
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition"
        >
          <Plus className="w-4 h-4" /> Add New Guardian
        </button>
      </div>

      {/* Search Bar */}
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

      {/* Guardians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGuardians.map(g => {
          const linkedWards = students.filter(s => s.guardian_id === g.id);
          return (
            <div key={g.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{g.full_name}</h3>
                  <span className="text-xs font-semibold text-slate-400">{g.relationship || 'Guardian'}</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
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
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-500" /> Linked Ward(s) ({linkedWards.length})
                </div>
                {linkedWards.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No students linked</p>
                ) : (
                  linkedWards.map(w => (
                    <div key={w.id} className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                      <span>{w.full_name}</span>
                      <span className="text-[11px] font-mono text-slate-500">{w.school_class?.name} {w.school_class?.arm}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
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
