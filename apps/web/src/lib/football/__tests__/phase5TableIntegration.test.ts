import { describe, it, expect } from 'vitest';
import {
  getCompetitionFormat,
  getStandingsRulesetForCompetition,
  separateProviderStandingsByGroup,
  buildTournamentBracket,
  sortStandingEntries,
  getCanonicalCompetition,
} from '../index';
import { StandingEntry } from '@goalmills/types';

describe('Phase 5: Professional Table & Standings Architecture Integration', () => {
  it('correctly classifies and segregates domestic league standings (Premier League)', () => {
    const rawPremierLeague = [
      { standing_place: '1', standing_team: 'Arsenal', standing_P: '28', standing_W: '20', standing_D: '4', standing_L: '4', standing_GD: '45', standing_PTS: '64' },
      { standing_place: '2', standing_team: 'Manchester City', standing_P: '28', standing_W: '19', standing_D: '6', standing_L: '3', standing_GD: '40', standing_PTS: '63' },
      { standing_place: '3', standing_team: 'Liverpool', standing_P: '28', standing_W: '19', standing_D: '5', standing_L: '4', standing_GD: '38', standing_PTS: '62' },
    ];

    const tables = separateProviderStandingsByGroup(rawPremierLeague, 'premier-league', '2026/2027');
    expect(tables).toHaveLength(1);
    expect(tables[0].type).toBe('LEAGUE');
    expect(tables[0].entries).toHaveLength(3);
    expect(tables[0].entries[0].teamName).toBe('Arsenal');
    expect(tables[0].entries[0].position).toBe(1);
    expect(tables[0].entries[0].points).toBe(64);
  });

  it('correctly classifies Swiss League Phase standings (Champions League 36-team single table)', () => {
    const rawUclPhase = [
      { standing_place: '1', standing_team: 'Real Madrid', standing_P: '8', standing_W: '7', standing_D: '0', standing_L: '1', standing_GD: '15', standing_PTS: '21', league_round: 'League Phase' },
      { standing_place: '2', standing_team: 'Bayern Munich', standing_P: '8', standing_W: '6', standing_D: '1', standing_L: '1', standing_GD: '12', standing_PTS: '19', league_round: 'League Phase' },
    ];

    const tables = separateProviderStandingsByGroup(rawUclPhase, 'champions-league', '2026/2027');
    expect(tables).toHaveLength(1);
    expect(tables[0].type).toBe('LEAGUE_PHASE');
    expect(tables[0].entries[0].teamName).toBe('Real Madrid');
    expect(tables[0].entries[0].points).toBe(21);
  });

  it('strictly segregates multiple groups without merging Group A and Group B (World Cup / AFCON)', () => {
    const rawTournamentData = [
      { standing_place: '1', standing_team: 'Nigeria', standing_P: '3', standing_W: '3', standing_D: '0', standing_L: '0', standing_GD: '6', standing_PTS: '9', league_group: 'Group A' },
      { standing_place: '2', standing_team: 'Egypt', standing_P: '3', standing_W: '2', standing_D: '0', standing_L: '1', standing_GD: '3', standing_PTS: '6', league_group: 'Group A' },
      { standing_place: '1', standing_team: 'Senegal', standing_P: '3', standing_W: '2', standing_D: '1', standing_L: '0', standing_GD: '4', standing_PTS: '7', league_group: 'Group B' },
      { standing_place: '2', standing_team: 'Morocco', standing_P: '3', standing_W: '2', standing_D: '0', standing_L: '1', standing_GD: '2', standing_PTS: '6', league_group: 'Group B' },
    ];

    const tables = separateProviderStandingsByGroup(rawTournamentData, 'afcon', '2026/2027');
    expect(tables.length).toBeGreaterThanOrEqual(2);

    const groupA = tables.find((t) => t.name === 'Group A');
    const groupB = tables.find((t) => t.name === 'Group B');

    expect(groupA).toBeDefined();
    expect(groupB).toBeDefined();
    expect(groupA!.entries.map((e) => e.teamName)).toEqual(['Nigeria', 'Egypt']);
    expect(groupB!.entries.map((e) => e.teamName)).toEqual(['Senegal', 'Morocco']);
  });

  it('builds a binary knockout bracket tree with next match connections for tournament cups', () => {
    const bracket = buildTournamentBracket('fa-cup', '2026/2027');
    expect(bracket.competitionId).toBe('fa-cup');
    expect(bracket.rounds.length).toBeGreaterThan(0);

    const finalRound = bracket.rounds.find((r) => r.slug === 'final');
    expect(finalRound).toBeDefined();
    expect(finalRound!.matches).toHaveLength(1);
    expect(finalRound!.matches![0].nextMatchId).toBeUndefined(); // Final has no next match
  });

  it('applies tiebreaker rules deterministically according to competition ruleset', () => {
    const ruleset = getStandingsRulesetForCompetition('premier-league', '2026/2027');
    expect(ruleset.tiebreakers[0]).toBe('POINTS');
    expect(ruleset.tiebreakers[1]).toBe('GOAL_DIFFERENCE');
    expect(ruleset.tiebreakers[2]).toBe('GOALS_FOR');

    const tiedEntries: StandingEntry[] = [
      {
        id: '1',
        standingTableId: 'tbl-1',
        teamId: 'team-b',
        teamName: 'Chelsea',
        position: 1,
        played: 10,
        won: 6,
        drawn: 2,
        lost: 2,
        goalsFor: 18,
        goalsAgainst: 10,
        goalDifference: 8,
        points: 20,
      },
      {
        id: '2',
        standingTableId: 'tbl-1',
        teamId: 'team-a',
        teamName: 'Aston Villa',
        position: 2,
        played: 10,
        won: 6,
        drawn: 2,
        lost: 2,
        goalsFor: 22,
        goalsAgainst: 10,
        goalDifference: 12, // Higher GD
        points: 20,
      },
    ];

    const sorted = sortStandingEntries(tiedEntries, ruleset);
    expect(sorted[0].teamName).toBe('Aston Villa');
    expect(sorted[0].position).toBe(1);
    expect(sorted[1].teamName).toBe('Chelsea');
    expect(sorted[1].position).toBe(2);
  });
});
