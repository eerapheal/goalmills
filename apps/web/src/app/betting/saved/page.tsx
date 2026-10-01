'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { SavedBetSlip } from '@goalmills/types';
import { BetViewerCard } from '@/components/betting/BetViewerCard';

export default function SavedSlipsPage() {
  const [slips, setSlips] = useState<SavedBetSlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSlipId, setExpandedSlipId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSlips = async () => {
      try {
        const res = await fetch('/api/v1/betting/slips');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setSlips(json.data);
        }
      } catch (e) {
        console.error('Error fetching slips:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchSlips();
  }, []);

  const handleCopyLink = (publicId: string) => {
    const url = `${window.location.origin}/bet-slip/${publicId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(publicId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved slip?')) return;
    try {
      await fetch(`/api/v1/betting/slips/${id}`, { method: 'DELETE' });
      setSlips(slips.filter((s) => s.id !== id));
    } catch (e) {
      console.error('Error deleting slip:', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <Link href="/betting" className="hover:text-emerald-400">Betting Hub</Link>
          <span>/</span>
          <span className="text-white font-medium">Saved Slips</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>📁</span> My Saved Accumulator Slips
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Access your personal slips, manage public sharing, or reopen them in the Bet Editor.
            </p>
          </div>

          <Link
            href="/betting/editor"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-lg shadow-emerald-500/20"
          >
            + Create New Slip
          </Link>
        </div>

        {/* Slips List */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <span className="inline-block w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mr-2"></span>
            Loading your saved slips...
          </div>
        ) : slips.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-3xl mb-2">📋</div>
            <h3 className="font-bold text-white text-base">No Saved Bet Slips Yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Scan a booking code or create a custom accumulator in the Bet Editor to save your slips here.
            </p>
            <Link
              href="/betting/editor"
              className="inline-block mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
            >
              Open Bet Editor →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {slips.map((slip) => (
              <div
                key={slip.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 sm:p-5 transition-all shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {slip.sourceBookmaker}
                      </span>
                      {slip.isPublic && (
                        <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                          Public
                        </span>
                      )}
                      <span className="text-xs text-slate-500 font-mono">
                        {slip.legCount} {slip.legCount === 1 ? 'Leg' : 'Legs'}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-base mt-1">{slip.title}</h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Combined Odds: <span className="font-mono font-bold text-amber-400 text-sm">@{slip.totalOdds.toFixed(2)}</span>
                      {slip.potentialPayout && (
                        <span className="ml-2">
                          • Payout: <strong className="text-emerald-400 font-mono">€{slip.potentialPayout.toFixed(2)}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setExpandedSlipId(expandedSlipId === slip.id ? null : slip.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
                    >
                      {expandedSlipId === slip.id ? 'Hide Legs' : 'View Legs'}
                    </button>

                    {slip.isPublic && (
                      <button
                        onClick={() => handleCopyLink(slip.publicId)}
                        className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 text-xs font-bold border border-sky-500/30 transition-colors"
                      >
                        {copiedId === slip.publicId ? '✓ Copied!' : '🔗 Share Link'}
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(slip.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium border border-rose-500/20 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Expanded Legs Viewer */}
                {expandedSlipId === slip.id && (
                  <div className="mt-4 pt-4 border-t border-slate-800/80">
                    <BetViewerCard
                      slip={{
                        code: slip.originalCode || slip.publicId,
                        sourceBookmaker: slip.sourceBookmaker,
                        totalOdds: slip.totalOdds,
                        legCount: slip.legCount,
                        legs: slip.legs,
                        potentialPayout: slip.potentialPayout,
                        currency: slip.currency,
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
