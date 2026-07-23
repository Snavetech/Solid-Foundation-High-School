import React, { useState, useEffect } from 'react';
import { Payment, Receipt } from '../../types/database';
import { feeService } from '../../services/feeService';
import { SCHOOL_INFO } from '../../services/mockData';
import {
  CreditCard, Building2, PhoneCall, ShieldCheck, Lock, Landmark,
  X, CheckCircle2, Copy, Check, Clock, Loader2, ArrowRight
} from 'lucide-react';

interface PaystackModalProps {
  isOpen: boolean;
  studentId: string;
  studentName: string;
  amount: number;
  email: string;
  onSuccess: (payment: Payment, receipt: Receipt) => void;
  onClose: () => void;
}

export const PaystackModal: React.FC<PaystackModalProps> = ({
  isOpen,
  studentId,
  studentName,
  amount,
  email,
  onSuccess,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'card' | 'transfer' | 'ussd' | 'bank_account'>('card');

  // Card Form State
  const [cardNumber, setCardNumber] = useState('4084 0000 0000 0000');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('321');
  const [cardPin, setCardPin] = useState('1234');
  const [pinStep, setPinStep] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('123456');

  // Bank Transfer State
  const accountNumber = '9920384719';
  const bankName = 'Wema Bank / Paystack';
  const accountName = 'Solid Foundation High School';
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 mins timer

  // Bank Account State
  const [selectedBank, setSelectedBank] = useState('Access Bank');
  const [bankAccNumber, setBankAccNumber] = useState('0123456789');
  const [bankAccPhone, setBankAccPhone] = useState('08012345678');
  const [bankAccOtpStep, setBankAccOtpStep] = useState(false);
  const [bankAccOtp, setBankAccOtp] = useState('123456');

  // Loading & Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Timer countdown for bank transfer
  useEffect(() => {
    if (!isOpen || activeTab !== 'transfer') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to trigger successful payment
  const completePayment = (refPrefix: string) => {
    setIsProcessing(true);
    setProcessingMessage('Verifying payment with Paystack engine...');

    setTimeout(() => {
      try {
        const ref = `PAYSK-${new Date().getFullYear()}-${Math.floor(1000000 + Math.random() * 9000000)}`;
        const result = feeService.recordPayment(
          studentId,
          amount,
          'paystack',
          undefined,
          ref
        );

        setIsProcessing(false);
        setIsSuccess(true);

        setTimeout(() => {
          onSuccess(result.payment, result.receipt);
        }, 1000);
      } catch (err) {
        setIsProcessing(false);
        alert('Failed to complete transaction.');
      }
    }, 1500);
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinStep) {
      setPinStep(true);
      return;
    }
    if (!otpStep) {
      setOtpStep(true);
      return;
    }
    completePayment('CARD');
  };

  const handleTransferConfirm = () => {
    setIsProcessing(true);
    setProcessingMessage('Checking for bank transfer credit notification...');
    setTimeout(() => {
      completePayment('TRF');
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Authentic Paystack Header */}
        <div className="bg-[#011b33] text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#09a5db] text-white flex items-center justify-center font-black text-sm shadow-md">
              P
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm text-white">{SCHOOL_INFO.name}</span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">{email}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">PAYING</span>
            <span className="text-lg font-black text-[#09a5db]">
              ₦{amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Paystack Channel Navigation Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50 text-[11px] font-extrabold">
          <button
            onClick={() => { setActiveTab('card'); setPinStep(false); setOtpStep(false); }}
            className={`flex-1 py-3 px-1.5 flex items-center justify-center gap-1 border-b-2 transition ${
              activeTab === 'card'
                ? 'border-[#09a5db] text-[#09a5db] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Debit/Credit Card</span>
          </button>

          <button
            onClick={() => setActiveTab('transfer')}
            className={`flex-1 py-3 px-1.5 flex items-center justify-center gap-1 border-b-2 transition ${
              activeTab === 'transfer'
                ? 'border-[#09a5db] text-[#09a5db] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Bank Transfer</span>
          </button>

          <button
            onClick={() => setActiveTab('ussd')}
            className={`flex-1 py-3 px-1.5 flex items-center justify-center gap-1 border-b-2 transition ${
              activeTab === 'ussd'
                ? 'border-[#09a5db] text-[#09a5db] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>USSD</span>
          </button>

          <button
            onClick={() => { setActiveTab('bank_account'); setBankAccOtpStep(false); }}
            className={`flex-1 py-3 px-1.5 flex items-center justify-center gap-1 border-b-2 transition ${
              activeTab === 'bank_account'
                ? 'border-[#09a5db] text-[#09a5db] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Bank Account</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 relative">
          
          {/* Overlay Processing Spinner */}
          {isProcessing && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center space-y-3 p-6 text-center">
              <Loader2 className="w-10 h-10 text-[#09a5db] animate-spin" />
              <p className="font-extrabold text-slate-900 text-sm">{processingMessage}</p>
              <p className="text-xs text-slate-400">Please do not close this window</p>
            </div>
          )}

          {/* Success Animated View */}
          {isSuccess && (
            <div className="py-8 flex flex-col items-center justify-center space-y-3 text-center animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl shadow-lg">
                ✓
              </div>
              <h3 className="text-xl font-black text-slate-900">Payment Successful!</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Your payment of ₦{amount.toLocaleString('en-NG')} has been verified by Paystack and logged to the student bursary ledger.
              </p>
            </div>
          )}

          {!isProcessing && !isSuccess && (
            <>
              {/* TAB 1: CREDIT CARD */}
              {activeTab === 'card' && (
                <form onSubmit={handleCardSubmit} className="space-y-4">
                  
                  {!pinStep && !otpStep && (
                    <>
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-1">
                          CARD NUMBER
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#09a5db]"
                            placeholder="4084 0000 0000 0000"
                          />
                          <div className="absolute right-3 top-2.5 flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full uppercase">
                            Visa / Verve
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-extrabold text-slate-700 mb-1">
                            CARD EXPIRY
                          </label>
                          <input
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#09a5db]"
                            placeholder="MM / YY"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-extrabold text-slate-700 mb-1">
                            CVV
                          </label>
                          <input
                            type="password"
                            maxLength={3}
                            required
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#09a5db]"
                            placeholder="123"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 px-4 bg-[#09a5db] hover:bg-[#078dbb] text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-[#09a5db]/25 transition flex items-center justify-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Pay ₦{amount.toLocaleString('en-NG')}</span>
                      </button>
                    </>
                  )}

                  {/* Step 2: 4-Digit Card PIN */}
                  {pinStep && !otpStep && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="text-center space-y-1">
                        <h4 className="text-sm font-black text-slate-900">Enter Card 4-Digit PIN</h4>
                        <p className="text-xs text-slate-500">Please enter your ATM card PIN to authorize payment</p>
                      </div>

                      <div className="max-w-xs mx-auto">
                        <input
                          type="password"
                          maxLength={4}
                          required
                          value={cardPin}
                          onChange={(e) => setCardPin(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-mono text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-[#09a5db]"
                          placeholder="••••"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 px-4 bg-[#09a5db] hover:bg-[#078dbb] text-white font-extrabold text-xs rounded-2xl shadow-lg transition"
                      >
                        Authorize & Send OTP
                      </button>
                    </div>
                  )}

                  {/* Step 3: 3D Secure OTP */}
                  {otpStep && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="text-center space-y-1">
                        <h4 className="text-sm font-black text-slate-900">3D Secure OTP Verification</h4>
                        <p className="text-xs text-slate-500">Enter the 6-digit OTP code sent to your registered phone number</p>
                      </div>

                      <div className="max-w-xs mx-auto">
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-mono text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-[#09a5db]"
                          placeholder="123456"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 px-4 bg-[#09a5db] hover:bg-[#078dbb] text-white font-extrabold text-xs rounded-2xl shadow-lg transition"
                      >
                        Complete Payment
                      </button>
                    </div>
                  )}

                </form>
              )}

              {/* TAB 2: BANK TRANSFER */}
              {activeTab === 'transfer' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-center space-y-2">
                    <p className="text-xs font-semibold text-slate-500">Transfer ₦{amount.toLocaleString('en-NG')} to the account below</p>
                    
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 inline-flex items-center gap-3 shadow-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PAYSTACK VIRTUAL ACCOUNT</span>
                        <span className="text-xl font-black text-slate-900 font-mono tracking-wider">{accountNumber}</span>
                        <span className="text-xs font-bold text-[#09a5db] block">{bankName}</span>
                      </div>

                      <button
                        onClick={handleCopyAccount}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition font-bold text-xs flex items-center gap-1"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <p className="text-[11px] font-bold text-slate-600">
                      Account Name: <span className="text-slate-900">{accountName}</span>
                    </p>
                  </div>

                  {/* Timer */}
                  <div className="flex items-center justify-center space-x-2 text-xs font-bold text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Account expires in <strong className="font-mono text-sm">{formatTimer(timeLeft)}</strong></span>
                  </div>

                  <button
                    onClick={handleTransferConfirm}
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <span>I have sent the money</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* TAB 3: USSD CODE */}
              {activeTab === 'ussd' && (
                <div className="space-y-4">
                  <p className="text-xs font-medium text-slate-500 text-center">
                    Select your bank to generate the instant USSD payment string:
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                    <button
                      onClick={() => handleTransferConfirm()}
                      className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left space-y-1"
                    >
                      <span className="text-slate-900 block font-extrabold">GTBank</span>
                      <span className="font-mono text-[11px] text-[#09a5db]">*737*000*{amount}#</span>
                    </button>

                    <button
                      onClick={() => handleTransferConfirm()}
                      className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left space-y-1"
                    >
                      <span className="text-slate-900 block font-extrabold">Zenith Bank</span>
                      <span className="font-mono text-[11px] text-[#09a5db]">*966*000*{amount}#</span>
                    </button>

                    <button
                      onClick={() => handleTransferConfirm()}
                      className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left space-y-1"
                    >
                      <span className="text-slate-900 block font-extrabold">Access Bank</span>
                      <span className="font-mono text-[11px] text-[#09a5db]">*901*000*{amount}#</span>
                    </button>

                    <button
                      onClick={() => handleTransferConfirm()}
                      className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left space-y-1"
                    >
                      <span className="text-slate-900 block font-extrabold">UBA</span>
                      <span className="font-mono text-[11px] text-[#09a5db]">*919*000*{amount}#</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center">
                    Dial the USSD string on your mobile phone to complete payment
                  </p>
                </div>
              )}

              {/* TAB 4: BANK ACCOUNT */}
              {activeTab === 'bank_account' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!bankAccOtpStep) {
                      setBankAccOtpStep(true);
                      return;
                    }
                    completePayment('ACC');
                  }}
                  className="space-y-4"
                >
                  {!bankAccOtpStep ? (
                    <>
                      <div className="text-center space-y-1">
                        <h4 className="text-xs font-bold text-slate-500">Pay directly from your Bank Account</h4>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-1">
                          SELECT YOUR BANK
                        </label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#09a5db]"
                        >
                          <option value="Access Bank">Access Bank</option>
                          <option value="GTBank">Guaranty Trust Bank (GTBank)</option>
                          <option value="Zenith Bank">Zenith Bank</option>
                          <option value="First Bank">First Bank of Nigeria</option>
                          <option value="UBA">United Bank for Africa (UBA)</option>
                          <option value="Kuda Bank">Kuda Microfinance Bank</option>
                          <option value="Sterling Bank">Sterling Bank</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-extrabold text-slate-700 mb-1">
                            ACCOUNT NUMBER
                          </label>
                          <input
                            type="text"
                            maxLength={10}
                            required
                            value={bankAccNumber}
                            onChange={(e) => setBankAccNumber(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#09a5db]"
                            placeholder="0123456789"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold text-slate-700 mb-1">
                            REGISTERED PHONE NO
                          </label>
                          <input
                            type="text"
                            maxLength={11}
                            required
                            value={bankAccPhone}
                            onChange={(e) => setBankAccPhone(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#09a5db]"
                            placeholder="08012345678"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 px-4 bg-[#09a5db] hover:bg-[#078dbb] text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-[#09a5db]/25 transition flex items-center justify-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Authorize Direct Account Debit ₦{amount.toLocaleString('en-NG')}</span>
                      </button>
                    </>
                  ) : (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="text-center space-y-1">
                        <h4 className="text-sm font-black text-slate-900">{selectedBank} Direct Debit Authorization</h4>
                        <p className="text-xs text-slate-500">
                          Enter the 6-digit OTP code sent to {bankAccPhone || 'your registered phone'}
                        </p>
                      </div>

                      <div className="max-w-xs mx-auto">
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={bankAccOtp}
                          onChange={(e) => setBankAccOtp(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-mono text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-[#09a5db]"
                          placeholder="123456"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 px-4 bg-[#09a5db] hover:bg-[#078dbb] text-white font-extrabold text-xs rounded-2xl shadow-lg transition"
                      >
                        Authorize & Complete Payment
                      </button>
                    </div>
                  )}
                </form>
              )}

              {/* Paystack Security Footer */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
                <div className="flex items-center gap-1 font-semibold text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-[#09a5db]" />
                  <span>Secured by Paystack</span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel Payment
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
