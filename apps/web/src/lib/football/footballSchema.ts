import {
  CanonicalCompetition,
  NormalizedFixture,
  CountryRecord,
  ConfederationRecord,
  PriorityClub,
} from '@goalmills/types';
import { buildMatchSlug } from '../slugUtils';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Generates Schema.org BreadcrumbList microdata for Google search results.
 */
export function generateBreadcrumbJsonLd(breadcrumbs: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

/**
 * Generates Schema.org SportsOrganization / SportsTournament microdata for a Canonical Competition.
 */
export function generateCompetitionJsonLd(
  competition: CanonicalCompetition,
  baseUrl = 'https://goalmills.com'
) {
  const canonicalUrl = `${baseUrl}/football/${competition.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: competition.name,
    alternateName: competition.shortName,
    url: canonicalUrl,
    logo: competition.logoUrl || `${baseUrl}/icon.png`,
    sport: 'Football',
    description: `${competition.name} (${competition.countryName || competition.confederationCode}) complete match centre: live scores, fixtures, results, standings, and clubs.`,
    location: {
      '@type': 'Place',
      name: competition.countryName || competition.confederationCode,
      address: {
        '@type': 'PostalAddress',
        addressCountry: competition.countryCode || competition.confederationCode,
      },
    },
    memberOf: {
      '@type': 'SportsOrganization',
      name: competition.confederationCode,
    },
  };
}

/**
 * Generates Schema.org SportsEvent microdata for a Normalized Fixture (Google Live Score Snippets).
 */
export function generateSportsEventJsonLd(
  fixture: NormalizedFixture,
  baseUrl = 'https://goalmills.com'
) {
  const isFinished = fixture.status === 'Finished' || fixture.status === 'FT';
  const isLive =
    fixture.status === 'LIVE' ||
    fixture.status === '1H' ||
    fixture.status === '2H' ||
    fixture.status === 'HT';

  let eventStatus = 'https://schema.org/EventScheduled';
  if (isFinished) {
    eventStatus = 'https://schema.org/EventCompleted';
  } else if (isLive) {
    eventStatus = 'https://schema.org/EventLive';
  } else if (fixture.status === 'Postponed' || fixture.status === 'Cancelled') {
    eventStatus = 'https://schema.org/EventCancelled';
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${fixture.homeTeamName} vs ${fixture.awayTeamName}`,
    sport: 'Football',
    startDate: fixture.scheduledAt,
    eventStatus,
    homeTeam: {
      '@type': 'SportsTeam',
      name: fixture.homeTeamName,
      logo: fixture.homeTeamLogo || undefined,
    },
    awayTeam: {
      '@type': 'SportsTeam',
      name: fixture.awayTeamName,
      logo: fixture.awayTeamLogo || undefined,
    },
    url: `${baseUrl}/football/matches/${buildMatchSlug({
      home: fixture.homeTeamName,
      away: fixture.awayTeamName,
      competitionId: fixture.competitionId,
      date: (fixture as any).date || fixture.scheduledAt?.split('T')[0],
      id: fixture.fixtureId,
    })}`,
    ...(fixture.homeScore !== undefined && fixture.awayScore !== undefined
      ? {
          result: `${fixture.homeScore} - ${fixture.awayScore}`,
        }
      : {}),
  };
}

/**
 * Generates Schema.org microdata for a Confederation Landing Hub (e.g. CAF, UEFA).
 */
export function generateConfederationJsonLd(
  confederation: ConfederationRecord,
  competitions: CanonicalCompetition[] = [],
  baseUrl = 'https://goalmills.com'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: confederation.name,
    alternateName: confederation.code,
    url: `${baseUrl}/football/confederations/${confederation.code.toLowerCase()}`,
    sport: 'Football',
    hasMember: competitions.map((comp) => ({
      '@type': 'SportsOrganization',
      name: comp.name,
      url: `${baseUrl}/football/${comp.slug}`,
    })),
  };
}

/**
 * Generates Schema.org microdata for a National Football Pyramid (e.g. England, Nigeria).
 */
export function generateCountryPyramidJsonLd(
  country: CountryRecord,
  competitions: CanonicalCompetition[] = [],
  baseUrl = 'https://goalmills.com'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: `${country.name} Football Association & Domestic Competitions`,
    alternateName: country.name,
    url: `${baseUrl}/football/countries/${country.code.toLowerCase()}`,
    logo: country.flagUrl,
    sport: 'Football',
    subOrganization: competitions.map((comp) => ({
      '@type': 'SportsOrganization',
      name: comp.name,
      url: `${baseUrl}/football/${comp.slug}`,
    })),
  };
}

/**
 * Generates Schema.org SportsTeam microdata for a Priority Club.
 */
export function generateSportsTeamJsonLd(
  club: PriorityClub,
  competition?: CanonicalCompetition,
  country?: CountryRecord,
  baseUrl = 'https://goalmills.com'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name: club.name,
    alternateName: club.shortName,
    url: `${baseUrl}/football/clubs/${club.slug}`,
    logo: club.logoUrl || `${baseUrl}/icon.png`,
    sport: 'Football',
    location: {
      '@type': 'Place',
      name: club.stadium || `${club.name} Stadium`,
      address: {
        '@type': 'PostalAddress',
        addressCountry: country?.name || club.countryCode,
      },
    },
    ...(competition
      ? {
          memberOf: {
            '@type': 'SportsOrganization',
            name: competition.name,
            url: `${baseUrl}/football/${competition.slug}`,
          },
        }
      : {}),
  };
}
