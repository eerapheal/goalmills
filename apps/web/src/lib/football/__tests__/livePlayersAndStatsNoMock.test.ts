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

  it('should verify FootballPageClient.tsx uses 2026/2027 Golden Boot and no outdated 2025/2026 tag', () => {
    const pagePath = path.resolve(
      __dirname,
      '../../../components/football/FootballPageClient.tsx'
    );
    const content = fs.readFileSync(pagePath, 'utf8');

    // Must not contain outdated 2025/2026 Golden Boot label
    expect(content).not.toContain('European & African Golden Boot Race — 2025/2026');

    // Must contain 2026/2027 Golden Boot label and default tableLeagueId to 152
    expect(content).toContain('Golden Boot Race (2026/2027)');
    expect(content).toContain('Golden Boot (2026/2027)');
    expect(content).toContain('useState<number | null>(152)');
  });

  it('should verify livePlayersService.ts zeros out mock stats for unverified registry players', () => {
    const servicePath = path.resolve(__dirname, '../livePlayersService.ts');
    const content = fs.readFileSync(servicePath, 'utf8');

    // Must zero out goals and assists for registry players not found in live API top scorers
    expect(content).toContain('goals: 0');
    expect(content).toContain('assists: 0');
    expect(content).toContain('appearances: 0');
    expect(content).toContain('advancedFootballApi.getTopscorers(207)');
    expect(content).toContain('advancedFootballApi.getTopscorers(175)');
  });

  it('should verify PlayersHubClient.tsx filters Golden Boot by goals > 0 and displays 2026/2027 Golden Boot badge', () => {
    const hubClientPath = path.resolve(
      __dirname,
      '../../../components/players/PlayersHubClient.tsx'
    );
    const content = fs.readFileSync(hubClientPath, 'utf8');

    expect(content).toContain('2026/2027 Golden Boot');
    expect(content).toContain('.filter((p) => (p.seasonStats?.goals ?? 0) > 0)');
  });

  it('should verify FootballScreen.tsx targets 2026/2027 Golden Boot', () => {
    const screenPath = path.resolve(__dirname, '../../../components/FootballScreen.tsx');
    const content = fs.readFileSync(screenPath, 'utf8');

    expect(content).toContain('Golden Boot & Top Goal Scorers (2026/2027)');
  });
});
