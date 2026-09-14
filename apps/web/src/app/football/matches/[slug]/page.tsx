'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { advancedFootballApi } from '@/services/advancedFootballApi';
import { parseMatchSlug, footballRoutes, slugify } from '@/lib/slugUtils';
import { BackButton } from '@/components/BackButton';
import { GoalmillsLoader } from '@/components/GoalmillsLoader';
import type {
  FootballEvent,
  FootballH2HResponse,
  FootballStanding,
  FootballOdds,
  FootballComment,
  FootballLineupPlayer,
} from '@goalmills/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'summary' | 'stats' | 'lineups' | 'h2h' | 'table' | 'odds' | 'commentary';

interface NormalizedTimelineEvent {
  minute: string;
  type: 'goal' | 'og' | 'penalty' | 'yellow' | 'red' | 'sub' | 'var';
  player: string;
  playerSlug?: string;
  detail?: string;
  assist?: string;
  team: 'home' | 'away';
  score?: string;
}

// ─── DRY & SOLID Reusable UI Helpers ──────────────────────────────────────────

export function FormBadge({ result }: { result: 'W' | 'D' | 'L' | string }) {
  const r = (result || 'D').toUpperCase();
  const colorMap: Record<string, string> = {
    W: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    D: 'bg-slate-600/30 text-slate-300 border-slate-500/30',
    L: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  };
  return (
    <span
      className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black border uppercase tracking-wider ${
        colorMap[r] || colorMap.D
      }`}
    >
      {r}
    </span>
  );
}

export function EventIcon({ type }: { type: string }) {
  const icons: Record<string, { icon: string; color: string }> = {
    goal: { icon: '⚽', color: 'text-white' },
    og: { icon: '⚽', color: 'text-rose-400' },
    penalty: { icon: '⚽', color: 'text-amber-400' },
    yellow: { icon: '🟨', color: 'text-amber-400' },
    red: { icon: '🟥', color: 'text-rose-500' },
    sub: { icon: '🔄', color: 'text-emerald-400' },
    var: { icon: '📺', color: 'text-blue-400' },
  };
  const e = icons[type] || { icon: '•', color: 'text-slate-400' };
  return <span className={`text-sm ${e.color}`}>{e.icon}</span>;
}

export function StatBar({
  label,
  home,
  away,
  homeVal,
  awayVal,
  highlight,
}: {
  label: string;
  home: number | string;
  away: number | string;
  homeVal: number;
  awayVal: number;
  highlight?: boolean;
}) {
  const total = homeVal + awayVal || 1;
  const homePct = Math.min(100, Math.max(0, Math.round((homeVal / total) * 100)));
  const awayPct = 100 - homePct;

  return (
    <div className={`py-3 ${highlight ? 'bg-white/[0.03] rounded-xl px-3 -mx-3' : ''}`}>
      <div className="flex items-center justify-between mb-1.5 text-xs">
        <span className="font-mono font-black text-white text-sm">{home}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="font-mono font-black text-white text-sm">{away}</span>
      </div>
      <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-white/5">
        <div
          className="h-full bg-blue-500 rounded-l-full transition-all duration-500"
          style={{ width: `${homePct}%` }}
        />
        <div
          className="h-full bg-rose-500 rounded-r-full transition-all duration-500"
          style={{ width: `${awayPct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Tactical Pitch Visual Component ──────────────────────────────────────────

function PitchVisual({
  players,
  view,
}: {
  players: FootballLineupPlayer[];
  view: 'home' | 'away';
}) {
  // Organize players into tactical rows (GK, DEF, MID, FWD)
  const rows = useMemo(() => {
    if (!players || players.length === 0) return [];

    const gks: FootballLineupPlayer[] = [];
    const defs: FootballLineupPlayer[] = [];
    const mids: FootballLineupPlayer[] = [];
    const fwds: FootballLineupPlayer[] = [];

    players.forEach((p, idx) => {
      const pos = (p.player_position || '').toString().toLowerCase();
      if (idx === 0 || pos.includes('gk') || pos.includes('goal') || pos === '1') {
        gks.push(p);
      } else if (pos.includes('def') || pos.includes('cb') || pos.includes('lb') || pos.includes('rb')) {
        defs.push(p);
      } else if (pos.includes('mid') || pos.includes('cm') || pos.includes('dm') || pos.includes('am')) {
        mids.push(p);
      } else if (pos.includes('att') || pos.includes('fwd') || pos.includes('st') || pos.includes('rw') || pos.includes('lw')) {
        fwds.push(p);
      } else {
        // Fallback distribution by lineup order
        if (idx < 5) defs.push(p);
        else if (idx < 9) mids.push(p);
        else fwds.push(p);
      }
    });

    return [
      { key: 'gk', list: gks, top: '8%' },
      { key: 'def', list: defs, top: '32%' },
      { key: 'mid', list: mids, top: '60%' },
      { key: 'fwd', list: fwds, top: '84%' },
    ];
  }, [players]);

  return (
    <div className="relative bg-gradient-to-b from-[#132f18] via-[#102b15] to-[#0c2210] rounded-2xl border border-emerald-900/60 overflow-hidden aspect-[3/4] sm:aspect-[2/2.5] shadow-2xl p-4">
      {/* Pitch grass pattern stripes */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[repeating-linear-gradient(to_bottom,transparent,transparent_40px,rgba(255,255,255,0.05)_40px,rgba(255,255,255,0.05)_80px)]" />

      {/* Outer boundary lines */}
      <div className="absolute inset-3 border border-white/20 rounded-xl pointer-events-none" />

      {/* Halfway line */}
      <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 h-px bg-white/20 pointer-events-none" />

      {/* Center circle */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-white/20 pointer-events-none flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
      </div>

      {/* Penalty boxes */}
      <div className="absolute inset-x-16 top-3 h-20 border-b border-x border-white/20 pointer-events-none" />
      <div className="absolute inset-x-16 bottom-3 h-20 border-t border-x border-white/20 pointer-events-none" />

      {/* Player nodes */}
      {rows.map((row) => (
        <div
          key={row.key}
          className="absolute inset-x-6 flex justify-around items-center"
          style={{ top: row.top }}
        >
          {row.list.map((p, pIdx) => {
            const displayName = p.player ? p.player.split(' ').pop() || p.player : `#${p.player_number || pIdx + 1}`;
            return (
              <Link
                key={p.player_key || pIdx}
                href={footballRoutes.playerFromName(p.player || '')}
                className="flex flex-col items-center gap-1 group transition-transform hover:scale-110 z-10"
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-black border-2 shadow-lg transition-all ${
                    view === 'home'
                      ? 'bg-blue-600 border-blue-400 text-white group-hover:bg-blue-500 group-hover:shadow-blue-500/50'
                      : 'bg-rose-600 border-rose-400 text-white group-hover:bg-rose-500 group-hover:shadow-rose-500/50'
                  }`}
                >
                  {p.player_number || pIdx + 1}
                </div>
                <span className="text-[10px] font-bold text-white max-w-[70px] truncate text-center drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded">
                  {displayName}
                </span>
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Summary Tab ──────────────────────────────────────────────────────────────

function SummaryTab({
  match,
  timelineEvents,
  comments,
}: {
  match: FootballEvent;
  timelineEvents: NormalizedTimelineEvent[];
  comments: FootballComment[];
}) {
  const homeScorers = useMemo(() => {
    return (match.goalscorers || []).filter((g) => g.home_scorer);
  }, [match.goalscorers]);

  const awayScorers = useMemo(() => {
    return (match.goalscorers || []).filter((g) => g.away_scorer);
  }, [match.goalscorers]);

  // Key stats preview values
  const statsMap = useMemo(() => {
    const map: Record<string, { home: string; away: string }> = {};
    (match.statistics || []).forEach((s) => {
      map[s.type.toLowerCase()] = { home: s.home, away: s.away };
    });
    return map;
  }, [match.statistics]);

  const possession = statsMap['ball possession'] || statsMap['possession'] || { home: '50%', away: '50%' };
  const onTarget = statsMap['on target'] || statsMap['shots on target'] || { home: '0', away: '0' };
  const attacks = statsMap['dangerous attacks'] || statsMap['attacks'] || { home: '0', away: '0' };

  return (
    <div className="space-y-6">
      {/* Key Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#0f172a]/80 backdrop-blur-sm border border-[#1e293b] rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <span className="text-xl font-black text-blue-400 font-mono">{possession.home}</span>
            <span className="text-xs text-slate-500">vs</span>
            <span className="text-xl font-black text-rose-400 font-mono">{possession.away}</span>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Possession</p>
        </div>

        <div className="bg-[#0f172a]/80 backdrop-blur-sm border border-[#1e293b] rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <span className="text-xl font-black text-blue-400 font-mono">{onTarget.home}</span>
            <span className="text-xs text-slate-500">vs</span>
            <span className="text-xl font-black text-rose-400 font-mono">{onTarget.away}</span>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Shots on Target</p>
        </div>

        <div className="bg-[#0f172a]/80 backdrop-blur-sm border border-[#1e293b] rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <span className="text-xl font-black text-blue-400 font-mono">{attacks.home}</span>
            <span className="text-xs text-slate-500">vs</span>
            <span className="text-xl font-black text-rose-400 font-mono">{attacks.away}</span>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Dangerous Attacks</p>
        </div>
      </div>

      {/* Scorers breakdown cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-[#0f172a]/80 border border-[#1e293b] rounded-2xl p-4">
          <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            {match.event_home_team} Scorers
          </p>
          {homeScorers.length > 0 ? (
            <div className="space-y-2">
              {homeScorers.map((g, i) => (
                <div key={i} className="flex items-center justify-between text-xs text-slate-200">
                  <span className="font-semibold flex items-center gap-2">
                    <span>⚽</span>
                    <Link
                      href={footballRoutes.playerFromName(g.home_scorer)}
                      className="hover:text-blue-400 transition-colors"
                    >
                      {g.home_scorer}
                    </Link>
                    {g.home_assist && <span className="text-slate-400 text-[10px]">({g.home_assist})</span>}
                  </span>
                  <span className="font-mono text-amber-400 font-bold">{g.time}&apos;</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No goals scored yet</p>
          )}
        </div>

        <div className="bg-[#0f172a]/80 border border-[#1e293b] rounded-2xl p-4">
          <p className="text-[11px] font-black text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            {match.event_away_team} Scorers
          </p>
          {awayScorers.length > 0 ? (
            <div className="space-y-2">
              {awayScorers.map((g, i) => (
                <div key={i} className="flex items-center justify-between text-xs text-slate-200">
                  <span className="font-semibold flex items-center gap-2">
                    <span>⚽</span>
                    <Link
                      href={footballRoutes.playerFromName(g.away_scorer)}
                      className="hover:text-rose-400 transition-colors"
                    >
                      {g.away_scorer}
                    </Link>
                    {g.away_assist && <span className="text-slate-400 text-[10px]">({g.away_assist})</span>}
                  </span>
                  <span className="font-mono text-amber-400 font-bold">{g.time}&apos;</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No goals scored yet</p>
          )}
        </div>
      </div>

      {/* Match Timeline */}
      <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 border-b border-[#1e293b] flex items-center justify-between">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
            <span>⏱️</span> Match Timeline
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold">{timelineEvents.length} events</span>
        </div>

        {timelineEvents.length > 0 ? (
          <div className="divide-y divide-[#1e293b]">
            {timelineEvents.map((ev, i) => {
              const isHome = ev.team === 'home';
              return (
                <div
                  key={i}
                  className={`flex items-center gap-4 px-5 py-3 hover:bg-[#1e293b]/50 transition-colors ${
                    isHome ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <div className={`flex items-center gap-2.5 flex-1 ${isHome ? '' : 'flex-row-reverse'}`}>
                    <EventIcon type={ev.type} />
                    <div className={isHome ? '' : 'text-right'}>
                      <Link
                        href={footballRoutes.playerFromName(ev.player)}
                        className="text-sm font-bold text-slate-100 hover:text-blue-400 transition-colors"
                      >
                        {ev.player}
                      </Link>
                      {ev.detail && <p className="text-[11px] text-slate-400">{ev.detail}</p>}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <span className="text-xs font-black text-amber-400 font-mono bg-[#1e293b] px-2 py-0.5 rounded-md border border-white/5">
                      {ev.minute}&apos;
                    </span>
                  </div>

                  <div className="flex-1">
                    {ev.score && (
                      <span
                        className={`text-xs font-mono font-black px-2 py-0.5 rounded ${
                          isHome ? 'text-right block text-blue-400' : 'text-left block text-rose-400'
                        }`}
                      >
                        {ev.score}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs">No key match events recorded yet</div>
        )}
      </div>

      {/* Latest Commentary Preview */}
      {comments && comments.length > 0 && (
        <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#1e293b] flex items-center justify-between">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <span>🎙️</span> Live Text Updates
            </h3>
            <span className="text-[10px] text-emerald-400 font-bold animate-pulse">Live Feed</span>
          </div>
          <div className="p-4 space-y-2.5 max-h-60 overflow-y-auto divide-y divide-[#1e293b]/50">
            {comments.slice(-6).reverse().map((c, i) => (
              <div key={i} className="pt-2 flex items-start gap-3 text-xs">
                <span className="font-mono text-amber-400 font-bold min-w-[45px]">{c.comments_time}</span>
                <span className="text-slate-300">{c.comments_text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stats Tab ────────────────────────────────────────────────────────────────

function StatsTab({
  stats,
  homeTeam,
  awayTeam,
}: {
  stats: any[];
  homeTeam: string;
  awayTeam: string;
}) {
  if (!stats || stats.length === 0) {
    return (
      <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] p-12 text-center text-slate-400 text-sm">
        Statistical data is currently being gathered for this match.
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-[#1e293b] flex items-center justify-between">
        <span className="text-xs font-black text-blue-400 uppercase tracking-widest">{homeTeam}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Match Statistics</span>
        <span className="text-xs font-black text-rose-400 uppercase tracking-widest">{awayTeam}</span>
      </div>

      <div className="px-5 py-4 divide-y divide-[#1e293b]/60">
        {stats.map((s, idx) => {
          const homeNum = parseFloat(String(s.home).replace('%', '')) || 0;
          const awayNum = parseFloat(String(s.away).replace('%', '')) || 0;
          const isHighlight = ['ball possession', 'on target', 'shots on target', 'dangerous attacks'].includes(
            s.type.toLowerCase()
          );

          return (
            <StatBar
              key={idx}
              label={s.type}
              home={s.home}
              away={s.away}
              homeVal={homeNum}
              awayVal={awayNum}
              highlight={isHighlight}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Lineups Tab ──────────────────────────────────────────────────────────────

function LineupsTab({
  lineups,
  homeTeam,
  awayTeam,
  homeFormation,
  awayFormation,
}: {
  lineups?: any;
  homeTeam: string;
  awayTeam: string;
  homeFormation?: string;
  awayFormation?: string;
}) {
  const [view, setView] = useState<'home' | 'away'>('home');

  const startingPlayers = useMemo(() => {
    if (!lineups) return [];
    const teamObj = view === 'home' ? lineups.home_team : lineups.away_team;
    return teamObj?.starting_lineups || [];
  }, [lineups, view]);

  const substitutes = useMemo(() => {
    if (!lineups) return [];
    const teamObj = view === 'home' ? lineups.home_team : lineups.away_team;
    return teamObj?.substitutes || [];
  }, [lineups, view]);

  const coaches = useMemo(() => {
    if (!lineups) return [];
    const teamObj = view === 'home' ? lineups.home_team : lineups.away_team;
    return teamObj?.coaches || [];
  }, [lineups, view]);

  const currentFormation = view === 'home' ? homeFormation : awayFormation;

  if (!lineups || (!lineups.home_team && !lineups.away_team)) {
    return (
      <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] p-12 text-center text-slate-400 text-sm">
        Lineups are announced approximately 60 minutes prior to kickoff.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team View Toggle */}
      <div className="flex bg-[#0f172a] border border-[#1e293b] rounded-xl p-1 gap-1">
        <button
          onClick={() => setView('home')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
            view === 'home'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🔵 {homeTeam}
        </button>
        <button
          onClick={() => setView('away')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
            view === 'away'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🔴 {awayTeam}
        </button>
      </div>

      {/* Formation tag */}
      {currentFormation && (
        <div className="text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Formation: </span>
          <span className="text-xs font-black text-white font-mono uppercase bg-white/5 px-2 py-0.5 rounded border border-white/10">
            {currentFormation}
          </span>
        </div>
      )}

      {/* Visual Pitch */}
      <PitchVisual players={startingPlayers} view={view} />

      {/* Starting XI List */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 border-b border-[#1e293b] flex items-center justify-between">
          <h3 className="text-xs font-black text-white uppercase tracking-widest">
            {view === 'home' ? homeTeam : awayTeam} Starting XI
          </h3>
          <span className="text-[10px] text-slate-400 font-bold">{startingPlayers.length} Players</span>
        </div>

        <div className="divide-y divide-[#1e293b]">
          {startingPlayers.map((p: any, i: number) => (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-2.5 hover:bg-white/[0.03] transition-colors text-xs"
            >
              <span className="w-6 text-center font-mono font-black text-slate-400">
                {p.player_number || i + 1}
              </span>
              <Link
                href={footballRoutes.playerFromName(p.player || '')}
                className="flex-1 font-bold text-slate-200 hover:text-blue-400 transition-colors"
              >
                {p.player || 'Player'}
              </Link>
              {p.player_position && (
                <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  {p.player_position}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Substitutes List */}
      {substitutes.length > 0 && (
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[#1e293b]">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">Substitutes</h3>
          </div>
          <div className="divide-y divide-[#1e293b]">
            {substitutes.map((p: any, i: number) => (
              <div
                key={i}
                className="flex items-center gap-3 px-5 py-2 hover:bg-white/[0.03] transition-colors text-xs text-slate-400"
              >
                <span className="w-6 text-center font-mono">{p.player_number || '-'}</span>
                <Link
                  href={footballRoutes.playerFromName(p.player || '')}
                  className="flex-1 font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  {p.player}
                </Link>
                {p.player_position && <span className="text-[10px]">{p.player_position}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coach info */}
      {coaches.length > 0 && (
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 flex items-center justify-between text-xs">
          <span className="text-slate-400 uppercase font-bold text-[10px]">Head Coach</span>
          <span className="text-white font-bold">{coaches[0].coache}</span>
        </div>
      )}
    </div>
  );
}

// ─── H2H Tab ──────────────────────────────────────────────────────────────────

function H2HTab({
  h2hData,
  homeTeam,
  awayTeam,
}: {
  h2hData: FootballH2HResponse | null;
  homeTeam: string;
  awayTeam: string;
}) {
  const meetings = useMemo(() => {
    return h2hData?.result?.H2H || [];
  }, [h2hData]);

  const stats = useMemo(() => {
    let homeWins = 0;
    let awayWins = 0;
    let draws = 0;

    meetings.forEach((m) => {
      const parts = (m.event_final_result || '').split('-').map((s) => parseInt(s.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        const isHomeMatch = slugify(m.event_home_team) === slugify(homeTeam);
        const homeScore = isHomeMatch ? parts[0] : parts[1];
        const awayScore = isHomeMatch ? parts[1] : parts[0];
        if (homeScore > awayScore) homeWins++;
        else if (awayScore > homeScore) awayWins++;
        else draws++;
      }
    });

    const total = homeWins + draws + awayWins || 1;
    return { homeWins, awayWins, draws, total };
  }, [meetings, homeTeam]);

  return (
    <div className="space-y-6">
      {/* Head to Head Summary Bar */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-xl text-center">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
          Head to Head — Match History
        </h3>

        <div className="flex items-center gap-4 justify-around">
          <div>
            <p className="text-3xl sm:text-4xl font-black text-blue-400 font-mono">{stats.homeWins}</p>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold mt-1">{homeTeam} Wins</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-slate-300 font-mono">{stats.draws}</p>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold mt-1">Draws</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-rose-400 font-mono">{stats.awayWins}</p>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold mt-1">{awayTeam} Wins</p>
          </div>
        </div>

        {/* Proportional Bar */}
        <div className="flex gap-1 h-2 rounded-full overflow-hidden mt-6 bg-white/5">
          <div
            className="bg-blue-500 rounded-l-full transition-all"
            style={{ width: `${(stats.homeWins / stats.total) * 100}%` }}
          />
          <div
            className="bg-slate-500 transition-all"
            style={{ width: `${(stats.draws / stats.total) * 100}%` }}
          />
          <div
            className="bg-rose-500 rounded-r-full transition-all"
            style={{ width: `${(stats.awayWins / stats.total) * 100}%` }}
          />
        </div>
      </div>

      {/* Previous Encounters */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 border-b border-[#1e293b] flex items-center justify-between">
          <h3 className="text-xs font-black text-white uppercase tracking-widest">Previous Encounters</h3>
          <span className="text-[10px] text-slate-400 font-semibold">{meetings.length} Matches</span>
        </div>

        {meetings.length > 0 ? (
          <div className="divide-y divide-[#1e293b]">
            {meetings.slice(0, 10).map((m, i) => (
              <div key={i} className="flex items-center px-5 py-3.5 gap-3 hover:bg-white/[0.03] transition-colors text-xs">
                <span className="text-slate-500 font-mono text-[11px] w-20 flex-shrink-0">{m.event_date}</span>
                <div className="flex-1 flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-200 text-right flex-1 truncate">{m.event_home_team}</span>
                  <span className="font-mono font-black text-white px-2 py-0.5 rounded bg-white/5 border border-white/5 min-w-[48px] text-center">
                    {m.event_final_result || m.event_ft_result || 'vs'}
                  </span>
                  <span className="font-bold text-slate-200 text-left flex-1 truncate">{m.event_away_team}</span>
                </div>
                <span className="text-[10px] text-slate-400 max-w-[100px] truncate hidden sm:block">
                  {m.league_name}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs">No prior meetings found on record</div>
        )}
      </div>
    </div>
  );
}

// ─── Table Tab (Standings) ────────────────────────────────────────────────────

function TableTab({
  standings,
  homeTeam,
  awayTeam,
  leagueName,
}: {
  standings: FootballStanding[];
  homeTeam: string;
  awayTeam: string;
  leagueName: string;
}) {
  const homeSlug = slugify(homeTeam);
  const awaySlug = slugify(awayTeam);

  if (!standings || standings.length === 0) {
    return (
      <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] p-12 text-center text-slate-400 text-sm">
        League table standings are not available for this tournament round.
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-[#1e293b] flex items-center justify-between">
        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
          <span>🏆</span> {leagueName} Standings
        </h3>
        <span className="text-[10px] text-slate-400 font-semibold">{standings.length} Teams</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-[#1e293b] text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/[0.01]">
              <th className="px-4 py-3 text-center">#</th>
              <th className="px-3 py-3">Club</th>
              <th className="px-2 py-3 text-center">P</th>
              <th className="px-2 py-3 text-center">W</th>
              <th className="px-2 py-3 text-center">D</th>
              <th className="px-2 py-3 text-center">L</th>
              <th className="px-2 py-3 text-center hidden sm:table-cell">GD</th>
              <th className="px-3 py-3 text-center">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]">
            {standings.map((row) => {
              const teamSlug = slugify(row.standing_team);
              const isMatchTeam = teamSlug.includes(homeSlug) || homeSlug.includes(teamSlug) ||
                teamSlug.includes(awaySlug) || awaySlug.includes(teamSlug);

              const gd = parseInt(row.standing_GD || '0');

              return (
                <tr
                  key={row.team_key || row.standing_place}
                  className={`hover:bg-white/[0.04] transition-colors ${
                    isMatchTeam ? 'bg-blue-500/10 border-l-2 border-l-blue-500 font-bold' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-center font-mono text-slate-400">{row.standing_place}</td>
                  <td className="px-3 py-3 font-semibold text-white">
                    <Link
                      href={footballRoutes.teamFromName(row.standing_team)}
                      className="hover:text-blue-400 transition-colors flex items-center gap-2"
                    >
                      {row.standing_team}
                      {isMatchTeam && (
                        <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">
                          Playing
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="px-2 py-3 text-center font-mono text-slate-300">{row.standing_P}</td>
                  <td className="px-2 py-3 text-center font-mono text-slate-300">{row.standing_W}</td>
                  <td className="px-2 py-3 text-center font-mono text-slate-300">{row.standing_D}</td>
                  <td className="px-2 py-3 text-center font-mono text-slate-300">{row.standing_L}</td>
                  <td className="px-2 py-3 text-center font-mono hidden sm:table-cell">
                    <span className={gd > 0 ? 'text-emerald-400' : gd < 0 ? 'text-rose-400' : 'text-slate-400'}>
                      {gd > 0 ? `+${gd}` : gd}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center font-mono font-black text-white">{row.standing_PTS}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Odds Tab ─────────────────────────────────────────────────────────────────

function OddsTab({
  odds,
  homeTeam,
  awayTeam,
}: {
  odds: FootballOdds[];
  homeTeam: string;
  awayTeam: string;
}) {
  if (!odds || odds.length === 0) {
    return (
      <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] p-12 text-center text-slate-400 text-sm">
        Bookmaker odds are not currently available for this event.
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-[#1e293b] flex items-center justify-between">
        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
          <span>🎲</span> Market Betting Odds
        </h3>
        <span className="text-[10px] text-slate-400 font-semibold">{odds.length} Bookmakers</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-[#1e293b] text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/[0.01]">
              <th className="px-5 py-3">Bookmaker</th>
              <th className="px-3 py-3 text-center text-blue-400">1 ({homeTeam})</th>
              <th className="px-3 py-3 text-center text-slate-300">X (Draw)</th>
              <th className="px-3 py-3 text-center text-rose-400">2 ({awayTeam})</th>
              <th className="px-3 py-3 text-center hidden sm:table-cell">Over 2.5</th>
              <th className="px-3 py-3 text-center hidden sm:table-cell">Under 2.5</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]">
            {odds.map((o, idx) => (
              <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                <td className="px-5 py-3 font-bold text-white">{o.odd_bookmakers}</td>
                <td className="px-3 py-3 text-center font-mono font-black text-blue-400">{o.odd_1 || '-'}</td>
                <td className="px-3 py-3 text-center font-mono font-black text-slate-300">{o.odd_x || '-'}</td>
                <td className="px-3 py-3 text-center font-mono font-black text-rose-400">{o.odd_2 || '-'}</td>
                <td className="px-3 py-3 text-center font-mono hidden sm:table-cell text-slate-300">
                  {o['o+2.5'] || '-'}
                </td>
                <td className="px-3 py-3 text-center font-mono hidden sm:table-cell text-slate-300">
                  {o['u+2.5'] || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Commentary Tab ───────────────────────────────────────────────────────────

function CommentaryTab({ comments }: { comments: FootballComment[] }) {
  if (!comments || comments.length === 0) {
    return (
      <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] p-12 text-center text-slate-400 text-sm">
        Live text commentary is unavailable for this match.
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-[#1e293b] flex items-center justify-between">
        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
          <span>🎙️</span> Minute-by-Minute Commentary
        </h3>
        <span className="text-[10px] text-emerald-400 font-bold animate-pulse">Live</span>
      </div>

      <div className="divide-y divide-[#1e293b] max-h-[600px] overflow-y-auto">
        {comments.slice().reverse().map((c, idx) => (
          <div key={idx} className="p-4 flex items-start gap-4 hover:bg-white/[0.02] transition-colors">
            <span className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
              {c.comments_time}
            </span>
            <p className="text-xs text-slate-200 leading-relaxed flex-1">{c.comments_text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Match Page Component ────────────────────────────────────────────────

export default function FootballMatchPage() {
  const params = useParams();
  const slug = (params.slug as string) || '';
  const parsedSlug = useMemo(() => parseMatchSlug(slug), [slug]);

  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState<FootballEvent | null>(null);
  const [h2h, setH2h] = useState<FootballH2HResponse | null>(null);
  const [standings, setStandings] = useState<FootballStanding[]>([]);
  const [odds, setOdds] = useState<FootballOdds[]>([]);
  const [comments, setComments] = useState<FootballComment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('summary');

  // Load Primary Match Data
  const loadMatchData = useCallback(async () => {
    try {
      setLoading(true);
      let foundMatch: FootballEvent | null = null;

      // 1. Attempt lookup by eventKey if available
      if (parsedSlug.eventKey) {
        // First check fixtures
        const fixtureRes = await advancedFootballApi.getFixtures({ matchId: parsedSlug.eventKey });
        if (fixtureRes?.result && Array.isArray(fixtureRes.result) && fixtureRes.result.length > 0) {
          foundMatch = fixtureRes.result[0];
        } else {
          // Check livescores if not found in fixtures
          const liveRes = await advancedFootballApi.getLivescore({ matchId: parsedSlug.eventKey });
          if (liveRes?.result && Array.isArray(liveRes.result) && liveRes.result.length > 0) {
            foundMatch = liveRes.result[0];
          }
        }
      }

      // 2. If keyless slug (e.g. teama-vs-teamb-2026), search active matches by team slugs
      if (!foundMatch && parsedSlug.homeSlug && parsedSlug.awaySlug) {
        const liveScores = await advancedFootballApi.getLivescore();
        if (liveScores?.result && Array.isArray(liveScores.result)) {
          foundMatch = liveScores.result.find((m) => {
            const h = slugify(m.event_home_team);
            const a = slugify(m.event_away_team);
            return (
              (h.includes(parsedSlug.homeSlug) || parsedSlug.homeSlug.includes(h)) &&
              (a.includes(parsedSlug.awaySlug) || parsedSlug.awaySlug.includes(a))
            );
          }) || null;
        }

        if (!foundMatch) {
          const fixtures = await advancedFootballApi.getFixtures();
          if (fixtures?.result && Array.isArray(fixtures.result)) {
            foundMatch = fixtures.result.find((m) => {
              const h = slugify(m.event_home_team);
              const a = slugify(m.event_away_team);
              return (
                (h.includes(parsedSlug.homeSlug) || parsedSlug.homeSlug.includes(h)) &&
                (a.includes(parsedSlug.awaySlug) || parsedSlug.awaySlug.includes(a))
              );
            }) || null;
          }
        }
      }

      if (foundMatch) {
        setMatch(foundMatch);
        setError(null);

        const key = foundMatch.event_key || parsedSlug.eventKey;

        // Fetch Secondary Match Insights in Parallel
        const promises: Promise<any>[] = [];

        // H2H
        if (foundMatch.home_team_key && foundMatch.away_team_key) {
          promises.push(
            advancedFootballApi
              .getH2H(foundMatch.home_team_key, foundMatch.away_team_key)
              .then(setH2h)
              .catch(() => {})
          );
        }

        // Standings
        if (foundMatch.league_key) {
          promises.push(
            advancedFootballApi
              .getStandings(foundMatch.league_key)
              .then((res) => {
                const list = res?.result?.total || (Array.isArray(res?.result) ? res.result : []);
                setStandings(list);
              })
              .catch(() => {})
          );
        }

        // Odds
        if (key) {
          promises.push(
            advancedFootballApi
              .getOdds({ matchId: key })
              .then((res) => {
                const oddsList = (res?.result && (res.result as any)[String(key)]) || [];
                setOdds(Array.isArray(oddsList) ? oddsList : []);
              })
              .catch(() => {})
          );
        }

        // Comments
        if (key) {
          promises.push(
            advancedFootballApi
              .getComments(key)
              .then((res) => {
                const commentList = (res?.result && (res.result as any)[String(key)]) || [];
                setComments(Array.isArray(commentList) ? commentList : []);
              })
              .catch(() => {})
          );
        }

        await Promise.allSettled(promises);
      } else {
        setError('Match fixture could not be located.');
      }
    } catch (err) {
      console.error('Error loading match details:', err);
      setError('An error occurred while loading this match.');
    } finally {
      setLoading(false);
    }
  }, [parsedSlug]);

  useEffect(() => {
    loadMatchData();
  }, [loadMatchData]);

  // Periodic polling for live updates if match is live
  useEffect(() => {
    if (!match) return;
    const isLive =
      match.event_live === '1' ||
      ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(match.event_status || '') ||
      !isNaN(Number(match.event_status));

    if (!isLive) return;

    const interval = setInterval(async () => {
      const key = match.event_key || parsedSlug.eventKey;
      if (!key) return;
      try {
        const liveRes = await advancedFootballApi.getLivescore({ matchId: key });
        if (liveRes?.result && Array.isArray(liveRes.result) && liveRes.result.length > 0) {
          setMatch(liveRes.result[0]);
        }
        const commRes = await advancedFootballApi.getComments(key);
        const commentList = (commRes?.result && (commRes.result as any)[String(key)]) || [];
        if (Array.isArray(commentList)) setComments(commentList);
      } catch (e) {
        console.error('Error refreshing live match:', e);
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [match, parsedSlug]);

  // Aggregate and sort timeline events (Goals, Cards, Substitutions)
  const timelineEvents = useMemo<NormalizedTimelineEvent[]>(() => {
    if (!match) return [];
    const events: NormalizedTimelineEvent[] = [];

    // Goals
    (match.goalscorers || []).forEach((g) => {
      const isHome = Boolean(g.home_scorer);
      events.push({
        minute: g.time || '0',
        type: 'goal',
        player: g.home_scorer || g.away_scorer || 'Goal',
        assist: g.home_assist || g.away_assist,
        team: isHome ? 'home' : 'away',
        score: g.score,
        detail: g.home_assist
          ? `Assist: ${g.home_assist}`
          : g.away_assist
          ? `Assist: ${g.away_assist}`
          : undefined,
      });
    });

    // Cards
    (match.cards || []).forEach((c) => {
      const isHome = Boolean(c.home_fault);
      const isRed = (c.card || '').toLowerCase().includes('red');
      events.push({
        minute: c.time || '0',
        type: isRed ? 'red' : 'yellow',
        player: c.home_fault || c.away_fault || 'Card',
        team: isHome ? 'home' : 'away',
        detail: isRed ? 'Red Card' : 'Yellow Card',
      });
    });

    // Sort chronologically by minute
    return events.sort((a, b) => {
      const minA = parseInt(a.minute.replace('+', '')) || 0;
      const minB = parseInt(b.minute.replace('+', '')) || 0;
      return minA - minB;
    });
  }, [match]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a1a] pt-[90px] flex items-center justify-center">
        <GoalmillsLoader />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-[#070a1a] pt-[120px] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-4">
          ⚽
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Match Not Found</h1>
        <p className="text-slate-400 text-sm max-w-md mb-6">
          {error || 'The requested football fixture could not be retrieved from the sports network.'}
        </p>
        <div className="flex items-center gap-3">
          <BackButton />
          <Link
            href="/football"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
          >
            All Fixtures
          </Link>
        </div>
      </div>
    );
  }

  const isLive =
    match.event_live === '1' ||
    ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(match.event_status || '') ||
    !isNaN(Number(match.event_status));

  const isFinished =
    match.event_status === 'Finished' ||
    match.event_status === 'FT' ||
    match.event_status === 'AET';

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'summary', label: 'Summary' },
    { id: 'stats', label: 'Stats', count: match.statistics?.length },
    { id: 'lineups', label: 'Lineups' },
    { id: 'h2h', label: 'H2H', count: h2h?.result?.H2H?.length },
    { id: 'table', label: 'Table', count: standings.length },
    { id: 'odds', label: 'Odds', count: odds.length },
    { id: 'commentary', label: 'Commentary', count: comments.length },
  ];

  return (
    <div className="min-h-screen bg-[#070a1a] pt-[85px] pb-24 text-slate-100">
      {/* ── Match Hero & Scoreboard ── */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#0e172e] via-[#0b1326] to-[#070a1a] border-b border-[#1e293b]">
        {/* Subtle glow accents */}
        <div className="absolute top-0 left-1/4 w-96 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-4 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <BackButton />

            {/* League info badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-300">
              {match.league_logo && (
                <img src={match.league_logo} alt="" className="w-4 h-4 object-contain" />
              )}
              <span>{match.league_name}</span>
              {match.league_round && <span className="text-slate-500">• {match.league_round}</span>}
            </div>

            <div className="w-8" />
          </div>

          {/* Status & Kickoff indicator */}
          <div className="flex flex-col items-center mb-6">
            {isLive ? (
              <span className="flex items-center gap-2 bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-black tracking-widest uppercase px-3.5 py-1.5 rounded-full shadow-lg shadow-rose-500/20">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse" />
                Live · {match.event_status}&apos;
              </span>
            ) : isFinished ? (
              <span className="bg-slate-800/80 text-slate-300 text-xs font-black tracking-widest uppercase px-3.5 py-1.5 rounded-full border border-white/5">
                Full Time
              </span>
            ) : (
              <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black tracking-widest uppercase px-3.5 py-1.5 rounded-full">
                Upcoming · {match.event_date} {match.event_time}
              </span>
            )}
          </div>

          {/* Teams & Central Scoreboard */}
          <div className="grid grid-cols-3 items-center gap-4 sm:gap-8 max-w-2xl mx-auto">
            {/* Home Team */}
            <Link
              href={footballRoutes.teamFromName(match.event_home_team)}
              className="flex flex-col items-center gap-2.5 group text-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/[0.04] border border-white/10 p-2.5 flex items-center justify-center transition-all group-hover:border-blue-400 group-hover:bg-white/[0.08] shadow-xl">
                {match.home_team_logo ? (
                  <img
                    src={match.home_team_logo}
                    alt={match.event_home_team}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-2xl font-black text-blue-400">
                    {(match.event_home_team || 'H')[0]}
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm font-black text-white group-hover:text-blue-400 transition-colors leading-tight">
                {match.event_home_team}
              </span>
            </Link>

            {/* Scores */}
            <div className="flex flex-col items-center gap-1.5">
              {!isLive && !isFinished ? (
                <div className="text-2xl font-black text-slate-400 font-mono tracking-widest">VS</div>
              ) : (
                <>
                  <div className="text-4xl sm:text-6xl font-black text-white font-mono tracking-tight flex items-center gap-2">
                    <span>{match.event_final_result || match.event_ft_result || '0 - 0'}</span>
                  </div>
                  {match.event_halftime_result && (
                    <span className="text-[11px] text-slate-400 font-mono">
                      HT: {match.event_halftime_result}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Away Team */}
            <Link
              href={footballRoutes.teamFromName(match.event_away_team)}
              className="flex flex-col items-center gap-2.5 group text-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/[0.04] border border-white/10 p-2.5 flex items-center justify-center transition-all group-hover:border-rose-400 group-hover:bg-white/[0.08] shadow-xl">
                {match.away_team_logo ? (
                  <img
                    src={match.away_team_logo}
                    alt={match.event_away_team}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-2xl font-black text-rose-400">
                    {(match.event_away_team || 'A')[0]}
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm font-black text-white group-hover:text-rose-400 transition-colors leading-tight">
                {match.event_away_team}
              </span>
            </Link>
          </div>

          {/* Venue & Referee Metadata */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400">
            {match.event_stadium && (
              <span className="flex items-center gap-1 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">
                🏟️ {match.event_stadium}
              </span>
            )}
            {match.event_referee && (
              <span className="flex items-center gap-1 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">
                🟨 Ref: {match.event_referee}
              </span>
            )}
            {match.country_name && (
              <span className="flex items-center gap-1 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">
                📍 {match.country_name}
              </span>
            )}
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex gap-1.5 mt-8 overflow-x-auto no-scrollbar pb-1 border-b border-[#1e293b]/60">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Active Tab Content Container ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'summary' && (
          <SummaryTab match={match} timelineEvents={timelineEvents} comments={comments} />
        )}
        {activeTab === 'stats' && (
          <StatsTab
            stats={match.statistics || []}
            homeTeam={match.event_home_team}
            awayTeam={match.event_away_team}
          />
        )}
        {activeTab === 'lineups' && (
          <LineupsTab
            lineups={match.lineups}
            homeTeam={match.event_home_team}
            awayTeam={match.event_away_team}
            homeFormation={match.event_home_formation}
            awayFormation={match.event_away_formation}
          />
        )}
        {activeTab === 'h2h' && (
          <H2HTab
            h2hData={h2h}
            homeTeam={match.event_home_team}
            awayTeam={match.event_away_team}
          />
        )}
        {activeTab === 'table' && (
          <TableTab
            standings={standings}
            homeTeam={match.event_home_team}
            awayTeam={match.event_away_team}
            leagueName={match.league_name}
          />
        )}
        {activeTab === 'odds' && (
          <OddsTab
            odds={odds}
            homeTeam={match.event_home_team}
            awayTeam={match.event_away_team}
          />
        )}
        {activeTab === 'commentary' && <CommentaryTab comments={comments} />}
      </div>
    </div>
  );
}
