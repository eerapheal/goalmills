import { describe, it, expect } from 'vitest';
import {
  buildMatchSlug,
  parseMatchSlug,
  extractEventKeyFromSlug,
  getMatchSeasonSlug,
} from '../../slugUtils';
import fs from 'fs';
import path from 'path';

describe('Dynamic Match Slug Generation & Parsing', () => {
  it('should generate a dynamic match slug with home, away, competition, season, and eventKey', () => {
    const slug = buildMatchSlug({
      home: 'Man City',
      away: 'Man United',
      comp: 'English Premier League',
      date: '2026-09-29',
      id: 1869244,
    });
    expect(slug).toBe('man-city-vs-man-united-english-premier-league-2026-2027-season-1869244');
  });

  it('should generate keyless slug when id/event_key is omitted', () => {
    const slug = buildMatchSlug({
      home: 'Arsenal',
      away: 'Chelsea',
      comp: 'Premier League',
      season: '2026/2027',
    });
    expect(slug).toBe('arsenal-vs-chelsea-english-premier-league-2026-2027-season');
  });

  it('should dynamically compute season from date in autumn/winter (e.g. September -> 2026-2027-season)', () => {
    const seasonSlug = getMatchSeasonSlug(undefined, '2026-09-15');
    expect(seasonSlug).toBe('2026-2027-season');
  });

  it('should dynamically compute season from date in spring (e.g. March -> 2025-2026-season)', () => {
    const seasonSlug = getMatchSeasonSlug(undefined, '2026-03-15');
    expect(seasonSlug).toBe('2025-2026-season');
  });

  it('should correctly parse the user prompt slug format with slash and typos: man-city-vs-man-united-enslish-primier-leangue-2026/2027-sesion', () => {
    const parsed = parseMatchSlug('man-city-vs-man-united-enslish-primier-leangue-2026/2027-sesion');
    expect(parsed.homeSlug).toBe('man-city');
    expect(parsed.awaySlug).toBe('man-united');
    expect(parsed.competitionSlug).toBe('enslish-primier-leangue');
    expect(parsed.season).toBe('2026-2027');
    expect(parsed.year).toBe('2026');
    expect(parsed.eventKey).toBe('');
  });

  it('should correctly parse standard slug with trailing ID', () => {
    const parsed = parseMatchSlug('man-city-vs-man-united-english-premier-league-2026-2027-season-1869244');
    expect(parsed.homeSlug).toBe('man-city');
    expect(parsed.awaySlug).toBe('man-united');
    expect(parsed.competitionSlug).toBe('english-premier-league');
    expect(parsed.season).toBe('2026-2027');
    expect(parsed.year).toBe('2026');
    expect(parsed.eventKey).toBe('1869244');
  });

  it('should correctly parse pure numeric ID slug', () => {
    const parsed = parseMatchSlug('1869244');
    expect(parsed.eventKey).toBe('1869244');
    expect(extractEventKeyFromSlug('1869244')).toBe('1869244');
  });

  it('should support legacy slug: arsenal-vs-chelsea-2026-12345', () => {
    const parsed = parseMatchSlug('arsenal-vs-chelsea-2026-12345');
    expect(parsed.homeSlug).toBe('arsenal');
    expect(parsed.awaySlug).toBe('chelsea');
    expect(parsed.eventKey).toBe('12345');
    expect(parsed.year).toBe('2026');
  });
});

describe('Zero Mock Data Platform Verification', () => {
  it('should verify FootballPageClient.tsx does NOT contain hardcoded mock fixture arrays', () => {
    const clientPath = path.resolve(__dirname, '../../../components/football/FootballPageClient.tsx');
    const content = fs.readFileSync(clientPath, 'utf-8');

    // Verify mock constants were removed
    expect(content).not.toContain('DEFAULT_LIVE_FIXTURES');
    expect(content).not.toContain('DEFAULT_UPCOMING_FIXTURES');
    expect(content).not.toContain('DEFAULT_RESULTS');
    expect(content).not.toContain('const PL_TABLE');
    expect(content).not.toContain('const TOP_SCORERS');

    // Verify state starts clean with empty arrays
    expect(content).toContain('const [liveFixtures, setLiveFixtures] = useState<FixtureItem[]>([]);');
    expect(content).toContain('const [upcomingFixtures, setUpcomingFixtures] = useState<FixtureItem[]>([]);');
    expect(content).toContain('const [resultsFixtures, setResultsFixtures] = useState<FixtureItem[]>([]);');

    // Verify MatchCard links use dynamic match slug
    expect(content).toContain('footballRoutes.match(matchSlug)');
  });
});
