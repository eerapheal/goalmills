import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { BetScannerWidget } from '@/components/betting/BetScannerWidget';
import { getAllCanonicalBookmakers } from '@/lib/betting/bookmakerRegistry';

export const metadata: Metadata = {
  title: 'Betting Intelligence & Odds Comparison Hub | GoalMills',
  description:
    'Comprehensive sports betting intelligence, real-time bookmaker odds comparison, AI accumulator analysis, and bet code tools on GoalMills.',
};

export default function BettingWorkspacePage() {
  const bookmakers = getAllCanonicalBookmakers();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero Header */}
        <div className="mb-8 border-b border-slate-800/80 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                  ⚡ GoalMills Intelligence
                </span>
                <span className="text-xs text-slate-400">Phase 4 Unified Platform</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Sports Betting Intelligence Hub
              </h1>
              <p className="text-sm sm:text-base text-slate-400 mt-1 max-w-3xl">
                Compare real-time odds across major licensed operators, scan booking codes, analyze risk with AI, and optimize accumulator payouts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/betting/editor"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-lg shadow-emerald-500/20"
              >
                + Open Bet Editor
              </Link>
              <Link
                href="/betting/saved"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs transition-colors border border-slate-700"
              >
                Saved Slips
              </Link>
            </div>
          </div>

          {/* Quick Tool Navigation Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
            <Link
              href="/betting/scanner"
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/60 transition-all group"
            >
              <div className="text-lg mb-1 group-hover:scale-110 transition-transform">🔍</div>
              <div className="font-bold text-white text-xs sm:text-sm">Odds Scanner</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Scan codes for best prices</div>
            </Link>

            <Link
              href="/betting/analyzer"
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-800/60 transition-all group"
            >
              <div className="text-lg mb-1 group-hover:scale-110 transition-transform">🤖</div>
              <div className="font-bold text-white text-xs sm:text-sm">AI Analyzer</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Statistical risk modeling</div>
            </Link>

            <Link
              href="/betting/editor"
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/60 transition-all group"
            >
              <div className="text-lg mb-1 group-hover:scale-110 transition-transform">📝</div>
              <div className="font-bold text-white text-xs sm:text-sm">Bet Editor</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Build and modify slips</div>
            </Link>

            <Link
              href="/betting/odds"
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/60 transition-all group"
            >
              <div className="text-lg mb-1 group-hover:scale-110 transition-transform">📊</div>
              <div className="font-bold text-white text-xs sm:text-sm">Odds Directory</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Live market comparisons</div>
            </Link>

            <Link
              href="/betting/saved"
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/60 transition-all group col-span-2 sm:col-span-1"
            >
              <div className="text-lg mb-1 group-hover:scale-110 transition-transform">📁</div>
              <div className="font-bold text-white text-xs sm:text-sm">Saved & Shared</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Track your personal slips</div>
            </Link>
          </div>
        </div>

        {/* Primary Interactive Scanner Widget */}
        <div className="mb-10">
          <BetScannerWidget />
        </div>

        {/* Licensed Bookmaker Directory Spotlight */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Supported Licensed Operators</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Objective odds comparison across audited sportsbooks. GoalMills receives advertising compensation from featured partners.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">18+ Gamble Responsibly</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {bookmakers.slice(0, 8).map((bm) => (
              <div
                key={bm.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center flex flex-col items-center justify-between"
              >
                <div className="font-bold text-sm text-white">{bm.displayName}</div>
                <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                  {bm.rating ? `★ ${bm.rating}` : 'Audited'}
                </div>
                {bm.bonusText && (
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{bm.bonusText}</div>
                )}
                <a
                  href={`/api/affiliate/redirect/${bm.id}?placement=workspace_directory`}
                  className="mt-2.5 w-full py-1 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                >
                  Visit →
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
