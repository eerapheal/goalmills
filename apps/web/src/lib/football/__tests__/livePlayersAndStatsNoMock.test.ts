import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { getLiveSeasonPlayers } from '../livePlayersService';

describe('Live Players and Authentic 2026/2027 Season Statistics Suite', () => {
  it('should verify livePlayersService exports a getLiveSeasonPlayers function', () => {
    expect(typeof getLiveSeasonPlayers).toBe('function');
  });

  it('should verify stats/page.tsx contains no mock Golden Glove keepers or outdated 25/26 season tags', () => {
    const statsFilePath = path.resolve(__dirname, '../../../app/stats/page.tsx');
    const content = fs.readFileSync(statsFilePath, 'utf8');

    // Must not contain hardcoded players or outdated season
    expect(content).not.toContain("name: 'David Raya'");
    expect(content).not.toContain("name: 'Thibaut Courtois'");
    expect(content).not.toContain("name: 'Alisson Becker'");
    expect(content).not.toContain('>25/26<');

    // Must use 2026/2027 and derive live defense/scorers from API
    expect(content).toContain('2026/2027');
    expect(content).toContain('topDefenses');
    expect(content).toContain('eplScorers');
    expect(content).toContain('laLigaScorers');
  });

  it('should verify football/players/[slug]/page.tsx contains no mock academy, fake matches, or artificial xG formulas', () => {
    const playerPagePath = path.resolve(
      __dirname,
      '../../../app/football/players/[slug]/page.tsx'
    );
    const content = fs.readFileSync(playerPagePath, 'utf8');

    // Must not contain simulated academy or fake matches
    expect(content).not.toContain('Former Academy / Club');
    expect(content).not.toContain("opp: 'Arsenal'");
    expect(content).not.toContain("opp: 'Dortmund'");
    expect(content).not.toContain("opp: 'Wolves'");
    expect(content).not.toContain('goals * 0.82 + appearances * 0.08');
    expect(content).not.toContain('2025/26 Season at a Glance');

    // Must target active 2026/2027 season and query real team fixtures
    expect(content).toContain('2026/2027 Season at a Glance');
    expect(content).toContain('advancedFootballApi.getFixtures');
    expect(content).toContain('2026/2027');
  });

  it('should verify football/players/page.tsx fetches live players dynamically', () => {
    const playersHubPath = path.resolve(__dirname, '../../../app/football/players/page.tsx');
    const content = fs.readFileSync(playersHubPath, 'utf8');

    expect(content).toContain('getLiveSeasonPlayers');
    expect(content).toContain('await getLiveSeasonPlayers()');
  });
});
