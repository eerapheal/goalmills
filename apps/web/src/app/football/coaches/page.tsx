import React from 'react';
import { Metadata } from 'next';
import { EntityService } from '@/lib/entityService';
import { ContentHubLayout } from '@/components/ContentHubLayout';
import { LiveNewsFlashTicker } from '@/components/LiveNewsFlashTicker';
import { CoachesHubClient } from '@/components/coaches/CoachesHubClient';
import Link from 'next/link';
import { FiUsers, FiAward, FiShield, FiArrowRight } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Football Managers & Head Coaches | Tactical Profiles & Honours | GoalMills',
  description:
    'Explore tactical formations, win rates, trophies, and managerial records for top football coaches across the Premier League, La Liga, Champions League, Serie A, and Bundesliga.',
};

export default function FootballCoachesHubPage() {
  const coaches = EntityService.getAllCoaches();
  const topCoaches = coaches.slice(0, 4);

  return (
    <ContentHubLayout
      breadcrumbs={[
        { name: 'Football Hub', url: '/football' },
        { name: 'Managers & Coaches', url: '/football/coaches' },
      ]}
      header={<LiveNewsFlashTicker sport="football" badgeText="MANAGERIAL WIRE" />}
      sidebar={
        <div className="space-y-6">
          {/* Tactical Philosophy Box */}
          <div className="rounded-3xl border border-blue-500/25 bg-gradient-to-br from-[#0D1C33] to-[#070F1E] p-5 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-blue-400 font-black text-xs uppercase tracking-wider">
              <FiShield className="w-4 h-4" />
              <span>Tactical Intelligence</span>
            </div>
            <h4 className="text-sm font-black text-white">
              The Systems Shaping Modern Football
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              From inverted fullbacks to aggressive rest-defense, modern tactical battles are won on
              the touchline. Discover comprehensive career records and silverware achievements for
              elite tacticians.
            </p>
          </div>

          {/* Featured Managers Quick List */}
          <div className="rounded-3xl border border-blue-500/20 bg-[#0A162B]/90 p-5 space-y-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiAward className="text-amber-400" />
                <span>Serial Champions</span>
              </h3>
            </div>
            <div className="space-y-3">
              {topCoaches.map((c) => (
                <Link
                  key={c.slug}
                  href={`/football/coaches/${c.slug}`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-blue-600/15 border border-white/5 hover:border-blue-500/30 transition group"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-blue-400 truncate block">
                      {c.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {c.currentClubName} • {c.winPercentage}% Win
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 shrink-0">
                    {c.trophiesCount} 🏆
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Cross-Link to Match Officials */}
          <div className="rounded-3xl border border-amber-500/25 bg-gradient-to-br from-[#09152B] to-[#070F1E] p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiUsers className="text-amber-400" />
                <span>Match Officials Desk</span>
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Inspect referee foul tolerances, cards per match, and VAR review accuracy across European football.
            </p>
            <Link
              href="/football/officials"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-xs uppercase tracking-wider border border-amber-500/30 transition-all"
            >
              <span>Explore Match Officials</span>
              <FiArrowRight size={13} />
            </Link>
          </div>
        </div>
      }
    >
      <CoachesHubClient initialCoaches={coaches} />
    </ContentHubLayout>
  );
}
