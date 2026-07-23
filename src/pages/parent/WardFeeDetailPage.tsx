import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { feeService } from '../../services/feeService';
import { Payment, Receipt } from '../../types/database';
import { ReceiptModal } from '../../components/common/ReceiptModal';
import {
  GraduationCap, ArrowLeft, CreditCard, FileText,
  CheckCircle2, AlertCircle
} from 'lucide-react';

export const WardFeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedReceipt, setSelectedReceipt] = useState<{ payment: Payment; receipt: Receipt } | null>(null);

  const student = id ? feeService.getStudentById(id) : undefined;
  const summary = id ? feeService.getStudentFeeSummary(id) : undefined;

  if (!student || !summary) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
        <h2 className="text-lg font-bold text-slate-900">Ward Record Not Found</h2>
        <Link to="/parent/dashboard" className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl mt-4 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const handleOpenReceipt = (payment: Payment) => {
    const receipt = feeService.getReceiptByPaymentId(payment.id);
    if (receipt) {
      setSelectedReceipt({ payment, receipt });
    }
  };

  const isPaidInFull = summary.balance_owed === 0;

  return (
    <div className="space-y-6">
      
      <Link to="/parent/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Wards Overview
      </Link>

      {/* Ward Info & Pay Button Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-black text-2xl shadow-md">
            {student.full_name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{student.full_name}</h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Admission No: {student.admission_no} &bull; Class: {student.school_class?.name} {student.school_class?.arm}
            </p>
          </div>
        </div>

        {!isPaidInFull && (
          <Link
            to={`/parent/students/${student.id}/pay`}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg shadow-emerald-600/25 transition shrink-0"
          >
            <CreditCard className="w-4 h-4" /> Pay Balance Now (₦{summary.balance_owed.toLocaleString('en-NG')})
          </Link>
        )}
      </div>

      {/* Financial Status Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Billed Fees</span>
          <span className="text-3xl font-black text-slate-900 block mt-1">₦{summary.total_fees_due.toLocaleString('en-NG')}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">{summary.session_term.session} ({summary.session_term.term} Term)</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Paid So Far</span>
          <span className="text-3xl font-black text-emerald-600 block mt-1">₦{summary.total_paid.toLocaleString('en-NG')}</span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            {summary.total_fees_due > 0 ? Math.round((summary.total_paid / summary.total_fees_due) * 100) : 0}% settled
          </span>
        </div>

        <div className={`p-5 rounded-2xl border shadow-sm ${isPaidInFull ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Remaining Balance</span>
          <span className={`text-3xl font-black block mt-1 ${isPaidInFull ? 'text-emerald-700' : 'text-amber-700'}`}>
            ₦{summary.balance_owed.toLocaleString('en-NG')}
          </span>
          <span className="text-[11px] font-semibold text-slate-600 mt-1 block">
            {isPaidInFull ? 'Fully Settled' : 'Payment due for term clearance'}
          </span>
        </div>
      </div>

      {/* Fee Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-extrabold text-base text-slate-900">Itemized Fee Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Fee Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Fee Amount</th>
                <th className="py-3 px-4 text-right">Amount Paid</th>
                <th className="py-3 px-4 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {summary.fee_breakdown.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{item.fee_structure.fee_item}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.fee_structure.is_compulsory ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.fee_structure.is_compulsory ? 'Compulsory' : 'Optional'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">₦{item.fee_structure.amount.toLocaleString('en-NG')}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-600">₦{item.paid_amount.toLocaleString('en-NG')}</td>
                  <td className={`py-3.5 px-4 text-right font-extrabold ${item.balance > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                    ₦{item.balance.toLocaleString('en-NG')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History for Ward */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-extrabold text-base text-slate-900">Payment Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount Paid</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {summary.payments_history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400">No payment transactions recorded for this ward yet.</td>
                </tr>
              ) : (
                summary.payments_history.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{p.reference}</td>
                    <td className="py-3.5 px-4 capitalize font-semibold">{p.method}</td>
                    <td className="py-3.5 px-4 text-slate-500">{new Date(p.paid_at).toLocaleDateString('en-GB')}</td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600 text-sm">₦{p.amount.toLocaleString('en-NG')}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleOpenReceipt(p)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition inline-flex items-center gap-1 text-xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" /> Receipt
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
