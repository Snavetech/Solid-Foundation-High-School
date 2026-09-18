import React, { useState } from 'react';
import { feeService } from '../../services/feeService';
import { Payment, Receipt } from '../../types/database';
import { ReceiptModal } from '../../components/common/ReceiptModal';
import { Receipt as ReceiptIcon, FileText, Download } from 'lucide-react';

export const PaymentHistoryPage: React.FC = () => {
  const currentUser = feeService.getCurrentUser();
  const guardian = (currentUser ? feeService.getGuardianByProfileId(currentUser.id) : null) || feeService.getGuardians()[0];
  const wards = feeService.getStudentsByGuardian(guardian.id);

  const [selectedReceipt, setSelectedReceipt] = useState<{ payment: Payment; receipt: Receipt } | null>(null);

  const allPayments = wards.flatMap(w => feeService.getStudentFeeSummary(w.id)?.payments_history || []);

  const handleOpenReceipt = (payment: Payment) => {
    const receipt = feeService.getReceiptByPaymentId(payment.id);
    if (receipt) {
      setSelectedReceipt({ payment, receipt });
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payment Receipts & History</h1>
        <p className="text-xs text-slate-500 mt-1">
          Audited list of all payments made across your linked wards with PDF downloads
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ward Name</th>
                <th className="py-3 px-4">Receipt No</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount Paid</th>
                <th className="py-3 px-4 text-center">Download PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {allPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No payment history recorded yet.
                  </td>
                </tr>
              ) : (
                allPayments.map(p => {
                  const receipt = feeService.getReceiptByPaymentId(p.id);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{p.student?.full_name}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{receipt?.receipt_no || 'N/A'}</td>
                      <td className="py-3.5 px-4 capitalize font-semibold">{p.method}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">{p.reference}</td>
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
