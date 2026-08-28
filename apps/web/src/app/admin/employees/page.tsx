'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminNavBar from '@/components/admin/AdminNavBar';
import GoalmillsLoader from '@/components/GoalmillsLoader';
import { Employee } from '@goalmills/types';
import { useAppDispatch, useAppSelector } from '@/store';
import { setLastCreatedCredentials, clearCreatedCredentials } from '@/store/slices/employeeSlice';
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
  FiMail,
  FiPhone,
  FiMapPin,
  FiX,
  FiFilter,
  FiChevronDown,
  FiMoreVertical,
  FiCheck,
  FiCopy,
  FiLock,
  FiKey,
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


  const filteredEmployees = employees.filter((emp) => {
    if (deptFilter !== 'all' && emp.department !== deptFilter) return false;
    return true;
  });

  const trainingCount = employees.filter((e) => e.status === 'training').length;
  const activeCount = employees.filter(
    (e) => e.status === 'active' || e.status === 'probation'
  ).length;
  const totalPayrollEst = employees.reduce((acc, e) => acc + (e.currentSalary || 30000), 0);

  return (
    <div className="min-h-screen bg-background p-3.5 sm:p-6 pt-[80px] sm:pt-[95px] text-white">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
        <AdminNavBar />

        {/* Top Summary Cards (Horizontal Scroll on Mobile / 4-Col on Desktop) */}
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
                30-Day Trainees
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <FiClock size={16} />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-xl sm:text-2xl font-black text-amber-400">{trainingCount}</h3>
              <p className="text-[10px] text-text-muted mt-0.5">₦30k Allowance</p>
            </div>
          </div>

          <div className="glass-card p-3.5 sm:p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider font-bold">
                Regular Team
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FiAward size={16} />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-xl sm:text-2xl font-black text-emerald-400">{activeCount}</h3>
              <p className="text-[10px] text-text-muted mt-0.5">Starting ₦50k/mo</p>
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

        {/* Controls & Filter Bar */}
        <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <FiUsers className="text-amber-400" /> Staff Directory & Onboarding
              </h1>
              <p className="text-xs text-text-muted mt-0.5">
                Manage 30-day curriculum trainees, appointment letters, and full-time content
                officers
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
            {/* Search Input */}
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

            {/* Status Dropdown */}
            <div className="sm:col-span-3 relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs sm:text-sm font-bold text-slate-300 focus:outline-none focus:border-amber-500 pr-8 transition-colors"
              >
                <option value="all">All Employment Statuses</option>
                <option value="training">⚡ 30-Day Training</option>
                <option value="active">Active Regular Staff</option>
                <option value="probation">On Probation</option>
                <option value="review">Under Review</option>
              </select>
              <FiChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={16}
              />
            </div>

            {/* Department Dropdown */}
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

        {/* Content Section: Mobile Card Stack & Desktop Data Table */}
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
              {/* ------------------------------------------------------------- */}
              {/* MOBILE CARDS VIEW (< md screens) */}
              {/* ------------------------------------------------------------- */}
              <div className="block md:hidden divide-y divide-white/5">
                {filteredEmployees.map((emp) => {
                  const isTraining = emp.status === 'training';
                  return (
                    <div
                      key={emp._id}
                      className="p-4 space-y-3 hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Top Header Row */}
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

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isTraining
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {isTraining ? '⚡ Trainee' : emp.status}
                        </span>
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
                          <span className="text-slate-500 font-bold block">Start Date:</span>
                          <span className="text-slate-200 font-medium">{emp.startDate}</span>
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
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ------------------------------------------------------------- */}
              {/* DESKTOP DATA TABLE (>= md screens) */}
              {/* ------------------------------------------------------------- */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-text-muted border-b border-white/5">
                    <tr>
                      <th className="p-4">Employee Details</th>
                      <th className="p-4">Position & Dept</th>
                      <th className="p-4">Training / Start</th>
                      <th className="p-4">Compensation</th>
                      <th className="p-4">Appointment Letter</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredEmployees.map((emp) => {
                      const isTraining = emp.status === 'training';
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
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                isTraining
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}
                            >
                              {isTraining ? <FiClock size={12} /> : <FiCheckCircle size={12} />}
                              <span>{isTraining ? '30-Day Training' : 'Regular Staff'}</span>
                            </span>
                            <p className="text-xs text-text-muted mt-1">Start: {emp.startDate}</p>
                          </td>

                          <td className="p-4 font-semibold text-emerald-400">
                            <p className="text-sm font-bold">
                              ₦{(emp.currentSalary || 30000).toLocaleString()}
                            </p>
                            <p className="text-[11px] text-text-muted">
                              {isTraining ? 'Training Allowance' : 'Regular Salary'}
                            </p>
                          </td>

                          <td className="p-4">
                            <Link
                              href={`/admin/employees/${emp._id}/appointment`}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                                emp.appointmentSigned
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
                            <Link
                              href={`/admin/employees/${emp._id}`}
                              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-600/20"
                            >
                              <span>Manage</span>
                              <FiChevronRight size={14} />
                            </Link>
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

        {/* ------------------------------------------------------------- */}
        {/* Responsive Onboarding Slide-Over / Fullscreen Modal */}
        {/* ------------------------------------------------------------- */}
        {showOnboardModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-slate-900 border-t sm:border border-white/15 w-full max-w-2xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] sm:max-h-[85vh] flex flex-col shadow-2xl animate-fade-in">
              {/* Modal Header */}
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

              {/* Modal Body */}
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
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
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
                    <span className="text-[10px] text-text-muted mt-1 block">
                      A login account will be automatically provisioned for dashboard access.
                    </span>
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

                {/* Modal Footer */}
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
                    <h3 className="text-base sm:text-lg font-black text-white">Staff Login Account Created</h3>
                    <p className="text-xs text-text-muted">Deliver these credentials to the staff member</p>
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
                  <span className="text-[10px] uppercase font-bold text-slate-400">Login Email</span>
                  <p className="text-sm font-mono text-amber-300">{createdCredentials.email}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Temporary Password</span>
                  <p className="text-sm font-mono font-bold text-emerald-400">{createdCredentials.tempPassword}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Role</span>
                  <p className="text-xs uppercase font-black text-slate-300">{createdCredentials.role}</p>
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
    </div>
  );
}

