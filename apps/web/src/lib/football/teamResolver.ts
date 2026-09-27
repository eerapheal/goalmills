import { PriorityClub } from '@goalmills/types';
import { PRIORITY_CLUBS, PRIORITY_CLUBS_LIST, getPriorityClub } from './clubRegistry';

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
  'wydad ac': 'wydad-casablanca',
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
