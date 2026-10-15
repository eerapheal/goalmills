/**
 * Live league & team data service (server-side).
 *
 * Everything here comes from AllSportsAPI — there is no static competition or team data.
 * Ordering: leagues follow TOP_LEAGUES priority, then country/name.
 * Teams follow their league's priority, then live standings position.
 */
import { cache } from 'react';
import { slugify } from '../slugUtils';
import { getLeagueRank, getTopLeagueIdBySlug, getTopLeagueSlug, isTopLeague, UNRANKED } from './topLeagues';

const API_BASE = (process.env.FOOTBALL_BASE_URL || 'https://apiv2.allsportsapi.com/football').replace(/\/$/, '');
const API_KEY = process.env.ALLSPORTS_API_KEY || process.env.FOOTBALL_API_KEY || '';

const DAY = 86_400;
const FIVE_MIN = 300;

export interface League {
  id: number;
  name: string;
  slug: string;
  country: string;
  countryKey: number | null;
  logo: string;
  countryLogo: string;
  rank: number;
  isTop: boolean;
}

export interface LeagueTeam {
  id: number;
  name: string;
  slug: string;
  logo: string;
  leagueId: number;
  position: number | null;
  points: number | null;
  group: string | null;
}

interface RawLeague {
  league_key: number | string;
  league_name: string;
  country_key?: number | string | null;
  country_name?: string | null;
  league_logo?: string | null;
  country_logo?: string | null;
}

interface RawTeam {
  team_key: number | string;
  team_name: string;
  team_logo?: string | null;
}

interface RawStanding {
  team_key?: number | string;
  standing_team?: string;
  standing_place?: number | string;
  standing_PTS?: number | string;
  team_logo?: string;
  league_round?: string;
}

/** Low-level AllSportsAPI call. Returns null on any upstream error (incl. billing errors). */
async function allSports<T>(met: string, params: Record<string, string | number>, revalidate: number): Promise<T | null> {
  if (!API_KEY) {
    console.error('[leagueService] ALLSPORTS_API_KEY is not set');
    return null;
  }
  const url = new URL(API_BASE);
  url.searchParams.set('met', met);
  url.searchParams.set('APIkey', API_KEY);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  try {
    const res = await fetch(url.toString(), { next: { revalidate } });
    if (!res.ok) return null;
    const data = await res.json();
    const result = data?.result;
    const upstreamError =
      data?.error && data.error !== '0'
        ? true
        : Array.isArray(result) && result.some((r: any) => r && r.cod && !r.league_key && !r.team_key);
    return upstreamError ? null : (result as T);
  } catch (err) {
    console.warn(`[leagueService] ${met} failed:`, err);
    return null;
  }
}

function validLogo(url?: string | null): string {
  // The API returns a bare folder URL when a league has no logo.
  return url && /\.(png|jpe?g|svg|webp)$/i.test(url) ? url : '';
}

function compareLeagues(a: League, b: League): number {
  return a.rank - b.rank || a.country.localeCompare(b.country) || a.name.localeCompare(b.name);
}

/** All leagues from the API, ranked. Cached for 24h. */
export const getLeagues = cache(async (): Promise<League[]> => {
  const raw = (await allSports<RawLeague[]>('Leagues', {}, DAY)) || [];

  const leagues: League[] = raw
    .filter((l) => l && l.league_key && l.league_name)
    .map((l) => {
      const id = Number(l.league_key);
      return {
        id,
        name: l.league_name.trim(),
        slug: '',
        country: (l.country_name || 'International').trim(),
        countryKey: l.country_key != null ? Number(l.country_key) : null,
        logo: validLogo(l.league_logo),
        countryLogo: validLogo(l.country_logo),
        rank: getLeagueRank(id),
        isTop: isTopLeague(id),
      };
    })
    .sort(compareLeagues);

  // Assign unique, deterministic slugs. Top leagues keep their established slugs;
  // others prefer the bare league name, then country + name, then append the ID.
  const used = new Set<string>(leagues.map((l) => getTopLeagueSlug(l.id)).filter(Boolean) as string[]);
  for (const league of leagues) {
    const fixed = getTopLeagueSlug(league.id);
    if (fixed) {
      league.slug = fixed;
      continue;
    }
    const candidates = [slugify(league.name), slugify(`${league.country} ${league.name}`)];
    league.slug = candidates.find((c) => c && !used.has(c)) || `${candidates[1]}-${league.id}`;
    used.add(league.slug);
  }

  return leagues;
});

