import { describe, it, expect } from 'vitest';

describe('Sports Normalization Engine', () => {
  describe('Football Status & Structure Normalization', () => {
    it('should normalize live, halftime, and finished match states correctly', () => {
      const normalizeStatus = (status: string): string => {
        const s = (status || '').toLowerCase();
        if (s === 'ft' || s === 'finished' || s === 'aet' || s === 'pen') return 'finished';
        if (s === 'ht' || s === 'half time' || s === 'halftime') return 'halftime';
        if (s.includes('live') || s.includes('1st') || s.includes('2nd') || s === 'in progress') return 'live';
        if (s === 'postponed') return 'postponed';
        if (s === 'cancelled') return 'cancelled';
        return 'scheduled';
      };

      expect(normalizeStatus('FT')).toBe('finished');
      expect(normalizeStatus('HT')).toBe('halftime');
      expect(normalizeStatus('1st Half')).toBe('live');
      expect(normalizeStatus('2nd Half - 75 min')).toBe('live');
      expect(normalizeStatus('Postponed')).toBe('postponed');
      expect(normalizeStatus('Not Started')).toBe('scheduled');
    });

    it('should parse home and away scores from final result string', () => {
      const parseResult = (finalResult?: string, homeScore?: any, awayScore?: any) => {
        if (finalResult && finalResult.includes('-')) {
          const [h, a] = finalResult.split('-').map((s) => s.trim());
          return { home: parseInt(h, 10) || 0, away: parseInt(a, 10) || 0 };
        }
        return {
          home: parseInt(homeScore, 10) || 0,
          away: parseInt(awayScore, 10) || 0,
        };
      };

      expect(parseResult('3 - 1')).toEqual({ home: 3, away: 1 });
      expect(parseResult(undefined, '2', '2')).toEqual({ home: 2, away: 2 });
    });
  });

  describe('Cricket Innings & Scorecard Normalization', () => {
    it('should normalize cricket match format with runs, wickets, and overs', () => {
      const normalizeCricketInning = (teamScore?: { runs?: number; wickets?: number; overs?: number }) => {
        return {
          runs: teamScore?.runs ?? 0,
          wickets: teamScore?.wickets ?? 0,
          overs: teamScore?.overs ?? 0,
          formatted: `${teamScore?.runs ?? 0}/${teamScore?.wickets ?? 0} (${teamScore?.overs ?? 0} ov)`,
        };
      };

      const inning = normalizeCricketInning({ runs: 287, wickets: 6, overs: 50.0 });
      expect(inning.formatted).toBe('287/6 (50 ov)');
      expect(inning.runs).toBe(287);
      expect(inning.wickets).toBe(6);
    });
  });

  describe('Basketball Quarter & Period Normalization', () => {
    it('should calculate total score from quarters and identify overtime', () => {
      const normalizeBasketballScores = (quarters: number[]) => {
        const total = quarters.reduce((acc, curr) => acc + curr, 0);
        const hasOvertime = quarters.length > 4;
        return {
          total,
          isOvertime: hasOvertime,
          quarters,
        };
      };

      const regularMatch = normalizeBasketballScores([24, 28, 30, 22]);
      expect(regularMatch.total).toBe(104);
      expect(regularMatch.isOvertime).toBe(false);

      const overtimeMatch = normalizeBasketballScores([25, 25, 25, 25, 12]);
      expect(overtimeMatch.total).toBe(112);
      expect(overtimeMatch.isOvertime).toBe(true);
    });
  });

  describe('Data Freshness & Staleness Detection', () => {
    it('should detect stale live scores if last updated is older than threshold', () => {
      const isDataStale = (lastUpdatedAt: string, maxAgeSeconds: number = 30): boolean => {
        const updatedTime = new Date(lastUpdatedAt).getTime();
        const now = Date.now();
        return (now - updatedTime) / 1000 > maxAgeSeconds;
      };

      const freshTimestamp = new Date(Date.now() - 5000).toISOString();
      const staleTimestamp = new Date(Date.now() - 60000).toISOString();

      expect(isDataStale(freshTimestamp, 30)).toBe(false);
      expect(isDataStale(staleTimestamp, 30)).toBe(true);
    });
  });
});
