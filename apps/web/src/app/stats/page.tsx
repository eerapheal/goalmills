import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ContentHubLayout } from '@/components/ContentHubLayout';
import { EntityService, COMPETITIONS_REGISTRY } from '@/lib/entityService';
import { FootballStandingsTable } from '@/components/FootballStandingsTable';
import { FootballTopScorers } from '@/components/FootballTopScorers';
import { advancedFootballApi } from '@/services/advancedFootballApi';
import { FiActivity, FiAward, FiBarChart2, FiGlobe } from 'react-icons/fi';
import { FootballStanding, FootballTopscorer } from '@goalmills/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Statistics Engine: Top Scorers, Assists, Clean Sheets & Tables | GoalMills',
  description:
    'Comprehensive sports statistics product area. Multi-league standings, top goalscorers, playmakers, and statistical metrics across world football.',
};

export default async function StatsHubPage() {
  const competitions = EntityService.getAllCompetitions();

  // Load premier league (152) and champions league (300) stats by default
  let eplStandings: FootballStanding[] = [];
  let eplScorers: FootballTopscorer[] = [];

  try {
    const [standingsRes, scorersRes] = await Promise.all([
      advancedFootballApi.getStandings(152).catch(() => ({ success: 0, result: { total: [] } })),
      advancedFootballApi.getTopscorers(152).catch(() => ({ success: 0, result: [] })),
    ]);

    if (standingsRes?.result?.total && Array.isArray(standingsRes.result.total)) {
      eplStandings = standingsRes.result.total;
    }
    if (scorersRes?.result && Array.isArray(scorersRes.result)) {
      eplScorers = scorersRes.result.slice(0, 10);
    }
  } catch (err) {
    console.error('Error fetching stats hub data:', err);
  }

  return (
    <ContentHubLayout
      breadcrumbs={[{ name: 'Statistics Engine', url: '/stats' }]}
      header={
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#0b1736] via-[#071026] to-[#040813] p-6 sm:p-10 shadow-2xl">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-black uppercase tracking-widest">
              <FiBarChart2 /> SPORTS STATISTICS ENGINE
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              GoalMills Statistics & Record Center
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Real-time tables, top goalscorers, playmakers, clean sheets, and head-to-head records
              powered by our centralized sports database.
            </p>
          </div>
        </div>
      }
      sidebar={
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiGlobe className="text-blue-400" />
              <span>Competition Stats Hubs</span>
            </h3>
            <div className="space-y-2">
              {competitions.map((comp) => (
                <Link
                  key={comp.slug}
                  href={`/football/${comp.slug}`}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/30 transition-all text-xs font-bold text-slate-200 hover:text-white"
                >
                  <div className="flex items-center gap-2.5">
                    <Image
                      src={comp.logo}
                      alt={comp.name}
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                    <span>{comp.name}</span>
                  </div>
                  <span className="text-[10px] text-blue-400">View Table →</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      }
    >
      {/* Top Scorers Widget */}
      {eplScorers.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-600/30 text-amber-400 text-sm">
                <FiAward />
              </span>
              <span>Premier League Top Scorers</span>
            </h2>
          </div>
          <FootballTopScorers scorers={eplScorers} />
        </section>
      )}

      {/* League Table Widget */}
      {eplStandings.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600/30 text-blue-400 text-sm">
                <FiActivity />
              </span>
              <span>Premier League Standings</span>
            </h2>
          </div>
          <FootballStandingsTable standings={eplStandings} leagueId={152} />
        </section>
      )}
    </ContentHubLayout>
  );
}