/** Top-priority leagues only (in priority order). */
export async function getTopLeagues(limit?: number): Promise<League[]> {
  const top = (await getLeagues()).filter((l) => l.isTop);
  return limit ? top.slice(0, limit) : top;
}

/** Look up a league by slug or numeric AllSportsAPI ID. */
export async function getLeague(slugOrId: string | number): Promise<League | null> {
  const key = String(slugOrId).toLowerCase().trim();
  const leagues = await getLeagues();
  const numeric = /^\d+$/.test(key) ? Number(key) : getTopLeagueIdBySlug(key);
  return (
    (numeric != null ? leagues.find((l) => l.id === numeric) : undefined) ||
    leagues.find((l) => l.slug === key) ||
    null
  );
}

/**
 * Finds the qualification league for a tournament (e.g. "Cup Of Nations" →
 * "Cup Of Nations Qualification"), used when the finals have no standings yet.
 */
export async function getQualifierLeague(league: League): Promise<League | null> {
  const base = league.name.replace(/^(CAF|UEFA|FIFA|CONMEBOL|AFC|CONCACAF)\s+/i, '').toLowerCase();
  const leagues = await getLeagues();
  return (
    leagues.find(
      (l) =>
        l.id !== league.id &&
        l.country === league.country &&
        /qualif/i.test(l.name) &&
        l.name.toLowerCase().includes(base)
    ) || null
  );
}

/** Raw standings rows for a league (total table). Cached for 5 minutes. */
export async function getLeagueStandingsRows(leagueId: number): Promise<RawStanding[]> {
  const result = await allSports<{ total?: RawStanding[] } | RawStanding[]>('Standings', { leagueId }, FIVE_MIN);
  if (!result) return [];
  if (Array.isArray(result)) return result;
  return Array.isArray(result.total) ? result.total : [];
}

/** Teams in a league, ordered by live standings position (unplaced teams last, A–Z). */
export async function getLeagueTeams(leagueId: number): Promise<LeagueTeam[]> {
  const [teams, standings] = await Promise.all([
    allSports<RawTeam[]>('Teams', { leagueId }, DAY),
    getLeagueStandingsRows(leagueId),
  ]);

  const standingByKey = new Map<string, RawStanding>();
  for (const s of standings) if (s?.team_key != null) standingByKey.set(String(s.team_key), s);

  const list: LeagueTeam[] = (teams || [])
    .filter((t) => t && t.team_key && t.team_name)
    .map((t) => {
      const s = standingByKey.get(String(t.team_key));
      return {
        id: Number(t.team_key),
        name: t.team_name.trim(),
        slug: `${slugify(t.team_name)}-${t.team_key}`,
        logo: validLogo(t.team_logo) || validLogo(s?.team_logo),
        leagueId,
        position: s?.standing_place != null ? Number(s.standing_place) : null,
        points: s?.standing_PTS != null ? Number(s.standing_PTS) : null,
        group: s?.league_round || null,
      };
    });

  return list.sort(
    (a, b) =>
      (a.position ?? UNRANKED) - (b.position ?? UNRANKED) ||
      (b.points ?? 0) - (a.points ?? 0) ||
      a.name.localeCompare(b.name)
  );
}

/**
 * Top teams across the priority leagues: league priority first, then table position.
 * Teams that appear in several competitions are listed once (highest-ranked league wins).
 */
export async function getTopTeams(limit = 60, leagueCount = 5): Promise<(LeagueTeam & { leagueName: string; leagueSlug: string })[]> {
  const leagues = await getTopLeagues(leagueCount);
  const perLeague = await Promise.all(leagues.map((l) => getLeagueTeams(l.id)));

  const seen = new Set<number>();
  const out: (LeagueTeam & { leagueName: string; leagueSlug: string })[] = [];
  perLeague.forEach((teams, i) => {
    for (const t of teams) {
      if (seen.has(t.id)) continue;
      seen.add(t.id);
      out.push({ ...t, leagueName: leagues[i].name, leagueSlug: leagues[i].slug });
    }
  });

  // Interleave by table position so the list isn't 20 EPL teams before any La Liga team.
  out.sort(
    (a, b) =>
      (a.position ?? UNRANKED) - (b.position ?? UNRANKED) ||
      getLeagueRank(a.leagueId) - getLeagueRank(b.leagueId)
  );
  return out.slice(0, limit);
}
