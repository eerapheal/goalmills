'use client';

import React, { useState } from 'react';
import { FiCheck, FiStar, FiZap, FiShield, FiX, FiAward } from 'react-icons/fi';
import type { SubscriptionPlan, SubscriptionTier } from '@goalmills/types';
import { FAN_PASS_PLANS } from '../../lib/billing/billingService';

interface FanPassPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: SubscriptionTier;
}

export const FanPassPricingModal: React.FC<FanPassPricingModalProps> = ({
  isOpen,
  onClose,
  currentTier = 'free',
}) => {
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSelectPlan(tier: SubscriptionTier) {
    if (tier === 'free') return;

    setLoadingTier(tier);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, interval }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoadingTier(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl rounded-3xl bg-slate-950 border border-white/10 p-6 sm:p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition"
        >
          <FiX size={20} />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <FiAward />
            <span>GoalMills Fan Pass & VIP Stadium</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Unlock Ad-Free Sports & Match Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Enjoy full HD highlights, historical head-to-head exports, and zero interruptions.
          </p>

          {/* Billing Interval Toggle */}
          <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-white/10 mt-4">
            <button
              onClick={() => setInterval('monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                interval === 'monthly'
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setInterval('yearly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                interval === 'yearly'
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Yearly Billing</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500 text-black font-extrabold">
                SAVE 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FAN_PASS_PLANS.filter((p) => p.tier !== 'sponsor_pro').map((plan) => {
            const isCurrent = currentTier === plan.tier;
            const price =
              interval === 'monthly' ? plan.priceMonthly : Math.round(plan.priceYearly / 12 * 100) / 100;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 flex flex-col justify-between transition border ${
                  plan.isPopular
                    ? 'bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-950 border-amber-500/40 shadow-xl shadow-amber-500/10'
                    : 'bg-slate-900/60 border-white/10'
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black shadow">
                    Most Popular
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-white">
                      ${price}
                    </span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>

                  <ul className="space-y-2.5 pt-4 border-t border-white/10 text-xs text-slate-300">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <FiCheck className="text-amber-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-4">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-slate-800 border border-white/10 text-slate-400 text-xs font-bold cursor-default"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectPlan(plan.tier)}
                      disabled={loadingTier === plan.tier}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                        plan.isPopular
                          ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20'
                          : 'bg-white hover:bg-slate-200 text-black'
                      }`}
                    >
                      <span>
                        {loadingTier === plan.tier
                          ? 'Redirecting to Checkout...'
                          : plan.tier === 'free'
                          ? 'Get Started'
                          : `Upgrade to ${plan.name}`}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FanPassPricingModal;
