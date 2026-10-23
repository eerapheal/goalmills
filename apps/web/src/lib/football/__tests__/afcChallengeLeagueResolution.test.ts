import { describe, it, expect } from 'vitest';
import {
  getCanonicalCompetition,
  processFixture,
  resolveCompetitionForFixture,
} from '../index';
import { buildMatchSlug, parseMatchSlug, slugify } from '@/lib/slugUtils';
import { getLeagueShortName } from '../topLeagues';

describe('AFC Challenge League & Competition URL Resolution Tests', () => {
  it('resolves canonical afc-challenge-league with Asia & AFC confederation', () => {
    const comp = getCanonicalCompetition('afc-challenge-league');
    expect(comp).toBeDefined();
    expect(comp?.id).toBe('AFC-CHALLENGE-LEAGUE');
    expect(comp?.slug).toBe('afc-challenge-league');
    expect(comp?.name).toBe('AFC Challenge League');
    expect(comp?.shortName).toBe('AFC Challenge');
    expect(comp?.confederationCode).toBe('AFC');
    expect(comp?.countryName).toBe('Asia');
    expect(comp?.countryCode).toBe('AFC');
    expect(comp?.isContinental).toBe(true);
  });

  it('resolves URL-encoded "Afc%20challenge%20league%20 %20group%20stage" cleanly to AFC Challenge League', () => {
    const rawUrlSlug = 'Afc%20challenge%20league%20 %20group%20stage';
    const comp = getCanonicalCompetition(rawUrlSlug);
    expect(comp).toBeDefined();
    expect(comp?.slug).toBe('afc-challenge-league');
    expect(comp?.name).toBe('AFC Challenge League');
    expect(comp?.confederationCode).toBe('AFC');
    expect(comp?.countryName).toBe('Asia');
  });

  it('resolves hyphenated stage slug "afc-challenge-league-group-stage" to canonical afc-challenge-league', () => {
    const stageSlug = 'afc-challenge-league-group-stage';
    const comp = getCanonicalCompetition(stageSlug);
    expect(comp).toBeDefined();
    expect(comp?.slug).toBe('afc-challenge-league');
    expect(comp?.name).toBe('AFC Challenge League');
  });

  it('correctly classifies a raw provider fixture with league_key 11699 and stage suffix', () => {
    const rawEvent = {
      event_key: 1869187,
      event_date: '2026-10-24',
      event_time: '14:00',
      event_home_team: 'Taiwan Steel',
      home_team_key: 460,
      event_away_team: 'Yangon Utd',
      away_team_key: 439,
      country_name: 'intl',
      league_name: 'AFC Challenge League - Group Stage',
      league_key: 11699,
      stage_name: 'Group Stage',
    };

    const resolution = resolveCompetitionForFixture(rawEvent);
    expect(resolution.isResolved).toBe(true);
    expect(resolution.status).toBe('RESOLVED');
    expect(resolution.competitionId).toBe('AFC-CHALLENGE-LEAGUE');
    expect(resolution.competition?.slug).toBe('afc-challenge-league');

    const normalized = processFixture(rawEvent);
    expect(normalized.classificationStatus).toBe('RESOLVED');
    expect(normalized.competitionId).toBe('AFC-CHALLENGE-LEAGUE');
    expect(normalized.countryCode).toBe('AFC');
    expect(normalized.confederationCode).toBe('AFC');
  });

  it('strips tournament stage suffixes in buildMatchSlug and parseMatchSlug', () => {
    const matchSlug = buildMatchSlug({
      home: 'Taiwan Steel',
      away: 'Yangon Utd',
      comp: 'AFC Challenge League - Group Stage',
      league_key: 11699,
      id: 1869187,
      date: '2026-10-24',
    });

    expect(matchSlug).toContain('taiwan-steel-vs-yangon-utd-afc-challenge-league-');
    expect(matchSlug).not.toContain('group-stage');

    const parsed = parseMatchSlug(matchSlug);
    expect(parsed.competitionSlug).toBe('afc-challenge-league');
    expect(parsed.eventKey).toBe('1869187');
  });

  it('returns clean standardized short name for AFC Challenge League', () => {
    const shortName = getLeagueShortName(11699, 'AFC Challenge League - Group Stage', 'intl');
    expect(shortName).toBe('AFC Challenge');
  });

  it('guarantees dynamic fallback competitions never contain spaces or %20 in slug', () => {
    const testSlug = 'Some Dynamic League - Group Stage';
    const comp = getCanonicalCompetition(testSlug);
    expect(comp).toBeDefined();
    expect(comp?.slug).toBe('some-dynamic-league');
    expect(comp?.slug).not.toContain(' ');
    expect(comp?.slug).not.toContain('%20');
  });
});
