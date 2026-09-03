'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import GoalmillsLoader from '@/components/GoalmillsLoader';
import { Employee } from '@goalmills/types';
import { useAppDispatch, useAppSelector } from '@/store';
import { setLastCreatedCredentials, clearCreatedCredentials } from '@/store/slices/employeeSlice';
import {
  GOALMILLS_30_DAY_CURRICULUM,
  NEWSROOM_DAILY_TIMETABLE,
  NEWSROOM_STANDUP_PROTOCOL,
  DAILY_SCORECARD_RUBRICS,
  CERTIFICATION_TIERS,
  EDITORIAL_POLICIES,
} from '@/lib/trainingCurriculum';
import {
  FiUsers,
  FiUserPlus,
  FiFileText,
  FiAward,
  FiDollarSign,
  FiSearch,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiChevronRight,
  FiCheckSquare,
  FiX,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiMoreVertical,
  FiCheck,
  FiCopy,
  FiLock,
  FiKey,
  FiTrash2,
  FiBookOpen,
  FiVideo,
  FiShare2,
  FiImage,
  FiBarChart2,
  FiExternalLink,
  FiShield,
} from 'react-icons/fi';

export default function EmployeesPage() {
  const dispatch = useAppDispatch();
  const createdCredentials = useAppSelector((state) => state.employees.lastCreatedCredentials);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Tab State: 'roster' | 'curriculum'
  const [activeTab, setActiveTab] = useState<'roster' | 'curriculum'>('roster');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  // New Employee Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    jobTitle: 'Sports Media & Social Media Content Officer',
    department: 'Editorial & Digital Media',
    workArrangement: 'Remote',
    reportsTo: 'Ekpenisi Erue Raphael (Founder / Managing Editor)',
    startDate: '2026-09-01',
    trainingEndDate: '2026-09-30',
    trainingAllowance: 30000,
    startingSalary: 50000,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/admin/employees', window.location.origin);
      if (statusFilter !== 'all') url.searchParams.set('status', statusFilter);
      if (search) url.searchParams.set('search', search);

      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success) {
        setEmployees(json.data);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [statusFilter, search]);

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg('');

      const res = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to onboard employee');
      }

      setShowOnboardModal(false);
      if (json.credentials) {
        dispatch(setLastCreatedCredentials(json.credentials));
      }

      setFormData({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        jobTitle: 'Sports Media & Social Media Content Officer',
        department: 'Editorial & Digital Media',
        workArrangement: 'Remote',
        reportsTo: 'Ekpenisi Erue Raphael (Founder / Managing Editor)',
        startDate: '2026-09-01',
        trainingEndDate: '2026-09-30',
        trainingAllowance: 30000,
        startingSalary: 50000,
      });
      fetchEmployees();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating employee profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `GoalMills Staff Login Credentials:\nPortal: https://goalmills-web.vercel.app/signin\nEmail: ${createdCredentials.email}\nTemporary Password: ${createdCredentials.tempPassword}\nRole: ${createdCredentials.role}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDeleteEmployee = async (empId?: string, name?: string) => {
    if (!empId) return;
    const employeeName = name || 'this employee';
    if (
      !confirm(
        `Are you sure you want to completely delete ${employeeName} from the system?\n\nThis will remove their user account, employee profile, training progress, reports, evaluations, and payroll records from the database.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/employees/${empId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setEmployees((prev) => prev.filter((e) => e._id !== empId));
      } else {
        alert(json.error || 'Failed to delete employee');
      }
    } catch (err) {
      console.error('Error deleting employee:', err);
      alert('An error occurred while deleting the employee');
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    if (deptFilter !== 'all' && emp.department !== deptFilter) return false;
    return true;
  });

  const trainingCount = employees.filter((e) => {
    const isCert = e.trainingProgress?.isCertified || (e.trainingProgress?.completedDaysCount || 0) >= 30;
    return e.status === 'training' || !isCert;
  }).length;

  const activeCount = employees.filter((e) => {
    const isCert = e.trainingProgress?.isCertified || (e.trainingProgress?.completedDaysCount || 0) >= 30;
    return isCert && e.status !== 'training';
  }).length;

  const totalPayrollEst = employees.reduce((acc, e) => acc + (e.currentSalary || 30000), 0);

  const weekDays = GOALMILLS_30_DAY_CURRICULUM.filter((d) => d.week === selectedWeek);

  return (
    <div className="space-y-5 sm:space-y-6 text-white">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="glass-card p-3.5 sm:p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider font-bold">
              Total Staff
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FiUsers size={16} />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl sm:text-2xl font-black text-white">{employees.length}</h3>
            <p className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
              <FiCheckCircle size={10} /> Active Roster
            </p>
          </div>
        </div>

        <div className="glass-card p-3.5 sm:p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider font-bold">
              On 30-Day Training
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FiClock size={16} />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl sm:text-2xl font-black text-amber-400">{trainingCount}</h3>
            <p className="text-[10px] text-text-muted mt-0.5">Mandatory Curriculum</p>
          </div>
        </div>

        <div className="glass-card p-3.5 sm:p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider font-bold">
              GoalMills Certified
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FiAward size={16} />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl sm:text-2xl font-black text-emerald-400">{activeCount}</h3>
            <p className="text-[10px] text-text-muted mt-0.5">Completed 30 Days</p>
          </div>
        </div>

        <div className="glass-card p-3.5 sm:p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider font-bold">
              Est. Monthly Payroll
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FiDollarSign size={16} />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl sm:text-2xl font-black text-emerald-400">
              ₦{totalPayrollEst.toLocaleString()}
            </h3>
            <p className="text-[10px] text-text-muted mt-0.5">Combined Obligation</p>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/80 rounded-2xl border border-white/10 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setActiveTab('roster')}
          className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 ${activeTab === 'roster'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
        >
          <FiUsers size={15} />
          <span>Staff Roster & Badges</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('curriculum')}
          className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 ${activeTab === 'curriculum'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/25'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
        >
          <FiBookOpen size={15} />
          <span>30-Day Academy Curriculum & SOP</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STAFF ROSTER VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'roster' && (
        <div className="space-y-5">
          {/* Controls & Filter Bar */}
          <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <FiUsers className="text-amber-400" /> Staff Directory & Onboarding
                </h1>
                <p className="text-xs text-text-muted mt-0.5">
                  Manage 30-day curriculum trainees, appointment letters, and full-time content officers
                </p>
              </div>

              <button
                onClick={() => setShowOnboardModal(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 w-full sm:w-auto"
              >
                <FiUserPlus size={16} />
                <span>Onboard New Staff</span>
              </button>
            </div>

            {/* Search & Dropdown Filter Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-white/5">
              <div className="sm:col-span-6 relative">
                <FiSearch
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search staff by name, email, or role..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="sm:col-span-3 relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs sm:text-sm font-bold text-slate-300 focus:outline-none focus:border-amber-500 pr-8 transition-colors"
                >
                  <option value="all">All Employment Statuses</option>
                  <option value="training">⚡ On 30-Day Training</option>
                  <option value="active">Active Regular Staff</option>
                  <option value="probation">On Probation</option>
                  <option value="review">Under Review</option>
                </select>
                <FiChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={16}
                />
              </div>

              <div className="sm:col-span-3 relative">
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs sm:text-sm font-bold text-slate-300 focus:outline-none focus:border-amber-500 pr-8 transition-colors"
                >
                  <option value="all">All Departments</option>
                  <option value="Editorial & Digital Media">Editorial & Digital Media</option>
                  <option value="Social Media & Graphics">Social Media & Graphics</option>
                  <option value="Video & Multimedia">Video & Multimedia</option>
                </select>
                <FiChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={16}
                />
              </div>
            </div>
          </div>

          {/* Roster Table / Card Stack */}
          <div className="glass-card rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <FiUsers className="text-amber-400" /> Staff Roster ({filteredEmployees.length})
              </h2>
              <span className="text-xs text-text-muted">GoalMills Team</span>
            </div>

            {loading ? (
              <div className="p-12 flex justify-center">
                <GoalmillsLoader
                  size="md"
                  label="GoalMills Staff Registry"
                  sublabel="Fetching employee records & appointment files..."
                />
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <FiUsers className="mx-auto text-slate-600" size={40} />
                <p className="text-slate-400 font-bold">
                  No employee records found matching your filters.
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Cards View */}
                <div className="block md:hidden divide-y divide-white/5">
                  {filteredEmployees.map((emp) => {
                    const completedDays = emp.trainingProgress?.completedDaysCount || 0;
                    const isCert = emp.trainingProgress?.isCertified || completedDays >= 30;

                    return (
                      <div key={emp._id} className="p-4 space-y-3 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm uppercase shadow-md flex-shrink-0">
                              {emp.fullName.slice(0, 2)}
                            </div>
                            <div>
                              <h3 className="font-bold text-white text-sm">{emp.fullName}</h3>
                              <p className="text-xs text-text-muted">{emp.jobTitle}</p>
                            </div>
                          </div>

                          {/* Training Badge */}
                          {isCert ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <FiAward size={11} /> Certified
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                              <FiClock size={11} /> On Training ({completedDays}/30)
                            </span>
                          )}
                        </div>

                        {/* Info Pills */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                          <div>
                            <span className="text-slate-500 font-bold block">Department:</span>
                            <span className="text-slate-200 font-medium truncate block">
                              {emp.department}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-bold block">Compensation:</span>
                            <span className="text-emerald-400 font-bold">
                              ₦{(emp.currentSalary || 30000).toLocaleString()}/mo
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-bold block">Curriculum:</span>
                            <span className="text-amber-400 font-bold">
                              {completedDays} of 30 Days
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-bold block">Contract:</span>
                            <span
                              className={
                                emp.appointmentSigned
                                  ? 'text-emerald-400 font-bold'
                                  : 'text-amber-400 font-bold'
                              }
                            >
                              {emp.appointmentSigned ? '✓ Signed' : '⏳ Pending'}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-1">
                          <Link
                            href={`/admin/employees/${emp._id}`}
                            className="flex-1 text-center py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-bold transition-all"
                          >
                            Profile & Training
                          </Link>
                          <Link
                            href={`/admin/employees/${emp._id}/appointment`}
                            className="flex-1 text-center py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all"
                          >
                            Contract
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteEmployee(emp._id, emp.fullName)}
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all flex items-center justify-center"
                            title={`Delete ${emp.fullName}`}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Data Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-text-muted border-b border-white/5">
                      <tr>
                        <th className="p-4">Employee Details</th>
                        <th className="p-4">Position & Dept</th>
                        <th className="p-4">Training Status & Badge</th>
                        <th className="p-4">Compensation</th>
                        <th className="p-4">Appointment Letter</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredEmployees.map((emp) => {
                        const completedDays = emp.trainingProgress?.completedDaysCount || 0;
                        const isCert = emp.trainingProgress?.isCertified || completedDays >= 30;

                        return (
                          <tr key={emp._id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm uppercase shadow-md flex-shrink-0">
                                  {emp.fullName.slice(0, 2)}
                                </div>
                                <div>
                                  <p className="font-bold text-white text-sm">{emp.fullName}</p>
                                  <p className="text-xs text-text-muted">{emp.email}</p>
                                </div>
                              </div>
                            </td>

                            <td className="p-4">
                              <p className="font-semibold text-slate-200">{emp.jobTitle}</p>
                              <p className="text-xs text-text-muted">{emp.department}</p>
                            </td>

                            <td className="p-4">
                              {isCert ? (
                                <div>
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                    <FiAward size={13} /> GoalMills Certified
                                  </span>
                                  <p className="text-[11px] text-emerald-300/80 mt-1">
                                    30/30 Days Complete
                                  </p>
                                </div>
                              ) : (
                                <div>
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                                    <FiClock size={13} /> On Training (Day {completedDays + 1}/30)
                                  </span>
                                  <p className="text-[11px] text-text-muted mt-1">
                                    {completedDays} of 30 Days Graded
                                  </p>
                                </div>
                              )}
                            </td>

                            <td className="p-4 font-semibold text-emerald-400">
                              <p className="text-sm font-bold">
                                ₦{(emp.currentSalary || 30000).toLocaleString()}
                              </p>
                              <p className="text-[11px] text-text-muted">
                                {!isCert ? 'Training Allowance' : 'Regular Salary'}
                              </p>
                            </td>

                            <td className="p-4">
                              <Link
                                href={`/admin/employees/${emp._id}/appointment`}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${emp.appointmentSigned
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                                  }`}
                              >
                                <FiFileText size={12} />
                                <span>
                                  {emp.appointmentSigned ? 'Signed & Active' : 'Sign Contract'}
                                </span>
                              </Link>
                            </td>

                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/admin/employees/${emp._id}`}
                                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-600/20"
                                >
                                  <span>Manage</span>
                                  <FiChevronRight size={14} />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEmployee(emp._id, emp.fullName)}
                                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                                  title={`Delete ${emp.fullName}`}
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: 30-DAY CURRICULUM & SOP REFERENCE VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6 animate-fade-in">
          {/* Program Overview Banner */}
          <div className="glass-card p-5 sm:p-8 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-950 shadow-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                  GoalMills Sports Media Academy
                </span>
                <h2 className="text-xl sm:text-3xl font-black text-white mt-2">
                  30-Day Sports Media Employee Training Curriculum
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
                  <strong>Training Model:</strong> Learn &rarr; Create &rarr; Publish &rarr; Submit &rarr; Review &rarr; Improve.
                  Production-based training to produce sports media professionals who independently research, write, optimize, design, publish, distribute, and analyse content.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-white/10 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
                  <span className="text-lg font-black text-amber-400">30 Working Days</span>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-white/10 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Daily Stand-Up</span>
                  <span className="text-sm font-black text-emerald-400">5:00 PM – 5:30 PM WAT</span>
                </div>
              </div>
            </div>

            {/* Daily Minimum Standards Callout */}
            <div className="bg-slate-950/90 p-4 sm:p-5 rounded-2xl border border-white/10 space-y-3">
              <h3 className="text-xs sm:text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <FiCheckSquare /> Daily Minimum Production Standard (Every Trainee Must Submit Daily)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 text-center">
                  <FiFileText className="mx-auto text-blue-400 mb-1" size={18} />
                  <span className="text-base font-black text-white block">2 Articles</span>
                  <span className="text-[10px] text-text-muted">Researched & Original</span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 text-center">
                  <FiImage className="mx-auto text-amber-400 mb-1" size={18} />
                  <span className="text-base font-black text-white block">2 Canva Graphics</span>
                  <span className="text-[10px] text-text-muted">Brand-Compliant Visuals</span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 text-center">
                  <FiShare2 className="mx-auto text-purple-400 mb-1" size={18} />
                  <span className="text-base font-black text-white block">5 Social Posts</span>
                  <span className="text-[10px] text-text-muted">X, FB, IG, TikTok</span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 text-center">
                  <FiVideo className="mx-auto text-pink-400 mb-1" size={18} />
                  <span className="text-base font-black text-white block">1 Short Video</span>
                  <span className="text-[10px] text-text-muted">Reels / Shorts / TikTok</span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 text-center">
                  <FiShield className="mx-auto text-emerald-400 mb-1" size={18} />
                  <span className="text-base font-black text-white block">2 Sources</span>
                  <span className="text-[10px] text-text-muted">Verified Independent Trail</span>
                </div>
              </div>
            </div>
          </div>

          {/* Week Selector Bar */}
          <div className="glass-card p-3 sm:p-4 rounded-2xl border border-white/10 flex flex-wrap items-center gap-2">
            {[
              { wk: 1, label: 'Week 1 (Days 1–7): Journalism & Writing', startDay: 1 },
              { wk: 2, label: 'Week 2 (Days 8–14): Matchday & Live Reporting', startDay: 8 },
              { wk: 3, label: 'Week 3 (Days 15–20): Multimedia & Graphics', startDay: 15 },
              { wk: 4, label: 'Week 4 (Days 21–30): Newsroom Operations', startDay: 21 },
            ].map(({ wk, label, startDay }) => (
              <button
                key={wk}
                type="button"
                onClick={() => {
                  setSelectedWeek(wk);
                  setExpandedDay(startDay);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition-all ${selectedWeek === wk
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Days of Selected Week */}
          <div className="space-y-4">
            {weekDays.map((dayItem) => {
              const isExpanded = expandedDay === dayItem.day;

              return (
                <div
                  key={dayItem.day}
                  className="glass-card rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-xl"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedDay(isExpanded ? null : dayItem.day)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between bg-slate-900/80 hover:bg-slate-900 transition-colors text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-black text-xs uppercase tracking-wider">
                          Day {dayItem.day}
                        </span>
                        <span className="text-xs text-text-muted">Week {dayItem.week}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-white mt-1">
                        {dayItem.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        <strong>Daily Production:</strong>{' '}
                        {dayItem.dailyOutput ||
                          dayItem.production?.join('; ') ||
                          'Standard daily newsroom deliverable'}
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-white/5 text-slate-400 flex-shrink-0">
                      {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 sm:p-6 space-y-4 border-t border-white/5 bg-slate-950/40">
                      {/* Topics To Learn */}
                      <div>
                        <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-2">
                          📚 Curriculum Topics to Study (8:30 AM – 10:00 AM WAT)
                        </h4>
                        <ul className="space-y-1.5 text-xs text-slate-200">
                          {(dayItem.topics || dayItem.study || dayItem.objectives || []).map((t, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Practical Assignments */}
                      <div>
                        <h4 className="text-xs font-black text-blue-400 uppercase tracking-wider mb-2">
                          ⚡ Practical Production Tasks (10:00 AM – 4:00 PM WAT)
                        </h4>
                        <ul className="space-y-1.5 text-xs text-slate-200">
                          {(dayItem.practicalTasks || dayItem.production || dayItem.assignment || []).map((pt, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Submission Requirements */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/5">
                        <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                          <span className="text-[10px] text-emerald-400 uppercase font-bold block">
                            Mandatory Submission (By 4:45 PM WAT)
                          </span>
                          <p className="text-xs text-slate-200 font-semibold mt-1">
                            {dayItem.submissionRequirement ||
                              dayItem.submissionChecklist?.join('; ') ||
                              'Submit article & media deliverables via portal'}
                          </p>
                        </div>
                        <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                          <span className="text-[10px] text-purple-400 uppercase font-bold block">
                            Standup Focus (5:00 PM WAT Google Meet)
                          </span>
                          <p className="text-xs text-slate-200 font-semibold mt-1">
                            {dayItem.standupFocus ||
                              dayItem.objectives?.[0] ||
                              'Report on daily study, creation, publishing & challenges'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Section: Newsroom Daily Timetable */}
          <div className="glass-card p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <FiClock className="text-amber-400" /> GoalMills Newsroom Daily Timetable (WAT)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {NEWSROOM_DAILY_TIMETABLE.map((slot, i) => (
                <div key={i} className="p-3 bg-slate-950/60 rounded-xl border border-white/5 flex items-start gap-3">
                  <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 font-mono text-xs font-bold whitespace-nowrap">
                    {slot.time}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    {slot.activity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Standup Protocol & 10-Category Scoring Rubric */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Standup Protocol */}
            <div className="glass-card p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <FiVideo className="text-emerald-400" /> Daily Stand-Up Protocol (5:00 PM – 5:30 PM WAT)
              </h3>
              <p className="text-xs text-text-muted">
                Mandatory Google Meet daily review with Managing Editor Raphael Ekpenisi.
              </p>
              <div className="space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  The 4 Mandatory Trainee Questions:
                </span>
                {NEWSROOM_STANDUP_PROTOCOL.fourQuestions.map((q, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-950/80 rounded-xl border border-white/5 text-xs text-slate-200 flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 10-Category Scoring Rubric */}
            <div className="glass-card p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <FiBarChart2 className="text-blue-400" /> 10-Category 100-Point Scoring Rubric
              </h3>
              <p className="text-xs text-text-muted">
                Every daily submission is evaluated across these 10 core competencies.
              </p>
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                {DAILY_SCORECARD_RUBRICS.map((r) => (
                  <div key={r.key} className="p-2.5 bg-slate-950/80 rounded-xl border border-white/5 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-200 block">{r.name}</span>
                      <span className="text-[10px] text-text-muted">{r.description}</span>
                    </div>
                    <span className="text-amber-400 font-black text-xs whitespace-nowrap bg-amber-500/10 px-2 py-1 rounded-md">
                      {r.maxScore} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Certification Tiers */}
          <div className="glass-card p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <FiAward className="text-emerald-400" /> Post-Curriculum Certification Tiers & Career Progression
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CERTIFICATION_TIERS.slice(0, 3).map((tier, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-950/70 rounded-2xl border border-emerald-500/20 space-y-1"
                >
                  <span className="text-[10px] font-black uppercase text-emerald-400 block">
                    Score: {tier.min}% – {tier.max}%
                  </span>

                  <h4 className="text-xs font-bold text-white">
                    {tier.title}
                  </h4>

                  <p className="text-[11px] text-slate-300">
                    {tier.summary}
                  </p>
                </div>
              ))}
            </div>
          </div> {/* <-- THIS WAS MISSING */}


          {/* Section: Newsroom Editorial Policies & Standards */}
          <div className="glass-card p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <FiCheckSquare className="text-amber-400" /> GoalMills Newsroom Editorial Policies & Publishing Guidelines
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Core editorial governance rules for verification, copyright, editor sign-offs, and error correction.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl w-fit">
                Mandatory Newsroom Protocol
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Approval Policy */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-amber-500/20 space-y-2">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">
                  1. Editorial Approval Policy
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {EDITORIAL_POLICIES.approvalPolicy.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Copyright Rule */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-red-500/20 space-y-2">
                <span className="text-xs font-black text-red-400 uppercase tracking-wider block">
                  2. Copyright & Fair Use Principles
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {EDITORIAL_POLICIES.copyrightRule.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">✕</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Source Policy */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-blue-500/20 space-y-2">
                <span className="text-xs font-black text-blue-400 uppercase tracking-wider block">
                  3. Source Verification Hierarchy
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {EDITORIAL_POLICIES.sourcePolicy.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">T{idx + 1}</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Correction Policy */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-emerald-500/20 space-y-2">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
                  4. Five-Step Correction Protocol
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {EDITORIAL_POLICIES.correctionPolicy.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Monitored Mistake Categories */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-300 uppercase tracking-wider block">
                  Monitored Editorial Mistake Categories (Audited During Daily Evaluations)
                </span>
                <span className="text-[10px] text-text-muted">
                  {EDITORIAL_POLICIES.mistakeDatabaseCategories.length} Types
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {EDITORIAL_POLICIES.mistakeDatabaseCategories.map((cat, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[11px] text-slate-300 font-medium"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Slide-Over / Fullscreen Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border-t sm:border border-white/15 w-full max-w-2xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] sm:max-h-[85vh] flex flex-col shadow-2xl animate-fade-in">
            <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Onboard New Team Member
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Generate official appointment contract & 30-day curriculum tracker
                </p>
              </div>
              <button
                onClick={() => setShowOnboardModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5"
              >
                <FiX size={18} />
              </button>
            </div>

            <form
              onSubmit={handleOnboardSubmit}
              className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1"
            >
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
                  <FiAlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ibeh Udochukwu Gift Temitope"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. giftibeh585@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 08134336192"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Residential Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. No 35 church street, Jos, Plateau State"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Initial Staff Password (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-generated if left blank"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Editorial & Digital Media">Editorial & Digital Media</option>
                    <option value="Social Media & Content Operations">
                      Social Media & Content Operations
                    </option>
                    <option value="Graphics & Video Production">
                      Graphics & Video Production
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    30-Day Training Allowance (₦) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.trainingAllowance}
                    onChange={(e) =>
                      setFormData({ ...formData, trainingAllowance: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Post-Training Starting Salary (₦) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.startingSalary}
                    onChange={(e) =>
                      setFormData({ ...formData, startingSalary: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {submitting ? 'Generating Account & Contract...' : 'Create Account & Onboard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Delivery Modal */}
      {createdCredentials && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 sm:p-8 rounded-3xl border border-amber-500/40 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <FiKey size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Staff Login Account Created
                  </h3>
                  <p className="text-xs text-text-muted">
                    Deliver these credentials to the staff member
                  </p>
                </div>
              </div>
              <button
                onClick={() => dispatch(clearCreatedCredentials())}
                className="text-slate-400 hover:text-white"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-white/10">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Full Name</span>
                <p className="text-sm font-bold text-white">{createdCredentials.fullName}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Login Email
                </span>
                <p className="text-sm font-mono text-amber-300">{createdCredentials.email}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Temporary Password
                </span>
                <p className="text-sm font-mono font-bold text-emerald-400">
                  {createdCredentials.tempPassword}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Assigned Role
                </span>
                <p className="text-xs uppercase font-black text-slate-300">
                  {createdCredentials.role}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all"
              >
                {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
              </button>
              <button
                type="button"
                onClick={() => dispatch(clearCreatedCredentials())}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
