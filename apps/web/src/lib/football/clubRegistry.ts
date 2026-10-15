import { PriorityClub } from '@goalmills/types';

export const TEAM_LOGO_BASE = 'https://media.api-sports.io/football/teams';
export const teamLogo = (apiSportsTeamId: number): string =>
  `${TEAM_LOGO_BASE}/${apiSportsTeamId}.png`;

/**
 * Priority clubs registry.
 * Teams are now resolved dynamically from AllSportsAPI through leagueService and teamResolver,
 * eliminating 3,900 lines of hardcoded static data.
 */
export const PRIORITY_CLUBS: Record<string, PriorityClub> = {};
export const PRIORITY_CLUBS_LIST: PriorityClub[] = [];

export function getPriorityClub(idOrSlug: string): PriorityClub | undefined {
  if (!idOrSlug) return undefined;
  return PRIORITY_CLUBS[idOrSlug.toLowerCase()];
}

export function getClubsByCompetition(compCanonicalIdOrSlug: string): PriorityClub[] {
  return [];
}

export function getClubsByCountry(countryCode: string): PriorityClub[] {
  return [];
}

export function getAfricanClubs(): PriorityClub[] {
  return [];
}

export function getFeaturedClubs(): PriorityClub[] {
  return [];
}
