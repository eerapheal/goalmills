'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CommercialPlacementType } from '@goalmills/types';

interface CommercialPlacementSlotProps {
  placement: CommercialPlacementType;
  sport?: string;
  country?: string;
  className?: string;
}

export const CommercialPlacementSlot: React.FC<CommercialPlacementSlotProps> = ({
  placement,
  sport = 'football',
  country = 'GLOBAL',
  className = '',
}) => {
  const [placementData, setPlacementData] = useState<{
    bookmakerId: string;
    displayName: string;
    badgeText: string;
    ctaText: string;
  } | null>(null);

  useEffect(() => {
    // Dynamic client-side resolution of active commercial campaign
    const mockBookmakerMap: Record<string, string> = {
      bet365: 'bet365',
      '1xbet': '1xBet',
      betfair: 'Betfair',
      betano: 'Betano',
      williamhill: 'William Hill',
    };

    // Default commercial partner for slot
    setPlacementData({
      bookmakerId: 'bet365',
      displayName: mockBookmakerMap['bet365'] || 'bet365',
      badgeText: 'OFFICIAL PARTNER',
      ctaText: 'Claim Welcome Bonus',
    });
  }, [placement, country]);

  if (!placementData) return null;

  return (
    <div
      className={`p-4 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-950/20 via-zinc-900 to-zinc-900 shadow-md ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
            {placementData.badgeText}
          </span>
          <div>
            <h4 className="text-sm font-semibold text-zinc-100">
              {placementData.displayName} Special Boosted Odds
            </h4>
            <p className="text-xs text-zinc-400">
              Enhanced markets & acca boosts for top {sport} fixtures
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href={`/api/affiliate/redirect/${placementData.bookmakerId}?placement=${placement}&sport=${sport}`}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="w-full sm:w-auto text-center px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition-colors rounded-lg shadow"
          >
            {placementData.ctaText} →
          </Link>
        </div>
      </div>
      <div className="mt-2 text-[10px] text-zinc-500 flex items-center justify-between border-t border-zinc-800/60 pt-1.5">
        <span>18+ Only. Terms & conditions apply. GambleAware.org</span>
        <span>GoalMills Commercial Partner</span>
      </div>
    </div>
  );
};

export default CommercialPlacementSlot;
