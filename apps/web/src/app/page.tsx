'use client';

import { useState } from 'react';
import { SportType } from '@goalmills/types';
import { SportTabs, ExtendedSportType } from '../components/SportTabs';
import { GoalmillsLiveDashboard } from '../components/GoalmillsLiveDashboard';
import { GoalmillsFootballDashboard } from '../components/GoalmillsFootballDashboard';
import { FootballScreen } from '../components/FootballScreen';
import { CricketScreen } from '../components/CricketScreen';
import { BasketballScreen } from '../components/BasketballScreen';
import { SportsPulseNewsSection } from '../components/SportsPulseNewsSection';
import { NewsletterSubscriptionSection } from '../components/NewsletterSubscriptionSection';
import { SponsoredBannersGrid } from '../components/SponsoredBannersGrid';

import { LiveNewsFlashTicker } from '../components/LiveNewsFlashTicker';

export default function HomePage() {
  const [selectedSport, setSelectedSport] = useState<ExtendedSportType>('live');

  const renderSportContent = () => {
    switch (selectedSport) {
      case 'live':
        return <GoalmillsLiveDashboard onSelectTab={(tab) => setSelectedSport(tab as ExtendedSportType)} />;

      case 'football':
        return <GoalmillsFootballDashboard />;

      case 'cricket':
        return <CricketScreen />;

      case 'basketball':
        return <BasketballScreen />;

      case 'tennis':
      case 'baseball':
      case 'hockey':
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-12 my-8">
            <span className="text-8xl mb-4">
              {selectedSport === 'tennis' && '🎾'}
              {selectedSport === 'baseball' && '⚾'}
              {selectedSport === 'hockey' && '🏒'}
            </span>
            <h2 className="text-3xl font-extrabold text-white mb-2 capitalize">{selectedSport}</h2>
            <div className="inline-block px-4 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-sm tracking-wider uppercase mb-4">
              Coming Soon
            </div>
            <p className="text-gray-400 text-center max-w-md text-base">
              We&apos;re working hard to bring you real-time {selectedSport} scores, fixtures, and statistics.
            </p>
          </div>
        );

      default:
        return <GoalmillsLiveDashboard onSelectTab={(tab) => setSelectedSport(tab as ExtendedSportType)} />;
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#080E18] pt-[80px] sm:pt-[86px] flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Dynamic Live News Flash Ticker */}
      <div className="max-w-[1400px] mx-auto w-full px-3 sm:px-6 pt-2">
        <LiveNewsFlashTicker
          sport={selectedSport === 'live' ? undefined : selectedSport}
          badgeText={
            selectedSport === 'football'
              ? 'FOOTBALL WIRE'
              : selectedSport === 'cricket'
                ? 'CRICKET WIRE'
                : selectedSport === 'basketball'
                  ? 'HOOPS WIRE'
                  : 'LIVE WIRE'
          }
        />
      </div>

      {/* Featured VIP Sponsor Hero Banner Grid (3 Desktop, 2 Tablet, 1 Mobile) */}
      <div className="max-w-[1400px] mx-auto w-full px-3 sm:px-6 pt-3 min-h-[200px]">
        <SponsoredBannersGrid
          sport={selectedSport === 'live' ? 'all' : selectedSport}
        />
      </div>

      {/* Sport Category Tabs */}
      <SportTabs selectedSport={selectedSport} onSelectSport={setSelectedSport} />

      {/* Sport Content / Live Dashboard */}
      <div className="flex-1 min-h-[600px]">{renderSportContent()}</div>

      {/* Section 3: GoalMills Sports Intelligence Newsletter Subscription */}
      <NewsletterSubscriptionSection />
    </div>
  );
}
