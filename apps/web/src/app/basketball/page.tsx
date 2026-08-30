import Link from 'next/link';
import { Metadata } from 'next';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import { ContentHubLayout } from '@/components/ContentHubLayout';
import { RelatedArticlesMatrix } from '@/components/RelatedArticlesMatrix';
import { BasketballScreen } from '@/components/BasketballScreen';
import { FiAward, FiUsers, FiTrendingUp, FiArrowRight, FiActivity, FiMail } from 'react-icons/fi';
import { BlogPost } from '@goalmills/types';
import { LiveNewsFlashTicker } from '@/components/LiveNewsFlashTicker';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'NBA Live Scores, Basketball Standings, EuroLeague & Box Scores | GoalMills',
  description:
    'Real-time NBA live scores, conference standings, EuroLeague results, Basketball Africa League (BAL) fixtures, player box scores, and game previews.',
};

const BASKETBALL_MAJOR_LEAGUES = [
  { name: 'NBA', slug: '12', type: 'North America' },
  { name: 'EuroLeague', slug: '120', type: 'European Elite' },
  { name: 'Basketball Africa League (BAL)', slug: 'bal', type: 'CAF Pan-African' },
  { name: 'Spanish Liga ACB', slug: '117', type: 'Spain' },
  { name: 'NCAA Division I', slug: '116', type: 'Collegiate' },
  { name: 'FIBA World Cup', slug: 'fiba', type: 'International' },
];

const FEATURED_BASKETBALL_TEAMS = [
  { name: 'Los Angeles Lakers', key: '145', role: '17x NBA Champions' },
  { name: 'Boston Celtics', key: '138', role: '18x NBA Champions' },
  { name: 'Golden State Warriors', key: '140', role: '7x NBA Champions' },
  { name: 'Real Madrid Baloncesto', key: 'madrid', role: '11x EuroLeague Kings' },
  { name: 'Panathinaikos', key: 'pana', role: '7x EuroLeague Champs' },
  { name: 'Al Ahly Basketball', key: 'alahly', role: 'BAL Contenders' },
];

