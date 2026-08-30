'use client';

import React, { useState, useEffect } from 'react';
import {
  FiActivity,
  FiZap,
  FiAlertTriangle,
  FiRefreshCw,
  FiPlay,
  FiCheckCircle,
  FiTrash2,
  FiClock,
  FiTrendingUp,
  FiRadio,
  FiLayers,
  FiServer,
  FiDatabase,
} from 'react-icons/fi';
import type { PipelineThroughputStats, DeadLetterEventRecord } from '@goalmills/types';

export default function SportsEventStreamStudio() {
  const [stats, setStats] = useState<PipelineThroughputStats | null>(null);
  const [dlqEvents, setDlqEvents] = useState<DeadLetterEventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [replayingId, setReplayingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Simulation form state
  const [simSport, setSimSport] = useState<'football' | 'cricket' | 'basketball'>('football');
  const [simEventType, setSimEventType] = useState<'goal' | 'red_card' | 'wicket' | 'sixer' | 'dunk'>('goal');
  const [simHomeTeam, setSimHomeTeam] = useState('Arsenal');
  const [simAwayTeam, setSimAwayTeam] = useState('Chelsea');
  const [simScore, setSimScore] = useState('2 - 1');

  async function loadData() {
    try {
      setRefreshing(true);
      const [statsRes, dlqRes] = await Promise.all([
        fetch('/api/admin/events/stats'),
        fetch('/api/admin/events/dlq?status=all&limit=15'),
      ]);

      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      const dlqData = await dlqRes.json();
      if (dlqData.success) {
        setDlqEvents(dlqData.events || []);
      }
    } catch (err) {
      console.error('Failed to load event pipeline data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  async function handleSimulate() {
    setSimulating(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/events/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sport: simSport,
          eventType: simEventType,
          homeTeam: simHomeTeam,
          awayTeam: simAwayTeam,
          score: simScore,
          headline: `SIMULATED ${simEventType.toUpperCase()}: ${simHomeTeam} vs ${simAwayTeam}`,
          detail: `Matchday moment pushed via GoalMills Stream Pipeline at ${new Date().toLocaleTimeString()}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: data.message });
        loadData();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to simulate event' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to send simulation request' });
    } finally {
      setSimulating(false);
    }
  }

  async function handleReplay(id: string) {
    setReplayingId(id);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/events/dlq/replay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: 'Event successfully replayed to stream' });
        loadData();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Replay failed' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error during replay' });
    } finally {
      setReplayingId(null);
    }
  }

  async function handlePurgeDLQ() {
    if (!confirm('Are you sure you want to purge all resolved/discarded DLQ entries?')) return;
    try {
      const res = await fetch('/api/admin/events/dlq', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: data.message });
        loadData();
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to purge DLQ' });
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <FiZap size={24} />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <span>Matchday Stream & Telemetry Pipeline</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  PHASE 7 LIVE
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Real-time sports event broker, non-blocking telemetry ingestion, and Dead-Letter Queue management.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={refreshing}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-200 text-xs font-bold transition flex items-center gap-2"
          >
            <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Syncing...' : 'Refresh Metrics'}</span>
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
          <button onClick={() => setFeedback(null)} className="text-white/60 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Stream Throughput</span>
            <FiActivity className="text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {stats ? `${stats.currentEventsPerSec} eps` : '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">Peak:</span>
            <span>{stats?.peakEventsPerSec24h || 1420} eps (24h high)</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Ingest Latency</span>
            <FiClock className="text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {stats ? `${stats.avgIngestLatencyMs} ms` : '—'}
          </div>
          <div className="text-[11px] text-emerald-400 font-bold mt-1">
            ⚡ Ultra-fast non-blocking buffer
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Events (24h)</span>
            <FiLayers className="text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {stats ? stats.totalEventsProcessed24h.toLocaleString() : '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Goals, score updates, reader signals & ad telemetry
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">DLQ Failed Events</span>
            <FiAlertTriangle className={stats && stats.unresolvedDeadLetters > 0 ? 'text-rose-400' : 'text-slate-400'} />
          </div>
          <div className="text-3xl font-black text-white">
            {stats ? stats.unresolvedDeadLetters : '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {stats?.deadLetterCount || 0} total logged in dead-letter store
          </div>
        </div>
      </div>

      {/* Grid: Sport Telemetry Distribution & Live Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sports Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiTrendingUp className="text-blue-400" />
              <span>Telemetry Sport Breakdown</span>
            </h3>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1 font-bold">
                <span className="text-emerald-400">⚽ Football Matches</span>
                <span>{stats?.sportTelemetryBreakdown.football || 450} events</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-bold">
                <span className="text-amber-400">🏏 Cricket Overs & Wickets</span>
                <span>{stats?.sportTelemetryBreakdown.cricket || 280} events</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '28%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-bold">
                <span className="text-orange-400">🏀 Basketball Points & Dunks</span>
                <span>{stats?.sportTelemetryBreakdown.basketball || 190} events</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: '20%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-bold">
                <span className="text-blue-400">📰 Editorial & Tactical Intel</span>
                <span>{stats?.sportTelemetryBreakdown.editorial || 620} events</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-bold">
                <span className="text-purple-400">📢 Sponsorship Ad Streams</span>
                <span>{stats?.sportTelemetryBreakdown.sponsorship || 340} events</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time Live Sports Match Simulator */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiRadio className="text-rose-400 animate-pulse" />
              <span>Live Matchday Stream Simulator</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Simulate Match Event</span>
          </div>

          <p className="text-xs text-slate-400">
            Inject a live match moment into the stream broker to verify SSE fanout, consumer worker processing, and fan scoreboard updates.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Sport</label>
              <select
                value={simSport}
                onChange={(e) => setSimSport(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="football">Football</option>
                <option value="cricket">Cricket</option>
                <option value="basketball">Basketball</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Moment Type</label>
              <select
                value={simEventType}
                onChange={(e) => setSimEventType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="goal">Goal (Football)</option>
                <option value="red_card">Red Card (Football)</option>
                <option value="wicket">Wicket (Cricket)</option>
                <option value="sixer">Sixer (Cricket)</option>
                <option value="dunk">Dunk / 3-Ptr (Basketball)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Current Score</label>
              <input
                type="text"
                value={simScore}
                onChange={(e) => setSimScore(e.target.value)}
                placeholder="2 - 1"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
              >
              </input>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Home Team</label>
              <input
                type="text"
                value={simHomeTeam}
                onChange={(e) => setSimHomeTeam(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Away Team</label>
              <input
                type="text"
                value={simAwayTeam}
                onChange={(e) => setSimAwayTeam(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <FiPlay size={14} />
            <span>{simulating ? 'Broadcasting to Stream...' : 'Broadcast Live Event to Stream'}</span>
          </button>
        </div>
      </div>

      {/* Consumer Groups Table */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <FiServer className="text-emerald-400" />
          <span>Active Stream Consumer Groups</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-bold">Consumer Group</th>
                <th className="pb-3 font-bold">Stream Key</th>
                <th className="pb-3 font-bold">Worker Nodes</th>
                <th className="pb-3 font-bold">Pending Messages</th>
                <th className="pb-3 font-bold">Consumer Lag</th>
                <th className="pb-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats?.consumerGroups.map((cg) => (
                <tr key={cg.name} className="hover:bg-white/[0.02]">
                  <td className="py-3 font-mono font-bold text-slate-200">{cg.name}</td>
                  <td className="py-3 font-mono text-slate-400">{cg.stream}</td>
                  <td className="py-3 text-slate-300 font-bold">{cg.consumers} active</td>
                  <td className="py-3 font-mono text-slate-300">{cg.pending}</td>
                  <td className="py-3 font-mono text-slate-300">{cg.lag} ms</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        cg.status === 'healthy'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {cg.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dead-Letter Queue (DLQ) Inspector */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiAlertTriangle className="text-amber-400" />
              <span>Dead-Letter Queue (DLQ) Management</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Failed events quarantined for inspection with 1-click retry into active consumer pipelines.
            </p>
          </div>

          <button
            onClick={handlePurgeDLQ}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-bold transition flex items-center gap-1.5"
          >
            <FiTrash2 size={12} />
            <span>Purge Resolved</span>
          </button>
        </div>

        {dlqEvents.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-medium">
            <FiCheckCircle className="text-emerald-400 mx-auto mb-2 text-2xl" />
            No quarantined events in Dead-Letter Queue. All sports streams operating normally.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 font-bold">Event ID / Type</th>
                  <th className="pb-3 font-bold">Error Reason</th>
                  <th className="pb-3 font-bold">Attempts</th>
                  <th className="pb-3 font-bold">Failed At</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {dlqEvents.map((evt) => (
                  <tr key={evt._id} className="hover:bg-white/[0.02]">
                    <td className="py-3">
                      <div className="font-mono font-bold text-slate-200">{evt.eventId}</div>
                      <div className="text-[10px] text-blue-400 uppercase font-bold">{evt.eventType}</div>
                    </td>
                    <td className="py-3 text-slate-300 max-w-xs truncate" title={evt.errorMessage}>
                      {evt.errorMessage}
                    </td>
                    <td className="py-3 font-mono text-slate-300">{evt.attempts}</td>
                    <td className="py-3 text-slate-400 text-[11px]">
                      {new Date(evt.failedAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          evt.status === 'replayed' || evt.status === 'resolved'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {evt.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {evt.status === 'pending' && (
                        <button
                          onClick={() => handleReplay(evt._id!)}
                          disabled={replayingId === evt._id}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition flex items-center gap-1 ml-auto"
                        >
                          <FiRefreshCw className={replayingId === evt._id ? 'animate-spin' : ''} size={10} />
                          <span>Replay</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
