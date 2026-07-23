import React, { useState } from 'react';
import { feeService } from '../../services/feeService';
import { FeeStructure } from '../../types/database';
import { CreditCard, Plus, Trash2, Check, AlertCircle, Lock, ShieldCheck } from 'lucide-react';

export const FeeStructuresPage: React.FC = () => {
  const currentUser = feeService.getCurrentUser();
  const isSuperAdmin = currentUser.role === 'super_admin';

  const [feeStructures, setFeeStructures] = useState(feeService.getFeeStructures());
  const [selectedClassId, setSelectedClassId] = useState(feeService.getClasses()[0]?.id || '');
  const [selectedTermId, setSelectedTermId] = useState(feeService.getCurrentSession().id);

  // Form State
  const [feeItem, setFeeItem] = useState('');
  const [amount, setAmount] = useState('');
  const [isCompulsory, setIsCompulsory] = useState(true);

  const classes = feeService.getClasses();
  const sessions = feeService.getSessions();

  const handleAddFeeItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert('Only Super Admin is authorized to modify class fee structures.');
      return;
    }
    if (!feeItem || !amount || !selectedClassId || !selectedTermId) return;

    feeService.addFeeStructure(selectedClassId, selectedTermId, feeItem, parseFloat(amount), isCompulsory);
    setFeeStructures(feeService.getFeeStructures());
    setFeeItem('');
    setAmount('');
  };

  const handleDeleteFeeItem = (id: string) => {
    if (!isSuperAdmin) {
      alert('Only Super Admin is authorized to modify class fee structures.');
      return;
    }
    feeService.deleteFeeStructure(id);
    setFeeStructures(feeService.getFeeStructures());
  };

  const currentClassFees = feeStructures.filter(
    fs => fs.class_id === selectedClassId && fs.session_term_id === selectedTermId
  );

  const classFeesTotal = currentClassFees.reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Fee Structure Setup</h1>
          <p className="text-xs text-slate-500 mt-1">
            Define itemized tuition, levies, and optional fees per class and academic term
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 px-3.5 py-2 rounded-xl"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} {c.arm}</option>
            ))}
          </select>

          <select
            value={selectedTermId}
            onChange={(e) => setSelectedTermId(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 px-3.5 py-2 rounded-xl"
          >
            {sessions.map(s => (
              <option key={s.id} value={s.id}>{s.session} — {s.term} Term</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Add Fee Item Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-fit">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" /> Add Fee Item
          </h3>

          <form onSubmit={handleAddFeeItem} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fee Item Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Tuition Fee, PTA Levy, Uniform"
                value={feeItem}
                onChange={(e) => setFeeItem(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Amount (₦)</label>
              <input
                type="number"
                required
                min="0"
                step="500"
                placeholder="e.g. 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-bold text-slate-900"
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="isCompulsory"
                checked={isCompulsory}
                onChange={(e) => setIsCompulsory(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300"
              />
              <label htmlFor="isCompulsory" className="font-semibold text-slate-700 select-none">
                Compulsory Fee Item
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition"
            >
              Add Fee Item to Class
            </button>
          </form>
        </div>

        {/* Current Class Fees Table */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Itemized Fees for {classes.find(c => c.id === selectedClassId)?.name} {classes.find(c => c.id === selectedClassId)?.arm}
              </h3>
              <p className="text-xs text-slate-500">
                Total Class Billing: <span className="font-extrabold text-emerald-600 text-sm">₦{classFeesTotal.toLocaleString('en-NG')}</span>
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Fee Item Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Amount (₦)</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {currentClassFees.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-400">
                      No fee items created for this class/term yet.
                    </td>
                  </tr>
                ) : (
                  currentClassFees.map(fs => (
                    <tr key={fs.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{fs.fee_item}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          fs.is_compulsory ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {fs.is_compulsory ? 'Compulsory' : 'Optional'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 text-sm">
                        ₦{fs.amount.toLocaleString('en-NG')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleDeleteFeeItem(fs.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Fee Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
