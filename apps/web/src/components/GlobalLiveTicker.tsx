'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface TickerItem {
  id: string;
  text: string;
  isLive?: boolean;
  href?: string;
}

const DEFAULT_TICKER_ITEMS: TickerItem[] = [
  { id: '1', text: '🔴 Man City 2–1 Arsenal · 67\'', isLive: true, href: '/football' },
  { id: '2', text: '⚽ Osimhen brace powers Galatasaray in Derby triumph', href: '/news' },
  { id: '3', text: '🌍 Nigeria 3–0 Rwanda (AFCON Qualifiers)', href: '/football' },
  { id: '4', text: '🏏 Kohli masterclass century powers RCB to summit', href: '/cricket' },
  { id: '5', text: '🏀 Lakers advance past Celtics in thrilling OT duel', href: '/basketball' },
  { id: '6', text: '⚡ El Clásico: Real Madrid & Barcelona edge pre-match markets', href: '/news' },
  { id: '7', text: '🔵 Haaland fit & cleared for UCL semi-final clash', href: '/news' },
  { id: '8', text: '⭐ CAF Champions League group fixtures schedule announced', href: '/football' },
];

export function GlobalLiveTicker() {
  const [tickerItems, setTickerItems] = useState<TickerItem[]>(DEFAULT_TICKER_ITEMS);

  useEffect(() => {
    let isMounted = true;

    async function loadDynamicTicker() {
      try {
        const [footRes, newsRes] = await Promise.all([
          fetch('/api/football?met=Livescore').catch(() => null),
          fetch('/api/news/flash?limit=6').catch(() => null),
        ]);

        const items: TickerItem[] = [];

        if (footRes && footRes.ok) {
          const footData = await footRes.json();
          const matches = footData?.result || footData?.response || (Array.isArray(footData) ? footData : []);
          if (Array.isArray(matches) && matches.length > 0) {
            matches.slice(0, 4).forEach((m: any, idx: number) => {
              const home = m.event_home_team || 'Home';
              const away = m.event_away_team || 'Away';
              const score = m.event_final_result || `${m.event_home_final_result ?? 0}–${m.event_away_final_result ?? 0}`;
              const time = m.event_status ? `${m.event_status}'` : 'LIVE';
              items.push({
                id: `live-m-${idx}`,
                text: `🔴 ${home} ${score} ${away} · ${time}`,
                isLive: true,
                href: m.event_key ? `/matches/${m.event_key}` : '/football',
              });
            });
          }
        }

        if (newsRes && newsRes.ok) {
          const newsData = await newsRes.json();
          if (newsData?.success && Array.isArray(newsData.posts)) {
            newsData.posts.slice(0, 5).forEach((p: any) => {
              items.push({
                id: p._id || p.slug,
                text: `⚡ ${p.title}`,
                href: `/news/${p.slug || p._id}`,
              });
            });
          }
        }

        if (isMounted && items.length > 0) {
          setTickerItems(items);
        }
      } catch {
        // Fall back gracefully to default curated items
      }
    }

    loadDynamicTicker();
    const interval = setInterval(loadDynamicTicker, 45_000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed top-14 left-0 right-0 z-40 bg-[#0f172a] border-b border-[#1e293b] overflow-hidden">
      <div className="flex items-center h-7">
        <div className="flex-shrink-0 flex items-center gap-2 px-3 bg-red-600 h-full select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-pulse" />
          <span className="text-[10px] font-black tracking-widest text-white uppercase whitespace-nowrap">
            Live Wire
          </span>
        </div>
        <div className="overflow-hidden flex-1 relative mask-gradient">
          <div
            className="flex whitespace-nowrap ticker-track hover:[animation-play-state:paused]"
            style={{ animation: 'ticker 45s linear infinite' }}
          >
            {[0, 1].map((copyIdx) => (
              <div key={copyIdx} className="flex items-center">
                {tickerItems.map((item, idx) => (
                  <span key={`${copyIdx}-${item.id}-${idx}`} className="text-xs text-slate-300 px-4 inline-flex items-center">
                    {item.href ? (
                      <Link
                        href={item.href}
                        className={`hover:text-amber-300 transition-colors ${
                          item.isLive ? 'text-white font-semibold' : 'text-slate-300'
                        }`}
                      >
                        {item.text}
                      </Link>
                    ) : (
                      <span>{item.text}</span>
                    )}
                    <span className="text-slate-600 ml-4 select-none">·</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GlobalLiveTicker;
