import React, { useState } from 'react';
import { feeService } from '../../services/feeService';
import { Calendar, Plus, CheckCircle2 } from 'lucide-react';

export const SessionsPage: React.FC = () => {
  const [sessions, setSessions] = useState(feeService.getSessions());
  const [sessionName, setSessionName] = useState('2025/2026');
  const [termName, setTermName] = useState<'First' | 'Second' | 'Third'>('First');

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    feeService.addSession(sessionName, termName);
    setSessions(feeService.getSessions());
  };

  const handleSetCurrent = (id: string) => {
    feeService.setCurrentSession(id);
    setSessions(feeService.getSessions());
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Academic Sessions & Terms</h1>
        <p className="text-xs text-slate-500 mt-1">
          Set the active term that drives fee structures, parent balances, and financial reporting app-wide.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Create Term Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-fit">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" /> Create Academic Term
          </h3>

          <form onSubmit={handleAddSession} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Academic Session Year</label>
              <input
                type="text"
                required
                placeholder="e.g. 2025/2026"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Term</label>
              <select
                value={termName}
                onChange={(e) => setTermName(e.target.value as any)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-semibold"
              >
                <option value="First">First Term</option>
                <option value="Second">Second Term</option>
                <option value="Third">Third Term</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition"
            >
              Save Academic Term
            </button>
          </form>
        </div>

        {/* Sessions List */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">Academic Terms History</h3>

          <div className="space-y-3">
            {sessions.map(s => (
              <div
                key={s.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row gap-3 sm:items-center justify-between transition ${
                  s.is_current ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl ${s.is_current ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">
                      {s.session} — <span className="text-emerald-700">{s.term} Term</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      {s.is_current ? 'Active default term app-wide' : 'Past/Future term'}
                    </p>
                  </div>
                </div>

                {s.is_current ? (
                  <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-extrabold text-xs flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE TERM
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetCurrent(s.id)}
                    className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg transition"
                  >
                    Set as Current
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
