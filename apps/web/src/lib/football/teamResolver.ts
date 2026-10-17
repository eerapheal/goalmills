import { advancedFootballApi } from '@/services/advancedFootballApi';
import { slugify, parseTeamSlug } from '../slugUtils';
import { CLUBS_REGISTRY, ClubMeta } from '../entityService';
import { ALL_COMPETITIONS } from '../competitionCategories';
import { PriorityClub } from '@goalmills/types';
import { PRIORITY_CLUBS, PRIORITY_CLUBS_LIST, getPriorityClub } from './clubRegistry';
import type { FootballTeam, FootballStanding } from '@goalmills/types';

export interface ResolvedTeam {
  teamId: string;
  teamName: string;
  shortName: string;
  teamLogo: string;
  isPriority: boolean;
  priorityClub?: PriorityClub;
}

// Reverse map from provider team key (AllSportsAPI / API-Sports) to PriorityClub
const PROVIDER_TEAM_KEY_MAP = new Map<string, PriorityClub>();
// Exact lowercase team name map
const TEAM_NAME_EXACT_MAP = new Map<string, PriorityClub>();

for (const club of Object.values(CLUBS_REGISTRY)) {
  const pClub: PriorityClub = {
    id: club.slug,
    name: club.name,
    shortName: club.shortName,
    slug: club.slug,
    competitionCanonicalId: club.competitionSlug,
    countryCode: 'XX',
    logoUrl: club.logo,
    providerId: club.id,
  };
  if (club.id) {
    PROVIDER_TEAM_KEY_MAP.set(String(club.id).trim(), pClub);
  }
  TEAM_NAME_EXACT_MAP.set(club.name.trim().toLowerCase(), pClub);
  TEAM_NAME_EXACT_MAP.set(club.shortName.trim().toLowerCase(), pClub);
  TEAM_NAME_EXACT_MAP.set(club.slug.trim().toLowerCase(), pClub);
}

for (const club of PRIORITY_CLUBS_LIST) {
  if (club.providerId) {
    PROVIDER_TEAM_KEY_MAP.set(String(club.providerId).trim(), club);
  }
  TEAM_NAME_EXACT_MAP.set(club.name.trim().toLowerCase(), club);
  TEAM_NAME_EXACT_MAP.set(club.shortName.trim().toLowerCase(), club);
  TEAM_NAME_EXACT_MAP.set(club.slug.trim().toLowerCase(), club);
}

// Common aliases for major clubs across different provider spellings
const TEAM_ALIASES: Record<string, string> = {
  'man utd': 'manchester-united',
  'man united': 'manchester-united',
  'man city': 'manchester-city',
  'tottenham': 'tottenham-hotspur',
  'spurs': 'tottenham-hotspur',
  'wolves': 'wolverhampton-wanderers',
  'wolverhampton': 'wolverhampton-wanderers',
  'atleti': 'atletico-madrid',
  'atl. madrid': 'atletico-madrid',
  'athletic club': 'athletic-bilbao',
  'bayern munich': 'bayern-munich',
  'fc bayern': 'bayern-munich',
  'bvb': 'borussia-dortmund',
  'dortmund': 'borussia-dortmund',
  'psg': 'paris-saint-germain',
  'paris sg': 'paris-saint-germain',
  'inter milan': 'inter-milan',
  'internazionale': 'inter-milan',
  'inter': 'inter-milan',
  'ac milan': 'ac-milan',
  'juve': 'juventus',
  'al ahly sc': 'al-ahly',
  'zamalek sc': 'zamalek',
  'mamelodi sundowns fc': 'mamelodi-sundowns',
  'kaizer chiefs fc': 'kaizer-chiefs',
  'orlando pirates fc': 'orlando-pirates',
  'es tunis': 'esperance-tunis',
  'tp mazembe': 'tp-mazembe',
  'raja ca': 'raja-casablanca',
  'wydad ac': 'wydad-ac',
  'enyimba fc': 'enyimba',
  'rivers utd': 'rivers-united',
};

/**
 * Resolves raw team metadata (provider key, team name, logo) into a normalized ResolvedTeam.
 */
