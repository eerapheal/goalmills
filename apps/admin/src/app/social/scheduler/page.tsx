'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiPlay,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiCalendar,
  FiZap,
} from 'react-icons/fi';

const LEAGUES = [
  { id: 152, name: 'Premier League', country: 'England', color: '#3d195b', badgeBg: 'bg-purple-950/60' },
  { id: 302, name: 'La Liga', country: 'Spain', color: '#ee8707', badgeBg: 'bg-amber-950/60' },
  { id: 207, name: 'Serie A', country: 'Italy', color: '#024494', badgeBg: 'bg-blue-950/60' },
  { id: 175, name: 'Bundesliga', country: 'Germany', color: '#d20515', badgeBg: 'bg-red-950/60' },
  { id: 168, name: 'Ligue 1', country: 'France', color: '#091c3e', badgeBg: 'bg-sky-950/60' },
];

const SCHEDULES = [
  {
    id: 'weekly_fixtures_mon',
    name: 'Weekly Upcoming Fixtures (Monday 09:00 UTC)',
    schedule: '0 9 * * 1',
    description: 'Generates matchweek fixture graphics and AI previews for all Top 5 leagues.',
    workflow: 'weekly-fixtures',
    cadence: 'Every Monday',
  },
  {
    id: 'weekend_fixtures_thu',
    name: 'Weekend Matchday Preview (Thursday 12:00 UTC)',
    schedule: '0 12 * * 4',
    description: 'Generates weekend matchday previews 2 days before Saturday league clashes.',
    workflow: 'weekly-fixtures',
    cadence: 'Every Thursday',
  },
  {
    id: 'daily_pre_match',
    name: 'Pre-Match 48h Analysis (Daily 10:00 UTC)',
    schedule: '0 10 * * *',
    description: 'Scans for matches occurring in 48 hours, compiles H2H stats and AI prediction cards.',
    workflow: 'pre-match',
    cadence: 'Daily at 10:00 UTC',
  },
  {
    id: 'live_match_poller',
    name: 'Live Match State Tracker (Every 60 Seconds)',
    schedule: '* * * * *',
    description: 'Real-time poller tracking live scores; immediately triggers HT & FT scorecards.',
    workflow: 'live-poll',
    cadence: 'Every Minute (Match Days)',
  },
  {
    id: 'post_match_analyzer',
    name: 'Post-Match Tactical Report (Every 10 Minutes)',
    schedule: '*/10 * * * *',
    description: 'Finds matches finished 25-60m ago, publishes in-depth report card with MOTM.',
    workflow: 'post-match',
    cadence: 'Every 10 Minutes',
  },
];

export default function SocialSchedulerPage() {
  const [triggeringWorkflow, setTriggeringWorkflow] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  async function handleTrigger(workflow: string, leagueId?: number) {
    const key = leagueId ? `${workflow}-${leagueId}` : workflow;
    setTriggeringWorkflow(key);
    setFeedback(null);

    try {
      const res = await fetch('/api/social/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow, leagueId }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: `Successfully executed '${workflow}'${leagueId ? ` for league ID ${leagueId}` : ''}!`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: data.error || `Execution failed for '${workflow}'`,
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Execution error' });
    } finally {
      setTriggeringWorkflow(null);
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-slate-100 min-h-screen">
      {/* Navigation Header */}
      <div className="pb-6 border-b border-slate-800">
        <Link
          href="/social"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 mb-2 transition"
        >
          <FiArrowLeft /> Back to Social Dashboard
        </Link>
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
          Automation Schedules &amp; Manual Controls
        </h1>
        <p className="text-sm text-slate-400">
          Configure node-cron schedules, review cadences, or fire workflows manually per league
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
              : 'bg-rose-950/40 border-rose-700/60 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <FiCheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <FiAlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Cron Schedules Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <FiClock className="text-emerald-400" /> Active Cron Automations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCHEDULES.map((sched) => (
            <div
              key={sched.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {sched.cadence}
                  </span>
                  <code className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">
                    {sched.schedule}
                  </code>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">{sched.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{sched.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end">
                <button
                  onClick={() => handleTrigger(sched.workflow)}
                  disabled={triggeringWorkflow === sched.workflow}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition disabled:opacity-50"
                >
                  <FiPlay className={triggeringWorkflow === sched.workflow ? 'animate-spin' : ''} />
                  Run Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Target Leagues Manual Trigger Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <FiZap className="text-emerald-400" /> League-Specific Trigger Controls (Top 5)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {LEAGUES.map((league) => (
            <div
              key={league.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
            >
              <div>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm mb-3 text-white" style={{ backgroundColor: league.color }}>
                  ⚽
                </div>
                <h3 className="text-sm font-bold text-white">{league.name}</h3>
                <p className="text-xs text-slate-400">{league.country}</p>
                <p className="text-[10px] font-mono text-slate-500 mt-1">API ID: {league.id}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => handleTrigger('weekly-fixtures', league.id)}
                  disabled={triggeringWorkflow === `weekly-fixtures-${league.id}`}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-between transition disabled:opacity-50"
                >
                  <span>Fixtures Graphic</span>
                  <FiPlay className="w-3 h-3 text-emerald-400" />
                </button>

                <button
                  onClick={() => handleTrigger('pre-match', league.id)}
                  disabled={triggeringWorkflow === `pre-match-${league.id}`}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-between transition disabled:opacity-50"
                >
                  <span>Pre-Match 48h</span>
                  <FiPlay className="w-3 h-3 text-emerald-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
