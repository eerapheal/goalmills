import { CANONICAL_COMPETITIONS_LIST } from './football/competitionRegistry';

export const LEAGUE_LOGO_BASE = 'https://media.api-sports.io/football/leagues';
export const leagueLogo = (apiSportsId: number): string => `${LEAGUE_LOGO_BASE}/${apiSportsId}.png`;

export type CompetitionCategory =
  | 'caf'
  | 'european-top5'
  | 'european-club'
  | 'european-domestic'
  | 'domestic-cups'
  | 'fifa'
  | 'uefa-national'
  | 'conmebol'
  | 'concacaf'
  | 'afc'
  | 'other-leagues';

export type CompetitionType = 'league' | 'cup' | 'knockout';
export type Gender = 'men' | 'women' | 'mixed';
export type AgeGroup = 'senior' | 'u21' | 'u20' | 'u19' | 'u17' | 'u16';

export interface CompetitionEntry {
  id: number;
  apiSportsId: number;
  name: string;
  slug: string;
  country: string;
  flag: string;
  logo: string;
  season: string;
  featured: boolean;
  tier: 1 | 2 | 3;
  description: string;
  category: CompetitionCategory;
  competitionType: CompetitionType;
  hasGroups: boolean;
  hasKnockout: boolean;
  gender: Gender;
  ageGroup: AgeGroup;
  qualifierLeagueId?: number;
}

export const COMPETITION_CATEGORY_LABELS: Record<
  CompetitionCategory,
  { label: string; icon: string; order: number }
> = {
  caf: { label: 'Africa (CAF & Premier Leagues)', icon: '🌍', order: 1 },
  'european-top5': { label: 'Top 5 European Leagues', icon: '⭐', order: 2 },
  'european-club': { label: 'European Club Cups', icon: '🏆', order: 3 },
  fifa: { label: 'FIFA Competitions', icon: '🌐', order: 4 },
  'european-domestic': { label: 'European Domestic Leagues', icon: '⚽', order: 5 },
  'domestic-cups': { label: 'Domestic Cups', icon: '🥇', order: 6 },
  'uefa-national': { label: 'UEFA National Team', icon: '🇪🇺', order: 7 },
  conmebol: { label: 'South America (CONMEBOL)', icon: '🌎', order: 8 },
  concacaf: { label: 'North & Central America (CONCACAF)', icon: '🦅', order: 9 },
  afc: { label: 'Asia & Gulf (AFC)', icon: '🌏', order: 10 },
  'other-leagues': { label: 'Other Global Leagues', icon: '🌐', order: 11 },
};

function resolveCategory(confed: string, providerId: number): CompetitionCategory {
  if (confed === 'CAF') return 'caf';
  if ([152, 302, 207, 175, 168].includes(providerId)) return 'european-top5';
  if ([3, 4, 683].includes(providerId)) return 'european-club';
  if (confed === 'FIFA' || [28, 12614].includes(providerId)) return 'fifa';
  if (confed === 'CONMEBOL') return 'conmebol';
  if (confed === 'CONCACAF') return 'concacaf';
  if (confed === 'AFC') return 'afc';
  if (confed === 'UEFA') return 'european-domestic';
  return 'other-leagues';
}

function resolveFlag(countryCode: string, confed: string): string {
  if (confed === 'CAF' || countryCode === 'CAF') return '🌍';
  if (confed === 'UEFA' || countryCode === 'EU') return '🇪🇺';
  if (confed === 'FIFA' || countryCode === 'FIFA') return '🌐';
  if (confed === 'AFC' || countryCode === 'AFC') return '🌏';
  if (countryCode === 'GB-ENG' || countryCode === 'ENGLAND') return '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
  if (countryCode === 'ES') return '🇪🇸';
  if (countryCode === 'IT') return '🇮🇹';
  if (countryCode === 'DE') return '🇩🇪';
  if (countryCode === 'FR') return '🇫🇷';
  if (countryCode === 'NG') return '🇳🇬';
  if (countryCode === 'ZA') return '🇿🇦';
  if (countryCode === 'EG') return '🇪🇬';
  if (countryCode === 'BR') return '🇧🇷';
  if (countryCode === 'AR') return '🇦🇷';
  if (countryCode === 'SA') return '🇸🇦';
  if (countryCode === 'US') return '🇺🇸';
  return '⚽';
}

/**
 * Top ranking competitions dynamically generated from the clean priority registry.
 * Zero hardcoded 1500-line static bloat.
 */
export const ALL_COMPETITIONS: CompetitionEntry[] = CANONICAL_COMPETITIONS_LIST.map((c) => {
  const isCup = c.competitionType === 'CUP';
  const isTourn = c.isNationalTeam || c.isContinental || isCup;

  return {
    id: c.providerId,
    apiSportsId: c.apiSportsId || c.providerId,
    name: c.name,
    slug: c.slug,
    country: c.countryName,
    flag: resolveFlag(c.countryCode, c.confederationCode),
    logo: c.logoUrl || leagueLogo(c.providerId),
    season: c.season,
    featured: c.isFeatured,
    tier: (c.tier as 1 | 2 | 3) || 1,
    description: `${c.name} (${c.countryName}) - Official Match Centre, Live Standings, and Fixtures.`,
    category: resolveCategory(c.confederationCode, c.providerId),
    competitionType: isTourn ? 'knockout' : 'league',
    hasGroups: c.isNationalTeam || c.isContinental,
    hasKnockout: isTourn,
    gender: c.gender === 'FEMALE' ? 'women' : 'men',
    ageGroup: c.isYouth ? 'u20' : 'senior',
    qualifierLeagueId: c.qualifierLeagueId,
  };
});

/**
 * Helper: Get competitions grouped by category (sorted by category order, then by tier)
 */
export function getCompetitionsByCategory(): {
  category: CompetitionCategory;
  label: string;
  icon: string;
  competitions: CompetitionEntry[];
}[] {
  const categoryOrder = Object.entries(COMPETITION_CATEGORY_LABELS).sort(
    ([, a], [, b]) => a.order - b.order
  );

  return categoryOrder
    .map(([cat, meta]) => ({
      category: cat as CompetitionCategory,
      label: meta.label,
      icon: meta.icon,
      competitions: ALL_COMPETITIONS.filter((c) => c.category === cat).sort(
        (a, b) => a.tier - b.tier || a.name.localeCompare(b.name)
      ),
    }))
    .filter((g) => g.competitions.length > 0);
}

/**
 * Helper: Get a flat map of slug → CompetitionEntry for O(1) lookups
 */
export function getCompetitionMap(): Map<string, CompetitionEntry> {
  const map = new Map<string, CompetitionEntry>();
  for (const comp of ALL_COMPETITIONS) {
    map.set(comp.slug, comp);
  }
  return map;
}

/**
 * Helper: Get all league IDs for priority sorting in live scoreboards
 */
export function getAllLeagueIds(): string[] {
  return ALL_COMPETITIONS.map((c) => String(c.id));
}

/**
 * Helper: Get featured/tier-1 competition IDs for quick switcher
 */
export function getFeaturedLeagueIds(): string[] {
  return ALL_COMPETITIONS.filter((c) => c.featured || c.tier === 1).map((c) => String(c.id));
}
