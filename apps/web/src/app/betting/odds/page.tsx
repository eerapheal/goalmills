import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { OddsComparisonMatrix } from '@/components/betting/OddsComparisonMatrix';
import { FootballOdds } from '@goalmills/types';

export const metadata: Metadata = {
  title: 'Live Sports Odds Comparison & Best Lines | GoalMills',
  description:
    'Compare real-time 1X2, Over/Under, and Asian Handicap betting odds across all licensed bookmakers on GoalMills.',
};

const SAMPLE_MATCH_ODDS: FootballOdds[] = ([
  {
    match_id: '1058291',
    odd_bookmakers: '1xBet',
    odd_1: '1.85',
    odd_x: '3.60',
    odd_2: '4.20',
    odd_1x: '1.22',
    odd_12: '1.28',
    odd_x2: '1.95',
    'o+2.5': '1.92',
    'u+2.5': '1.88',
    bts_yes: '1.75',
    bts_no: '2.05',
  },
  {
    match_id: '1058291',
    odd_bookmakers: 'bet365',
    odd_1: '1.80',
    odd_x: '3.50',
    odd_2: '4.50',
    odd_1x: '1.20',
    odd_12: '1.30',
    odd_x2: '2.00',
    'o+2.5': '1.90',
    'u+2.5': '1.90',
    bts_yes: '1.72',
    bts_no: '2.08',
  },
  {
    match_id: '1058291',
    odd_bookmakers: 'Betano',
    odd_1: '1.83',
    odd_x: '3.55',
    odd_2: '4.35',
    odd_1x: '1.21',
    odd_12: '1.29',
    odd_x2: '1.98',
    'o+2.5': '1.95',
    'u+2.5': '1.85',
    bts_yes: '1.78',
    bts_no: '2.02',
  },
  {
    match_id: '1058291',
    odd_bookmakers: 'Betfair',
    odd_1: '1.82',
    odd_x: '3.65',
    odd_2: '4.10',
    odd_1x: '1.23',
    odd_12: '1.27',
    odd_x2: '1.92',
    'o+2.5': '1.88',
    'u+2.5': '1.92',
    bts_yes: '1.74',
    bts_no: '2.06',
  },
]) as unknown as FootballOdds[];

export default function BettingOddsDirectoryPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <Link href="/betting" className="hover:text-emerald-400">Betting Hub</Link>
          <span>/</span>
          <span className="text-white font-medium">Odds Directory</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>📊</span> Live Sports Odds Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Objective real-time market lines, payouts, and margins across licensed sportsbooks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/football"
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            >
              Browse Fixtures →
            </Link>
          </div>
        </div>

        {/* Featured Live Match Odds Spotlight */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Premier League Spotlight: Arsenal vs Chelsea</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Live Best Odds</span>
          </div>

          <OddsComparisonMatrix
            homeTeam="Arsenal"
            awayTeam="Chelsea"
            eventId="1058291"
            rawOdds={SAMPLE_MATCH_ODDS}
          />
        </div>
      </div>
    </div>
  );
}
