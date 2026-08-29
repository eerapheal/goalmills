'use client';

import React, { useState, useEffect } from 'react';
import { FiExternalLink, FiAward, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { SportType } from '@goalmills/types';

interface SponsoredBannerProps {
  placement?: 'homepage_hero' | 'sports_pulse' | 'match_details' | 'newsletter_footer';
  sport?: SportType | 'all';
  className?: string;
}

export function SponsoredBannerCard({
  placement = 'homepage_hero',
  sport = 'all',
  className = '',
}: SponsoredBannerProps) {
  const [sponsorships, setSponsorships] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchSponsors = async () => {
      try {
        const res = await fetch(`/api/sponsorships?placement=${placement}&sport=${sport}`);
        const data = await res.json();
        if (data.success && data.sponsorships && data.sponsorships.length > 0 && isMounted) {
          setSponsorships(data.sponsorships);
          setCurrentIndex(0);
        } else if (isMounted) {
          setSponsorships([]);
        }
      } catch (err) {
        console.error('Error loading sponsorship banners:', err);
      }
    };

    fetchSponsors();
    return () => {
      isMounted = false;
    };
  }, [placement, sport]);

  const currentSponsor = sponsorships[currentIndex] || null;

  // Track impressions per active campaign
  useEffect(() => {
    if (currentSponsor && currentSponsor._id) {
      fetch(`/api/sponsorships/${currentSponsor._id}/track?type=impression`, {
        method: 'POST',
      }).catch(() => {});
    }
  }, [currentSponsor?._id]);

  // Auto-rotate every 6 seconds if there are multiple sponsors and not hovered
  useEffect(() => {
    if (sponsorships.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sponsorships.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [sponsorships.length, isPaused]);

  if (!currentSponsor) {
    return null;
  }

  const handleClick = () => {
    if (currentSponsor._id) {
      fetch(`/api/sponsorships/${currentSponsor._id}/track?type=click`, {
        method: 'POST',
      }).catch(() => {});
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + sponsorships.length) % sponsorships.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % sponsorships.length);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`group relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-[#141C2B] via-[#1E293B] to-[#121A28] p-4 sm:p-5 shadow-xl transition-all duration-300 ${className}`}
    >
      {/* Background Accent Glow */}
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Sponsor Identity & Copy */}
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          {currentSponsor.imageUrl ? (
            <img
              src={currentSponsor.imageUrl}
              alt={currentSponsor.sponsorName}
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl object-cover border border-amber-500/30 shadow-md flex-shrink-0"
            />
          ) : (
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/30 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-sm flex-shrink-0">
              <FiAward className="w-6 h-6" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider text-amber-300">
                {currentSponsor.badgeText || 'SPONSORED'}
              </span>
              <span className="text-xs font-bold text-slate-400 truncate">
                {currentSponsor.sponsorName}
              </span>
              {sponsorships.length > 1 && (
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded border border-white/5">
                  {currentIndex + 1} of {sponsorships.length}
                </span>
              )}
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white mt-1 truncate">
              {currentSponsor.title}
            </h4>
            {currentSponsor.tagline && (
              <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                {currentSponsor.tagline}
              </p>
            )}
          </div>
        </div>

        {/* Controls & CTA Action */}
        <div className="flex items-center gap-2.5 sm:gap-3 self-end sm:self-center flex-shrink-0">
          {/* Navigation Arrows for multi-item campaigns */}
          {sponsorships.length > 1 && (
            <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl p-1">
              <button
                onClick={handlePrev}
                aria-label="Previous Sponsor"
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next Sponsor"
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <a
            href={currentSponsor.targetUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-950/50 transition transform active:scale-95 whitespace-nowrap"
          >
            <span>{currentSponsor.ctaText || 'Claim Offer'}</span>
            <FiExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Campaign Pagination Dots */}
      {sponsorships.length > 1 && (
        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {sponsorships.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to sponsor ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-6 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                    : 'w-1.5 bg-slate-600 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            GoalMills Commercial Partner Network
          </span>
        </div>
      )}
    </div>
  );
}

export default SponsoredBannerCard;

