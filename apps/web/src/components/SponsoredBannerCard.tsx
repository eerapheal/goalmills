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
      className={`group relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-r from-[#141C2B] via-[#1E293B] to-[#121A28] p-2.5 sm:p-3.5 shadow-lg transition-all duration-300 ${className}`}
    >
      {/* Background Accent Glow */}
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
      <div className="absolute -left-8 -bottom-8 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Sponsor Identity & Copy */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
          {currentSponsor.imageUrl ? (
            <img
              src={currentSponsor.imageUrl}
              alt={currentSponsor.sponsorName}
              className="h-9 w-9 sm:h-11 sm:w-11 rounded-lg object-cover border border-amber-500/30 shadow-md flex-shrink-0"
            />
          ) : (
            <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-700/30 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xs flex-shrink-0">
              <FiAward className="w-5 h-5" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[9px] font-black uppercase tracking-wider text-amber-300 leading-none">
                {currentSponsor.badgeText || 'SPONSORED'}
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400 truncate">
                {currentSponsor.sponsorName}
              </span>
              {sponsorships.length > 1 && (
                <span className="text-[9px] font-bold text-slate-400 bg-slate-800/90 px-1.5 py-0.5 rounded border border-white/5 leading-none">
                  {currentIndex + 1}/{sponsorships.length}
                </span>
              )}
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">
              {currentSponsor.title}
            </h4>
            {currentSponsor.tagline && (
              <p className="text-[10px] sm:text-[11px] text-slate-300 line-clamp-1">
                {currentSponsor.tagline}
              </p>
            )}
          </div>
        </div>

        {/* CTA Action Button with optional subtle arrow controls on desktop */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {sponsorships.length > 1 && (
            <div className="hidden sm:flex items-center gap-0.5 bg-black/40 border border-white/10 rounded-lg p-0.5">
              <button
                onClick={handlePrev}
                aria-label="Previous Sponsor"
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <FiChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next Sponsor"
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <FiChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <a
            href={currentSponsor.targetUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-[11px] sm:text-xs shadow-md shadow-amber-950/40 transition transform active:scale-95 whitespace-nowrap"
          >
            <span>{currentSponsor.ctaText || 'Claim Offer'}</span>
            <FiExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Campaign Pagination Dots & Info */}
      {sponsorships.length > 1 && (
        <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            {sponsorships.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to sponsor ${idx + 1}`}
                className={`h-1 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-4 bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                    : 'w-1 bg-slate-600 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
          <span className="text-[9px] text-slate-400 font-medium tracking-wide truncate">
            GoalMills Commercial Partner Network
          </span>
        </div>
      )}
    </div>
  );
}

export default SponsoredBannerCard;

