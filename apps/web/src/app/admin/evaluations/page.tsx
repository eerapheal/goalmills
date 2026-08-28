'use client';

import { useState, useEffect } from 'react';
import AdminNavBar from '@/components/admin/AdminNavBar';
import GoalmillsLoader from '@/components/GoalmillsLoader';
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
  FiX,
  FiChevronDown,
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
    speed: 85,
    collaboration: 90,
    attendance: 95,
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const [evRes, empRes] = await Promise.all([
        fetch('/api/evaluations'),
        fetch('/api/admin/employees'),
      ]);
      const evJson = await evRes.json();
      const empJson = await empRes.json();

      if (evJson.success) setEvaluations(evJson.data);
      if (empJson.success) {
        setEmployees(empJson.data);
        if (empJson.data.length > 0 && !selectedEmployeeId) {
          setSelectedEmployeeId(empJson.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Error loading evaluations:', err);
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
      const raw = metricScores[m.key] || 0;
      total += (raw * m.weight) / 100;
    });
    return Math.round(total * 10) / 10;
  };

  const calculateGrade = (score: number) => {
    if (score >= 90) return 'A (Outstanding)';
    if (score >= 80) return 'B (Commendable)';
    if (score >= 70) return 'C (Satisfactory)';
    if (score >= 60) return 'D (Needs Improvement)';
    return 'F (Unsatisfactory)';
  };

  const handleScoreChange = (metricKey: string, val: number) => {
    setMetricScores((prev) => ({ ...prev, [metricKey]: val }));
  };

  const handleCreateEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e._id === selectedEmployeeId);
    if (!emp) return;

    const totalWeightedScore = calculateTotalWeightedScore();
    const grade = calculateGrade(totalWeightedScore);

    const metricsPayload: ScorecardMetric[] = OFFICIAL_SCORECARD_METRICS.map((m) => ({
      key: m.key,
      name: m.name,
      weight: m.weight,
      score: metricScores[m.key] || 0,
      weightedScore: ((metricScores[m.key] || 0) * m.weight) / 100,
    }));

    try {
      setSubmitting(true);
      const res = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: emp._id,
          employeeName: emp.fullName,
          period,
          evaluationDate: new Date().toISOString().split('T')[0],
          evaluatorName: 'Ekpenisi Erue Raphael',
          metrics: metricsPayload,
          totalWeightedScore,
          grade,
          strengths,
          areasForImprovement,
          transitionRecommendation,
          newSalary: transitionRecommendation === 'promote_to_regular' ? 50000 : emp.currentSalary || 30000,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setShowCreateModal(false);
        fetchEvaluations();
      }
    } catch (err) {
      console.error('Error saving evaluation:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-3.5 sm:p-6 pt-[80px] sm:pt-[95px] text-white">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
        <AdminNavBar />

        {/* Top Header Card */}
        <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xl">
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2">
              <FiAward className="text-amber-400" /> 100% Weighted Performance Evaluation Matrix
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Section 18 Weighted Performance Metric Engine & 30-Day Transition Assessment
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 w-full sm:w-auto"
          >
            <FiPlus size={16} />
            <span>Conduct New Evaluation</span>
          </button>
        </div>

        {/* Metric Weights Breakdown Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
          {OFFICIAL_SCORECARD_METRICS.map((m) => (
            <div key={m.key} className="glass-card p-3 rounded-xl sm:rounded-2xl border border-white/5 text-center">
              <p className="text-[11px] sm:text-xs text-text-muted font-bold truncate">{m.name}</p>
              <p className="text-base sm:text-xl font-black text-amber-400 mt-1">{m.weight}%</p>
              <p className="text-[9px] sm:text-[10px] text-slate-400">Scorecard Weight</p>
            </div>
          ))}
        </div>

        {/* Evaluations History List */}
        {loading ? (
          <div className="p-12 flex justify-center">
            <GoalmillsLoader
              size="md"
              label="Performance Scoring Matrix"
              sublabel="Fetching 100% weighted scorecards & metrics..."
            />
          </div>
        ) : evaluations.length === 0 ? (
          <div className="glass-card p-12 rounded-3xl border border-white/10 text-center space-y-3">
            <FiAward className="mx-auto text-slate-600" size={40} />
            <p className="text-slate-400 font-bold">No performance scorecards recorded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:gap-6">
            {evaluations.map((ev) => (
              <div
                key={ev._id}
                className="glass-card p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl space-y-5 sm:space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black text-lg sm:text-xl shadow-lg shadow-amber-500/20 flex-shrink-0">
                      {ev.grade.slice(0, 1)}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-xl font-black text-white">{ev.employeeName}</h3>
                      <p className="text-xs text-text-muted mt-0.5">
                        Period: <span className="text-amber-400 font-semibold">{ev.period}</span> • Evaluator: {ev.evaluatorName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <span className="text-[10px] sm:text-xs text-text-muted block font-bold uppercase">Weighted Score</span>
                      <span className="text-xl sm:text-2xl font-black text-emerald-400">{ev.totalWeightedScore}%</span>
                    </div>

                    <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs">
                      {ev.grade}
                    </div>
                  </div>
                </div>

                {/* Scorecard 10-Metric Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
                  {ev.metrics?.map((m) => (
                    <div key={m.key} className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                      <div className="flex items-center justify-between text-[11px] text-text-muted">
                        <span className="truncate font-semibold">{m.name}</span>
                        <span className="text-amber-400 font-bold">{m.weight}%</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-sm font-black text-white">{m.score}/100</span>
                        <span className="text-[10px] text-emerald-400 font-bold">
                          +{(m.weightedScore ?? (m.score * m.weight) / 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Qualitative Feedback */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                    <span className="font-bold text-emerald-400 block uppercase tracking-wider text-[11px]">
                      Demonstrated Strengths:
                    </span>
                    <p className="text-slate-300">{ev.strengths || 'N/A'}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                    <span className="font-bold text-amber-400 block uppercase tracking-wider text-[11px]">
                      Areas for Continuous Improvement:
                    </span>
                    <p className="text-slate-300">{ev.areasForImprovement || 'N/A'}</p>
                  </div>
                </div>

                {/* 30-Day Transition Verdict & Salary Adjustment */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <FiDollarSign className="text-amber-400 flex-shrink-0" size={22} />
                    <div>
                      <span className="text-xs font-bold text-text-muted uppercase">
                        Transition Recommendation & Compensation
                      </span>
                      <p className="text-sm font-black text-white mt-0.5">
                        {ev.transitionRecommendation === 'promote_to_regular'
                          ? 'Promoted to Regular Staff (₦50,000 / Month)'
                          : ev.transitionRecommendation.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold w-fit">
                    Verified Outcome
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* Responsive Conduct Evaluation Modal */}
        {/* ------------------------------------------------------------- */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-slate-900 border-t sm:border border-white/15 w-full max-w-3xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl animate-fade-in">
              <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white">Score Performance (100% Matrix)</h3>
                  <p className="text-xs text-text-muted">Section 18 Weighted Performance Evaluation</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5"
                >
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateEvaluation} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
                {/* Employee Selection Dropdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Select Employee *</label>
                    <div className="relative">
                      <select
                        value={selectedEmployeeId}
                        onChange={(e) => setSelectedEmployeeId(e.target.value)}
                        className="w-full appearance-none p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm font-bold focus:border-amber-500 focus:outline-none pr-8"
                      >
                        {employees.map((emp) => (
                          <option key={emp._id} value={emp._id}>
                            {emp.fullName} ({emp.status})
                          </option>
                        ))}
                      </select>
                      <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Evaluation Period *</label>
                    <input
                      type="text"
                      required
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 10 Score Sliders */}
                <div className="space-y-3 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Evaluation Criteria (10 Weighted Factors)
                    </span>
                    <span className="text-xs font-black text-emerald-400">
                      Current Total: {calculateTotalWeightedScore()}% ({calculateGrade(calculateTotalWeightedScore())})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {OFFICIAL_SCORECARD_METRICS.map((metric) => (
                      <div key={metric.key} className="bg-slate-950/60 p-3 rounded-xl border border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-200">{metric.name}</span>
                          <span className="text-amber-400 font-bold">{metricScores[metric.key] || 0} / 100 ({metric.weight}%)</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={metricScores[metric.key] || 0}
                          onChange={(e) => handleScoreChange(metric.key, Number(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Key Strengths & Achievements</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Excellent breaking news speed, strong SEO optimization, proactive in daily standups..."
                      value={strengths}
                      onChange={(e) => setStrengths(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Areas for Development</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Expand Canva infographics, refine video match highlights..."
                      value={areasForImprovement}
                      onChange={(e) => setAreasForImprovement(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Transition Recommendation */}
                <div className="pt-2 border-t border-white/10">
                  <label className="block text-xs font-bold text-slate-300 mb-1">30-Day Transition Verdict *</label>
                  <div className="relative">
                    <select
                      value={transitionRecommendation}
                      onChange={(e: any) => setTransitionRecommendation(e.target.value)}
                      className="w-full appearance-none p-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs sm:text-sm font-bold focus:border-amber-500 focus:outline-none pr-8"
                    >
                      <option value="promote_to_regular">🌟 Promote to Regular Staff (₦50,000 / month)</option>
                      <option value="extend_training">⏳ Extend 30-Day Training Period</option>
                      <option value="renegotiate_salary">💵 Renegotiate Compensation</option>
                      <option value="terminate">⛔ Conclude Appointment</option>
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 disabled:opacity-50"
                  >
                    {submitting ? 'Saving Scorecard...' : 'Complete Evaluation'}
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
