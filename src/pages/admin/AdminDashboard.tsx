import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { feeService } from '../../services/feeService';
import { Payment, Receipt } from '../../types/database';
import { ReceiptModal } from '../../components/common/ReceiptModal';
import {
  TrendingUp, CreditCard, AlertTriangle, Users, ArrowUpRight,
  Filter, CheckCircle2, FileText, PlusCircle, Sparkles, ArrowRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [selectedTermId, setSelectedTermId] = useState(feeService.getCurrentSession().id);
  const [selectedReceipt, setSelectedReceipt] = useState<{ payment: Payment; receipt: Receipt } | null>(null);
  const [, setTick] = useState(0);

  // Subscribe to real-time changes across devices
  useEffect(() => {
    const unsubscribe = feeService.subscribe(() => {
      setTick(t => t + 1);
    });
    return () => unsubscribe();
  }, []);

  const sessions = feeService.getSessions();
  const metrics = feeService.getAdminDashboardMetrics(selectedTermId);

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
        {/* Subtle Sparkle Decors */}
        <Sparkles className="w-48 h-48 text-white/10 absolute -top-10 -right-10 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="px-3 py-1 bg-white/20 text-white font-bold text-[10px] rounded-full uppercase tracking-widest backdrop-blur-md inline-block">
              BURSARY MANAGEMENT HUB
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Bursary Financial Overview
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 font-medium">
              Real-time fee collection, student account balances, and automated receipts for <span className="font-bold underline text-white">{metrics.term.session} ({metrics.term.term} Term)</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/admin/payments/new"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-full shadow-lg transition flex items-center gap-2 group"
            >
              <span>Record Fee Payment</span>
              <ArrowRight className="w-4 h-4 text-violet-400 group-hover:translate-x-0.5 transition" />
            </Link>
          </div>
        </div>
      </div>

      {/* Term Selector Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-bold uppercase tracking-wider px-2">
          <Filter className="w-4 h-4 text-violet-600" />
          <span>Active Academic Session Filter</span>
        </div>

        <select
          value={selectedTermId}
          onChange={(e) => setSelectedTermId(e.target.value)}
          className="bg-slate-50 text-xs font-extrabold text-slate-900 px-4 py-2 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-xs"
        >
          {sessions.map(s => (
            <option key={s.id} value={s.id}>
              {s.session} — {s.term} Term {s.is_current ? '(Current Active Term)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Top 4 KPI Cards (Reference Aesthetic Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Expected */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Expected</span>
            <div className="p-2.5 bg-violet-50 text-violet-600 rounded-2xl shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">
              ₦{metrics.totalExpected.toLocaleString('en-NG')}
            </span>
            <p className="mt-1 text-[11px] font-medium text-slate-400">Fees billed for {metrics.active_students_count} active students</p>
          </div>
        </div>

        {/* Card 2: Total Collected */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Collected</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-600 block">
              ₦{metrics.totalCollected.toLocaleString('en-NG')}
            </span>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <span>{metrics.totalExpected > 0 ? Math.round((metrics.totalCollected / metrics.totalExpected) * 100) : 0}% of target realized</span>
            </div>
          </div>
        </div>

        {/* Card 3: Outstanding Balance */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Outstanding Balance</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-amber-600 block">
              ₦{metrics.outstandingBalance.toLocaleString('en-NG')}
            </span>
            <p className="mt-1 text-[11px] font-medium text-slate-400">Uncollected term fees</p>
          </div>
        </div>

        {/* Card 4: Active Enrolled Students */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Students</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">
              {metrics.active_students_count}
            </span>
            <p className="mt-1 text-[11px] font-medium text-slate-400">Across 13 classes & departments</p>
          </div>
        </div>

      </div>

      {/* Class Collection Bar Chart (Reference Purple Colors) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
        <div>
          <h3 className="font-extrabold text-base text-slate-900">Class Collection Breakdown</h3>
          <p className="text-xs text-slate-400 font-medium">Comparing expected revenue vs realized payments in Naira</p>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.classBreakdown} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="class_name" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `₦${(v / 1000)}k`} />
              <Tooltip
                formatter={(value: any) => [`₦${Number(value).toLocaleString('en-NG')}`, '']}
                contentStyle={{ backgroundColor: '#1e1b4b', borderRadius: '16px', color: '#fff', fontSize: '12px', border: 'none' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
              <Bar dataKey="expected" name="Expected Total" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
              <Bar dataKey="collected" name="Amount Collected" fill="#6366f1" radius={[6, 6, 0, 0]} />
              <Bar dataKey="outstanding" name="Outstanding Balance" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Recent Payment Transactions</h3>
            <p className="text-xs text-slate-400 font-medium">Latest Paystack online and Bursary counter bank transfer receipts</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {metrics.recentPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No transactions recorded for this term yet.
                  </td>
                </tr>
              ) : (
                metrics.recentPayments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {p.student?.full_name || 'N/A'}
                      <span className="block text-[11px] font-normal text-slate-400">{p.student?.admission_no}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-xl text-[11px]">
                        {p.student?.school_class?.name} {p.student?.school_class?.arm}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 capitalize">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        p.method === 'paystack' || p.method === 'card' ? 'bg-indigo-100 text-indigo-700' :
                        p.method === 'bank_account' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-violet-100 text-violet-700'
                      }`}>
                        {p.method.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">{p.reference}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(p.paid_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm">
                      ₦{p.amount.toLocaleString('en-NG')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleOpenReceipt(p)}
                        className="p-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-xl transition font-bold text-xs inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-violet-600" /> View
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
          feeSummary={feeService.getStudentFeeSummary(selectedReceipt.payment.student_id, selectedTermId)}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

    </div>
  );
};
