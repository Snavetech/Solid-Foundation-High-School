import React, { useState } from 'react';
import { feeService } from '../../services/feeService';
import { Payment, Receipt } from '../../types/database';
import { ReceiptModal } from '../../components/common/ReceiptModal';
import { SCHOOL_INFO } from '../../services/mockData';
import {
  GraduationCap, CheckCircle2, AlertCircle, FileText,
  ShieldCheck, Info, BookOpen, Sparkles
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const currentUser = feeService.getCurrentUser();
  const students = feeService.getStudents();
  
  const currentStudent = (currentUser && currentUser.admission_no)
    ? students.find(s => s.admission_no.toLowerCase() === currentUser.admission_no?.toLowerCase()) || students[0]
    : students[0];

  const summary = currentStudent ? feeService.getStudentFeeSummary(currentStudent.id) : undefined;
  
  const [selectedReceipt, setSelectedReceipt] = useState<{ payment: Payment; receipt: Receipt } | null>(null);

  if (!currentStudent || !summary) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 shadow-xs">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
        <h2 className="text-lg font-bold text-slate-900">Student Record Not Found</h2>
      </div>
    );
  }

  const isPaidInFull = summary.balance_owed === 0;

  const handleOpenReceipt = (payment: Payment) => {
    const receipt = feeService.getReceiptByPaymentId(payment.id);
    if (receipt) {
      setSelectedReceipt({ payment, receipt });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Student Hero Banner */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-indigo-500/15 relative overflow-hidden">
        <Sparkles className="w-48 h-48 text-white/10 absolute -top-10 -right-10 pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-black text-2xl shadow-md border border-white/30 shrink-0">
              {currentStudent.full_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black tracking-tight">{currentStudent.full_name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-extrabold text-[10px] uppercase tracking-wider backdrop-blur-md">
                  Student Portal
                </span>
              </div>
              <p className="text-xs text-indigo-100 mt-1 font-medium">
                Adm No: <span className="font-bold text-white font-mono">{currentStudent.admission_no}</span> &bull; Class: <span className="font-bold text-white">{currentStudent.school_class?.name} {currentStudent.school_class?.arm}</span>
              </p>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 text-xs text-indigo-100 flex items-center gap-2">
            <Info className="w-4 h-4 text-white shrink-0" />
            <span className="font-semibold">Read-Only Fee Ledger View</span>
          </div>
        </div>
      </div>

      {/* Financial Status Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Billed Fees</span>
          <span className="text-3xl font-black text-slate-900 block mt-1">₦{summary.total_fees_due.toLocaleString('en-NG')}</span>
          <span className="text-[11px] font-semibold text-slate-400 block">{summary.session_term.session} ({summary.session_term.term} Term)</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Paid</span>
          <span className="text-3xl font-black text-emerald-600 block mt-1">₦{summary.total_paid.toLocaleString('en-NG')}</span>
          <span className="text-[11px] text-emerald-600 font-bold block">
            {summary.total_fees_due > 0 ? Math.round((summary.total_paid / summary.total_fees_due) * 100) : 0}% cleared
          </span>
        </div>

        <div className={`p-5 rounded-3xl border shadow-xs space-y-1 ${isPaidInFull ? 'bg-emerald-50/70 border-emerald-200' : 'bg-amber-50/70 border-amber-200'}`}>
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Current Balance Owed</span>
          <span className={`text-3xl font-black block mt-1 ${isPaidInFull ? 'text-emerald-700' : 'text-amber-700'}`}>
            ₦{summary.balance_owed.toLocaleString('en-NG')}
          </span>
          <span className="text-[11px] font-bold text-slate-600 block">
            {isPaidInFull ? 'Fees Fully Paid' : 'Fee payment pending with Guardian'}
          </span>
        </div>

      </div>

      {/* Itemized Fee Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-violet-600" /> Class Fee Breakdown & Status
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Fee Description</th>
                <th className="py-3 px-4">Requirement</th>
                <th className="py-3 px-4 text-right">Fee Amount</th>
                <th className="py-3 px-4 text-right">Amount Paid</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {summary.fee_breakdown.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{item.fee_structure.fee_item}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      item.fee_structure.is_compulsory ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.fee_structure.is_compulsory ? 'Compulsory' : 'Optional'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">₦{item.fee_structure.amount.toLocaleString('en-NG')}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-600">₦{item.paid_amount.toLocaleString('en-NG')}</td>
                  <td className="py-3.5 px-4 text-right">
                    {item.balance === 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase">
                        Paid
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold text-[10px] uppercase">
                        Bal: ₦{item.balance.toLocaleString('en-NG')}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History & Receipt Downloads */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-4">
        <h3 className="font-extrabold text-base text-slate-900">Fee Payment Receipts</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount Paid</th>
                <th className="py-3 px-4 text-center">Receipt PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {summary.payments_history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400">
                    No payment history recorded yet.
                  </td>
                </tr>
              ) : (
                summary.payments_history.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{p.reference}</td>
                    <td className="py-3.5 px-4 capitalize font-semibold">{p.method}</td>
                    <td className="py-3.5 px-4 text-slate-500">{new Date(p.paid_at).toLocaleDateString('en-GB')}</td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-600 text-sm">₦{p.amount.toLocaleString('en-NG')}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleOpenReceipt(p)}
                        className="px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold rounded-xl transition inline-flex items-center gap-1 text-xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-violet-600" /> View Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          payment={selectedReceipt.payment}
          receipt={selectedReceipt.receipt}
          feeSummary={summary}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

    </div>
  );
};
