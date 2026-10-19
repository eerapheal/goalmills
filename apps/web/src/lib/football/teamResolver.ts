import { advancedFootballApi } from '@/services/advancedFootballApi';
import { slugify, parseTeamSlug } from '../slugUtils';
import { ClubMeta } from '../entityService';
import { ALL_COMPETITIONS } from '../competitionCategories';
import { PriorityClub } from '@goalmills/types';
import type { FootballTeam, FootballStanding, FootballEvent } from '@goalmills/types';
import { getTopLeagueSlug } from './topLeagues';

export interface ResolvedTeam {
  teamId: string;
  teamName: string;
  shortName: string;
  teamLogo: string;
  isPriority: boolean;
  priorityClub?: PriorityClub;
}

// Curated priority clubs identity map for instant resolution
interface LocalPriorityClub {
  id: string;
  providerId: string;
  name: string;
  shortName: string;
  slug: string;
  competitionCanonicalId: string;
  countryCode: string;
  logoUrl?: string;
}

const KNOWN_PRIORITY_CLUBS: Record<string, LocalPriorityClub> = {
  arsenal: {
    id: 'arsenal',
    name: 'Arsenal',
    shortName: 'Arsenal',
    slug: 'arsenal',
    competitionCanonicalId: 'premier-league',
    countryCode: 'GB-ENG',
    providerId: '141',
  },
  chelsea: {
    id: 'chelsea',
    name: 'Chelsea',
    shortName: 'Chelsea',
    slug: 'chelsea',
    competitionCanonicalId: 'premier-league',
    countryCode: 'GB-ENG',
    providerId: '88',
  },
  liverpool: {
    id: 'liverpool',
    name: 'Liverpool',
    shortName: 'Liverpool',
    slug: 'liverpool',
    competitionCanonicalId: 'premier-league',
    countryCode: 'GB-ENG',
    providerId: '84',
  },
  'manchester-city': {
    id: 'manchester-city',
    name: 'Manchester City',
    shortName: 'Man City',
    slug: 'manchester-city',
    competitionCanonicalId: 'premier-league',
    countryCode: 'GB-ENG',
    providerId: '80',
  },
  'manchester-united': {
    id: 'manchester-united',
    name: 'Manchester United',
    shortName: 'Man United',
    slug: 'manchester-united',
    competitionCanonicalId: 'premier-league',
    countryCode: 'GB-ENG',
    providerId: '102',
  },
  'tottenham-hotspur': {
    id: 'tottenham-hotspur',
    name: 'Tottenham Hotspur',
    shortName: 'Spurs',
    slug: 'tottenham-hotspur',
    competitionCanonicalId: 'premier-league',
    countryCode: 'GB-ENG',
    providerId: '164',
  },
  'real-madrid': {
    id: 'real-madrid',
    name: 'Real Madrid CF',
    shortName: 'Real Madrid',
    slug: 'real-madrid',
    competitionCanonicalId: 'la-liga',
    countryCode: 'ES',
    providerId: '76',
  },
  barcelona: {
    id: 'barcelona',
    name: 'FC Barcelona',
    shortName: 'Barcelona',
    slug: 'barcelona',
    competitionCanonicalId: 'la-liga',
    countryCode: 'ES',
    providerId: '97',
  },
  'atletico-madrid': {
    id: 'atletico-madrid',
    name: 'Atlético de Madrid',
    shortName: 'Atleti',
    slug: 'atletico-madrid',
    competitionCanonicalId: 'la-liga',
    countryCode: 'ES',
    providerId: '73',
  },
  'inter-milan': {
    id: 'inter-milan',
    name: 'FC Internazionale Milano',
    shortName: 'Inter',
    slug: 'inter-milan',
    competitionCanonicalId: 'serie-a',
    countryCode: 'IT',
    providerId: '79',
  },
  juventus: {
    id: 'juventus',
    name: 'Juventus FC',
    shortName: 'Juventus',
    slug: 'juventus',
    competitionCanonicalId: 'serie-a',
    countryCode: 'IT',
    providerId: '96',
  },
  'ac-milan': {
    id: 'ac-milan',
    name: 'AC Milan',
    shortName: 'AC Milan',
    slug: 'ac-milan',
    competitionCanonicalId: 'serie-a',
    countryCode: 'IT',
    providerId: '159',
  },
  'bayern-munich': {
    id: 'bayern-munich',
    name: 'FC Bayern München',
    shortName: 'Bayern',
    slug: 'bayern-munich',
    competitionCanonicalId: 'bundesliga',
    countryCode: 'DE',
    providerId: '72',
  },
  'borussia-dortmund': {
    id: 'borussia-dortmund',
    name: 'Borussia Dortmund',
    shortName: 'Dortmund',
    slug: 'borussia-dortmund',
    competitionCanonicalId: 'bundesliga',
    countryCode: 'DE',
    providerId: '92',
  },
  'paris-saint-germain': {
    id: 'paris-saint-germain',
    name: 'Paris Saint-Germain',
    shortName: 'PSG',
    slug: 'paris-saint-germain',
    competitionCanonicalId: 'ligue-1',
    countryCode: 'FR',
    providerId: '100',
  },
  'al-ahly': {
    id: 'al-ahly',
    name: 'Al Ahly SC',
    shortName: 'Al Ahly',
    slug: 'al-ahly',
    competitionCanonicalId: 'caf-champions-league',
    countryCode: 'EG',
    providerId: '585',
  },
  'mamelodi-sundowns': {
    id: 'mamelodi-sundowns',
    name: 'Mamelodi Sundowns FC',
    shortName: 'Sundowns',
    slug: 'mamelodi-sundowns',
    competitionCanonicalId: 'south-african-psl',
    countryCode: 'ZA',
    providerId: '1032',
  },
  zamalek: {
    id: 'zamalek',
    name: 'Zamalek SC',
    shortName: 'Zamalek',
    slug: 'zamalek',
    competitionCanonicalId: 'caf-confederation-cup',
    countryCode: 'EG',
    providerId: '2760',
  },
  'orlando-pirates': {
    id: 'orlando-pirates',
    name: 'Orlando Pirates FC',
    shortName: 'Orlando Pirates',
    slug: 'orlando-pirates',
    competitionCanonicalId: 'south-african-psl',
    countryCode: 'ZA',
    providerId: '1033',
  },
  'kaizer-chiefs': {
    id: 'kaizer-chiefs',
    name: 'Kaizer Chiefs FC',
    shortName: 'Kaizer Chiefs',
    slug: 'kaizer-chiefs',
    competitionCanonicalId: 'south-african-psl',
    countryCode: 'ZA',
    providerId: '1035',
  },
  'raja-casablanca': {
    id: 'raja-casablanca',
    name: 'Raja Club Athletic',
    shortName: 'Raja CA',
    slug: 'raja-casablanca',
    competitionCanonicalId: 'botola-pro',
    countryCode: 'MA',
    providerId: '1031',
  },
  'wydad-ac': {
    id: 'wydad-ac',
    name: 'Wydad AC',
    shortName: 'Wydad',
    slug: 'wydad-ac',
    competitionCanonicalId: 'botola-pro',
    countryCode: 'MA',
    providerId: '1030',
  },
  'esperance-tunis': {
    id: 'esperance-tunis',
    name: 'Espérance Sportive de Tunis',
    shortName: 'ES Tunis',
    slug: 'esperance-tunis',
    competitionCanonicalId: 'caf-champions-league',
    countryCode: 'TN',
    providerId: '1034',
  },
  enyimba: {
    id: 'enyimba',
    name: 'Enyimba FC',
    shortName: 'Enyimba',
    slug: 'enyimba',
    competitionCanonicalId: 'npfl',
    countryCode: 'NG',
    providerId: '1222',
  },
  'rivers-united': {
    id: 'rivers-united',
    name: 'Rivers United FC',
    shortName: 'Rivers Utd',
    slug: 'rivers-united',
    competitionCanonicalId: 'npfl',
    countryCode: 'NG',
    providerId: '5530',
  },
};

