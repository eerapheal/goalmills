'use client';

import React from 'react';
import {
  FiGlobe,
  FiAward,
  FiStar,
  FiFilter,
  FiCheck,
  FiX,
  FiUsers,
  FiZap,
} from 'react-icons/fi';
import { ConfederationCode, CompetitionGender } from '@goalmills/types';

export type MainCategoryTab =
  | 'all'
  | 'CAF'
  | 'top5'
  | 'UEFA'
  | 'FIFA'
  | 'CONMEBOL'
  | 'CONCACAF'
  | 'AFC'
  | 'OFC';

export interface FootballNavSwitcherProps {
  selectedCategory: MainCategoryTab;
  onCategoryChange: (category: MainCategoryTab) => void;
  selectedCountry: string | null;
  onCountryChange: (countryCode: string | null) => void;
  selectedGender: CompetitionGender | 'all';
  onGenderChange: (gender: CompetitionGender | 'all') => void;
  selectedAgeCategory: 'senior' | 'youth' | 'all';
  onAgeCategoryChange: (age: 'senior' | 'youth' | 'all') => void;
  onResetFilters?: () => void;
}

const CONFED_TABS: { id: MainCategoryTab; label: string; icon: string; badge?: string }[] = [
  { id: 'all', label: 'All Football', icon: '🌐' },
  { id: 'CAF', label: 'Africa (CAF)', icon: '🌍', badge: 'Premier' },
  { id: 'top5', label: 'Top 5 Europe', icon: '⭐' },
  { id: 'UEFA', label: 'Europe (UEFA)', icon: '🏆' },
  { id: 'FIFA', label: 'FIFA (Global)', icon: '🌐' },
  { id: 'CONMEBOL', label: 'South America', icon: '🌎' },
  { id: 'CONCACAF', label: 'North America', icon: '🌎' },
  { id: 'AFC', label: 'Asia (AFC)', icon: '🌏' },
  { id: 'OFC', label: 'Oceania (OFC)', icon: '🌊' },
];

const TOP5_COUNTRIES = [
  { code: 'GB-ENG', name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
];

const AFRICA_PRIORITY_COUNTRIES = [
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
  { code: 'CD', name: 'DR Congo', flag: '🇨🇩' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
  { code: 'SD', name: 'Sudan', flag: '🇸🇩' },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲' },
  { code: 'CI', name: 'Ivory Coast', flag: '🇨🇮' },
];

export function FootballNavSwitcher({
  selectedCategory,
  onCategoryChange,
  selectedCountry,
  onCountryChange,
  selectedGender,
  onGenderChange,
  selectedAgeCategory,
  onAgeCategoryChange,
  onResetFilters,
}: FootballNavSwitcherProps) {
  // Determine which country pills to display based on selected category
  const countryPills =
    selectedCategory === 'top5' || selectedCategory === 'UEFA'
      ? TOP5_COUNTRIES
      : selectedCategory === 'CAF'
        ? AFRICA_PRIORITY_COUNTRIES
        : [...TOP5_COUNTRIES.slice(0, 3), ...AFRICA_PRIORITY_COUNTRIES.slice(0, 3)];

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedCountry !== null ||
    selectedGender !== 'all' ||
    selectedAgeCategory !== 'all';

  return (
    <div className="w-full space-y-3 rounded-2xl border border-blue-500/20 bg-[#061022]/95 p-3.5 sm:p-4 shadow-xl backdrop-blur-md">
      {/* ─── Level 1: Confederation & Global Hub Bar ────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {CONFED_TABS.map((tab) => {
            const isActive = selectedCategory === tab.id;
            const isAfrica = tab.id === 'CAF';

            return (
              <button
                key={tab.id}
                onClick={() => {
                  onCategoryChange(tab.id);
                  onCountryChange(null);
                }}
                className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  isActive
                    ? isAfrica
                      ? 'bg-gradient-to-r from-emerald-600 to-amber-600 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : isAfrica
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/50'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && !isActive && (
                  <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-black uppercase text-amber-300">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {hasActiveFilters && onResetFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 whitespace-nowrap rounded-lg bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <FiX className="text-xs" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* ─── Level 2: Contextual Country Pills & Classification Bar ────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        {/* Country Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto py-0.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 pl-1">
            Nation:
          </span>
          <button
            onClick={() => onCountryChange(null)}
            className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              selectedCountry === null
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            All Nations
          </button>

          {countryPills.map((c) => {
            const isSelected = selectedCountry === c.code;
            return (
              <button
                key={c.code}
                onClick={() => onCountryChange(isSelected ? null : c.code)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{c.flag}</span>
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>

        {/* Gender & Age Isolators (Prevent cross-category contamination) */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
          {/* Gender */}
          <div className="flex items-center rounded-lg bg-[#040A14] p-0.5 border border-white/5">
            <button
              onClick={() => onGenderChange('all')}
              className={`rounded-md px-2 py-0.5 text-[11px] font-bold transition-all ${
                selectedGender === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onGenderChange('MALE')}
              className={`rounded-md px-2 py-0.5 text-[11px] font-bold transition-all ${
                selectedGender === 'MALE' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Men's
            </button>
            <button
              onClick={() => onGenderChange('FEMALE')}
              className={`rounded-md px-2 py-0.5 text-[11px] font-bold transition-all ${
                selectedGender === 'FEMALE' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Women's
            </button>
          </div>

          {/* Age Group */}
          <div className="flex items-center rounded-lg bg-[#040A14] p-0.5 border border-white/5">
            <button
              onClick={() => onAgeCategoryChange('all')}
              className={`rounded-md px-2 py-0.5 text-[11px] font-bold transition-all ${
                selectedAgeCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Ages
            </button>
            <button
              onClick={() => onAgeCategoryChange('senior')}
              className={`rounded-md px-2 py-0.5 text-[11px] font-bold transition-all ${
                selectedAgeCategory === 'senior'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Senior
            </button>
            <button
              onClick={() => onAgeCategoryChange('youth')}
              className={`rounded-md px-2 py-0.5 text-[11px] font-bold transition-all ${
                selectedAgeCategory === 'youth'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Youth
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
