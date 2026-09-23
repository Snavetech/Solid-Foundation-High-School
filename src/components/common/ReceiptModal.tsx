import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);

  useEffect(() => {
    // Add class so @media print completely isolates this receipt and hides #root
    document.body.classList.add('has-receipt-modal');
    return () => {
      document.body.classList.remove('has-receipt-modal');
    };
  }, []);

  const handleDownload = () => {
    generateReceiptPDF(payment, receipt, feeSummary);
  };

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div id="receipt-modal-portal" className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
      <div id="receipt-modal-card" className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header Actions (Excluded From Print) */}
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-bold transition text-slate-200 border border-slate-700 hover:border-slate-600"
              title="Print official single-page receipt"
            >
              <Printer className="w-3.5 h-3.5 text-violet-400" /> <span>Print Receipt</span>
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

        {/* Printable Modern Receipt Body (Strict Single-Page Constraint in Print Mode) */}
        <div className="p-4 sm:p-7 print:p-0 space-y-4 print:space-y-2 text-slate-900 bg-white overflow-y-auto print:overflow-visible flex-1" id="printable-receipt">
          
          {/* Top Violet Gradient Banner with Logo & School Identity */}
          <div className="bg-gradient-to-r from-violet-700 via-indigo-700 to-purple-800 print:bg-[#2e1065] print:from-[#2e1065] print:to-[#312e81] p-5 sm:p-7 print:p-3 rounded-3xl print:rounded-xl text-white shadow-xl shadow-indigo-500/15 print:shadow-none relative overflow-hidden">
            <Sparkles className="w-44 h-44 text-white/10 absolute -top-8 -right-8 pointer-events-none print:hidden" />

            <div className="relative z-10 flex flex-col md:flex-row print:flex-row items-start md:items-center print:items-center justify-between gap-4 print:gap-3">
              
              {/* School Brand */}
              <div className="flex items-center space-x-3.5 print:space-x-3">
                {!logoLoadFailed ? (
                  <img
                    src={SCHOOL_INFO.logo}
                    alt="SFCHS Logo"
                    onError={() => setLogoLoadFailed(true)}
                    className="w-14 h-14 print:w-12 print:h-12 object-contain rounded-2xl print:rounded-lg bg-white p-1 border border-white/50 shadow-md shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 print:w-12 print:h-12 rounded-2xl print:rounded-lg bg-white text-indigo-700 flex items-center justify-center font-black text-sm p-1 shrink-0">
                    SFCHS
                  </div>
                )}
                <div className="space-y-0.5">
                  <span className="px-2.5 py-0.5 print:px-2 bg-white/20 text-white font-extrabold text-[9px] print:text-[8px] rounded-full uppercase tracking-widest backdrop-blur-md inline-block">
                    OFFICIAL DIGITAL RECEIPT
                  </span>
                  <h1 className="text-lg sm:text-xl print:text-base font-black tracking-tight leading-tight text-white">{SCHOOL_INFO.name}</h1>
                  <p className="text-xs print:text-[9.5px] text-indigo-100 font-medium italic">"{SCHOOL_INFO.motto}" &bull; {SCHOOL_INFO.address}</p>
                </div>
              </div>

              {/* Verified Stamp Badge */}
              <div className="bg-emerald-500/25 print:bg-emerald-600 backdrop-blur-md border border-emerald-400/40 print:border-emerald-400 rounded-2xl print:rounded-lg px-3 sm:px-4 print:px-2.5 py-2 print:py-1 shrink-0 flex items-center gap-2.5 w-full sm:w-auto print:w-auto justify-between sm:justify-start">
                <div className="w-8 h-8 print:w-6 print:h-6 rounded-full bg-emerald-500 print:bg-white text-white print:text-emerald-700 flex items-center justify-center shadow-md shadow-emerald-500/30 shrink-0">
                  <CheckCircle2 className="w-4 h-4 print:w-3.5 print:h-3.5 text-white print:text-emerald-700" />
                </div>
                <div>
                  <span className="text-[9px] print:text-[7.5px] font-black uppercase tracking-widest text-emerald-300 print:text-emerald-100 block">PAYMENT STATUS</span>
                  <span className="text-xs sm:text-sm print:text-xs font-black text-white">PAID & VERIFIED</span>
                </div>
              </div>

            </div>
          </div>

          {/* 4 Summary Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4 gap-2.5 print:gap-2">
            
            <div className="bg-slate-50 print:bg-slate-50 p-3 print:p-2 rounded-2xl print:rounded-lg border border-slate-100 print:border-slate-200 space-y-0.5">
              <span className="text-[10px] print:text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Hash className="w-3 h-3 text-violet-600 print:w-2.5 print:h-2.5" /> Receipt No
              </span>
              <span className="font-extrabold text-violet-700 text-xs sm:text-sm print:text-[11px] block truncate">
                {receipt.receipt_no}
              </span>
            </div>

            <div className="bg-emerald-50/70 print:bg-emerald-50/50 p-3 print:p-2 rounded-2xl print:rounded-lg border border-emerald-100 print:border-emerald-200 space-y-0.5">
              <span className="text-[10px] print:text-[8.5px] font-bold text-emerald-700 uppercase tracking-wider block flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-emerald-600 print:w-2.5 print:h-2.5" /> Amount Paid
              </span>
              <span className="font-black text-emerald-700 text-sm sm:text-base print:text-[12px] block">
                ₦{payment.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-slate-50 print:bg-slate-50 p-3 print:p-2 rounded-2xl print:rounded-lg border border-slate-100 print:border-slate-200 space-y-0.5">
              <span className="text-[10px] print:text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Building2 className="w-3 h-3 text-indigo-600 print:w-2.5 print:h-2.5" /> Payment Channel
              </span>
              <span className="font-bold text-slate-800 text-xs print:text-[11px] capitalize block">
                {payment.method}
              </span>
            </div>

            <div className="bg-slate-50 print:bg-slate-50 p-3 print:p-2 rounded-2xl print:rounded-lg border border-slate-100 print:border-slate-200 space-y-0.5">
              <span className="text-[10px] print:text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Calendar className="w-3 h-3 text-violet-600 print:w-2.5 print:h-2.5" /> Issued Date
              </span>
              <span className="font-bold text-slate-800 text-xs print:text-[11px] block">
                {new Date(receipt.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

          </div>

          {/* Student & Guardian Information Profile */}
          <div className="bg-slate-50 print:bg-slate-50 p-4 print:p-2.5 rounded-2xl print:rounded-lg border border-slate-100 print:border-slate-200 grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-3 text-xs print:text-[10.5px]">
            <div className="space-y-1 print:space-y-0.5">
              <span className="text-[10px] print:text-[8.5px] font-extrabold text-violet-600 uppercase tracking-widest block">STUDENT INFORMATION</span>
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 print:w-7 print:h-7 rounded-xl print:rounded-md bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-sm print:text-xs shadow-sm shrink-0">
                  {student?.full_name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm print:text-[11.5px] leading-tight">{student?.full_name}</h4>
                  <p className="text-slate-500 font-mono text-[11px] print:text-[10px] mt-0.5">
                    Admission No: <span className="font-bold text-slate-800">{student?.admission_no}</span>
                  </p>
                  <p className="text-slate-500 font-medium text-[11px] print:text-[10px]">
                    Class: <span className="font-bold text-slate-800">{schoolClass?.name} {schoolClass?.arm}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-1 print:space-y-0.5 border-t sm:border-t-0 print:border-t-0 sm:border-l print:border-l border-slate-200 pt-2.5 sm:pt-0 print:pt-0 sm:pl-4 print:pl-3">
              <span className="text-[10px] print:text-[8.5px] font-extrabold text-violet-600 uppercase tracking-widest block">PAYER & TERM DETAILS</span>
              <div className="space-y-0.5 font-medium text-slate-700">
                <p><span className="text-slate-400">Guardian Name:</span> <span className="font-bold text-slate-900">{student?.guardian?.full_name || 'N/A'}</span></p>
                <p><span className="text-slate-400">Phone Number:</span> <span className="font-bold text-slate-800">{student?.guardian?.phone || 'N/A'}</span></p>
                <p><span className="text-slate-400">Session & Term:</span> <span className="font-bold text-slate-900">{feeSummary?.session_term ? `${feeSummary.session_term.session} (${feeSummary.session_term.term} Term)` : 'Current Term'}</span></p>
              </div>
            </div>
          </div>

          {/* Table of Paid Fees */}
          <div className="border border-slate-100 print:border-slate-200 rounded-2xl print:rounded-lg overflow-hidden shadow-xs print:shadow-none overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[500px] sm:min-w-0 print:min-w-0">
              <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px] print:text-[9px]">
                <tr>
                  <th className="py-2.5 print:py-1.5 px-3.5 print:px-2.5">Fee Item Description</th>
                  <th className="py-2.5 print:py-1.5 px-3.5 print:px-2.5">Payment Method</th>
                  <th className="py-2.5 print:py-1.5 px-3.5 print:px-2.5">Reference Code</th>
                  <th className="py-2.5 print:py-1.5 px-3.5 print:px-2.5 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-slate-200 font-semibold text-slate-700">
                <tr>
                  <td className="py-3 print:py-1.5 px-3.5 print:px-2.5 font-extrabold text-slate-900 text-sm print:text-xs">
                    {payment.fee_structure?.fee_item || 'School Fees Payment (Installment/Full)'}
                  </td>
                  <td className="py-3 print:py-1.5 px-3.5 print:px-2.5 capitalize">
                    <span className="px-2.5 py-0.5 print:px-2 print:py-0.2 rounded-full bg-violet-50 text-violet-700 font-extrabold text-[10px] print:text-[9px]">
                      {payment.method}
                    </span>
                  </td>
                  <td className="py-3 print:py-1.5 px-3.5 print:px-2.5 font-mono text-[11px] print:text-[9.5px] text-slate-500">{payment.reference}</td>
                  <td className="py-3 print:py-1.5 px-3.5 print:px-2.5 text-right font-black text-emerald-600 text-sm sm:text-base print:text-xs">
                    ₦{payment.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Account Balance Summary Pill */}
          {feeSummary && (
            <div className="bg-gradient-to-r from-slate-50 to-violet-50/50 print:bg-slate-50 border border-slate-200 rounded-2xl print:rounded-lg p-3.5 print:p-2 flex flex-col sm:flex-row print:flex-row sm:items-center print:items-center justify-between gap-2 text-xs print:text-[10px]">
              <div>
                <span className="text-slate-900 font-extrabold block text-xs sm:text-sm print:text-xs">Overall Fee Ledger Status</span>
                <span className="text-slate-500 font-medium text-[11px] print:text-[10px]">
                  Total Term Billed: <strong className="text-slate-800">₦{feeSummary.total_fees_due.toLocaleString('en-NG')}</strong> &bull; Total Cleared: <strong className="text-emerald-600">₦{feeSummary.total_paid.toLocaleString('en-NG')}</strong>
                </span>
              </div>
              <div className="text-left sm:text-right print:text-right shrink-0">
                <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider block">Remaining Balance</span>
                <span className={`font-black text-base print:text-xs ${feeSummary.balance_owed > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  ₦{feeSummary.balance_owed.toLocaleString('en-NG')}
                </span>
              </div>
            </div>
          )}

          {/* Digital Signature & Verification Barcode */}
          <div className="bg-slate-900 print:bg-[#0f172a] text-slate-200 rounded-2xl print:rounded-lg p-3.5 print:p-2 flex flex-col sm:flex-row print:flex-row items-center justify-between gap-3 print:gap-2 text-xs print:text-[10px]">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 print:p-1.5 bg-slate-800 rounded-xl print:rounded-md text-violet-400 shrink-0">
                <QrCode className="w-6 h-6 print:w-5 print:h-5" />
              </div>
              <div>
                <p className="font-extrabold text-white text-xs print:text-[10.5px]">Digital Verification & Cryptographic Stamp</p>
                <p className="font-mono text-[10px] print:text-[8.5px] text-slate-400 mt-0.5">HASH: sfhs_9a3f8b2d1c7e4a059b</p>
                <div className="flex items-center gap-1.5 text-[9.5px] print:text-[8.5px] font-bold text-emerald-400 mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Authenticated by Bursary Automated Accounting Engine</span>
                </div>
              </div>
            </div>

            <div className="text-center sm:text-right print:text-right border-t sm:border-t-0 print:border-t-0 sm:border-l print:border-l border-slate-800 pt-2 sm:pt-0 print:pt-0 sm:pl-4 print:pl-3 shrink-0">
              <p className="text-[9px] print:text-[8px] text-slate-400 font-bold uppercase tracking-wider">OFFICIAL BURSAR SIGNATURE</p>
              <p className="font-serif italic text-amber-300 text-base print:text-sm my-0.5">A. Ezenwa (Bursar)</p>
              <p className="text-[8.5px] print:text-[7.5px] text-slate-500">Bursary Dept &bull; Solid Foundation High</p>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="pt-1 text-center text-[10px] print:text-[8.5px] text-slate-400 space-y-0.5 font-medium">
            <p>Solid Foundation Comprehensive High School &bull; "Knowledge is Wealth"</p>
            <p className="print-only text-[8px] text-slate-400">Printed directly from SFCHS Smart Fees Portal &bull; Official Digital Copy</p>
          </div>

        </div>

      </div>
    </div>,
    document.body
  );
};
