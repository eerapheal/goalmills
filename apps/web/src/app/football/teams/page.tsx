import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { EntityService } from '@/lib/entityService';
import { ContentHubLayout } from '@/components/ContentHubLayout';
import { LiveNewsFlashTicker } from '@/components/LiveNewsFlashTicker';
import { FiShield, FiArrowRight, FiUsers, FiAward } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Football Clubs & Teams Directory | Stadiums, Squads & Managers | GoalMills',
  description:
    'Explore major football clubs across the Premier League, Champions League, La Liga, Serie A, and Bundesliga. View team rosters, managers, stadiums, and league positions.',
};

export default function FootballTeamsHubPage() {
  const clubs = EntityService.getAllClubs();

  return (
    <ContentHubLayout
      breadcrumbs={[
        { name: 'Football Hub', url: '/football' },
        { name: 'Clubs & Teams', url: '/football/teams' },
      ]}
      header={<LiveNewsFlashTicker sport="football" badgeText="CLUBS WIRE" />}
      sidebar={
        <div className="space-y-6">
          <div className="rounded-3xl border border-blue-500/25 bg-gradient-to-br from-[#0D1C33] to-[#070F1E] p-5 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-blue-400 font-black text-xs uppercase tracking-wider">
              <FiShield className="w-4 h-4" />
              <span>Club Directory</span>
            </div>
            <h4 className="text-sm font-black text-white">Elite European Football Clubs</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Explore tactical setups, squad lists, stadium specifications, and current league
              standings for the world’s top football powerhouses.
            </p>
          </div>

          <div className="rounded-3xl border border-blue-500/20 bg-[#0A162B] p-5 space-y-3 shadow-xl">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiAward className="text-amber-400" />
              <span>Managers & Tacticians</span>
            </h3>
            <p className="text-xs text-slate-300">
              Inspect tactical setups, formations, and win records for top head coaches.
            </p>
            <Link
              href="/football/coaches"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 font-bold text-xs uppercase tracking-wider transition-all"
            >
              <span>Explore Managers Hub</span>
              <FiArrowRight size={13} />
            </Link>
          </div>
        </div>
      }
    >
      <div className="space-y-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0B1728] via-[#0E1E38] to-[#070F1E] border border-blue-500/20 p-6 sm:p-8 shadow-2xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 font-black text-xs uppercase tracking-wider mb-4">
              <span>🛡️</span>
              <span>GLOBAL CLUB HUBS</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-3">
              Football Clubs, Squads & Stadiums
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Discover in-depth analytics, confirmed transfers, player ratings, and fixture calendars
              for premier football clubs across top leagues.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {clubs.map((club) => (
            <Link
              key={club.slug}
              href={`/football/teams/${club.slug}`}
              className="group rounded-2xl bg-gradient-to-b from-[#0C192E] to-[#07101E] border border-blue-500/20 hover:border-blue-400/40 p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-14 h-14 rounded-xl bg-slate-900 border border-white/10 p-2 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Image
                      src={club.logo}
                      alt={club.name}
                      width={44}
                      height={44}
                      className="object-contain max-h-full"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block truncate">
                      {club.competitionName}
                    </span>
                    <h3 className="text-base font-black text-white group-hover:text-blue-400 transition truncate">
                      {club.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold truncate">
                      Manager: {club.manager}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 bg-[#060D1A]/80 rounded-xl p-3 border border-white/5 mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Stadium:</span>
                    <span className="font-bold text-white truncate max-w-[180px]">
                      {club.stadium}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Founded:</span>
                    <span className="font-mono text-slate-200">{club.founded}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Table Position:</span>
                    <span className="font-bold text-emerald-400">#{club.position}</span>
                  </div>
                </div>
              </div>

              <div className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-200 hover:text-white font-bold text-xs uppercase tracking-wider border border-blue-500/30 transition-all">
                <span>View Club Hub</span>
                <FiArrowRight size={13} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </ContentHubLayout>
  );
}
