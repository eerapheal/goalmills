'use client';

import { SportType } from '@goalmills/types';

export type ExtendedSportType = SportType | 'live';

interface SportTabsProps {
  selectedSport: ExtendedSportType;
  onSelectSport: (sport: ExtendedSportType) => void;
}

const sports: { type: ExtendedSportType; name: string; emoji: string; isComingSoon?: boolean }[] = [
  { type: 'live', name: 'Live Scores', emoji: '🔴' },
  { type: 'football', name: 'Football', emoji: '⚽' },
  { type: 'cricket', name: 'Cricket', emoji: '🏏' },
  { type: 'basketball', name: 'Basketball', emoji: '🏀' },
  { type: 'tennis', name: 'Tennis', emoji: '🎾', isComingSoon: true },
  { type: 'baseball', name: 'Baseball', emoji: '⚾', isComingSoon: true },
  { type: 'hockey', name: 'Hockey', emoji: '🏒', isComingSoon: true },
];

export function SportTabs({ selectedSport, onSelectSport }: SportTabsProps) {
  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-1.5 overflow-x-auto scrollbar-hide">
      <div className="flex items-center gap-1.5 py-0.5">
        {sports.map((sport) => {
          const isSelected = selectedSport === sport.type;
          return (
            <button
              key={sport.type}
              onClick={() => onSelectSport(sport.type)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-150 whitespace-nowrap
                ${
                  isSelected
                    ? 'bg-blue-600/20 text-blue-400 border-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.25)]'
                    : 'bg-[#121E2E]/80 border-white/10 text-slate-300 hover:text-white hover:border-blue-500/30 hover:bg-[#16263A]'
                }
                active:scale-95
              `}
            >
              <span className="text-xs">{sport.emoji}</span>
              <span>{sport.name}</span>
              {sport.isComingSoon && (
                <span className="text-[8px] uppercase font-black px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
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

