'use client';

import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiActivity, FiTarget, FiShield } from 'react-icons/fi';
import type { TeamTrendAnalytics } from '@goalmills/types';

interface TeamTrendWidgetProps {
  sport?: string;
  teamSlug: string;
  className?: string;
}

export function TeamTrendWidget({
  sport = 'football',
  teamSlug,
  className = '',
}: TeamTrendWidgetProps) {
  const [trends, setTrends] = useState<TeamTrendAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadTrends() {
      try {
        const res = await fetch(`/api/warehouse/teams/${teamSlug}/trends?sport=${sport}`);
        const data = await res.json();
        if (isMounted && data.success && data.trends) {
          setTrends(data.trends);
        }
      } catch (err) {
        console.error('Failed to load team trends:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadTrends();
    return () => {
      isMounted = false;
    };
  }, [sport, teamSlug]);

  if (loading) {
    return (
      <div className={`p-6 rounded-3xl bg-slate-950/60 border border-white/10 animate-pulse ${className}`}>
        <div className="h-5 w-40 bg-white/10 rounded mb-4" />
        <div className="h-20 bg-white/5 rounded-xl" />
      </div>
    );
  }

  if (!trends) return null;

  return (
    <div className={`p-5 rounded-3xl border border-white/10 bg-slate-950/80 space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <FiTrendingUp className="text-amber-400" />
          <h4 className="text-sm font-black text-white uppercase tracking-wider">
            {trends.teamName} Tactical Trends
          </h4>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Last 10 Fixtures</span>
      </div>

      {/* Form Indicators */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400">Recent Form:</span>
        <div className="flex items-center gap-1.5">
          {trends.recentForm.map((res, i) => (
            <span
              key={i}
              className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black text-white ${
                res === 'W' ? 'bg-emerald-500' : res === 'D' ? 'bg-amber-500' : 'bg-rose-500'
              }`}
            >
              {res}
            </span>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
          <div className="text-[10px] text-slate-400">Avg Goals Scored</div>
          <div className="text-base font-black text-emerald-400 mt-0.5">{trends.averageGoalsScored} / match</div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
          <div className="text-[10px] text-slate-400">Clean Sheet Rate</div>
          <div className="text-base font-black text-blue-400 mt-0.5">{trends.cleanSheetPercentage}%</div>
        </div>
      </div>

      {/* Goal Timing Breakdown */}
      <div className="space-y-1.5 pt-1">
        <div className="text-[11px] font-bold text-slate-300 flex justify-between">
          <span>Goal Timing Breakdown</span>
          <span className="text-slate-400 font-mono text-[10px]">Minute Intervals</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
          <div className="p-2 rounded-lg bg-slate-900 border border-white/5">
            <span className="text-slate-400 block">0 - 30m</span>
            <span className="text-xs font-bold text-white mt-0.5 block">{trends.goalTimingBreakdown.early0to30m} goals</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-900 border border-white/5">
            <span className="text-slate-400 block">31 - 60m</span>
            <span className="text-xs font-bold text-white mt-0.5 block">{trends.goalTimingBreakdown.mid31to60m} goals</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-900 border border-white/5">
            <span className="text-slate-400 block">61 - 90+m</span>
            <span className="text-xs font-bold text-white mt-0.5 block">{trends.goalTimingBreakdown.late61to90m} goals</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamTrendWidget;
