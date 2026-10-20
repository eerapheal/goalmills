/**
 * GoalMills Mobile Match Resolver Engine
 *
 * Provides resilient multi-stage football match resolution:
 * 1. Primary lookup by numeric eventKey via getFixtures with player stats
 * 2. In-play fallback lookup via getLivescore with matchId
 * 3. Keyless / fuzzy slug search across active livescores and competition fixtures
 * 4. Parallel non-blocking hydration of secondary match data (H2H, odds, AI prediction, videos, table)
 */

import {
  FootballEvent,
  FootballH2HResponse,
  FootballOdds,
  FootballLiveOdd,
  FootballFullMatchOdds,
  FootballProbability,
  FootballVideo,
  FootballStanding,
} from '@goalmills/types';
import { advancedFootballApi } from '../../services/advancedFootballApi';
import { parseMatchSlug, buildMatchSlug, slugify, ParsedMatchSlug } from '../slugUtils';
import { getCanonicalCompetition } from './competitionRegistry';

export interface ResolvedMatchResult {
  match: FootballEvent | null;
  canonicalSlug: string;
  eventKey: string;
  parsedSlug: ParsedMatchSlug;
}

export interface MatchSecondaryData {
  h2h: FootballH2HResponse['result'] | null;
  odds: FootballOdds[];
  liveOdds: FootballLiveOdd[];
  fullOdds: FootballFullMatchOdds | null;
  probability: FootballProbability | null;
  videos: FootballVideo[];
  standings: FootballStanding[];
}

/**
 * Resolves a football match from a canonical slug, legacy slug, or raw eventKey.
 */
export async function resolveFootballMatch(
  slugOrId: string | number
): Promise<ResolvedMatchResult> {
  const parsedSlug = parseMatchSlug(String(slugOrId || ''));
  let foundMatch: FootballEvent | null = null;

  // Stage 1: Lookup by eventKey in fixtures
  if (parsedSlug.eventKey && /^\d+$/.test(parsedSlug.eventKey)) {
    try {
      const fixRes = await advancedFootballApi.getFixtures({
        matchId: Number(parsedSlug.eventKey),
        withPlayerStats: '1',
      });
      if (fixRes?.result && Array.isArray(fixRes.result) && fixRes.result.length > 0) {
        foundMatch = fixRes.result[0];
      }
    } catch (err) {
      console.warn('[MatchResolver] getFixtures by matchId error:', err);
    }

    // Stage 2: Livescore fallback if not found in fixtures (e.g. fresh in-play match)
    if (!foundMatch) {
      try {
        const liveRes = await advancedFootballApi.getLivescore({
          matchId: Number(parsedSlug.eventKey),
        });
        if (liveRes?.result && Array.isArray(liveRes.result) && liveRes.result.length > 0) {
          foundMatch = liveRes.result[0];
        }
      } catch (err) {
        console.warn('[MatchResolver] getLivescore by matchId error:', err);
      }
    }
  }

  // Stage 3: Keyless or fuzzy slug matching (e.g. "arsenal-vs-chelsea-english-premier-league-2026-2027-season")
  if (!foundMatch && parsedSlug.homeSlug && parsedSlug.awaySlug) {
    // 3a. Search active livescores
    try {
      const liveScores = await advancedFootballApi.getLivescore();
      if (liveScores?.result && Array.isArray(liveScores.result)) {
        foundMatch =
          liveScores.result.find((m) => {
            const h = slugify(m.event_home_team || '');
            const a = slugify(m.event_away_team || '');
            return (
              (h.includes(parsedSlug.homeSlug) || parsedSlug.homeSlug.includes(h)) &&
              (a.includes(parsedSlug.awaySlug) || parsedSlug.awaySlug.includes(a))
            );
          }) || null;
      }
    } catch (err) {
      console.warn('[MatchResolver] Live search fallback error:', err);
    }

    // 3b. Search league fixtures if competition slug is present
    if (!foundMatch) {
      try {
        let leagueFixtures: FootballEvent[] | null = null;
        if (parsedSlug.competitionSlug) {
          const canonical = getCanonicalCompetition(parsedSlug.competitionSlug);
          if (canonical?.providerId) {
            const res = await advancedFootballApi.getFixtures({
              leagueId: canonical.providerId,
            });
            if (res?.result && Array.isArray(res.result)) {
              leagueFixtures = res.result;
            }
          }
        }

        const fixturesToSearch =
          leagueFixtures || (await advancedFootballApi.getFixtures())?.result;
        if (Array.isArray(fixturesToSearch)) {
          foundMatch =
            fixturesToSearch.find((m) => {
              const h = slugify(m.event_home_team || '');
              const a = slugify(m.event_away_team || '');
              return (
                (h.includes(parsedSlug.homeSlug) || parsedSlug.homeSlug.includes(h)) &&
                (a.includes(parsedSlug.awaySlug) || parsedSlug.awaySlug.includes(a))
              );
            }) || null;
        }
      } catch (err) {
        console.warn('[MatchResolver] Fixtures search fallback error:', err);
      }
    }
  }

  const canonicalSlug = foundMatch ? buildMatchSlug(foundMatch) : parsedSlug.rawSlug;
  const eventKey = foundMatch?.event_key ? String(foundMatch.event_key) : parsedSlug.eventKey;

  return {
    match: foundMatch,
    canonicalSlug,
    eventKey,
    parsedSlug,
  };
}

