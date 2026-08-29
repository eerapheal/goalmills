'use client';

import { SportType } from '@goalmills/types';

interface SportTabsProps {
  selectedSport: SportType;
  onSelectSport: (sport: SportType) => void;
}

const sports: { type: SportType; name: string; emoji: string; isComingSoon?: boolean }[] = [
  { type: 'football', name: 'Football', emoji: '⚽' },
  { type: 'cricket', name: 'Cricket', emoji: '🏏' },
  { type: 'basketball', name: 'Basketball', emoji: '🏀' },
  { type: 'tennis', name: 'Tennis', emoji: '🎾', isComingSoon: true },
  { type: 'baseball', name: 'Baseball', emoji: '⚾', isComingSoon: true },
  { type: 'hockey', name: 'Hockey', emoji: '🏒', isComingSoon: true },
];

export function SportTabs({ selectedSport, onSelectSport }: SportTabsProps) {
  return (
    <div className="overflow-x-auto scrollbar-hide py-2">
      <div className="flex gap-3 px-4 py-2">
        {sports.map((sport) => {
          const isSelected = selectedSport === sport.type;
          return (
            <button
              key={sport.type}
              onClick={() => onSelectSport(sport.type)}
              className={`
                flex items-center gap-2.5 px-5 py-3 rounded-2xl border transition-all duration-300 whitespace-nowrap group
                ${
                  isSelected
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
              {sport.isComingSoon && (
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
