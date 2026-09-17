import React, { useState, useEffect } from 'react';
import { feeService } from '../../services/feeService';
import { UserCheck, Plus, GraduationCap } from 'lucide-react';

export const ClassesPage: React.FC = () => {
  const [classes, setClasses] = useState(feeService.getClasses());
  const [name, setName] = useState('');
  const [arm, setArm] = useState('');

  useEffect(() => {
    const updateClasses = () => setClasses(feeService.getClasses());
    const unsubscribe = feeService.subscribe(updateClasses);
    return () => unsubscribe();
  }, []);

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    feeService.addClass(name, arm);
    setClasses(feeService.getClasses());
    setName('');
    setArm('');
  };

  const students = feeService.getStudents();

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Classes & Arms Management</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure academic class divisions (e.g. JSS1 A, JSS1 B, SS2 Science)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Add Class Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-fit">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" /> Create Class / Arm
          </h3>

          <form onSubmit={handleAddClass} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Class Level Name</label>
              <input
                type="text"
                required
                placeholder="e.g. JSS 1, SS 2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Arm / Stream (Optional)</label>
              <input
                type="text"
                placeholder="e.g. A, B, Science, Commercial"
                value={arm}
                onChange={(e) => setArm(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition"
            >
              Add Class Division
            </button>
          </form>
        </div>

        {/* Existing Classes List */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">Enrolled Classes Overview</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {classes.map(c => {
              const enrolled = students.filter(s => s.class_id === c.id);
              return (
                <div key={c.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-slate-900 text-lg">{c.name} <span className="text-blue-600">{c.arm}</span></h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> {enrolled.length} Active Students
                    </p>
                  </div>
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    {enrolled.length}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
