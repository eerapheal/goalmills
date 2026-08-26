'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiSearch, FiX, FiPlay, FiClock, FiEye, FiActivity, FiShare2, FiStar, FiFilter } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa6';

import { getHighlightThumbnail, HIGHLIGHT_CATEGORIES } from '@/lib/videoUtils';

export interface HighlightItem {
  _id: string;
  video_title: string;
  video_url: string;
  video_thumbnail?: string;
  video_description?: string;
  category?: string;
  league?: string;
  duration?: string;
  views?: number;
  isFeatured?: boolean;
  createdAt?: string | Date;
}

interface HighlightsFeedClientProps {
  initialHighlights: HighlightItem[];
}

export default function HighlightsFeedClient({ initialHighlights }: HighlightsFeedClientProps) {
  const [highlights, setHighlights] = useState<HighlightItem[]>(initialHighlights);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredHighlights = useMemo(() => {
    let list = highlights;

    if (selectedCategory !== 'All') {
      const cat = selectedCategory.toLowerCase();
      list = list.filter((h) => {
        const titleMatch = h.video_title?.toLowerCase().includes(cat);
        const catMatch = h.category?.toLowerCase().includes(cat);
        const leagueMatch = h.league?.toLowerCase().includes(cat);
        const descMatch = h.video_description?.toLowerCase().includes(cat);
        return titleMatch || catMatch || leagueMatch || descMatch;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((h) => {
        const titleMatch = h.video_title?.toLowerCase().includes(q);
        const leagueMatch = h.league?.toLowerCase().includes(q);
        const descMatch = h.video_description?.toLowerCase().includes(q);
        const catMatch = h.category?.toLowerCase().includes(q);
        return titleMatch || leagueMatch || descMatch || catMatch;
      });
    }

    return list;
  }, [highlights, selectedCategory, searchQuery]);

  // Featured Spotlight (either explicitly featured or the first item)
  const spotlightItem = useMemo(() => {
    return highlights.find((h) => h.isFeatured) || highlights[0];
  }, [highlights]);

  const spotlightThumbnail = spotlightItem
    ? getHighlightThumbnail(spotlightItem.video_url, spotlightItem.video_thumbnail)
    : '';

  return (
    <div className="space-y-10">
      {/* Header & Live Pulse Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Sports <span className="text-blue-500">Highlights</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Decisive goals, buzzer beaters, tactical breakdowns, and HD game replays with instant autoplay.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search teams, goals, matches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <FiX />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {HIGHLIGHT_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Spotlight Featured Replay (Shown when on 'All' and not searching) */}
      {selectedCategory === 'All' && !searchQuery && spotlightItem && (
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#141C2B] shadow-2xl transition-all duration-300 hover:border-blue-500/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Thumbnail Box */}
            <div className="relative aspect-video lg:aspect-auto lg:col-span-7 bg-black overflow-hidden group">
              <img
                src={spotlightThumbnail}
                alt={spotlightItem.video_title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E1522] via-transparent to-transparent lg:hidden" />

              {/* Play Badge Overlay */}
              <Link
                href={`/highlights/${spotlightItem._id}`}
                className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all"
              >
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-2xl backdrop-blur-md border border-white/30 group-hover:scale-110 group-hover:bg-blue-500 transition-all duration-300">
                  <FiPlay className="ml-1 text-2xl sm:text-3xl" />
                </div>
              </Link>

              {/* HD Tag */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-lg shadow-red-600/40">
                  <FaFire /> Spotlight Match
                </span>
                {spotlightItem.league && (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-black/70 text-slate-300 border border-white/10 backdrop-blur-sm">
                    {spotlightItem.league}
                  </span>
                )}
              </div>
            </div>

            {/* Content Box */}
            <div className="p-6 sm:p-8 lg:p-10 lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {spotlightItem.category || 'Featured Replay'}
                  </span>
                  {spotlightItem.duration && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <FiClock size={12} /> {spotlightItem.duration}
                    </span>
                  )}
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <FiEye size={12} /> {spotlightItem.views || 0} views
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  <Link
                    href={`/highlights/${spotlightItem._id}`}
                    className="hover:text-blue-400 transition-colors"
                  >
                    {spotlightItem.video_title}
                  </Link>
                </h2>

                {spotlightItem.video_description && (
                  <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
                    {spotlightItem.video_description}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <Link
                  href={`/highlights/${spotlightItem._id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
                >
                  <FiPlay /> Watch With Instant Autoplay
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Grid of Highlights */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>{selectedCategory === 'All' ? 'All Match Highlights' : `${selectedCategory} Replays`}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-slate-400">
              {filteredHighlights.length}
            </span>
          </h2>
        </div>

        {filteredHighlights.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#141C2B] p-12 text-center shadow-xl">
            <span className="text-5xl mb-3">🎬</span>
            <h3 className="text-lg font-bold text-white mb-1">No Highlights Found</h3>
            <p className="text-xs text-slate-400 max-w-xs mb-4">
              Try adjusting your category filter or search query to find match replays.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHighlights.map((item) => {
              const thumb = getHighlightThumbnail(item.video_url, item.video_thumbnail);
              return (
                <Link
                  key={item._id}
                  href={`/highlights/${item._id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141C2B] hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10"
                >
                  {/* Thumbnail Video Card */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                    <img
                      src={thumb}
                      alt={item.video_title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Play Button Indicator */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-xl backdrop-blur-sm border border-white/30 group-hover:scale-110 group-hover:bg-blue-500 transition-all duration-300">
                        <FiPlay className="ml-0.5 text-lg" />
                      </div>
                    </div>

                    {/* League or Category Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="rounded-lg bg-black/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-blue-400 backdrop-blur-md border border-white/10">
                        {item.league || item.category || 'HD Highlight'}
                      </span>
                    </div>

                    {/* Duration / Views Badge */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      {item.duration && (
                        <span className="rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md border border-white/10">
                          {item.duration}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2 group-hover:text-blue-400 transition-colors leading-snug mb-2">
                        {item.video_title}
                      </h3>
                      {item.video_description && (
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                          {item.video_description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <FiEye size={12} /> {item.views || 0} views
                      </span>
                      <span className="font-bold text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Watch <FiPlay size={10} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