export function resolveTeam(
  rawTeamKey?: string | number,
  rawTeamName?: string,
  rawTeamLogo?: string
): ResolvedTeam {
  const teamName = (rawTeamName || '').trim();
  const teamKey = rawTeamKey !== undefined && rawTeamKey !== null ? String(rawTeamKey).trim() : '';
  const normName = teamName.toLowerCase();

  // 1. Primary resolution: by provider team ID
  if (teamKey && PROVIDER_TEAM_KEY_MAP.has(teamKey)) {
    const club = PROVIDER_TEAM_KEY_MAP.get(teamKey)!;
    return {
      teamId: club.id,
      teamName: club.name,
      shortName: club.shortName,
      teamLogo: club.logoUrl || rawTeamLogo || '',
      isPriority: true,
      priorityClub: club,
    };
  }

  // 2. Secondary resolution: by exact registered club name / slug
  if (TEAM_NAME_EXACT_MAP.has(normName)) {
    const club = TEAM_NAME_EXACT_MAP.get(normName)!;
    return {
      teamId: club.id,
      teamName: club.name,
      shortName: club.shortName,
      teamLogo: club.logoUrl || rawTeamLogo || '',
      isPriority: true,
      priorityClub: club,
    };
  }

  // 3. Known alias lookup
  if (TEAM_ALIASES[normName]) {
    const slug = TEAM_ALIASES[normName];
    const local = CLUBS_REGISTRY[slug];
    if (local) {
      return {
        teamId: local.slug,
        teamName: local.name,
        shortName: local.shortName,
        teamLogo: local.logo || rawTeamLogo || '',
        isPriority: true,
      };
    }
    const club = getPriorityClub(slug);
    if (club) {
      return {
        teamId: club.id,
        teamName: club.name,
        shortName: club.shortName,
        teamLogo: club.logoUrl || rawTeamLogo || '',
        isPriority: true,
        priorityClub: club,
      };
    }
  }

  // 4. Fallback for non-priority / provider club
  const cleanId = teamKey ? `team-${teamKey}` : teamName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return {
    teamId: cleanId || 'unknown-team',
    teamName: teamName || 'Unknown Team',
    shortName: teamName || 'Unknown',
    teamLogo: rawTeamLogo || '',
    isPriority: false,
  };
}

