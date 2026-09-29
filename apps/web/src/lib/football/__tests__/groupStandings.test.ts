import { describe, it, expect } from 'vitest';
import {
  separateProviderStandingsByGroup,
  sortStandingEntries,
  getGroupStandings,
  createStandingsComparator,
} from '../groupStandingsEngine';
import { getStandingsRulesetById } from '../standingsRulesets';
import { StandingEntry } from '@goalmills/types';

describe('Phase 3 — Groups & Standings Architecture', () => {
  // ─── Test 1: NEVER Merge Group A and Group B Into One Table ────────────────
  it('strictly separates Group A and Group B into distinct independent StandingTable instances', () => {
    // Raw standings data from multi-group tournament (e.g. World Cup / AFCON)
    const rawTournamentStandings = [
      // Group A teams
      { standing_team: 'Team A', league_group: 'Group A', standing_PTS: 7, standing_GD: 3, standing_P: 3, standing_W: 2, standing_D: 1, standing_L: 0, standing_F: 5, standing_A: 2 },
      { standing_team: 'Team B', league_group: 'Group A', standing_PTS: 6, standing_GD: 2, standing_P: 3, standing_W: 2, standing_D: 0, standing_L: 1, standing_F: 4, standing_A: 2 },
      { standing_team: 'Team C', league_group: 'Group A', standing_PTS: 3, standing_GD: -2, standing_P: 3, standing_W: 1, standing_D: 0, standing_L: 2, standing_F: 2, standing_A: 4 },
      { standing_team: 'Team D', league_group: 'Group A', standing_PTS: 1, standing_GD: -3, standing_P: 3, standing_W: 0, standing_D: 1, standing_L: 2, standing_F: 1, standing_A: 4 },

      // Group B teams
      { standing_team: 'Team E', league_group: 'Group B', standing_PTS: 9, standing_GD: 6, standing_P: 3, standing_W: 3, standing_D: 0, standing_L: 0, standing_F: 7, standing_A: 1 },
      { standing_team: 'Team F', league_group: 'Group B', standing_PTS: 4, standing_GD: 0, standing_P: 3, standing_W: 1, standing_D: 1, standing_L: 1, standing_F: 3, standing_A: 3 },
      { standing_team: 'Team G', league_group: 'Group B', standing_PTS: 3, standing_GD: -3, standing_P: 3, standing_W: 1, standing_D: 0, standing_L: 2, standing_F: 2, standing_A: 5 },
      { standing_team: 'Team H', league_group: 'Group B', standing_PTS: 1, standing_GD: -3, standing_P: 3, standing_W: 0, standing_D: 1, standing_L: 2, standing_F: 1, standing_A: 4 },
    ];

    const tables = separateProviderStandingsByGroup(rawTournamentStandings, 'FIFA-WORLD-CUP', '2026');

    // MUST produce 2 separate tables, NOT a merged single table!
    expect(tables).toHaveLength(2);

    const groupATable = tables.find((t) => t.slug === 'group-a');
    const groupBTable = tables.find((t) => t.slug === 'group-b');

    expect(groupATable).toBeDefined();
    expect(groupBTable).toBeDefined();

    expect(groupATable?.name).toBe('Group A');
    expect(groupATable?.type).toBe('GROUP');
    expect(groupATable?.entries).toHaveLength(4);
    expect(groupATable?.entries.map((e) => e.teamName)).toEqual(['Team A', 'Team B', 'Team C', 'Team D']);

    expect(groupBTable?.name).toBe('Group B');
    expect(groupBTable?.type).toBe('GROUP');
    expect(groupBTable?.entries).toHaveLength(4);
    expect(groupBTable?.entries.map((e) => e.teamName)).toEqual(['Team E', 'Team F', 'Team G', 'Team H']);
  });

  // ─── Test 2: Deterministic Tiebreaker Sequence (Points -> GD -> GF) ─────────
  it('correctly ranks teams using deterministic tiebreaker comparator without mutation', () => {
    const ruleset = getStandingsRulesetById('RULESET-STANDARD-3PT');

    const entries: StandingEntry[] = [
      { id: '1', standingTableId: 't1', teamId: 'team-c', teamName: 'Team C', position: 0, played: 3, won: 1, drawn: 0, lost: 2, goalsFor: 4, goalsAgainst: 4, goalDifference: 0, points: 3 },
      { id: '2', standingTableId: 't1', teamId: 'team-b', teamName: 'Team B', position: 0, played: 3, won: 1, drawn: 0, lost: 2, goalsFor: 6, goalsAgainst: 5, goalDifference: 1, points: 3 }, // Higher GD (+1 vs 0)
      { id: '3', standingTableId: 't1', teamId: 'team-a', teamName: 'Team A', position: 0, played: 3, won: 3, drawn: 0, lost: 0, goalsFor: 8, goalsAgainst: 2, goalDifference: 6, points: 9 }, // Highest points (9)
      { id: '4', standingTableId: 't1', teamId: 'team-d', teamName: 'Team D', position: 0, played: 3, won: 1, drawn: 0, lost: 2, goalsFor: 2, goalsAgainst: 2, goalDifference: 0, points: 3 }, // Same points (3), same GD (0), lower GF (2 vs 4)
    ];

    const sorted = sortStandingEntries(entries, ruleset);

    // 1st: Team A (9 pts)
    // 2nd: Team B (3 pts, +1 GD)
    // 3rd: Team C (3 pts, 0 GD, 4 GF)
    // 4th: Team D (3 pts, 0 GD, 2 GF)
    expect(sorted[0].teamName).toBe('Team A');
    expect(sorted[0].position).toBe(1);

    expect(sorted[1].teamName).toBe('Team B');
    expect(sorted[1].position).toBe(2);

    expect(sorted[2].teamName).toBe('Team C');
    expect(sorted[2].position).toBe(3);

    expect(sorted[3].teamName).toBe('Team D');
    expect(sorted[3].position).toBe(4);

    // Verify original array was NOT mutated
    expect(entries[0].teamName).toBe('Team C');
  });

  // ─── Test 3: Premier League Domestic League Standings ───────────────────────
  it('returns a single unified StandingTable of type LEAGUE for Premier League', () => {
    const rawEplStandings = [
      { standing_team: 'Arsenal', standing_PTS: 75, standing_GD: 45, standing_P: 30, standing_W: 23, standing_D: 6, standing_L: 1, standing_F: 70, standing_A: 25 },
      { standing_team: 'Manchester City', standing_PTS: 73, standing_GD: 40, standing_P: 30, standing_W: 22, standing_D: 7, standing_L: 1, standing_F: 68, standing_A: 28 },
    ];

    const tables = separateProviderStandingsByGroup(rawEplStandings, 'ENG-PREMIER-LEAGUE');

    // Pure domestic league MUST NOT be split into groups
    expect(tables).toHaveLength(1);
    expect(tables[0].type).toBe('LEAGUE');
    expect(tables[0].name).toBe('Regular Season Standings');
    expect(tables[0].entries).toHaveLength(2);
    expect(tables[0].entries[0].teamName).toBe('Arsenal');
    expect(tables[0].entries[1].teamName).toBe('Manchester City');
  });

  // ─── Test 4: UEFA Champions League 2024+ (Single 36-Team League Phase) ───────
  it('returns single unified StandingTable of type LEAGUE_PHASE for modern UCL', () => {
    const rawUclStandings = [
      { standing_team: 'Liverpool', standing_PTS: 18, standing_GD: 10, standing_P: 6, standing_W: 6, standing_D: 0, standing_L: 0, standing_F: 12, standing_A: 2 },
      { standing_team: 'Inter', standing_PTS: 16, standing_GD: 8, standing_P: 6, standing_W: 5, standing_D: 1, standing_L: 0, standing_F: 10, standing_A: 2 },
    ];

    const tables = separateProviderStandingsByGroup(rawUclStandings, 'UEFA-CHAMPIONS-LEAGUE', '2024/2025');

    expect(tables).toHaveLength(1);
    expect(tables[0].type).toBe('LEAGUE_PHASE');
    expect(tables[0].name).toBe('League Phase');
    expect(tables[0].slug).toBe('league-phase');
    expect(tables[0].entries).toHaveLength(2);
  });

  // ─── Test 5: Direct Individual Group Lookup by Slug ─────────────────────────
  it('retrieves specific group standings table using getGroupStandings', () => {
    const rawAfconStandings = [
      { standing_team: 'Nigeria', league_group: 'Group A', standing_PTS: 7, standing_GD: 3, standing_P: 3, standing_W: 2, standing_D: 1, standing_L: 0, standing_F: 4, standing_A: 1 },
      { standing_team: 'Equatorial Guinea', league_group: 'Group A', standing_PTS: 7, standing_GD: 4, standing_P: 3, standing_W: 2, standing_D: 1, standing_L: 0, standing_F: 6, standing_A: 2 },
      { standing_team: 'Senegal', league_group: 'Group C', standing_PTS: 9, standing_GD: 7, standing_P: 3, standing_W: 3, standing_D: 0, standing_L: 0, standing_F: 8, standing_A: 1 },
    ];

    const groupATable = getGroupStandings('CAF-AFCON', 'group-a', 'default', rawAfconStandings);
    expect(groupATable).toBeDefined();
    expect(groupATable?.name).toBe('Group A');
    expect(groupATable?.entries).toHaveLength(2);

    const groupCTable = getGroupStandings('CAF-AFCON', 'group-c', 'default', rawAfconStandings);
    expect(groupCTable).toBeDefined();
    expect(groupCTable?.name).toBe('Group C');
    expect(groupCTable?.entries).toHaveLength(1);
    expect(groupCTable?.entries[0].teamName).toBe('Senegal');

    const nonExistent = getGroupStandings('CAF-AFCON', 'group-z', 'default', rawAfconStandings);
    expect(nonExistent).toBeUndefined();
  });
});
