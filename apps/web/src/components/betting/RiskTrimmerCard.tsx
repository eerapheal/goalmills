'use client';

import React from 'react';
import { NormalizedBetTrimResult } from '@goalmills/types';

export interface RiskTrimmerCardProps {
  trimResult: NormalizedBetTrimResult;
  className?: string;
}

export const RiskTrimmerCard: React.FC<RiskTrimmerCardProps> = ({ trimResult, className = '' }) => {
  return (
    <div className={`bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 sm:p-6 backdrop-blur-md shadow-xl text-neutral-100 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3 mb-4">
        <div>
          <div className="text-xs font-semibold tracking-wider uppercase text-emerald-400 flex items-center gap-1.5">
            <span>✂</span>
            <span>Algorithmic Risk Trimmer</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mt-1">
            Optimized Accumulator vs Original Slip
          </h3>
        </div>
        {trimResult.trimmedCode && (
          <div className="text-right">
            <span className="text-xs text-neutral-400">Trimmed Code: </span>
            <span className="font-mono text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {trimResult.trimmedCode}
            </span>
          </div>
        )}
      </div>

      {/* Comparison Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="p-3 rounded-lg bg-neutral-800/60 border border-neutral-700/40 text-center">
          <div className="text-xs text-neutral-400 mb-1">Original Odds</div>
          <div className="text-xl font-bold text-neutral-200">
            {trimResult.originalOdds.toFixed(2)}
          </div>
          <div className="text-[11px] text-neutral-400">{trimResult.originalLegCount} Legs</div>
        </div>

        <div className="p-3 rounded-lg bg-neutral-800/60 border border-neutral-700/40 text-center">
          <div className="text-xs text-neutral-400 mb-1">Trimmed Odds</div>
          <div className="text-xl font-bold text-emerald-400">
            {trimResult.trimmedOdds.toFixed(2)}
          </div>
          <div className="text-[11px] text-neutral-400">{trimResult.trimmedLegCount} Legs</div>
        </div>

        <div className="p-3 rounded-lg bg-neutral-800/60 border border-neutral-700/40 text-center">
          <div className="text-xs text-neutral-400 mb-1">Risk Reduction</div>
          <div className="text-xl font-bold text-sky-400">
            -{trimResult.riskReductionPercent.toFixed(1)}%
          </div>
          <div className="text-[11px] text-neutral-400">Variance Dropped</div>
        </div>

        <div className="p-3 rounded-lg bg-neutral-800/60 border border-neutral-700/40 text-center">
          <div className="text-xs text-neutral-400 mb-1">Win Probability</div>
          <div className="text-xl font-bold text-amber-400">
            {trimResult.estimatedWinProbabilityAfter.toFixed(1)}%
          </div>
          <div className="text-[11px] text-neutral-400">
            from {trimResult.estimatedWinProbabilityBefore.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Leg Differences */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
          Leg Actions & Explanations
        </h4>
        <div className="space-y-2">
          {trimResult.differences.map((diff, idx) => (
            <div
              key={diff.legId || idx}
              className={`p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                diff.action === 'REMOVED'
                  ? 'bg-rose-950/20 border-rose-900/40 text-neutral-200'
                  : diff.action === 'ADJUSTED_MARKET'
                  ? 'bg-amber-950/20 border-amber-900/40 text-neutral-200'
                  : 'bg-neutral-800/40 border-neutral-700/40 text-neutral-200'
              }`}
            >
              <div>
                <div className="font-semibold text-white flex items-center gap-2">
                  <span>{diff.fixture}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      diff.action === 'REMOVED'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : diff.action === 'ADJUSTED_MARKET'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {diff.action}
                  </span>
                </div>
                <div className="text-neutral-400 text-xs mt-1">{diff.reason}</div>
              </div>

              <div className="shrink-0 text-right sm:pl-3">
                <span className="font-mono text-neutral-400 text-xs">Original: @{diff.originalOdds.toFixed(2)}</span>
                {diff.adjustedOdds && (
                  <span className="font-mono text-emerald-400 text-xs ml-2 font-bold">Adjusted: @{diff.adjustedOdds.toFixed(2)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800 text-[11px] text-neutral-400 text-center leading-relaxed">
        <span className="font-semibold text-neutral-300">Disclaimer: </span>
        {trimResult.disclaimer || 'Risk trimming is informational and based on algorithmic risk factors. It does not guarantee an outcome.'}
      </div>
    </div>
  );
};
