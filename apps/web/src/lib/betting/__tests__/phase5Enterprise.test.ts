import { describe, it, expect } from 'vitest';
import {
  getAffiliateProvider,
  BookmakerDirectProvider,
  BetloyAffiliateProvider,
  AffiliateNetworkProvider,
  DormantWageringAdapter,
  DormantWalletService,
  DormantPaymentGateway,
  DormantRiskEngine,
  DormantSettlementService,
  DormantComplianceService,
  WageringNotPermittedError,
  assertWageringDeactivated,
  evaluatePlacementSlot,
} from '../index';

describe('Phase 5: Enterprise Monetization & Future Wagering Boundary', () => {
  describe('Universal Affiliate Provider Abstraction', () => {
    it('resolves direct bookmaker provider by default', () => {
      const provider = getAffiliateProvider('direct');
      expect(provider).toBeInstanceOf(BookmakerDirectProvider);
      expect(provider.id).toBe('direct');
      expect(provider.name).toContain('Direct Bookmaker');
    });

    it('resolves Betloy affiliate provider adapter', () => {
      const provider = getAffiliateProvider('betloy');
      expect(provider).toBeInstanceOf(BetloyAffiliateProvider);
      expect(provider.id).toBe('betloy');
    });

    it('resolves affiliate network aggregator adapter', () => {
      const provider = getAffiliateProvider('network');
      expect(provider).toBeInstanceOf(AffiliateNetworkProvider);
      expect(provider.id).toBe('network');
    });
  });

  describe('Commercial Placement & Anti-Corruption Guard', () => {
    it('evaluates placement slot with commercial disclosures', async () => {
      const result = await evaluatePlacementSlot('odds_table', 'GLOBAL');
      expect(result).toBeDefined();
      expect(result.badgeText).toBeTruthy();
      // Guarantees that commercial placement has an explicit label
      expect(['SPONSORED', 'OFFICIAL PARTNER', 'AD']).toContain(result.badgeText);
    });
  });

  describe('Sealed Future Wagering Boundary & Compliance Invariants', () => {
    it('asserts that wagering is 100% deactivated on the platform', () => {
      const status = assertWageringDeactivated();
      expect(status.isCompliant).toBe(true);
      expect(status.activeSportsbook).toBe(false);
    });

    it('strictly forbids wager placement validation', async () => {
      const adapter = new DormantWageringAdapter();
      expect(adapter.isActivated).toBe(false);
      await expect(adapter.validateWagerIntent({})).rejects.toThrow(WageringNotPermittedError);
    });

    it('strictly forbids wallet balances, deposits, and withdrawals', async () => {
      const wallet = new DormantWalletService();
      expect(wallet.isActivated).toBe(false);
      await expect(wallet.getBalance()).rejects.toThrow(WageringNotPermittedError);
      await expect(wallet.deposit()).rejects.toThrow(WageringNotPermittedError);
      await expect(wallet.withdraw()).rejects.toThrow(WageringNotPermittedError);
    });

    it('strictly forbids real-money payment gateway processing', async () => {
      const payments = new DormantPaymentGateway();
      expect(payments.isActivated).toBe(false);
      await expect(payments.processPayment({})).rejects.toThrow(WageringNotPermittedError);
    });

    it('strictly forbids risk engine liability execution', async () => {
      const risk = new DormantRiskEngine();
      expect(risk.isActivated).toBe(false);
      await expect(risk.evaluateLiability({})).rejects.toThrow(WageringNotPermittedError);
    });

    it('strictly forbids wager settlement', async () => {
      const settlement = new DormantSettlementService();
      expect(settlement.isActivated).toBe(false);
      await expect(settlement.settleWager('w_123', {})).rejects.toThrow(WageringNotPermittedError);
    });

    it('strictly forbids dormant compliance and KYC/AML processing', async () => {
      const compliance = new DormantComplianceService();
      expect(compliance.isActivated).toBe(false);
      await expect(compliance.verifyKYC()).rejects.toThrow(WageringNotPermittedError);
      await expect(compliance.screenAML('u_123', {})).rejects.toThrow(WageringNotPermittedError);
    });
  });
});
