import {
  KnockoutMatchNode,
  KnockoutParticipant,
  KnockoutRound,
  TournamentBracket,
} from '@goalmills/types';
import { getStagesForCompetition } from './stageService';

export interface RoundConfig {
  id: string;
  name: string;
  slug: string;
  order: number;
  matchCount: number;
  legType: 'SINGLE' | 'TWO_LEGGED';
  status?: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
}

/**
 * Builds a deterministic tournament bracket tree with binary connection links.
 * Each match node is assigned a nextMatchId and nextMatchSlot ('home' | 'away')
 * so the frontend can render the bracket tree without calculating coordinates.
 */
export function buildKnockoutTree(
  roundsConfig: RoundConfig[],
  fixtures: any[] = []
): KnockoutRound[] {
  if (roundsConfig.length === 0) return [];

  const rounds: KnockoutRound[] = [];

  // 1. Create nodes for all rounds
  for (let rIdx = 0; rIdx < roundsConfig.length; rIdx++) {
    const cfg = roundsConfig[rIdx];
    const matches: KnockoutMatchNode[] = [];

    for (let mIdx = 0; mIdx < cfg.matchCount; mIdx++) {
      const matchNum = mIdx + 1;
      const matchId = `node-${cfg.slug}-${matchNum}`;

      // Calculate parent/next match in the subsequent round
      let nextMatchId: string | undefined;
      let nextMatchSlot: 'home' | 'away' | undefined;

      if (rIdx + 1 < roundsConfig.length) {
        const nextRound = roundsConfig[rIdx + 1];
        if (cfg.slug !== 'third-place' && nextRound.slug !== 'third-place') {
          const nextMatchNum = Math.floor(mIdx / 2) + 1;
          nextMatchId = `node-${nextRound.slug}-${nextMatchNum}`;
          nextMatchSlot = mIdx % 2 === 0 ? 'home' : 'away';
        }
      }

      // Default placeholder participants
      const homeParticipant: KnockoutParticipant = {
        teamName: `Match ${matchNum} Home`,
      };
      const awayParticipant: KnockoutParticipant = {
        teamName: `Match ${matchNum} Away`,
      };

      matches.push({
        id: matchId,
        roundId: cfg.id,
        roundSlug: cfg.slug,
        matchNumber: matchNum,
        homeTeam: homeParticipant,
        awayTeam: awayParticipant,
        status: 'SCHEDULED',
        nextMatchId,
        nextMatchSlot,
        legType: cfg.legType,
      });
    }

    rounds.push({
      id: cfg.id,
      stageId: cfg.id,
      name: cfg.name,
      slug: cfg.slug,
      order: cfg.order,
      matchCount: cfg.matchCount,
      legType: cfg.legType,
      status: cfg.status || 'UPCOMING',
      matches,
    });
  }

  // 2. Hydrate matches with real fixtures if provided
  if (fixtures.length > 0) {
    hydrateBracketWithFixtures(rounds, fixtures);
  }

  return rounds;
}

/**
 * Hydrates bracket nodes with real match scores and team details.
 */
