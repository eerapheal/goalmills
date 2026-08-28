'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import AdminNavBar from '@/components/admin/AdminNavBar';
import { Employee, EmployeeTrainingProgress, TrainingModuleItem } from '@goalmills/types';
import {
  FiArrowLeft,
  FiAward,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiDollarSign,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiExternalLink,
  FiEdit3,
  FiCheckSquare,
} from 'react-icons/fi';

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [training, setTraining] = useState<EmployeeTrainingProgress | null>(null);
  const [curriculum, setCurriculum] = useState<TrainingModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'training' | 'reports' | 'evaluations' | 'payroll'>('training');
  const [updatingModule, setUpdatingModule] = useState<string | null>(null);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const [empRes, trainRes] = await Promise.all([
        fetch(`/api/admin/employees/${id}`),
        fetch(`/api/training?employeeId=${id}`),
      ]);

      const empJson = await empRes.json();
      const trainJson = await trainRes.json();

      if (empJson.success) setEmployee(empJson.data);
      if (trainJson.success) {
        setTraining(trainJson.data);
        setCurriculum(trainJson.curriculum);
      }
    } catch (err) {
      console.error('Error fetching employee details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [id]);

  const handleTaskToggle = async (moduleId: string, task: string, currentCompleted: string[]) => {
    try {
      const exists = currentCompleted.includes(task);
      const updated = exists
        ? currentCompleted.filter((t) => t !== task)
        : [...currentCompleted, task];

      const modItem = curriculum.find((c) => c.id === moduleId);
      const totalTasks = modItem ? modItem.checklist.length : 5;
      const isComplete = updated.length === totalTasks;

      await fetch('/api/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: id,
          moduleId,
          completedTasks: updated,
          status: isComplete ? 'completed' : updated.length > 0 ? 'in_progress' : 'not_started',
        }),
      });

      fetchEmployeeData();
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white">
        Loading employee profile...
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-background p-6 pt-[95px] text-white flex flex-col items-center justify-center space-y-4">
        <p className="text-red-400 font-bold">Employee not found.</p>
        <Link href="/admin/employees" className="px-4 py-2 bg-blue-600 rounded-xl text-xs font-bold">
          &larr; Back to Employees
        </Link>
      </div>
    );
  }

  const isTraining = employee.status === 'training';
  const progressPercent = training?.overallProgressPercent || 0;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 pt-[85px] sm:pt-[95px] text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminNavBar />

        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/employees"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white"
          >
            <FiArrowLeft size={14} /> Back to Staff Directory
          </Link>

          <Link
            href={`/admin/employees/${id}/appointment`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
          >
            <FiFileText size={14} />
            <span>View Appointment Contract</span>
          </Link>
        </div>

        {/* Profile Card */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl uppercase shadow-lg shadow-blue-500/20">
                {employee.fullName.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">{employee.fullName}</h1>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      isTraining
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {isTraining ? '⚡ 30-Day Training' : '✓ Active Staff'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-300 mt-1">
                  {employee.jobTitle} • <span className="text-amber-400 font-bold">{employee.department}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center min-w-[120px]">
                <span className="text-xs text-text-muted block font-bold uppercase">Current Pay</span>
                <span className="text-base font-black text-amber-400">
                  ₦{(employee.currentSalary || 30000).toLocaleString()}
                </span>
                <span className="text-[10px] text-text-muted block">
                  {isTraining ? 'Training Allowance' : 'Regular Salary'}
                </span>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center min-w-[120px]">
                <span className="text-xs text-text-muted block font-bold uppercase">Training Progress</span>
                <span className="text-base font-black text-emerald-400">{progressPercent}%</span>
                <span className="text-[10px] text-text-muted block">11 Modules</span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <FiMail className="text-blue-400" size={16} />
              <span>{employee.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiPhone className="text-emerald-400" size={16} />
              <span>{employee.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiMapPin className="text-amber-400" size={16} />
              <span>{employee.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCalendar className="text-purple-400" size={16} />
              <span>
                Start: {employee.startDate} (Ends: {employee.trainingEndDate})
              </span>
            </div>
          </div>
        </div>

        {/* 30-Day Training Curriculum Matrix */}
        <div className="glass-card rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiAward className="text-amber-400" /> 30-Day Sports Media Training Curriculum
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Learn &rarr; Create &rarr; Publish &rarr; Submit &rarr; Review &rarr; Improve
              </p>
            </div>

            <div className="w-full sm:w-64 bg-slate-900 rounded-full h-3.5 overflow-hidden border border-white/10">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Module Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {curriculum.map((mod) => {
              const userMod = training?.modules?.find((m) => m.moduleId === mod.id);
              const completedTasks = userMod?.completedTasks || [];
              const isCompleted = userMod?.status === 'completed';
              const progressRatio = Math.round((completedTasks.length / mod.checklist.length) * 100);

              return (
                <div
                  key={mod.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isCompleted
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : completedTasks.length > 0
                        ? 'bg-slate-900/90 border-blue-500/30'
                        : 'bg-slate-900/60 border-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-2 py-0.5 rounded-full bg-white/5">
                        {mod.category} • Weight {mod.weightPercent}%
                      </span>
                      <h3 className="text-base font-bold text-white mt-1">{mod.title}</h3>
                    </div>

                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : completedTasks.length > 0
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {isCompleted ? 'Completed' : `${progressRatio}%`}
                    </span>
                  </div>

                  <p className="text-xs text-text-muted mb-4 leading-relaxed">{mod.description}</p>

                  {/* Checklist */}
                  <div className="space-y-2 border-t border-white/5 pt-3">
                    <p className="text-xs font-bold text-slate-300">Practical Training Checklist:</p>
                    {mod.checklist.map((task, idx) => {
                      const done = completedTasks.includes(task);
                      return (
                        <label
                          key={idx}
                          className="flex items-start gap-2.5 text-xs text-slate-300 hover:text-white cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={done}
                            onChange={() => handleTaskToggle(mod.id, task, completedTasks)}
                            className="mt-0.5 rounded border-white/20 bg-slate-950 text-emerald-500 focus:ring-0"
                          />
                          <span className={done ? 'line-through text-slate-500' : ''}>{task}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
