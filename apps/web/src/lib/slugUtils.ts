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
export interface MatchSlugParams {
  event_home_team?: string;
  event_away_team?: string;
  home?: string;
  away?: string;
  event_date?: string;
  date?: string;
  league_name?: string;
  comp?: string;
  competitionId?: string;
  event_key?: string | number;
  id?: string | number;
  league_season?: string;
  season?: string;
}

export function getMatchSeasonSlug(season?: string, date?: string): string {
  if (season) {
    const s = slugify(season.replace('/', '-'));
    return s.endsWith('season') || s.endsWith('sesion') ? s : `${s}-season`;
  }
  let dateObj = new Date();
  if (date) {
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) dateObj = parsed;
  }
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const s = month >= 7 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  return `${s}-season`;
}

/**
 * Build a match slug: home-team-vs-away-team-competition-season-eventKey
 * e.g. "man-city-vs-man-united-english-premier-league-2026-2027-season-1869244"
 * or keyless: "man-city-vs-man-united-english-premier-league-2026-2027-season"
 */
export function buildMatchSlug(match: MatchSlugParams): string {
  const home = slugify(match.home || match.event_home_team || 'home');
  const away = slugify(match.away || match.event_away_team || 'away');

  let compRaw = match.comp || match.league_name || match.competitionId || '';
  if (compRaw === 'ENG-PREMIER-LEAGUE' || compRaw.toLowerCase() === 'premier league') {
    compRaw = 'English Premier League';
  } else if (compRaw === 'ESP-LA-LIGA' || compRaw.toLowerCase() === 'la liga') {
    compRaw = 'Spanish La Liga';
  } else if (compRaw === 'ITA-SERIE-A' || compRaw.toLowerCase() === 'serie a') {
    compRaw = 'Italian Serie A';
  } else if (compRaw === 'GER-BUNDESLIGA' || compRaw.toLowerCase() === 'bundesliga') {
    compRaw = 'German Bundesliga';
  } else if (compRaw === 'FRA-LIGUE-1' || compRaw.toLowerCase() === 'ligue 1') {
    compRaw = 'French Ligue 1';
  }
  const comp = slugify(compRaw || 'football');

  const seasonSlug = getMatchSeasonSlug(
    match.season || match.league_season,
    match.date || match.event_date
  );

  const rawKey = match.event_key !== undefined ? match.event_key : match.id;
  const isSynthetic =
    typeof rawKey === 'string' &&
    (rawKey.startsWith('live-') || rawKey.startsWith('fix-') || rawKey.includes('-'));
  const key = rawKey && !isSynthetic ? String(rawKey) : '';

  return key
    ? `${home}-vs-${away}-${comp}-${seasonSlug}-${key}`
    : `${home}-vs-${away}-${comp}-${seasonSlug}`;
}

export interface ParsedMatchSlug {
  rawSlug: string;
  eventKey: string;
  homeSlug: string;
  awaySlug: string;
  competitionSlug: string;
  season: string;
  year: string;
}

/**
 * Parses match slugs of various dynamic and canonical forms:
 * - "man-city-vs-man-united-english-premier-league-2026-2027-season-1869244"
 * - "man-city-vs-man-united-english-premier-league-2026-2027-season"
 * - "man-city-vs-man-united-enslish-primier-leangue-2026/2027-sesion"
 * - "arsenal-vs-chelsea-2026-12345" (legacy)
 * - "1869244" (pure numeric ID)
 */