function hydrateBracketWithFixtures(rounds: KnockoutRound[], fixtures: any[]): void {
  for (const round of rounds) {
    if (!round.matches) continue;

    // Filter fixtures matching this round's slug or name
    const roundFixtures = fixtures.filter((f) => {
      const fRound = (f.round || f.stage || f.league_round || '').toLowerCase();
      return (
        fRound.includes(round.slug.replace(/-/g, ' ')) ||
        fRound.includes(round.name.toLowerCase()) ||
        (round.slug === 'final' && fRound.includes('final') && !fRound.includes('semi'))
      );
    });

    roundFixtures.forEach((f, idx) => {
      if (idx < round.matches!.length) {
        const node = round.matches![idx];
        const hScore = f.homeScore ?? (f.event_final_result ? parseInt(f.event_final_result.split('-')[0], 10) : undefined);
        const aScore = f.awayScore ?? (f.event_final_result ? parseInt(f.event_final_result.split('-')[1], 10) : undefined);

        const homeTeam: KnockoutParticipant = {
          teamId: f.homeTeamId || String(f.home_team_key || ''),
          teamName: f.homeTeamName || f.event_home_team || 'Home',
          teamLogo: f.homeTeamLogo || f.home_team_logo,
          score: hScore,
          homeScore: hScore,
        };

        const awayTeam: KnockoutParticipant = {
          teamId: f.awayTeamId || String(f.away_team_key || ''),
          teamName: f.awayTeamName || f.event_away_team || 'Away',
          teamLogo: f.awayTeamLogo || f.away_team_logo,
          score: aScore,
          awayScore: aScore,
        };

        const isFinished = f.status === 'FT' || f.status === 'Finished' || f.event_status === 'Finished';
        let winnerTeamId: string | undefined;
        let winnerTeamName: string | undefined;

        if (isFinished && hScore !== undefined && aScore !== undefined) {
          if (hScore > aScore) {
            homeTeam.isWinner = true;
            winnerTeamId = homeTeam.teamId;
            winnerTeamName = homeTeam.teamName;
          } else if (aScore > hScore) {
            awayTeam.isWinner = true;
            winnerTeamId = awayTeam.teamId;
            winnerTeamName = awayTeam.teamName;
          }
        }

        node.homeTeam = homeTeam;
        node.awayTeam = awayTeam;
        node.winnerTeamId = winnerTeamId;
        node.winnerTeamName = winnerTeamName;
        node.status = isFinished ? 'FT' : f.status || 'SCHEDULED';
        node.scheduledAt = f.scheduledAt || f.event_date;
      }
    });
  }

  // 3. Propagate completed winners forward into downstream bracket nodes
  propagateWinnersForward(rounds);
}

/**
 * Propagates winners of completed matches into their destination nextMatchId slots.
 */
export function propagateWinnersForward(rounds: KnockoutRound[]): void {
  // Map all nodes by id
  const nodeMap = new Map<string, KnockoutMatchNode>();
  rounds.forEach((r) => r.matches?.forEach((m) => nodeMap.set(m.id, m)));

  rounds.forEach((r) => {
    r.matches?.forEach((m) => {
      if (m.nextMatchId && m.nextMatchSlot && m.winnerTeamName) {
        const targetNode = nodeMap.get(m.nextMatchId);
        if (targetNode) {
          const participant: KnockoutParticipant = {
            teamId: m.winnerTeamId,
            teamName: m.winnerTeamName,
            teamLogo: m.homeTeam.isWinner ? m.homeTeam.teamLogo : m.awayTeam.teamLogo,
            seedSource: `Winner ${m.homeTeam.teamName} vs ${m.awayTeam.teamName}`,
          };

          if (m.nextMatchSlot === 'home') {
            targetNode.homeTeam = participant;
          } else {
            targetNode.awayTeam = participant;
          }
        }
      }
    });
  });
}

/**
 * Primary Entry Point: Generates a full TournamentBracket for any competition.
 */
export function buildTournamentBracket(
  competitionId: string,
  seasonId = 'default',
  fixtures: any[] = []
): TournamentBracket {
  const stages = getStagesForCompetition(competitionId, seasonId);
  const knockoutStage = stages.find((s) => s.isKnockout && s.type !== 'QUALIFICATION');

  if (!knockoutStage || !knockoutStage.knockoutRounds) {
    return {
      competitionId,
      seasonId,
      stageId: knockoutStage?.id || 'stage-knockout',
      name: `${competitionId} Bracket`,
      rounds: [],
    };
  }

  const roundConfigs: RoundConfig[] = knockoutStage.knockoutRounds.map((kr) => ({
    id: kr.id,
    name: kr.name,
    slug: kr.slug,
    order: kr.order,
    matchCount: kr.matchCount,
    legType: kr.legType,
  }));

  const rounds = buildKnockoutTree(roundConfigs, fixtures);

  // Extract champion and runner-up if final is finished
  const finalRound = rounds.find((r) => r.slug === 'final');
  const finalMatch = finalRound?.matches?.[0];

  let championTeam: KnockoutParticipant | undefined;
  let runnerUpTeam: KnockoutParticipant | undefined;

  if (finalMatch && finalMatch.winnerTeamName) {
    championTeam = finalMatch.homeTeam.isWinner ? finalMatch.homeTeam : finalMatch.awayTeam;
    runnerUpTeam = finalMatch.homeTeam.isWinner ? finalMatch.awayTeam : finalMatch.homeTeam;
  }

  return {
    competitionId,
    seasonId,
    stageId: knockoutStage.id,
    name: `${knockoutStage.name} Bracket`,
    rounds,
    championTeam,
    runnerUpTeam,
  };
}
