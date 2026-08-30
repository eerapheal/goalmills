'use client';

import React, { useState } from 'react';
import { FiLock, FiStar, FiZap } from 'react-icons/fi';
import type { SubscriptionTier } from '@goalmills/types';
import FanPassPricingModal from './FanPassPricingModal';

interface PremiumGateProps {
  children: React.ReactNode;
  userTier?: SubscriptionTier;
  requiredTier?: SubscriptionTier;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export const PremiumGate: React.FC<PremiumGateProps> = ({
  children,
  userTier = 'free',
  requiredTier = 'fan_pass',
  fallbackTitle = 'VIP Fan Pass Feature',
  fallbackDescription = 'Unlock ad-free sports coverage, deep historical warehouse intelligence, and exclusive video highlights.',
}) => {
  const [showModal, setShowModal] = useState(false);

  const tierHierarchy: Record<SubscriptionTier, number> = {
    free: 0,
    fan_pass: 1,
    vip_pass: 2,
    sponsor_pro: 3,
  };

  const isUnlocked = tierHierarchy[userTier] >= tierHierarchy[requiredTier];

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-950 p-6 sm:p-8 text-center space-y-4">
      <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
        <FiLock size={24} />
      </div>

      <div className="max-w-md mx-auto space-y-1.5">
        <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
          {fallbackTitle}
        </h4>
        <p className="text-xs sm:text-sm text-slate-400">{fallbackDescription}</p>
      </div>

      <div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider transition shadow-lg shadow-amber-500/20 inline-flex items-center gap-2"
        >
          <FiStar />
          <span>Upgrade to {requiredTier.replace('_', ' ').toUpperCase()}</span>
        </button>
      </div>

      <FanPassPricingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        currentTier={userTier}
      />
    </div>
  );
};

export default PremiumGate;
