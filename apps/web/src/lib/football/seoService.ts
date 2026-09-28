import { Metadata } from 'next';
import {
  CanonicalCompetition,
  ConfederationRecord,
  CountryRecord,
} from '@goalmills/types';
import {
  CANONICAL_COMPETITIONS,
  getCanonicalCompetition,
  getAllCanonicalCompetitions,
} from './competitionRegistry';
import { CONFEDERATIONS, getAllConfederations } from './confederationRegistry';
import { COUNTRIES_REGISTRY, getAllCountries, getCountry } from './countryRegistry';

const DEFAULT_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://goalmills.com';

/**
 * Resolves a competition by slug or canonical ID.
 */
export function resolveCompetitionBySlug(slug: string): CanonicalCompetition | undefined {
  if (!slug) return undefined;
  return getCanonicalCompetition(slug);
}

/**
 * Resolves a confederation by slug or code (case-insensitive: "caf", "uefa", etc.).
 */
export function resolveConfederationBySlug(slug: string): ConfederationRecord | undefined {
  if (!slug) return undefined;
  const clean = slug.trim().toLowerCase();
  return getAllConfederations().find(
    (c) => c.slug.toLowerCase() === clean || c.code.toLowerCase() === clean
  );
}

/**
 * Resolves a country by slug or code (e.g. "england", "gb-eng", "nigeria", "ng").
 */
export function resolveCountryBySlug(slugOrCode: string): CountryRecord | undefined {
  if (!slugOrCode) return undefined;
  const clean = slugOrCode.trim().toLowerCase().replace(/_/g, '-');

  // Try direct code match
  const byCode = getCountry(clean.toUpperCase());
  if (byCode) return byCode;

  // Try slugified name or code match from all countries
  return getAllCountries().find((c) => {
    const countrySlug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const codeSlug = c.code.toLowerCase();
    return countrySlug === clean || codeSlug === clean;
  });
}

/**
 * Generates dynamic SEO metadata for a Canonical Football Competition.
 */
export function buildCompetitionMetadata(
  comp: CanonicalCompetition,
  baseUrl = DEFAULT_BASE_URL
): Metadata {
  const canonicalUrl = `${baseUrl}/football/${comp.slug}`;
  const title = `${comp.name} Hub: Live Scores, Fixtures, Table, Teams & Stats | GoalMills`;
  const description = `${comp.name} (${comp.countryName || comp.confederationCode}) match centre. Live scores, league standings, schedules, priority clubs, and tactical coverage on GoalMills.`;

  const keywords = [
    comp.name,
    comp.shortName,
    `${comp.name} live score`,
    `${comp.name} fixtures`,
    `${comp.name} table`,
    `${comp.name} standings`,
    `${comp.countryName || comp.confederationCode} football`,
    'GoalMills football',
    'live soccer scores',
  ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'GoalMills',
      type: 'website',
      images: [
        {
          url: comp.logoUrl || `${baseUrl}/icon.png`,
          width: 800,
          height: 800,
          alt: `${comp.name} Logo`,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [comp.logoUrl || `${baseUrl}/icon.png`],
    },
  };
}

/**
 * Generates dynamic SEO metadata for a Confederation Landing Hub.
 */
export function buildConfederationMetadata(
  confed: ConfederationRecord,
  baseUrl = DEFAULT_BASE_URL
): Metadata {
  const canonicalUrl = `${baseUrl}/football/confederations/${confed.slug}`;
  const title = `${confed.name} (${confed.code}) Football Tournaments & Hub | GoalMills`;
  const description = `Live match centre and complete tournament guide for ${confed.name} (${confed.code}). Follow club championships, continental cups, women's football, and youth competitions.`;

  return {
    title,
    description,
    keywords: [
      confed.name,
      confed.code,
      `${confed.code} football`,
      `${confed.code} champions league`,
      `${confed.code} live scores`,
      'GoalMills continental football',
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'GoalMills',
      type: 'website',
      images: [
        {
          url: confed.logoUrl || `${baseUrl}/icon.png`,
          width: 800,
          height: 800,
          alt: `${confed.name} Logo`,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [confed.logoUrl || `${baseUrl}/icon.png`],
    },
  };
}

/**
 * Generates dynamic SEO metadata for a National Football Pyramid.
 */
export function buildCountryMetadata(
  country: CountryRecord,
  baseUrl = DEFAULT_BASE_URL
): Metadata {
  const countrySlug = country.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const canonicalUrl = `${baseUrl}/football/countries/${countrySlug}`;
  const title = `${country.name} Football: Leagues, Cups, Standings & Priority Clubs | GoalMills`;
  const description = `Explore the ${country.name} football pyramid. Real-time scores, national leagues, domestic cup competitions, women's football, and priority clubs.`;

  return {
    title,
    description,
    keywords: [
      `${country.name} football`,
      `${country.name} soccer league`,
      `${country.name} premier league`,
      `${country.name} football table`,
      `${country.name} cup fixtures`,
      'GoalMills',
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'GoalMills',
      type: 'website',
      images: [
        {
          url: country.flagUrl || `${baseUrl}/icon.png`,
          width: 800,
          height: 600,
          alt: `${country.name} Flag`,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [country.flagUrl || `${baseUrl}/icon.png`],
    },
  };
}
