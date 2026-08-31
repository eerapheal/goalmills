'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getNewsUrl, slugify } from '@/lib/slugUtils';

export interface FlashPostItem {
  _id: string;
  title: string;
  slug?: string;
  category?: string;
  sportSlug?: string;
}

interface LiveNewsFlashTickerProps {
  sport?: string;
  category?: string;
  badgeText?: string;
  badgeIcon?: React.ReactNode;
  initialPosts?: FlashPostItem[];
  className?: string;
}

// Fallback high-impact sports headlines if offline/initial loading
const FALLBACK_FLASH_POSTS: FlashPostItem[] = [
  {
    _id: 'flash-fb-1',
    title: 'Champions League Quarterfinal Draw: Blockbuster European Nights Confirmed',
    slug: 'champions-league-quarterfinal-draw-blockbuster-european-nights-confirmed',
  },
  {
    _id: 'flash-fb-2',
    title: 'Premier League Title Race: Dramatic Late Winner Shifts Top Four Balance',
    slug: 'premier-league-title-race-dramatic-late-winner-shifts-top-four-balance',
  },
  {
    _id: 'flash-fb-3',
    title: 'Record €75M Summer Transfer Agreed Ahead of Window Deadline',
    slug: 'record-75m-summer-transfer-agreed-ahead-of-window-deadline',
  },
  {
    _id: 'flash-fb-4',
    title: 'El Clásico Tactical Breakdown: High Press Strategy & Lineup Dynamics',
    slug: 'el-clasico-tactical-breakdown-high-press-strategy-and-lineup-dynamics',
  },
  {
    _id: 'flash-fb-5',
    title: 'NBA Playoff Push: Clutch 4th Quarter Buzzer Beater Seals Epic Road Win',
    slug: 'nba-playoff-push-clutch-4th-quarter-buzzer-beater-seals-epic-road-win',
  },
  {
    _id: 'flash-fb-6',
    title: 'IPL 2026 Powerplay Masterclass: Historic Run Chase Stuns Table Leaders',
    slug: 'ipl-2026-powerplay-masterclass-historic-run-chase-stuns-table-leaders',
  },
  {
    _id: 'flash-fb-7',
    title: 'AFCON 2025 Matchday Schedule & Host Venues Confirmed by CAF',
    slug: 'afcon-2025-matchday-schedule-and-host-venues-confirmed-by-caf',
  },
  {
    _id: 'flash-fb-8',
    title: 'Ballon d’Or Frontrunners: Mid-Season Performance Ratings & Stats Audit',
    slug: 'ballon-dor-frontrunners-mid-season-performance-ratings-and-stats-audit',
  },
];

export function LiveNewsFlashTicker({
  sport,
  category,
  badgeText = 'LIVE FLASH',
  badgeIcon,
  initialPosts,
  className = '',
}: LiveNewsFlashTickerProps) {
  const [posts, setPosts] = useState<FlashPostItem[]>(() => {
    if (initialPosts && initialPosts.length > 0) return initialPosts.slice(0, 8);
    return FALLBACK_FLASH_POSTS;
  });

  useEffect(() => {
    let isMounted = true;
    async function loadFlashPosts() {
      try {
        const params = new URLSearchParams({ limit: '8' });
        if (sport && sport !== 'all') params.set('sport', sport);
        if (category && category !== 'all') params.set('category', category);

        const res = await fetch(`/api/news/flash?${params.toString()}`);
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.posts) && data.posts.length > 0) {
          setPosts(data.posts.slice(0, 8));
        }
      } catch (err) {
        // Retain fallback seamlessly
      }
    }

    loadFlashPosts();
    // Refresh randomly selected flash news every 60 seconds
    const interval = setInterval(loadFlashPosts, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [sport, category]);

  // Duplicate posts for seamless infinitely looping marquee
  const displayPosts = posts.length > 0 ? posts : FALLBACK_FLASH_POSTS;
  const marqueeItems = [...displayPosts, ...displayPosts];

  return (
    <div
      className={`relative w-full rounded-2xl bg-[#09162C]/95 border border-blue-500/25 px-3 sm:px-4 py-2 sm:py-2.5 overflow-hidden shadow-xl backdrop-blur-md flex items-center gap-3 group select-none ${className}`}
      role="region"
      aria-label="Live Flash News Ticker"
    >
      {/* Ambient Glow */}
      <div className="absolute -left-10 top-0 bottom-0 w-24 bg-amber-500/10 blur-xl pointer-events-none" />
      <div className="absolute -right-10 top-0 bottom-0 w-24 bg-blue-500/10 blur-xl pointer-events-none" />

      {/* Live Badge (Hidden on mobile for news text space) */}
      <div className="hidden sm:flex flex-shrink-0 z-10 items-center">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/35 text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-sm shadow-amber-500/10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          </span>
          {badgeIcon || <span>⚡</span>}
          <span>{badgeText}</span>
        </span>
      </div>

      {/* Dynamic Marquee Stream (Hover to Pause) */}
      <div className="relative flex-1 overflow-hidden whitespace-nowrap mask-gradient">
        <div className="marquee-scroll-flow items-center gap-6 py-0.5">
          {marqueeItems.map((item, idx) => {
            const newsUrl = getNewsUrl(item);
            return (
              <React.Fragment key={`${item._id || item.slug}-${idx}`}>
                <Link
                  href={newsUrl}
                  className="inline-flex items-center text-xs sm:text-sm font-semibold text-slate-200 hover:text-amber-300 hover:underline transition-colors duration-200 cursor-pointer tracking-normal"
                >
                  <span className="hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-300 hover:to-amber-300 transition-all">
                    {item.title}
                  </span>
                </Link>
                <span className="text-amber-400/60 text-xs font-bold select-none" aria-hidden="true">
                  •
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LiveNewsFlashTicker;
