import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { EntityService, CLUBS_REGISTRY } from '@/lib/entityService';
import { FootballScreen, MAJOR_LEAGUES } from '@/components/FootballScreen';
import { FootballDashboardPanel } from '@/components/football/FootballDashboardPanel';
import { FiActivity, FiArrowRight, FiAward, FiShield, FiUsers } from 'react-icons/fi';

export const revalidate = 3600;

export const metadata: Metadata = {
  title:
    'GoalMills Africa | Live Scores, CAF Champions League, NPFL, PSL & 2026/2027 Superstars Market Values',
  description:
    'Africa’s premier football intelligence platform for the 2026/2027 season. Live CAF Champions League, NPFL, Betway Premiership PSL, Botola Pro scores, AFCON 2027 qualifiers, and authentic real-time market values for Victor Osimhen, Mo Salah, Ademola Lookman, and Achraf Hakimi.',
  keywords: [
    'African football live scores',
    'CAF Champions League 2026/2027',
    'CAF Confederation Cup',
    'NPFL live scores Nigeria',
    'Betway Premiership South Africa PSL',
    'Botola Pro Morocco live',
    'Egyptian Premier League Al Ahly',
    'AFCON 2027 qualifiers',
    'Victor Osimhen transfer value 2026/2027',
    'Mohamed Salah Liverpool stats',
    'Ademola Lookman Atalanta',
    'Achraf Hakimi PSG',
    'African superstars in Europe',
    'GoalMills Africa',
  ],
  openGraph: {
    title: 'GoalMills Africa | Live Scores, CAF Competitions & Superstars (2026/2027)',
    description:
      'Live CAF Champions League, NPFL, PSL, AFCON 2027 qualifiers, and real-time market valuations for African football superstars.',
    siteName: 'GoalMills Africa',
    type: 'website',
  },
};

const competitionGroups = [
  {
    title: 'Africa (CAF)',
    icon: '🌍',
    leagues: ['AFCON', 'CAF CL', 'CAF Confederation Cup', 'NPFL — Nigeria'],
  },
  {
    title: 'Top European Leagues',
    icon: '⭐',
    leagues: ['Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1'],
  },
  {
    title: 'European Cups',
    icon: '🏆',
    leagues: ['Champions League', 'Europa League', 'Conference League'],
  },
];

