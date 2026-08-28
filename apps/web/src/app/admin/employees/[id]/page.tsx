'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminNavBar from '@/components/admin/AdminNavBar';
import GoalmillsLoader from '@/components/GoalmillsLoader';
import { Employee, EmployeeTrainingProgress } from '@goalmills/types';
import {
  FiArrowLeft,
  FiFileText,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiCheckSquare,
  FiChevronDown,
  FiChevronUp,
  FiTrash2,
} from 'react-icons/fi';
import { GOALMILLS_TRAINING_MODULES } from '@/lib/trainingCurriculum';

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [training, setTraining] = useState<EmployeeTrainingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  const handleDelete = async () => {
    if (!employee) return;
    if (
      !confirm(
        `Are you sure you want to completely delete ${employee.fullName} from the database?\n\nThis will remove their user account, employee profile, training progress, reports, evaluations, and payroll records.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/employees/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        router.push('/admin/employees');
      } else {
        alert(json.error || 'Failed to delete employee');
      }
    } catch (err) {
      console.error('Error deleting employee:', err);
      alert('An error occurred while deleting employee');
    }
  };

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
      if (trainJson.success) setTraining(trainJson.data);
    } catch (err) {
      console.error('Error fetching employee details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [id]);

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const handleToggleTask = async (moduleId: string, task: string, completed: boolean) => {
    try {
      const currentMod = training?.modules?.find((m) => m.moduleId === moduleId);
      const currentTasks = currentMod?.completedTasks || [];
      const updatedTasks = completed
        ? [...currentTasks, task]
        : currentTasks.filter((t) => t !== task);

      const modMeta = GOALMILLS_TRAINING_MODULES.find((m) => m.id === moduleId);
      const isComplete = modMeta ? updatedTasks.length >= modMeta.checklist.length : false;
      const status = isComplete
        ? 'completed'
        : updatedTasks.length > 0
          ? 'in_progress'
          : 'not_started';

      const res = await fetch('/api/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: id,
          moduleId,
          completedTasks: updatedTasks,
          status,
        }),
      });

      if (!res.ok) throw new Error('Failed to update training item');
      fetchEmployeeData();
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <GoalmillsLoader
          size="fullscreen"
          label="GoalMills Staff Hub"
          sublabel="Loading employee training profile & performance records..."
        />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-background p-6 pt-[95px] text-white flex flex-col items-center justify-center space-y-4">
        <p className="text-red-400 font-bold">Employee not found.</p>
        <Link
          href="/admin/employees"
          className="px-4 py-2 bg-blue-600 rounded-xl text-xs font-bold"
        >
          &larr; Back to Employees
        </Link>
      </div>
    );
  }

  const isTraining = employee.status === 'training';
  const progressPercent = training?.overallProgressPercent || 0;

  return (
    <div className="min-h-screen bg-background p-3.5 sm:p-6 pt-[80px] sm:pt-[95px] text-white">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
        <AdminNavBar />

        {/* Top Breadcrumb & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            href="/admin/employees"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white"
          >
            <FiArrowLeft size={14} /> Back to Staff Directory
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/admin/employees/${id}/appointment`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 w-full sm:w-auto"
            >
              <FiFileText size={14} />
              <span>{employee.appointmentSigned ? 'View Signed Contract' : 'Sign Contract'}</span>
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold text-xs uppercase tracking-wider transition-all w-full sm:w-auto"
            >
              <FiTrash2 size={14} />
              <span>Delete Employee</span>
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="glass-card p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl sm:text-2xl uppercase shadow-lg shadow-blue-500/20 flex-shrink-0">
                {employee.fullName.slice(0, 2)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg sm:text-2xl font-black text-white">{employee.fullName}</h1>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                      isTraining
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {isTraining ? '30-Day Training' : employee.status}
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  {employee.jobTitle} • {employee.department}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-900/60 p-3 rounded-2xl border border-white/5">
              <div>
                <span className="text-[10px] text-text-muted uppercase block font-bold">
                  Monthly Stipend
                </span>
                <span className="text-base sm:text-lg font-black text-emerald-400">
                  ₦{(employee.currentSalary || 30000).toLocaleString()}
                </span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <span className="text-[10px] text-text-muted uppercase block font-bold">
                  Post-Training
                </span>
                <span className="text-base sm:text-lg font-black text-amber-400">
                  ₦{(employee.startingSalary || 50000).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Contact & Employment Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/40 border border-white/5">
              <FiMail className="text-blue-400 flex-shrink-0" size={16} />
              <div className="truncate">
                <span className="text-text-muted block text-[10px]">Email Address</span>
                <span className="text-slate-200 font-semibold truncate block">
                  {employee.email}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/40 border border-white/5">
              <FiPhone className="text-emerald-400 flex-shrink-0" size={16} />
              <div>
                <span className="text-text-muted block text-[10px]">Phone Number</span>
                <span className="text-slate-200 font-semibold">{employee.phone}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/40 border border-white/5">
              <FiCalendar className="text-amber-400 flex-shrink-0" size={16} />
              <div>
                <span className="text-text-muted block text-[10px]">Training Window</span>
                <span className="text-slate-200 font-semibold">
                  {employee.startDate} &rarr; {employee.trainingEndDate}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/40 border border-white/5">
              <FiMapPin className="text-purple-400 flex-shrink-0" size={16} />
              <div className="truncate">
                <span className="text-text-muted block text-[10px]">Residential Address</span>
                <span className="text-slate-200 font-semibold truncate block">
                  {employee.address}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 30-Day Training Checklist Hub */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-xl font-black text-white flex items-center gap-2">
                <FiCheckSquare className="text-amber-400" /> 30-Day Sports Media Training Curriculum
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Section 4 Intensive Curriculum Progress Tracker ({progressPercent}% Completed)
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-white/10">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Collapsible Modules */}
          <div className="space-y-4">
            {GOALMILLS_TRAINING_MODULES.map((module, idx) => {
              const isOpen = openModules[module.id] ?? true;
              const modProgress = training?.modules?.find((m) => m.moduleId === module.id);
              const completedCount = modProgress?.completedTasks?.length || 0;
              const isModuleDone =
                modProgress?.status === 'completed' ||
                (completedCount >= module.checklist.length && module.checklist.length > 0);

              return (
                <div
                  key={module.id}
                  className="glass-card rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-xl"
                >
                  <button
                    type="button"
                    onClick={() => toggleModule(module.id)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between bg-slate-900/80 hover:bg-slate-900 transition-colors text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                          Module {idx + 1} • {module.category} ({module.weightPercent}%)
                        </span>
                        {isModuleDone && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            ✓ Completed
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-white mt-0.5">
                        {module.title}
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5">{module.description}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 text-slate-400">
                      {isOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="p-4 sm:p-5 space-y-4 border-t border-white/5">
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Module Checklist ({completedCount}/{module.checklist.length} Completed):
                        </span>
                        <div className="space-y-1.5">
                          {module.checklist.map((task: string, tIdx: number) => {
                            const isDone = modProgress?.completedTasks?.includes(task) || false;
                            return (
                              <button
                                key={tIdx}
                                type="button"
                                onClick={() => handleToggleTask(module.id, task, !isDone)}
                                className={`w-full flex items-start gap-2.5 p-2.5 rounded-lg border text-left text-xs transition-all ${
                                  isDone
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 font-medium'
                                    : 'bg-slate-950/30 border-white/5 text-slate-300 hover:border-white/20'
                                }`}
                              >
                                <span
                                  className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded flex items-center justify-center text-xs ${
                                    isDone
                                      ? 'bg-emerald-500 text-slate-950 font-bold'
                                      : 'border border-slate-600'
                                  }`}
                                >
                                  {isDone && '✓'}
                                </span>
                                <span className={isDone ? 'line-through opacity-80' : ''}>
                                  {task}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {module.resources.length > 0 && (
                        <div className="pt-2 border-t border-white/5 space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Training Resources & Handbooks:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {module.resources.map((res: string, rIdx: number) => (
                              <span
                                key={rIdx}
                                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-white/5 text-[11px] text-amber-300/90 font-medium"
                              >
                                📖 {res}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
