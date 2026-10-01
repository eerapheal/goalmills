import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPublicBetSlip } from '@/lib/betting/betSlipSaverService';
import { BetViewerCard } from '@/components/betting/BetViewerCard';
import { buildSecureAffiliateRedirectUrl } from '@/lib/betting/affiliateEngine';

interface Props {
  params: Promise<{ publicId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { publicId } = await params;
  const slip = await getPublicBetSlip(publicId);

  if (!slip) {
    return {
      title: 'Bet Slip Not Found | GoalMills',
      description: 'The requested bet slip is private or does not exist.',
    };
  }

  return {
    title: `${slip.title} (@${slip.totalOdds.toFixed(2)}) | GoalMills Betting Intelligence`,
    description: `Shared Accumulator Slip with ${slip.legCount} legs. Combined odds: @${slip.totalOdds.toFixed(2)} on GoalMills.`,
    openGraph: {
      title: `${slip.title} (@${slip.totalOdds.toFixed(2)}) | GoalMills`,
      description: `View and compare this ${slip.legCount}-leg accumulator on GoalMills.`,
    },
  };
}

export default async function PublicBetSlipPage({ params }: Props) {
  const { publicId } = await params;
  const slip = await getPublicBetSlip(publicId);

  if (!slip) {
    notFound();
  }

  const affiliateUrl = buildSecureAffiliateRedirectUrl({
    bookmakerId: slip.sourceBookmaker,
    placement: 'public_slip_share',
    campaign: 'social_slip_view',
  });

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header Badge */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                Shared Ticket
              </span>
              <span className="text-xs text-slate-500 font-mono">ID: {slip.publicId}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {slip.title}
            </h1>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400">Total Odds</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              @{slip.totalOdds.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Bet Viewer Card */}
        <div className="mb-6">
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

        {/* Conversion & Action CTAs */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-white text-base">Want to compare or modify this slip?</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Scan this ticket across 10+ licensed bookmakers to find higher combined odds or trim risky legs.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/betting/scanner?code=${slip.originalCode || slip.publicId}&bm=${slip.sourceBookmaker}`}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs border border-slate-700 transition-colors"
            >
              🔍 Scan Across Bookmakers
            </Link>
            <a
              href={affiliateUrl}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-lg shadow-emerald-500/20"
            >
              BET NOW AT {slip.sourceBookmaker.toUpperCase()} →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
