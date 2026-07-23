import React, { useState } from 'react';
import { feeService } from '../../services/feeService';
import { Payment, Receipt } from '../../types/database';
import { ReceiptModal } from '../../components/common/ReceiptModal';
import { Receipt as ReceiptIcon, Search, Filter, FileText, Download, Trash2, ShieldAlert } from 'lucide-react';
import { exportToCSV } from '../../utils/csvExporter';

export const PaymentsListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<{ payment: Payment; receipt: Receipt } | null>(null);

  const currentUser = feeService.getCurrentUser();
  const isSuperAdmin = currentUser.role === 'super_admin';

  const [payments, setPayments] = useState<Payment[]>(feeService.getPayments());

  const filteredPayments = payments.filter(p => {
    const matchesSearch = (p.student?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.student?.admission_no || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = !methodFilter || p.method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const handleOpenReceipt = (payment: Payment) => {
    const receipt = feeService.getReceiptByPaymentId(payment.id);
    if (receipt) {
      setSelectedReceipt({ payment, receipt });
    }
  };

  const handleVoidPayment = (payment: Payment) => {
    if (window.confirm(`SUPER ADMIN CAUTION:\nAre you sure you want to void transaction ${payment.reference} for ₦${payment.amount.toLocaleString('en-NG')} (${payment.student?.full_name})?\n\nThis will permanently delete this receipt and restore the student's balance owed.`)) {
      feeService.voidPayment(payment.id);
      setPayments(feeService.getPayments());
    }
  };

  const handleExportCSV = () => {
    const rows = filteredPayments.map(p => ({
      Reference: p.reference,
      StudentName: p.student?.full_name || '',
      AdmissionNo: p.student?.admission_no || '',
      Class: `${p.student?.school_class?.name || ''} ${p.student?.school_class?.arm || ''}`,
      Method: p.method,
      Amount: p.amount,
      RecordedBy: p.recorder?.full_name || (p.method === 'paystack' ? 'Paystack Gateway' : 'Bursary Office'),
      Status: p.status,
      PaidAt: new Date(p.paid_at).toLocaleString()
    }));
    exportToCSV(`Payments_Report_${new Date().toISOString().slice(0,10)}`, rows);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payments & Receipts Ledger</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete transaction record of online Paystack and manual Bursary payments
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition shrink-0"
        >
          <Download className="w-4 h-4" /> Export Transactions CSV
        </button>
      </div>

      {/* Search & Method Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by reference number, student name, or admission no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        >
          <option value="">All Payment Methods</option>
          <option value="paystack">Paystack Online</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="card">Debit/Credit Card</option>
          <option value="ussd">USSD</option>
          <option value="bank_account">Bank Account</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Reference</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Class</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Audit (Recorded By)</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Amount Paid</th>
                <th className="py-3.5 px-4 text-center">Receipt</th>
                {isSuperAdmin && <th className="py-3.5 px-4 text-center">Super Admin</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 9 : 8} className="text-center py-8 text-slate-400">
                    No payment transaction records match filters.
                  </td>
                </tr>
              ) : (
                filteredPayments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{p.reference}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {p.student?.full_name}
                      <span className="block text-[11px] font-normal text-slate-400">{p.student?.admission_no}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {p.student?.school_class?.name} {p.student?.school_class?.arm}
                    </td>
                    <td className="py-3.5 px-4 capitalize">
                      <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                        p.method === 'paystack' || p.method === 'card' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        p.method === 'bank_account' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                        p.method === 'ussd' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {p.method.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-semibold">
                      {p.recorder ? (
                        <span className="text-indigo-700 font-bold">{p.recorder.full_name}</span>
                      ) : p.method === 'paystack' || p.method === 'card' || p.method === 'ussd' || p.method === 'bank_account' ? (
                        <span className="text-emerald-700 font-bold">Paystack Automated</span>
                      ) : (
                        <span className="text-slate-500">Bursary Counter</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(p.paid_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600 text-sm">
                      ₦{p.amount.toLocaleString('en-NG')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleOpenReceipt(p)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition inline-flex items-center gap-1 text-xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" /> Receipt
                      </button>
                    </td>
                    {isSuperAdmin && (
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleVoidPayment(p)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Void / Cancel Payment (Super Admin)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
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
          feeSummary={feeService.getStudentFeeSummary(selectedReceipt.payment.student_id)}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

    </div>
  );
};
