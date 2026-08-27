'use client';

import { useState } from 'react';
import { SportType } from '@goalmills/types';
import { SportTabs } from '../components/SportTabs';
import { FootballScreen } from '../components/FootballScreen';
import { CricketScreen } from '../components/CricketScreen';
import { TennisScreen } from '../components/TennisScreen';
import { BasketballScreen } from '../components/BasketballScreen';
import { SportsIntelligenceSection } from '../components/SportsIntelligenceSection';
import { SportsPulseNewsSection } from '../components/SportsPulseNewsSection';

export default function HomePage() {
  const [selectedSport, setSelectedSport] = useState<SportType>('football');

  const renderSportContent = () => {
    switch (selectedSport) {
      case 'football':
        return <FootballScreen />;

      case 'cricket':
        return <CricketScreen />;

      case 'tennis':
        return <TennisScreen />;

      case 'basketball':
        return <BasketballScreen />;

      case 'baseball':
      case 'hockey':
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <span className="text-8xl mb-4">
              {selectedSport === 'baseball' && '⚾'}
              {selectedSport === 'hockey' && '🏒'}
            </span>
            <h2 className="text-2xl font-extrabold text-white mb-2 capitalize">{selectedSport}</h2>
            <p className="text-xl font-bold text-[#ffd700] mb-4">Coming Soon!</p>
            <p className="text-gray-400 text-center max-w-md">
              We're working hard to bring you the best {selectedSport} experience.
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

      {/* Section 1: Sports Intelligence & Pro Analytics Suite */}
      <SportsIntelligenceSection />

      {/* Section 2: Trending Sports Pulse, Video Highlights & VIP Alerts */}
      <SportsPulseNewsSection />
    </div>
  );
}
