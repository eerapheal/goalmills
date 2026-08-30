'use client';

import React, { useState, useEffect } from 'react';
import { FiExternalLink, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { SportType } from '@goalmills/types';

export interface SponsoredBannerProps {
  placement?: 'homepage_hero' | 'sports_pulse' | 'match_details' | 'newsletter_footer';
  sport?: SportType | 'all';
  category?: string;
  campaignOffset?: number;
  className?: string;
  accentBadge?: string;
}

const DEFAULT_FALLBACKS = [
  {
    _id: 'default-hero-1',
    sponsorName: '1xBet Global',
    title: '300% Welcome Bonus on Live Football & NBA',
    tagline: 'Instant payouts, xG live metrics, and VIP tournament multipliers.',
    ctaText: 'Claim 300% Bonus',
    targetUrl: 'https://1xbet.com',
    badgeText: 'VIP PARTNER',
    imageUrl:
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
    sponsorLogo:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=120&auto=format&fit=crop&q=80',
  },
  {
    _id: 'default-pulse-2',
    sponsorName: 'Puma Football Pro',
    title: 'Next-Gen Ultra 5 Carbon Boots Unveiled',
    tagline: 'Engineered with aerodynamic carbon chassis for elite match acceleration.',
    ctaText: 'Shop New Season',
    targetUrl: 'https://puma.com',
    badgeText: 'KIT SPONSOR',
    imageUrl:
      'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=800&auto=format&fit=crop&q=80',
    sponsorLogo:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&auto=format&fit=crop&q=80',
  },
  {
    _id: 'default-match-3',
    sponsorName: 'Fantasy Premier Pulse',
    title: 'Compete for £100,000 in Gameweek Knockouts',
    tagline: 'Build your dream 11, analyze fixture xG, and top the global leaderboard.',
    ctaText: 'Join League Free',
    targetUrl: 'https://fantasy.premierleague.com',
    badgeText: 'FANTASY LEAGUE',
    imageUrl:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80',
    sponsorLogo:
      'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=120&auto=format&fit=crop&q=80',
  },
];

export function SponsoredBannerCard({
  placement = 'homepage_hero',
  sport = 'all',
  category = 'all',
  campaignOffset = 0,
  className = '',
  accentBadge,
}: SponsoredBannerProps) {
  const [sponsorships, setSponsorships] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchSponsors = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (placement) queryParams.set('placement', placement);
        if (sport) queryParams.set('sport', sport);
        if (category && category !== 'all') queryParams.set('category', category);

        const res = await fetch(`/api/sponsorships?${queryParams.toString()}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.sponsorships) && data.sponsorships.length > 0 && isMounted) {
          const offsetIndex = campaignOffset % data.sponsorships.length;
          setSponsorships(data.sponsorships);
          setCurrentIndex(offsetIndex);
        } else if (isMounted) {
          const fallback = DEFAULT_FALLBACKS[campaignOffset % DEFAULT_FALLBACKS.length];
          setSponsorships([fallback]);
          setCurrentIndex(0);
        }
      } catch {
        if (isMounted) {
          const fallback = DEFAULT_FALLBACKS[campaignOffset % DEFAULT_FALLBACKS.length];
          setSponsorships([fallback]);
          setCurrentIndex(0);
        }
      }
    };

    fetchSponsors();
    return () => {
      isMounted = false;
    };
  }, [placement, sport, category, campaignOffset]);

  const currentSponsor = sponsorships[currentIndex] || DEFAULT_FALLBACKS[campaignOffset % DEFAULT_FALLBACKS.length];

  // Track impressions per active campaign
  useEffect(() => {
    if (currentSponsor && currentSponsor._id && !currentSponsor._id.startsWith('default-')) {
      fetch(`/api/sponsorships/${currentSponsor._id}/track?type=impression`, {
        method: 'POST',
      }).catch(() => {});
    }
  }, [currentSponsor?._id]);

  // Auto-rotate every 6 seconds if multiple sponsors exist
  useEffect(() => {
    if (sponsorships.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sponsorships.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [sponsorships.length, isPaused]);

  const handleClick = () => {
    if (currentSponsor && currentSponsor._id && !currentSponsor._id.startsWith('default-')) {
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

  const bgImage = currentSponsor.imageUrl || null;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`group relative overflow-hidden rounded-xl border border-amber-500/35 bg-[#091529] p-3 sm:p-3.5 shadow-lg transition-all duration-300 hover:border-amber-400/60 hover:shadow-amber-500/15 flex flex-col justify-between h-full ${className}`}
    >
      {/* ─── VIBRANT HIGH-VISIBILITY BACKGROUND IMAGE WITH SOFT GRADIENT ─── */}
      {bgImage && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={bgImage}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-700 opacity-65 sm:opacity-75 group-hover:opacity-85"
          />
          {/* Balanced High-Contrast Gradient: Clear sports visuals with protected text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#070E1A]/85 via-[#091529]/65 to-[#070E1A]/85 backdrop-blur-[0.5px]" />
        </div>
      )}

      {/* Background Ambient Radial Accents */}
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-amber-500/20 blur-xl pointer-events-none z-0" />
      <div className="absolute -left-6 -bottom-6 h-20 w-20 rounded-full bg-blue-600/20 blur-xl pointer-events-none z-0" />

      {/* ─── TOP CONTENT SECTION (COMPACT FLEX-COL) ─── */}
      <div className="relative z-10 flex flex-col min-w-0">
        {/* Badge & Sponsor Header Row */}
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span className="px-1.5 py-0.5 rounded bg-amber-500/30 border border-amber-400/50 text-[8.5px] font-black uppercase tracking-wider text-amber-300 leading-none shadow-sm drop-shadow">
              {accentBadge || currentSponsor.badgeText || 'SPONSORED'}
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-200 truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {currentSponsor.sponsorName}
            </span>
          </div>

          {/* Carousel Arrows if multiple sponsors */}
          {sponsorships.length > 1 && (
            <div className="flex items-center gap-0.5 bg-slate-950/85 border border-white/20 rounded-lg p-0.5 shadow flex-shrink-0">
              <button
                onClick={handlePrev}
                aria-label="Previous Sponsor"
                className="w-6 h-6 rounded hover:bg-white/15 text-slate-200 hover:text-white transition flex items-center justify-center"
              >
                <FiChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next Sponsor"
                className="w-6 h-6 rounded hover:bg-white/15 text-slate-200 hover:text-white transition flex items-center justify-center"
              >
                <FiChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Headline & Description Body */}
        <div>
          <h3 className="text-xs sm:text-[13px] font-black text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] line-clamp-1">
            {currentSponsor.title}
          </h3>
          {currentSponsor.tagline && (
            <p className="text-[10.5px] sm:text-[11px] text-slate-200 font-medium line-clamp-1 mt-0.5 leading-snug drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              {currentSponsor.tagline}
            </p>
          )}
        </div>
      </div>

      {/* ─── BOTTOM SECTION: COMPACT FULL-WIDTH CTA ─── */}
      <div className="relative z-10 mt-2.5 pt-2 border-t border-white/15 flex flex-col gap-1.5">
        <a
          href={currentSponsor.targetUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-md shadow-amber-950/40 transition transform active:scale-98 text-center"
        >
          <span>{currentSponsor.ctaText || 'Claim Offer'}</span>
          <FiExternalLink className="w-3 h-3" />
        </a>

        {/* Indicator dots with accessible touch targets */}
        {sponsorships.length > 1 && (
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center">
              {sponsorships.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to sponsor ${idx + 1}`}
                  className="min-w-[28px] min-h-[20px] p-1 flex items-center justify-center focus:outline-none"
                >
                  <span
                    className={`h-1.5 rounded-full transition-all duration-300 block ${
                      idx === currentIndex
                        ? 'w-4 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                        : 'w-1.5 bg-slate-400 hover:bg-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-[8.5px] text-slate-300 font-semibold tracking-wide uppercase drop-shadow">
              Official Partner
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default SponsoredBannerCard;