// Reverse map from provider team key to PriorityClub
const PROVIDER_TEAM_KEY_MAP = new Map<string, LocalPriorityClub>();
// Exact lowercase team name map
const TEAM_NAME_EXACT_MAP = new Map<string, LocalPriorityClub>();

for (const club of Object.values(KNOWN_PRIORITY_CLUBS)) {
  if (club.providerId) {
    PROVIDER_TEAM_KEY_MAP.set(String(club.providerId).trim(), club);
  }
  TEAM_NAME_EXACT_MAP.set(club.name.trim().toLowerCase(), club);
  TEAM_NAME_EXACT_MAP.set(club.shortName.trim().toLowerCase(), club);
  TEAM_NAME_EXACT_MAP.set(club.slug.trim().toLowerCase(), club);
}

// Legacy API-Sports test IDs compatibility
if (KNOWN_PRIORITY_CLUBS['arsenal']) {
  PROVIDER_TEAM_KEY_MAP.set('42', KNOWN_PRIORITY_CLUBS['arsenal']);
}

// Common aliases for major clubs across different provider spellings
const TEAM_ALIASES: Record<string, string> = {
  'man utd': 'manchester-united',
  'man united': 'manchester-united',
  'man city': 'manchester-city',
  tottenham: 'tottenham-hotspur',
  spurs: 'tottenham-hotspur',
  wolves: 'wolverhampton-wanderers',
  wolverhampton: 'wolverhampton-wanderers',
  atleti: 'atletico-madrid',
  'atl. madrid': 'atletico-madrid',
  'athletic club': 'athletic-bilbao',
  'bayern munich': 'bayern-munich',
  'fc bayern': 'bayern-munich',
  bvb: 'borussia-dortmund',
  dortmund: 'borussia-dortmund',
  psg: 'paris-saint-germain',
  'paris sg': 'paris-saint-germain',
  'inter milan': 'inter-milan',
  internazionale: 'inter-milan',
  inter: 'inter-milan',
  'ac milan': 'ac-milan',
  juve: 'juventus',
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
      priorityClub: {
        id: club.id,
        providerId: club.providerId,
        providerName: 'allsportsapi',
        name: club.name,
        shortName: club.shortName,
        slug: club.slug,
        competitionId: club.competitionCanonicalId,
        countryCode: club.countryCode,
        confederationCode: 'UEFA',
        logoUrl: club.logoUrl || rawTeamLogo || '',
      } as PriorityClub,
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
      priorityClub: {
        id: club.id,
        providerId: club.providerId,
        providerName: 'allsportsapi',
        name: club.name,
        shortName: club.shortName,
        slug: club.slug,
        competitionId: club.competitionCanonicalId,
        countryCode: club.countryCode,
        confederationCode: 'UEFA',
        logoUrl: club.logoUrl || rawTeamLogo || '',
      } as PriorityClub,
    };
  }

  // 3. Known alias lookup
  if (TEAM_ALIASES[normName]) {
    const slug = TEAM_ALIASES[normName];
    const club = KNOWN_PRIORITY_CLUBS[slug];
    if (club) {
      return {
        teamId: club.id,
        teamName: club.name,
        shortName: club.shortName,
        teamLogo: club.logoUrl || rawTeamLogo || '',
        isPriority: true,
        priorityClub: {
        id: club.id,
        providerId: club.providerId,
        providerName: 'allsportsapi',
        name: club.name,
        shortName: club.shortName,
        slug: club.slug,
        competitionId: club.competitionCanonicalId,
        countryCode: club.countryCode,
        confederationCode: 'UEFA',
        logoUrl: club.logoUrl || rawTeamLogo || '',
      } as PriorityClub,
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
  'al-ahly': 585,
  pyramids: 2761,
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
export const KNOWN_TEAM_LEAGUES: Record<
  number,
  { leagueId: number; leagueName: string; leagueSlug: string }
> = {
  // Egyptian Premier League (141)
  585: { leagueId: 141, leagueName: 'Egyptian Premier League', leagueSlug: 'egyptian-premier-league' },
  2760: { leagueId: 141, leagueName: 'Egyptian Premier League', leagueSlug: 'egyptian-premier-league' },
  2761: { leagueId: 141, leagueName: 'Egyptian Premier League', leagueSlug: 'egyptian-premier-league' },
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

function teamNamesMatch(fetchedTeamName: string, targetSlug: string): boolean {
  if (!fetchedTeamName || !targetSlug) return true;
  const f = slugify(fetchedTeamName);
  const t = slugify(targetSlug);

  if (f === t || f.includes(t) || t.includes(f)) return true;

  // Inter / Internazionale
  if (
    (t.includes('inter') || t === 'internazionale') &&
    (f.includes('inter') || f.includes('internazionale'))
  ) {
    return true;
  }
  // Man City
  if (
    (t.includes('manchester-city') || t === 'man-city') &&
    (f.includes('manchester-city') || f.includes('man-city'))
  ) {
    return true;
  }
  // Man Utd
  if (
    (t.includes('manchester-united') || t === 'man-utd' || t === 'man-united') &&
    (f.includes('manchester-united') || f.includes('man-united'))
  ) {
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
  liveMatch?: FootballEvent | null;
}

/**
 * Resolves a team and its full authentic data directly from AllSportsAPI:
 * 1. Checks Livescore first (met=Livescore) - any team playing live is resolved immediately with active live match, key, logo, and league!
 * 2. Checks numeric ID in URL (e.g. "everton-3073" -> 3073, "3073" -> 3073)
 * 3. Checks KNOWN_PROVIDER_TEAM_KEYS map to get exact provider key
 * 4. Fetches team directly from AllSportsAPI met=Teams with squad and coaches (preserving verified name even if provider returns null)
 * 5. If missing or squad empty, queries rolling fixtures (met=Fixtures) to identify team, league, and lineups
 * 6. Resolves league standings from AllSportsAPI met=Standings for ANY league
 * Under no circumstance does this synthesize fake or placeholder candidate data.
 */
export async function resolveFootballTeam(rawSlug: string): Promise<ResolvedTeamData | null> {
  if (!rawSlug) return null;

  const { teamKey: parsedTeamKey, nameSlug } = parseTeamSlug(rawSlug);
  const resolvedSlug = (nameSlug || rawSlug).toLowerCase();

  let teamId: number | null = null;
  let teamName = '';
  let teamLogo = '';
  let leagueId: number | undefined;
  let leagueName: string | undefined;
  let leagueSlug: string | undefined;
  let liveMatch: FootballEvent | null = null;
  let standing: FootballStanding | null = null;
  let candidateTeam: FootballTeam | null = null;

  // 1. Initial ID check from slug
  if (parsedTeamKey && !isNaN(Number(parsedTeamKey)) && Number(parsedTeamKey) > 0) {
    teamId = Number(parsedTeamKey);
  } else if (/^\d+$/.test(rawSlug)) {
    teamId = Number(rawSlug);
  } else if (nameSlug && KNOWN_PROVIDER_TEAM_KEYS[nameSlug]) {
    teamId = KNOWN_PROVIDER_TEAM_KEYS[nameSlug];
  } else if (KNOWN_PROVIDER_TEAM_KEYS[resolvedSlug]) {
    teamId = KNOWN_PROVIDER_TEAM_KEYS[resolvedSlug];
  }

  // 2. LIVESCORE-FIRST RESOLUTION:
  // Query active live matches directly from AllSportsAPI (met=Livescore)
  // If the team has an active live match, we instantly get authentic team name, key, logo, league, and live match data!
  try {
    const liveRes = await advancedFootballApi.getLivescore();
    const liveMatches: FootballEvent[] = Array.isArray(liveRes?.result) ? liveRes.result : [];
    if (liveMatches.length > 0) {
      const matchInLive = liveMatches.find((m) => {
        if (!m) return false;
        if (
          teamId &&
          (String(m.home_team_key) === String(teamId) || String(m.away_team_key) === String(teamId))
        ) {
          return true;
        }
        const hSlug = slugify(m.event_home_team || '');
        const aSlug = slugify(m.event_away_team || '');
        return (
          hSlug === resolvedSlug ||
          aSlug === resolvedSlug ||
          hSlug.includes(resolvedSlug) ||
          aSlug.includes(resolvedSlug) ||
          teamNamesMatch(m.event_home_team || '', resolvedSlug) ||
          teamNamesMatch(m.event_away_team || '', resolvedSlug)
        );
      });

      if (matchInLive) {
        const isHome = teamId
          ? String(matchInLive.home_team_key) === String(teamId)
          : slugify(matchInLive.event_home_team || '').includes(resolvedSlug) ||
            teamNamesMatch(matchInLive.event_home_team || '', resolvedSlug);

        teamId = Number(isHome ? matchInLive.home_team_key : matchInLive.away_team_key) || teamId;
        teamName = (isHome ? matchInLive.event_home_team : matchInLive.event_away_team) || '';
        teamLogo = (isHome ? matchInLive.home_team_logo : matchInLive.away_team_logo) || '';
        if (matchInLive.league_key) {
          leagueId = Number(matchInLive.league_key);
          const rawLName = matchInLive.league_name || '';
          const cName = matchInLive.country_name || '';
          const isGenericPL = rawLName.toLowerCase() === 'premier league' && cName && cName.toLowerCase() !== 'england';
          const resolvedName = isGenericPL ? `${cName} Premier League` : rawLName;
          leagueName = resolvedName;
          leagueSlug = getTopLeagueSlug(leagueId) || slugify(resolvedName);
        }
        liveMatch = matchInLive;
      }
    }
  } catch (e) {
    console.warn('[teamResolver] Livescore query error:', e);
  }

  // 3. Known league mapping fallback
  if (teamId && !leagueId && KNOWN_TEAM_LEAGUES[teamId]) {
    const knownLeague = KNOWN_TEAM_LEAGUES[teamId];
    leagueId = knownLeague.leagueId;
    leagueName = knownLeague.leagueName;
    leagueSlug = knownLeague.leagueSlug;
  }

  // 4. Fetch team directly from AllSportsAPI by teamId (met=Teams)
  if (teamId) {
    try {
      const res = await advancedFootballApi.getTeams({ teamId });
      if (Array.isArray(res?.result) && res.result.length > 0) {
        const found = res.result[0];
        if (found && !('cod' in (found as any))) {
          // Note: some teams return null team_name in met=Teams; preserve verified teamName or fallback
          const verifiedName = found.team_name || teamName || resolvedSlug.replace(/-/g, ' ');
          candidateTeam = {
            ...found,
            team_key: String(teamId),
            team_name: verifiedName,
            team_logo: found.team_logo || teamLogo || '',
          };
          if (!teamName) teamName = verifiedName;
          if (!teamLogo && found.team_logo) teamLogo = found.team_logo;
        }
      }
    } catch (e) {
      console.warn('[teamResolver] Error fetching by teamId:', teamId, e);
    }
  }

  // 5. If candidateTeam is still missing or league is unknown, search rolling fixtures (met=Fixtures)
  if (!candidateTeam || !leagueId) {
    try {
      const now = new Date();
      const from = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const to = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const fixRes = await advancedFootballApi.getFixtures(
        teamId ? { teamId, from, to } : { from, to }
      );
      const fixList: FootballEvent[] = Array.isArray(fixRes?.result) ? fixRes.result : [];

      const matchInFixtures = fixList.find((m) => {
        if (!m) return false;
        if (
          teamId &&
          (String(m.home_team_key) === String(teamId) || String(m.away_team_key) === String(teamId))
        ) {
          return true;
        }
        const hSlug = slugify(m.event_home_team || '');
        const aSlug = slugify(m.event_away_team || '');
        return (
          hSlug === resolvedSlug ||
          aSlug === resolvedSlug ||
          hSlug.includes(resolvedSlug) ||
          aSlug.includes(resolvedSlug) ||
          teamNamesMatch(m.event_home_team || '', resolvedSlug) ||
          teamNamesMatch(m.event_away_team || '', resolvedSlug)
        );
      });

      if (matchInFixtures) {
        const isHome = teamId
          ? String(matchInFixtures.home_team_key) === String(teamId)
          : slugify(matchInFixtures.event_home_team || '').includes(resolvedSlug) ||
            teamNamesMatch(matchInFixtures.event_home_team || '', resolvedSlug);

        teamId = Number(isHome ? matchInFixtures.home_team_key : matchInFixtures.away_team_key) || teamId;
        if (!teamName) {
          teamName = (isHome ? matchInFixtures.event_home_team : matchInFixtures.event_away_team) || '';
        }
        if (!teamLogo) {
          teamLogo = (isHome ? matchInFixtures.home_team_logo : matchInFixtures.away_team_logo) || '';
        }
        if (!leagueId && matchInFixtures.league_key) {
          leagueId = Number(matchInFixtures.league_key);
          const rawLName = matchInFixtures.league_name || '';
          const cName = matchInFixtures.country_name || '';
          const isGenericPL = rawLName.toLowerCase() === 'premier league' && cName && cName.toLowerCase() !== 'england';
          const resolvedName = isGenericPL ? `${cName} Premier League` : rawLName;
          leagueName = resolvedName;
          leagueSlug = getTopLeagueSlug(leagueId) || slugify(resolvedName);
        }

        if (!candidateTeam && teamId) {
          const tRes = await advancedFootballApi.getTeams({ teamId });
          if (Array.isArray(tRes?.result) && tRes.result.length > 0) {
            const found = tRes.result[0];
            candidateTeam = {
              ...found,
              team_key: String(teamId),
              team_name: found.team_name || teamName,
              team_logo: found.team_logo || teamLogo,
            };
          }
        }
      }
    } catch (e) {
      console.warn('[teamResolver] Error searching rolling fixtures:', e);
    }
  }

  // 6. Direct teamName search fallback on AllSportsAPI
  if (!candidateTeam) {
    try {
      const searchName = resolvedSlug.replace(/-/g, ' ');
      const nameRes = await advancedFootballApi.getTeams({ teamName: searchName });
      if (Array.isArray(nameRes?.result) && nameRes.result.length > 0) {
        const valid = nameRes.result.filter((t) => t && !('cod' in (t as any)));
        if (valid.length > 0) {
          valid.sort((a, b) => {
            const aScore =
              (Array.isArray(a.players) ? a.players.length : 0) +
              (Array.isArray(a.coaches) ? a.coaches.length * 10 : 0);
            const bScore =
              (Array.isArray(b.players) ? b.players.length : 0) +
              (Array.isArray(b.coaches) ? b.coaches.length * 10 : 0);
            return bScore - aScore;
          });
          const exactMatch = valid.find(
            (t) => slugify(t.team_name || '') === resolvedSlug || teamNamesMatch(t.team_name || '', resolvedSlug)
          );
          candidateTeam = exactMatch || valid[0];
          if (candidateTeam?.team_key) {
            teamId = Number(candidateTeam.team_key);
            teamName = candidateTeam.team_name;
            teamLogo = candidateTeam.team_logo || '';
          }
        }
      }
    } catch (e) {
      console.warn('[teamResolver] Error searching team by name:', e);
    }
  }

  // 7. If teamId and teamName are verified from livescore/fixtures, construct valid candidateTeam
  if (!candidateTeam && teamId && teamName) {
    candidateTeam = {
      team_key: String(teamId),
      team_name: teamName,
      team_logo: teamLogo || '',
      players: [],
      coaches: [],
    };
  }

  if (!candidateTeam || !teamId) {
    return null;
  }

  // 8. Standings lookup for ANY league where this team plays
  if (leagueId) {
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
              slugify(s.standing_team || (s as any).team_name || '') === slugify(candidateTeam?.team_name || ''))
        );
        if (match) standing = match;
      }
    } catch (e) {
      console.warn('[teamResolver] Error fetching standings for league:', leagueId, e);
    }
  }

  return {
    team: candidateTeam,
    teamKey: teamId,
    clubMeta: null,
    leagueId,
    leagueName,
    leagueSlug,
    standing,
    liveMatch,
  };
}
