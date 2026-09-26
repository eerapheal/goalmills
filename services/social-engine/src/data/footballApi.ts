/**
 * GoalMills Social Engine — Server-Side AllSportsAPI Client
 *
 * Direct server-side calls to AllSportsAPI (no browser proxy needed).
 * Mirrors the web app's advancedFootballApi.ts but for Node.js runtime.
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import axios from 'axios';
import type {
  FootballEvent,
  FootballStanding,
  FootballFixturesResponse,
  FootballLivescoreResponse,
  FootballStandingsResponse,
  FootballH2HResponse,
} from '@goalmills/types';
import { ALL_LEAGUES, type LeagueConfig } from './leagueConfig';
import { logger } from '../utils/logger';

const API_KEY = () =>
  process.env.FOOTBALL_API_KEY ||
  process.env.ALLSPORTS_API_KEY ||
  process.env.NEXT_PUBLIC_FOOTBALL_API_KEY ||
  '';

const BASE_URL = () => {
  let base = (process.env.FOOTBALL_BASE_URL || 'https://apiv2.allsportsapi.com/football').trim();
  if (!base.endsWith('/')) {
    base += '/';
  }
  return base;
};

/**
 * Generic AllSportsAPI request handler with error resilience
 */
async function apiRequest<T>(
  method: string,
  params: Record<string, string | number> = {}
): Promise<T> {
  const key = API_KEY();
  if (!key) {
    throw new Error('FOOTBALL_API_KEY is not configured');
  }

  // Preserve the /football/ path in the base URL
  const url = new URL(BASE_URL());
  url.searchParams.set('met', method);
  url.searchParams.set('APIkey', key);

  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, String(v));
    }
  }

  logger.debug(`AllSportsAPI request: ${method}`);

  const response = await axios.get<T>(url.toString(), {
    timeout: 15000,
    headers: {
      Accept: 'application/json',
      'User-Agent': 'GoalMills-SocialEngine/1.0',
    },
  });

  const data: any = response.data;
  if (data && data.error === '1') {
    const errorMsg = data.result?.[0]?.msg || 'AllSportsAPI error response';
    logger.warn(`AllSportsAPI note for ${method}: ${errorMsg}`);
  }

  return response.data;
}

/** Format a Date to YYYY-MM-DD */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/** Get date range from today */
function getDateRange(daysBack: number, daysForward: number) {
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - daysBack);
  const to = new Date(now);
  to.setDate(to.getDate() + daysForward);
  return { from: formatDate(from), to: formatDate(to) };
}

/**
 * Safely extract valid football events from API response, filtering out error objects
 */
function extractEvents(response: any): FootballEvent[] {
  if (!response || !Array.isArray(response.result) || response.error === '1') {
    return [];
  }
  return response.result.filter(
    (ev: any) => ev && typeof ev === 'object' && (ev.event_key || ev.event_id || ev.event_home_team)
  );
}

// ═══════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════

/**
 * Fetch upcoming fixtures for a specific league within a date range.
 * Default: next 7 days.
 */
export async function getUpcomingFixtures(
  leagueId: number,
  daysAhead = 7
): Promise<FootballEvent[]> {
  try {
    const { from, to } = getDateRange(0, daysAhead);
    const response = await apiRequest<FootballFixturesResponse>('Fixtures', {
      leagueId,
      from,
      to,
    });
    return extractEvents(response);
  } catch (err) {
    logger.error(`Failed to fetch upcoming fixtures for league ${leagueId}`, err);
    return [];
  }
}

/**
 * Fetch fixtures for all top 5 leagues within a date range.
 */
export async function getAllLeagueFixtures(daysAhead = 7): Promise<Map<LeagueConfig, FootballEvent[]>> {
  const results = new Map<LeagueConfig, FootballEvent[]>();

  const promises = ALL_LEAGUES.map(async (league) => {
    const fixtures = await getUpcomingFixtures(league.id, daysAhead);
    results.set(league, fixtures);
  });

  await Promise.allSettled(promises);
  return results;
}

/**
 * Fetch live matches for a specific league.
 */
export async function getLiveMatches(leagueId: number): Promise<FootballEvent[]> {
  try {
    const response = await apiRequest<FootballLivescoreResponse>('Livescore', { leagueId });
    return extractEvents(response);
  } catch (err) {
    logger.error(`Failed to fetch live matches for league ${leagueId}`, err);
    return [];
  }
}

/**
 * Fetch live matches across all top 5 leagues.
 */
export async function getAllLiveMatches(): Promise<FootballEvent[]> {
  const allMatches: FootballEvent[] = [];

  const promises = ALL_LEAGUES.map(async (league) => {
    const matches = await getLiveMatches(league.id);
    allMatches.push(...matches);
  });

  await Promise.allSettled(promises);
  return allMatches;
}

/**
 * Fetch detailed match data by matchId (includes stats, lineups, scorers).
 */
export async function getMatchDetails(matchId: string): Promise<FootballEvent | null> {
  try {
    const response = await apiRequest<FootballFixturesResponse>('Fixtures', { matchId });
    const results = extractEvents(response);
    return results[0] || null;
  } catch (err) {
    logger.error(`Failed to fetch match details for ${matchId}`, err);
    return null;
  }
}

/**
 * Fetch league standings (total table).
 */
export async function getStandings(leagueId: number): Promise<FootballStanding[]> {
  try {
    const response = await apiRequest<FootballStandingsResponse>('Standings', { leagueId });
    if (response.result && 'total' in response.result) {
      return response.result.total || [];
    }
    return [];
  } catch (err) {
    logger.error(`Failed to fetch standings for league ${leagueId}`, err);
    return [];
  }
}

/**
 * Fetch head-to-head results between two teams.
 */
export async function getH2H(
  firstTeamId: string | number,
  secondTeamId: string | number
): Promise<FootballH2HResponse['result'] | null> {
  try {
    const response = await apiRequest<FootballH2HResponse>('H2H', {
      firstTeamId,
      secondTeamId,
    });
    return response.result || null;
  } catch (err) {
    logger.error(`Failed to fetch H2H: ${firstTeamId} vs ${secondTeamId}`, err);
    return null;
  }
}

/**
 * Fetch fixtures that are exactly N days from today (for pre-match reports).
 */
export async function getFixturesInDays(
  leagueId: number,
  daysFromNow: number
): Promise<FootballEvent[]> {
  try {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysFromNow);
    const dateStr = formatDate(targetDate);

    const response = await apiRequest<FootballFixturesResponse>('Fixtures', {
      leagueId,
      from: dateStr,
      to: dateStr,
    });

    return extractEvents(response);
  } catch (err) {
    logger.error(`Failed to fetch fixtures in ${daysFromNow} days for league ${leagueId}`, err);
    return [];
  }
}