/**
 * Loads secondary match insights (H2H, odds, AI prediction, videos, standings) in parallel.
 */
export async function loadMatchSecondaryData(match: FootballEvent): Promise<MatchSecondaryData> {
  const homeKey = match.home_team_key ? Number(match.home_team_key) : undefined;
  const awayKey = match.away_team_key ? Number(match.away_team_key) : undefined;
  const leagueKey = match.league_key ? Number(match.league_key) : undefined;
  const matchId = match.event_key ? Number(match.event_key) : undefined;

  const [h2hRes, oddsRes, liveOddsRes, fullOddsRes, probRes, videoRes, standRes] =
    await Promise.allSettled([
      homeKey && awayKey ? advancedFootballApi.getH2H(homeKey, awayKey) : Promise.resolve(null),
      matchId ? advancedFootballApi.getOdds({ matchId }) : Promise.resolve(null),
      matchId ? advancedFootballApi.getLiveOdds({ matchId }) : Promise.resolve(null),
      matchId ? advancedFootballApi.getFullOdds({ matchId }) : Promise.resolve(null),
      matchId ? advancedFootballApi.getProbabilities({ matchId }) : Promise.resolve(null),
      matchId ? advancedFootballApi.getVideos(matchId) : Promise.resolve(null),
      leagueKey ? advancedFootballApi.getStandings(leagueKey) : Promise.resolve(null),
    ]);

  const rawOdds =
    oddsRes.status === 'fulfilled' && oddsRes.value?.result
      ? (oddsRes.value.result as any)
      : [];
  const oddsList: FootballOdds[] = Array.isArray(rawOdds)
    ? rawOdds
    : (matchId && rawOdds[matchId]) || (match.event_key && rawOdds[match.event_key]) || [];

  const rawLive =
    liveOddsRes.status === 'fulfilled' && liveOddsRes.value?.result
      ? (liveOddsRes.value.result as any)
      : [];
  const liveList: FootballLiveOdd[] = Array.isArray(rawLive)
    ? rawLive
    : (matchId && rawLive[matchId]) || (match.event_key && rawLive[match.event_key]) || [];

  const rawFull =
    fullOddsRes.status === 'fulfilled' && fullOddsRes.value?.result
      ? (fullOddsRes.value.result as any)
      : null;
  const fullObj: FootballFullMatchOdds | null =
    rawFull && typeof rawFull === 'object'
      ? (matchId && rawFull[matchId]) || (match.event_key && rawFull[match.event_key]) || rawFull
      : null;

  const rawStand =
    standRes.status === 'fulfilled' && standRes.value?.result
      ? (standRes.value.result as any)
      : null;
  const standingsList: FootballStanding[] = rawStand
    ? Array.isArray(rawStand)
      ? rawStand
      : rawStand.total || []
    : [];

  return {
    h2h: h2hRes.status === 'fulfilled' && h2hRes.value?.result ? h2hRes.value.result : null,
    odds: oddsList,
    liveOdds: liveList,
    fullOdds: fullObj,
    probability:
      probRes.status === 'fulfilled' && probRes.value?.result?.[0] ? probRes.value.result[0] : null,
    videos: videoRes.status === 'fulfilled' && videoRes.value?.result ? videoRes.value.result : [],
    standings: standingsList,
  };
}
