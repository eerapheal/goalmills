import { describe, it, expect } from 'vitest';
import {
  getCompetitionQualificationRules,
  determineEntryQualification,
  resolveWildcardThirdPlaceRanking,
} from '../qualificationEngine';
import {
  buildKnockoutTree,
  buildTournamentBracket,
  propagateWinnersForward,
  RoundConfig,
} from '../knockoutEngine';
import { StandingEntry } from '@goalmills/types';

describe('Phase 4 — Qualification & Knockout Engine', () => {
  // ─── Test 1: Group Qualification Rules Evaluation ───────────────────────────
  it('correctly determines qualification status per group position', () => {
    const rules = getCompetitionQualificationRules('FIFA-WORLD-CUP', '2026');

    expect(determineEntryQualification(1, rules, 4)).toBe('QUALIFIED');
    expect(determineEntryQualification(2, rules, 4)).toBe('QUALIFIED');
    expect(determineEntryQualification(3, rules, 4)).toBe('PLAYOFF');
    expect(determineEntryQualification(4, rules, 4)).toBe('ELIMINATED');
  });

  // ─── Test 2: Wildcard 3rd-Place Cross-Group Ranking (World Cup 2026) ────────
  it('correctly ranks 12 third-placed teams and qualifies the top 8 into Round of 32', () => {
    const thirdPlacedTeams: StandingEntry[] = [
      { id: '1', standingTableId: 't1', teamId: 't-1', teamName: 'Nation 1', position: 3, played: 3, won: 1, drawn: 1, lost: 1, goalsFor: 4, goalsAgainst: 3, goalDifference: 1, points: 4 },
      { id: '2', standingTableId: 't2', teamId: 't-2', teamName: 'Nation 2', position: 3, played: 3, won: 1, drawn: 1, lost: 1, goalsFor: 3, goalsAgainst: 2, goalDifference: 1, points: 4 },
      { id: '3', standingTableId: 't3', teamId: 't-3', teamName: 'Nation 3', position: 3, played: 3, won: 1, drawn: 1, lost: 1, goalsFor: 2, goalsAgainst: 2, goalDifference: 0, points: 4 },
      { id: '4', standingTableId: 't4', teamId: 't-4', teamName: 'Nation 4', position: 3, played: 3, won: 1, drawn: 0, lost: 2, goalsFor: 5, goalsAgainst: 4, goalDifference: 1, points: 3 },
      { id: '5', standingTableId: 't5', teamId: 't-5', teamName: 'Nation 5', position: 3, played: 3, won: 1, drawn: 0, lost: 2, goalsFor: 4, goalsAgainst: 4, goalDifference: 0, points: 3 },
      { id: '6', standingTableId: 't6', teamId: 't-6', teamName: 'Nation 6', position: 3, played: 3, won: 1, drawn: 0, lost: 2, goalsFor: 3, goalsAgainst: 3, goalDifference: 0, points: 3 },
      { id: '7', standingTableId: 't7', teamId: 't-7', teamName: 'Nation 7', position: 3, played: 3, won: 1, drawn: 0, lost: 2, goalsFor: 2, goalsAgainst: 3, goalDifference: -1, points: 3 },
      { id: '8', standingTableId: 't8', teamId: 't-8', teamName: 'Nation 8', position: 3, played: 3, won: 1, drawn: 0, lost: 2, goalsFor: 1, goalsAgainst: 2, goalDifference: -1, points: 3 },
      // Bottom 4 to be eliminated:
      { id: '9', standingTableId: 't9', teamId: 't-9', teamName: 'Nation 9', position: 3, played: 3, won: 0, drawn: 2, lost: 1, goalsFor: 2, goalsAgainst: 3, goalDifference: -1, points: 2 },
      { id: '10', standingTableId: 't10', teamId: 't-10', teamName: 'Nation 10', position: 3, played: 3, won: 0, drawn: 1, lost: 2, goalsFor: 1, goalsAgainst: 3, goalDifference: -2, points: 1 },
      { id: '11', standingTableId: 't11', teamId: 't-11', teamName: 'Nation 11', position: 3, played: 3, won: 0, drawn: 1, lost: 2, goalsFor: 0, goalsAgainst: 3, goalDifference: -3, points: 1 },
      { id: '12', standingTableId: 't12', teamId: 't-12', teamName: 'Nation 12', position: 3, played: 3, won: 0, drawn: 0, lost: 3, goalsFor: 0, goalsAgainst: 5, goalDifference: -5, points: 0 },
    ];

    const result = resolveWildcardThirdPlaceRanking(thirdPlacedTeams, 8);

    expect(result.qualified).toHaveLength(8);
    expect(result.eliminated).toHaveLength(4);

    expect(result.qualified.every((t) => t.qualificationStatus === 'QUALIFIED')).toBe(true);
    expect(result.eliminated.every((t) => t.qualificationStatus === 'ELIMINATED')).toBe(true);

    // Highest points ranked first
    expect(result.qualified[0].teamName).toBe('Nation 1');
    expect(result.eliminated[3].teamName).toBe('Nation 12');
  });

  // ─── Test 3: Connected Binary Knockout Bracket Tree ────────────────────────
  it('constructs a deterministic binary bracket tree with nextMatchId and slot connections', () => {
    const roundConfigs: RoundConfig[] = [
      { id: 'r-qf', name: 'Quarter-finals', slug: 'quarter-finals', order: 1, matchCount: 4, legType: 'SINGLE' },
      { id: 'r-sf', name: 'Semi-finals', slug: 'semi-finals', order: 2, matchCount: 2, legType: 'SINGLE' },
      { id: 'r-final', name: 'Final', slug: 'final', order: 3, matchCount: 1, legType: 'SINGLE' },
    ];

    const tree = buildKnockoutTree(roundConfigs);

    expect(tree).toHaveLength(3);
    const qf = tree[0];
    const sf = tree[1];
    const final = tree[2];

    expect(qf.matches).toHaveLength(4);
    expect(sf.matches).toHaveLength(2);
    expect(final.matches).toHaveLength(1);

    // Match 1 and Match 2 of QF connect to Match 1 of SF
    expect(qf.matches![0].nextMatchId).toBe('node-semi-finals-1');
    expect(qf.matches![0].nextMatchSlot).toBe('home');

    expect(qf.matches![1].nextMatchId).toBe('node-semi-finals-1');
    expect(qf.matches![1].nextMatchSlot).toBe('away');

    // Match 3 and Match 4 of QF connect to Match 2 of SF
    expect(qf.matches![2].nextMatchId).toBe('node-semi-finals-2');
    expect(qf.matches![2].nextMatchSlot).toBe('home');

    expect(qf.matches![3].nextMatchId).toBe('node-semi-finals-2');
    expect(qf.matches![3].nextMatchSlot).toBe('away');

    // SF matches connect to Final
    expect(sf.matches![0].nextMatchId).toBe('node-final-1');
    expect(sf.matches![0].nextMatchSlot).toBe('home');

    expect(sf.matches![1].nextMatchId).toBe('node-final-1');
    expect(sf.matches![1].nextMatchSlot).toBe('away');

    // Final has no nextMatchId
    expect(final.matches![0].nextMatchId).toBeUndefined();
  });

  // ─── Test 4: Winner Propagation Forward Into Downstream Bracket Nodes ──────
  it('automatically advances match winners into their destination nextMatch slot', () => {
    const roundConfigs: RoundConfig[] = [
      { id: 'r-sf', name: 'Semi-finals', slug: 'semi-finals', order: 1, matchCount: 2, legType: 'SINGLE' },
      { id: 'r-final', name: 'Final', slug: 'final', order: 2, matchCount: 1, legType: 'SINGLE' },
    ];

    const tree = buildKnockoutTree(roundConfigs);
    const sf = tree[0];
    const final = tree[1];

    // Simulate SF Match 1: Arsenal 2 - 1 Chelsea (Arsenal wins)
    sf.matches![0].homeTeam = { teamId: 'arsenal', teamName: 'Arsenal', score: 2, isWinner: true };
    sf.matches![0].awayTeam = { teamId: 'chelsea', teamName: 'Chelsea', score: 1 };
    sf.matches![0].winnerTeamId = 'arsenal';
    sf.matches![0].winnerTeamName = 'Arsenal';

    // Simulate SF Match 2: Real Madrid 3 - 0 Barcelona (Real Madrid wins)
    sf.matches![1].homeTeam = { teamId: 'real-madrid', teamName: 'Real Madrid', score: 3, isWinner: true };
    sf.matches![1].awayTeam = { teamId: 'barcelona', teamName: 'Barcelona', score: 0 };
    sf.matches![1].winnerTeamId = 'real-madrid';
    sf.matches![1].winnerTeamName = 'Real Madrid';

    propagateWinnersForward(tree);

    // Final match should now have Arsenal as Home and Real Madrid as Away!
    expect(final.matches![0].homeTeam.teamName).toBe('Arsenal');
    expect(final.matches![0].homeTeam.teamId).toBe('arsenal');
    expect(final.matches![0].awayTeam.teamName).toBe('Real Madrid');
    expect(final.matches![0].awayTeam.teamId).toBe('real-madrid');
  });

  // ─── Test 5: Full Tournament Bracket Generation ────────────────────────────
  it('builds a full TournamentBracket with champion resolution for World Cup 2026', () => {
    const rawFinalFixture = [
      {
        round: 'Final',
        homeTeamName: 'France',
        awayTeamName: 'Argentina',
        homeScore: 3,
        awayScore: 2,
        status: 'FT',
      },
    ];

    const bracket = buildTournamentBracket('FIFA-WORLD-CUP', '2026', rawFinalFixture);

    expect(bracket.competitionId).toBe('FIFA-WORLD-CUP');
    expect(bracket.rounds.length).toBeGreaterThan(0);

    const finalRound = bracket.rounds.find((r) => r.slug === 'final');
    expect(finalRound).toBeDefined();
    expect(finalRound?.matches?.[0].homeTeam.teamName).toBe('France');
    expect(finalRound?.matches?.[0].awayTeam.teamName).toBe('Argentina');

    // Champion resolved
    expect(bracket.championTeam?.teamName).toBe('France');
    expect(bracket.runnerUpTeam?.teamName).toBe('Argentina');
  });
});
