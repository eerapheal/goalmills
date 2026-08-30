'use client';

import React from 'react';
import { SponsoredBannerCard } from './SponsoredBannerCard';
import { SportType } from '@goalmills/types';

interface SponsoredBannersGridProps {
  sport?: SportType | 'all';
  className?: string;
}

export function SponsoredBannersGrid({
  sport = 'all',
  className = '',
}: SponsoredBannersGridProps) {
  return (
    <div className={`w-full ${className}`}>
      {/* 
        Responsive Layout Rules:
        - Desktop (lg & up): 3 columns (3 banners rendered)
        - Tablet (md to lg): 2 columns (2 banners visible, 3rd hidden)
        - Mobile (base): 1 column (1 banner visible, 2nd & 3rd hidden)
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4.5">
        {/* Banner 1: Always visible on Mobile, Tablet & Desktop (Filter Logic: Homepage Hero & VIP Offers) */}
        <div className="w-full flex">
          <SponsoredBannerCard
            placement="homepage_hero"
            sport={sport}
            category="vip"
            campaignOffset={0}
            accentBadge="VIP MATCHDAY"
            className="w-full"
          />
        </div>

        {/* Banner 2: Visible on Tablet & Desktop (Filter Logic: Sports Pulse & Official Partner Gear) */}
        <div className="hidden md:flex w-full">
          <SponsoredBannerCard
            placement="sports_pulse"
            sport={sport}
            category="gear"
            campaignOffset={1}
            accentBadge="OFFICIAL PARTNER"
            className="w-full"
          />
        </div>

        {/* Banner 3: Visible on Desktop Only (Filter Logic: Match Details, Tournaments & Fantasy Special) */}
        <div className="hidden lg:flex w-full">
          <SponsoredBannerCard
            placement="match_details"
            sport="all"
            category="fantasy"
            campaignOffset={2}
            accentBadge="TOURNAMENT SPECIAL"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

export default SponsoredBannersGrid;