// Curated AllSportsAPI provider team keys for top global & African clubs
export const KNOWN_PROVIDER_TEAM_KEYS: Record<string, number> = {
  // Premier League (leagueId: 152)
  'manchester-city': 80,
  'man-city': 80,
  mancity: 80,
  arsenal: 141,
  'arsenal-fc': 141,
  chelsea: 88,
  'chelsea-fc': 88,
  liverpool: 84,
  'liverpool-fc': 84,
  'manchester-united': 102,
  'man-united': 102,
  'man-utd': 102,
  manutd: 102,
  tottenham: 164,
  'tottenham-hotspur': 164,
  spurs: 164,
  'aston-villa': 3088,
  newcastle: 3100,
  'newcastle-united': 3100,
  brighton: 3079,
  'brighton-hove-albion': 3079,
  brentford: 3086,
  everton: 3073,
  fulham: 3085,
  'nottingham-forest': 3089,
  nottingham: 3089,
  bournemouth: 3071,
  'crystal-palace': 3429,
  'west-ham': 22286,
  'west-ham-united': 22286,
  west_ham: 22286,
  leeds: 3103,
  'leeds-united': 3103,

  // La Liga (leagueId: 302)
  'real-madrid': 76,
  barcelona: 97,
  'fc-barcelona': 97,
  barca: 97,
  'atletico-madrid': 73,
  'atl-madrid': 73,
  atleti: 73,
  sevilla: 89,
  'real-sociedad': 153,
  villarreal: 162,
  betis: 7261,
  'real-betis': 7261,
  'athletic-club': 7258,
  'athletic-bilbao': 7258,
  'ath-bilbao': 7258,
  'celta-vigo': 7290,
  valencia: 7272,
  osasuna: 7269,
  'rayo-vallecano': 7264,
  getafe: 7288,
  espanyol: 7268,
  alaves: 7275,
  girona: 7263,

  // Serie A (leagueId: 207)
  inter: 79,
  'inter-milan': 79,
  internazionale: 79,
  'fc-internazionale': 79,
  juventus: 96,
  juve: 96,
  'ac-milan': 159,
  milan: 159,
  napoli: 152,
  roma: 139,
  'as-roma': 139,
  lazio: 93,
  atalanta: 85,
  fiorentina: 4974,
  torino: 4973,
  bologna: 4983,
  como: 8239,
  udinese: 4984,
  genoa: 4986,
  cagliari: 4981,
  parma: 4978,
  monza: 4990,
  lecce: 5010,
  sassuolo: 4975,
  venezia: 5007,

  // Bundesliga (leagueId: 175)
  'bayern-munchen': 72,
  'bayern-munich': 72,
  'fc-bayern': 72,
  bayern: 72,
  'borussia-dortmund': 92,
  dortmund: 92,
  bvb: 92,
  leverkusen: 143,
  'bayer-leverkusen': 143,
  'rb-leipzig': 101,
  leipzig: 101,
  'eintracht-frankfurt': 3945,
  stuttgart: 3933,
  freiburg: 3962,
  'werder-bremen': 3930,
  augsburg: 3934,
  mainz: 3939,
  'union-berlin': 3936,
  hoffenheim: 170,
  'borussia-monchengladbach': 77,
  'b-monchengladbach': 77,

  // Ligue 1 (leagueId: 168)
  psg: 100,
  'paris-saint-germain': 100,
  marseille: 83,
  monaco: 3817,
  lyon: 3815,
  lille: 160,
  nice: 145,
  lens: 3821,
  rennes: 91,
  strasbourg: 3818,
  brest: 3823,
  toulouse: 3794,

  // Super Lig & Other European Clubs
  galatasaray: 192,
  fenerbahce: 7694,
  benfica: 147,
  porto: 13354,
  sporting: 17884,
  'sporting-cp': 17884,

  // African Giants
  'al-ahly': 1028,
  zamalek: 2760,
  'mamelodi-sundowns': 1032,
  sundowns: 1032,
  'orlando-pirates': 1033,
  'kaizer-chiefs': 1035,
  'wydad-ac': 1030,
  'raja-casablanca': 1031,
  'esperance-tunis': 1034,
  enyimba: 1222,
  'rivers-united': 5530,
  'kano-pillars': 5529,
  'enugu-rangers': 5528,
};

