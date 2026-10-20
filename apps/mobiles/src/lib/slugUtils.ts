/**
 * Slug Utilities for GoalMills Mobile App
 *
 * Adapted from web slugUtils.ts for Expo Router navigation.
 * Mobile routes use IDs for deep linking but slugify for display.
 */

import { getTopLeagueSlug, getTopLeagueIdBySlug } from './football/topLeagues';

/**
 * Convert any string to a URL-safe slug
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface MatchSlugParams {
  event_home_team?: string;
  event_away_team?: string;
  home?: string;
  away?: string;
  event_date?: string;
  date?: string;
  league_name?: string;
  country_name?: string;
  country?: string;
  league_key?: string | number;
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
 * Build a canonical match slug: home-team-vs-away-team-competition-season-eventKey
 * e.g. "man-city-vs-man-united-english-premier-league-2026-2027-season-1869244"
 * or keyless: "man-city-vs-man-united-english-premier-league-2026-2027-season"
 */
export function buildMatchSlug(match: MatchSlugParams): string {
  const home = slugify(match.home || match.event_home_team || 'home');
  const away = slugify(match.away || match.event_away_team || 'away');

  let compRaw = match.comp || match.league_name || match.competitionId || '';
  if (compRaw.toLowerCase().includes('unresolved')) {
    compRaw = match.league_name || 'football';
  }

  // If compRaw is purely numeric, look up known slug or fallback to league_name
  if (/^\d+$/.test(compRaw)) {
    const knownSlug = getTopLeagueSlug(compRaw);
    if (knownSlug) {
      compRaw = knownSlug;
    } else if (match.league_name) {
      compRaw = match.league_name;
    }
  }

  const country = (match.country_name || match.country || '').trim().toLowerCase();
  const leagueKey = match.league_key !== undefined ? String(match.league_key) : '';

  // Disambiguate "Premier League" by country
  if (
    compRaw === 'ENG-PREMIER-LEAGUE' ||
    (compRaw.toLowerCase() === 'premier league' &&
      (country === 'england' || country === 'gb-eng' || leagueKey === '152' || !country))
  ) {
    compRaw = 'English Premier League';
  } else if (compRaw.toLowerCase() === 'premier league' && country && country !== 'england') {
    compRaw = `${country} Premier League`;
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

  // Normalize slashes (from catch-all or encoded URL)
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
    const isYear =
      /^\d{4}$/.test(candidate) && /(?:season|sesion|vs|[a-z])[-/]\d{4}$/i.test(workingSlug);
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

  const seasonMatch = rest.match(/[-/](\d{4})[/-](\d{4})(?:-(?:season|sesion))?/i);
  if (seasonMatch) {
    year = seasonMatch[1];
    season = `${seasonMatch[1]}-${seasonMatch[2]}`;
    rest = rest.substring(0, seasonMatch.index);
  } else {
    const singleYearMatch = rest.match(/[-/](\d{4})(?:-(?:season|sesion))?/i);
    if (singleYearMatch) {
      year = singleYearMatch[1];
      season = singleYearMatch[1];
      rest = rest.substring(0, singleYearMatch.index);
    }
  }

  const restParts = rest.split('-').filter(Boolean);
  let awaySlug = '';
  let competitionSlug = '';

  const KNOWN_COMPS = [
    'english-premier-league',
    'russian-premier-league',
    'egyptian-premier-league',
    'ukrainian-premier-league',
    'belarusian-premier-league',
    'ghana-premier-league',
    'kenyan-premier-league',
    'tanzania-premier-league',
    'south-african-psl',
    'npfl',
    'ekstraklasa',
    'scottish-premiership',
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
 * Extract event key from a slug (the last numeric segment or extracted eventKey)
 */
export function extractEventKeyFromSlug(slug: string): string {
  if (!slug) return '';
  return parseMatchSlug(slug).eventKey;
}

/**
 * Resolves a match into a clean mobile route path using canonical slug.
 */
export function getMatchRoute(matchOrSlugOrKey: MatchSlugParams | string | number): string {
  if (!matchOrSlugOrKey) return '/home/football';
  if (typeof matchOrSlugOrKey === 'object') {
    return `/home/football/matches/${buildMatchSlug(matchOrSlugOrKey)}`;
  }
  const str = String(matchOrSlugOrKey).trim();
  return `/home/football/matches/${str}`;
}

/**
 * Resolves a league identifier into a clean mobile route path.
 * Prefers canonical slug (e.g. /home/football/leagues/premier-league, /home/football/leagues/ekstraklasa)
 * but gracefully handles numeric IDs when no slug is registered.
 */
export function getLeagueRoute(leagueIdOrSlug: string | number): string {
  if (!leagueIdOrSlug) return '/home/football/leagues';
  const str = String(leagueIdOrSlug).trim();
  const slug = getTopLeagueSlug(str);
  return `/home/football/leagues/${slug || str}`;
}

/**
 * Resolves a league route parameter (which may be a slug like 'premier-league' or numeric id '152')
 * into its AllSportsAPI numeric ID.
 */
export function resolveLeagueId(idOrSlug: string | number | undefined | null): number | undefined {
  if (idOrSlug === undefined || idOrSlug === null || idOrSlug === '') return undefined;
  const str = String(idOrSlug).trim();
  if (/^\d+$/.test(str)) {
    return parseInt(str, 10);
  }
  return getTopLeagueIdBySlug(str);
}

/**
 * Build a canonical dynamic team slug: e.g. "gks-katowice-5820" or "arsenal-141"
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
 * - "gks-katowice-5820" -> { rawSlug, teamKey: "5820", nameSlug: "gks-katowice" }
 * - "manchester-city" -> { rawSlug, teamKey: "", nameSlug: "manchester-city" }
 * - "5820" -> { rawSlug, teamKey: "5820", nameSlug: "" }
 */
export function parseTeamSlug(slug: string): ParsedTeamSlug {
  if (!slug) return { rawSlug: '', teamKey: '', nameSlug: '' };
  const s = String(slug).trim();
  if (/^\d+$/.test(s)) {
    return { rawSlug: s, teamKey: s, nameSlug: '' };
  }
  const match = s.match(/^(.*?)-(\d+)$/);
  if (match) {
    return { rawSlug: s, teamKey: match[2], nameSlug: match[1] };
  }
  return { rawSlug: s, teamKey: '', nameSlug: s };
}

/**
 * Resolves a team identifier into a clean mobile route path.
 */
export function getTeamRoute(teamKeyOrSlug: string | number): string {
  if (!teamKeyOrSlug) return '/home/football/teams';
  const str = String(teamKeyOrSlug).trim();
  return `/home/football/teams/${str}`;
}

/**
 * Mobile route helpers — Expo Router paths
 * All routes are relative to the (tabs)/home/football directory
 */
export const mobileFootballRoutes = {
  match: (matchOrSlugOrKey: MatchSlugParams | string | number) =>
    getMatchRoute(matchOrSlugOrKey),
  team: (teamKeyOrSlug: string | number) => getTeamRoute(teamKeyOrSlug),
  player: (playerKey: string | number) => `/home/football/players/${playerKey}`,
  league: (leagueKeyOrSlug: string | number) => getLeagueRoute(leagueKeyOrSlug),
  coach: (coachSlug: string) => `/home/football/coaches/${coachSlug}`,
  official: (officialSlug: string) => `/home/football/officials/${officialSlug}`,
  leaguesList: () => '/home/football/leagues',
  teamsList: () => '/home/football/teams',
  playersList: () => '/home/football/players',
};


