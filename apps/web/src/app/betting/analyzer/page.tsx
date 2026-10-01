'use client';

import React from 'react';
import Link from 'next/link';
import { BetScannerWidget } from '@/components/betting/BetScannerWidget';

export default function BettingAnalyzerPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <Link href="/betting" className="hover:text-emerald-400">Betting Hub</Link>
          <span>/</span>
          <span className="text-white font-medium">AI Analyzer</span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>🤖</span> AI Bet Analyzer
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Predictive statistical risk modeling, expected value indicators, and upset probability analysis.
          </p>
        </div>

        <BetScannerWidget />
      </div>
    </div>
  );
}
