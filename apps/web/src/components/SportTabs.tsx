'use client';

import { SportType } from '@goalmills/types';
import { FiRadio } from 'react-icons/fi';

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
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2 overflow-x-auto scrollbar-hide">
      <div className="flex items-center gap-2.5 py-1">
        {sports.map((sport) => {
          const isSelected = selectedSport === sport.type;
          return (
            <button
              key={sport.type}
              onClick={() => onSelectSport(sport.type)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 whitespace-nowrap
                ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.25)] scale-[1.02]'
                    : 'bg-[#121E2E]/80 border-white/10 text-slate-300 hover:text-white hover:border-emerald-500/30 hover:bg-[#16263A]'
                }
                active:scale-95
              `}
            >
              <span>{sport.emoji}</span>
              <span>{sport.name}</span>
              {sport.isComingSoon && (
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
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
