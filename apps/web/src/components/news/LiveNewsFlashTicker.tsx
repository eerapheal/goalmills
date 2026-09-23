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
    return [];
  });

  useEffect(() => {
    let isMounted = true;
    async function loadFlashPosts() {
      try {
        const params = new URLSearchParams({ limit: '8' });
        if (sport && sport !== 'all') params.set('sport', sport);
        if (category && category !== 'all') params.set('category', category);

        params.set('_t', String(Date.now()));
        const res = await fetch(`/api/news/flash?${params.toString()}`, { cache: 'no-store' });
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
    // Fast 15s refresh for real-time live flash news reports
    const interval = setInterval(loadFlashPosts, 15_000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [sport, category]);

  // Duplicate posts for seamless infinitely looping marquee
  const marqueeItems = posts.length > 0 ? [...posts, ...posts] : [];

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
        {marqueeItems.length === 0 ? (
          <span className="text-xs text-slate-400 animate-pulse">Loading latest news...</span>
        ) : (
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
        )}
      </div>
    </div>
  );
}

export default LiveNewsFlashTicker;
