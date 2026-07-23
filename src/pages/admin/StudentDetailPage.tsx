import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { feeService } from '../../services/feeService';
import { Payment, Receipt } from '../../types/database';
import { ReceiptModal } from '../../components/common/ReceiptModal';
import {
  GraduationCap, User, Phone, ArrowLeft, CreditCard,
  FileText, CheckCircle2, AlertCircle, PlusCircle
} from 'lucide-react';

export const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedReceipt, setSelectedReceipt] = useState<{ payment: Payment; receipt: Receipt } | null>(null);

  const student = id ? feeService.getStudentById(id) : undefined;
  const summary = id ? feeService.getStudentFeeSummary(id) : undefined;

  if (!student || !summary) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
        <h2 className="text-lg font-bold text-slate-900">Student Record Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">The requested student ID does not exist or has been removed.</p>
        <Link to="/admin/students" className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl">
          Return to Student Directory
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

  return (
    <div className="space-y-6">
      
      {/* Back Button */}
      <Link to="/admin/students" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Student Directory
      </Link>

      {/* Student Profile Overview Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-900 to-indigo-900 text-white flex items-center justify-center font-extrabold text-2xl shadow-md">
            {student.full_name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{student.full_name}</h1>
              <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 uppercase">
                {student.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Admission No: <span className="font-bold text-slate-800 font-mono">{student.admission_no}</span> &bull; Class: <span className="font-bold text-slate-800">{student.school_class?.name} {student.school_class?.arm}</span>
            </p>
          </div>
        </div>

        {/* Quick Action Button */}
        <Link
          to={`/admin/payments/new?student_id=${student.id}`}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Record Bank Fee
        </Link>
      </div>

      {/* Guardian & Financial Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Guardian Info Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <User className="w-4 h-4 text-blue-600" /> Guardian Info
          </div>
          <div>
            <p className="font-extrabold text-slate-900 text-base">{student.guardian?.full_name || 'N/A'}</p>
            <p className="text-xs text-slate-500 mt-0.5">{student.guardian?.relationship || 'Parent/Guardian'}</p>
          </div>
          <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Phone:</span>
              <span className="font-semibold text-slate-900">{student.guardian?.phone || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Email:</span>
              <span className="font-semibold text-slate-900 truncate max-w-[150px]">{student.guardian?.email || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Total Billed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Term Fees Billed</div>
          <div className="my-2">
            <span className="text-3xl font-black text-slate-900">
              ₦{summary.total_fees_due.toLocaleString('en-NG')}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Current Session ({summary.session_term.session} {summary.session_term.term} Term)</p>
        </div>

        {/* Balance Status */}
        <div className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between ${
          summary.balance_owed > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-emerald-50/70 border-emerald-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Current Outstanding Balance</span>
            {summary.balance_owed === 0 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600" />
            )}
          </div>
          <div className="my-2">
            <span className={`text-3xl font-black ${summary.balance_owed > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
              ₦{summary.balance_owed.toLocaleString('en-NG')}
            </span>
          </div>
          <p className="text-[11px] font-semibold text-slate-600">
            Total Paid: <span className="font-bold text-emerald-700">₦{summary.total_paid.toLocaleString('en-NG')}</span>
          </p>
        </div>

      </div>

      {/* Itemized Fee Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-extrabold text-base text-slate-900">Itemized Fee Structure Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Fee Item</th>
                <th className="py-3 px-4">Requirement</th>
                <th className="py-3 px-4 text-right">Fee Amount</th>
                <th className="py-3 px-4 text-right">Amount Paid</th>
                <th className="py-3 px-4 text-right">Balance Owed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {summary.fee_breakdown.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{item.fee_structure.fee_item}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.fee_structure.is_compulsory ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.fee_structure.is_compulsory ? 'Compulsory' : 'Optional'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    ₦{item.fee_structure.amount.toLocaleString('en-NG')}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-600">
                    ₦{item.paid_amount.toLocaleString('en-NG')}
                  </td>
                  <td className={`py-3 px-4 text-right font-extrabold ${item.balance > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                    ₦{item.balance.toLocaleString('en-NG')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-extrabold text-base text-slate-900">Payment Transaction History</h3>
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
                  <td colSpan={5} className="text-center py-6 text-slate-400">
                    No payment transactions recorded for this student yet.
                  </td>
                </tr>
              ) : (
                summary.payments_history.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.reference}</td>
                    <td className="py-3 px-4 capitalize font-semibold">{p.method}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(p.paid_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-600 text-sm">
                      ₦{p.amount.toLocaleString('en-NG')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenReceipt(p)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition inline-flex items-center gap-1"
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

      {/* Receipt Preview Modal */}
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
