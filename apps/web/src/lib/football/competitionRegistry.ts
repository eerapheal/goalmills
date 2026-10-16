import {
  CanonicalCompetition,
  ConfederationCode,
  CompetitionGender,
  CompetitionAgeCategory,
  CompetitionType,
  CompetitionLevel,
  CompetitionTier,
  CompetitionStatus,
} from '@goalmills/types';
import { TOP_LEAGUES, TopLeagueRef, getLeagueRank, isTopLeague, UNRANKED } from './topLeagues';

export const LEAGUE_LOGO_BASE = 'https://media.api-sports.io/football/leagues';
export const leagueLogo = (apiSportsId: number): string => `${LEAGUE_LOGO_BASE}/${apiSportsId}.png`;

/**
 * Metadata map for top-ranked leagues to enrich provider data with canonical classifications.
 * Lightweight classification metadata only — seasons, teams, standings and logos come live from AllSportsAPI.
 */
interface TopLeagueMeta {
  name: string;
  shortName: string;
  countryCode: string;
  countryName: string;
  confederationCode: ConfederationCode;
  competitionType: CompetitionType;
  level: CompetitionLevel;
  tier: CompetitionTier;
  isDomestic: boolean;
  isContinental: boolean;
  isInternational: boolean;
  isNationalTeam: boolean;
  isYouth: boolean;
  isSenior: boolean;
  isWomens: boolean;
  isMens: boolean;
  qualifierLeagueId?: number;
}

