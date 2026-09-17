import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { feeService } from '../../services/feeService';
import { PaymentMethod, Payment, Receipt } from '../../types/database';
import { ReceiptModal } from '../../components/common/ReceiptModal';
import { PlusCircle, CheckCircle2, User, CreditCard, Banknote, Filter } from 'lucide-react';

export const RecordPaymentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialStudentId = searchParams.get('student_id') || '';

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [studentId, setStudentId] = useState(initialStudentId);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('bank_transfer');
  const [reference, setReference] = useState('');
  const [feeStructureId, setFeeStructureId] = useState('');
  const [receiptIssued, setReceiptIssued] = useState<{ payment: Payment; receipt: Receipt } | null>(null);

  const classes = feeService.getClasses();
  const students = feeService.getStudents();

  // If initial student ID is passed, auto-select their class
  useEffect(() => {
    if (initialStudentId) {
      const s = feeService.getStudentById(initialStudentId);
      if (s) {
        setSelectedClassId(s.class_id);
      }
    }
  }, [initialStudentId]);

  const filteredStudents = selectedClassId
    ? students.filter(s => s.class_id === selectedClassId)
    : students;

  const selectedStudent = studentId ? feeService.getStudentById(studentId) : undefined;
  const studentSummary = studentId ? feeService.getStudentFeeSummary(studentId) : undefined;

  const minInstallmentAmount = studentSummary && studentSummary.balance_owed > 0
    ? Math.ceil(studentSummary.balance_owed * 0.20)
    : 0;

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !amount) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    if (studentSummary && studentSummary.balance_owed > 0) {
      if (numAmount < studentSummary.balance_owed && numAmount < minInstallmentAmount) {
        alert(`To prevent irregular micro-payments, manual installment payments must be at least 20% of the student's current balance (Minimum: ₦${minInstallmentAmount.toLocaleString('en-NG')}).`);
        return;
      }

      if (numAmount > studentSummary.balance_owed) {
        alert(`Payment amount (₦${numAmount.toLocaleString('en-NG')}) cannot exceed the student's current balance owed (₦${studentSummary.balance_owed.toLocaleString('en-NG')}).`);
        return;
      }
    }

    const res = feeService.recordPayment(
      studentId,
      numAmount,
      method,
      feeStructureId || undefined,
      reference || undefined
    );

    setReceiptIssued(res);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Record Manual In-Person Payment</h1>
        <p className="text-xs text-slate-500 mt-1">
          Log direct bank transfer payments made at the Bursary counter
        </p>
      </div>

      <form onSubmit={handleRecordPayment} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        
        {/* Step 1 & Step 2: Class Filter & Student Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Step 1: Select Class */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center justify-between">
              <span>Step 1: Select Class</span>
              <span className="text-[10px] text-indigo-600 font-bold uppercase">Filter</span>
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setStudentId('');
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Classes (Show All {students.length} Students)</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.arm}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Select Student */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center justify-between">
              <span>Step 2: Select Student *</span>
              <span className="text-[10px] text-slate-400 font-medium">
                ({filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'})
              </span>
            </label>
            <select
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Choose student from list...</option>
              {filteredStudents.map(s => (
                <option key={s.id} value={s.id}>
                  {s.full_name} ({s.admission_no}) — {s.school_class?.name} {s.school_class?.arm}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Selected Student Ledger Info Box */}
        {studentSummary && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row gap-2 sm:items-center justify-between text-xs">
            <div>
              <span className="font-bold text-emerald-900 block">{studentSummary.student.full_name}</span>
              <span className="text-emerald-700">Total Billed: ₦{studentSummary.total_fees_due.toLocaleString('en-NG')} | Paid so far: ₦{studentSummary.total_paid.toLocaleString('en-NG')}</span>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Outstanding Balance</span>
              <span className="font-extrabold text-amber-700 text-sm">₦{studentSummary.balance_owed.toLocaleString('en-NG')}</span>
            </div>
          </div>
        )}

        {/* Specific Fee Item Link (Optional) */}
        {studentSummary && studentSummary.fee_breakdown.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Apply Payment to Specific Fee Item (Optional)
            </label>
            <select
              value={feeStructureId}
              onChange={(e) => setFeeStructureId(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
            >
              <option value="">General Term Balance (Default)</option>
              {studentSummary.fee_breakdown.map(b => (
                <option key={b.fee_structure.id} value={b.fee_structure.id}>
                  {b.fee_structure.fee_item} — ₦{b.fee_structure.amount.toLocaleString('en-NG')} (Bal: ₦{b.balance.toLocaleString('en-NG')})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Payment Method *
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
            >
              <option value="bank_transfer">Bank Teller / Transfer</option>
              <option value="paystack">Paystack Online Entry</option>
            </select>
          </div>

          {/* Amount Paid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Amount Paid (₦) *</span>
              {studentSummary && studentSummary.balance_owed > 0 && (
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full">
                  Min 20%: ₦{minInstallmentAmount.toLocaleString('en-NG')}
                </span>
              )}
            </label>
            <input
              type="number"
              required
              min={minInstallmentAmount > 0 ? minInstallmentAmount : "100"}
              max={studentSummary?.balance_owed}
              step="any"
              placeholder={minInstallmentAmount > 0 ? `Min 20%: ₦${minInstallmentAmount.toLocaleString('en-NG')}` : "e.g. 50000"}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
            {studentSummary && studentSummary.balance_owed > 0 && (
              <>
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {[
                    { label: 'Min 20%', pct: 0.20 },
                    { label: '50%', pct: 0.50 },
                    { label: '75%', pct: 0.75 },
                    { label: '100% Full', pct: 1.0 },
                  ].map(preset => {
                    const presetVal = Math.ceil(studentSummary.balance_owed * preset.pct);
                    const isSelected = parseFloat(amount) === presetVal;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setAmount(presetVal.toString())}
                        className={`text-[11px] px-2 py-0.5 rounded-lg font-bold border transition ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                        }`}
                      >
                        {preset.label} (₦{presetVal.toLocaleString('en-NG')})
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">
                  Policy: Installments can be any amount of at least 20% (₦{minInstallmentAmount.toLocaleString('en-NG')}) up to full balance owed (₦{studentSummary.balance_owed.toLocaleString('en-NG')}).
                </p>
              </>
            )}
          </div>

        </div>

        {/* Bank Transfer Teller / Ref (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Custom Bank Teller / Reference (Optional)
          </label>
          <input
            type="text"
            placeholder="Auto-generated if left blank"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" /> Record Payment & Auto-Issue Receipt
        </button>

      </form>

      {/* Receipt Modal */}
      {receiptIssued && (
        <ReceiptModal
          payment={receiptIssued.payment}
          receipt={receiptIssued.receipt}
          feeSummary={studentId ? feeService.getStudentFeeSummary(studentId) : undefined}
          onClose={() => {
            setReceiptIssued(null);
            navigate('/admin/payments');
          }}
        />
      )}

    </div>
  );
};
