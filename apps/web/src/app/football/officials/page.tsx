import React from 'react';
import { Metadata } from 'next';
import { EntityService } from '@/lib/entityService';
import { ContentHubLayout } from '@/components/ContentHubLayout';
import { LiveNewsFlashTicker } from '@/components/LiveNewsFlashTicker';
import { OfficialsHubClient } from '@/components/officials/OfficialsHubClient';
import Link from 'next/link';
import { FiUsers, FiShield, FiTrendingUp, FiArrowRight } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Match Officials & Referees | Disciplinary Stats & VAR Analytics | GoalMills',
  description:
    'Track yellow & red cards per match, fouls called, penalty frequencies, and VAR intervention accuracy for top international football referees across the Premier League, Champions League, and World Cup.',
};

export default function FootballOfficialsHubPage() {
  const officials = EntityService.getAllOfficials();
  const topReferees = officials.slice(0, 4);

  return (
    <ContentHubLayout
      breadcrumbs={[
        { name: 'Football Hub', url: '/football' },
        { name: 'Match Officials', url: '/football/officials' },
      ]}
      header={<LiveNewsFlashTicker sport="football" badgeText="DISCIPLINARY WIRE" />}
      sidebar={
        <div className="space-y-6">
          {/* Quick Info Box */}
          <div className="rounded-3xl border border-amber-500/25 bg-gradient-to-br from-[#0D1C33] to-[#070F1E] p-5 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
              <FiShield className="w-4 h-4" />
              <span>Officiating Standards</span>
            </div>
            <h4 className="text-sm font-black text-white">
              Data-Driven Match Control Analysis
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every fixture outcome is shaped by the disciplinary style of the referee. Our
              database compiles card volumes, penalty awards, and VAR overturn rates across 15+
              years of elite competition.
            </p>
          </div>

          {/* Featured Referees */}
          <div className="rounded-3xl border border-blue-500/20 bg-[#0A162B]/90 p-5 space-y-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiUsers className="text-blue-400" />
                <span>Featured Officials</span>
              </h3>
            </div>
            <div className="space-y-3">
              {topReferees.map((ref) => (
                <Link
                  key={ref.slug}
                  href={`/football/officials/${ref.slug}`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 transition group"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-amber-400 truncate block">
                      {ref.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {ref.country} • {ref.matches} Matches
                    </span>
                  </div>
                  <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
                    {ref.yellowCardsPerGame} 🟨/G
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Link to Superstars */}
          <div className="rounded-3xl border border-blue-500/25 bg-gradient-to-br from-[#09152B] to-[#070F1E] p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiTrendingUp className="text-blue-400" />
                <span>Superstars & Players</span>
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Cross-reference referee disciplinary records with top footballers and team card accumulators.
            </p>
            <Link
              href="/football/players"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 font-bold text-xs uppercase tracking-wider transition-all"
            >
              <span>Explore Players Hub</span>
              <FiArrowRight size={13} />
            </Link>
          </div>
        </div>
      }
    >
      <OfficialsHubClient initialOfficials={officials} />
    </ContentHubLayout>
  );
}