// Direct mapping of provider team keys to their canonical league
export const KNOWN_TEAM_LEAGUES: Record<number, { leagueId: number; leagueName: string; leagueSlug: string }> = {
  // Premier League (152)
  80: { leagueId: 152, leagueName: 'Premier League', leagueSlug: 'premier-league' },
  141: { leagueId: 152, leagueName: 'Premier League', leagueSlug: 'premier-league' },
  84: { leagueId: 152, leagueName: 'Premier League', leagueSlug: 'premier-league' },
  88: { leagueId: 152, leagueName: 'Premier League', leagueSlug: 'premier-league' },
  102: { leagueId: 152, leagueName: 'Premier League', leagueSlug: 'premier-league' },
  164: { leagueId: 152, leagueName: 'Premier League', leagueSlug: 'premier-league' },
  3088: { leagueId: 152, leagueName: 'Premier League', leagueSlug: 'premier-league' },
  3100: { leagueId: 152, leagueName: 'Premier League', leagueSlug: 'premier-league' },
  3079: { leagueId: 152, leagueName: 'Premier League', leagueSlug: 'premier-league' },
  3086: { leagueId: 152, leagueName: 'Premier League', leagueSlug: 'premier-league' },
  3073: { leagueId: 152, leagueName: 'Premier League', leagueSlug: 'premier-league' },
  3085: { leagueId: 152, leagueName: 'Premier League', leagueSlug: 'premier-league' },
  3089: { leagueId: 152, leagueName: 'Premier League', leagueSlug: 'premier-league' },
  3071: { leagueId: 152, leagueName: 'Premier League', leagueSlug: 'premier-league' },
  3429: { leagueId: 152, leagueName: 'Premier League', leagueSlug: 'premier-league' },
  22286: { leagueId: 152, leagueName: 'Premier League', leagueSlug: 'premier-league' },
  3103: { leagueId: 152, leagueName: 'Premier League', leagueSlug: 'premier-league' },

  // La Liga (302)
  76: { leagueId: 302, leagueName: 'La Liga', leagueSlug: 'la-liga' },
  97: { leagueId: 302, leagueName: 'La Liga', leagueSlug: 'la-liga' },
  73: { leagueId: 302, leagueName: 'La Liga', leagueSlug: 'la-liga' },
  153: { leagueId: 302, leagueName: 'La Liga', leagueSlug: 'la-liga' },
  162: { leagueId: 302, leagueName: 'La Liga', leagueSlug: 'la-liga' },
  89: { leagueId: 302, leagueName: 'La Liga', leagueSlug: 'la-liga' },
  7261: { leagueId: 302, leagueName: 'La Liga', leagueSlug: 'la-liga' },
  7258: { leagueId: 302, leagueName: 'La Liga', leagueSlug: 'la-liga' },
  7290: { leagueId: 302, leagueName: 'La Liga', leagueSlug: 'la-liga' },
  7272: { leagueId: 302, leagueName: 'La Liga', leagueSlug: 'la-liga' },
  7269: { leagueId: 302, leagueName: 'La Liga', leagueSlug: 'la-liga' },
  7264: { leagueId: 302, leagueName: 'La Liga', leagueSlug: 'la-liga' },
  7288: { leagueId: 302, leagueName: 'La Liga', leagueSlug: 'la-liga' },
  7268: { leagueId: 302, leagueName: 'La Liga', leagueSlug: 'la-liga' },
  7275: { leagueId: 302, leagueName: 'La Liga', leagueSlug: 'la-liga' },
  7263: { leagueId: 302, leagueName: 'La Liga', leagueSlug: 'la-liga' },

  // Serie A (207)
  79: { leagueId: 207, leagueName: 'Serie A', leagueSlug: 'serie-a' },
  159: { leagueId: 207, leagueName: 'Serie A', leagueSlug: 'serie-a' },
  96: { leagueId: 207, leagueName: 'Serie A', leagueSlug: 'serie-a' },
  152: { leagueId: 207, leagueName: 'Serie A', leagueSlug: 'serie-a' },
  139: { leagueId: 207, leagueName: 'Serie A', leagueSlug: 'serie-a' },
  93: { leagueId: 207, leagueName: 'Serie A', leagueSlug: 'serie-a' },
  85: { leagueId: 207, leagueName: 'Serie A', leagueSlug: 'serie-a' },
  4974: { leagueId: 207, leagueName: 'Serie A', leagueSlug: 'serie-a' },
  4973: { leagueId: 207, leagueName: 'Serie A', leagueSlug: 'serie-a' },
  4983: { leagueId: 207, leagueName: 'Serie A', leagueSlug: 'serie-a' },
  8239: { leagueId: 207, leagueName: 'Serie A', leagueSlug: 'serie-a' },
  4984: { leagueId: 207, leagueName: 'Serie A', leagueSlug: 'serie-a' },
  4986: { leagueId: 207, leagueName: 'Serie A', leagueSlug: 'serie-a' },
  4981: { leagueId: 207, leagueName: 'Serie A', leagueSlug: 'serie-a' },
  4978: { leagueId: 207, leagueName: 'Serie A', leagueSlug: 'serie-a' },
  4990: { leagueId: 207, leagueName: 'Serie A', leagueSlug: 'serie-a' },
  5010: { leagueId: 207, leagueName: 'Serie A', leagueSlug: 'serie-a' },
  4975: { leagueId: 207, leagueName: 'Serie A', leagueSlug: 'serie-a' },
  5007: { leagueId: 207, leagueName: 'Serie A', leagueSlug: 'serie-a' },

  // Bundesliga (175)
  72: { leagueId: 175, leagueName: 'Bundesliga', leagueSlug: 'bundesliga' },
  92: { leagueId: 175, leagueName: 'Bundesliga', leagueSlug: 'bundesliga' },
  143: { leagueId: 175, leagueName: 'Bundesliga', leagueSlug: 'bundesliga' },
  101: { leagueId: 175, leagueName: 'Bundesliga', leagueSlug: 'bundesliga' },
  3945: { leagueId: 175, leagueName: 'Bundesliga', leagueSlug: 'bundesliga' },
  3933: { leagueId: 175, leagueName: 'Bundesliga', leagueSlug: 'bundesliga' },
  3962: { leagueId: 175, leagueName: 'Bundesliga', leagueSlug: 'bundesliga' },
  3930: { leagueId: 175, leagueName: 'Bundesliga', leagueSlug: 'bundesliga' },
  3934: { leagueId: 175, leagueName: 'Bundesliga', leagueSlug: 'bundesliga' },
  3939: { leagueId: 175, leagueName: 'Bundesliga', leagueSlug: 'bundesliga' },
  3936: { leagueId: 175, leagueName: 'Bundesliga', leagueSlug: 'bundesliga' },
  170: { leagueId: 175, leagueName: 'Bundesliga', leagueSlug: 'bundesliga' },
  77: { leagueId: 175, leagueName: 'Bundesliga', leagueSlug: 'bundesliga' },

  // Ligue 1 (168)
  100: { leagueId: 168, leagueName: 'Ligue 1', leagueSlug: 'ligue-1' },
  83: { leagueId: 168, leagueName: 'Ligue 1', leagueSlug: 'ligue-1' },
  3817: { leagueId: 168, leagueName: 'Ligue 1', leagueSlug: 'ligue-1' },
  3815: { leagueId: 168, leagueName: 'Ligue 1', leagueSlug: 'ligue-1' },
  160: { leagueId: 168, leagueName: 'Ligue 1', leagueSlug: 'ligue-1' },
  145: { leagueId: 168, leagueName: 'Ligue 1', leagueSlug: 'ligue-1' },
  3821: { leagueId: 168, leagueName: 'Ligue 1', leagueSlug: 'ligue-1' },
  91: { leagueId: 168, leagueName: 'Ligue 1', leagueSlug: 'ligue-1' },
  3818: { leagueId: 168, leagueName: 'Ligue 1', leagueSlug: 'ligue-1' },
  3823: { leagueId: 168, leagueName: 'Ligue 1', leagueSlug: 'ligue-1' },
  3794: { leagueId: 168, leagueName: 'Ligue 1', leagueSlug: 'ligue-1' },
};