export function parseMatchSlug(slug: string): ParsedMatchSlug {
  if (!slug) {
    return {
      rawSlug: '',
      eventKey: '',
      homeSlug: '',
      awaySlug: '',
      competitionSlug: '',
      season: '2026-2027',
      year: new Date().getFullYear().toString(),
    };
  }

  // Normalize slashes (from [...slug] catch-all or encoded URL)
  const normalized = slug.trim().replace(/\/+/g, '/');

  // Pure numeric ID: e.g. "1869244"
  if (/^\d+$/.test(normalized)) {
    return {
      rawSlug: normalized,
      eventKey: normalized,
      homeSlug: '',
      awaySlug: '',
      competitionSlug: '',
      season: '2026-2027',
      year: new Date().getFullYear().toString(),
    };
  }

  // Check for trailing event key: e.g. -1869244 or /1869244
  let eventKey = '';
  let workingSlug = normalized;

  const trailingKeyMatch = workingSlug.match(/[-/](\d+)$/);
  if (trailingKeyMatch) {
    const candidate = trailingKeyMatch[1];
    // If it's not a 4-digit year directly preceded by a word or season
    const isYear = /^\d{4}$/.test(candidate) && /(?:season|sesion|vs|[a-z])[-/]\d{4}$/i.test(workingSlug);
    if (!isYear) {
      eventKey = candidate;
      workingSlug = workingSlug.substring(0, workingSlug.length - trailingKeyMatch[0].length);
    }
  }

  // Must have "-vs-" to split home and remainder
  const vsParts = workingSlug.split(/-vs-/i);
  if (vsParts.length < 2) {
    return {
      rawSlug: normalized,
      eventKey: eventKey || (workingSlug.match(/\d+$/) ? workingSlug.match(/\d+$/)![0] : ''),
      homeSlug: '',
      awaySlug: '',
      competitionSlug: '',
      season: '2026-2027',
      year: new Date().getFullYear().toString(),
    };
  }

  const homeSlug = slugify(vsParts[0]);
  let rest = vsParts.slice(1).join('-vs-');

  // Extract Season
  let season = '2026-2027';
  let year = new Date().getFullYear().toString();

  // Pattern: 2026/2027-season or 2026-2027-season or 2026/2027-sesion or 2026-2027
  const seasonMatch = rest.match(/[-/](\d{4})[/-](\d{4})(?:-(?:season|sesion))?/i);
  if (seasonMatch) {
    year = seasonMatch[1];
    season = `${seasonMatch[1]}-${seasonMatch[2]}`;
    rest = rest.substring(0, seasonMatch.index);
  } else {
    // Single year season: e.g. -2026-season or -2026
    const singleYearMatch = rest.match(/[-/](\d{4})(?:-(?:season|sesion))?/i);
    if (singleYearMatch) {
      year = singleYearMatch[1];
      season = singleYearMatch[1];
      rest = rest.substring(0, singleYearMatch.index);
    }
  }

  // What remains in `rest` is awaySlug and competitionSlug
  const restParts = rest.split('-').filter(Boolean);
  let awaySlug = '';
  let competitionSlug = '';

  const KNOWN_COMPS = [
    'english-premier-league',
    'premier-league',
    'enslish-primier-leangue',
    'la-liga',
    'spanish-la-liga',
    'serie-a',
    'italian-serie-a',
    'bundesliga',
    'german-bundesliga',
    'ligue-1',
    'french-ligue-1',
    'champions-league',
    'uefa-champions-league',
    'europa-league',
    'conference-league',
    'caf-champions-league',
    'afcon',
    'africa-cup-of-nations',
    'fa-cup',
    'carabao-cup',
    'copa-del-rey',
    'dfb-pokal',
    'coppa-italia',
  ];

  let matchedComp = '';
  for (const c of KNOWN_COMPS) {
    if (rest.endsWith(c)) {
      matchedComp = c;
      awaySlug = rest.substring(0, rest.length - c.length).replace(/-+$/, '');
      competitionSlug = c;
      break;
    }
  }

  if (!matchedComp) {
    if (restParts.length >= 3) {
      awaySlug = restParts.slice(0, 2).join('-');
      competitionSlug = restParts.slice(2).join('-');
    } else {
      awaySlug = rest;
      competitionSlug = '';
    }
  }

  return {
    rawSlug: normalized,
    eventKey,
    homeSlug,
    awaySlug,
    competitionSlug,
    season,
    year,
  };
}

/**
 * Extract the event key (numeric ID) from a match slug.
 * e.g. "man-city-vs-man-united-english-premier-league-2026-2027-season-1869244" → "1869244"
 * e.g. "arsenal-vs-manchester-city-2026-12345" → "12345"
 * Returns empty string if slug is purely keyless.
 */
export function extractEventKeyFromSlug(slug: string): string {
  if (!slug) return '';
  return parseMatchSlug(slug).eventKey;
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
