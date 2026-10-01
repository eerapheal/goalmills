'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BetSlipLeg } from '@goalmills/types';
import { recalculateBetSlip, removeLegFromSlip } from '@/lib/betting/betEditorService';

const SAMPLE_LEGS: BetSlipLeg[] = [
  {
    id: 'leg_1',
    fixture: 'Arsenal vs Chelsea',
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    sport: 'football',
    league: 'Premier League',
    status: 'PENDING',
    selection: { market: '1X2', selection: 'Home (Arsenal)', odds: 1.85, probability: 0.54 },
  },
  {
    id: 'leg_2',
    fixture: 'Real Madrid vs Barcelona',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    sport: 'football',
    league: 'La Liga',
    status: 'PENDING',
    selection: { market: 'Both Teams to Score', selection: 'Yes', odds: 1.62, probability: 0.61 },
  },
  {
    id: 'leg_3',
    fixture: 'Bayern Munich vs Borussia Dortmund',
    homeTeam: 'Bayern Munich',
    awayTeam: 'Borussia Dortmund',
    sport: 'football',
    league: 'Bundesliga',
    status: 'PENDING',
    selection: { market: 'Over/Under 2.5', selection: 'Over 2.5', odds: 1.94, probability: 0.51 },
  },
];

export default function BetEditorPage() {
  const [legs, setLegs] = useState<BetSlipLeg[]>(SAMPLE_LEGS);
  const [title, setTitle] = useState('Weekend Multi-League Acca');
  const [sourceBookmaker, setSourceBookmaker] = useState('1xbet');
  const [stake, setStake] = useState(10);
  const [isPublic, setIsPublic] = useState(false);

  const [saving, setSaving] = useState(false);
  const [savedPublicId, setSavedPublicId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totals = recalculateBetSlip({ legs, sourceBookmaker, stake });

  const handleRemove = (legId: string) => {
    setLegs(removeLegFromSlip(legs, legId));
  };

  const handleSave = async () => {
    if (legs.length === 0) {
      setError('Cannot save an empty bet slip.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/betting/slips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          sourceBookmaker,
          totalOdds: totals.totalOdds,
          legs,
          isPublic,
          stake,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save bet slip');
      }

      setSavedPublicId(json.data.publicId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <Link href="/betting" className="hover:text-emerald-400">Betting Hub</Link>
          <span>/</span>
          <span className="text-white font-medium">Bet Editor</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>📝</span> GoalMills Bet Editor
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Add or remove legs, adjust selections, and recalculate accumulator payouts in real time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/betting/saved"
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            >
              My Saved Slips →
            </Link>
          </div>
        </div>

        {/* Editor Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Legs List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Accumulator Legs ({legs.length})
                </span>
                <span className="text-xs text-slate-500">Click Remove to eliminate risk legs</span>
              </div>

              {legs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No legs in slip. Add fixtures or reset legs.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {legs.map((leg, idx) => (
                    <div
                      key={leg.id}
                      className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-white text-sm">{leg.fixture}</div>
                          <div className="text-slate-400 mt-0.5">
                            {leg.selection.market}: <span className="text-emerald-400 font-medium">{leg.selection.selection}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono font-bold text-amber-400 text-sm">
                          @{leg.selection.odds.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleRemove(leg.id)}
                          className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px] font-bold transition-colors"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Ticket Summary & Save Controls */}
          <div className="space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 mb-4">
                Slip Controls & Summary
              </h3>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Slip Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Target Bookmaker</label>
                  <select
                    value={sourceBookmaker}
                    onChange={(e) => setSourceBookmaker(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="1xbet">1xBet</option>
                    <option value="bet365">bet365</option>
                    <option value="betano">Betano</option>
                    <option value="betfair">Betfair</option>
                    <option value="sportybet">SportyBet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Stake Amount (€)</label>
                  <input
                    type="number"
                    min="1"
                    value={stake}
                    onChange={(e) => setStake(Math.max(1, parseInt(e.target.value || '1', 10)))}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <label htmlFor="isPublic" className="text-slate-300 font-medium">
                    Make Slip Publicly Shareable
                  </label>
                </div>

                {/* Calculation Box */}
                <div className="p-3.5 rounded-lg bg-slate-950/90 border border-slate-800 space-y-2 mt-4 font-medium">
                  <div className="flex justify-between text-slate-400">
                    <span>Total Slip Odds:</span>
                    <span className="font-bold text-amber-400 font-mono text-sm">{totals.totalOdds.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Win Probability:</span>
                    <span className="font-bold text-sky-400">{totals.estimatedWinProbability}%</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-slate-800">
                    <span>Potential Payout:</span>
                    <span className="text-emerald-400 font-mono">€{totals.potentialPayout.toFixed(2)}</span>
                  </div>
                </div>

                {error && (
                  <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                    {error}
                  </div>
                )}

                {/* Save CTA */}
                <button
                  onClick={handleSave}
                  disabled={saving || legs.length === 0}
                  className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold transition-all text-sm shadow-lg shadow-emerald-500/20"
                >
                  {saving ? 'Saving...' : '💾 Save Accumulator Slip'}
                </button>

                {savedPublicId && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center space-y-1.5">
                    <div className="font-bold">✓ Bet Slip Saved!</div>
                    {isPublic ? (
                      <div>
                        Share URL:{' '}
                        <Link href={`/bet-slip/${savedPublicId}`} className="underline font-mono text-white">
                          /bet-slip/{savedPublicId}
                        </Link>
                      </div>
                    ) : (
                      <div className="text-slate-400">Saved to your private slips directory.</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
