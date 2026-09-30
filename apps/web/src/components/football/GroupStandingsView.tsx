'use client';

import React, { useState } from 'react';
import { StandingTable } from '@goalmills/types';
import { FootballStandingsTable } from '../FootballStandingsTable';

interface GroupStandingsViewProps {
  groups: StandingTable[];
  leagueId?: string | number;
  initialGroupSlug?: string;
}

export function GroupStandingsView({
  groups,
  leagueId,
  initialGroupSlug,
}: GroupStandingsViewProps) {
  const [activeGroupSlug, setActiveGroupSlug] = useState<string>(
    initialGroupSlug || groups[0]?.slug || ''
  );
  const [viewMode, setViewMode] = useState<'all' | 'single'>('all');

  if (!groups || groups.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0B1526]/60 p-8 text-center text-slate-400">
        No group standings available for this tournament stage.
      </div>
    );
  }

  const activeGroup = groups.find((g) => g.slug === activeGroupSlug) || groups[0];

  return (
    <div className="space-y-6">
      {/* Controls: View Mode & Group Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
        {/* Group Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setViewMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              viewMode === 'all'
                ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                : 'bg-[#0B1526] text-slate-400 hover:text-white border-white/5'
            }`}
          >
            All Groups ({groups.length})
          </button>
          {groups.map((group) => {
            const isSelected = viewMode === 'single' && activeGroupSlug === group.slug;
            return (
              <button
                key={group.id}
                onClick={() => {
                  setViewMode('single');
                  setActiveGroupSlug(group.slug);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                    : 'bg-[#0B1526] text-slate-400 hover:text-white border-white/5'
                }`}
              >
                {group.name}
              </button>
            );
          })}
        </div>

        {/* Qualification Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500/80" />
            <span>Top 2 Advance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500/80" />
            <span>Best 3rd Place</span>
          </div>
        </div>
      </div>

      {/* Grid or Single View */}
      {viewMode === 'all' ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              className="rounded-2xl border border-blue-500/20 bg-[#0B1526]/50 overflow-hidden shadow-xl"
            >
              <div className="px-4 py-3 bg-[#0E1F38] border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  {group.name}
                </h3>
                <span className="text-[10px] font-mono text-slate-400 font-bold">
                  {group.entries.length} Teams
                </span>
              </div>
              <FootballStandingsTable table={group} leagueId={leagueId} compact />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-blue-500/20 bg-[#0B1526]/50 overflow-hidden shadow-xl">
          <div className="px-4 py-3 bg-[#0E1F38] border-b border-white/10 flex items-center justify-between">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {activeGroup.name} Standings
            </h3>
            <span className="text-[10px] font-mono text-slate-400 font-bold">
              {activeGroup.entries.length} Teams
            </span>
          </div>
          <FootballStandingsTable table={activeGroup} leagueId={leagueId} />
        </div>
      )}
    </div>
  );
}
