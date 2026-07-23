import React, { useState } from 'react';
import { feeService } from '../../services/feeService';
import { exportToCSV } from '../../utils/csvExporter';
import { FileText, Download, Filter, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'collection' | 'defaulters'>('collection');
  const [selectedTermId, setSelectedTermId] = useState(feeService.getCurrentSession().id);

  const sessions = feeService.getSessions();
  const metrics = feeService.getAdminDashboardMetrics(selectedTermId);
  const students = feeService.getStudents();

  // Defaulters list computation
  const defaultersList = students.map(s => {
    const summary = feeService.getStudentFeeSummary(s.id, selectedTermId);
    return {
      student: s,
      summary
    };
  }).filter(item => item.summary && item.summary.balance_owed > 0);

  const handleExportCollectionCSV = () => {
    const rows = metrics.classBreakdown.map(c => ({
      Class: c.class_name,
      StudentCount: c.student_count,
      ExpectedAmount: c.expected,
      CollectedAmount: c.collected,
      OutstandingBalance: c.outstanding
    }));
    exportToCSV(`Termly_Collection_Report_${metrics.term.session}_${metrics.term.term}_Term`, rows);
  };

  const handleExportDefaultersCSV = () => {
    const rows = defaultersList.map(item => ({
      AdmissionNo: item.student.admission_no,
      StudentName: item.student.full_name,
      Class: `${item.student.school_class?.name || ''} ${item.student.school_class?.arm || ''}`,
      GuardianName: item.student.guardian?.full_name || '',
      GuardianPhone: item.student.guardian?.phone || '',
      TotalFeesDue: item.summary?.total_fees_due || 0,
      TotalPaid: item.summary?.total_paid || 0,
      OutstandingBalance: item.summary?.balance_owed || 0
    }));
    exportToCSV(`Defaulters_Outstanding_Report_${metrics.term.session}_${metrics.term.term}_Term`, rows);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Financial Reports & Defaulter Audit</h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate and export termly collection & outstanding balance summaries
          </p>
        </div>

        {/* Term Dropdown */}
        <div className="flex items-center space-x-3 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">Term:</span>
          <select
            value={selectedTermId}
            onChange={(e) => setSelectedTermId(e.target.value)}
            className="bg-white text-xs font-bold text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300"
          >
            {sessions.map(s => (
              <option key={s.id} value={s.id}>
                {s.session} — {s.term} Term
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold space-x-4">
        <button
          onClick={() => setActiveTab('collection')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'collection' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Termly Collection Summary
        </button>
        <button
          onClick={() => setActiveTab('defaulters')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'defaulters' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Outstanding Balance ("Defaulters List") ({defaultersList.length})
        </button>
      </div>

      {/* TAB 1: Collection Report */}
      {activeTab === 'collection' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">Termly Fee Collections by Class</h3>
            <button
              onClick={handleExportCollectionCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md transition"
            >
              <Download className="w-4 h-4" /> Download Collection CSV
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Class Division</th>
                  <th className="py-3.5 px-4 text-center">Students</th>
                  <th className="py-3.5 px-4 text-right">Expected Total</th>
                  <th className="py-3.5 px-4 text-right">Collected Amount</th>
                  <th className="py-3.5 px-4 text-right">Outstanding Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {metrics.classBreakdown.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{row.class_name}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-600">{row.student_count}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">₦{row.expected.toLocaleString('en-NG')}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600">₦{row.collected.toLocaleString('en-NG')}</td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-amber-700">₦{row.outstanding.toLocaleString('en-NG')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Defaulters Report */}
      {activeTab === 'defaulters' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">Defaulters List (Students with Fee Balances)</h3>
            <button
              onClick={handleExportDefaultersCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs shadow-md transition"
            >
              <Download className="w-4 h-4" /> Download Defaulters List (CSV)
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Class</th>
                  <th className="py-3.5 px-4">Guardian Contact</th>
                  <th className="py-3.5 px-4 text-right">Total Fees</th>
                  <th className="py-3.5 px-4 text-right">Amount Paid</th>
                  <th className="py-3.5 px-4 text-right">Balance Owed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {defaultersList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      Great news! All active students have fully settled fees for this term.
                    </td>
                  </tr>
                ) : (
                  defaultersList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.student.full_name}
                        <span className="block text-[11px] font-normal text-slate-400">{item.student.admission_no}</span>
                      </td>
                      <td className="py-3.5 px-4">{item.student.school_class?.name} {item.student.school_class?.arm}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{item.student.guardian?.full_name}</span>
                        <span className="block text-[11px] text-slate-400">{item.student.guardian?.phone}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">₦{item.summary?.total_fees_due.toLocaleString('en-NG')}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-600">₦{item.summary?.total_paid.toLocaleString('en-NG')}</td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-amber-700 text-sm">₦{item.summary?.balance_owed.toLocaleString('en-NG')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
