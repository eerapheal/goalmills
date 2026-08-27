'use client';

import React from 'react';

interface GoalmillsLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  label?: string;
  sublabel?: string;
  variant?: 'brand' | 'live' | 'accent' | 'compact';
  className?: string;
}

export function GoalmillsLoader({
  size = 'md',
  label = 'GoalMills Live',
  sublabel = 'Syncing real-time sports intelligence...',
  variant = 'brand',
  className = '',
}: GoalmillsLoaderProps) {
  // Small inline spinner for buttons, search inputs, pills
  if (size === 'sm') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div className="relative w-4 h-4">
          <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
          <div className="absolute inset-0.5 rounded-full border border-emerald-400/30 border-b-emerald-400 animate-spin [animation-duration:1.5s] [animation-direction:reverse]" />
        </div>
        {label && <span className="text-xs font-semibold text-slate-300">{label}</span>}
      </div>
    );
  }

  // Dimension presets
  const ringDimensions = {
    md: { outer: 'w-14 h-14', core: 'w-7 h-7', text: 'text-xs', title: 'text-sm' },
    lg: { outer: 'w-20 h-20', core: 'w-10 h-10', text: 'text-sm', title: 'text-base' },
    fullscreen: { outer: 'w-24 h-24', core: 'w-12 h-12', text: 'text-sm', title: 'text-lg' },
  }[size];

  const content = (
    <div
      className={`flex flex-col items-center justify-center p-6 text-center select-none ${className}`}
    >
      {/* Dynamic Multi-Orbit Radar Pulse */}
      <div className={`relative flex items-center justify-center ${ringDimensions.outer} mb-4`}>
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/25 via-emerald-500/20 to-amber-500/20 blur-xl animate-pulse" />

        {/* Outer Orbit (Electric Blue) */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-400 animate-spin [animation-duration:1.2s]" />

        {/* Middle Orbit (Live Emerald) */}
        <div className="absolute inset-1.5 rounded-full border-2 border-transparent border-b-emerald-400 border-l-emerald-500 animate-spin [animation-duration:2s] [animation-direction:reverse]" />

        {/* Inner Orbit (Amber / Gold Accent) */}
        <div className="absolute inset-3 rounded-full border border-transparent border-t-amber-400 border-r-amber-500 animate-spin [animation-duration:0.8s]" />

        {/* Pulsing Core Sports Monogram */}
        <div
          className={`relative ${ringDimensions.core} rounded-full bg-slate-900/90 border border-white/15 flex items-center justify-center shadow-lg shadow-black/50 backdrop-blur-sm`}
        >
          <span className="text-xs font-black tracking-tighter bg-gradient-to-br from-white via-blue-200 to-emerald-400 bg-clip-text text-transparent animate-pulse">
            GM
          </span>
          {/* Live Ping Indicator */}
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
      </div>

      {/* Brand & Progress Subtitle */}
      {label && (
        <div className="space-y-1">
          <h4
            className={`${ringDimensions.title} font-black uppercase tracking-wider text-white flex items-center justify-center gap-2`}
          >
            <span>{label}</span>
          </h4>
          {sublabel && (
            <p
              className={`${ringDimensions.text} text-slate-400 max-w-xs font-medium tracking-wide flex items-center justify-center gap-1.5`}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{sublabel}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (size === 'fullscreen') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center w-full animate-fade-in">
        <div className="glass-card border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl bg-slate-950/70">
          {content}
        </div>
      </div>
    );
  }

  return content;
}

/**
 * GoalmillsCardSkeleton - Unified shimmer card skeleton for feeds, tables, and match rows
 */
export function GoalmillsCardSkeleton({
  count = 3,
  className = '',
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-4 w-full ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 p-5 shadow-lg space-y-3"
        >
          {/* Shimmer sweep effect */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 bg-white/10 rounded-md" />
            <div className="h-4 w-16 bg-white/10 rounded-md" />
          </div>

          {/* Body content */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-white/10 rounded-md" />
              <div className="h-3 w-1/2 bg-white/5 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default GoalmillsLoader;
