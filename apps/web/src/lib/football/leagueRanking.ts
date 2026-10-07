/**
 * League Ranking by ID — Foundation for all sorting across the GoalMills football platform.
 *
 * Lower number = higher priority.
 * Leagues not in this map get ranked 999 (bottom).
 * This replaces ALL name-based league matching (MAJOR_LEAGUES, LEAGUE_ID_MAP, priorityKeywords).
 */

export const LEAGUE_PRIORITY_BY_ID: Record<number, number> = {
  // ─── Top 5 European Leagues ─────────────────────────────────────
  152: 1,   // Premier League
  302: 2,   // La Liga
  207: 3,   // Serie A
  175: 4,   // Bundesliga
  168: 5,   // Ligue 1

  // ─── European Club Cups ─────────────────────────────────────────
  3: 6,     // UEFA Champions League
  4: 7,     // UEFA Europa League
  683: 8,   // UEFA Conference League

  // ─── African Competitions (CAF) ─────────────────────────────────
  6: 9,     // Africa Cup of Nations (AFCON)
  19: 10,   // CAF Champions League
  20: 11,   // CAF Confederation Cup
  483: 12,  // NPFL — Nigeria
  270: 13,  // Betway Premiership PSL — South Africa
  200: 14,  // Botola Pro — Morocco
  271: 15,  // Egyptian Premier League
  404: 16,  // Ghana Premier League
  397: 17,  // Kenyan Premier League
  406: 18,  // Tanzanian Premier League

  // ─── FIFA Competitions ──────────────────────────────────────────
  28: 19,   // FIFA World Cup
  29: 20,   // FIFA World Cup Qualification
  15: 21,   // FIFA Club World Cup

  // ─── UEFA National Team ─────────────────────────────────────────
  1: 22,    // UEFA EURO
  5: 23,    // UEFA Nations League

  // ─── South America ──────────────────────────────────────────────
  17: 24,   // Copa América
  13: 25,   // Copa Libertadores
  14: 26,   // Copa Sudamericana
  99: 27,   // Brasileirão Série A
  128: 28,  // Argentine Primera División

  // ─── Other Major European Leagues ───────────────────────────────
  244: 29,  // Eredivisie
  266: 30,  // Liga Portugal
  322: 31,  // Süper Lig — Turkey
  88: 32,   // Jupiler Pro League — Belgium
  284: 33,  // Scottish Premiership

  // ─── English Lower Tiers ────────────────────────────────────────
  153: 34,  // Championship
  146: 35,  // FA Cup
  48: 36,   // EFL Cup (Carabao Cup)

  // ─── Asia ───────────────────────────────────────────────────────
  278: 37,  // Saudi Pro League
  169: 38,  // J1 League — Japan
  292: 39,  // K League 1 — South Korea
  307: 40,  // Chinese Super League

  // ─── North & Central America ────────────────────────────────────
  253: 41,  // MLS — North America
  262: 42,  // Liga MX — Mexico
  16: 43,   // CONCACAF Champions Cup
};

/**
 * Get the priority rank for a league by its ID.
 * Returns 999 for unknown leagues (appear at the bottom).
 */
export function getLeaguePriority(leagueId: number | string | undefined | null): number {
  if (leagueId === undefined || leagueId === null) return 999;
  return LEAGUE_PRIORITY_BY_ID[Number(leagueId)] ?? 999;
}

/**
 * Sort any array of objects that have a league_key property by ranking.
 */
export function sortByLeagueRanking<T extends { league_key?: number | string | null }>(
  items: T[],
): T[] {
  return [...items].sort(
    (a, b) => getLeaguePriority(a.league_key) - getLeaguePriority(b.league_key),
  );
}

/**
 * Group fixtures by league_key (numeric ID) for stage uniqueness.
 * Returns groups sorted by league ranking.
 */
export function groupAndSortByLeague<T extends {
  league_key?: number | string | null;
  league_name?: string | null;
  league_logo?: string | null;
}>(
  items: T[],
): { leagueKey: string; leagueName: string; leagueLogo: string; priority: number; matches: T[] }[] {
  const groups: Record<string, {
    leagueKey: string;
    leagueName: string;
    leagueLogo: string;
    priority: number;
    matches: T[];
  }> = {};

  items.forEach((item) => {
    const key = String(item.league_key || 'unknown');
    if (!groups[key]) {
      groups[key] = {
        leagueKey: key,
        leagueName: item.league_name || 'Other Matches',
        leagueLogo: item.league_logo || '',
        priority: getLeaguePriority(item.league_key),
        matches: [],
      };
    }
    groups[key].matches.push(item);
  });

  return Object.values(groups).sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.leagueName.localeCompare(b.leagueName);
  });
}

/**
 * Current football season label (e.g. "2026/2027").
 * Seasons roll over in July: Jul 2026 – Jun 2027 => "2026/2027".
 * Prefer an API-provided season (e.g. league_season) when one is available.
 */
export function getCurrentSeason(date: Date = new Date(), apiSeason?: string | null): string {
  if (apiSeason && apiSeason.trim()) return apiSeason.trim();
  const year = date.getFullYear();
  const startYear = date.getMonth() >= 6 ? year : year - 1; // getMonth(): 6 = July
  return `${startYear}/${startYear + 1}`;
}

