'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getRecentlyViewedArticles, RecentlyViewedItem } from '@/lib/newsUtils';

export default function RecentlyViewedSection({ currentId }: { currentId?: string }) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const history = getRecentlyViewedArticles();
    const filtered = currentId ? history.filter((h) => h._id !== currentId) : history;
    setItems(filtered.slice(0, 6));
  }, [currentId]);

  if (!mounted || items.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-white/10 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>👁️</span> Recently Viewed
        </h3>
        <span className="text-xs text-slate-400">From your reading history</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Link
            key={item._id}
            href={`/news/${item._id}`}
            className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-blue-500/40 transition-all"
          >
            {item.image ? (
              <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-900">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="80px"
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            ) : null}
            <div className="flex-1 min-w-0">
              {item.category && (
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                  {item.category}
                </span>
              )}
              <h4 className="text-xs font-bold text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
                {item.title}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
