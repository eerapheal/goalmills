import Link from 'next/link';
import { Metadata } from 'next';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import { ContentHubLayout } from '@/components/ContentHubLayout';
import { RelatedArticlesMatrix } from '@/components/RelatedArticlesMatrix';
import { CricketScreen } from '@/components/CricketScreen';
import { FiAward, FiUsers, FiTrendingUp, FiArrowRight, FiActivity, FiMail } from 'react-icons/fi';
import { BlogPost } from '@goalmills/types';

import { LiveNewsFlashTicker } from '@/components/LiveNewsFlashTicker';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Live Cricket Scores, IPL 2026, ICC World Cup, Fixtures & ICC Rankings | GoalMills',
  description:
    'Real-time live cricket scores, ball-by-ball commentary, IPL 2026 points table, ICC Men’s World Cup fixtures, Test match updates, and official team rankings.',
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
        <div className="space-y-4">
          {/* Live Cricket Dynamic Flash Ticker */}
          <LiveNewsFlashTicker sport="cricket" badgeText="CRICKET WIRE" />

          {/* Hero Banner Card */}
          <div className="relative overflow-hidden rounded-3xl border border-blue-500/25 bg-gradient-to-br from-[#08142A] via-[#0B1E3E] to-[#060D18] p-6 sm:p-10 shadow-2xl shadow-blue-950/50">
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-96 h-64 bg-blue-600/15 blur-3xl pointer-events-none -z-0" />
            <div className="absolute bottom-0 left-1/3 w-80 h-48 bg-amber-500/10 blur-3xl pointer-events-none -z-0" />

            <div className="relative z-10 max-w-4xl space-y-4">
              {/* Level 1 Sport Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider shadow-sm">
                <span className="text-amber-400">🏏</span>
                <span>LIVE CRICKET SCORES & MATCH REPORTS</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                Global Cricket <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300">Live Scores & News</span>
              </h1>

              {/* Subtitle description */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
                Real-time ball-by-ball commentary, franchise tournament scorecards, official ICC team rankings, points tables, player career stats, and match previews.
              </p>

              {/* Quick Intelligence KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="p-3 rounded-2xl bg-[#091529]/80 border border-blue-500/20 backdrop-blur-md">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Tournaments</span>
                  <span className="text-lg sm:text-xl font-black text-white">IPL & ICC</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#091529]/80 border border-blue-500/20 backdrop-blur-md">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Ball-by-Ball</span>
                  <span className="text-lg sm:text-xl font-black text-amber-400">Live Overs</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#091529]/80 border border-blue-500/20 backdrop-blur-md">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">ICC Rankings</span>
                  <span className="text-lg sm:text-xl font-black text-emerald-400">Official</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#091529]/80 border border-blue-500/20 backdrop-blur-md">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">T20 Leagues</span>
                  <span className="text-lg sm:text-xl font-black text-sky-400">Global Updates</span>
                </div>
              </div>

              {/* Quick Tournaments Ribbon */}
              <div className="pt-3 border-t border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <FiAward className="text-amber-400 text-xs" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Major Series & Tournaments:
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {CRICKET_MAJOR_TOURNAMENTS.map((tourn) => (
                    <Link
                      key={tourn.slug}
                      href={`/cricket/series/${tourn.slug}`}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#091529]/80 hover:bg-blue-600/30 border border-blue-500/20 hover:border-amber-400/40 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-md group"
                    >
                      <span className="text-amber-400">🏏</span>
                      <span className="group-hover:text-amber-300 transition-colors">{tourn.name}</span>
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
                <span>Premier Competitions</span>
              </h3>
              <span className="text-[10px] text-amber-400 uppercase font-bold font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                Series
              </span>
            </div>
            <div className="space-y-2">
              {CRICKET_MAJOR_TOURNAMENTS.map((tourn) => (
                <Link
                  key={tourn.slug}
                  href={`/cricket/series/${tourn.slug}`}
                  className="group flex items-center justify-between p-3 rounded-2xl bg-[#070F1E] hover:bg-blue-600/20 border border-blue-500/15 hover:border-amber-400/40 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-amber-400 font-black text-xs group-hover:border-blue-400 transition-colors">
                      🏏
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        {tourn.name}
                      </h4>
                      <p className="text-[10px] text-slate-400">{tourn.type}</p>
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

          {/* Featured Teams */}
          <div className="rounded-3xl border border-blue-500/20 bg-[#0A162B]/90 p-5 space-y-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiUsers className="text-blue-400" />
                <span>Elite Teams & Clubs</span>
              </h3>
              <span className="text-[10px] text-blue-300 uppercase font-bold font-mono">
                Rosters
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {FEATURED_CRICKET_TEAMS.map((team) => (
                <Link
                  key={team.key}
                  href={`/cricket/teams/${team.key}`}
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

          {/* ICC Rankings Spotlight */}
          <div className="rounded-3xl border border-blue-500/20 bg-[#0A162B]/90 p-5 space-y-3 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiTrendingUp className="text-amber-400" />
                <span>ICC World Rankings</span>
              </h3>
              <span className="text-[10px] font-mono text-amber-300 font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                Official
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Official Test, ODI, and T20I rankings for teams, batsmen, bowlers, and all-rounders.
            </p>
          </div>

          {/* VIP Cricket Newsletter Box */}
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#0E1E38] to-[#081224] p-5 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
              <FiMail className="w-4 h-4" />
              <span>Cricket Daily Brief</span>
            </div>
            <h4 className="text-sm font-black text-white">
              Get Daily Match Previews & Toss Flashes
            </h4>
            <p className="text-xs text-slate-300">
              Tournament predictions and player analytics delivered before toss.
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
        <CricketScreen />
      </section>

      {/* Featured Intelligence Grid */}
      {featuredArticles.length > 0 && (
        <div className="pt-6 border-t border-white/10">
          <RelatedArticlesMatrix
            title="Top Cricket News & Match Reports"
            subtitle="Curated match reports, tournament forecasts, and player interviews"
            articles={featuredArticles}
          />
        </div>
      )}
    </ContentHubLayout>
  );
}
