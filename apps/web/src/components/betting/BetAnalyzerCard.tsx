'use client';

import React from 'react';
import { NormalizedBetAnalysisResult } from '@goalmills/types';

export interface BetAnalyzerCardProps {
  analysis: NormalizedBetAnalysisResult;
  className?: string;
}

export const BetAnalyzerCard: React.FC<BetAnalyzerCardProps> = ({ analysis, className = '' }) => {
  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score < 60) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const getEVBadge = (ev: string) => {
    switch (ev) {
      case 'POSITIVE':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">+EV (Value Found)</span>;
      case 'NEGATIVE':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">-EV (Poor Value)</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-700/50 text-neutral-300 border border-neutral-600">Neutral EV</span>;
    }
  };

  return (
    <div className={`bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 sm:p-6 backdrop-blur-md shadow-xl text-neutral-100 ${className}`}>
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3 mb-4">
        <div>
          <div className="text-xs font-semibold tracking-wider uppercase text-sky-400 flex items-center gap-1.5">
            <span>🤖</span>
            <span>GoalMills AI Bet Intelligence</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mt-1">
            Predictive Risk & Value Assessment
          </h3>
        </div>
        <div>
          {getEVBadge(analysis.expectedValueIndicator)}
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <div className="p-3.5 rounded-lg bg-neutral-800/60 border border-neutral-700/40 text-center">
          <div className="text-xs text-neutral-400 mb-1">Risk Score</div>
          <div className={`text-2xl sm:text-3xl font-black ${getRiskColor(analysis.overallRiskScore).split(' ')[0]}`}>
            {analysis.overallRiskScore}
            <span className="text-xs text-neutral-400 font-normal">/100</span>
          </div>
          <div className="text-[11px] text-neutral-400 font-medium mt-0.5">
            Rating: {analysis.riskRating}
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-neutral-800/60 border border-neutral-700/40 text-center">
          <div className="text-xs text-neutral-400 mb-1">Est. Win Probability</div>
          <div className="text-2xl sm:text-3xl font-black text-sky-400">
            {analysis.estimatedWinProbabilityPercent.toFixed(1)}%
          </div>
          <div className="text-[11px] text-neutral-400 font-medium mt-0.5">
            Statistical Model
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-lg bg-neutral-800/60 border border-neutral-700/40 text-center">
          <div className="text-xs text-neutral-400 mb-1">Recommended Stake</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            {analysis.recommendedMaxStakePercent ? `${analysis.recommendedMaxStakePercent}%` : 'Standard'}
          </div>
          <div className="text-[11px] text-neutral-400 font-medium mt-0.5">
            Max Bankroll Limit
          </div>
        </div>
      </div>

      {/* Strengths & Positive Insights */}
      {analysis.strengths && analysis.strengths.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>✓</span> Key Strengths & Statistical Backing
          </h4>
          <div className="space-y-1.5">
            {analysis.strengths.map((str, idx) => (
              <div key={idx} className="p-2.5 rounded bg-emerald-950/20 border border-emerald-900/40 text-xs text-neutral-200">
                {str}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Factors */}
      {analysis.riskFactors && analysis.riskFactors.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>⚠</span> Risk Factors to Note
          </h4>
          <div className="space-y-2">
            {analysis.riskFactors.map((rf, idx) => (
              <div key={idx} className="p-2.5 rounded bg-neutral-800/50 border border-neutral-700/40 text-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-neutral-100">{rf.title}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    rf.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    rf.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-neutral-700 text-neutral-300'
                  }`}>
                    {rf.severity}
                  </span>
                </div>
                <p className="text-neutral-400">{rf.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mandatory Non-Guarantee Disclaimer Banner */}
      <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800 text-[11px] text-neutral-400 text-center leading-relaxed">
        <span className="font-semibold text-neutral-300">Disclaimer: </span>
        {analysis.disclaimer || 'Analysis is informational and based on historical statistical models. It does not guarantee an outcome.'}
      </div>
    </div>
  );
};
