'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminNavBar from '@/components/admin/AdminNavBar';
import GoalmillsLoader from '@/components/GoalmillsLoader';
import { Employee } from '@goalmills/types';
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
} from 'react-icons/fi';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showOnboardModal, setShowOnboardModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
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
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEmployees();
  };

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
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        address: '',
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

  const trainingCount = employees.filter((e) => e.status === 'training').length;
  const activeCount = employees.filter((e) => e.status === 'active' || e.status === 'probation').length;
  const totalPayrollEst = employees.reduce((acc, e) => acc + (e.currentSalary || 30000), 0);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 pt-[85px] sm:pt-[95px] text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminNavBar />

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider font-bold">Total Staff</p>
              <h3 className="text-2xl font-black text-white mt-1">{employees.length}</h3>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                <FiCheckCircle size={12} /> Newsroom & Digital Media
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FiUsers size={22} />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider font-bold">In 30-Day Training</p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">{trainingCount}</h3>
              <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                <FiClock size={12} /> ₦30,000 / month allowance
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FiAward size={22} />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider font-bold">Regular / Active Staff</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">{activeCount}</h3>
              <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                <FiCheckCircle size={12} /> ₦50,000+ base salary
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FiCheckCircle size={22} />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider font-bold">Monthly Payroll Obligation</p>
              <h3 className="text-2xl font-black text-white mt-1">₦{totalPayrollEst.toLocaleString()}</h3>
              <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                <FiDollarSign size={12} /> Guaranteed stipends & pay
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <FiDollarSign size={22} />
            </div>
          </div>
        </div>

        {/* Directory Controls & Search */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search staff by name, email, phone or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs sm:text-sm font-bold text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="training">In Training (30 Days)</option>
              <option value="active">Active Staff</option>
              <option value="probation">Probation</option>
              <option value="review">Under Review</option>
            </select>

            <button
              onClick={() => setShowOnboardModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
            >
              <FiUserPlus size={16} />
              <span>Onboard New Staff</span>
            </button>
          </div>
        </div>

        {/* Employees Table */}
        <div className="glass-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FiUsers className="text-amber-400" /> Newsroom Staff Directory
            </h2>
            <span className="text-xs text-text-muted">{employees.length} employees listed</span>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <GoalmillsLoader
                size="md"
                label="GoalMills Staff Registry"
                sublabel="Fetching employee records & appointment files..."
              />
            </div>
          ) : employees.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FiUsers className="mx-auto text-slate-600" size={40} />
              <p className="text-slate-400 font-bold">No employee records found matching your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                  {employees.map((emp) => {
                    const isTraining = emp.status === 'training';
                    return (
                      <tr key={emp._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm uppercase">
                              {emp.fullName.slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-bold text-white">{emp.fullName}</p>
                              <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                                <span className="flex items-center gap-1">
                                  <FiMail size={11} /> {emp.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FiPhone size={11} /> {emp.phone}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <p className="font-semibold text-slate-200">{emp.jobTitle}</p>
                          <p className="text-xs text-text-muted">{emp.department} • {emp.workArrangement}</p>
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                              isTraining
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {isTraining ? '⚡ 30-Day Training' : '✓ Regular Active'}
                          </span>
                          <p className="text-xs text-text-muted mt-1">Start: {emp.startDate}</p>
                        </td>

                        <td className="p-4">
                          <p className="font-bold text-white">₦{(emp.currentSalary || 30000).toLocaleString()}</p>
                          <p className="text-xs text-text-muted">
                            {isTraining ? 'Training Allowance' : 'Starting: ₦50,000'}
                          </p>
                        </td>

                        <td className="p-4">
                          {emp.appointmentSigned ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold">
                              <FiCheckCircle size={13} /> Signed ({emp.appointmentSignedAt})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-bold">
                              <FiAlertCircle size={13} /> Pending Signature
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/employees/${emp._id}/appointment`}
                              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs border border-amber-500/20 transition-all"
                            >
                              Contract Letter
                            </Link>
                            <Link
                              href={`/admin/employees/${emp._id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all"
                            >
                              <span>Manage</span>
                              <FiChevronRight size={13} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Onboarding Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-black text-white">Onboard New Team Member</h3>
                <p className="text-xs text-text-muted">Issue appointment letter & assign 30-day curriculum</p>
              </div>
              <button
                onClick={() => setShowOnboardModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <FiX size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleOnboardSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ibeh Udochukwu Gift Temitope"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. giftibeh585@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 08134336192"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Work Arrangement</label>
                  <select
                    value={formData.workArrangement}
                    onChange={(e) => setFormData({ ...formData, workArrangement: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Office">Office</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Residential Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. No 35 church street, Jos, Plateau State"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Training Allowance (Month 1)</label>
                  <input
                    type="number"
                    required
                    value={formData.trainingAllowance}
                    onChange={(e) => setFormData({ ...formData, trainingAllowance: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Starting Salary (Post-Training)</label>
                  <input
                    type="number"
                    required
                    value={formData.startingSalary}
                    onChange={(e) => setFormData({ ...formData, startingSalary: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:border-blue-500 focus:outline-none"
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
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 disabled:opacity-50"
                >
                  {submitting ? 'Generating Letter...' : 'Complete Onboarding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
