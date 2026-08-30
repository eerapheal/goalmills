'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  FiSliders,
  FiZap,
  FiTrendingUp,
  FiCheckCircle,
  FiPlay,
  FiRefreshCw,
  FiSave,
  FiLayers,
  FiCompass,
  FiSmartphone,
  FiMail,
  FiFileText,
  FiAward,
} from 'react-icons/fi';
import { GoalmillsLoader } from '@/components/GoalmillsLoader';
import type {
  RecommendationAlgorithmWeights,
  RecommendationCandidate,
  RecommendationContext,
} from '@goalmills/types';

const DEFAULT_WEIGHTS: RecommendationAlgorithmWeights = {
  sportMatchWeight: 30,
  competitionMatchWeight: 25,
  teamOverlapWeight: 35,
  categoryMatchWeight: 15,
  recencyDecayHours: 48,
  trendingPopularityWeight: 20,
  personalizationAffinityWeight: 25,
  diversityPenalty: 10,
};

export default function RecommendationsStudioPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'weights' | 'simulation' | 'metrics'>('weights');
  const [tenantFilter, setTenantFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Weights State
  const [weights, setWeights] = useState<RecommendationAlgorithmWeights>(DEFAULT_WEIGHTS);
  const [maxPerSport, setMaxPerSport] = useState<number>(4);

  // Simulation State
  const [simContext, setSimContext] = useState<RecommendationContext>('article_detail');
  const [simSport, setSimSport] = useState('football');
  const [simTeam, setSimTeam] = useState('Arsenal');
  const [simFavorites, setSimFavorites] = useState('Arsenal, Real Madrid, Lakers');
  const [simRunning, setSimRunning] = useState(false);
  const [simCandidates, setSimCandidates] = useState<RecommendationCandidate[]>([]);

  const isSuperAdmin = session?.user?.role === 'super-admin';

  async function fetchConfig() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/recommendations/config?tenantSlug=${tenantFilter}`);
      const json = await res.json();
      if (json.success && json.config?.weights) {
        setWeights(json.config.weights);
        if (json.config.maxCandidatesPerSport) {
          setMaxPerSport(json.config.maxCandidatesPerSport);
        }
      }
    } catch (err) {
      console.error('Failed to load recommendation config:', err);
    } finally {
      setLoading(false);
    }
  }

  async function saveWeights() {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/admin/recommendations/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantSlug: tenantFilter,
          weights,
          maxCandidatesPerSport: maxPerSport,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save recommendation weights:', err);
    } finally {
      setSaving(false);
    }
  }

  async function runSimulation() {
    setSimRunning(true);
    try {
      const favoritesArr = simFavorites
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/admin/recommendations/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantSlug: tenantFilter,
          context: simContext,
          sportSlug: simSport,
          teamSlug: simTeam,
          userFavorites: favoritesArr,
          limit: 8,
        }),
      });

      const json = await res.json();
      if (json.success && json.candidates) {
        setSimCandidates(json.candidates);
      }
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setSimRunning(false);
    }
  }

  useEffect(() => {
    fetchConfig();
  }, [tenantFilter]);

  useEffect(() => {
    if (activeTab === 'simulation' && simCandidates.length === 0) {
      runSimulation();
    }
  }, [activeTab]);

  return (
    <div className="space-y-6 pb-12">
      {/* ========================================================================= */}
      {/* TOP HEADER: Title, Realtime Status, Tenant Switcher & Save Button */}
      {/* ========================================================================= */}
      <div className="glass-card border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-2xl bg-slate-950/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
                <FiSliders size={20} />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <span>Recommendation Engine Studio</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  Configure hybrid deterministic scoring, affinity weights & test real-time candidate delivery
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Pulse */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-xs font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Engine Active (&lt; 10ms)</span>
            </div>

            {/* Tenant Filter */}
            {isSuperAdmin && (
              <select
                value={tenantFilter}
                onChange={(e) => setTenantFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-amber-400"
              >
                <option value="all">🌐 All Tenants</option>
                <option value="goalmills">GoalMills Global</option>
                <option value="chelsea-hub">Chelsea Fan Network</option>
                <option value="cricket-central">Cricket Central</option>
              </select>
            )}

            {/* Save Button */}
            <button
              onClick={saveWeights}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-500/25"
            >
              {saving ? <FiRefreshCw className="animate-spin" size={14} /> : <FiSave size={14} />}
              <span>{saving ? 'Saving...' : 'Save Weights'}</span>
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <FiCheckCircle size={16} />
            <span>Algorithm weights updated and deployed across Web, Mobile & Newsletter pipelines!</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/5 overflow-x-auto">
          {[
            { id: 'weights', label: 'Algorithm Tuning Studio', icon: FiSliders },
            { id: 'simulation', label: 'Candidate Simulation Playground', icon: FiPlay },
            { id: 'metrics', label: 'CTR & Discovery Telemetry', icon: FiTrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-16">
          <GoalmillsLoader size="lg" label="Recommendation Studio" sublabel="Syncing algorithm parameters..." />
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* TAB 1: ALGORITHM TUNING STUDIO */}
          {/* ========================================================================= */}
          {activeTab === 'weights' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Deterministic Weights */}
              <div className="glass-card border border-white/10 rounded-3xl p-5 sm:p-6 bg-slate-950/60 space-y-5">
                <div>
                  <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <FiLayers className="text-amber-400" />
                    <span>Deterministic Content Similarity</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Feature scoring weights applied when calculating similarity to currently viewed article or match.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                      <span>Sport Match Weight</span>
                      <span className="text-amber-400 font-mono">+{weights.sportMatchWeight} pts</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={weights.sportMatchWeight}
                      onChange={(e) => setWeights({ ...weights, sportMatchWeight: Number(e.target.value) })}
                      className="w-full accent-amber-400 bg-slate-800"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                      <span>Team Entity Overlap Weight</span>
                      <span className="text-amber-400 font-mono">+{weights.teamOverlapWeight} pts</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={weights.teamOverlapWeight}
                      onChange={(e) => setWeights({ ...weights, teamOverlapWeight: Number(e.target.value) })}
                      className="w-full accent-amber-400 bg-slate-800"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                      <span>Competition / League Match Weight</span>
                      <span className="text-amber-400 font-mono">+{weights.competitionMatchWeight} pts</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={weights.competitionMatchWeight}
                      onChange={(e) => setWeights({ ...weights, competitionMatchWeight: Number(e.target.value) })}
                      className="w-full accent-amber-400 bg-slate-800"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                      <span>Category Taxonomy Match Weight</span>
                      <span className="text-amber-400 font-mono">+{weights.categoryMatchWeight} pts</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={weights.categoryMatchWeight}
                      onChange={(e) => setWeights({ ...weights, categoryMatchWeight: Number(e.target.value) })}
                      className="w-full accent-amber-400 bg-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Personalization & Recency Decay */}
              <div className="glass-card border border-white/10 rounded-3xl p-5 sm:p-6 bg-slate-950/60 space-y-5">
                <div>
                  <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <FiZap className="text-emerald-400" />
                    <span>Personalization, Popularity & Decay</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Fine-tune how user affinity signals and publication age impact final candidate ranking.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                      <span>Personalization Affinity Boost</span>
                      <span className="text-emerald-400 font-mono">+{weights.personalizationAffinityWeight} pts</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={weights.personalizationAffinityWeight}
                      onChange={(e) => setWeights({ ...weights, personalizationAffinityWeight: Number(e.target.value) })}
                      className="w-full accent-emerald-400 bg-slate-800"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                      <span>Trending Popularity Multiplier</span>
                      <span className="text-emerald-400 font-mono">+{weights.trendingPopularityWeight} pts</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={weights.trendingPopularityWeight}
                      onChange={(e) => setWeights({ ...weights, trendingPopularityWeight: Number(e.target.value) })}
                      className="w-full accent-emerald-400 bg-slate-800"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                      <span>Recency Half-Life Decay</span>
                      <span className="text-purple-400 font-mono">{weights.recencyDecayHours} Hours</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="168"
                      step="6"
                      value={weights.recencyDecayHours}
                      onChange={(e) => setWeights({ ...weights, recencyDecayHours: Number(e.target.value) })}
                      className="w-full accent-purple-400 bg-slate-800"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Articles lose 50% scoring power every {weights.recencyDecayHours} hours.
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                      <span>Category Diversity Limit</span>
                      <span className="text-blue-400 font-mono">{maxPerSport} Max / Sport</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      value={maxPerSport}
                      onChange={(e) => setMaxPerSport(Number(e.target.value))}
                      className="w-full accent-blue-400 bg-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: CANDIDATE SIMULATION PLAYGROUND */}
          {/* ========================================================================= */}
          {activeTab === 'simulation' && (
            <div className="space-y-6">
              {/* Simulation Controls */}
              <div className="glass-card border border-white/10 rounded-3xl p-5 sm:p-6 bg-slate-950/60">
                <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FiPlay className="text-amber-400" />
                  <span>Recommendation Sandbox Input Parameters</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Context Placement
                    </label>
                    <select
                      value={simContext}
                      onChange={(e) => setSimContext(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-amber-400"
                    >
                      <option value="article_detail">Article Detail Page</option>
                      <option value="homepage">Homepage "For You"</option>
                      <option value="match_detail">Match Live Center</option>
                      <option value="mobile_feed">Mobile App Feed</option>
                      <option value="newsletter">Email Newsletter</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Current Sport
                    </label>
                    <select
                      value={simSport}
                      onChange={(e) => setSimSport(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-amber-400"
                    >
                      <option value="football">Football</option>
                      <option value="cricket">Cricket</option>
                      <option value="basketball">Basketball</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Target Subject / Team
                    </label>
                    <input
                      type="text"
                      value={simTeam}
                      onChange={(e) => setSimTeam(e.target.value)}
                      placeholder="e.g. Arsenal or Chelsea"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      User Favorite Teams (CSV)
                    </label>
                    <input
                      type="text"
                      value={simFavorites}
                      onChange={(e) => setSimFavorites(e.target.value)}
                      placeholder="Arsenal, Real Madrid"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    onClick={runSimulation}
                    disabled={simRunning}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-500/25"
                  >
                    <FiPlay size={14} className={simRunning ? 'animate-spin' : ''} />
                    <span>{simRunning ? 'Running Algorithm...' : 'Run Simulation'}</span>
                  </button>
                </div>
              </div>

              {/* Scored Candidate Results */}
              <div className="glass-card border border-white/10 rounded-3xl p-5 sm:p-6 bg-slate-950/60 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <FiAward className="text-amber-400" />
                    <span>Ranked Candidates Output ({simCandidates.length})</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">Sorted by Composite Score</span>
                </div>

                {simCandidates.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No candidates generated. Click "Run Simulation" above.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {simCandidates.map((cand, idx) => (
                      <div
                        key={cand.id + idx}
                        className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between hover:bg-white/10 transition-all group"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold text-[10px] uppercase">
                              {cand.reasonBadge}
                            </span>
                            <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                              Score: {cand.score}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                            {cand.title}
                          </h4>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span className="uppercase">{cand.sportSlug || 'Sports'} • {cand.type}</span>
                          <span>Algorithm: {cand.algorithm}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CTR & DISCOVERY TELEMETRY */}
          {/* ========================================================================= */}
          {activeTab === 'metrics' && (
            <div className="space-y-6">
              {/* CTR KPI Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/10">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Recommendation Impressions
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-white">48,210</div>
                  <p className="text-[11px] text-emerald-400 font-bold mt-1">↑ 18.4% Discovery Lift</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/10">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Recommendation Clicks
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400">4,195</div>
                  <p className="text-[11px] text-slate-400 mt-1">Direct reader actions</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/10">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Overall Network CTR
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">8.7%</div>
                  <p className="text-[11px] text-slate-400 mt-1">Benchmark: &gt; 4.5%</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/10">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Top Converting Context
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-white">Article Detail</div>
                  <p className="text-[11px] text-purple-400 font-bold mt-1">11.2% CTR on Related</p>
                </div>
              </div>

              {/* Context Breakdown */}
              <div className="glass-card border border-white/10 rounded-3xl p-5 sm:p-6 bg-slate-950/60 space-y-4">
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FiCompass className="text-cyan-400" />
                  <span>Discovery Performance by Platform Placement</span>
                </h3>

                <div className="space-y-3 pt-2">
                  {[
                    { name: 'Article Detail (Related Intel & Stories)', ctr: '11.2%', count: '2,140 clicks', color: 'from-amber-400 to-amber-500' },
                    { name: 'Mobile Feed Carousel (In-App Discovery)', ctr: '9.4%', count: '1,230 clicks', color: 'from-cyan-400 to-blue-500' },
                    { name: 'Homepage Personalized "For You"', ctr: '7.8%', count: '610 clicks', color: 'from-purple-400 to-purple-500' },
                    { name: 'Newsletter Curated Digests', ctr: '6.5%', count: '215 clicks', color: 'from-emerald-400 to-emerald-500' },
                  ].map((ctx) => (
                    <div key={ctx.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-300">{ctx.name}</span>
                        <span className="text-amber-400 font-mono">{ctx.ctr} CTR ({ctx.count})</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-900 border border-white/5 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${ctx.color} rounded-full`}
                          style={{ width: ctx.ctr }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