/**
 * Known tournament IDs that use multi-group format (Group A to last group) or multi-year cycles.
 * Clubs use single tables & annual seasons (e.g. 2026/2027), while international tournaments (FIFA, CAF/AFCON, UEFA EURO, etc.)
 * use 4-year or 2-year cycles with qualifiers and tables grouped from A to the last group.
 */
export const TOURNAMENT_LEAGUE_IDS = new Set<number>([
  1,   // UEFA EURO (4-year tournament, Groups A-F)
  3,   // UEFA Champions League (Group stage / 36-team Swiss League phase)
  4,   // UEFA Europa League
  5,   // UEFA Nations League (Groups)
  6,   // AFCON - Africa Cup of Nations (2-year tournament, Groups A-F + Qualifiers)
  13,  // Copa Libertadores (Groups A-H)
  14,  // Copa Sudamericana (Groups A-H)
  15,  // FIFA Club World Cup
  16,  // CONCACAF Champions Cup
  17,  // Copa América (4-year tournament, Groups)
  19,  // CAF Champions League (Groups A-D)
  20,  // CAF Confederation Cup (Groups A-D)
  28,  // FIFA World Cup (4-year tournament, Groups A-L)
  29,  // FIFA World Cup Qualification (Groups A-I)
  683, // UEFA Conference League
]);

export function isTournamentLeague(leagueId: number | string | undefined | null): boolean {
  if (!leagueId) return false;
  return TOURNAMENT_LEAGUE_IDS.has(Number(leagueId));
}

/**
 * Return display season or tournament cycle.
 * e.g. for FIFA World Cup -> "2026 Tournament / Qualifiers"
 * e.g. for AFCON -> "2025/2026 Finals & Qualifiers"
 * e.g. for Premier League -> "2026/2027 Season"
 */
export function getCompetitionSeasonOrCycle(
  leagueId: number | string | undefined | null,
  apiSeason?: string | null
): string {
  if (apiSeason && apiSeason.trim()) return apiSeason.trim();
  const numId = Number(leagueId);
  if (numId === 28 || numId === 29) return '2026 FIFA World Cup';
  if (numId === 6) return 'AFCON 2025/2026';
  if (numId === 1) return 'UEFA EURO';
  if (numId === 17) return 'Copa América';
  return `${getCurrentSeason()} Season`;
}

export interface StandingsGroup<T = any> {
  groupName: string;
  rows: T[];
}

export function cleanGroupName(rawGroup?: string): string {
  if (!rawGroup) return 'Group A';
  const trimmed = rawGroup.trim();
  if (/^group\s+[a-z]$/i.test(trimmed)) {
    return `Group ${trimmed.slice(-1).toUpperCase()}`;
  }
  if (/^[a-z]$/i.test(trimmed)) {
    return `Group ${trimmed.toUpperCase()}`;
  }
  return trimmed;
}

/**
 * Parses raw provider standings into discrete groups (Group A to last group)
 * for international tournaments & cups, or returns a single group for domestic club leagues.
 */
export function parseStandingsIntoGroups<T extends {
  standing_place?: string | number;
  stage_name?: string;
  league_round?: string;
  [key: string]: any;
}>(standings: T[], leagueId?: number | string): StandingsGroup<T>[] {
  if (!Array.isArray(standings) || standings.length === 0) return [];

  const isTourney = isTournamentLeague(leagueId);

  // Check if any row explicitly indicates groups
  const hasExplicitGroups = standings.some(
    (s) =>
      (s.stage_name && /group/i.test(s.stage_name)) ||
      (s.league_round && /group/i.test(s.league_round)) ||
      (s as any).standing_group ||
      (s as any).league_group
  );

  // Check if standing_place resets to "1" multiple times
  const onesCount = standings.filter((s) => String(s.standing_place) === '1').length;
  const hasMultiGroups = hasExplicitGroups || (isTourney && onesCount > 1) || onesCount > 1;

  if (!hasMultiGroups) {
    return [{ groupName: 'Overall Standings', rows: standings }];
  }

  const map = new Map<string, T[]>();
  let autoGroupIdx = 0;
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  standings.forEach((row) => {
    let rawGroup: string | null =
      (row as any).standing_group ||
      (row as any).league_group ||
      (row.stage_name && /group/i.test(row.stage_name) ? row.stage_name : null) ||
      (row.league_round && /group/i.test(row.league_round) ? row.league_round : null);

    if (!rawGroup) {
      if (String(row.standing_place) === '1' && map.size > 0) {
        const lastGroupRows = Array.from(map.values())[autoGroupIdx];
        if (lastGroupRows && lastGroupRows.length > 0) {
          autoGroupIdx++;
        }
      }
      rawGroup = `Group ${alphabet[autoGroupIdx] || autoGroupIdx + 1}`;
    }

    const cleaned = cleanGroupName(rawGroup);
    if (!map.has(cleaned)) {
      map.set(cleaned, []);
    }
    map.get(cleaned)!.push(row);
  });

  return Array.from(map.entries())
    .map(([groupName, rows]) => ({
      groupName,
      rows: rows.sort(
        (a, b) => (parseInt(String(a.standing_place), 10) || 0) - (parseInt(String(b.standing_place), 10) || 0)
      ),
    }))
    .sort((a, b) => a.groupName.localeCompare(b.groupName, undefined, { numeric: true }));
}

