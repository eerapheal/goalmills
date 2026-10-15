/**
 * Top league priority order for GoalMills.
 *
 * This is the ONLY hand-maintained football list in the app: AllSportsAPI league IDs
 * in display priority order. IDs are stable across seasons — names, logos, seasons,
 * teams, standings and fixtures are all fetched live from the API.
 *
 * `slug` keeps existing public URLs stable (e.g. /football/premier-league).
 * Every other league from the API is still available, ranked after these.
 */
export interface TopLeagueRef {
  id: number;
  slug: string;
}

export const TOP_LEAGUES: readonly TopLeagueRef[] = [
  { id: 152, slug: 'premier-league' },
  { id: 302, slug: 'la-liga' },
  { id: 207, slug: 'serie-a' },
  { id: 175, slug: 'bundesliga' },
  { id: 168, slug: 'ligue-1' },
  { id: 3, slug: 'champions-league' },
  { id: 4, slug: 'europa-league' },
  { id: 683, slug: 'conference-league' },
  { id: 28, slug: 'fifa-world-cup' },
  { id: 1, slug: 'uefa-euro' },
  { id: 29, slug: 'afcon' },
  { id: 346, slug: 'caf-champions-league' },
  { id: 390, slug: 'caf-confederation-cup' },
  { id: 248, slug: 'npfl' },
  { id: 12614, slug: 'fifa-club-world-cup' },
  { id: 633, slug: 'uefa-nations-league' },
  { id: 18, slug: 'copa-libertadores' },
  { id: 17, slug: 'copa-america' },
  { id: 480, slug: 'chan' },
  { id: 619, slug: 'afcon-u20' },
  { id: 10253, slug: 'afcon-u17' },
  { id: 244, slug: 'eredivisie' },
  { id: 266, slug: 'liga-portugal' },
  { id: 278, slug: 'saudi-pro-league' },
  { id: 332, slug: 'mls' },
  { id: 153, slug: 'championship' },
  { id: 146, slug: 'fa-cup' },
  { id: 99, slug: 'brasileirao' },
  { id: 44, slug: 'liga-profesional' },
  { id: 322, slug: 'turkish-super-lig' },
  { id: 141, slug: 'egyptian-premier-league' },
  { id: 297, slug: 'south-african-psl' },
];

/** Rank used for leagues outside the priority list. */
export const UNRANKED = 999;

const RANK_BY_ID = new Map(TOP_LEAGUES.map((l, i) => [l.id, i + 1]));
const SLUG_BY_ID = new Map(TOP_LEAGUES.map((l) => [l.id, l.slug]));
const ID_BY_SLUG = new Map(TOP_LEAGUES.map((l) => [l.slug, l.id]));

function toId(id: string | number | undefined | null): number {
  const n = typeof id === 'number' ? id : parseInt(String(id ?? ''), 10);
  return Number.isFinite(n) ? n : NaN;
}

/** 1-based priority rank for a league ID, or UNRANKED. */
export function getLeagueRank(id: string | number | undefined | null): number {
  return RANK_BY_ID.get(toId(id)) ?? UNRANKED;
}

export function isTopLeague(id: string | number | undefined | null): boolean {
  return RANK_BY_ID.has(toId(id));
}

export function getTopLeagueSlug(id: string | number | undefined | null): string | undefined {
  return SLUG_BY_ID.get(toId(id));
}

export function getTopLeagueIdBySlug(slug: string): number | undefined {
  return ID_BY_SLUG.get(slug.toLowerCase().trim());
}
