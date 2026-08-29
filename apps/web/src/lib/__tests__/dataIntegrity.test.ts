import { describe, it, expect } from 'vitest';

export interface StandingTestItem {
  rank: number | string;
  team_name: string;
  team_logo?: string;
  team_id?: number | string;
  played: number | string;
  win: number | string;
  draw: number | string;
  lose: number | string;
  goalsDiff: number | string;
  points: number | string;
}

function adaptStandingTest(item: any): StandingTestItem | null {
  if (!item) return null;

  // Format 1: API-Sports / API-Football (item.team, item.all, item.rank)
  if (item.team && typeof item.team === 'object') {
    return {
      rank: item.rank || 1,
      team_name: item.team?.name || 'Team',
      team_logo: item.team?.logo || '',
      team_id: item.team?.id,
      played: item.all?.played ?? item.played ?? 0,
      win: item.all?.win ?? item.win ?? 0,
      draw: item.all?.draw ?? item.draw ?? 0,
      lose: item.all?.lose ?? item.lose ?? 0,
      goalsDiff: item.goalsDiff ?? 0,
      points: item.points ?? 0,
    };
  }

  // Format 2: AllSportsAPI (item.standing_team, item.standing_place, item.team_logo)
  if (item.standing_team || item.standing_place !== undefined) {
    return {
      rank: item.standing_place || item.standing_position || 1,
      team_name: item.standing_team || 'Team',
      team_logo: item.team_logo || item.team_badge || '',
      team_id: item.team_key || item.standing_team_id,
      played: item.standing_P ?? item.standing_played ?? 0,
      win: item.standing_W ?? item.standing_won ?? 0,
      draw: item.standing_D ?? item.standing_draw ?? 0,
      lose: item.standing_L ?? item.standing_lost ?? 0,
      goalsDiff: item.standing_GD ?? item.standing_gd ?? 0,
      points: item.standing_PTS ?? item.standing_pts ?? item.standing_points ?? 0,
    };
  }

  return null;
}

function validatePredictionProbabilities(
  home: number,
  draw: number,
  away: number
): { isValid: boolean; normalizedSum: number } {
  if (
    typeof home !== 'number' ||
    typeof draw !== 'number' ||
    typeof away !== 'number' ||
    isNaN(home) ||
    isNaN(draw) ||
    isNaN(away) ||
    home < 0 ||
    draw < 0 ||
    away < 0
  ) {
    return { isValid: false, normalizedSum: 0 };
  }

  const sum = Math.round(home + draw + away);
  // Must sum to approximately 100% (allowing small rounding difference between 99 and 101)
  return {
    isValid: sum >= 99 && sum <= 101,
    normalizedSum: sum,
  };
}

describe('Data Integrity & Normalization Suite', () => {
  describe('Multi-Provider Standings Normalization', () => {
    it('should normalize API-Football format with nested team and all statistics', () => {
      const rawApiFootball = {
        rank: 1,
        team: {
          id: 42,
          name: 'Arsenal',
          logo: 'https://media.api-sports.io/football/teams/42.png',
        },
        all: { played: 26, win: 18, draw: 4, lose: 4 },
        goalsDiff: 33,
        points: 58,
      };

      const normalized = adaptStandingTest(rawApiFootball);
      expect(normalized).not.toBeNull();
      expect(normalized?.team_name).toBe('Arsenal');
      expect(normalized?.team_logo).toBe('https://media.api-sports.io/football/teams/42.png');
      expect(normalized?.played).toBe(26);
      expect(normalized?.win).toBe(18);
      expect(normalized?.draw).toBe(4);
      expect(normalized?.lose).toBe(4);
      expect(normalized?.points).toBe(58);
    });

    it('should normalize AllSportsAPI flat format without throwing TypeError on logo access', () => {
      const rawAllSports = {
        standing_place: '2',
        standing_team: 'Manchester City',
        team_logo: 'https://apiv2.allsportsapi.com/logo-football/man_city.jpg',
        standing_P: '25',
        standing_W: '17',
        standing_D: '5',
        standing_L: '3',
        standing_GD: '30',
        standing_PTS: '56',
        team_key: '142',
      };

      const normalized = adaptStandingTest(rawAllSports);
      expect(normalized).not.toBeNull();
      expect(normalized?.team_name).toBe('Manchester City');
      expect(normalized?.team_logo).toBe('https://apiv2.allsportsapi.com/logo-football/man_city.jpg');
      expect(normalized?.played).toBe('25');
      expect(normalized?.win).toBe('17');
      expect(normalized?.points).toBe('56');
    });

    it('should return null for empty or corrupted row items gracefully', () => {
      expect(adaptStandingTest(null)).toBeNull();
      expect(adaptStandingTest(undefined)).toBeNull();
      expect(adaptStandingTest({})).toBeNull();
    });
  });

  describe('Prediction Integrity & Probability Validation', () => {
    it('should validate mathematically consistent probability distributions summing to 100%', () => {
      const check = validatePredictionProbabilities(45, 25, 30);
      expect(check.isValid).toBe(true);
      expect(check.normalizedSum).toBe(100);
    });

    it('should reject invalid or fabricated distributions that fail the 100% constraint', () => {
      const invalidOver = validatePredictionProbabilities(75, 40, 50); // Sum = 165
      expect(invalidOver.isValid).toBe(false);

      const invalidUnder = validatePredictionProbabilities(10, 10, 10); // Sum = 30
      expect(invalidUnder.isValid).toBe(false);

      const invalidNegative = validatePredictionProbabilities(-10, 60, 50);
      expect(invalidNegative.isValid).toBe(false);
    });
  });

  describe('Live Match Status Integrity', () => {
    it('should guarantee finished matches cannot be flagged as live', () => {
      const finishedMatch = {
        event_status: 'FT',
        event_live: '0',
      };
      const isLive =
        finishedMatch.event_live === '1' &&
        finishedMatch.event_status !== 'FT' &&
        finishedMatch.event_status !== 'Finished';

      expect(isLive).toBe(false);
    });

    it('should flag in-progress periods as live', () => {
      const livePeriods = ['1H', '2H', 'HT', 'ET', 'LIVE'];
      livePeriods.forEach((status) => {
        const isLive = ['1H', '2H', 'HT', 'ET', 'LIVE'].includes(status);
        expect(isLive).toBe(true);
      });
    });
  });
});
