'use client';

import { useState, useEffect } from 'react';
import AdminNavBar from '@/components/admin/AdminNavBar';
import GoalmillsLoader from '@/components/GoalmillsLoader';
import { PayrollRecord, Employee } from '@goalmills/types';
import {
  FiDollarSign,
  FiPlus,
  FiCheckCircle,
  FiClock,
  FiX,
  FiChevronDown,
  FiCheck,
} from 'react-icons/fi';

export default function PayrollAdminPage() {
  const [payrollList, setPayrollList] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // New Payroll Modal State
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [period, setPeriod] = useState('September 2026');
  const [baseAmount, setBaseAmount] = useState(30000);
  const [bonusAmount, setBonusAmount] = useState(0);
  const [deductions, setDeductions] = useState(0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/payroll', window.location.origin);
      if (statusFilter !== 'all') url.searchParams.set('status', statusFilter);

      const [payRes, empRes] = await Promise.all([
        fetch(url.toString()),
        fetch('/api/admin/employees'),
      ]);
      const payJson = await payRes.json();
      const empJson = await empRes.json();

      if (payJson.success) setPayrollList(payJson.data);
      if (empJson.success) {
        setEmployees(empJson.data);
        if (empJson.data.length > 0 && !selectedEmpId) {
          setSelectedEmpId(empJson.data[0]._id);
          setBaseAmount(empJson.data[0].currentSalary || 30000);
        }
      }
    } catch (err) {
      console.error('Error loading payroll data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [statusFilter]);

  const handleEmployeeChange = (empId: string) => {
    setSelectedEmpId(empId);
    const emp = employees.find((e) => e._id === empId);
    if (emp) {
      setBaseAmount(emp.currentSalary || 30000);
    }
  };

  const handleGeneratePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e._id === selectedEmpId);
    if (!emp) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: emp._id,
          period,
          baseAmount: Number(baseAmount),
          bonusAmount: Number(bonusAmount),
          deductions: Number(deductions),
          notes: notes || 'Monthly training allowance / salary disbursement',
        }),
      });

      const json = await res.json();
      if (json.success) {
        setShowGenerateModal(false);
        fetchPayroll();
      }
    } catch (err) {
      console.error('Error generating payroll record:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPaid = async (record: PayrollRecord) => {
    if (!record._id) return;
    try {
      await fetch('/api/payroll', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payrollId: record._id,
          status: 'paid',
        }),
      });
      fetchPayroll();
    } catch (err) {
      console.error('Error marking paid:', err);
    }
  };

  const totalDisbursed = payrollList
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + (p.netPay || 0), 0);

  const pendingDisbursements = payrollList
    .filter((p) => p.status !== 'paid')
    .reduce((sum, p) => sum + (p.netPay || 0), 0);

  return (
    <div className="min-h-screen bg-background p-3.5 sm:p-6 pt-[80px] sm:pt-[95px] text-white">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
        <AdminNavBar />

        {/* Top Financial Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
          <div className="glass-card p-4 sm:p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider font-bold">
                Total Disbursed (Paid)
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                ₦{totalDisbursed.toLocaleString()}
              </h3>
              <p className="text-[10px] text-text-muted mt-0.5">Direct Bank Transfers</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <FiCheckCircle size={20} />
            </div>
          </div>

          <div className="glass-card p-4 sm:p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider font-bold">
                Pending Approval / Payout
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
                ₦{pendingDisbursements.toLocaleString()}
              </h3>
              <p className="text-[10px] text-text-muted mt-0.5">Approved & Scheduled</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
              <FiClock size={20} />
            </div>
          </div>

          <div className="glass-card p-4 sm:p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider font-bold">
                Allowances Structure
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">₦30k &rarr; ₦50k</h3>
              <p className="text-[10px] text-text-muted mt-0.5">30-Day Training &rarr; Regular</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
              <FiDollarSign size={20} />
            </div>
          </div>
        </div>

        {/* Action & Filter Header */}
        <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <FiDollarSign className="text-emerald-400" /> Payroll & Allowance Disbursement Ledger
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Manage ₦30,000 trainee stipends, ₦50,000 regular salaries, and payment receipts
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Status Dropdown */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs sm:text-sm font-bold text-slate-300 focus:outline-none focus:border-blue-500 pr-8 transition-colors"
              >
                <option value="all">All Payment Statuses</option>
                <option value="paid">✓ Paid & Disbursed</option>
                <option value="approved">⏳ Approved</option>
                <option value="draft">Draft</option>
              </select>
              <FiChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={16}
              />
            </div>

            <button
              onClick={() => setShowGenerateModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20"
            >
              <FiPlus size={16} />
              <span>Create Pay Record</span>
            </button>
          </div>
        </div>

        {/* Content View: Mobile Cards & Desktop Table */}
        <div className="glass-card rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-12 flex justify-center">
              <GoalmillsLoader
                size="md"
                label="Payroll & Compensation Ledger"
                sublabel="Fetching allowance records & disbursement status..."
              />
            </div>
          ) : payrollList.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FiDollarSign className="mx-auto text-slate-600" size={40} />
              <p className="text-slate-400 font-bold">No payroll records generated yet.</p>
            </div>
          ) : (
            <>
              {/* MOBILE CARDS VIEW (< md screens) */}
              <div className="block md:hidden divide-y divide-white/5">
                {payrollList.map((p) => {
                  const isPaid = p.status === 'paid';
                  return (
                    <div
                      key={p._id}
                      className="p-4 space-y-3 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-xs uppercase flex-shrink-0">
                            {p.employeeName.slice(0, 2)}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-sm">{p.employeeName}</h3>
                            <p className="text-xs text-amber-400 font-medium">{p.period}</p>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isPaid
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {isPaid ? '✓ Paid' : '⏳ Approved'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                        <div>
                          <span className="text-slate-500 font-bold block">Base Stipend:</span>
                          <span className="text-slate-200">₦{p.baseAmount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold block">Net Payout:</span>
                          <span className="text-emerald-400 font-black text-xs">
                            ₦{p.netPay.toLocaleString()}
                          </span>
                        </div>
                        {p.bonusAmount > 0 && (
                          <div>
                            <span className="text-slate-500 font-bold block">Bonus / Reward:</span>
                            <span className="text-emerald-400 font-medium">
                              +₦{p.bonusAmount.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {p.deductions > 0 && (
                          <div>
                            <span className="text-slate-500 font-bold block">Deductions:</span>
                            <span className="text-red-400 font-medium">
                              -₦{p.deductions.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[10px] text-text-muted truncate max-w-[150px]">
                          {p.notes || 'Approved'}
                        </span>

                        {!isPaid && (
                          <button
                            onClick={() => handleMarkPaid(p)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1"
                          >
                            <FiCheck size={12} />
                            <span>Disburse</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DESKTOP DATA TABLE (>= md screens) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-text-muted border-b border-white/5">
                    <tr>
                      <th className="p-4">Staff Member</th>
                      <th className="p-4">Period</th>
                      <th className="p-4">Base Stipend</th>
                      <th className="p-4">Adjustments</th>
                      <th className="p-4">Net Payout</th>
                      <th className="p-4">Payment Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {payrollList.map((p) => {
                      const isPaid = p.status === 'paid';
                      return (
                        <tr key={p._id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-xs">
                                {p.employeeName.slice(0, 2)}
                              </div>
                              <span className="font-bold text-white">{p.employeeName}</span>
                            </div>
                          </td>

                          <td className="p-4 font-semibold text-slate-300">{p.period}</td>

                          <td className="p-4 font-medium text-slate-300">
                            ₦{p.baseAmount.toLocaleString()}
                          </td>

                          <td className="p-4 text-xs">
                            {p.bonusAmount > 0 && (
                              <span className="text-emerald-400 font-bold block">
                                +₦{p.bonusAmount.toLocaleString()} (Bonus)
                              </span>
                            )}
                            {p.deductions > 0 && (
                              <span className="text-red-400 font-bold block">
                                -₦{p.deductions.toLocaleString()} (Deduction)
                              </span>
                            )}
                            {p.bonusAmount === 0 && p.deductions === 0 && (
                              <span className="text-text-muted">Standard</span>
                            )}
                          </td>

                          <td className="p-4 font-black text-emerald-400 text-base">
                            ₦{p.netPay.toLocaleString()}
                          </td>

                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                isPaid
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              {isPaid ? <FiCheckCircle size={12} /> : <FiClock size={12} />}
                              <span>{isPaid ? 'Paid & Disbursed' : 'Approved'}</span>
                            </span>
                          </td>

                          <td className="p-4 text-right">
                            {!isPaid && (
                              <button
                                onClick={() => handleMarkPaid(p)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                              >
                                <FiCheck size={12} />
                                <span>Disburse</span>
                              </button>
                            )}
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

        {/* Responsive Generate Payroll Modal */}
        {showGenerateModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-slate-900 border-t sm:border border-white/15 w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 space-y-5 shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    Generate Payroll Disbursement
                  </h3>
                  <p className="text-xs text-text-muted">Issue monthly stipend or salary entry</p>
                </div>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5"
                >
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleGeneratePayroll} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Select Employee *
                  </label>
                  <div className="relative">
                    <select
                      value={selectedEmpId}
                      onChange={(e) => handleEmployeeChange(e.target.value)}
                      className="w-full appearance-none p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm font-bold focus:border-emerald-500 focus:outline-none pr-8"
                    >
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.fullName} ({emp.status} - ₦
                          {(emp.currentSalary || 30000).toLocaleString()})
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Payroll Period *
                  </label>
                  <input
                    type="text"
                    required
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Base (₦) *
                    </label>
                    <input
                      type="number"
                      required
                      value={baseAmount}
                      onChange={(e) => setBaseAmount(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Bonus (₦)</label>
                    <input
                      type="number"
                      value={bonusAmount}
                      onChange={(e) => setBonusAmount(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Deduct (₦)
                    </label>
                    <input
                      type="number"
                      value={deductions}
                      onChange={(e) => setDeductions(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-300">Net Calculated Payout:</span>
                  <span className="text-base font-black text-emerald-400">
                    ₦
                    {(
                      Number(baseAmount) +
                      Number(bonusAmount) -
                      Number(deductions)
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowGenerateModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {submitting ? 'Generating...' : 'Approve Disbursement'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
