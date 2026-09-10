import Link from 'next/link';
import { Metadata } from 'next';
import { ContentHubLayout } from '@/components/ContentHubLayout';
import { CricketScreen } from '@/components/CricketScreen';
import { FiAward, FiUsers, FiTrendingUp, FiArrowRight, FiMail } from 'react-icons/fi';
import { cricketRoutes } from '@/lib/slugUtils';
import { LiveNewsFlashTicker } from '@/components/LiveNewsFlashTicker';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Live Cricket Scores, IPL 2026, ICC World Cup, Fixtures & Points Tables | GoalMills',
  description:
    'Real-time live cricket scores, ball-by-ball commentary, IPL 2026 points table, ICC Men’s World Cup fixtures, Test match updates, and team standings on GoalMills.',
  keywords: [
    'Cricket live scores',
    'IPL 2026/2027 live',
    'ICC World Cup fixtures',
    'T20 World Cup live',
    'Cricket points table',
    'Test championship live',
    'Big Bash League scores',
    'GoalMills Cricket',
  ],
  openGraph: {
    title: 'GoalMills Cricket | Live Scores, IPL, ICC Fixtures & Standings',
    description:
      'Real-time cricket live scores, ball-by-ball updates, IPL points table, ICC fixtures, and team standings.',
    siteName: 'GoalMills Cricket',
    type: 'website',
  },
};

const CRICKET_MAJOR_TOURNAMENTS = [
  { name: 'IPL 2026', slug: 'ipl-2026-9785', type: 'Franchise T20' },
  { name: 'ICC Men’s T20 World Cup', slug: 'icc-mens-t20-world-cup-9843', type: 'International' },
  { name: 'Big Bash League', slug: 'big-bash-league-9779', type: 'Franchise T20' },
  { name: 'ICC World Test Championship', slug: 'icc-world-test-championship-9781', type: 'Test Cricket' },
  { name: 'Pakistan Super League', slug: 'pakistan-super-league-9780', type: 'Franchise T20' },
  { name: 'The Hundred', slug: 'the-hundred-9782', type: '100-Ball' },
];

const FEATURED_CRICKET_TEAMS = [
  { name: 'India', key: 'india-1', role: 'ICC Top 3' },
  { name: 'Australia', key: 'australia-2', role: 'World Champions' },
  { name: 'England', key: 'england-3', role: 'White-ball Giants' },
  { name: 'Chennai Super Kings', key: 'chennai-super-kings-4', role: '5x IPL Champions' },
  { name: 'Mumbai Indians', key: 'mumbai-indians-5', role: '5x IPL Champions' },
  { name: 'Royal Challengers Bengaluru', key: 'royal-challengers-bengaluru-6', role: 'IPL Contenders' },
];

export default function CricketHubPage() {
  return (
    <ContentHubLayout
      breadcrumbs={[{ name: 'Cricket Hub', url: '/cricket' }]}
      header={
        <></>
      }
      sidebar={
        <div className="space-y-6">
          {/* Major Competitions Quick Navigator */}
          <div className="rounded-3xl border border-blue-500/20 bg-[#0A162B]/90 p-5 space-y-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiAward className="text-emerald-400" />
                <span>Premier Competitions</span>
              </h3>
              <span className="text-[10px] text-emerald-400 uppercase font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                Series
              </span>
            </div>
            <div className="space-y-2">
              {CRICKET_MAJOR_TOURNAMENTS.map((tourn) => (
                <Link
                  key={tourn.slug}
                  href={cricketRoutes.league(tourn.slug)}
                  className="group flex items-center justify-between p-3 rounded-2xl bg-[#070F1E] hover:bg-emerald-600/20 border border-blue-500/15 hover:border-emerald-400/40 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-emerald-400 font-black text-xs group-hover:border-emerald-400 transition-colors">
                      🏏
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {tourn.name}
                      </h4>
                      <p className="text-[10px] text-slate-400">{tourn.type}</p>
                    </div>
                  </div>
                  <FiArrowRight
                    size={14}
                    className="text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-transform"
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
                  href={cricketRoutes.team(team.key)}
                  className="group flex flex-col items-center text-center p-3 rounded-2xl bg-[#070F1E] hover:bg-blue-600/20 border border-blue-500/15 hover:border-blue-400/40 transition-all"
                >
                  <div className="h-10 w-10 rounded-xl bg-slate-900 border border-white/10 p-1.5 mb-2 flex items-center justify-center font-black text-emerald-400 text-sm group-hover:scale-105 transition-transform">
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

          {/* VIP Cricket Newsletter Box */}
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-[#0E282A] to-[#081224] p-5 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider">
              <FiMail className="w-4 h-4" />
              <span>Cricket Daily Brief</span>
            </div>
            <h4 className="text-sm font-black text-white">
              Get Daily Match Previews & Toss Flashes
            </h4>
            <p className="text-xs text-slate-300">
              Tournament predictions, pitch reports, and squad lineups delivered before toss.
            </p>
            <Link
              href="/newsletter"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:from-emerald-400 hover:to-teal-400 transition-all"
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
    </ContentHubLayout>
  );
}
