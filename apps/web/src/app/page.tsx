'use client';

import { useState } from 'react';
import { SportType } from '@goalmills/types';
import { SportTabs, ExtendedSportType } from '../components/SportTabs';
import { GoalmillsLiveDashboard } from '../components/GoalmillsLiveDashboard';
import { FootballScreen } from '../components/FootballScreen';
import { CricketScreen } from '../components/CricketScreen';
import { BasketballScreen } from '../components/BasketballScreen';
import { SportsPulseNewsSection } from '../components/SportsPulseNewsSection';
import { NewsletterSubscriptionSection } from '../components/NewsletterSubscriptionSection';
import { SponsoredBannerCard } from '../components/SponsoredBannerCard';

export default function HomePage() {
  const [selectedSport, setSelectedSport] = useState<ExtendedSportType>('live');

  const renderSportContent = () => {
    switch (selectedSport) {
      case 'live':
        return <GoalmillsLiveDashboard onSelectTab={(tab) => setSelectedSport(tab as ExtendedSportType)} />;

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
              We&apos;re working hard to bring you real-time {selectedSport} scores, fixtures, and statistics.
            </p>
          </div>
        );

      default:
        return <GoalmillsLiveDashboard onSelectTab={(tab) => setSelectedSport(tab as ExtendedSportType)} />;
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#080E18] pt-[80px] sm:pt-[86px] flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Platform Title Marquee */}
      <div className="w-full max-w-full px-3 py-1.5 bg-[#0A1422] border-b border-emerald-500/20 overflow-hidden whitespace-nowrap">
        <div className="w-full overflow-hidden">
          <p className="text-xs text-slate-300 font-medium animate-marquee inline-block">
            ⚡ GoalMills Sports Intelligence Platform • Real-time livescores, high-precision analytics, video recaps, and deep sports coverage • Engineered by Ekpenisi Erue Raphael
          </p>
        </div>
      </div>

      {/* Featured VIP Sponsor Hero Banner */}
      <div className="max-w-[1400px] mx-auto w-full px-3 sm:px-6 pt-3">
        <SponsoredBannerCard
          placement="homepage_hero"
          sport={selectedSport === 'live' ? 'all' : selectedSport}
        />
      </div>

      {/* Sport Category Tabs */}
      <SportTabs selectedSport={selectedSport} onSelectSport={setSelectedSport} />

      {/* Sport Content / Live Dashboard */}
      <div className="flex-1">{renderSportContent()}</div>

      {/* Section 2: Trending Sports Pulse, Video Highlights & VIP Alerts */}
      <SportsPulseNewsSection />

      {/* Section 3: GoalMills Sports Intelligence Newsletter Subscription */}
      <NewsletterSubscriptionSection />
    </div>
  );
}
