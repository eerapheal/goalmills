/**
 * Wagering Boundary Shim
 * Re-exports canonical wagering boundary and compliance guards from @goalmills/core-commercial.
 */

export {
  WageringNotPermittedError,
  DormantWageringAdapter,
  DormantWalletService,
  DormantPaymentGateway,
  DormantRiskEngine,
  DormantSettlementService,
  DormantComplianceService,
  assertWageringDeactivated,
} from '@goalmills/core-commercial';
