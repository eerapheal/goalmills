/**
 * Slug and SEO URL utilities for GoalMills
 */

export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (é → e, ü → u)
    .replace(/[^\w\s-]/g, '') // remove non-word chars except spaces & hyphens
    .replace(/[\s_-]+/g, '-') // collapse whitespace and underscores into single dash
    .replace(/^-+|-+$/g, ''); // trim leading/trailing dashes
}

export interface SlugIdentifiable {
  _id?: string | { toString(): string };
  id?: string;
  slug?: string;
  title?: string;
}

/**
 * Returns canonical news article URL using slug for optimal SEO performance
 */
export function getNewsUrl(item?: SlugIdentifiable | string | null): string {
  if (!item) return '/news';
  if (typeof item === 'string') {
    if (/^[0-9a-fA-F]{24}$/.test(item)) return '/news';
    return `/news/${item}`;
  }

  const slug = item.slug || (item.title ? slugify(item.title) : '');
  return slug ? `/news/${slug}` : '/news';
}

/**
 * Returns the primary slug or id string for an article
 */
export function getNewsSlug(item?: SlugIdentifiable | string | null): string {
  if (!item) return '';
  if (typeof item === 'string') {
    if (/^[0-9a-fA-F]{24}$/.test(item)) return '';
    return item;
  }
  return item.slug || (item.title ? slugify(item.title) : '') || '';
}

// ─── Football-Specific Slug Utilities ──────────────────────────────────────────

/**
 * Build a match slug:  home-team-vs-away-team-YYYY-eventKey
 * e.g. "arsenal-vs-manchester-city-2026-12345" or "arsenal-vs-chelsea-2026"
 * The year is dynamically computed from event_date or current calendar year.
 */
export function buildMatchSlug(match: {
  event_home_team?: string;
  event_away_team?: string;
  event_date?: string;
  event_key?: string | number;
}): string {
  const home = slugify(match.event_home_team || 'home');
  const away = slugify(match.event_away_team || 'away');
  const year = match.event_date
    ? match.event_date.split('-')[0]
    : new Date().getFullYear().toString();
  const key = match.event_key;
  return key ? `${home}-vs-${away}-${year}-${key}` : `${home}-vs-${away}-${year}`;
}

export interface ParsedMatchSlug {
  rawSlug: string;
  eventKey: string;
  homeSlug: string;
  awaySlug: string;
  year: string;
}

/**
 * Parses match slugs of various canonical forms:
 * - "teama-vs-teamb-2026-12345"
 * - "teama-vs-teamb-2026"
 * - "teama-vs-teamb-2026-09-14-12345" (legacy)
 * - "12345" (pure numeric ID)
 */
export function parseMatchSlug(slug: string): ParsedMatchSlug {
  if (!slug) {
    return {
      rawSlug: '',
      eventKey: '',
      homeSlug: '',
      awaySlug: '',
      year: new Date().getFullYear().toString(),
    };
  }

  // Pure numeric ID: e.g. "1869244"
  if (/^\d+$/.test(slug)) {
    return {
      rawSlug: slug,
      eventKey: slug,
      homeSlug: '',
      awaySlug: '',
      year: new Date().getFullYear().toString(),
    };
  }

  // Legacy format: {home}-vs-{away}-YYYY-MM-DD-{key}
  const legacyMatch = slug.match(/^(.*?)-vs-(.*?)-(\d{4})-\d{2}-\d{2}-(\d+)$/);
  if (legacyMatch) {
    return {
      rawSlug: slug,
      homeSlug: legacyMatch[1],
      awaySlug: legacyMatch[2],
      year: legacyMatch[3],
      eventKey: legacyMatch[4],
    };
  }

  // Standard format: {home}-vs-{away}-{year}-{key}
  const standardMatch = slug.match(/^(.*?)-vs-(.*?)-(\d{4})-(\d+)$/);
  if (standardMatch) {
    return {
      rawSlug: slug,
      homeSlug: standardMatch[1],
      awaySlug: standardMatch[2],
      year: standardMatch[3],
      eventKey: standardMatch[4],
    };
  }

  // Keyless format: {home}-vs-{away}-{year} (e.g. "arsenal-vs-chelsea-2026")
  const keylessMatch = slug.match(/^(.*?)-vs-(.*?)-(\d{4})$/);
  if (keylessMatch) {
    return {
      rawSlug: slug,
      homeSlug: keylessMatch[1],
      awaySlug: keylessMatch[2],
      year: keylessMatch[3],
      eventKey: '',
    };
  }

  // Fallback
  const fallbackKey = extractEventKeyFromSlug(slug);
  return {
    rawSlug: slug,
    homeSlug: '',
    awaySlug: '',
    year: new Date().getFullYear().toString(),
    eventKey: fallbackKey,
  };
}

/**
 * Extract the event key (numeric ID) from a match slug.
 * e.g. "arsenal-vs-manchester-city-2026-12345" → "12345"
 * e.g. "arsenal-vs-manchester-city-2026-08-31-12345" → "12345"
 * Returns empty string if slug is purely keyless like "arsenal-vs-chelsea-2026".
 */
