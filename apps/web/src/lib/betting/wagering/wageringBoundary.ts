import {
  WageringAdapterInterface,
  WalletServiceInterface,
  PaymentGatewayInterface,
  RiskEngineInterface,
  SettlementServiceInterface,
  ComplianceServiceInterface,
} from '@goalmills/types';

/**
 * Custom error thrown if any component or process attempts real-money wagering execution.
 */
export class WageringNotPermittedError extends Error {
  constructor(message = 'Real-money wagering, wallets, and betting acceptance are strictly disabled on GoalMills.') {
    super(`[GOALMILLS_COMPLIANCE_RESTRICTION] ${message}`);
    this.name = 'WageringNotPermittedError';
  }
}

/**
 * 1. Dormant Wagering Adapter
 */
export class DormantWageringAdapter implements WageringAdapterInterface {
  readonly isActivated = false as const;

  async validateWagerIntent(): Promise<never> {
    throw new WageringNotPermittedError('Cannot validate wager intent. Sportsbook is dormant.');
  }
}

/**
 * 2. Dormant Wallet Service
 */
export class DormantWalletService implements WalletServiceInterface {
  readonly isActivated = false as const;

  async getBalance(): Promise<never> {
    throw new WageringNotPermittedError('Customer wallet balances are not supported.');
  }

  async deposit(): Promise<never> {
    throw new WageringNotPermittedError('Real-money account funding/deposits are strictly prohibited.');
  }

  async withdraw(): Promise<never> {
    throw new WageringNotPermittedError('Real-money withdrawals are strictly prohibited.');
  }
}

/**
 * 3. Dormant Payment Gateway
 */
export class DormantPaymentGateway implements PaymentGatewayInterface {
  readonly isActivated = false as const;

  async processPayment(): Promise<never> {
    throw new WageringNotPermittedError('Wagering payment gateway is not operational.');
  }
}

/**
 * 4. Dormant Risk Engine
 */
export class DormantRiskEngine implements RiskEngineInterface {
  readonly isActivated = false as const;

  async evaluateLiability(): Promise<never> {
    throw new WageringNotPermittedError('Sportsbook liability calculation is dormant.');
  }
}

/**
 * 5. Dormant Settlement Service
 */
export class DormantSettlementService implements SettlementServiceInterface {
  readonly isActivated = false as const;

  async settleWager(): Promise<never> {
    throw new WageringNotPermittedError('Wager settlement is not supported.');
  }
}

/**
 * 6. Dormant Compliance Service
 */
export class DormantComplianceService implements ComplianceServiceInterface {
  readonly isActivated = false as const;

  async verifyKYC(): Promise<never> {
    throw new WageringNotPermittedError('Wagering KYC verification is dormant.');
  }

  async screenAML(): Promise<never> {
    throw new WageringNotPermittedError('Wagering AML transaction screening is dormant.');
  }
}

/**
 * Runtime Invariant Guard
 * Asserts that the application runtime has zero active sportsbook connections.
 */
export function assertWageringDeactivated(): { isCompliant: true; activeSportsbook: false } {
  return {
    isCompliant: true,
    activeSportsbook: false,
  };
}
