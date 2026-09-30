'use client';

import React, { useState } from 'react';
import {
  NormalizedBetScanResult,
  DecodedBetSlip,
  NormalizedBetAnalysisResult,
  NormalizedBetTrimResult,
} from '@goalmills/types';
import { BetViewerCard } from './BetViewerCard';
import { BetAnalyzerCard } from './BetAnalyzerCard';
import { RiskTrimmerCard } from './RiskTrimmerCard';

export interface BetScannerWidgetProps {
  initialCode?: string;
  initialBookmaker?: string;
  className?: string;
}

export const BetScannerWidget: React.FC<BetScannerWidgetProps> = ({
  initialCode = '',
  initialBookmaker = '1xbet',
  className = '',
}) => {
  const [code, setCode] = useState(initialCode);
  const [sourceBookmaker, setSourceBookmaker] = useState(initialBookmaker);
  const [stake, setStake] = useState<number>(10);
  const [activeTab, setActiveTab] = useState<'SCAN' | 'DECODE' | 'ANALYZE' | 'TRIM'>('SCAN');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [scanResult, setScanResult] = useState<NormalizedBetScanResult | null>(null);
  const [decodeResult, setDecodeResult] = useState<DecodedBetSlip | null>(null);
  const [analyzeResult, setAnalyzeResult] = useState<NormalizedBetAnalysisResult | null>(null);
  const [trimResult, setTrimResult] = useState<NormalizedBetTrimResult | null>(null);

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) {
      setError('Please enter a valid booking code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/betting/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), sourceBookmaker, stake }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to scan bet code');
      }

      setScanResult(json.data);
      setActiveTab('SCAN');
    } catch (err: any) {
      setError(err.message || 'Error scanning booking code.');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalyze = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/betting/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), sourceBookmaker, stake }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to analyze bet code');
      setAnalyzeResult(json.data);
      setActiveTab('ANALYZE');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTrim = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/betting/trim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), sourceBookmaker, riskTolerance: 'MODERATE' }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to trim bet code');
      setTrimResult(json.data);
      setActiveTab('TRIM');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDecode = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/betting/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), sourceBookmaker }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to decode bet code');
      setDecodeResult(json.data);
      setActiveTab('DECODE');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-2xl text-neutral-100 ${className}`}>
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              ⚡ Betting Intelligence
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
            Universal Bet Scanner & AI Analyzer
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Scan booking codes across major bookmakers for best odds, risk analysis, and optimized payouts.
          </p>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleScan} className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-4 mb-6 shadow-inner">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Booking Code Input */}
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Booking Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. 5K9L2 or B39AX"
              className="w-full bg-neutral-900 border border-neutral-700/80 rounded-lg px-3.5 py-2.5 text-sm font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Source Bookmaker Dropdown */}
          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Source Bookmaker
            </label>
            <select
              value={sourceBookmaker}
              onChange={(e) => setSourceBookmaker(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="1xbet">1xBet</option>
              <option value="bet365">bet365</option>
              <option value="betano">Betano</option>
              <option value="betfair">Betfair</option>
              <option value="sportybet">SportyBet</option>
              <option value="marathon">Marathon</option>
              <option value="betvictor">BetVictor</option>
              <option value="williamhill">William Hill</option>
            </select>
          </div>

          {/* Stake Input */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Stake (€)
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              value={stake}
              onChange={(e) => setStake(Math.max(1, parseInt(e.target.value || '1', 10)))}
              className="w-full bg-neutral-900 border border-neutral-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-neutral-400">
            Supports code comparison across 10+ licensed bookmakers
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 font-bold rounded-lg transition-all text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></span>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>🔍</span>
                <span>Scan Odds Across Bookmakers</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* Tabs when result exists */}
      {(scanResult || decodeResult || analyzeResult || trimResult) && (
        <div className="mb-5 flex flex-wrap gap-2 border-b border-neutral-800 pb-3">
          <button
            onClick={() => setActiveTab('SCAN')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'SCAN'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-white bg-neutral-800/40'
            }`}
          >
            📊 Odds Comparison {scanResult && `(${scanResult.quotes.length})`}
          </button>
          <button
            onClick={loadDecode}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'DECODE'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-white bg-neutral-800/40'
            }`}
          >
            🎟 Decoded Legs
          </button>
          <button
            onClick={loadAnalyze}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ANALYZE'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-white bg-neutral-800/40'
            }`}
          >
            🤖 AI Bet Analyzer
          </button>
          <button
            onClick={loadTrim}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'TRIM'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-white bg-neutral-800/40'
            }`}
          >
            ✂ Risk Trimmer
          </button>
        </div>
      )}

      {/* Tab 1: Odds Scanner Comparison Matrix */}
      {activeTab === 'SCAN' && scanResult && (
        <div className="space-y-4">
          {/* Best Odds Summary Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-900 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span>🏆</span>
                <span>BEST ACCUMULATOR ODDS FOUND</span>
              </div>
              <div className="text-lg font-black text-white mt-0.5">
                {scanResult.bestBookmaker.bookmakerName} offers @{scanResult.bestBookmaker.totalOdds.toFixed(2)}
              </div>
              <div className="text-xs text-neutral-400">
                Potential Payout: <strong className="text-emerald-400 font-mono">€{(scanResult.stake * scanResult.bestBookmaker.totalOdds).toFixed(2)}</strong> on a €{scanResult.stake} stake
                {scanResult.bestBookmaker.differencePercent && scanResult.bestBookmaker.differencePercent > 0 && (
                  <span className="text-emerald-400 ml-1.5 font-bold">(+{scanResult.bestBookmaker.differencePercent}%)</span>
                )}
              </div>
            </div>

            <a
              href={scanResult.bestBookmaker.affiliateUrl || '#'}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-lg text-xs transition-colors text-center shadow-lg shadow-emerald-500/20"
            >
              BET NOW AT {scanResult.bestBookmaker.bookmakerName.toUpperCase()} →
            </a>
          </div>

          {/* Bookmakers Comparison Table */}
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950/60">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-neutral-900/80 text-neutral-400 uppercase text-[11px] tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Bookmaker</th>
                  <th className="py-3 px-4 text-center">Combined Odds</th>
                  <th className="py-3 px-4 text-center">Odds Delta</th>
                  <th className="py-3 px-4 text-right">Potential Payout</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-medium">
                {scanResult.quotes.map((quote) => (
                  <tr
                    key={quote.bookmakerId}
                    className={`hover:bg-neutral-800/40 transition-colors ${
                      quote.isBestOdds ? 'bg-emerald-500/5' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                      <span>{quote.bookmakerName}</span>
                      {quote.isBestOdds && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Best
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold font-mono text-neutral-100">
                      @{quote.totalOdds.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {quote.differencePercent !== undefined && quote.differencePercent !== 0 ? (
                        <span
                          className={`font-semibold text-xs px-1.5 py-0.5 rounded ${
                            quote.differencePercent > 0
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : 'text-rose-400 bg-rose-500/10'
                          }`}
                        >
                          {quote.differencePercent > 0 ? `+${quote.differencePercent}%` : `${quote.differencePercent}%`}
                        </span>
                      ) : (
                        <span className="text-neutral-500 text-xs">Baseline</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-neutral-200">
                      €{(scanResult.stake * quote.totalOdds).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <a
                        href={quote.affiliateUrl || '#'}
                        className={`inline-block px-3 py-1.5 rounded text-xs font-bold transition-all ${
                          quote.isBestOdds
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md shadow-emerald-500/20'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                        }`}
                      >
                        BET NOW
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Decoded Bet Slip */}
      {activeTab === 'DECODE' && decodeResult && (
        <BetViewerCard slip={decodeResult} />
      )}

      {/* Tab 3: AI Bet Analyzer */}
      {activeTab === 'ANALYZE' && analyzeResult && (
        <BetAnalyzerCard analysis={analyzeResult} />
      )}

      {/* Tab 4: Risk Trimmer */}
      {activeTab === 'TRIM' && trimResult && (
        <RiskTrimmerCard trimResult={trimResult} />
      )}
    </div>
  );
};