const TOP_LEAGUES_META: Record<number, TopLeagueMeta> = {
  // English Premier League
  152: {
    name: 'Premier League',
    shortName: 'EPL',
    countryCode: 'GB-ENG',
    countryName: 'England',
    confederationCode: 'UEFA',
    competitionType: 'LEAGUE',
    level: 'DOMESTIC',
    tier: 1,
    isDomestic: true,
    isContinental: false,
    isInternational: false,
    isNationalTeam: false,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
  },
  // Spanish La Liga
  302: {
    name: 'La Liga',
    shortName: 'LaLiga',
    countryCode: 'ES',
    countryName: 'Spain',
    confederationCode: 'UEFA',
    competitionType: 'LEAGUE',
    level: 'DOMESTIC',
    tier: 1,
    isDomestic: true,
    isContinental: false,
    isInternational: false,
    isNationalTeam: false,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
  },
  // Italian Serie A
  207: {
    name: 'Serie A',
    shortName: 'Serie A',
    countryCode: 'IT',
    countryName: 'Italy',
    confederationCode: 'UEFA',
    competitionType: 'LEAGUE',
    level: 'DOMESTIC',
    tier: 1,
    isDomestic: true,
    isContinental: false,
    isInternational: false,
    isNationalTeam: false,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
  },
  // German Bundesliga
  175: {
    name: 'Bundesliga',
    shortName: 'Bundesliga',
    countryCode: 'DE',
    countryName: 'Germany',
    confederationCode: 'UEFA',
    competitionType: 'LEAGUE',
    level: 'DOMESTIC',
    tier: 1,
    isDomestic: true,
    isContinental: false,
    isInternational: false,
    isNationalTeam: false,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
  },
  // French Ligue 1
  168: {
    name: 'Ligue 1',
    shortName: 'Ligue 1',
    countryCode: 'FR',
    countryName: 'France',
    confederationCode: 'UEFA',
    competitionType: 'LEAGUE',
    level: 'DOMESTIC',
    tier: 1,
    isDomestic: true,
    isContinental: false,
    isInternational: false,
    isNationalTeam: false,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
  },
  // UEFA Champions League
  3: {
    name: 'UEFA Champions League',
    shortName: 'UCL',
    countryCode: 'EU',
    countryName: 'Europe',
    confederationCode: 'UEFA',
    competitionType: 'CONTINENTAL_CLUB',
    level: 'CONFEDERATION',
    tier: 1,
    isDomestic: false,
    isContinental: true,
    isInternational: false,
    isNationalTeam: false,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
  },
  // UEFA Europa League
  4: {
    name: 'UEFA Europa League',
    shortName: 'UEL',
    countryCode: 'EU',
    countryName: 'Europe',
    confederationCode: 'UEFA',
    competitionType: 'CONTINENTAL_CLUB',
    level: 'CONFEDERATION',
    tier: 2,
    isDomestic: false,
    isContinental: true,
    isInternational: false,
    isNationalTeam: false,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
  },
  // UEFA Europa Conference League
  683: {
    name: 'UEFA Conference League',
    shortName: 'UECL',
    countryCode: 'EU',
    countryName: 'Europe',
    confederationCode: 'UEFA',
    competitionType: 'CONTINENTAL_CLUB',
    level: 'CONFEDERATION',
    tier: 3,
    isDomestic: false,
    isContinental: true,
    isInternational: false,
    isNationalTeam: false,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
  },
  // FIFA World Cup
  28: {
    name: 'FIFA World Cup',
    shortName: 'World Cup',
    countryCode: 'FIFA',
    countryName: 'World',
    confederationCode: 'FIFA',
    competitionType: 'WORLD_CUP',
    level: 'GLOBAL',
    tier: 1,
    isDomestic: false,
    isContinental: false,
    isInternational: true,
    isNationalTeam: true,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
    qualifierLeagueId: 28,
  },
  // UEFA European Championship
  1: {
    name: 'UEFA European Championship',
    shortName: 'Euro',
    countryCode: 'EU',
    countryName: 'Europe',
    confederationCode: 'UEFA',
    competitionType: 'CONTINENTAL_NATIONAL',
    level: 'CONFEDERATION',
    tier: 1,
    isDomestic: false,
    isContinental: true,
    isInternational: true,
    isNationalTeam: true,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
    qualifierLeagueId: 354,
  },
  // Africa Cup of Nations (AFCON)
  29: {
    name: 'Africa Cup of Nations',
    shortName: 'AFCON',
    countryCode: 'CAF',
    countryName: 'Africa',
    confederationCode: 'CAF',
    competitionType: 'CONTINENTAL_NATIONAL',
    level: 'CONFEDERATION',
    tier: 1,
    isDomestic: false,
    isContinental: true,
    isInternational: true,
    isNationalTeam: true,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
    qualifierLeagueId: 7098,
  },
  // CAF Champions League
  346: {
    name: 'CAF Champions League',
    shortName: 'CAF CL',
    countryCode: 'CAF',
    countryName: 'Africa',
    confederationCode: 'CAF',
    competitionType: 'CONTINENTAL_CLUB',
    level: 'CONFEDERATION',
    tier: 1,
    isDomestic: false,
    isContinental: true,
    isInternational: false,
    isNationalTeam: false,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
  },
  // CAF Confederation Cup
  390: {
    name: 'CAF Confederation Cup',
    shortName: 'CAF CC',
    countryCode: 'CAF',
    countryName: 'Africa',
    confederationCode: 'CAF',
    competitionType: 'CONTINENTAL_CLUB',
    level: 'CONFEDERATION',
    tier: 2,
    isDomestic: false,
    isContinental: true,
    isInternational: false,
    isNationalTeam: false,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
  },
  // African Nations Championship (CHAN)
  480: {
    name: 'African Nations Championship',
    shortName: 'CHAN',
    countryCode: 'CAF',
    countryName: 'Africa',
    confederationCode: 'CAF',
    competitionType: 'CONTINENTAL_NATIONAL',
    level: 'CONFEDERATION',
    tier: 2,
    isDomestic: false,
    isContinental: true,
    isInternational: true,
    isNationalTeam: true,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
    qualifierLeagueId: 12618,
  },
  // AFCON U-20
  619: {
    name: 'AFCON U-20',
    shortName: 'AFCON U20',
    countryCode: 'CAF',
    countryName: 'Africa',
    confederationCode: 'CAF',
    competitionType: 'TOURNAMENT',
    level: 'CONFEDERATION',
    tier: 3,
    isDomestic: false,
    isContinental: true,
    isInternational: true,
    isNationalTeam: true,
    isYouth: true,
    isSenior: false,
    isWomens: false,
    isMens: true,
  },
  // AFCON U-17
  10253: {
    name: 'AFCON U-17',
    shortName: 'AFCON U17',
    countryCode: 'CAF',
    countryName: 'Africa',
    confederationCode: 'CAF',
    competitionType: 'TOURNAMENT',
    level: 'CONFEDERATION',
    tier: 3,
    isDomestic: false,
    isContinental: true,
    isInternational: true,
    isNationalTeam: true,
    isYouth: true,
    isSenior: false,
    isWomens: false,
    isMens: true,
  },
  // Nigeria NPFL
  248: {
    name: 'Nigeria Premier Football League',
    shortName: 'NPFL',
    countryCode: 'NG',
    countryName: 'Nigeria',
    confederationCode: 'CAF',
    competitionType: 'LEAGUE',
    level: 'DOMESTIC',
    tier: 1,
    isDomestic: true,
    isContinental: false,
    isInternational: false,
    isNationalTeam: false,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
  },
  // FIFA Club World Cup
  12614: {
    name: 'FIFA Club World Cup',
    shortName: 'Club World Cup',
    countryCode: 'FIFA',
    countryName: 'World',
    confederationCode: 'FIFA',
    competitionType: 'WORLD_CUP',
    level: 'GLOBAL',
    tier: 1,
    isDomestic: false,
    isContinental: false,
    isInternational: true,
    isNationalTeam: false,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
  },
  // UEFA Nations League
  633: {
    name: 'UEFA Nations League',
    shortName: 'Nations League',
    countryCode: 'EU',
    countryName: 'Europe',
    confederationCode: 'UEFA',
    competitionType: 'CONTINENTAL_NATIONAL',
    level: 'CONFEDERATION',
    tier: 2,
    isDomestic: false,
    isContinental: true,
    isInternational: true,
    isNationalTeam: true,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
  },
  // Copa Libertadores
  18: {
    name: 'Copa Libertadores',
    shortName: 'Libertadores',
    countryCode: 'CONMEBOL',
    countryName: 'South America',
    confederationCode: 'CONMEBOL',
    competitionType: 'CONTINENTAL_CLUB',
    level: 'CONFEDERATION',
    tier: 1,
    isDomestic: false,
    isContinental: true,
    isInternational: false,
    isNationalTeam: false,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
  },
  // Copa America
  17: {
    name: 'Copa America',
    shortName: 'Copa America',
    countryCode: 'CONMEBOL',
    countryName: 'South America',
    confederationCode: 'CONMEBOL',
    competitionType: 'CONTINENTAL_NATIONAL',
    level: 'CONFEDERATION',
    tier: 1,
    isDomestic: false,
    isContinental: true,
    isInternational: true,
    isNationalTeam: true,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
  },
  // Dutch Eredivisie
  244: {
    name: 'Eredivisie',
    shortName: 'Eredivisie',
    countryCode: 'NL',
    countryName: 'Netherlands',
    confederationCode: 'UEFA',
    competitionType: 'LEAGUE',
    level: 'DOMESTIC',
    tier: 1,
    isDomestic: true,
    isContinental: false,
    isInternational: false,
    isNationalTeam: false,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
  },
  // Portuguese Liga Portugal
  266: {
    name: 'Liga Portugal',
    shortName: 'Liga Portugal',
    countryCode: 'PT',
    countryName: 'Portugal',
    confederationCode: 'UEFA',
    competitionType: 'LEAGUE',
    level: 'DOMESTIC',
    tier: 1,
    isDomestic: true,
    isContinental: false,
    isInternational: false,
    isNationalTeam: false,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
  },
  // Saudi Pro League
  278: {
    name: 'Saudi Pro League',
    shortName: 'Saudi League',
    countryCode: 'SA',
    countryName: 'Saudi Arabia',
    confederationCode: 'AFC',
    competitionType: 'LEAGUE',
    level: 'DOMESTIC',
    tier: 1,
    isDomestic: true,
    isContinental: false,
    isInternational: false,
    isNationalTeam: false,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
  },
  // USA MLS
  332: {
    name: 'Major League Soccer',
    shortName: 'MLS',
    countryCode: 'US',
    countryName: 'USA',
    confederationCode: 'CONCACAF',
    competitionType: 'LEAGUE',
    level: 'DOMESTIC',
    tier: 1,
    isDomestic: true,
    isContinental: false,
    isInternational: false,
    isNationalTeam: false,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
  },
  // English Championship
  153: {
    name: 'EFL Championship',
    shortName: 'Championship',
    countryCode: 'GB-ENG',
    countryName: 'England',
    confederationCode: 'UEFA',
    competitionType: 'LEAGUE',
    level: 'DOMESTIC',
    tier: 2,
    isDomestic: true,
    isContinental: false,
    isInternational: false,
    isNationalTeam: false,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
  },
  // English FA Cup
  146: {
    name: 'FA Cup',
    shortName: 'FA Cup',
    countryCode: 'GB-ENG',
    countryName: 'England',
    confederationCode: 'UEFA',
    competitionType: 'CUP',
    level: 'DOMESTIC',
    tier: 1,
    isDomestic: true,
    isContinental: false,
    isInternational: false,
    isNationalTeam: false,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
  },
  // Brazilian Serie A
  99: {
    name: 'Brasileirão Série A',
    shortName: 'Brasileirão',
    countryCode: 'BR',
    countryName: 'Brazil',
    confederationCode: 'CONMEBOL',
    competitionType: 'LEAGUE',
    level: 'DOMESTIC',
    tier: 1,
    isDomestic: true,
    isContinental: false,
    isInternational: false,
    isNationalTeam: false,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
  },
  // Argentine Primera
  44: {
    name: 'Liga Profesional',
    shortName: 'Liga Profesional',
    countryCode: 'AR',
    countryName: 'Argentina',
    confederationCode: 'CONMEBOL',
    competitionType: 'LEAGUE',
    level: 'DOMESTIC',
    tier: 1,
    isDomestic: true,
    isContinental: false,
    isInternational: false,
    isNationalTeam: false,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
  },
  // Turkish Super Lig
  322: {
    name: 'Süper Lig',
    shortName: 'Süper Lig',
    countryCode: 'TR',
    countryName: 'Turkey',
    confederationCode: 'UEFA',
    competitionType: 'LEAGUE',
    level: 'DOMESTIC',
    tier: 1,
    isDomestic: true,
    isContinental: false,
    isInternational: false,
    isNationalTeam: false,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
  },
  // Egyptian Premier League
  141: {
    name: 'Egyptian Premier League',
    shortName: 'Egypt PL',
    countryCode: 'EG',
    countryName: 'Egypt',
    confederationCode: 'CAF',
    competitionType: 'LEAGUE',
    level: 'DOMESTIC',
    tier: 1,
    isDomestic: true,
    isContinental: false,
    isInternational: false,
    isNationalTeam: false,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
  },
  // South African PSL
  297: {
    name: 'South African Premier Division',
    shortName: 'Betway Premiership',
    countryCode: 'ZA',
    countryName: 'South Africa',
    confederationCode: 'CAF',
    competitionType: 'LEAGUE',
    level: 'DOMESTIC',
    tier: 1,
    isDomestic: true,
    isContinental: false,
    isInternational: false,
    isNationalTeam: false,
    isYouth: false,
    isSenior: true,
    isWomens: false,
    isMens: true,
  },
};