export function extractEventKeyFromSlug(slug: string): string {
  if (!slug) return '';
  // Purely numeric ID
  if (/^\d+$/.test(slug)) return slug;

  // Legacy pattern: ...-YYYY-MM-DD-{eventKey}
  const legacyMatch = slug.match(/-(\d{4}-\d{2}-\d{2})-(\d+)$/);
  if (legacyMatch) return legacyMatch[2];

  // Dynamic Year pattern: ...-{YYYY}-{eventKey}
  const yearKeyMatch = slug.match(/-(\d{4})-(\d+)$/);
  if (yearKeyMatch) return yearKeyMatch[2];

  // If slug ends with -{YYYY} without key (e.g. teama-vs-teamb-2026), no event key attached
  if (/-\d{4}$/.test(slug)) return '';

  // Fallback: last numeric segment after hyphen
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  if (/^\d+$/.test(lastPart)) return lastPart;

  return '';
}

/**
 * Extract a numeric ID or trailing key from any entity slug (e.g. "los-angeles-lakers-1" -> "1", "766" -> "766")
 */
export function extractKeyFromSlug(slug: string): string {
  if (!slug) return '';
  if (/^\d+$/.test(slug)) return slug;
  // Check trailing digits after a hyphen
  const match = slug.match(/-(\d+)$/);
  if (match) return match[1];
  return slug;
}

/**
 * Build a canonical dynamic team slug: e.g. "manchester-city-96" or "arsenal-42" or "arsenal"
 */
export function buildTeamSlug(
  team: { team_name?: string; team_key?: string | number } | string,
  key?: string | number
): string {
  if (typeof team === 'string') {
    const s = slugify(team);
    return key ? `${s}-${key}` : s;
  }
  const s = slugify(team.team_name || '');
  const k = team.team_key || key;
  return k ? `${s}-${k}` : s;
}

export interface ParsedTeamSlug {
  rawSlug: string;
  teamKey: string;
  nameSlug: string;
}

/**
 * Parses team slug supporting:
 * - "manchester-city-96" -> { rawSlug, teamKey: "96", nameSlug: "manchester-city" }
 * - "manchester-city" -> { rawSlug, teamKey: "", nameSlug: "manchester-city" }
 * - "96" -> { rawSlug, teamKey: "96", nameSlug: "" }
 */
export function parseTeamSlug(slug: string): ParsedTeamSlug {
  if (!slug) return { rawSlug: '', teamKey: '', nameSlug: '' };
  if (/^\d+$/.test(slug)) {
    return { rawSlug: slug, teamKey: slug, nameSlug: '' };
  }
  const match = slug.match(/^(.*?)-(\d+)$/);
  if (match) {
    return { rawSlug: slug, teamKey: match[2], nameSlug: match[1] };
  }
  return { rawSlug: slug, teamKey: '', nameSlug: slug };
}

/**
 * Build a canonical dynamic player slug: e.g. "erling-haaland-12345" or "bukayo-saka"
 */
export function buildPlayerSlug(
  player: { player_name?: string; player_key?: string | number } | string,
  key?: string | number
): string {
  if (typeof player === 'string') {
    const s = slugify(player);
    return key ? `${s}-${key}` : s;
  }
  const s = slugify(player.player_name || '');
  const k = player.player_key || key;
  return k ? `${s}-${k}` : s;
}

export interface ParsedPlayerSlug {
  rawSlug: string;
  playerKey: string;
  nameSlug: string;
}

/**
 * Parses player slug supporting:
 * - "erling-haaland-12345" -> { rawSlug, playerKey: "12345", nameSlug: "erling-haaland" }
 * - "erling-haaland" -> { rawSlug, playerKey: "", nameSlug: "erling-haaland" }
 * - "12345" -> { rawSlug, playerKey: "12345", nameSlug: "" }
 */
export function parsePlayerSlug(slug: string): ParsedPlayerSlug {
  if (!slug) return { rawSlug: '', playerKey: '', nameSlug: '' };
  if (/^\d+$/.test(slug)) {
    return { rawSlug: slug, playerKey: slug, nameSlug: '' };
  }
  const match = slug.match(/^(.*?)-(\d+)$/);
  if (match) {
    return { rawSlug: slug, playerKey: match[2], nameSlug: match[1] };
  }
  return { rawSlug: slug, playerKey: '', nameSlug: slug };
}

/**
 * Build a canonical dynamic coach slug: e.g. "pep-guardiola-19" or "mikel-arteta"
 */
export function buildCoachSlug(
  coach: { name?: string; coache?: string; id?: string | number } | string,
  key?: string | number
): string {
  if (typeof coach === 'string') {
    const s = slugify(coach);
    return key ? `${s}-${key}` : s;
  }
  const name = (coach as any).name || (coach as any).coache || '';
  const s = slugify(name);
  const k = (coach as any).id || key;
  return k ? `${s}-${k}` : s;
}

export interface ParsedCoachSlug {
  rawSlug: string;
  coachKey: string;
  nameSlug: string;
}

