import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getPriorityClub,
  PRIORITY_CLUBS_LIST,
  getCanonicalCompetition,
  getCountry,
  generateSportsTeamJsonLd,
  generateBreadcrumbJsonLd,
} from '@/lib/football';
import {
  FiShield,
  FiMapPin,
  FiCalendar,
  FiAward,
  FiTrendingUp,
  FiArrowRight,
  FiGlobe,
  FiChevronRight,
  FiCheckCircle,
} from 'react-icons/fi';

interface ClubPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ClubPageProps): Promise<Metadata> {
  const { slug } = await params;
  const club = getPriorityClub(slug);

  if (!club) {
    return {
      title: 'Football Club Not Found | GoalMills',
      description: 'The requested football club could not be located in our authoritative registry.',
    };
  }

  const comp = getCanonicalCompetition(club.competitionId);
  const country = getCountry(club.countryCode);
  const title = `${club.name} Live Scores, Fixtures, Standings & Results | GoalMills`;
  const description = `Follow ${club.name} (${club.shortName}) latest matches, fixtures, results, live scores and squad in ${comp?.name || 'league football'} on GoalMills.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://goalmills.com/football/clubs/${club.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://goalmills.com/football/clubs/${club.slug}`,
      siteName: 'GoalMills',
      locale: 'en_GB',
      type: 'website',
      images: club.logoUrl ? [{ url: club.logoUrl, alt: `${club.name} crest` }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export async function generateStaticParams() {
  return PRIORITY_CLUBS_LIST.slice(0, 50).map((club) => ({
    slug: club.slug,
  }));
}

export default async function ClubPage({ params }: ClubPageProps) {
  const { slug } = await params;
  const club = getPriorityClub(slug);

  if (!club) {
    notFound();
  }

  const comp = getCanonicalCompetition(club.competitionId);
  const country = getCountry(club.countryCode);
  const countrySlug = country
    ? country.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    : '';

  const teamSchema = generateSportsTeamJsonLd(club, comp, country);
  const breadcrumbSchema = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Football', url: '/football' },
    ...(country
      ? [{ name: country.name, url: `/football/countries/${countrySlug}` }]
      : []),
    ...(comp ? [{ name: comp.name, url: `/football/${comp.slug}` }] : []),
    { name: club.name, url: `/football/clubs/${club.slug}` },
  ]);

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(teamSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-[#020617] text-slate-100">
        {/* Breadcrumb Navigation Bar */}
        <div className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
            <nav className="flex items-center gap-1.5 text-xs text-slate-400">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <FiChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <Link href="/football" className="hover:text-white transition-colors">
                Football
              </Link>
              {country && (
                <>
                  <FiChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <Link
                    href={`/football/countries/${countrySlug}`}
                    className="hover:text-white transition-colors"
                  >
                    {country.name}
                  </Link>
                </>
              )}
              {comp && (
                <>
                  <FiChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <Link href={`/football/${comp.slug}`} className="hover:text-white transition-colors">
                    {comp.name}
                  </Link>
                </>
              )}
              <FiChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-white font-semibold truncate">{club.name}</span>
            </nav>
          </div>
        </div>

        {/* Hero Header */}
        <header className="relative bg-gradient-to-b from-[#0a1628] via-[#040d1a] to-[#020617] border-b border-slate-800/80 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              {/* Crest Badge */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-900/90 border border-slate-700/60 p-3.5 flex items-center justify-center shrink-0 shadow-2xl shadow-blue-950/50">
                {club.logoUrl ? (
                  <img
                    src={club.logoUrl}
                    alt={`${club.name} crest`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-4xl">⚽</span>
                )}
              </div>

              {/* Title & Metadata */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {country && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300">
                      <span>{country.flagUrl ? '🌍' : '⚽'}</span>
                      <span>{country.name}</span>
                    </span>
                  )}
                  {comp && (
                    <Link
                      href={`/football/${comp.slug}`}
                      className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-xs font-semibold text-blue-300 hover:bg-blue-500/25 transition-colors"
                    >
                      {comp.name}
                    </Link>
                  )}
                  {club.isWomens && (
                    <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-black uppercase">
                      Women's Team
                    </span>
                  )}
                  {club.isAfrican && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black uppercase">
                      African Giant
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  {club.name}
                </h1>
                <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                  Follow {club.name} live scores, upcoming fixtures, match results, standings and
                  performance analytics on GoalMills.
                </p>

                {/* Quick stats pills */}
                <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-400">
                  {club.stadium && (
                    <div className="flex items-center gap-1.5">
                      <FiMapPin className="text-slate-500" />
                      <span>{club.stadium}</span>
                    </div>
                  )}
                  {club.founded && (
                    <div className="flex items-center gap-1.5">
                      <FiCalendar className="text-slate-500" />
                      <span>Founded {club.founded}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <FiAward className="text-amber-400" />
                    <span>Global Rank #{club.globalRank}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase font-bold text-slate-400">Domestic League</p>
                <h3 className="text-lg font-bold text-white mt-1">
                  {comp ? comp.name : 'Top Flight'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Follow league fixtures, live standings, and goal tallies.
                </p>
              </div>
              {comp && (
                <Link
                  href={`/football/${comp.slug}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <span>View League Table</span>
                  <FiArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase font-bold text-slate-400">Match Centre</p>
                <h3 className="text-lg font-bold text-white mt-1">Live Scores & Telemetry</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Real-time match events, minute updates, and final scores.
                </p>
              </div>
              <Link
                href="/football"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span>Browse Live Scores</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase font-bold text-slate-400">National Hub</p>
                <h3 className="text-lg font-bold text-white mt-1">
                  {country ? country.name : 'Football Hub'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Explore other major clubs and domestic tournaments.
                </p>
              </div>
              {country && (
                <Link
                  href={`/football/countries/${countrySlug}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <span>Explore {country.name}</span>
                  <FiArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* Related Authority Information */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4">
            <h2 className="text-lg font-bold text-white">About {club.name}</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {club.name} is a professional football club competing in the{' '}
              {comp?.name || 'top domestic division'} representing {country?.name || 'international football'}.
              Matches are hosted at {club.stadium || 'their home ground'}. GoalMills provides
              authoritative match coverage, verified statistics, live score telemetry, and
              uncontaminated fixture reporting for {club.name}.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
                Confederation: {club.confederationCode}
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
                Priority Ranking: #{club.priorityRank}
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
                Authoritative Provider ID: {club.providerId}
              </span>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