/**
 * Dynamically builds a CanonicalCompetition object for any league reference.
 */
export function buildCanonicalCompetition(ref: TopLeagueRef): CanonicalCompetition {
  const meta = TOP_LEAGUES_META[ref.id];
  const rank = getLeagueRank(ref.id);
  const uppercaseId = ref.slug.toUpperCase().replace(/-/g, '_');

  const name = meta?.name || ref.slug.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  const shortName = meta?.shortName || name;
  const countryCode = meta?.countryCode || 'GLOBAL';
  const countryName = meta?.countryName || 'International';
  const confed = meta?.confederationCode || 'FIFA';

  return {
    id: uppercaseId,
    providerId: ref.id,
    providerName: 'allsportsapi',
    apiSportsId: ref.id,
    slug: ref.slug,
    name,
    shortName,
    countryCode,
    countryName,
    confederationCode: confed,
    sport: 'football',
    gender: meta?.isWomens ? 'FEMALE' : 'MALE',
    ageCategory: meta?.isYouth ? (ref.slug.includes('u17') ? 'U17' : 'U20') : 'SENIOR',
    competitionType: meta?.competitionType || 'LEAGUE',
    level: meta?.level || 'DOMESTIC',
    tier: meta?.tier || 1,
    season: '2026/2027',
    status: 'ACTIVE',
    isDomestic: meta?.isDomestic ?? true,
    isContinental: meta?.isContinental ?? false,
    isInternational: meta?.isInternational ?? false,
    isNationalTeam: meta?.isNationalTeam ?? false,
    isYouth: meta?.isYouth ?? false,
    isSenior: meta?.isSenior ?? true,
    isWomens: meta?.isWomens ?? false,
    isMens: meta?.isMens ?? true,
    isFeatured: rank <= 12,
    isIndexable: true,
    priorityRank: rank,
    displayOrder: rank,
    logoUrl: `https://apiv2.allsportsapi.com/logo/logo_leagues/${ref.id}_${ref.slug}.png`,
    countryFlagUrl: countryCode && countryCode.length === 2 ? `https://media.api-sports.io/flags/${countryCode.toLowerCase()}.svg` : '/icon.png',
    canonicalSlug: ref.slug,
    qualifierLeagueId: meta?.qualifierLeagueId,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  };
}

