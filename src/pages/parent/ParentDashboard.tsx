import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { feeService } from '../../services/feeService';
import { Payment, Receipt } from '../../types/database';
import { ReceiptModal } from '../../components/common/ReceiptModal';
import {
  GraduationCap, CreditCard, CheckCircle2, AlertCircle,
  FileText, ArrowRight, ShieldCheck, HeartHandshake, Sparkles
} from 'lucide-react';

export const ParentDashboard: React.FC = () => {
  const currentUser = feeService.getCurrentUser();
  const guardian = (currentUser ? feeService.getGuardianByProfileId(currentUser.id) : null) || feeService.getGuardians()[0];
  const wards = feeService.getStudentsByGuardian(guardian.id);
  const [selectedReceipt, setSelectedReceipt] = useState<{ payment: Payment; receipt: Receipt } | null>(null);

  const handleOpenReceipt = (payment: Payment) => {
    const receipt = feeService.getReceiptByPaymentId(payment.id);
    if (receipt) {
      setSelectedReceipt({ payment, receipt });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Reference Aesthetic Hero Banner */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-indigo-500/15 relative overflow-hidden">
        <Sparkles className="w-48 h-48 text-white/10 absolute -top-10 -right-10 pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-2xl">
          <span className="px-3 py-1 bg-white/20 text-white font-bold text-[10px] rounded-full uppercase tracking-widest backdrop-blur-md inline-block">
            PARENT PORTAL OVERVIEW
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Welcome, {guardian.full_name}!
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 font-medium">
            Track school fees, view itemized billing breakdowns, pay online securely via Paystack, and download official receipts anytime.
          </p>
        </div>
      </div>

      {/* Ward Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-violet-600" /> My Linked Wards ({wards.length})
          </h2>
        </div>

        {wards.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 shadow-xs">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900">No Wards Linked Yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              If your student is enrolled at Solid Foundation High School, please contact the bursary or register with their admission number.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wards.map(ward => {
              const summary = feeService.getStudentFeeSummary(ward.id);
              if (!summary) return null;

              const isPaidInFull = summary.balance_owed === 0;

              return (
                <div key={ward.id} className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                  
                  {/* Card Header */}
                  <div className="p-6 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-violet-600 uppercase tracking-widest block">STUDENT PROFILE</span>
                      <h3 className="font-extrabold text-slate-900 text-lg">{ward.full_name}</h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Adm No: {ward.admission_no} &bull; Class: {ward.school_class?.name} {ward.school_class?.arm}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-violet-500/20">
                      {ward.full_name.charAt(0)}
                    </div>
                  </div>

                  {/* Balance Body */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {summary.session_term.session} ({summary.session_term.term} Term) Fees
                      </span>
                      <span className={`px-3 py-0.5 rounded-full text-[11px] font-extrabold border ${
                        isPaidInFull ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {isPaidInFull ? 'Fees Paid in Full' : 'Outstanding Balance'}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Balance Owed</span>
                        <span className={`text-3xl font-black ${isPaidInFull ? 'text-emerald-600' : 'text-amber-600'}`}>
                          ₦{summary.balance_owed.toLocaleString('en-NG')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Billed</span>
                        <span className="font-extrabold text-slate-800 text-sm">
                          ₦{summary.total_fees_due.toLocaleString('en-NG')}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${summary.total_fees_due > 0 ? Math.min(100, Math.round((summary.total_paid / summary.total_fees_due) * 100)) : 0}%` }}
                      ></div>
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 text-right">
                      ₦{summary.total_paid.toLocaleString('en-NG')} paid ({summary.total_fees_due > 0 ? Math.round((summary.total_paid / summary.total_fees_due) * 100) : 0}%)
                    </p>

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center gap-3">
                      {!isPaidInFull && (
                        <Link
                          to={`/parent/students/${ward.id}/pay`}
                          className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl text-center shadow-lg shadow-violet-500/20 transition flex items-center justify-center gap-1.5"
                        >
                          <CreditCard className="w-4 h-4" /> Pay Fees Online
                        </Link>
                      )}
                      <Link
                        to={`/parent/students/${ward.id}`}
                        className={`py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-2xl text-center transition ${
                          isPaidInFull ? 'flex-1' : ''
                        }`}
                      >
                        View Fee Ledger
                      </Link>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Parent Payment History List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900">Recent Fee Payment Receipts</h3>
          <Link to="/parent/payments" className="text-xs font-bold text-violet-600 hover:underline flex items-center gap-1">
            View All Receipts <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ward</th>
                <th className="py-3 px-4">Receipt No</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount Paid</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {wards.flatMap(w => feeService.getStudentFeeSummary(w.id)?.payments_history || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400">
                    No payment receipts issued yet.
                  </td>
                </tr>
              ) : (
                wards.flatMap(w => feeService.getStudentFeeSummary(w.id)?.payments_history || []).slice(0, 5).map(p => {
                  const receipt = feeService.getReceiptByPaymentId(p.id);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">{p.student?.full_name}</td>
                      <td className="py-3 px-4 font-mono text-emerald-700 font-bold">{receipt?.receipt_no || 'N/A'}</td>
                      <td className="py-3 px-4 capitalize">{p.method}</td>
                      <td className="py-3 px-4 text-slate-500">{new Date(p.paid_at).toLocaleDateString('en-GB')}</td>
                      <td className="py-3 px-4 text-right font-black text-emerald-600">₦{p.amount.toLocaleString('en-NG')}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleOpenReceipt(p)}
                          className="px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold rounded-xl transition inline-flex items-center gap-1 text-xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-violet-600" /> Download
                        </button>
                      </td>
                    </tr>
                  );
                })
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
          feeSummary={feeService.getStudentFeeSummary(selectedReceipt.payment.student_id)}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

    </div>
  );
};
