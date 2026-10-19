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

/**
 * Build a display slug for a match (used for screen titles, share links)
 */
export function buildMatchSlug(event: {
  event_home_team?: string;
  event_away_team?: string;
  event_date?: string;
  event_key?: string | number;
}): string {
  const home = slugify(event.event_home_team || 'home');
  const away = slugify(event.event_away_team || 'away');
  const date = event.event_date || '';
  const key = event.event_key || '';
  return `${home}-vs-${away}-${date}-${key}`;
}

/**
 * Extract event key from a slug (the last numeric segment)
 */
export function extractEventKeyFromSlug(slug: string): string {
  const parts = slug.split('-');
  return parts[parts.length - 1] || slug;
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
 * Mobile route helpers — Expo Router paths
 * All routes are relative to the (tabs)/home/football directory
 */
export const mobileFootballRoutes = {
  match: (eventKey: string | number) => `/home/football/matches/${eventKey}`,
  team: (teamKey: string | number) => `/home/football/teams/${teamKey}`,
  player: (playerKey: string | number) => `/home/football/players/${playerKey}`,
  league: (leagueKeyOrSlug: string | number) => getLeagueRoute(leagueKeyOrSlug),
  coach: (coachSlug: string) => `/home/football/coaches/${coachSlug}`,
  official: (officialSlug: string) => `/home/football/officials/${officialSlug}`,
  leaguesList: () => '/home/football/leagues',
  teamsList: () => '/home/football/teams',
  playersList: () => '/home/football/players',
};

