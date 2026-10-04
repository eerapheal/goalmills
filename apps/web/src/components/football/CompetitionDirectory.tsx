'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiSearch, FiChevronDown, FiExternalLink, FiBarChart2 } from 'react-icons/fi';
import {
  getCompetitionDirectoryGroups,
  CompetitionDirectoryGroup,
} from '@/lib/football/competitionDirectoryData';
import { CompetitionEntry, ALL_COMPETITIONS } from '@/lib/competitionCategories';

interface CompetitionDirectoryProps {
  compact?: boolean;
  className?: string;
  defaultExpandedGroup?: string;
}

export function CompetitionDirectory({
  compact = false,
  className = '',
  defaultExpandedGroup = 'caf',
}: CompetitionDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(defaultExpandedGroup);

  const groups = useMemo(() => getCompetitionDirectoryGroups(), []);

  // Filter groups & competitions
  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return groups
      .map((g) => {
        if (selectedCategory !== 'all' && g.category !== selectedCategory) {
          return null;
        }

        const filteredComps = g.competitions.filter((c) => {
          if (!q) return true;
          return (
            c.name.toLowerCase().includes(q) ||
            c.country.toLowerCase().includes(q) ||
            c.slug.toLowerCase().includes(q)
          );
        });

        if (filteredComps.length === 0) return null;

        return {
          ...g,
          competitions: filteredComps,
        };
      })
      .filter((g): g is CompetitionDirectoryGroup => g !== null);
  }, [groups, searchQuery, selectedCategory]);

  const totalFilteredCount = useMemo(() => {
    return filteredGroups.reduce((acc, g) => acc + g.competitions.length, 0);
  }, [filteredGroups]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search & Stats Bar */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-white uppercase tracking-wider">
              Authoritative Registry
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {totalFilteredCount} / {ALL_COMPETITIONS.length} Leagues
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Season 2026/27</span>
        </div>

        {/* Search input */}
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 75+ global & African leagues, cups..."
            className="w-full pl-9 pr-8 py-2 bg-[#06101E] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Category filter pills */}
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
              All (75+)
            </button>
            {groups.map((g) => (
              <button
                key={g.category}
                onClick={() => setSelectedCategory(g.category)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === g.category
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{g.icon}</span>
                <span>{g.title.split('(')[0].trim()}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grouped Accordions */}
      <div className="divide-y divide-[#1e293b] rounded-2xl border border-[#1e293b] bg-[#0c1628] overflow-hidden shadow-xl">
        {filteredGroups.map((group) => {
          const isExpanded =
            searchQuery.trim().length > 0 || expandedGroup === group.category;

          return (
            <div key={group.category} className="transition-colors">
              {/* Group Header Button */}
              <button
                onClick={() =>
                  setExpandedGroup(expandedGroup === group.category ? null : group.category)
                }
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#13223d] transition-colors text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg flex-shrink-0">{group.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                      {group.title}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {group.competitions.length} active competitions
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800/80 text-blue-400 border border-slate-700/60 font-semibold">
                    {group.competitions.length}
                  </span>
                  <FiChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-blue-400' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Competitions in this Group */}
              {isExpanded && (
                <div className="bg-[#070e1c] border-t border-[#1e293b]/60 divide-y divide-[#1e293b]/40">
                  {group.competitions.map((comp) => (
                    <div
                      key={comp.slug}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-[#101b30] transition-colors group"
                    >
                      {/* Competition Crest with Next.js Image & Title */}
                      <Link
                        href={`/football/${comp.slug}`}
                        className="flex items-center gap-3 flex-1 min-w-0"
                      >
                        <div className="relative w-6 h-6 rounded-md bg-slate-900 p-0.5 border border-white/10 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          <Image
                            src={comp.logo}
                            alt={comp.name}
                            width={24}
                            height={24}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              // Hide if broken, show flag
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                              {comp.name}
                            </span>
                            <span className="text-[10px] flex-shrink-0">{comp.flag}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">
                            {comp.country} · {comp.season}
                          </p>
                        </div>
                      </Link>

                      {/* Tier Badge & Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                            comp.tier === 1
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : comp.tier === 2
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-700/50 text-slate-400 border border-slate-600/30'
                          }`}
                        >
                          {comp.competitionType === 'cup'
                            ? 'Cup'
                            : comp.competitionType === 'knockout'
                              ? 'KO'
                              : `T${comp.tier}`}
                        </span>

                        <Link
                          href={`/football/${comp.slug}/table`}
                          title={`${comp.name} League Table & Standings`}
                          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-blue-600/30 text-slate-400 hover:text-blue-300 transition-colors border border-transparent hover:border-blue-500/30"
                        >
                          <FiBarChart2 className="w-3.5 h-3.5" />
                        </Link>

                        <Link
                          href={`/football/${comp.slug}`}
                          title={`${comp.name} Overview Hub`}
                          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-blue-600/30 text-slate-400 hover:text-blue-300 transition-colors border border-transparent hover:border-blue-500/30"
                        >
                          <FiExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {filteredGroups.length === 0 && (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <p className="text-2xl">🔍</p>
            <p className="text-xs font-bold text-white">No leagues matched &quot;{searchQuery}&quot;</p>
            <p className="text-[11px] text-slate-500">
              Try searching by country (e.g. Nigeria, England, Spain, Morocco) or tournament name.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
export default CompetitionDirectory;
