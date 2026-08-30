'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiCompass, FiTrendingUp, FiPlay, FiArrowRight } from 'react-icons/fi';
import type { RecommendationCandidate, RecommendationContext } from '@goalmills/types';
import { getNewsUrl } from '@/lib/slugUtils';

interface SmartRelatedContentProps {
  currentId?: string;
  sportSlug?: string;
  categorySlug?: string;
  teamSlug?: string;
  context?: RecommendationContext;
  title?: string;
  limit?: number;
}

export function SmartRelatedContent({
  currentId,
  sportSlug,
  categorySlug,
  teamSlug,
  context = 'article_detail',
  title = 'Related Stories & Tactical Intel',
  limit = 4,
}: SmartRelatedContentProps) {
  const [candidates, setCandidates] = useState<RecommendationCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchRecommendations() {
      try {
        const params = new URLSearchParams({
          context,
          limit: limit.toString(),
        });
        if (currentId) params.set('currentId', currentId);
        if (sportSlug) params.set('sport', sportSlug);
        if (categorySlug) params.set('category', categorySlug);
        if (teamSlug) params.set('team', teamSlug);

        // Attempt to pass local favorite teams if stored
        try {
          const storedFavs = localStorage.getItem('goalmills_fav_teams');
          if (storedFavs) params.set('favorites', storedFavs);
        } catch {}

        const res = await fetch(`/api/recommendations?${params.toString()}`);
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.recommendations)) {
          setCandidates(data.recommendations);
        }
      } catch (err) {
        console.error('Failed to load recommended content:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchRecommendations();
    return () => {
      isMounted = false;
    };
  }, [currentId, sportSlug, categorySlug, teamSlug, context, limit]);

  function handleCandidateClick(cand: RecommendationCandidate) {
    // Send background CTR tracking beacon
    try {
      fetch('/api/recommendations/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: cand.id,
          candidateType: cand.type,
          context,
          action: 'click',
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  }

  if (loading) {
    return (
      <div className="my-8 p-6 rounded-3xl bg-slate-950/40 border border-white/5 animate-pulse">
        <div className="h-5 w-48 bg-white/10 rounded-lg mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (candidates.length === 0) return null;

  return (
    <section className="my-10 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
          <FiCompass className="text-amber-400" />
          <span>{title}</span>
        </h3>
        <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
          <FiTrendingUp className="text-emerald-400" />
          <span>Curated for You</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {candidates.map((item) => (
          <Link
            key={item.id}
            href={item.url || getNewsUrl({ id: item.id, slug: item.slug, title: item.title })}
            onClick={() => handleCandidateClick(item)}
            className="glass-card group rounded-2xl border border-white/10 p-4 bg-slate-950/60 hover:bg-slate-900/90 transition-all duration-300 flex flex-col justify-between hover:border-amber-400/40 hover:-translate-y-1 shadow-lg"
          >
            <div>
              {/* Badge & Sport Pill */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[10px] font-black uppercase tracking-wider line-clamp-1">
                  {item.reasonBadge}
                </span>
                {item.type === 'video' && (
                  <span className="p-1 rounded-md bg-rose-500/20 text-rose-300">
                    <FiPlay size={10} />
                  </span>
                )}
              </div>

              {/* Title */}
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                {item.title}
              </h4>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
              <span className="capitalize font-mono font-medium">{item.sportSlug || 'General'}</span>
              <span className="inline-flex items-center gap-1 text-amber-400 group-hover:translate-x-0.5 transition-transform font-bold text-[10px]">
                <span>Read</span>
                <FiArrowRight size={10} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default SmartRelatedContent;
