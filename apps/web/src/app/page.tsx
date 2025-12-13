'use client';

import { useState } from 'react';
import { SportType } from '@goalmills/types';
import { SportTabs } from '../components/SportTabs';
import { FootballScreen } from '../components/FootballScreen';

export default function HomePage() {
    const [selectedSport, setSelectedSport] = useState<SportType>('football');

    const renderSportContent = () => {
        switch (selectedSport) {
            case 'football':
                return <FootballScreen />;

            case 'cricket':
            case 'tennis':
            case 'basketball':
            case 'baseball':
            case 'hockey':
                return (
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                        <span className="text-8xl mb-4">
                            {selectedSport === 'cricket' && '🏏'}
                            {selectedSport === 'tennis' && '🎾'}
                            {selectedSport === 'basketball' && '🏀'}
                            {selectedSport === 'baseball' && '⚾'}
                            {selectedSport === 'hockey' && '🏒'}
                        </span>
                        <h2 className="text-2xl font-extrabold text-white mb-2 capitalize">
                            {selectedSport}
                        </h2>
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
        <div className="min-h-screen bg-[#0a0e27] flex flex-col">
            {/* App Header */}
            <div className="px-4 pt-8 pb-4 bg-[#001f3f]/90 border-b-4 border-[#ffd700]">
                <h1 className="text-3xl font-black text-white mb-1 tracking-wide">⚡ GoalMills</h1>
                <p className="text-sm text-gray-300 font-semibold">Your Ultimate Sports Platform</p>
            </div>

            {/* Sport Category Tabs */}
            <SportTabs selectedSport={selectedSport} onSelectSport={setSelectedSport} />

            {/* Sport Content */}
            <div className="flex-1 overflow-hidden">
                {renderSportContent()}
            </div>
        </div>
    );
}