// Generate the canonical list from TOP_LEAGUES
export const CANONICAL_COMPETITIONS_LIST: CanonicalCompetition[] = TOP_LEAGUES.map(buildCanonicalCompetition);

// Fast lookup map by ID, Slug, and providerId
export const CANONICAL_COMPETITIONS: Record<string, CanonicalCompetition> = {};
for (const comp of CANONICAL_COMPETITIONS_LIST) {
  CANONICAL_COMPETITIONS[comp.id] = comp;
  CANONICAL_COMPETITIONS[comp.slug] = comp;
  CANONICAL_COMPETITIONS[String(comp.providerId)] = comp;
}

export function getAllCanonicalCompetitions(): CanonicalCompetition[] {
  return CANONICAL_COMPETITIONS_LIST;
}

/**
 * Dynamic resolution: checks TOP_LEAGUES first, then constructs dynamic competition for any other slug or ID.
 */
export function getCanonicalCompetition(idOrSlug: string): CanonicalCompetition | undefined {
  if (!idOrSlug) return undefined;
  const clean = idOrSlug.toLowerCase().trim();

  // Guard: Quarantine sentinel IDs should never resolve to a valid canonical competition
  if (clean === 'goalmills-unresolved' || clean === 'unresolved' || clean === 'goalmills_unresolved') {
    return undefined;
  }

  // 1. Direct hit in pre-built top competitions
  if (CANONICAL_COMPETITIONS[clean] || CANONICAL_COMPETITIONS[idOrSlug.toUpperCase()]) {
    return CANONICAL_COMPETITIONS[clean] || CANONICAL_COMPETITIONS[idOrSlug.toUpperCase()];
  }

  // 2. Lookup in TOP_LEAGUES
  const topMatch = TOP_LEAGUES.find(
    (l) => l.slug === clean || String(l.id) === clean || l.slug.replace(/-/g, '_') === clean
  );
  if (topMatch) {
    const built = buildCanonicalCompetition(topMatch);
    CANONICAL_COMPETITIONS[clean] = built;
    return built;
  }

  // 3. Fallback for unranked or dynamic league
  const isNumeric = /^\d+$/.test(clean);
  const fallbackId = isNumeric ? Number(clean) : 0;
  const slugName = clean.replace(/^(caf|uefa|fifa)[-_]/i, '').replace(/[-_]/g, ' ');
  const formattedName = slugName
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const dynamicComp: CanonicalCompetition = {
    id: clean.toUpperCase().replace(/[- ]/g, '_'),
    providerId: fallbackId,
    providerName: 'allsportsapi',
    slug: clean,
    name: formattedName || 'Football League',
    shortName: formattedName || 'League',
    countryCode: clean.includes('afcon') || clean.includes('caf') ? 'CAF' : 'GLOBAL',
    countryName: clean.includes('afcon') || clean.includes('caf') ? 'Africa' : 'International',
    confederationCode: clean.includes('afcon') || clean.includes('caf') ? 'CAF' : 'FIFA',
    sport: 'football',
    gender: clean.includes('women') ? 'FEMALE' : 'MALE',
    ageCategory: clean.includes('u17') ? 'U17' : clean.includes('u20') ? 'U20' : 'SENIOR',
    competitionType: clean.includes('afcon') || clean.includes('world-cup') ? 'CONTINENTAL_NATIONAL' : 'LEAGUE',
    level: 'DOMESTIC',
    tier: 2,
    season: '2026/2027',
    status: 'ACTIVE',
    isDomestic: !clean.includes('afcon') && !clean.includes('world-cup'),
    isContinental: clean.includes('afcon') || clean.includes('champions-league'),
    isInternational: clean.includes('world-cup'),
    isNationalTeam: clean.includes('afcon') || clean.includes('world-cup') || clean.includes('chan'),
    isYouth: clean.includes('u20') || clean.includes('u17'),
    isSenior: !clean.includes('u20') && !clean.includes('u17'),
    isWomens: clean.includes('women'),
    isMens: !clean.includes('women'),
    isFeatured: false,
    isIndexable: true,
    priorityRank: UNRANKED,
    displayOrder: UNRANKED,
    logoUrl: fallbackId ? `https://apiv2.allsportsapi.com/logo/logo_leagues/${fallbackId}.png` : '/icon.png',
    countryFlagUrl: '/icon.png',
    canonicalSlug: clean,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  };

  CANONICAL_COMPETITIONS[clean] = dynamicComp;
  return dynamicComp;
}

