'use client';

import { SportType } from '@goalmills/types';

interface SportTabsProps {
  selectedSport: SportType;
  onSelectSport: (sport: SportType) => void;
}

const sports: { type: SportType; name: string; emoji: string }[] = [
  { type: 'football', name: 'Football', emoji: '⚽' },
  { type: 'cricket', name: 'Cricket', emoji: '🏏' },
  { type: 'tennis', name: 'Tennis', emoji: '🎾' },
  { type: 'basketball', name: 'Basketball', emoji: '🏀' },
  { type: 'baseball', name: 'Baseball', emoji: '⚾' },
  { type: 'hockey', name: 'Hockey', emoji: '🏒' },
];

export function SportTabs({ selectedSport, onSelectSport }: SportTabsProps) {
  return (
    <div className="overflow-x-auto scrollbar-hide py-2">
      <div className="flex gap-3 px-4 py-2">
        {sports.map((sport) => (
          <button
            key={sport.type}
            onClick={() => onSelectSport(sport.type)}
            className={`
                            flex items-center gap-2.5 px-5 py-3 rounded-2xl border transition-all duration-300 whitespace-nowrap group
                            ${
                              selectedSport === sport.type
                                ? 'bg-primary text-white border-primary-light shadow-[0_0_15px_rgba(59,130,246,0.3)] scale-105'
                                : 'glass-card text-text-secondary hover:text-white hover:border-white/20 hover:bg-surfaceHighlight/50'
                            }
                            active:scale-95
                        `}
          >
            <span className="text-xl group-hover:scale-110 transition-transform duration-300">
              {sport.emoji}
            </span>
            <span className="text-sm font-bold tracking-wide">{sport.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
