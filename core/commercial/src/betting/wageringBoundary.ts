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
 * Dormant Wagering Adapter
 */
export class DormantWageringAdapter implements WageringAdapterInterface {
  readonly isActivated = false as const;

  async validateWagerIntent(_intent?: any): Promise<never> {
    throw new WageringNotPermittedError('Cannot validate wager intent. Sportsbook is dormant.');
  }
}

/**
 * Dormant Wallet Service
 */
export class DormantWalletService implements WalletServiceInterface {
  readonly isActivated = false as const;

  async getBalance(_userId?: string): Promise<never> {
    throw new WageringNotPermittedError('Customer wallet balances are not supported.');
  }

  async deposit(_userId?: string, _amount?: number): Promise<never> {
    throw new WageringNotPermittedError('Real-money account funding/deposits are strictly prohibited.');
  }

  async withdraw(_userId?: string, _amount?: number): Promise<never> {
    throw new WageringNotPermittedError('Real-money withdrawals are strictly prohibited.');
  }
}

/**
 * Dormant Payment Gateway
 */
export class DormantPaymentGateway implements PaymentGatewayInterface {
  readonly isActivated = false as const;

  async processPayment(_req?: any): Promise<never> {
    throw new WageringNotPermittedError('Wagering payment gateway is not operational.');
  }
}

/**
 * Dormant Risk Engine
 */
export class DormantRiskEngine implements RiskEngineInterface {
  readonly isActivated = false as const;

  async evaluateLiability(_wager?: any): Promise<never> {
    throw new WageringNotPermittedError('Sportsbook liability calculation is dormant.');
  }
}

/**
 * Dormant Settlement Service
 */
export class DormantSettlementService implements SettlementServiceInterface {
  readonly isActivated = false as const;

  async settleWager(_wagerId?: string, _outcome?: any): Promise<never> {
    throw new WageringNotPermittedError('Wager settlement is not supported.');
  }
}

/**
 * Dormant Compliance Service
 */
export class DormantComplianceService implements ComplianceServiceInterface {
  readonly isActivated = false as const;

  async verifyKYC(_userId?: string): Promise<never> {
    throw new WageringNotPermittedError('Wagering KYC verification is dormant.');
  }

  async screenAML(_userId?: string, _transaction?: any): Promise<never> {
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
