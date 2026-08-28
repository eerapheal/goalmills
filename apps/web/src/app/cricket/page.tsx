import Link from 'next/link';
import { Metadata } from 'next';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import { ContentHubLayout } from '@/components/ContentHubLayout';
import { RelatedArticlesMatrix } from '@/components/RelatedArticlesMatrix';
import { CricketScreen } from '@/components/CricketScreen';
import { FiAward, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { BlogPost } from '@goalmills/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Cricket World Hub: Live Scores, IPL, ICC World Cup & Rankings | GoalMills',
  description:
    'Complete cricket intelligence network: IPL, ICC World Cup, BBL, Test match commentary, T20 franchise leagues, team standings, player profiles, and tactical analysis.',
};

const CRICKET_MAJOR_TOURNAMENTS = [
  { name: 'IPL 2026', slug: '9785', type: 'Franchise T20' },
  { name: 'ICC Men’s T20 World Cup', slug: '9843', type: 'International' },
  { name: 'Big Bash League', slug: '9779', type: 'Franchise T20' },
  { name: 'ICC World Test Championship', slug: '9781', type: 'Test Cricket' },
  { name: 'Pakistan Super League', slug: '9780', type: 'Franchise T20' },
  { name: 'The Hundred', slug: '9782', type: '100-Ball' },
];

const FEATURED_CRICKET_TEAMS = [
  { name: 'India', key: '1', role: 'ICC Top 3' },
  { name: 'Australia', key: '2', role: 'World Champions' },
  { name: 'England', key: '3', role: 'White-ball Giants' },
  { name: 'Chennai Super Kings', key: '4', role: '5x IPL Champions' },
  { name: 'Mumbai Indians', key: '5', role: '5x IPL Champions' },
  { name: 'Royal Challengers Bengaluru', key: '6', role: 'IPL Contenders' },
];

export default async function CricketHubPage() {
  let featuredArticles: BlogPost[] = [];

  try {
    await dbConnect();
    const allDocs = await News.find({
      $or: [
        { sportSlug: 'cricket' },
        { category: { $regex: /cricket|ipl|icc|bbl|t20|test match/i } },
      ],
    })
      .sort({ isBreaking: -1, views: -1, createdAt: -1 })
      .limit(6)
      .lean();

    featuredArticles = JSON.parse(JSON.stringify(allDocs));
  } catch (err) {
    console.error('Error loading cricket hub data:', err);
  }

  return (
    <ContentHubLayout
      breadcrumbs={[{ name: 'Cricket Hub', url: '/cricket' }]}
      header={
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#1c1503] via-[#151004] to-[#040813] p-6 sm:p-10 shadow-2xl">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-black uppercase tracking-widest">
              <span>🏏</span> MULTI-SPORT CRICKET DESK
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Global Cricket Intelligence Network
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Real-time ball-by-ball commentary, franchise tournament scorecards, ICC world
              leaderboards, player statistical career records, and tactical cricket analysis.
            </p>

            {/* Quick Competitions Ribbon */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {CRICKET_MAJOR_TOURNAMENTS.map((tourn) => (
                <Link
                  key={tourn.slug}
                  href={`/cricket/series/${tourn.slug}`}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-amber-600/20 border border-white/10 hover:border-amber-500/40 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-md"
                >
                  <span className="text-amber-400">🏏</span>
                  <span>{tourn.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      }
      sidebar={
        <div className="space-y-6">
          {/* Competitions Quick Navigator */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiAward className="text-amber-400" />
                <span>Premier Competitions</span>
              </h3>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Series</span>
            </div>
            <div className="space-y-2">
              {CRICKET_MAJOR_TOURNAMENTS.map((tourn) => (
                <Link
                  key={tourn.slug}
                  href={`/cricket/series/${tourn.slug}`}
                  className="group flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] hover:bg-amber-600/20 border border-white/5 hover:border-amber-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-amber-400 font-black text-xs">
                      🏏
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                        {tourn.name}
                      </h4>
                      <p className="text-[10px] text-slate-400">{tourn.type}</p>
                    </div>
                  </div>
                  <span className="text-xs text-amber-400 font-bold group-hover:translate-x-1 transition-transform">
                    &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Featured Teams */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiUsers className="text-blue-400" />
                <span>Elite Teams & Clubs</span>
              </h3>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Profiles</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {FEATURED_CRICKET_TEAMS.map((team) => (
                <Link
                  key={team.key}
                  href={`/cricket/teams/${team.key}`}
                  className="group flex flex-col items-center text-center p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-amber-500/30 transition-all"
                >
                  <div className="h-10 w-10 rounded-xl bg-slate-900 p-1.5 mb-2 flex items-center justify-center font-black text-amber-400 text-sm">
                    {team.name.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate max-w-full">
                    {team.name}
                  </span>
                  <span className="text-[9px] text-slate-500 font-semibold">{team.role}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* ICC Rankings Shortcut */}
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-amber-500/10 to-transparent p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiTrendingUp className="text-amber-400" />
                <span>ICC World Rankings</span>
              </h3>
              <Link
                href="/cricket/rankings"
                className="text-xs font-bold text-amber-400 hover:underline"
              >
                View All &rarr;
              </Link>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Official Test, ODI, and T20I rankings for teams, batsmen, bowlers, and all-rounders.
            </p>
          </div>
        </div>
      }
    >
      {/* Live Match Engine Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-600/30 text-amber-400 text-sm">
              ⚡
            </span>
            <span>Live Match Center & Ball-by-Ball Fixtures</span>
          </h2>
        </div>
        <CricketScreen />
      </section>

      {/* Featured Intelligence Grid */}
      {featuredArticles.length > 0 && (
        <RelatedArticlesMatrix
          title="Top Cricket Intelligence & Analysis"
          subtitle="Curated match reports, tournament forecasts, and tactical breakdowns"
          articles={featuredArticles}
        />
      )}
    </ContentHubLayout>
  );
}
