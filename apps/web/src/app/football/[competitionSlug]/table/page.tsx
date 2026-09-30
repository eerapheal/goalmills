import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import { EntityService, CompetitionMeta } from '@/lib/entityService';
import { ContentHubLayout } from '@/components/ContentHubLayout';
import { FootballStandingsTable } from '@/components/FootballStandingsTable';
import { GroupStandingsView } from '@/components/football/GroupStandingsView';
import { TournamentBracketView } from '@/components/football/TournamentBracketView';
import { CompetitionLogo } from '@/components/competitions/CompetitionLogo';
import { LiveNewsFlashTicker } from '@/components/LiveNewsFlashTicker';
import { advancedFootballApi } from '@/services/advancedFootballApi';
import { ALL_COMPETITIONS } from '@/lib/competitionCategories';
import {
  getCanonicalCompetition,
  generateCompetitionJsonLd,
  generateBreadcrumbJsonLd,
  getCompetitionFormat,
  getStandingsRulesetForCompetition,
  separateProviderStandingsByGroup,
  buildTournamentBracket,
} from '@/lib/football';
import { FiGlobe, FiShield, FiAward, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { FootballStanding } from '@goalmills/types';

export const dynamic = 'force-dynamic';

function resolveCompetition(slug: string): {
  comp: CompetitionMeta | null;
  canonicalComp: ReturnType<typeof getCanonicalCompetition> | null;
} {
  const canonicalComp = getCanonicalCompetition(slug);
  const legacyComp = EntityService.getCompetition(slug);

  if (legacyComp) {
    return { comp: legacyComp, canonicalComp: canonicalComp || null };
  }

  if (canonicalComp) {
    const adapted: CompetitionMeta = {
      id: canonicalComp.providerId || 0,
      name: canonicalComp.name,
      slug: canonicalComp.slug,
      country: canonicalComp.countryName || canonicalComp.confederationCode,
      logo: canonicalComp.logoUrl || '/icon.png',
      season: canonicalComp.season || '2026/2027',
      featured: canonicalComp.isFeatured ?? true,
      tier: canonicalComp.tier,
      description: `${canonicalComp.name} Standings Table, Goal Difference, Form Records and Live Tournament Structure.`,
    };
    return { comp: adapted, canonicalComp };
  }

  return { comp: null, canonicalComp: null };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ competitionSlug: string }>;
}): Promise<Metadata> {
  const { competitionSlug } = await params;
  const { comp } = resolveCompetition(competitionSlug);

  if (!comp) return { title: 'Competition Table | GoalMills' };

  return {
    title: `${comp.name} Table & Standings 2026/2027 | Live Form, GD & Rules | GoalMills`,
    description: `Official ${comp.name} 2026/2027 league table, live standings, form guide, goal difference, promotion/relegation zones, and tournament rules on GoalMills.`,
    alternates: {
      canonical: `https://goalmills.com/football/${comp.slug}/table`,
    },
    openGraph: {
      title: `${comp.name} Standings Table 2026/2027 | GoalMills`,
      description: `Complete ${comp.name} standings table, points, GD, recent 5-match form, and European/relegation spots.`,
      url: `https://goalmills.com/football/${comp.slug}/table`,
      type: 'website',
    },
  };
}

