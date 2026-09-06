import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CompetitionLogo } from '@/components/competitions/CompetitionLogo';
import { ContentHubLayout } from '@/components/ContentHubLayout';
import { EntityService } from '@/lib/entityService';
import { FootballStandingsTable } from '@/components/FootballStandingsTable';
import { FootballTopScorers } from '@/components/FootballTopScorers';
import { advancedFootballApi } from '@/services/advancedFootballApi';
import { FiActivity, FiAward, FiBarChart2, FiGlobe, FiShield, FiTrendingUp, FiArrowRight } from 'react-icons/fi';
import { FootballStanding, FootballTopscorer } from '@goalmills/types';
import { LiveNewsFlashTicker } from '@/components/LiveNewsFlashTicker';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Football League Tables, Standings, Top Scorers & Golden Boot Stats | GoalMills',
  description:
    'Real-time football league tables, Premier League, Champions League, La Liga standings, Golden Boot top scorers, clean sheets, and club form records.',
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
      breadcrumbs={[{ name: 'Tables & Stats', url: '/stats' }]}
      header={
        <div className="space-y-4">
          {/* Live Stats Pulse Marquee */}
          <LiveNewsFlashTicker badgeText="TABLES & STATS WIRE" />

          {/* Hero Banner Card */}
          <div className="relative overflow-hidden rounded-3xl border border-blue-500/25 bg-gradient-to-br from-[#08142A] via-[#0B1E3E] to-[#060D18] p-6 sm:p-10 shadow-2xl shadow-blue-950/50">
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-96 h-64 bg-blue-600/15 blur-3xl pointer-events-none -z-0" />
            <div className="absolute bottom-0 left-1/3 w-80 h-48 bg-amber-500/10 blur-3xl pointer-events-none -z-0" />

            <div className="relative z-10 max-w-4xl space-y-4">
              {/* Level 1 Stats Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider shadow-sm">
                <FiBarChart2 className="text-amber-400" />
                <span>LEAGUE TABLES, STANDINGS & STATS</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                Standings & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300">Top Scorers Center</span>
              </h1>

              {/* Subtitle description */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
                Real-time league tables, top goalscorers, playmakers, clean sheets, expected goals (xG), and 5-match team form records across major world competitions.
              </p>

              {/* Quick Intelligence KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="p-3 rounded-2xl bg-[#091529]/80 border border-blue-500/20 backdrop-blur-md">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Competitions</span>
                  <span className="text-lg sm:text-xl font-black text-white">Top 5 Leagues</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#091529]/80 border border-blue-500/20 backdrop-blur-md">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Golden Boot</span>
                  <span className="text-lg sm:text-xl font-black text-amber-400">Live Goals</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#091529]/80 border border-blue-500/20 backdrop-blur-md">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Expected Goals</span>
                  <span className="text-lg sm:text-xl font-black text-emerald-400">xG Stats</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#091529]/80 border border-blue-500/20 backdrop-blur-md">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Form Guide</span>
                  <span className="text-lg sm:text-xl font-black text-sky-400">5-Match Form</span>
                </div>
              </div>

              {/* Quick League Selector Ribbon */}
              <div className="pt-3 border-t border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <FiGlobe className="text-amber-400 text-xs" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Featured Leagues & Tables:
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { name: 'Premier League', slug: 'premier-league', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
                    { name: 'Champions League', slug: 'champions-league', flag: '⭐' },
                    { name: 'La Liga', slug: 'la-liga', flag: '🇪🇸' },
                    { name: 'Serie A', slug: 'serie-a', flag: '🇮🇹' },
                    { name: 'Bundesliga', slug: 'bundesliga', flag: '🇩🇪' },
                    { name: 'Ligue 1', slug: 'ligue-1', flag: '🇫🇷' },
                  ].map((league) => (
                    <Link
                      key={league.slug}
                      href={`/football/${league.slug}`}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#091529]/80 hover:bg-blue-600/30 border border-blue-500/20 hover:border-amber-400/40 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-md group"
                    >
                      <span>{league.flag}</span>
                      <span className="group-hover:text-amber-300 transition-colors">{league.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      sidebar={
        <div className="space-y-6">
          {/* Major Competitions Navigator */}
          <div className="rounded-3xl border border-blue-500/20 bg-[#0A162B]/90 p-5 space-y-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiGlobe className="text-amber-400" />
                <span>Competition Tables</span>
              </h3>
              <span className="text-[10px] text-amber-400 font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                Standings
              </span>
            </div>
            <div className="space-y-2">
              {competitions.map((comp) => (
                <Link
                  key={comp.slug}
                  href={`/football/${comp.slug}`}
                  className="group flex items-center justify-between p-3 rounded-2xl bg-[#070F1E] hover:bg-blue-600/20 border border-blue-500/15 hover:border-amber-400/40 transition-all text-xs font-bold text-slate-200 hover:text-white shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-slate-900 border border-white/10 p-1 flex items-center justify-center">
                      <CompetitionLogo
                        src={comp.logo}
                        alt={comp.name}
                        size={20}
                      />
                    </div>
                    <span className="group-hover:text-amber-300 transition-colors">{comp.name}</span>
                  </div>
                  <span className="text-[11px] text-amber-400 font-bold group-hover:translate-x-1 transition-transform">
                    &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Clean Sheet / Defensive Radar Box */}
          <div className="rounded-3xl border border-blue-500/20 bg-[#0A162B]/90 p-5 space-y-3 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiShield className="text-blue-400" />
                <span>Golden Glove Clean Sheets</span>
              </h3>
              <span className="text-[10px] font-mono text-blue-300 font-bold">25/26</span>
            </div>
            <div className="space-y-2.5">
              {[
                { name: 'David Raya', team: 'Arsenal', cleanSheets: 14, saves: '82%' },
                { name: 'Thibaut Courtois', team: 'Real Madrid', cleanSheets: 13, saves: '80%' },
                { name: 'Alisson Becker', team: 'Liverpool', cleanSheets: 12, saves: '79%' },
              ].map((keeper, i) => (
                <div key={keeper.name} className="p-3 rounded-2xl bg-[#070F1E] border border-blue-500/15 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center text-xs font-black text-amber-400">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{keeper.name}</h4>
                      <p className="text-[10px] text-slate-400">{keeper.team}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-amber-400">{keeper.cleanSheets} CS</span>
                    <p className="text-[9px] text-slate-500">{keeper.saves} Save %</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      {/* Top Scorers Widget */}
      {eplScorers.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 text-base border border-amber-500/30">
                <FiAward />
              </span>
              <span>Premier League Golden Boot Race</span>
            </h2>
            <span className="text-[10px] font-mono text-amber-300 font-bold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              Top 10 Scorers
            </span>
          </div>
          <FootballTopScorers scorers={eplScorers} />
        </section>
      )}

      {/* League Table Widget */}
      {eplStandings.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-base shadow-md shadow-blue-600/30">
                <FiActivity />
              </span>
              <span>Premier League Standings & Form Guide</span>
            </h2>
            <span className="text-[10px] font-mono text-blue-300 font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Matchday 28
            </span>
          </div>
          <FootballStandingsTable standings={eplStandings} leagueId={152} />
        </section>
      )}
    </ContentHubLayout>
  );
}
