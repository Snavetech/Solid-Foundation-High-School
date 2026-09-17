import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { feeService } from '../../services/feeService';
import { Payment, Receipt } from '../../types/database';
import { ReceiptModal } from '../../components/common/ReceiptModal';
import { PaystackModal } from '../../components/common/PaystackModal';
import { CreditCard, ShieldCheck, ArrowLeft, CheckCircle2, Lock, Info } from 'lucide-react';

export const MakePaymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const student = id ? feeService.getStudentById(id) : undefined;
  const summary = id ? feeService.getStudentFeeSummary(id) : undefined;

  const [paymentOption, setPaymentOption] = useState<'full' | 'partial'>('full');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [showPaystackModal, setShowPaystackModal] = useState<boolean>(false);
  const [receiptIssued, setReceiptIssued] = useState<{ payment: Payment; receipt: Receipt } | null>(null);

  if (!student || !summary) {
    return <div className="p-8 text-center bg-white rounded-3xl border border-slate-100">Student record not found.</div>;
  }

  const minInstallmentAmount = Math.ceil(summary.balance_owed * 0.20);

  const amountToPay = paymentOption === 'full' 
    ? summary.balance_owed 
    : (parseFloat(customAmount) || 0);

  const handleOpenPaystackGateway = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentOption === 'partial') {
      if (amountToPay < minInstallmentAmount) {
        alert(`To prevent irregular micro-payments, school policy requires installment payments to be at least 20% of your outstanding balance (₦${minInstallmentAmount.toLocaleString('en-NG')}).`);
        return;
      }
      if (amountToPay > summary.balance_owed) {
        alert(`Payment amount cannot exceed your outstanding balance (₦${summary.balance_owed.toLocaleString('en-NG')}).`);
        return;
      }
    } else {
      if (amountToPay <= 0 || amountToPay > summary.balance_owed) {
        alert(`Payment amount must be greater than 0 and not exceed outstanding balance (₦${summary.balance_owed.toLocaleString('en-NG')}).`);
        return;
      }
    }
    setShowPaystackModal(true);
  };

  const handlePaymentSuccess = (payment: Payment, receipt: Receipt) => {
    setShowPaystackModal(false);
    setReceiptIssued({ payment, receipt });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <Link to={`/parent/students/${student.id}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition">
        <ArrowLeft className="w-4 h-4" /> Cancel & Return to Ward Ledger
      </Link>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Paystack Online Payment Gateway</h1>
        <p className="text-xs text-slate-400 font-medium">
          Official NGN payment portal for <span className="font-bold text-slate-800">{student.full_name}</span> ({student.school_class?.name} {student.school_class?.arm})
        </p>
      </div>

      <form onSubmit={handleOpenPaystackGateway} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-6">
        
        {/* Outstanding Balance Banner */}
        <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 p-6 rounded-3xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-violet-500/15">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-100 block">CURRENT TERM BALANCE OWED</span>
            <span className="text-3xl font-black text-white">₦{summary.balance_owed.toLocaleString('en-NG')}</span>
          </div>
          <div className="sm:text-right">
            <span className="text-[10px] uppercase font-bold text-indigo-100 block">ACADEMIC TERM</span>
            <span className="text-xs font-bold text-white">{summary.session_term.session} ({summary.session_term.term})</span>
          </div>
        </div>

        {/* Payment Amount Selector */}
        <div className="space-y-3">
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            Select Payment Option
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentOption('full')}
              className={`p-4 rounded-2xl border text-left transition ${
                paymentOption === 'full'
                  ? 'border-violet-600 bg-violet-50/60 text-violet-900 font-bold ring-2 ring-violet-500/30'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="text-xs block text-slate-400 uppercase font-semibold">Option A</span>
              <span className="font-black text-base block mt-0.5">Pay Full Balance</span>
              <span className="text-xs text-violet-700 font-black">₦{summary.balance_owed.toLocaleString('en-NG')}</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentOption('partial')}
              className={`p-4 rounded-2xl border text-left transition ${
                paymentOption === 'partial'
                  ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-bold ring-2 ring-indigo-500/30'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="text-xs block text-slate-400 uppercase font-semibold">Option B</span>
              <span className="font-black text-base block mt-0.5">Pay Installment</span>
              <span className="text-xs text-indigo-700 font-black">Min 20%: ₦{minInstallmentAmount.toLocaleString('en-NG')}</span>
            </button>
          </div>
        </div>

        {/* Custom Installment Input */}
        {paymentOption === 'partial' && (
          <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold text-slate-800">
                Enter Installment Amount (₦)
              </label>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/70 px-2.5 py-0.5 rounded-full">
                Min 20% Policy: ₦{minInstallmentAmount.toLocaleString('en-NG')}
              </span>
            </div>

            <input
              type="number"
              required
              min={minInstallmentAmount}
              max={summary.balance_owed}
              step="any"
              placeholder={`Minimum 20%: ₦${minInstallmentAmount.toLocaleString('en-NG')}`}
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-2xl font-black text-slate-900 text-base focus:ring-2 focus:ring-violet-500"
            />

            {/* Quick Percentage Presets */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { label: 'Min 20%', pct: 0.20 },
                { label: '30%', pct: 0.30 },
                { label: '40%', pct: 0.40 },
                { label: '50%', pct: 0.50 },
                { label: '75%', pct: 0.75 },
              ].map(preset => {
                const presetVal = Math.ceil(summary.balance_owed * preset.pct);
                const isSelected = parseFloat(customAmount) === presetVal;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setCustomAmount(presetVal.toString())}
                    className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                    }`}
                  >
                    {preset.label} (₦{presetVal.toLocaleString('en-NG')})
                  </button>
                );
              })}
            </div>

            <div className="p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-800 font-medium flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>To avoid irregular micro-payments, installment payments can be any amount of at least 20% of your current balance owed.</span>
            </div>

            <p className="text-[11px] text-slate-500 font-medium">
              Remaining balance after this installment: <span className="font-bold text-slate-800">₦{Math.max(0, summary.balance_owed - (parseFloat(customAmount) || 0)).toLocaleString('en-NG')}</span>
            </p>
          </div>
        )}

        {/* Paystack Channel Info */}
        <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2 font-extrabold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-violet-600" /> With Paystack, parents can pay using:
          </div>
          <ul className="list-disc list-inside text-slate-600 font-semibold space-y-1 pl-1 text-[11px]">
            <li><strong className="text-slate-800">Debit/Credit Card</strong> (Mastercard, Visa, Verve, PIN & 3D Secure OTP)</li>
            <li><strong className="text-slate-800">Bank Transfer</strong> (Automated Paystack Virtual Account Transfer)</li>
            <li><strong className="text-slate-800">USSD</strong> (Instant Bank Shortcodes e.g., *737*, *966*, *901#)</li>
            <li><strong className="text-slate-800">Bank Account</strong> (Direct Bank Account Debit - Access, GTBank, Zenith, First Bank, Kuda)</li>
          </ul>
        </div>

        {/* Checkout Trigger */}
        <button
          type="submit"
          disabled={amountToPay <= 0}
          className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-lg shadow-violet-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Lock className="w-4 h-4" />
          <span>Launch Paystack Gateway ₦{amountToPay.toLocaleString('en-NG')}</span>
        </button>

      </form>

      {/* Paystack Interactive Modal */}
      {showPaystackModal && (
        <PaystackModal
          isOpen={showPaystackModal}
          studentId={student.id}
          studentName={student.full_name}
          amount={amountToPay}
          email={student.guardian?.email || 'parent@gmail.com'}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPaystackModal(false)}
        />
      )}

      {/* Receipt Modal */}
      {receiptIssued && (
        <ReceiptModal
          payment={receiptIssued.payment}
          receipt={receiptIssued.receipt}
          feeSummary={feeService.getStudentFeeSummary(student.id)}
          onClose={() => {
            setReceiptIssued(null);
            navigate(`/parent/students/${student.id}`);
          }}
        />
      )}

    </div>
  );
};
