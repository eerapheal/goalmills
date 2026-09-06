'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  FiAward,
  FiSearch,
  FiChevronDown,
  FiX,
  FiArrowRight,
  FiFilter,
  FiCheck,
  FiGlobe,
} from 'react-icons/fi';
import {
  ALL_COMPETITIONS,
  COMPETITION_CATEGORY_LABELS,
  CompetitionCategory,
  CompetitionEntry,
} from '@/lib/competitionCategories';
import { CompetitionLogo } from './CompetitionLogo';

interface AllMajorCompetitionsSectionProps {
  initialCategory?: CompetitionCategory | 'all';
}

export function AllMajorCompetitionsSection({
  initialCategory = 'all',
}: AllMajorCompetitionsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<CompetitionCategory | 'all'>(
    initialCategory
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: ALL_COMPETITIONS.length };
    for (const comp of ALL_COMPETITIONS) {
      counts[comp.category] = (counts[comp.category] || 0) + 1;
    }
    return counts;
  }, []);

  // Filtered competitions based on category and search query
  const filteredCompetitions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return ALL_COMPETITIONS.filter((comp) => {
      const matchesCategory =
        selectedCategory === 'all' || comp.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!query) return true;
      return (
        comp.name.toLowerCase().includes(query) ||
        comp.country.toLowerCase().includes(query) ||
        comp.slug.toLowerCase().includes(query)
      );
    });
  }, [selectedCategory, searchQuery]);

  // Grouped competitions for "all" mode when no search query
  const groupedCompetitions = useMemo(() => {
    if (selectedCategory !== 'all' || searchQuery.trim() !== '') {
      return null;
    }

    const order = Object.entries(COMPETITION_CATEGORY_LABELS).sort(
      ([, a], [, b]) => a.order - b.order
    );

    return order
      .map(([catKey, meta]) => {
        const comps = ALL_COMPETITIONS.filter((c) => c.category === catKey).sort(
          (a, b) => a.tier - b.tier || a.name.localeCompare(b.name)
        );
        return {
          category: catKey as CompetitionCategory,
          label: meta.label,
          icon: meta.icon,
          competitions: comps,
        };
      })
      .filter((g) => g.competitions.length > 0);
  }, [selectedCategory, searchQuery]);

  // Quick jump pill items
  const quickFilters: { key: CompetitionCategory | 'all'; label: string; icon: string }[] = [
    { key: 'all', label: 'All Leagues', icon: '🌐' },
    { key: 'european-top5', label: 'Top 5 Europe', icon: '⭐' },
    { key: 'european-club', label: 'European Cups', icon: '🏆' },
    { key: 'caf', label: 'Africa (CAF)', icon: '🌍' },
    { key: 'fifa', label: 'FIFA Tournaments', icon: '🌐' },
    { key: 'domestic-cups', label: 'Domestic Cups', icon: '🥇' },
    { key: 'conmebol', label: 'South America', icon: '🌎' },
    { key: 'other-leagues', label: 'Global Leagues', icon: '⚽' },
  ];

  const currentCategoryLabel =
    selectedCategory === 'all'
      ? 'All Competitions'
      : COMPETITION_CATEGORY_LABELS[selectedCategory]?.label || 'Select Category';

  const currentCategoryIcon =
    selectedCategory === 'all'
      ? '🌐'
      : COMPETITION_CATEGORY_LABELS[selectedCategory]?.icon || '🏆';

  return (
    <section className="pt-6 border-t border-white/10 space-y-6">
      {/* ─── SECTION HEADER & CONTROLS ─── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-blue-500/20 to-indigo-500/20 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/5">
              <FiAward className="text-amber-400 text-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                  All Major Competitions
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  {ALL_COMPETITIONS.length} Covered
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Official fixtures, live tables, confirmed lineups & tactical intel
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <FiSearch className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leagues, cups, countries..."
              className="w-full bg-[#081324] border border-white/10 hover:border-blue-500/30 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-white transition-colors"
                title="Clear search"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Dropdown & Quick Filters Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {/* Custom Animated Category Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0C1B33] to-[#0A162B] border border-blue-500/30 hover:border-blue-400 text-xs font-bold text-white shadow-lg transition-all"
            >
              <span className="text-sm">{currentCategoryIcon}</span>
              <span className="max-w-[180px] sm:max-w-[220px] truncate">{currentCategoryLabel}</span>
              <span className="text-[10px] font-mono text-blue-400 px-1.5 py-0.2 bg-blue-500/20 rounded-md">
                {categoryCounts[selectedCategory] || 0}
              </span>
              <FiChevronDown
                className={`w-3.5 h-3.5 text-blue-400 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 max-h-[380px] overflow-y-auto z-50 rounded-2xl bg-[#081427]/98 backdrop-blur-2xl border border-blue-500/30 shadow-2xl p-2 space-y-1">
                <div className="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-white/5 flex items-center justify-between">
                  <span>Filter By Confederation / Tier</span>
                  <FiFilter className="w-3 h-3 text-blue-400" />
                </div>

                {/* "All" Option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-blue-600/25 text-blue-300 border border-blue-500/30'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🌐</span>
                    <span>All Competitions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                      {ALL_COMPETITIONS.length}
                    </span>
                    {selectedCategory === 'all' && <FiCheck className="text-blue-400 w-3.5 h-3.5" />}
                  </div>
                </button>

                {/* Categories */}
                {Object.entries(COMPETITION_CATEGORY_LABELS)
                  .sort(([, a], [, b]) => a.order - b.order)
                  .map(([catKey, meta]) => {
                    const isSelected = selectedCategory === catKey;
                    const count = categoryCounts[catKey] || 0;
                    return (
                      <button
                        key={catKey}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(catKey as CompetitionCategory);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                          isSelected
                            ? 'bg-blue-600/25 text-blue-300 border border-blue-500/30'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate pr-2">
                          <span className="text-base">{meta.icon}</span>
                          <span className="truncate">{meta.label}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                            {count}
                          </span>
                          {isSelected && <FiCheck className="text-blue-400 w-3.5 h-3.5" />}
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Quick Filter Horizontal Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {quickFilters.map((q) => {
              const active = selectedCategory === q.key;
              return (
                <button
                  key={q.key}
                  type="button"
                  onClick={() => setSelectedCategory(q.key)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-sm'
                      : 'bg-[#091528] text-slate-300 hover:text-white hover:bg-white/5 border border-white/5'
                  }`}
                >
                  <span className="text-xs">{q.icon}</span>
                  <span>{q.label}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({categoryCounts[q.key] || 0})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── COMPETITIONS CONTENT DISPLAY ─── */}
      {searchQuery || selectedCategory !== 'all' ? (
        // Filtered Grid View
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">
                {filteredCompetitions.length} competition
                {filteredCompetitions.length === 1 ? '' : 's'}
              </span>
              <span>matching your filter</span>
            </div>
            {(selectedCategory !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <FiX className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {filteredCompetitions.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-[#0A1424]/60 p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 mx-auto flex items-center justify-center text-slate-400">
                <FiSearch size={22} />
              </div>
              <h3 className="text-sm font-bold text-white">No competitions found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                We couldn&apos;t find any competitions matching &ldquo;{searchQuery}&rdquo;. Try another name or country.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition shadow-lg"
              >
                View All Competitions
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredCompetitions.map((comp) => (
                <CompetitionCard key={comp.slug} comp={comp} />
              ))}
            </div>
          )}
        </div>
      ) : (
        // Grouped View (All Categories)
        <div className="space-y-8">
          {groupedCompetitions?.map((group) => (
            <div key={group.category} className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-white/5">
                <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-base">{group.icon}</span>
                  <span>{group.label}</span>
                  <span className="text-[10px] text-blue-400 font-mono font-bold px-1.5 py-0.2 rounded-md bg-blue-500/10 border border-blue-500/20">
                    {group.competitions.length}
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedCategory(group.category)}
                  className="text-[11px] font-bold text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                  <span>Focus Category</span>
                  <FiArrowRight size={11} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2.5">
                {group.competitions.map((comp) => (
                  <CompetitionCard key={comp.slug} comp={comp} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Individual Redesigned Competition Card
 */
function CompetitionCard({ comp }: { comp: CompetitionEntry }) {
  const isTier1 = comp.tier === 1 || comp.featured;

  return (
    <Link
      href={`/football/${comp.slug}`}
      className="group relative flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-[#0A1528]/90 via-[#07101E]/95 to-[#081426]/90 border border-white/10 hover:border-blue-500/40 hover:bg-[#0D1F3A] transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden"
    >
      {/* Subtle glowing accent highlight on hover */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/15 transition-all pointer-events-none" />

      {/* Official Verified Logo Well */}
      <div className="relative w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 p-1.5 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-blue-400/40 group-hover:bg-blue-500/10 transition-all shadow-inner">
        <CompetitionLogo
          src={comp.logo}
          alt={comp.name}
          flag={comp.flag}
          size={28}
        />
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] text-slate-400 truncate flex items-center gap-1">
            <span className="text-xs leading-none">{comp.flag}</span>
            <span className="font-semibold truncate">{comp.country}</span>
          </span>
          {isTier1 && (
            <span className="shrink-0 text-[8px] font-black tracking-wider uppercase px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Tier 1
            </span>
          )}
        </div>

        <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors truncate mt-0.5">
          {comp.name}
        </h4>

        <div className="flex items-center justify-between mt-1 text-[9px] text-slate-500">
          <span className="font-mono">{comp.season}</span>
          <span className="text-blue-400 font-bold opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
            Hub →
          </span>
        </div>
      </div>
    </Link>
  );
}
