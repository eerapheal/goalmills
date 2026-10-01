import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  recalculateBetSlip,
  removeLegFromSlip,
  updateLegSelection,
} from '../betEditorService';
import { generatePublicSlipId } from '../betSlipSaverService';
import { evaluateOddsAlert } from '../oddsAlertService';
import { trackBettingAnalytics } from '../bettingAnalyticsService';
import { BetSlipLeg, OddsAlert } from '@goalmills/types';

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/OddsAlert', () => ({
  default: {
    updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
  },
}));

vi.mock('@/models/BettingAnalyticsEvent', () => ({
  default: {
    create: vi.fn().mockResolvedValue(true),
  },
}));

describe('Phase 4: GoalMills Betting Intelligence Platform', () => {
  const sampleLegs: BetSlipLeg[] = [
    {
      id: 'leg_1',
      fixture: 'Arsenal vs Chelsea',
      homeTeam: 'Arsenal',
      awayTeam: 'Chelsea',
      sport: 'football',
      status: 'PENDING',
      selection: { market: '1X2', selection: 'Home', odds: 2.0, probability: 0.5 },
    },
    {
      id: 'leg_2',
      fixture: 'Real Madrid vs Barcelona',
      homeTeam: 'Real Madrid',
      awayTeam: 'Barcelona',
      sport: 'football',
      status: 'PENDING',
      selection: { market: 'BTTS', selection: 'Yes', odds: 1.5, probability: 0.6 },
    },
  ];

  describe('Bet Editor Service', () => {
    it('recalculates accumulator combined odds and potential payout correctly', () => {
      const result = recalculateBetSlip({
        legs: sampleLegs,
        sourceBookmaker: '1xbet',
        stake: 20,
      });

      // 2.0 * 1.5 = 3.0
      expect(result.totalOdds).toBe(3.0);
      expect(result.potentialPayout).toBe(60.0);
      expect(result.legCount).toBe(2);
      expect(result.estimatedWinProbability).toBeGreaterThan(0);
    });

    it('removes a leg and updates slip totals', () => {
      const trimmed = removeLegFromSlip(sampleLegs, 'leg_2');
      expect(trimmed.length).toBe(1);
      expect(trimmed[0].id).toBe('leg_1');

      const result = recalculateBetSlip({
        legs: trimmed,
        sourceBookmaker: '1xbet',
        stake: 10,
      });

      expect(result.totalOdds).toBe(2.0);
      expect(result.potentialPayout).toBe(20.0);
    });

    it('updates leg selection and alters combined odds', () => {
      const updated = updateLegSelection(sampleLegs, 'leg_1', {
        market: '1X2',
        selection: 'Draw',
        odds: 3.5,
      });

      expect(updated[0].selection.selection).toBe('Draw');
      expect(updated[0].selection.odds).toBe(3.5);

      const result = recalculateBetSlip({
        legs: updated,
        sourceBookmaker: '1xbet',
        stake: 10,
      });

      // 3.5 * 1.5 = 5.25
      expect(result.totalOdds).toBe(5.25);
      expect(result.potentialPayout).toBe(52.5);
    });
  });

  describe('Bet Slip Saver & Public Sharing', () => {
    it('generates secure publicId starting with gm_slip_ prefix', () => {
      const id1 = generatePublicSlipId();
      const id2 = generatePublicSlipId();

      expect(id1).toMatch(/^gm_slip_[a-z0-9]+_[a-f0-9]+$/);
      expect(id2).toMatch(/^gm_slip_[a-z0-9]+_[a-f0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('Odds Alert Service', () => {
    it('triggers alert when live odds reach or exceed targetOdds', async () => {
      const alert: OddsAlert = {
        id: 'alert_1',
        userId: 'user_123',
        eventId: 'gm_event_football_1058291',
        sport: 'football',
        matchName: 'Arsenal vs Chelsea',
        marketId: '1X2',
        marketName: 'Match Winner',
        selection: 'Home',
        targetOdds: 2.10,
        initialOdds: 1.85,
        targetDirection: 'GREATER_THAN_OR_EQUAL',
        channel: 'IN_APP',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 1. Current odds 2.05 < target 2.10 -> Not triggered
      const eval1 = await evaluateOddsAlert(alert, 2.05);
      expect(eval1.triggered).toBe(false);
      expect(eval1.alert.status).toBe('ACTIVE');

      // 2. Current odds 2.15 >= target 2.10 -> Triggered
      const eval2 = await evaluateOddsAlert(alert, 2.15);
      expect(eval2.triggered).toBe(true);
      expect(eval2.alert.status).toBe('TRIGGERED');
    });

    it('triggers alert when targetDirection is LESS_THAN_OR_EQUAL', async () => {
      const alert: OddsAlert = {
        id: 'alert_2',
        eventId: 'gm_event_football_999',
        sport: 'football',
        matchName: 'Man City vs Liverpool',
        marketId: '1X2',
        marketName: 'Match Winner',
        selection: 'Home',
        targetOdds: 1.50,
        initialOdds: 1.65,
        targetDirection: 'LESS_THAN_OR_EQUAL',
        channel: 'EMAIL',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const res = await evaluateOddsAlert(alert, 1.48);
      expect(res.triggered).toBe(true);
    });
  });

  describe('Betting Analytics Telemetry', () => {
    it('tracks betting analytics events safely without throwing', async () => {
      const success = await trackBettingAnalytics({
        eventName: 'bet_now_clicked',
        bookmakerId: '1xbet',
        placement: 'betting_scanner',
        campaign: 'test_campaign',
        anonymousVisitorId: 'anon_abc123',
        metadata: { odds: 3.5, potentialPayout: 35.0 },
      });

      expect(success).toBe(true);
    });
  });
});