/**
 * Parses coach slug supporting:
 * - "pep-guardiola-19" -> { rawSlug, coachKey: "19", nameSlug: "pep-guardiola" }
 * - "pep-guardiola" -> { rawSlug, coachKey: "", nameSlug: "pep-guardiola" }
 * - "19" -> { rawSlug, coachKey: "19", nameSlug: "" }
 */
export function parseCoachSlug(slug: string): ParsedCoachSlug {
  if (!slug) return { rawSlug: '', coachKey: '', nameSlug: '' };
  if (/^\d+$/.test(slug)) {
    return { rawSlug: slug, coachKey: slug, nameSlug: '' };
  }
  const match = slug.match(/^(.*?)-(\d+)$/);
  if (match) {
    return { rawSlug: slug, coachKey: match[2], nameSlug: match[1] };
  }
  return { rawSlug: slug, coachKey: '', nameSlug: slug };
}

/**
 * Football route helpers — canonical URL builders
 */
export const footballRoutes = {
  match: (slug: string) => `/football/matches/${slug}`,
  matchFromEvent: (match: {
    event_home_team?: string;
    event_away_team?: string;
    event_date?: string;
    event_key?: string | number;
  }) => `/football/matches/${buildMatchSlug(match)}`,

  team: (slug: string) => `/football/teams/${slug}`,
  teamFromName: (name: string, key?: string | number) =>
    key ? `/football/teams/${slugify(name)}-${key}` : `/football/teams/${slugify(name)}`,

  player: (slug: string) => `/football/players/${slug}`,
  playerFromName: (name: string, key?: string | number) =>
    key ? `/football/players/${slugify(name)}-${key}` : `/football/players/${slugify(name)}`,

  coach: (slug: string) => `/football/coaches/${slug}`,
  coachFromName: (name: string, key?: string | number) =>
    key ? `/football/coaches/${slugify(name)}-${key}` : `/football/coaches/${slugify(name)}`,

  official: (slug: string) => `/football/officials/${slug}`,
  officialFromName: (name: string, key?: string | number) =>
    key ? `/football/officials/${slugify(name)}-${key}` : `/football/officials/${slugify(name)}`,

  competition: (slug: string) => `/football/${slug}`,
};

/**
 * Basketball route helpers — canonical SEO URL builders
 */
export const basketballRoutes = {
  match: (slug: string) => `/basketball/matches/${slug}`,
  matchFromEvent: (match: {
    event_home_team?: string;
    event_away_team?: string;
    event_date?: string;
    event_key?: string | number;
  }) => `/basketball/matches/${buildMatchSlug(match)}`,

  team: (slug: string) => `/basketball/teams/${slug}`,
  teamFromName: (name: string, key?: string | number) =>
    key ? `/basketball/teams/${slugify(name)}-${key}` : `/basketball/teams/${slugify(name)}`,

  league: (slug: string) => `/basketball/leagues/${slug}`,
  leagueFromName: (name: string, key?: string | number) =>
    key ? `/basketball/leagues/${slugify(name)}-${key}` : `/basketball/leagues/${slugify(name)}`,

  player: (slug: string) => `/basketball/players/${slug}`,
  playerFromName: (name: string, key?: string | number) =>
    key ? `/basketball/players/${slugify(name)}-${key}` : `/basketball/players/${slugify(name)}`,

  competition: (slug: string) => `/basketball/${slug}`,
};

/**
 * Cricket route helpers — canonical SEO URL builders
 */
export const cricketRoutes = {
  match: (slug: string) => `/cricket/matches/${slug}`,
  matchFromEvent: (match: {
    event_home_team?: string;
    event_away_team?: string;
    event_date?: string;
    event_date_start?: string | null;
    event_key?: string | number;
  }) =>
    `/cricket/matches/${buildMatchSlug({
      event_home_team: match.event_home_team,
      event_away_team: match.event_away_team,
      event_date: match.event_date || match.event_date_start || undefined,
      event_key: match.event_key,
    })}`,

  team: (slug: string) => `/cricket/teams/${slug}`,
  teamFromName: (name: string, key?: string | number) =>
    key ? `/cricket/teams/${slugify(name)}-${key}` : `/cricket/teams/${slugify(name)}`,

  league: (slug: string) => `/cricket/leagues/${slug}`,
  leagueFromName: (name: string, key?: string | number) =>
    key ? `/cricket/leagues/${slugify(name)}-${key}` : `/cricket/leagues/${slugify(name)}`,

  series: (slug: string) => `/cricket/series/${slug}`,

  player: (slug: string) => `/cricket/players/${slug}`,
  playerFromName: (name: string, key?: string | number) =>
    key ? `/cricket/players/${slugify(name)}-${key}` : `/cricket/players/${slugify(name)}`,

  coach: (slug: string) => `/cricket/coaches/${slug}`,
  coachFromName: (name: string) => `/cricket/coaches/${slugify(name)}`,

  official: (slug: string) => `/cricket/officials/${slug}`,
  officialFromName: (name: string) => `/cricket/officials/${slugify(name)}`,

  competition: (slug: string) => `/cricket/${slug}`,
};