export function getCanonicalCompetitionByProviderId(providerId: number): CanonicalCompetition | undefined {
  return CANONICAL_COMPETITIONS[String(providerId)] || getCanonicalCompetition(String(providerId));
}

export function getCompetitionsByCountry(countryCode: string): CanonicalCompetition[] {
  const norm = countryCode.toUpperCase();
  return CANONICAL_COMPETITIONS_LIST.filter((c) => c.countryCode.toUpperCase() === norm);
}

export function getCompetitionsByConfederation(confedCode: string): CanonicalCompetition[] {
  const norm = confedCode.toUpperCase();
  return CANONICAL_COMPETITIONS_LIST.filter((c) => c.confederationCode.toUpperCase() === norm);
}

export function getFeaturedCompetitions(): CanonicalCompetition[] {
  return CANONICAL_COMPETITIONS_LIST.filter((c) => c.isFeatured);
}

export function getAfricaPriorityCompetitions(): CanonicalCompetition[] {
  return CANONICAL_COMPETITIONS_LIST.filter((c) => c.confederationCode === 'CAF');
}

export function getTop5EuropeanCompetitions(): CanonicalCompetition[] {
  return CANONICAL_COMPETITIONS_LIST.filter((c) => [152, 302, 207, 175, 168].includes(c.providerId));
}