export default async function CompetitionTablePage({
  params,
}: {
  params: Promise<{ competitionSlug: string }>;
}) {
  const { competitionSlug } = await params;
  const { comp, canonicalComp } = resolveCompetition(competitionSlug);

  if (!comp) {
    notFound();
  }

  // Format Engine Configuration
  const competitionIdStr = canonicalComp?.id || comp.slug;
  const seasonStr = comp.season || '2026/2027';
  const format = getCompetitionFormat(competitionIdStr, seasonStr);
  const ruleset = getStandingsRulesetForCompetition(competitionIdStr, seasonStr);

  // Fetch standings & fixtures in parallel
  let rawStandings: FootballStanding[] = [];
  let fixtures: any[] = [];

  try {
    const [standingsRes, fixturesRes] = await Promise.all([
      comp.id ? advancedFootballApi.getStandings(comp.id).catch(() => null) : null,
      comp.id ? advancedFootballApi.getFixtures({ leagueId: comp.id }).catch(() => null) : null,
    ]);

    if (standingsRes?.result) {
      const resObj = standingsRes.result as any;
      const list = resObj.total || (Array.isArray(resObj) ? resObj : []);
      rawStandings = Array.isArray(list) ? list : [];
    }

    if (fixturesRes?.result && Array.isArray(fixturesRes.result)) {
      fixtures = fixturesRes.result;
    }
  } catch (err) {
    console.error('[CompetitionTablePage] Error fetching table data:', err);
  }

  // Separate standings by group/phase
  const standingTables = separateProviderStandingsByGroup(
    rawStandings,
    competitionIdStr,
    seasonStr
  );

  const isMultiGroup = format.hasGroups || standingTables.length > 1;
  const isKnockoutOnly = format.formatType === 'KNOCKOUT' || (format.hasKnockout && !format.hasLeagueTable && rawStandings.length === 0);

  // Structured Data (JSON-LD)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://goalmills.com';
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'GoalMills', url: baseUrl },
    { name: 'Football', url: `${baseUrl}/football` },
    { name: comp.name, url: `${baseUrl}/football/${comp.slug}` },
    { name: 'Table', url: `${baseUrl}/football/${comp.slug}/table` },
  ]);

  const competitionJsonLd = canonicalComp
    ? generateCompetitionJsonLd(canonicalComp, baseUrl)
    : {
        '@context': 'https://schema.org',
        '@type': 'SportsOrganization',
        name: comp.name,
        url: `${baseUrl}/football/${comp.slug}`,
        sport: 'Football',
        logo: comp.logo,
      };

  const featuredCompetitions = ALL_COMPETITIONS.slice(0, 6);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(competitionJsonLd) }}
      />
      <ContentHubLayout
        breadcrumbs={[
          { name: 'Football', url: '/football' },
          { name: comp.name, url: `/football/${comp.slug}` },
          { name: 'Table & Standings', url: `/football/${comp.slug}/table` },
        ]}
        header={
          <div className="space-y-4">
            <LiveNewsFlashTicker badgeText={`${comp.name.toUpperCase()} TABLE WIRE`} />

            {/* Header Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl border border-blue-500/25 bg-gradient-to-br from-[#08142A] via-[#0B1E3E] to-[#060D18] p-6 sm:p-8 shadow-2xl shadow-blue-950/50">
              <div className="absolute top-0 right-0 w-96 h-64 bg-blue-600/15 blur-3xl pointer-events-none -z-0" />
              <div className="absolute bottom-0 left-1/3 w-80 h-48 bg-amber-500/10 blur-3xl pointer-events-none -z-0" />

              <div className="relative z-10 space-y-4">
                {/* Back to Hub Link */}
                <Link
                  href={`/football/${comp.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  <FiArrowLeft />
                  <span>Back to {comp.name} Overview Hub</span>
                </Link>

                {/* Title & Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-slate-900/90 border border-white/10 p-2 flex items-center justify-center shrink-0 shadow-lg">
                      <CompetitionLogo src={comp.logo} alt={comp.name} size={48} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/30">
                          {format.formatType.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          Season {comp.season}
                        </span>
                      </div>
                      <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                        {comp.name} Standings Table
                      </h1>
                    </div>
                  </div>

                  {/* Subnav Pills */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto bg-black/40 p-1 rounded-xl border border-white/5">
                    <Link
                      href={`/football/${comp.slug}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition-all"
                    >
                      Overview
                    </Link>
                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-sm">
                      Table
                    </span>
                  </div>
                </div>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                  Real-time {comp.name} standings table with goal difference (GD), matches played (P), points (Pts), 5-match form guide, and deterministic tiebreaker resolution.
                </p>
              </div>
            </div>
          </div>
        }
        sidebar={
          <div className="space-y-6">
            {/* Format & Rules Card */}
            <div className="rounded-3xl border border-blue-500/20 bg-[#0A162B]/90 p-5 space-y-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FiAward className="text-amber-400" />
                  <span>Competition Rules</span>
                </h3>
                <span className="text-[10px] text-amber-400 font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  {format.seasonId}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-[#070F1E] border border-white/5 flex justify-between items-center">
                  <span className="text-slate-400">Format:</span>
                  <span className="font-bold text-white uppercase">{format.formatType.replace('_', ' ')}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#070F1E] border border-white/5 flex justify-between items-center">
                  <span className="text-slate-400">Teams / Structure:</span>
                  <span className="font-bold text-white">
                    {format.hasGroups
                      ? `${format.stages[0]?.groupsCount || standingTables.length} Groups`
                      : `${rawStandings.length || 20} Clubs`}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#070F1E] border border-white/5 flex justify-between items-center">
                  <span className="text-slate-400">Points System:</span>
                  <span className="font-bold text-white">
                    {ruleset.winPoints} Win / {ruleset.drawPoints} Draw / {ruleset.lossPoints} Loss
                  </span>
                </div>
              </div>

              {/* Tiebreaker Sequence Steps */}
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Deterministic Tiebreaker Order:
                </span>
                <ol className="space-y-1 text-[11px] text-slate-300">
                  {ruleset.tiebreakers.map((rule, idx) => (
                    <li key={rule} className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center text-[9px] font-mono shrink-0">
                        {idx + 1}
                      </span>
                      <span>{rule.replace(/_/g, ' ')}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Other Competition Tables */}
            <div className="rounded-3xl border border-blue-500/20 bg-[#0A162B]/90 p-5 space-y-3 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FiGlobe className="text-amber-400" />
                  <span>Other League Tables</span>
                </h3>
              </div>
              <div className="space-y-1.5">
                {featuredCompetitions
                  .filter((c) => c.slug !== comp.slug)
                  .map((c) => (
                    <Link
                      key={c.slug}
                      href={`/football/${c.slug}/table`}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#070F1E] hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/30 transition-all text-xs font-bold text-slate-300 hover:text-white group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
                        <span>{c.name}</span>
                      </div>
                      <span className="text-amber-400 group-hover:translate-x-1 transition-transform text-[11px]">
                        &rarr;
                      </span>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        }
      >
        {/* Main Content Area: Group Standings, League Table, or Knockout Bracket */}
        {isKnockoutOnly ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
              <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span>🏆</span>
                <span>Tournament Knockout Tree & Bracket</span>
              </h2>
            </div>
            <TournamentBracketView
              bracket={buildTournamentBracket(competitionIdStr, seasonStr, fixtures)}
            />
          </div>
        ) : isMultiGroup ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
              <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span>🏆</span>
                <span>Group Stage Standings</span>
              </h2>
              <span className="text-xs font-bold text-blue-400">
                {standingTables.length} Groups
              </span>
            </div>
            <GroupStandingsView groups={standingTables} leagueId={comp.id} />
          </div>
        ) : standingTables.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
              <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span>🏆</span>
                <span>{standingTables[0].name || `${comp.name} League Table`}</span>
              </h2>
              <span className="text-xs font-mono font-bold text-blue-300">
                {standingTables[0].entries.length} Clubs
              </span>
            </div>
            <FootballStandingsTable
              table={standingTables[0]}
              standings={rawStandings}
              leagueId={comp.id}
            />
          </div>
        ) : rawStandings.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
              <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span>🏆</span>
                <span>{comp.name} Standings</span>
              </h2>
            </div>
            <FootballStandingsTable standings={rawStandings} leagueId={comp.id} />
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#0B1526]/50 p-12 text-center text-slate-400 space-y-2">
            <span className="text-3xl block">📋</span>
            <h3 className="text-base font-bold text-white">Standings Currently Updating</h3>
            <p className="text-xs max-w-md mx-auto">
              Live standings data for this competition is updating for the {comp.season} season. Check back shortly as match results are confirmed.
            </p>
          </div>
        )}
      </ContentHubLayout>
    </>
  );
}
