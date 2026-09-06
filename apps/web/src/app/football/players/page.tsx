import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { EntityService, CLUBS_REGISTRY } from '@/lib/entityService';
import { ContentHubLayout } from '@/components/ContentHubLayout';
import { TransferCenterCard } from '@/components/TransferCenterCard';
import { LiveNewsFlashTicker } from '@/components/LiveNewsFlashTicker';
import { PlayersHubClient } from '@/components/players/PlayersHubClient';
import { FiTrendingUp, FiShield, FiMail, FiArrowRight } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'World Football Stars, Scouting Stats, Market Values & Ratings | GoalMills',
  description:
    'Explore in-depth football player profiles, tactical scouting statistics, 2025/2026 goal and assist leaderboards, verified market values, and head-to-head comparison intel on GoalMills.',
  openGraph: {
    title: 'World Football Stars, Scouting Stats & Ratings | GoalMills',
    description:
      'Explore in-depth player statistics, market values, and tactical comparison on GoalMills.',
    siteName: 'GoalMills',
    type: 'website',
  },
};

export default async function FootballPlayersHubPage() {
  const players = EntityService.getAllPlayers();
  const topTransfers = EntityService.getTransfers().slice(0, 3);
  const featuredClubs = Object.values(CLUBS_REGISTRY).slice(0, 8);

  return (
    <ContentHubLayout
      breadcrumbs={[
        { name: 'Football', url: '/football' },
        { name: 'Players Hub', url: '/football/players' },
      ]}
      header={
        <LiveNewsFlashTicker
          sport="football"
          badgeText="PLAYER INTEL"
        />
      }
      sidebar={
        <div className="space-y-6">
          {/* Trending Transfers Desk */}
          <div className="rounded-3xl border border-blue-500/20 bg-[#0A162B]/90 p-5 space-y-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiTrendingUp className="text-amber-400" />
                <span>Player Transfers</span>
              </h3>
              <Link
                href="/transfers"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {topTransfers.map((t) => (
                <TransferCenterCard key={t.id} transfer={t} />
              ))}
            </div>
          </div>

          {/* Featured Clubs */}
          <div className="rounded-3xl border border-blue-500/20 bg-[#0A162B]/90 p-5 space-y-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiShield className="text-blue-400" />
                <span>Featured Club Hubs</span>
              </h3>
              <span className="text-[10px] text-blue-300 uppercase font-bold font-mono">
                Clubs
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {featuredClubs.map((club) => (
                <Link
                  key={club.slug}
                  href={`/football/teams/${club.slug}`}
                  className="group flex flex-col items-center text-center p-3 rounded-2xl bg-[#070F1E] hover:bg-blue-600/20 border border-blue-500/15 hover:border-blue-400/40 transition-all"
                >
                  <div className="relative h-10 w-10 rounded-xl bg-slate-900 border border-white/10 p-1.5 mb-2 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Image
                      src={club.logo}
                      alt={club.name}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate max-w-full">
                    {club.shortName}
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold truncate max-w-full">
                    {club.manager}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter Box */}
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#0E1E38] to-[#081224] p-5 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
              <FiMail className="w-4 h-4" />
              <span>Scouting Digest</span>
            </div>
            <h4 className="text-sm font-black text-white">
              Get Weekly Tactical Scouting Intel & Player Form Analysis
            </h4>
            <p className="text-xs text-slate-300">
              In-depth performance metrics delivered straight to your inbox. Free forever.
            </p>
            <Link
              href="/newsletter"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:from-amber-400 hover:to-orange-400 transition-all"
            >
              <span>Subscribe to Intel</span>
              <FiArrowRight size={13} />
            </Link>
          </div>
        </div>
      }
    >
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Football Superstars & Players Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Official 2025/2026 performance ratings, season goals, assist metrics, market values, and head-to-head scouting comparison across top leagues.
          </p>
        </div>

        <PlayersHubClient initialPlayers={players} />
      </section>
    </ContentHubLayout>
  );
}
