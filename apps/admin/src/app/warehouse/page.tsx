'use client';

import React, { useState, useEffect } from 'react';
import {
  FiDatabase,
  FiShield,
  FiRefreshCw,
  FiActivity,
  FiCheckCircle,
  FiLayers,
  FiCompass,
  FiCalendar,
  FiTrendingUp,
  FiSearch,
} from 'react-icons/fi';
import type { WarehouseDiagnosticsStats, HeadToHeadSummary } from '@goalmills/types';

export default function SportsWarehouseStudio() {
  const [stats, setStats] = useState<WarehouseDiagnosticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // H2H Sandbox state
  const [sandboxSport, setSandboxSport] = useState('football');
  const [teamA, setTeamA] = useState('arsenal');
  const [teamB, setTeamB] = useState('chelsea');
  const [h2hResult, setH2hResult] = useState<HeadToHeadSummary | null>(null);
  const [loadingH2H, setLoadingH2H] = useState(false);

  async function loadWarehouseStats() {
    try {
      const res = await fetch('/api/admin/warehouse/stats');
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load warehouse stats:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWarehouseStats();
    handleQueryH2H();
  }, []);

  async function handleTriggerSync() {
    setSyncing(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/warehouse/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: data.message });
        loadWarehouseStats();
        handleQueryH2H();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Sync failed' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error during warehouse backfill' });
    } finally {
      setSyncing(false);
    }
  }

  async function handleQueryH2H() {
    setLoadingH2H(true);
    try {
      const res = await fetch(`/api/warehouse/h2h?sport=${sandboxSport}&teamA=${teamA}&teamB=${teamB}`);
      const data = await res.json();
      if (data.success && data.h2h) {
        setH2hResult(data.h2h);
      }
    } catch (err) {
      console.error('Failed to test H2H query:', err);
    } finally {
      setLoadingH2H(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <FiDatabase size={24} />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <span>Sports Data Warehouse & History Hub</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  PHASE 8 LIVE
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Durable historical sports intelligence, Head-to-Head matrix calculations, and provenance auditing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerSync}
            disabled={syncing}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <FiRefreshCw className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Backfilling Records...' : 'Sync & Backfill Warehouse'}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-white/60 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Historical Football</span>
            <FiActivity className="text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {stats ? stats.totalHistoricalMatches.football : '—'} matches
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Scores, lineups, and goal timestamps
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Cricket Fixtures</span>
            <FiActivity className="text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {stats ? stats.totalHistoricalMatches.cricket : '—'} matches
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Innings, overs, wickets & run rates
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Teams Stored</span>
            <FiShield className="text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {stats ? stats.totalTeams : '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Indexed across {stats?.totalCompetitions || 14} competitions
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Standings Snapshots</span>
            <FiLayers className="text-purple-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {stats ? stats.totalStandingsSnapshots : '—'}
          </div>
          <div className="text-[11px] text-emerald-400 font-bold mt-1">
            ✓ Deduplicated & Indexed
          </div>
        </div>
      </div>

      {/* Provider Provenance Health */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <FiShield className="text-emerald-400" />
          <span>Data Provenance & Provider Integrity</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats?.providerSyncHealth.map((p) => (
            <div key={p.provider} className="p-4 rounded-xl bg-slate-950/80 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-200 uppercase">{p.provider}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                  {p.status}
                </span>
              </div>
              <div className="text-xs text-slate-400 flex justify-between">
                <span>Confidence Rating:</span>
                <span className="font-bold text-amber-400">{Math.round(p.confidenceAvg * 100)}%</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Last Ingestion: {new Date(p.lastSync).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Head-to-Head Interactive Sandbox */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiCompass className="text-blue-400" />
              <span>Head-to-Head (H2H) Analytical Sandbox</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate warehouse queries between any two clubs to inspect analytical calculations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Sport</label>
            <select
              value={sandboxSport}
              onChange={(e) => setSandboxSport(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none"
            >
              <option value="football">Football</option>
              <option value="cricket">Cricket</option>
              <option value="basketball">Basketball</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Team A Slug</label>
            <input
              type="text"
              value={teamA}
              onChange={(e) => setTeamA(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Team B Slug</label>
            <input
              type="text"
              value={teamB}
              onChange={(e) => setTeamB(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleQueryH2H}
              disabled={loadingH2H}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <FiSearch size={14} />
              <span>{loadingH2H ? 'Querying...' : 'Run H2H Query'}</span>
            </button>
          </div>
        </div>

        {/* Query Output */}
        {h2hResult && (
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-white border-b border-white/10 pb-3">
              <span>{h2hResult.teamA.name} vs {h2hResult.teamB.name}</span>
              <span className="text-amber-400">{h2hResult.totalMatches} Historical Fixtures Found</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase">{h2hResult.teamA.name} Wins</div>
                <div className="text-lg font-black text-emerald-400 mt-1">{h2hResult.teamAWins}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase">Draws</div>
                <div className="text-lg font-black text-slate-300 mt-1">{h2hResult.draws}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase">{h2hResult.teamB.name} Wins</div>
                <div className="text-lg font-black text-blue-400 mt-1">{h2hResult.teamBWins}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase">Avg Goals / Match</div>
                <div className="text-lg font-black text-amber-400 mt-1">{h2hResult.avgGoalsPerMatch}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
