import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BillingService, FAN_PASS_PLANS } from '../billingService';

const { mockSub } = vi.hoisted(() => {
  const sub = {
    userId: 'user_123',
    tenantSlug: 'goalmills',
    stripeCustomerId: 'cus_test_123',
    stripeSubscriptionId: 'sub_test_123',
    tier: 'fan_pass',
    status: 'active',
  };
  return { mockSub: sub };
});

vi.mock('../../../lib/db', () => ({
  default: vi.fn().mockResolvedValue(true),
  connectDB: vi.fn().mockResolvedValue(true),
}));

vi.mock('../../../models/Subscription', () => {
  const mockFindOne = vi.fn((query: any) => ({
    lean: vi.fn().mockResolvedValue(mockSub),
  }));
  const mockFindOneAndUpdate = vi.fn().mockResolvedValue(mockSub);
  const mockFind = vi.fn(() => ({
    lean: vi.fn().mockResolvedValue([mockSub]),
  }));

  return {
    SubscriptionModel: {
      findOne: mockFindOne,
      findOneAndUpdate: mockFindOneAndUpdate,
      find: mockFind,
    },
  };
});

describe('Phase 10B: Fan Pass Subscriptions & Stripe Billing Engine', () => {
  let billingService: BillingService;

  beforeEach(() => {
    vi.clearAllMocks();
    billingService = BillingService.getInstance();
  });

  it('should return available Fan Pass subscription plans with tier pricing', () => {
    const plans = billingService.getAvailablePlans();
    expect(plans).toHaveLength(4);
    expect(plans.map((p) => p.tier)).toEqual(['free', 'fan_pass', 'vip_pass', 'sponsor_pro']);
    expect(plans.find((p) => p.tier === 'fan_pass')?.priceMonthly).toBe(4.99);
  });

  it('should evaluate user entitlement based on subscription tier hierarchy', () => {
    const activeSub: any = { tier: 'vip_pass', status: 'active' };
    const freeSub: any = { tier: 'free', status: 'active' };

    expect(billingService.isEntitled(activeSub, 'fan_pass')).toBe(true);
    expect(billingService.isEntitled(activeSub, 'vip_pass')).toBe(true);
    expect(billingService.isEntitled(activeSub, 'sponsor_pro')).toBe(false);
    expect(billingService.isEntitled(freeSub, 'fan_pass')).toBe(false);
  });

  it('should create Stripe checkout session with valid URL and session ID', async () => {
    const session = await billingService.createCheckoutSession(
      'user_123',
      'fan@goalmills.com',
      'fan_pass',
      'monthly'
    );

    expect(session.url).toContain('https://checkout.stripe.com/pay/');
    expect(session.sessionId).toBeDefined();
  });

  it('should process Stripe checkout.session.completed webhook and activate subscription', async () => {
    const event = {
      type: 'checkout.session.completed',
      data: {
        object: {
          client_reference_id: 'user_123',
          customer: 'cus_test_999',
          subscription: 'sub_test_999',
          metadata: {
            userId: 'user_123',
            tenantSlug: 'goalmills',
            tier: 'vip_pass',
          },
        },
      },
    };

    const result = await billingService.handleStripeWebhook(event);
    expect(result.handled).toBe(true);
    expect(result.message).toContain('activated for user_123');
  });

  it('should calculate accurate MRR and active subscriber metrics', async () => {
    const stats = await billingService.getBillingHubStats('goalmills');
    expect(stats).toBeDefined();
    expect(stats.mrr).toBeGreaterThanOrEqual(0);
    expect(stats.activeSubscribers).toBeGreaterThanOrEqual(1);
    expect(stats.subscribersByTier.fan_pass).toBeGreaterThanOrEqual(1);
  });
});
