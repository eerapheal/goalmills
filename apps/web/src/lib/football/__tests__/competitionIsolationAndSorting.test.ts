import { describe, it, expect } from 'vitest';
import {
  processFixture,
  processFixtures,
  filterFixturesByCompetition,
  getCanonicalCompetition,
  sortNormalizedFixtures,
  UNRESOLVED_COMPETITION_ID,
  PRIORITY_CLUBS_LIST,
  getCountryDomesticConfig,
  getAfricanCountries,
} from '../index';
import { FootballEvent, NormalizedFixture } from '@goalmills/types';

describe('GoalMills Competition Isolation & Deterministic Sorting Tests', () => {
  // ─── Test 1: Cross-Competition Contamination ──────────────────────────────────
  it('EPL page shows ONLY Premier League fixtures, never Championship or WSL or International', () => {
    // Fixture A: Arsenal vs Chelsea (Premier League)
    const fixtureA: FootballEvent = {
      event_key: 1001,
      league_key: 152, // Premier League
      league_name: 'Premier League',
      country_name: 'England',
      event_home_team: 'Arsenal',
      event_away_team: 'Chelsea',
      event_date: '2026-09-30',
      event_time: '15:00',
    };

    // Fixture B: Leeds vs Sheffield United (Championship)
    const fixtureB: FootballEvent = {
      event_key: 1002,
      league_key: 153, // Championship
      league_name: 'Championship',
      country_name: 'England',
      event_home_team: 'Leeds United',
      event_away_team: 'Sheffield United',
      event_date: '2026-09-30',
      event_time: '15:00',
    };

    // Fixture C: Chelsea Women vs Arsenal Women (Women's Super League)
    const fixtureC: FootballEvent = {
      event_key: 1003,
      league_key: 0,
      league_name: "Women's Super League",
      country_name: 'England',
      event_home_team: 'Chelsea FC Women',
      event_away_team: 'Arsenal Women FC',
      event_date: '2026-09-30',
      event_time: '14:00',
    };

    // Fixture D: England vs Germany (International Senior)
    const fixtureD: FootballEvent = {
      event_key: 1004,
      league_key: 28, // FIFA World Cup
      league_name: 'FIFA World Cup',
      country_name: 'World',
      event_home_team: 'England',
      event_away_team: 'Germany',
      event_date: '2026-09-30',
      event_time: '19:45',
    };

    const normA = processFixture(fixtureA);
    const normB = processFixture(fixtureB);
    const normC = processFixture(fixtureC);
    const normD = processFixture(fixtureD);

    expect(normA.competitionId).toBe('ENG-PREMIER-LEAGUE');
    expect(normB.competitionId).toBe('ENG-CHAMPIONSHIP');
    expect(normC.competitionId).toBe('ENG-WOMENS-SUPER-LEAGUE');
    expect(normD.competitionId).toBe('FIFA-WORLD-CUP');

    const all = [normA, normB, normC, normD];

    // EPL page filter
    const eplFixtures = filterFixturesByCompetition(all, 'ENG-PREMIER-LEAGUE');
    expect(eplFixtures).toHaveLength(1);
    expect(eplFixtures[0].fixtureId).toBe('gm-fix-1001');

    // Championship page filter
    const champFixtures = filterFixturesByCompetition(all, 'ENG-CHAMPIONSHIP');
    expect(champFixtures).toHaveLength(1);
    expect(champFixtures[0].fixtureId).toBe('gm-fix-1002');

    // WSL page filter
    const wslFixtures = filterFixturesByCompetition(all, 'ENG-WOMENS-SUPER-LEAGUE');
    expect(wslFixtures).toHaveLength(1);
    expect(wslFixtures[0].fixtureId).toBe('gm-fix-1003');

    // International / World Cup page filter
    const intlFixtures = filterFixturesByCompetition(all, 'FIFA-WORLD-CUP');
    expect(intlFixtures).toHaveLength(1);
    expect(intlFixtures[0].fixtureId).toBe('gm-fix-1004');
  });

  // ─── Test 2: Gender Isolation ────────────────────────────────────────────────
  it('strictly isolates Men and Women fixtures', () => {
    const mensMatch = processFixture({
      event_key: 2001,
      league_key: 152,
      event_home_team: 'Arsenal',
      event_away_team: 'Chelsea',
    });

    const womensMatch = processFixture({
      event_key: 2002,
      league_key: 0,
      league_name: "Women's Super League",
      country_name: 'England',
      event_home_team: 'Chelsea FC Women',
      event_away_team: 'Arsenal Women FC',
    });

    expect(mensMatch.gender).toBe('MALE');
    expect(womensMatch.gender).toBe('FEMALE');
    expect(mensMatch.gender).not.toBe(womensMatch.gender);
  });

  // ─── Test 3: Youth vs Senior Isolation ───────────────────────────────────────
  it('strictly isolates Youth and Senior competitions', () => {
    const seniorComp = getCanonicalCompetition('UEFA-EURO');
    const u21Comp = getCanonicalCompetition('UEFA-U21-EURO');

    expect(seniorComp?.ageCategory).toBe('SENIOR');
    expect(u21Comp?.ageCategory).toBe('U21');
    expect(seniorComp?.id).not.toBe(u21Comp?.id);
  });

  // ─── Test 4: Quarantine Engine for Unknown Competitions ──────────────────────
  it('quarantines unknown competitions rather than guessing by league name substring or team name', () => {
    const rawUnknown: FootballEvent = {
      event_key: 99999,
      league_key: 0,
      league_name: 'Premier Regional Amateur Cup of Nowhere',
      event_home_team: 'Red Stars',
      event_away_team: 'Blue Birds',
    };

    const normalized = processFixture(rawUnknown);

    // MUST NOT be classified as Premier League despite having "Premier" in name!
    expect(normalized.competitionId).not.toBe('ENG-PREMIER-LEAGUE');
    expect(normalized.competitionId).toBe(UNRESOLVED_COMPETITION_ID);
    expect(normalized.classificationStatus).toBe('UNRESOLVED');
  });

  // ─── Test 5: Deterministic 4-Tuple Sorting Regardless of API Order ───────────
  it('produces identical deterministic ordering regardless of provider input array order', () => {
    const matchLive: NormalizedFixture = {
      fixtureId: 'match-1',
      providerFixtureId: 1,
      competitionId: 'ENG-PREMIER-LEAGUE',
      seasonId: '2025/2026',
      homeTeamId: 'arsenal',
      homeTeamName: 'Arsenal',
      homeTeamLogo: '',
      awayTeamId: 'chelsea',
      awayTeamName: 'Chelsea',
      awayTeamLogo: '',
      countryCode: 'GB-ENG',
      confederationCode: 'UEFA',
      gender: 'MALE',
      ageCategory: 'SENIOR',
      status: 'LIVE',
      classificationStatus: 'RESOLVED',
      scheduledAt: '2026-09-29T15:00:00Z',
      priorityRank: 1,
      isFeatured: true,
      lastUpdatedAt: new Date().toISOString(),
    };

    const matchUpcoming: NormalizedFixture = {
      fixtureId: 'match-2',
      providerFixtureId: 2,
      competitionId: 'ESP-LA-LIGA',
      seasonId: '2025/2026',
      homeTeamId: 'real-madrid',
      homeTeamName: 'Real Madrid',
      homeTeamLogo: '',
      awayTeamId: 'barcelona',
      awayTeamName: 'Barcelona',
      awayTeamLogo: '',
      countryCode: 'ES',
      confederationCode: 'UEFA',
      gender: 'MALE',
      ageCategory: 'SENIOR',
      status: 'UPCOMING',
      classificationStatus: 'RESOLVED',
      scheduledAt: '2026-09-29T18:00:00Z',
      priorityRank: 2,
      isFeatured: true,
      lastUpdatedAt: new Date().toISOString(),
    };

    const matchFinished: NormalizedFixture = {
      fixtureId: 'match-3',
      providerFixtureId: 3,
      competitionId: 'ITA-SERIE-A',
      seasonId: '2025/2026',
      homeTeamId: 'inter',
      homeTeamName: 'Inter',
      homeTeamLogo: '',
      awayTeamId: 'juventus',
      awayTeamName: 'Juventus',
      awayTeamLogo: '',
      countryCode: 'IT',
      confederationCode: 'UEFA',
      gender: 'MALE',
      ageCategory: 'SENIOR',
      status: 'FT',
      classificationStatus: 'RESOLVED',
      scheduledAt: '2026-09-29T12:00:00Z',
      priorityRank: 3,
      isFeatured: true,
      lastUpdatedAt: new Date().toISOString(),
    };

    // Input Order 1: Finished, Upcoming, Live
    const order1 = [matchFinished, matchUpcoming, matchLive];
    const sorted1 = sortNormalizedFixtures(order1);

    // Input Order 2: Upcoming, Live, Finished
    const order2 = [matchUpcoming, matchLive, matchFinished];
    const sorted2 = sortNormalizedFixtures(order2);

    // Both MUST produce: LIVE -> UPCOMING -> FT
    expect(sorted1.map((m) => m.fixtureId)).toEqual(['match-1', 'match-2', 'match-3']);
    expect(sorted2.map((m) => m.fixtureId)).toEqual(['match-1', 'match-2', 'match-3']);
  });

  // ─── Test 6: Priority Clubs Registry ─────────────────────────────────────────
  it('covers at least 150 priority clubs across domestic, CAF, and world football', () => {
    expect(PRIORITY_CLUBS_LIST.length).toBeGreaterThanOrEqual(150);

    const africanClubs = PRIORITY_CLUBS_LIST.filter((c) => c.isAfrican);
    expect(africanClubs.length).toBeGreaterThan(15);

    const womensClubs = PRIORITY_CLUBS_LIST.filter((c) => c.isWomens);
    expect(womensClubs.length).toBeGreaterThan(5);
  });

  // ─── Test 7: Top 5 European 6-Priority Domestic Structure ────────────────────
  it('supports the configured 6 priority competitions for England, Spain, Italy, Germany, France', () => {
    const countries = ['GB-ENG', 'ES', 'IT', 'DE', 'FR'];
    for (const code of countries) {
      const config = getCountryDomesticConfig(code);
      expect(config).toBeDefined();
      expect(config?.priorityCompetitions).toHaveLength(6);
    }
  });

  // ─── Test 8: African Hierarchy ───────────────────────────────────────────────
  it('supports first-class African football with 16 registered nations', () => {
    const africanNations = getAfricanCountries();
    expect(africanNations.length).toBeGreaterThanOrEqual(16);
  });
});
