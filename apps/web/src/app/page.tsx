'use client';

import { useState } from 'react';
import { SportType } from '@goalmills/types';
import { SportTabs } from '../components/SportTabs';
import { FootballScreen } from '../components/FootballScreen';
import { CricketScreen } from '../components/CricketScreen';
import { BasketballScreen } from '../components/BasketballScreen';
import { SportsPulseNewsSection } from '../components/SportsPulseNewsSection';
import { NewsletterSubscriptionSection } from '../components/NewsletterSubscriptionSection';

export default function HomePage() {
  const [selectedSport, setSelectedSport] = useState<SportType>('football');

  const renderSportContent = () => {
    switch (selectedSport) {
      case 'football':
        return <FootballScreen />;

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
              We're working hard to bring you real-time {selectedSport} scores, fixtures, and statistics.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] pt-[90px] flex flex-col">
      {/* App Header */}
      <div className="px-4 pt-2 pb-4 bg-[#001f3f]/90 border-b-4 border-[#ffd700] overflow-hidden whitespace-nowrap">
        <p className="text-sm text-gray-300 font-semibold animate-marquee inline-block">
          Your Ultimate Sports Platform brought to you by Ekpenisi Erue Raphael
        </p>
      </div>

      {/* Sport Category Tabs */}
      <SportTabs selectedSport={selectedSport} onSelectSport={setSelectedSport} />

      {/* Sport Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">{renderSportContent()}</div>

      {/* Section 2: Trending Sports Pulse, Video Highlights & VIP Alerts */}
      <SportsPulseNewsSection />

      {/* Section 3: GoalMills Sports Intelligence Newsletter Subscription */}
      <NewsletterSubscriptionSection />
    </div>
  );
}
