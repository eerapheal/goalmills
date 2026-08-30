'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiShield, FiTrendingUp, FiClock, FiActivity, FiLayers, FiCalendar } from 'react-icons/fi';
import type { HeadToHeadSummary } from '@goalmills/types';

interface HeadToHeadCardProps {
  sport?: string;
  teamA?: string;
  teamB?: string;
  className?: string;
}

export function HeadToHeadCard({
  sport = 'football',
  teamA = 'arsenal',
  teamB = 'chelsea',
  className = '',
}: HeadToHeadCardProps) {
  const [data, setData] = useState<HeadToHeadSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadH2H() {
      try {
        const res = await fetch(`/api/warehouse/h2h?sport=${sport}&teamA=${teamA}&teamB=${teamB}`);
        const json = await res.json();
        if (isMounted && json.success && json.h2h) {
          setData(json.h2h);
        }
      } catch (err) {
        console.error('Failed to load H2H analytics:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadH2H();
    return () => {
      isMounted = false;
    };
  }, [sport, teamA, teamB]);

  if (loading) {
    return (
      <div className={`p-6 rounded-3xl bg-slate-950/60 border border-white/10 animate-pulse ${className}`}>
        <div className="h-6 w-48 bg-white/10 rounded-lg mb-4" />
        <div className="h-28 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  if (!data || data.totalMatches === 0) {
    return null;
  }

  const winPctA = data.totalMatches > 0 ? Math.round((data.teamAWins / data.totalMatches) * 100) : 0;
  const winPctB = data.totalMatches > 0 ? Math.round((data.teamBWins / data.totalMatches) * 100) : 0;
  const drawPct = data.totalMatches > 0 ? Math.round((data.draws / data.totalMatches) * 100) : 0;

  return (
    <div className={`glass-card p-6 rounded-3xl border border-white/10 bg-slate-950/80 shadow-2xl space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <FiShield size={18} />
          </span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
              Head-to-Head Analytics
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Historical match records across {data.totalMatches} encounters
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
          Warehouse Verified
        </span>
      </div>

      {/* Teams Win Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-white">
          <span className="text-emerald-400">{data.teamA.name} ({data.teamAWins}W)</span>
          <span className="text-slate-400 font-normal text-xs">{data.draws} Draws</span>
          <span className="text-blue-400">{data.teamB.name} ({data.teamBWins}W)</span>
        </div>

        <div className="h-3 rounded-full bg-slate-900 overflow-hidden flex p-0.5 gap-1 border border-white/10">
          <div
            className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
            style={{ width: `${Math.max(winPctA, 5)}%` }}
            title={`${data.teamA.name}: ${winPctA}%`}
          />
          <div
            className="h-full bg-slate-600 transition-all duration-500"
            style={{ width: `${Math.max(drawPct, 5)}%` }}
            title={`Draws: ${drawPct}%`}
          />
          <div
            className="h-full bg-blue-500 rounded-r-full transition-all duration-500"
            style={{ width: `${Math.max(winPctB, 5)}%` }}
            title={`${data.teamB.name}: ${winPctB}%`}
          />
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 text-center">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Encounters</div>
          <div className="text-xl font-black text-white mt-1">{data.totalMatches}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 text-center">
          <div className="text-[10px] font-bold uppercase text-slate-400">Avg Goals / Match</div>
          <div className="text-xl font-black text-amber-400 mt-1">{data.avgGoalsPerMatch}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 text-center">
          <div className="text-[10px] font-bold uppercase text-slate-400">Top Scoreline</div>
          <div className="text-xl font-black text-white mt-1">{data.mostCommonScoreline}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 text-center">
          <div className="text-[10px] font-bold uppercase text-slate-400">Clean Sheets</div>
          <div className="text-sm font-black text-slate-300 mt-1.5">
            {data.cleanSheetsTeamA} - {data.cleanSheetsTeamB}
          </div>
        </div>
      </div>

      {/* Recent Meetings Timeline */}
      {data.recentMatches.length > 0 && (
        <div className="space-y-2.5 pt-2">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <FiCalendar className="text-blue-400" />
            <span>Recent Fixture History</span>
          </div>

          <div className="space-y-2">
            {data.recentMatches.slice(0, 4).map((m) => (
              <div
                key={m.matchId}
                className="p-3 rounded-xl bg-slate-900/40 border border-white/5 hover:border-white/10 transition flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(m.date).toLocaleDateString(undefined, {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="font-bold text-white">
                    {m.homeTeam.name} <span className="text-amber-400">{m.finalScore.formatted}</span> {m.awayTeam.name}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-mono">
                  {m.competition.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default HeadToHeadCard;
