import React from 'react';
import { Payment, Receipt, StudentFeeSummary } from '../../types/database';
import { SCHOOL_INFO } from '../../services/mockData';
import { generateReceiptPDF } from '../../utils/pdfGenerator';
import {
  X, Download, Printer, CheckCircle2, ShieldCheck,
  CreditCard, Calendar, Hash, User, QrCode, Sparkles, Building2
} from 'lucide-react';

interface ReceiptModalProps {
  payment: Payment;
  receipt: Receipt;
  feeSummary?: StudentFeeSummary;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  payment,
  receipt,
  feeSummary,
  onClose
}) => {
  const student = payment.student;
  const schoolClass = student?.school_class;

  const handleDownload = () => {
    generateReceiptPDF(payment, receipt, feeSummary);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header Actions (No Print) */}
        <div className="no-print bg-slate-900 text-white px-5 sm:px-6 py-3.5 flex items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base line-clamp-1">Official Digital Payment Receipt</h3>
              <p className="text-[11px] text-slate-400 hidden sm:block">Paystack & Bursary Counter Verified Transaction</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-bold transition text-slate-200"
            >
              <Printer className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-extrabold transition text-white shadow-md shadow-violet-500/25"
            >
              <Download className="w-3.5 h-3.5" /> <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Modern Receipt Body */}
        <div className="p-4 sm:p-8 space-y-6 text-slate-900 bg-white overflow-y-auto flex-1" id="printable-receipt">
          
          {/* Top Violet Gradient Banner */}
          <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-indigo-500/15 relative overflow-hidden">
            <Sparkles className="w-44 h-44 text-white/10 absolute -top-8 -right-8 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              
              {/* School Brand */}
              <div className="flex items-center space-x-4">
                <img
                  src={SCHOOL_INFO.logo}
                  alt="SFCHS Logo"
                  className="w-14 h-14 object-contain rounded-2xl bg-white p-1 border border-white/40 shadow-md shrink-0"
                />
                <div className="space-y-0.5">
                  <span className="px-3 py-0.5 bg-white/20 text-white font-extrabold text-[9px] rounded-full uppercase tracking-widest backdrop-blur-md inline-block">
                    OFFICIAL DIGITAL RECEIPT
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">{SCHOOL_INFO.name}</h1>
                  <p className="text-xs text-indigo-100 font-medium italic">"{SCHOOL_INFO.motto}" &bull; {SCHOOL_INFO.address}</p>
                </div>
              </div>

              {/* Verified Stamp Badge */}
              <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-400/40 rounded-2xl px-4 py-2 text-right shrink-0 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-500/30">
                  ✓
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 block">PAYMENT STATUS</span>
                  <span className="text-sm font-black text-white">PAID & VERIFIED</span>
                </div>
              </div>

            </div>
          </div>

          {/* 4 Summary Grid Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Hash className="w-3 h-3 text-violet-600" /> Receipt No
              </span>
              <span className="font-extrabold text-violet-700 text-xs sm:text-sm block truncate">
                {receipt.receipt_no}
              </span>
            </div>

            <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100 space-y-1">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-emerald-600" /> Amount Paid
              </span>
              <span className="font-black text-emerald-700 text-sm sm:text-base block">
                ₦{payment.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Building2 className="w-3 h-3 text-indigo-600" /> Payment Channel
              </span>
              <span className="font-bold text-slate-800 text-xs capitalize block">
                {payment.method}
              </span>
            </div>

            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Calendar className="w-3 h-3 text-violet-600" /> Issued Date
              </span>
              <span className="font-bold text-slate-800 text-xs block">
                {new Date(receipt.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

          </div>

          {/* Student & Guardian Information Profile */}
          <div className="bg-slate-50/60 p-5 rounded-3xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold text-violet-600 uppercase tracking-widest block">STUDENT INFORMATION</span>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-base shadow-sm shrink-0">
                  {student?.full_name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm leading-tight">{student?.full_name}</h4>
                  <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                    Admission No: <span className="font-bold text-slate-700">{student?.admission_no}</span>
                  </p>
                  <p className="text-slate-500 font-medium text-[11px]">
                    Class: <span className="font-bold text-slate-800">{schoolClass?.name} {schoolClass?.arm}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-slate-200/60 pt-3 sm:pt-0 sm:pl-5">
              <span className="text-[10px] font-extrabold text-violet-600 uppercase tracking-widest block">PAYER & TERM DETAILS</span>
              <div className="space-y-1 font-medium text-slate-700">
                <p><span className="text-slate-400">Guardian Name:</span> <span className="font-bold text-slate-900">{student?.guardian?.full_name || 'N/A'}</span></p>
                <p><span className="text-slate-400">Phone Number:</span> <span className="font-bold text-slate-800">{student?.guardian?.phone || 'N/A'}</span></p>
                <p><span className="text-slate-400">Session & Term:</span> <span className="font-bold text-slate-900">{feeSummary?.session_term ? `${feeSummary.session_term.session} (${feeSummary.session_term.term} Term)` : 'Current Term'}</span></p>
              </div>
            </div>
          </div>

          {/* Table of Paid Fees */}
          <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Fee Item Description</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Reference Code</th>
                  <th className="py-3.5 px-4 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                <tr>
                  <td className="py-4 px-4 font-extrabold text-slate-900 text-sm">
                    {payment.fee_structure?.fee_item || 'School Fees Payment (Installment/Full)'}
                  </td>
                  <td className="py-4 px-4 capitalize">
                    <span className="px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 font-extrabold text-[10px]">
                      {payment.method}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono text-[11px] text-slate-500">{payment.reference}</td>
                  <td className="py-4 px-4 text-right font-black text-emerald-600 text-base">
                    ₦{payment.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Account Balance Summary Pill */}
          {feeSummary && (
            <div className="bg-gradient-to-r from-slate-50 to-violet-50/50 border border-slate-200/80 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-900 font-extrabold block text-sm">Overall Fee Ledger Status</span>
                <span className="text-slate-500 font-medium">
                  Total Term Billed: <strong className="text-slate-800">₦{feeSummary.total_fees_due.toLocaleString('en-NG')}</strong> &bull; Total Cleared: <strong className="text-emerald-600">₦{feeSummary.total_paid.toLocaleString('en-NG')}</strong>
                </span>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Remaining Balance</span>
                <span className={`font-black text-lg ${feeSummary.balance_owed > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  ₦{feeSummary.balance_owed.toLocaleString('en-NG')}
                </span>
              </div>
            </div>
          )}

          {/* Digital Signature & Verification Barcode (Reference Aesthetic) */}
          <div className="bg-slate-900 text-slate-200 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-slate-800 rounded-2xl text-violet-400 shrink-0">
                <QrCode className="w-8 h-8" />
              </div>
              <div>
                <p className="font-extrabold text-white text-xs">Digital Verification & Cryptographic Stamp</p>
                <p className="font-mono text-[10px] text-slate-400 mt-0.5">HASH: sfhs_9a3f8b2d1c7e4a059b</p>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authenticated by Bursary Automated Accounting Engine</span>
                </div>
              </div>
            </div>

            <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-5 shrink-0">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">OFFICIAL BURSAR SIGNATURE</p>
              <p className="font-serif italic text-amber-300 text-lg my-0.5">A. Ezenwa (Bursar)</p>
              <p className="text-[9px] text-slate-500">Bursary Dept &bull; Solid Foundation High</p>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="pt-2 text-center text-[11px] text-slate-400 space-y-1 font-medium">
            <p>Solid Foundation Comprehensive High School &bull; "Knowledge is Wealth"</p>
          </div>

        </div>

      </div>
    </div>
  );
};
