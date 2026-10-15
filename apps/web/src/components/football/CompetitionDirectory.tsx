'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { FiGlobe, FiSearch, FiX } from 'react-icons/fi';
import { CompetitionLogo } from '@/components/competitions/CompetitionLogo';
import {
  ALL_COMPETITIONS,
  COMPETITION_CATEGORY_LABELS,
  CompetitionEntry,
} from '@/lib/competitionCategories';

interface CompetitionDirectoryProps {
  compact?: boolean;
  className?: string;
  title?: string;
  showSearch?: boolean;
}

export function CompetitionDirectory({
  compact = true,
  className = '',
  title = 'Major Competitions',
  showSearch = true,
}: CompetitionDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredCompetitions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ALL_COMPETITIONS.filter((comp) => {
      if (selectedCategory !== 'all' && comp.category !== selectedCategory) {
        return false;
      }
      if (!q) return true;
      return (
        comp.name.toLowerCase().includes(q) ||
        comp.country.toLowerCase().includes(q) ||
        comp.slug.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    return Object.entries(COMPETITION_CATEGORY_LABELS).sort(
      ([, a], [, b]) => a.order - b.order
    );
  }, []);

  return (
    <div
      className={`rounded-3xl border border-blue-500/20 bg-[#0A162B]/90 p-5 space-y-4 shadow-xl backdrop-blur-md ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <FiGlobe className="text-amber-400" />
          <span>{title}</span>
        </h3>
        <span className="text-[10px] text-amber-400 font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
          {filteredCompetitions.length} Active
        </span>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 75+ global & African leagues..."
            className="w-full pl-8 pr-7 py-2 bg-[#06101E] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Category Pills (Full page mode) */}
      {!compact && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[10px] font-bold">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All ({ALL_COMPETITIONS.length})
          </button>
          {categories.map(([catKey, meta]) => (
            <button
              key={catKey}
              onClick={() => setSelectedCategory(catKey)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === catKey
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>{meta.icon}</span>
              <span>{meta.label.split('(')[0].trim()}</span>
            </button>
          ))}
        </div>
      )}

      {/* Competitions List */}
      <div
        className={
          compact
            ? 'max-h-[540px] overflow-y-auto space-y-2 pr-1 custom-scrollbar'
            : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'
        }
      >
        {filteredCompetitions.map((comp) => (
          <Link
            key={comp.slug}
            href={`/football/${comp.slug}`}
            className="group flex items-center justify-between p-3 rounded-2xl bg-[#070F1E] hover:bg-blue-600/20 border border-blue-500/15 hover:border-amber-400/40 transition-all text-xs font-bold text-slate-200 hover:text-white shadow-sm"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-slate-900 border border-white/10 p-1 flex items-center justify-center shrink-0">
                <CompetitionLogo
                  src={comp.logo}
                  alt={comp.name}
                  flag={comp.flag}
                  size={20}
                />
              </div>
              <div className="min-w-0">
                <span className="group-hover:text-amber-300 transition-colors truncate block">
                  {comp.name}
                </span>
                <span className="text-[10px] text-slate-500 font-normal truncate block">
                  {comp.country} · {comp.season}
                </span>
              </div>
            </div>
            <span className="text-[11px] text-amber-400 font-bold group-hover:translate-x-1 transition-transform shrink-0 ml-2">
              &rarr;
            </span>
          </Link>
        ))}

        {filteredCompetitions.length === 0 && (
          <div className="text-center py-8 text-slate-400 col-span-full">
            <p className="text-2xl mb-1">🔍</p>
            <p className="text-xs font-bold text-white">No competitions found</p>
            <p className="text-[11px] text-slate-500">Try searching another league or country.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export const MajorCompetitionsNavigator = CompetitionDirectory;
export default CompetitionDirectory;
