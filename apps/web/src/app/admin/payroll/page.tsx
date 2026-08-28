'use client';

import { useState, useEffect } from 'react';
import AdminNavBar from '@/components/admin/AdminNavBar';
import { PayrollRecord, Employee } from '@goalmills/types';
import {
  FiDollarSign,
  FiPlus,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiCalendar,
  FiCreditCard,
  FiFilter,
  FiPrinter,
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

      const [payRes, empRes] = await Promise.all([fetch(url.toString()), fetch('/api/admin/employees')]);
      const pJson = await payRes.json();
      const eJson = await empRes.json();

      if (pJson.success) setPayrollList(pJson.data);
      if (eJson.success) {
        setEmployees(eJson.data);
        if (eJson.data.length > 0 && !selectedEmpId) {
          setSelectedEmpId(eJson.data[0]._id);
          setBaseAmount(eJson.data[0].currentSalary || 30000);
        }
      }
    } catch (err) {
      console.error('Error fetching payroll:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [statusFilter]);

  const handleMarkPaid = async (payrollId: string) => {
    try {
      const res = await fetch('/api/payroll', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payrollId,
          status: 'paid',
          paymentDate: new Date().toISOString().split('T')[0],
          referenceNumber: `GM-TXN-${Date.now().toString().slice(-8)}`,
        }),
      });
      const json = await res.json();
      if (json.success) {
        fetchPayroll();
      }
    } catch (err) {
      console.error('Error updating payroll status:', err);
    }
  };

  const handleCreatePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmpId,
          period,
          baseAmount,
          bonusAmount,
          deductions,
          notes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setShowGenerateModal(false);
        fetchPayroll();
      }
    } catch (err) {
      console.error('Error creating payroll entry:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const totalDisbursed = payrollList
    .filter((p) => p.status === 'paid')
    .reduce((acc, p) => acc + (p.netPay || 0), 0);

  const totalPending = payrollList
    .filter((p) => p.status !== 'paid')
    .reduce((acc, p) => acc + (p.netPay || 0), 0);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 pt-[85px] sm:pt-[95px] text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminNavBar />

        {/* Top Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider font-bold">Total Payroll Records</p>
              <h3 className="text-2xl font-black text-white mt-1">{payrollList.length} Entries</h3>
              <p className="text-xs text-text-muted mt-1">GoalMills Staff & Trainees</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FiFileText size={22} />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider font-bold">Total Disbursed (Paid)</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">₦{totalDisbursed.toLocaleString()}</h3>
              <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                <FiCheckCircle size={12} /> Confirmed Bank Transfers
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FiDollarSign size={22} />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider font-bold">Pending Approval / Payout</p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">₦{totalPending.toLocaleString()}</h3>
              <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                <FiClock size={12} /> Current Cycle Obligations
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FiCreditCard size={22} />
            </div>
          </div>
        </div>

        {/* Controls & Filter */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xl">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <FiDollarSign className="text-amber-400" /> Newsroom Payroll & Allowance Ledger
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Standardized tiers: ₦30,000 (30-day training) &rarr; ₦50,000 (Regular starting)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs sm:text-sm font-bold text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Paid & Disbursed</option>
              <option value="approved">Approved</option>
              <option value="draft">Draft</option>
            </select>

            <button
              onClick={() => setShowGenerateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
            >
              <FiPlus size={16} />
              <span>Create Pay Record</span>
            </button>
          </div>
        </div>

        {/* Payroll Table */}
        <div className="glass-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-12 text-center text-text-muted">Loading payroll records...</div>
          ) : payrollList.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FiDollarSign className="mx-auto text-slate-600" size={40} />
              <p className="text-slate-400 font-bold">No payroll records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-text-muted border-b border-white/5">
                  <tr>
                    <th className="p-4">Staff Member</th>
                    <th className="p-4">Period</th>
                    <th className="p-4">Classification</th>
                    <th className="p-4">Base & Adjustments</th>
                    <th className="p-4">Net Amount</th>
                    <th className="p-4">Status & Ref</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {payrollList.map((item) => {
                    const isPaid = item.status === 'paid';
                    const isTraining = item.paymentType === 'training_allowance';
                    return (
                      <tr key={item._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-white">{item.employeeName}</p>
                          <p className="text-xs text-text-muted">{item.jobTitle}</p>
                        </td>

                        <td className="p-4 font-semibold text-slate-200">{item.period}</td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              isTraining
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}
                          >
                            {isTraining ? '⚡ 30-Day Training Stipend' : 'Standard Monthly Salary'}
                          </span>
                        </td>

                        <td className="p-4 text-xs text-slate-300">
                          <p>Base: ₦{item.baseAmount.toLocaleString()}</p>
                          {(item.bonusAmount > 0 || item.deductions > 0) && (
                            <p className="text-text-muted">
                              Bonus: +₦{item.bonusAmount} | Ded: -₦{item.deductions}
                            </p>
                          )}
                        </td>

                        <td className="p-4">
                          <p className="font-black text-base text-emerald-400">
                            ₦{item.netPay.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-text-muted">{item.paymentMethod || 'Bank Transfer'}</p>
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                              isPaid
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {isPaid ? <FiCheckCircle size={12} /> : <FiClock size={12} />}
                            <span>{item.status}</span>
                          </span>
                          {item.referenceNumber && (
                            <p className="text-[10px] text-text-muted font-mono mt-1">
                              {item.referenceNumber}
                            </p>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          {!isPaid ? (
                            <button
                              onClick={() => handleMarkPaid(item._id!)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                            >
                              Mark Paid
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">Paid on {item.paymentDate}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Generate Pay Record Modal */}
        {showGenerateModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div>
                <h3 className="text-xl font-black text-white">Create Payroll Record</h3>
                <p className="text-xs text-text-muted">Issue monthly stipend or regular salary entry</p>
              </div>

              <form onSubmit={handleCreatePayroll} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Select Employee *</label>
                  <select
                    value={selectedEmpId}
                    onChange={(e) => {
                      setSelectedEmpId(e.target.value);
                      const emp = employees.find((x) => x._id === e.target.value);
                      if (emp) setBaseAmount(emp.currentSalary || 30000);
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.fullName} ({emp.status} - ₦{(emp.currentSalary || 30000).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Period (Month & Year) *</label>
                  <input
                    type="text"
                    required
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Base Pay (₦)</label>
                    <input
                      type="number"
                      required
                      value={baseAmount}
                      onChange={(e) => setBaseAmount(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Bonus (₦)</label>
                    <input
                      type="number"
                      value={bonusAmount}
                      onChange={(e) => setBonusAmount(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Deductions (₦)</label>
                    <input
                      type="number"
                      value={deductions}
                      onChange={(e) => setDeductions(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Notes / Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Month 1 30-Day Training Stipend"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
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
                    {submitting ? 'Generating...' : 'Save & Issue Payroll Entry'}
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