export default function FootballHubPage() {
  const clubs = [...EntityService.getAfricanClubs(), ...Object.values(CLUBS_REGISTRY)].slice(0, 8);
  const liveCount = 2;

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100">
      <section className="relative isolate overflow-hidden border-b border-slate-800 bg-[#061326]">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_20%,rgba(37,99,235,.24),transparent_31%),radial-gradient(circle_at_82%_5%,rgba(14,165,233,.16),transparent_28%)]" />
        <div className="absolute inset-0 -z-10 opacity-[.12] [background-image:linear-gradient(rgba(148,163,184,.32)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.32)_1px,transparent_1px)] [background-size:34px_34px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-blue-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" /> GoalMills
                Football Centre
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
                Football, in real time.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Live scores, fixtures, tables, player stats and the stories shaping African and
                world football.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" /> {liveCount} live
              matches
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)_260px]">
          <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <FootballDashboardPanel
              title="Competition directory"
              action={
                <Link href="/football" className="text-[10px] font-bold text-blue-400">
                  All →
                </Link>
              }
            >
              <div className="divide-y divide-slate-800">
                {competitionGroups.map((group) => (
                  <details
                    key={group.title}
                    open={group.title === 'Africa (CAF)'}
                    className="group"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 hover:bg-slate-800/40">
                      <span className="flex items-center gap-2 text-xs font-bold text-slate-200">
                        <span>{group.icon}</span>
                        {group.title}
                      </span>
                      <span className="text-xs text-slate-500 transition-transform group-open:rotate-180">
                        ⌄
                      </span>
                    </summary>
                    <div className="border-t border-slate-800 bg-[#0a1120] py-1">
                      {group.leagues.map((league) => (
                        <Link
                          key={league}
                          href="/football"
                          className="flex items-center gap-2 px-5 py-2 text-[11px] text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
                        >
                          <span className="text-blue-400">•</span>
                          {league}
                        </Link>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </FootballDashboardPanel>
            <FootballDashboardPanel
              title="Featured club hubs"
              action={
                <Link href="/football/teams" className="text-[10px] font-bold text-blue-400">
                  All →
                </Link>
              }
            >
              <div className="grid grid-cols-2 gap-px bg-slate-800">
                {clubs.map((club) => (
                  <Link
                    key={club.slug}
                    href={`/football/teams/${club.slug}`}
                    className="group flex min-w-0 flex-col items-center bg-[#0f172a] px-2 py-3 text-center hover:bg-[#131f35]"
                  >
                    <span className="mb-1.5 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 p-1">
                      <Image
                        src={club.logo}
                        alt=""
                        width={28}
                        height={28}
                        className="h-7 w-7 object-contain"
                      />
                    </span>
                    <span className="w-full truncate text-[10px] font-bold text-slate-200 group-hover:text-white">
                      {club.shortName}
                    </span>
                    <span className="mt-0.5 text-[9px] text-slate-500">Hub →</span>
                  </Link>
                ))}
              </div>
            </FootballDashboardPanel>
          </aside>

          <section className="min-w-0">
            <FootballScreen />
          </section>

          <aside className="grid gap-4 sm:grid-cols-2 xl:sticky xl:top-24 xl:grid-cols-1 xl:self-start">
            <FootballDashboardPanel
              title="Live now"
              action={
                <span className="text-[10px] font-black text-red-400">{liveCount} matches</span>
              }
            >
              <div className="divide-y divide-slate-800">
                {[
                  ['Premier League', 'Man United', '1', 'Arsenal', '2', "78'"],
                  ['La Liga', 'Real Madrid', '1', 'Barcelona', '1', 'HT'],
                ].map(([league, home, homeScore, away, awayScore, time]) => (
                  <Link
                    key={league}
                    href="/football"
                    className="block px-4 py-3 hover:bg-slate-800/40"
                  >
                    <div className="mb-2 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      <span>{league}</span>
                      <span className="text-red-400">{time}</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>{home}</span>
                        <b>{homeScore}</b>
                      </div>
                      <div className="flex justify-between">
                        <span>{away}</span>
                        <b>{awayScore}</b>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </FootballDashboardPanel>
            <FootballDashboardPanel title="Quick links">
              <div className="divide-y divide-slate-800">
                {[
                  ['Top scorers', '/football/players', FiAward, 'Golden Boot race'],
                  ['Players', '/football/players', FiUsers, 'Profiles & statistics'],
                  ['Teams', '/football/teams', FiShield, 'Club hubs'],
                  ['Match officials', '/football/officials', FiActivity, 'VAR & referee desk'],
                ].map(([label, href, Icon, sub]) => {
                  const ItemIcon = Icon as typeof FiAward;
                  return (
                    <Link
                      key={label as string}
                      href={href as string}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/40"
                    >
                      <ItemIcon className="text-blue-400" size={15} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold text-slate-200">
                          {label as string}
                        </span>
                        <span className="block text-[10px] text-slate-500">{sub as string}</span>
                      </span>
                      <FiArrowRight className="text-slate-600" size={13} />
                    </Link>
                  );
                })}
              </div>
            </FootballDashboardPanel>
            <FootballDashboardPanel title="Major leagues">
              <div className="grid grid-cols-2 gap-px bg-slate-800">
                {MAJOR_LEAGUES.slice(1, 7).map((league) => (
                  <Link
                    key={league.id}
                    href="/football"
                    className="truncate bg-[#0f172a] px-3 py-2.5 text-[10px] font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    {league.flag} {league.name}
                  </Link>
                ))}
              </div>
            </FootballDashboardPanel>
          </aside>
        </div>
      </div>
    </main>
  );
}