function teamNamesMatch(fetchedTeamName: string, targetSlug: string, localClubName?: string): boolean {
  if (!fetchedTeamName || !targetSlug) return true;
  const f = slugify(fetchedTeamName);
  const t = slugify(targetSlug);

  if (f === t || f.includes(t) || t.includes(f)) return true;

  // Inter / Internazionale
  if ((t.includes('inter') || t === 'internazionale') && (f.includes('inter') || f.includes('internazionale'))) {
    return true;
  }
  // Man City
  if ((t.includes('manchester-city') || t === 'man-city') && (f.includes('manchester-city') || f.includes('man-city'))) {
    return true;
  }
  // Man Utd
  if ((t.includes('manchester-united') || t === 'man-utd' || t === 'man-united') && (f.includes('manchester-united') || f.includes('man-united'))) {
    return true;
  }
  // Bayern
  if (t.includes('bayern') && f.includes('bayern')) {
    return true;
  }
  // Chelsea
  if (t.includes('chelsea') && f.includes('chelsea')) {
    return true;
  }
  // Arsenal
  if (t.includes('arsenal') && f.includes('arsenal')) {
    return true;
  }
  // Real Madrid
  if (t.includes('real-madrid') && f.includes('real-madrid')) {
    return true;
  }
  // Barcelona
  if (t.includes('barcelona') && f.includes('barcelona')) {
    return true;
  }
  // AC Milan
  if (t.includes('milan') && f.includes('milan')) {
    return true;
  }

  if (localClubName) {
    const l = slugify(localClubName);
    if (f.includes(l) || l.includes(f)) return true;
  }

  return false;
}

