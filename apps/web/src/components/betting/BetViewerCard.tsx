'use client';

import React from 'react';
import { DecodedBetSlip } from '@goalmills/types';

export interface BetViewerCardProps {
  slip: DecodedBetSlip;
  className?: string;
}

export const BetViewerCard: React.FC<BetViewerCardProps> = ({ slip, className = '' }) => {
  return (
    <div className={`bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 sm:p-6 backdrop-blur-md shadow-xl text-neutral-100 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {slip.sourceBookmaker}
            </span>
            <span className="text-xs text-neutral-400 font-mono">Code: {slip.code}</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mt-1">
            Decoded Accumulator Slip ({slip.legCount} {slip.legCount === 1 ? 'Leg' : 'Legs'})
          </h3>
        </div>
        <div className="text-right">
          <div className="text-xs text-neutral-400">Total Slip Odds</div>
          <div className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight">
            {slip.totalOdds.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Legs List */}
      <div className="space-y-2.5">
        {slip.legs.map((leg, idx) => (
          <div
            key={leg.id || idx}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-neutral-800/50 hover:bg-neutral-800/80 transition-colors border border-neutral-700/40 text-xs sm:text-sm gap-2"
          >
            <div className="flex items-start gap-2.5">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-neutral-700 text-neutral-300 text-[11px] font-bold shrink-0 mt-0.5 sm:mt-0">
                {idx + 1}
              </span>
              <div>
                <div className="font-semibold text-white">{leg.fixture}</div>
                <div className="text-neutral-400 text-xs flex items-center gap-2 mt-0.5">
                  {leg.league && <span>{leg.league}</span>}
                  {leg.selection.market && (
                    <>
                      <span>•</span>
                      <span className="text-neutral-300 font-medium">{leg.selection.market}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-7 sm:pl-0">
              <span className="inline-flex items-center px-2 py-1 rounded bg-neutral-900 text-emerald-400 font-medium border border-emerald-500/20">
                {leg.selection.selection}
              </span>
              <span className="font-bold text-neutral-100 font-mono text-sm">
                @{leg.selection.odds.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
