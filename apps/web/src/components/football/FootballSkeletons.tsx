'use client';

import React from 'react';

export function LeagueRibbonSkeleton() {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="h-9 w-28 bg-white/5 border border-white/10 rounded-full flex-shrink-0"
        />
      ))}
    </div>
  );
}

export function MatchCardSkeleton() {
  return (
    <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-4 w-24 bg-white/10 rounded" />
        <div className="h-4 w-12 bg-white/10 rounded" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/10" />
            <div className="h-4 w-32 bg-white/10 rounded" />
          </div>
          <div className="h-4 w-6 bg-white/10 rounded" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/10" />
            <div className="h-4 w-28 bg-white/10 rounded" />
          </div>
          <div className="h-4 w-6 bg-white/10 rounded" />
        </div>
      </div>
    </div>
  );
}

export function StandingsTableSkeleton() {
  return (
    <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 animate-pulse space-y-3">
      <div className="h-6 w-40 bg-white/10 rounded mb-4" />
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 bg-white/10 rounded" />
              <div className="w-5 h-5 rounded-full bg-white/10" />
              <div className="h-4 w-24 bg-white/10 rounded" />
            </div>
            <div className="flex gap-4">
              <div className="h-4 w-4 bg-white/10 rounded" />
              <div className="h-4 w-4 bg-white/10 rounded" />
              <div className="h-4 w-4 bg-white/10 rounded" />
              <div className="h-4 w-6 bg-white/10 rounded font-bold" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlayerCardSkeleton() {
  return (
    <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 animate-pulse flex flex-col items-center text-center space-y-3">
      <div className="w-20 h-20 rounded-full bg-white/10" />
      <div className="h-5 w-28 bg-white/10 rounded" />
      <div className="h-3 w-20 bg-white/10 rounded" />
      <div className="flex gap-2 w-full pt-2">
        <div className="flex-1 h-8 bg-white/10 rounded" />
        <div className="flex-1 h-8 bg-white/10 rounded" />
      </div>
    </div>
  );
}

export function CompetitionGroupSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 w-36 bg-white/10 rounded" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-16 bg-white/5 border border-white/10 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function MarqueeMatchSkeleton() {
  return (
    <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 animate-pulse space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-4 w-32 bg-white/10 rounded" />
        <div className="h-5 w-16 bg-white/10 rounded-full" />
      </div>
      <div className="grid grid-cols-3 items-center text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-white/10" />
          <div className="h-4 w-20 bg-white/10 rounded" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-16 bg-white/10 rounded" />
          <div className="h-3 w-12 bg-white/10 rounded" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-white/10" />
          <div className="h-4 w-20 bg-white/10 rounded" />
        </div>
      </div>
    </div>
  );
}

export function NewsListSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
          <div className="w-16 h-16 rounded-lg bg-white/10 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 bg-white/10 rounded" />
            <div className="h-3 w-1/2 bg-white/10 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
