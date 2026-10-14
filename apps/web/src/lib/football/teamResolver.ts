import { advancedFootballApi } from '@/services/advancedFootballApi';
import { slugify, parseTeamSlug } from '../slugUtils';
import { CLUBS_REGISTRY, ClubMeta } from '../entityService';
import { ALL_COMPETITIONS } from '../competitionCategories';
import type { FootballTeam, FootballStanding } from '@goalmills/types';

// Curated AllSportsAPI provider team keys for top global & African clubs
export const KNOWN_PROVIDER_TEAM_KEYS: Record<string, number> = {
  // Premier League
  arsenal: 141,
  chelsea: 80,
  liverpool: 84,
  'manchester-city': 72,
  'manchester-united': 102,
  tottenham: 92,
  'tottenham-hotspur': 92,
  newcastle: 86,
  'newcastle-united': 86,
  'aston-villa': 91,
  brentford: 95,
  everton: 93,
  fulham: 101,
  'nottingham-forest': 78,
  west_ham: 81,
  'west-ham-united': 81,
  wolves: 83,
  'wolverhampton-wanderers': 83,

  // La Liga
  'real-madrid': 74,
  barcelona: 97,
  'atletico-madrid': 99,
  sevilla: 110,
  valencia: 94,
  villarreal: 104,
  'athletic-club': 107,
  'real-sociedad': 100,

  // Serie A
  juventus: 96,
  inter: 108,
  'inter-milan': 108,
  milan: 98,
  'ac-milan': 98,
  napoli: 105,
  roma: 106,
  lazio: 111,
  atalanta: 114,

  // Bundesliga
  'bayern-munchen': 157,
  'bayern-munich': 157,
  'borussia-dortmund': 156,
  leverkusen: 158,
  'bayer-leverkusen': 158,
  'rb-leipzig': 282,

  // Ligue 1
  psg: 164,
  'paris-saint-germain': 164,
  marseille: 166,
  monaco: 165,
  lyon: 167,

  // Super Lig
  galatasaray: 191,
  fenerbahce: 192,
  besiktas: 193,

  // African Giants
  'al-ahly': 1028,
  zamalek: 1029,
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
 * 1. Numeric ID in URL (e.g. "arsenal-141" -> 141)
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

  // 1. Check numeric ID from URL
  if (parsedTeamKey && !isNaN(Number(parsedTeamKey)) && Number(parsedTeamKey) > 0) {
    teamId = Number(parsedTeamKey);
  }

  // 2. Check KNOWN_PROVIDER_TEAM_KEYS
  if (!teamId && KNOWN_PROVIDER_TEAM_KEYS[resolvedSlug]) {
    teamId = KNOWN_PROVIDER_TEAM_KEYS[resolvedSlug];
  }

  // 3. If still no provider teamId, try to find team in competition standings
  let leagueId: number | undefined;
  let leagueName = localClub?.competitionName;
  let leagueSlug = localClub?.competitionSlug;

  if (localClub?.competitionSlug) {
    const compMeta = ALL_COMPETITIONS.find((c) => c.slug === localClub.competitionSlug);
    if (compMeta?.id) {
      leagueId = compMeta.id;
    }
  }

  // Try fetching team by ID if known
  if (teamId) {
    try {
      const res = await advancedFootballApi.getTeams({ teamId });
      if (Array.isArray(res?.result) && res.result.length > 0) {
        const found = res.result[0];
        if (found && found.team_name && !('cod' in (found as any))) {
          candidateTeam = found;
        }
      }
    } catch (e) {
      console.warn('[teamResolver] Error fetching by teamId:', teamId, e);
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
          if (!s || !s.team_name) return false;
          const sSlug = slugify(s.team_name);
          return (
            sSlug === resolvedSlug ||
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
          (s) => s && (String(s.team_key) === String(teamId) || slugify(s.team_name || '') === resolvedSlug)
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
