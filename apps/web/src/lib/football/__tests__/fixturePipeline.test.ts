import { describe, it, expect } from 'vitest';
import {
  processFixture,
  processFixtures,
  filterFixturesByCompetition,
  filterFixturesByGender,
  filterFixturesByAgeCategory,
} from '../fixturePipeline';
import { validateFixture } from '../fixtureValidator';
import { sortNormalizedFixtures } from '../fixtureSorter';
import { UNRESOLVED_COMPETITION_ID } from '../competitionResolver';
import { resolveTeam } from '../teamResolver';
import { resolveCountry } from '../countryResolver';

describe('GoalMills Phase 3: Fixture Normalization & Isolation Pipeline', () => {
  // ─── Fixtures for the Exact Contamination Bug Scenario ─────────────────────

  // Fixture A: English Premier League (Men's, Senior)
  const rawFixtureA = {
    event_key: '1001',
    league_key: 152,
    league_name: 'Premier League',
    country_name: 'England',
    event_home_team: 'Arsenal',
    home_team_key: '42',
    event_away_team: 'Chelsea',
    away_team_key: '43',
    event_date: '2026-10-15',
    event_time: '15:00',
    event_status: 'Scheduled',
    event_final_result: '-',
  };

  // Fixture B: EFL Championship (Men's Tier 2)
  const rawFixtureB = {
    event_key: '1002',
    league_key: 153,
    league_name: 'Championship',
    country_name: 'England',
    event_home_team: 'Leeds United',
    home_team_key: '44',
    event_away_team: 'Sheffield United',
    away_team_key: '45',
    event_date: '2026-10-15',
    event_time: '15:00',
    event_status: 'Scheduled',
    event_final_result: '-',
  };

  // Fixture C: Women's Super League (Women's Tier 1)
  const rawFixtureC = {
    event_key: '1003',
    league_key: 0,
    league_name: "Women's Super League",
    country_name: 'England',
    event_home_team: 'Chelsea Women',
    event_away_team: 'Arsenal Women',
    event_date: '2026-10-15',
    event_time: '14:00',
    event_status: 'Scheduled',
    event_final_result: '-',
  };

  // Fixture D: UEFA Nations League (International National Team)
  const rawFixtureD = {
    event_key: '1004',
    league_key: 5,
    league_name: 'UEFA Nations League',
    country_name: 'Europe',
    event_home_team: 'England',
    event_away_team: 'Germany',
    event_date: '2026-10-15',
    event_time: '19:45',
    event_status: 'Scheduled',
    event_final_result: '-',
  };

  it('Pipeline correctly assigns canonical competition identities', () => {
    const normA = processFixture(rawFixtureA);
    const normB = processFixture(rawFixtureB);
    const normC = processFixture(rawFixtureC);
    const normD = processFixture(rawFixtureD);

    expect(normA.competitionId).toBe('ENG-PREMIER-LEAGUE');
    expect(normB.competitionId).toBe('ENG-CHAMPIONSHIP');
    expect(normC.competitionId).toBe('ENG-WOMENS-SUPER-LEAGUE');
    expect(normD.competitionId).toBe('UEFA-NATIONS-LEAGUE');
  });

  it('ELIMINATION OF CONTAMINATION BUG: EPL page shows ONLY Fixture A', () => {
    const { validFixtures } = processFixtures([
      rawFixtureA,
      rawFixtureB,
      rawFixtureC,
      rawFixtureD,
    ]);

    // Query Premier League filter
    const eplFixtures = filterFixturesByCompetition(validFixtures, 'ENG-PREMIER-LEAGUE');
    expect(eplFixtures).toHaveLength(1);
    expect(eplFixtures[0].fixtureId).toBe('gm-fix-1001');
    expect(eplFixtures[0].homeTeamName).toBe('Arsenal');

    // Query Championship filter
    const champFixtures = filterFixturesByCompetition(validFixtures, 'ENG-CHAMPIONSHIP');
    expect(champFixtures).toHaveLength(1);
    expect(champFixtures[0].fixtureId).toBe('gm-fix-1002');
    expect(champFixtures[0].homeTeamName).toBe('Leeds United');

    // Query WSL filter
    const wslFixtures = filterFixturesByCompetition(validFixtures, 'ENG-WOMENS-SUPER-LEAGUE');
    expect(wslFixtures).toHaveLength(1);
    expect(wslFixtures[0].fixtureId).toBe('gm-fix-1003');
    expect(wslFixtures[0].gender).toBe('FEMALE');

    // Query UEFA Nations League filter
    const uefaFixtures = filterFixturesByCompetition(validFixtures, 'UEFA-NATIONS-LEAGUE');
    expect(uefaFixtures).toHaveLength(1);
    expect(uefaFixtures[0].fixtureId).toBe('gm-fix-1004');
  });

  it('Strict Gender Firewall isolates Men vs Women fixtures', () => {
    const { validFixtures } = processFixtures([
      rawFixtureA,
      rawFixtureB,
      rawFixtureC,
      rawFixtureD,
    ]);

    const mensOnly = filterFixturesByGender(validFixtures, 'MALE');
    const womensOnly = filterFixturesByGender(validFixtures, 'FEMALE');

    expect(mensOnly).toHaveLength(3);
    expect(mensOnly.map((f) => f.fixtureId)).not.toContain('gm-fix-1003');

    expect(womensOnly).toHaveLength(1);
    expect(womensOnly[0].fixtureId).toBe('gm-fix-1003');
    expect(womensOnly[0].gender).toBe('FEMALE');
  });

  it('Strict Age-Category Firewall separates Youth from Senior tournaments', () => {
    const youthMatch = {
      event_key: '2001',
      league_key: 0,
      league_name: 'UEFA Under-21 Championship',
      country_name: 'Europe',
      event_home_team: 'Spain U21',
      event_away_team: 'Italy U21',
      event_date: '2026-10-15',
      event_time: '18:00',
      event_status: 'Scheduled',
    };

    const normYouth = processFixture(youthMatch);
    expect(normYouth.ageCategory).toBe('U21');

    const seniorOnly = filterFixturesByAgeCategory([normYouth], 'senior');
    const youthOnly = filterFixturesByAgeCategory([normYouth], 'youth');

    expect(seniorOnly).toHaveLength(0);
    expect(youthOnly).toHaveLength(1);
  });

  it('Quarantine Engine flags and isolates unmapped provider competitions', () => {
    const unmappedMatch = {
      event_key: '9999',
      league_key: 99999, // Non-existent provider ID
      league_name: 'Unknown Local Tournament',
      country_name: 'Nowhere',
      event_home_team: 'Local FC A',
      event_away_team: 'Local FC B',
      event_date: '2026-10-15',
      event_time: '12:00',
      event_status: 'Scheduled',
    };

    const norm = processFixture(unmappedMatch);
    expect(norm.competitionId).toBe(UNRESOLVED_COMPETITION_ID);
    expect(norm.classificationStatus).toBe('UNRESOLVED');

    const validation = validateFixture(norm);
    expect(validation.isQuarantined).toBe(true);

    // Verify it NEVER leaks into Premier League or La Liga
    const eplMatches = filterFixturesByCompetition([norm], 'ENG-PREMIER-LEAGUE');
    expect(eplMatches).toHaveLength(0);
  });

  it('DETERMINISTIC SORTING: Permuted provider array inputs produce 100% identical outputs', () => {
    const liveMatch = {
      ...rawFixtureA,
      event_key: '3001',
      event_status: 'LIVE',
      event_live: '1',
      event_final_result: '1 - 0',
    };
    const upcomingMatch = { ...rawFixtureB, event_key: '3002', event_status: 'Scheduled' };
    const finishedMatch = { ...rawFixtureC, event_key: '3003', event_status: 'FT', event_final_result: '2 - 1' };
    const postponedMatch = { ...rawFixtureD, event_key: '3004', event_status: 'Postponed' };

    const normLive = processFixture(liveMatch);
    const normUpcoming = processFixture(upcomingMatch);
    const normFinished = processFixture(finishedMatch);
    const normPostponed = processFixture(postponedMatch);

    // Permutation 1
    const p1 = [normFinished, normUpcoming, normLive, normPostponed];
    const sorted1 = sortNormalizedFixtures(p1);

    // Permutation 2 (reversed)
    const p2 = [normPostponed, normLive, normUpcoming, normFinished];
    const sorted2 = sortNormalizedFixtures(p2);

    // Permutation 3 (shuffled)
    const p3 = [normLive, normPostponed, normFinished, normUpcoming];
    const sorted3 = sortNormalizedFixtures(p3);

    // Assert identical IDs in order
    const ids1 = sorted1.map((f) => f.fixtureId);
    const ids2 = sorted2.map((f) => f.fixtureId);
    const ids3 = sorted3.map((f) => f.fixtureId);

    expect(ids1).toEqual(ids2);
    expect(ids1).toEqual(ids3);

    // Assert status order: LIVE (0) -> UPCOMING (1) -> POSTPONED (2) -> FINISHED (3)
    expect(sorted1[0].fixtureId).toBe('gm-fix-3001'); // LIVE
    expect(sorted1[1].fixtureId).toBe('gm-fix-3002'); // UPCOMING
    expect(sorted1[2].fixtureId).toBe('gm-fix-3004'); // POSTPONED
    expect(sorted1[3].fixtureId).toBe('gm-fix-3003'); // FINISHED
  });

  it('Team Resolver maps known priority clubs and aliases accurately', () => {
    const arsenal = resolveTeam('42', 'Arsenal');
    expect(arsenal.isPriority).toBe(true);
    expect(arsenal.teamId).toBe('arsenal');

    const manUtdAlias = resolveTeam(undefined, 'Man Utd');
    expect(manUtdAlias.isPriority).toBe(true);
    expect(manUtdAlias.teamId).toBe('manchester-united');

    const alAhly = resolveTeam(undefined, 'Al Ahly SC');
    expect(alAhly.isPriority).toBe(true);
    expect(alAhly.teamId).toBe('al-ahly');
  });

  it('Country Resolver resolves aliases and assigns correct confederations', () => {
    const england = resolveCountry('England');
    expect(england.countryCode).toBe('GB-ENG');
    expect(england.confederationCode).toBe('UEFA');

    const nigeria = resolveCountry('Nigeria');
    expect(nigeria.countryCode).toBe('NG');
    expect(nigeria.confederationCode).toBe('CAF');

    const ivoryCoast = resolveCountry("Côte d'Ivoire");
    expect(ivoryCoast.countryCode).toBe('CI');
    expect(ivoryCoast.confederationCode).toBe('CAF');
  });
});