export default async function BasketballHubPage() {
  let featuredArticles: BlogPost[] = [];

  try {
    await dbConnect();
    const allDocs = await News.find({
      $or: [
        { sportSlug: 'basketball' },
        { category: { $regex: /basketball|nba|euroleague|bal|fiba/i } },
      ],
    })
      .sort({ isBreaking: -1, views: -1, createdAt: -1 })
      .limit(6)
      .lean();

    featuredArticles = JSON.parse(JSON.stringify(allDocs));
  } catch (err) {
    console.error('Error loading basketball hub data:', err);
  }

  return (
    <ContentHubLayout
      breadcrumbs={[{ name: 'Basketball Hub', url: '/basketball' }]}
      header={
        <div className="space-y-4">
          {/* Live Basketball Dynamic Flash Ticker */}
          <LiveNewsFlashTicker sport="basketball" badgeText="HOOPS WIRE" />

          {/* Hero Banner Card */}
          <div className="relative overflow-hidden rounded-3xl border border-blue-500/25 bg-gradient-to-br from-[#08142A] via-[#0B1E3E] to-[#060D18] p-6 sm:p-10 shadow-2xl shadow-blue-950/50">
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-96 h-64 bg-blue-600/15 blur-3xl pointer-events-none -z-0" />
            <div className="absolute bottom-0 left-1/3 w-80 h-48 bg-amber-500/10 blur-3xl pointer-events-none -z-0" />

            <div className="relative z-10 max-w-4xl space-y-4">
              {/* Level 1 Sport Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider shadow-sm">
                <span className="text-amber-400">🏀</span>
                <span>NBA SCORES, BASKETBALL STANDINGS & NEWS</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                Global Basketball <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300">Live Scores & News</span>
              </h1>

              {/* Subtitle description */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
                Real-time quarter-by-quarter scorelines, NBA conference standings, EuroLeague fixtures, Basketball Africa League results, player stats, and match previews.
              </p>

              {/* Quick Intelligence KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="p-3 rounded-2xl bg-[#091529]/80 border border-blue-500/20 backdrop-blur-md">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Leagues</span>
                  <span className="text-lg sm:text-xl font-black text-white">NBA & Euro</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#091529]/80 border border-blue-500/20 backdrop-blur-md">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Live Quarters</span>
                  <span className="text-lg sm:text-xl font-black text-amber-400">Real-Time</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#091529]/80 border border-blue-500/20 backdrop-blur-md">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Standings</span>
                  <span className="text-lg sm:text-xl font-black text-emerald-400">Official</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#091529]/80 border border-blue-500/20 backdrop-blur-md">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Club Updates</span>
                  <span className="text-lg sm:text-xl font-black text-sky-400">Global Info</span>
                </div>
              </div>

              {/* Quick Tournaments Ribbon */}
              <div className="pt-3 border-t border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <FiAward className="text-amber-400 text-xs" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Major Basketball Leagues:
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {BASKETBALL_MAJOR_LEAGUES.map((league) => (
                    <Link
                      key={league.slug}
                      href={`/basketball/leagues/${league.slug}`}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#091529]/80 hover:bg-blue-600/30 border border-blue-500/20 hover:border-amber-400/40 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-md group"
                    >
                      <span className="text-amber-400">🏀</span>
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
          {/* Major Competitions Quick Navigator */}
          <div className="rounded-3xl border border-blue-500/20 bg-[#0A162B]/90 p-5 space-y-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiAward className="text-amber-400" />
                <span>Premier Leagues</span>
              </h3>
              <span className="text-[10px] text-amber-400 uppercase font-bold font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                Tier 1
              </span>
            </div>
            <div className="space-y-2">
              {BASKETBALL_MAJOR_LEAGUES.map((league) => (
                <Link
                  key={league.slug}
                  href={`/basketball/leagues/${league.slug}`}
                  className="group flex items-center justify-between p-3 rounded-2xl bg-[#070F1E] hover:bg-blue-600/20 border border-blue-500/15 hover:border-amber-400/40 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-amber-400 font-black text-xs group-hover:border-blue-400 transition-colors">
                      🏀
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        {league.name}
                      </h4>
                      <p className="text-[10px] text-slate-400">{league.type}</p>
                    </div>
                  </div>
                  <FiArrowRight
                    size={14}
                    className="text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Featured Franchises */}
          <div className="rounded-3xl border border-blue-500/20 bg-[#0A162B]/90 p-5 space-y-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiUsers className="text-blue-400" />
                <span>Elite Franchises & Clubs</span>
              </h3>
              <span className="text-[10px] text-blue-300 uppercase font-bold font-mono">
                Profiles
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {FEATURED_BASKETBALL_TEAMS.map((team) => (
                <Link
                  key={team.key}
                  href={`/basketball/teams/${team.key}`}
                  className="group flex flex-col items-center text-center p-3 rounded-2xl bg-[#070F1E] hover:bg-blue-600/20 border border-blue-500/15 hover:border-blue-400/40 transition-all"
                >
                  <div className="h-10 w-10 rounded-xl bg-slate-900 border border-white/10 p-1.5 mb-2 flex items-center justify-center font-black text-amber-400 text-sm group-hover:scale-105 transition-transform">
                    {team.name.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate max-w-full">
                    {team.name}
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold truncate max-w-full">
                    {team.role}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* VIP Basketball Newsletter Box */}
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#0E1E38] to-[#081224] p-5 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
              <FiMail className="w-4 h-4" />
              <span>Hoops Daily Brief</span>
            </div>
            <h4 className="text-sm font-black text-white">
              Get Daily Morning NBA Box Scores & Highlights
            </h4>
            <p className="text-xs text-slate-300">
              Complete game recaps and playoff race updates delivered before morning tipoff.
            </p>
            <Link
              href="/newsletter"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:from-amber-400 hover:to-orange-400 transition-all"
            >
              <span>Subscribe Now</span>
              <FiArrowRight size={13} />
            </Link>
          </div>
        </div>
      }
    >
      {/* Live Match Engine Section */}
      <section className="space-y-4">
        <BasketballScreen />
      </section>

      {/* Featured Articles Grid */}
      {featuredArticles.length > 0 && (
        <div className="pt-6 border-t border-white/10">
          <RelatedArticlesMatrix
            title="Top Basketball News & Game Reports"
            subtitle="Curated match reports, tournament forecasts, and player interviews"
            articles={featuredArticles}
          />
        </div>
      )}
    </ContentHubLayout>
  );
}