export interface ResolvedTeamData {
  team: FootballTeam;
  teamKey: number;
  clubMeta: ClubMeta | null;
  leagueId?: number;
  leagueName?: string;
  leagueSlug?: string;
  standing?: FootballStanding | null;
}

/**
 * Resolves a team and its full data using prioritized fallbacks:
 * 1. Numeric ID in URL (e.g. "arsenal-141" -> 141) with name sanity check
 * 2. KNOWN_PROVIDER_TEAM_KEYS map
 * 3. Competition Standings lookup (using club registry competitionSlug -> leagueId)
 * 4. AllSportsAPI getTeams search with candidate squad verification
 */
export async function resolveFootballTeam(rawSlug: string): Promise<ResolvedTeamData | null> {
  if (!rawSlug) return null;

  const { teamKey: parsedTeamKey, nameSlug } = parseTeamSlug(rawSlug);
  const resolvedSlug = (nameSlug || rawSlug).toLowerCase();

  // Find local metadata if present
  const localClub =
    CLUBS_REGISTRY[resolvedSlug] ||
    Object.values(CLUBS_REGISTRY).find(
      (c) =>
        c.slug.toLowerCase() === resolvedSlug ||
        slugify(c.name).toLowerCase() === resolvedSlug ||
        slugify(c.shortName).toLowerCase() === resolvedSlug ||
        String(c.id) === parsedTeamKey
    ) ||
    null;

  let teamId: number | null = null;
  let candidateTeam: FootballTeam | null = null;

  // 1. If known provider key exists for this name slug, prefer it to prevent stale/corrupt ID collisions
  if (nameSlug && KNOWN_PROVIDER_TEAM_KEYS[nameSlug]) {
    teamId = KNOWN_PROVIDER_TEAM_KEYS[nameSlug];
  } else if (KNOWN_PROVIDER_TEAM_KEYS[resolvedSlug]) {
    teamId = KNOWN_PROVIDER_TEAM_KEYS[resolvedSlug];
  } else if (parsedTeamKey && !isNaN(Number(parsedTeamKey)) && Number(parsedTeamKey) > 0) {
    teamId = Number(parsedTeamKey);
  }

  // 2. Try fetching team by ID if known
  if (teamId) {
    try {
      const res = await advancedFootballApi.getTeams({ teamId });
      if (Array.isArray(res?.result) && res.result.length > 0) {
        const found = res.result[0];
        if (found && found.team_name && !('cod' in (found as any))) {
          // Safeguard: verify that the fetched team name matches the requested slug
          if (!nameSlug || teamNamesMatch(found.team_name, nameSlug, localClub?.name)) {
            candidateTeam = found;
          } else {
            console.warn(
              `[teamResolver] ID ${teamId} resolved to "${found.team_name}", which does not match "${nameSlug}". Rejecting candidate.`
            );
            teamId = null;
          }
        }
      }
    } catch (e) {
      console.warn('[teamResolver] Error fetching by teamId:', teamId, e);
    }
  }

  // 3. Known league mapping for established teams
  let leagueId: number | undefined;
  let leagueName = localClub?.competitionName;
  let leagueSlug = localClub?.competitionSlug;

  if (teamId && KNOWN_TEAM_LEAGUES[teamId]) {
    const knownLeague = KNOWN_TEAM_LEAGUES[teamId];
    leagueId = knownLeague.leagueId;
    leagueName = knownLeague.leagueName;
    leagueSlug = knownLeague.leagueSlug;
  } else if (localClub?.competitionSlug) {
    const compMeta = ALL_COMPETITIONS.find((c) => c.slug === localClub.competitionSlug);
    if (compMeta?.id) {
      leagueId = compMeta.id;
    }
  }

  // 4. If not resolved, check competition standings
  let standing: FootballStanding | null = null;
  if (!candidateTeam && leagueId) {
    try {
      const standingsRes = await advancedFootballApi.getStandings(leagueId);
      if (standingsRes?.result) {
        const resObj = standingsRes.result as any;
        const table: FootballStanding[] = Array.isArray(resObj)
          ? resObj
          : Array.isArray(resObj.total)
            ? resObj.total
            : [];
        const match = table.find((s) => {
          if (!s) return false;
          const sTeam = s.standing_team || (s as any).team_name;
          if (!sTeam) return false;
          const sSlug = slugify(sTeam);
          return (
            sSlug === resolvedSlug ||
            teamNamesMatch(sTeam, resolvedSlug, localClub?.name) ||
            (localClub && sSlug === slugify(localClub.name)) ||
            (localClub && sSlug === slugify(localClub.shortName))
          );
        });
        if (match && match.team_key) {
          teamId = Number(match.team_key);
          standing = match;
          // Fetch full team squad using resolved team_key
          const teamRes = await advancedFootballApi.getTeams({ teamId });
          if (Array.isArray(teamRes?.result) && teamRes.result.length > 0) {
            candidateTeam = teamRes.result[0];
          }
        }
      }
    } catch (e) {
      console.warn('[teamResolver] Error resolving via standings:', e);
    }
  }

  // 5. Name search with candidate squad verification (pick candidate with players)
  if (!candidateTeam) {
    try {
      const searchName = (localClub?.shortName || localClub?.name || resolvedSlug).replace(/-/g, ' ');
      const nameRes = await advancedFootballApi.getTeams({ teamName: searchName });
      if (Array.isArray(nameRes?.result) && nameRes.result.length > 0) {
        const validCandidates = nameRes.result.filter(
          (t) => t && t.team_name && !('cod' in (t as any))
        );

        // Sort candidates: prefer candidate with players and coaches
        validCandidates.sort((a, b) => {
          const aScore = (Array.isArray(a.players) ? a.players.length : 0) +
                         (Array.isArray(a.coaches) ? a.coaches.length * 10 : 0);
          const bScore = (Array.isArray(b.players) ? b.players.length : 0) +
                         (Array.isArray(b.coaches) ? b.coaches.length * 10 : 0);
          return bScore - aScore;
        });

        // Match by slug or take highest score candidate
        const exactMatch = validCandidates.find(
          (t) =>
            slugify(t.team_name) === resolvedSlug ||
            (localClub && slugify(t.team_name) === slugify(localClub.name))
        );
        candidateTeam = exactMatch || validCandidates[0] || null;
        if (candidateTeam?.team_key) {
          teamId = Number(candidateTeam.team_key);
        }
      }
    } catch (e) {
      console.warn('[teamResolver] Error searching team by name:', e);
    }
  }

  // 6. Final fallback to local registry
  if (!candidateTeam && localClub) {
    candidateTeam = {
      team_key: String(teamId || localClub.id),
      team_name: localClub.name,
      team_logo: localClub.logo,
      players: [],
      coaches: localClub.manager ? [{ coach_name: localClub.manager, coach_country: 'International', coach_age: '' }] : [],
    };
    teamId = teamId || localClub.id;
  }

  if (!candidateTeam || !teamId) {
    return null;
  }

  // If standing was not fetched yet and we have a leagueId, attempt to fetch it now
  if (!standing && leagueId) {
    try {
      const standingsRes = await advancedFootballApi.getStandings(leagueId);
      if (standingsRes?.result) {
        const resObj = standingsRes.result as any;
        const table: FootballStanding[] = Array.isArray(resObj)
          ? resObj
          : Array.isArray(resObj.total)
            ? resObj.total
            : [];
        const match = table.find(
          (s) =>
            s &&
            (String(s.team_key) === String(teamId) ||
              slugify(s.standing_team || (s as any).team_name || '') === resolvedSlug)
        );
        if (match) standing = match;
      }
    } catch {}
  }

  return {
    team: candidateTeam,
    teamKey: teamId,
    clubMeta: localClub,
    leagueId,
    leagueName,
    leagueSlug,
    standing,
  };
}
