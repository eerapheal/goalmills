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
import { basketballRoutes } from '@/lib/slugUtils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'NBA Live Scores, Basketball Standings, EuroLeague & Box Scores | GoalMills',
  description:
    'Real-time NBA live scores, quarter-by-quarter box scores, conference standings, EuroLeague fixtures, team rosters, and game previews on GoalMills.',
  keywords: [
    'NBA live scores',
    'Basketball live scores',
    'NBA standings 2026',
    'EuroLeague basketball results',
    'Quarter box score basketball',
    'Liga ACB basketball',
    'Lakers vs Warriors live',
    'GoalMills Basketball',
  ],
  openGraph: {
    title: 'GoalMills Basketball | Live Scores, Standings & Quarter Box Scores',
    description:
      'Real-time NBA live scores, conference standings, EuroLeague fixtures, and comprehensive box scores.',
    siteName: 'GoalMills Basketball',
    type: 'website',
  },
};

const BASKETBALL_MAJOR_LEAGUES = [
  { name: 'NBA', slug: 'nba-766', type: 'North America' },
  { name: 'EuroLeague', slug: 'euroleague-787', type: 'European Elite' },
  { name: 'Spanish Liga ACB', slug: 'liga-acb-782', type: 'Spain' },
  { name: 'NCAA Basketball', slug: 'ncaa-812', type: 'Collegiate' },
  { name: 'Lega Basket Serie A', slug: 'serie-a-772', type: 'Italy' },
  { name: 'BBL Germany', slug: 'bbl-779', type: 'Germany' },
];

const FEATURED_BASKETBALL_TEAMS = [
  { name: 'Los Angeles Lakers', key: 'los-angeles-lakers-1', role: '17x NBA Champions' },
  { name: 'Boston Celtics', key: 'boston-celtics-7', role: '18x NBA Champions' },
  { name: 'Golden State Warriors', key: 'golden-state-warriors-20', role: '7x NBA Champions' },
  { name: 'Brooklyn Nets', key: 'brooklyn-nets-2', role: 'Eastern Conference' },
  { name: 'Toronto Raptors', key: 'toronto-raptors-3', role: '2019 NBA Champions' },
  { name: 'Philadelphia 76ers', key: 'philadelphia-76ers-4', role: 'Eastern Contenders' },
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
        <></>
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
                  href={basketballRoutes.league(league.slug)}
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
                  href={basketballRoutes.team(team.key)}
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
