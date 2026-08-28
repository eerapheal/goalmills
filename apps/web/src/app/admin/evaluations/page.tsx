'use client';

import { useState, useEffect } from 'react';
import AdminNavBar from '@/components/admin/AdminNavBar';
import { PerformanceScorecard, Employee, ScorecardMetric } from '@goalmills/types';
import { OFFICIAL_SCORECARD_METRICS } from '@/lib/trainingCurriculum';
import {
  FiAward,
  FiPlus,
  FiCheckCircle,
  FiTrendingUp,
  FiStar,
  FiUserCheck,
  FiDollarSign,
  FiSliders,
} from 'react-icons/fi';

export default function EvaluationsAdminPage() {
  const [evaluations, setEvaluations] = useState<PerformanceScorecard[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [period, setPeriod] = useState('30-Day Training Assessment');
  const [strengths, setStrengths] = useState('');
  const [areasForImprovement, setAreasForImprovement] = useState('');
  const [transitionRecommendation, setTransitionRecommendation] = useState<
    'promote_to_regular' | 'extend_training' | 'renegotiate_salary' | 'terminate'
  >('promote_to_regular');

  const [metricScores, setMetricScores] = useState<Record<string, number>>({
    journalism: 85,
    writing: 85,
    research: 90,
    seo: 80,
    social: 85,
    graphics: 80,
    video: 75,
    discipline: 90,
    analytics: 80,
    teamwork: 90,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const [evalRes, empRes] = await Promise.all([
        fetch('/api/evaluations'),
        fetch('/api/admin/employees'),
      ]);

      const evJson = await evalRes.json();
      const emJson = await empRes.json();

      if (evJson.success) setEvaluations(evJson.data);
      if (emJson.success) {
        setEmployees(emJson.data);
        if (emJson.data.length > 0 && !selectedEmployeeId) {
          setSelectedEmployeeId(emJson.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching evaluations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const calculateTotalWeightedScore = () => {
    let total = 0;
    OFFICIAL_SCORECARD_METRICS.forEach((m) => {
      const score = metricScores[m.key] || 0;
      total += (score * m.weight) / 100;
    });
    return Math.round(total * 10) / 10;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) return;

    try {
      setSubmitting(true);
      const metricsPayload: ScorecardMetric[] = OFFICIAL_SCORECARD_METRICS.map((m) => ({
        key: m.key,
        name: m.name,
        weight: m.weight,
        score: metricScores[m.key] || 0,
      }));

      const res = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployeeId,
          period,
          metrics: metricsPayload,
          strengths,
          areasForImprovement,
          transitionRecommendation,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setShowCreateModal(false);
        fetchEvaluations();
      }
    } catch (err) {
      console.error('Error creating evaluation:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const currentTotal = calculateTotalWeightedScore();

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 pt-[85px] sm:pt-[95px] text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminNavBar />

        {/* Top Header Card */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <FiAward className="text-amber-400" /> 100% Weighted Performance Evaluation Matrix
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Section 18 Weighted Performance Metric Engine & 30-Day Transition Assessment
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
          >
            <FiPlus size={16} />
            <span>Conduct New Evaluation</span>
          </button>
        </div>

        {/* Weights Matrix Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {OFFICIAL_SCORECARD_METRICS.map((m) => (
            <div key={m.key} className="glass-card p-3.5 rounded-2xl border border-white/5 text-center">
              <p className="text-xs text-text-muted font-bold truncate">{m.name}</p>
              <p className="text-xl font-black text-amber-400 mt-1">{m.weight}%</p>
              <p className="text-[10px] text-slate-400">Scorecard Weight</p>
            </div>
          ))}
        </div>

        {/* Evaluations History List */}
        {loading ? (
          <div className="p-12 text-center text-text-muted">Loading evaluation scorecards...</div>
        ) : evaluations.length === 0 ? (
          <div className="glass-card p-12 rounded-3xl border border-white/10 text-center space-y-3">
            <FiAward className="mx-auto text-slate-600" size={40} />
            <p className="text-slate-400 font-bold">No performance scorecards recorded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {evaluations.map((ev) => (
              <div
                key={ev._id}
                className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
                      {ev.grade}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">{ev.employeeName}</h3>
                      <p className="text-xs text-text-muted mt-0.5">
                        Period: <span className="text-amber-400 font-semibold">{ev.period}</span> • Evaluated by {ev.evaluatorName} on {ev.evaluationDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-text-muted block font-bold uppercase">Weighted Score</span>
                      <span className="text-2xl font-black text-emerald-400">{ev.totalWeightedScore}%</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs">
                      {ev.transitionRecommendation === 'promote_to_regular'
                        ? '✓ Promoted to Regular (₦50k/mo)'
                        : ev.transitionRecommendation.replace('_', ' ')}
                    </div>
                  </div>
                </div>

                {/* Scorecard Breakdown Bars */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ev.metrics?.map((m) => {
                    const pct = m.score || 0;
                    return (
                      <div key={m.key} className="p-3 bg-slate-950/60 rounded-xl border border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-300">
                            {m.name} <span className="text-text-muted">({m.weight}%)</span>
                          </span>
                          <span className="font-black text-amber-400">{pct} / 100</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Strengths & Improvements */}
                {(ev.strengths || ev.areasForImprovement) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                    {ev.strengths && (
                      <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                        <p className="font-bold text-emerald-400 uppercase tracking-wider">Demonstrated Strengths</p>
                        <p className="text-slate-300 leading-relaxed">{ev.strengths}</p>
                      </div>
                    )}
                    {ev.areasForImprovement && (
                      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-1">
                        <p className="font-bold text-amber-400 uppercase tracking-wider">Growth & Focus Areas</p>
                        <p className="text-slate-300 leading-relaxed">{ev.areasForImprovement}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Conduct Evaluation Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 w-full max-w-3xl rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-xl font-black text-white">Scorecard Evaluation Generator</h3>
                  <p className="text-xs text-text-muted">Calculate 10-point weighted score (100% total matrix)</p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-text-muted block">Calculated Total</span>
                  <span className="text-2xl font-black text-amber-400">{currentTotal}%</span>
                </div>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Select Employee *</label>
                    <select
                      value={selectedEmployeeId}
                      onChange={(e) => setSelectedEmployeeId(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:border-blue-500 focus:outline-none"
                    >
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.fullName} ({emp.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Assessment Period *</label>
                    <input
                      type="text"
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Score Sliders */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Weighted Metrics (0 - 100 Points per Area)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {OFFICIAL_SCORECARD_METRICS.map((m) => {
                      const val = metricScores[m.key] || 80;
                      return (
                        <div key={m.key} className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-200">
                              {m.name} <span className="text-amber-400">({m.weight}%)</span>
                            </span>
                            <span className="font-black text-emerald-400">{val}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={val}
                            onChange={(e) =>
                              setMetricScores({
                                ...metricScores,
                                [m.key]: Number(e.target.value),
                              })
                            }
                            className="w-full"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Transition Decision */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    30-Day Transition Recommendation
                  </label>
                  <select
                    value={transitionRecommendation}
                    onChange={(e: any) => setTransitionRecommendation(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="promote_to_regular">
                      ✓ Promote to Regular Staff (Upgrade to Starting Salary: ₦50,000/mo)
                    </option>
                    <option value="extend_training">Extend 30-Day Training / Probation Period</option>
                    <option value="renegotiate_salary">Renegotiate Compensation Terms</option>
                    <option value="terminate">Discontinue Engagement</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Key Strengths</label>
                    <textarea
                      rows={3}
                      placeholder="Strong storytelling, timely breaking news, accurate facts..."
                      value={strengths}
                      onChange={(e) => setStrengths(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Areas for Improvement</label>
                    <textarea
                      rows={3}
                      placeholder="SEO meta descriptions, Canva thumbnail CTR, stand-up punctuality..."
                      value={areasForImprovement}
                      onChange={(e) => setAreasForImprovement(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 disabled:opacity-50"
                  >
                    {submitting ? 'Recording Grade...' : 'Save & Issue Evaluation'}
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
