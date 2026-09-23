'use client';

import React, { useState, useEffect } from 'react';
import { FiExternalLink, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { SportType } from '@goalmills/types';

export interface SponsoredBannerProps {
  placement?: 'homepage_hero' | 'sports_pulse' | 'match_details' | 'newsletter_footer';
  sport?: SportType | 'all';
  category?: string;
  campaignOffset?: number;
  className?: string;
  accentBadge?: string;
}


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
  const [isClosed, setIsClosed] = useState(false);

  /*
   * Fetch sponsorships
   */
  useEffect(() => {
    let isMounted = true;

    const fetchSponsors = async () => {
      try {
        const queryParams = new URLSearchParams();

        if (placement) {
          queryParams.set('placement', placement);
        }

        if (sport) {
          queryParams.set('sport', sport);
        }

        if (category && category !== 'all') {
          queryParams.set('category', category);
        }

        const res = await fetch(
          `/api/sponsorships?${queryParams.toString()}`
        );

        const data = await res.json();

        if (
          data.success &&
          Array.isArray(data.sponsorships) &&
          data.sponsorships.length > 0 &&
          isMounted
        ) {
          const offsetIndex =
            campaignOffset % data.sponsorships.length;

          setSponsorships(data.sponsorships);
          setCurrentIndex(offsetIndex);
        }
        // If no real sponsorships, leave array empty — nothing renders
      } catch {
        // silent fail — no fake fallback shown
      }
    };

    fetchSponsors();

    return () => {
      isMounted = false;
    };
  }, [placement, sport, category, campaignOffset]);

  const currentSponsor = sponsorships[currentIndex] ?? null;

  /*
   * Track impression
   */
  useEffect(() => {
    if (
      currentSponsor?._id &&
      !currentSponsor._id.startsWith('default-')
    ) {
      fetch(
        `/api/sponsorships/${currentSponsor._id}/track?type=impression`,
        {
          method: 'POST',
        }
      ).catch(() => {});
    }
  }, [currentSponsor?._id]);

  /*
   * Auto rotate
   */
  useEffect(() => {
    if (sponsorships.length <= 1 || isPaused || isClosed) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentIndex(
        (prev) => (prev + 1) % sponsorships.length
      );
    }, 6000);

    return () => clearInterval(timer);
  }, [sponsorships.length, isPaused, isClosed]);

  /*
   * Track click
   */
  const handleClick = () => {
    if (
      currentSponsor?._id &&
      !currentSponsor._id.startsWith('default-')
    ) {
      fetch(
        `/api/sponsorships/${currentSponsor._id}/track?type=click`,
        {
          method: 'POST',
        }
      ).catch(() => {});
    }
  };

  /*
   * Close card
   */
  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsClosed(true);
  };

  /*
   * Navigation
   */
  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setCurrentIndex(
      (prev) =>
        (prev - 1 + sponsorships.length) %
        sponsorships.length
    );
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setCurrentIndex(
      (prev) =>
        (prev + 1) % sponsorships.length
    );
  };

  // Don't render after closing or if no real sponsorships loaded
  if (isClosed || sponsorships.length === 0 || !currentSponsor) {
    return null;
  }

  const bgImage = currentSponsor?.imageUrl || null;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`
        relative
        w-full
        max-w-[430px]
        overflow-hidden
        rounded-xl
        border
        border-amber-500/25
        bg-[#081426]
        shadow-lg
        shadow-black/20
        ${className}
      `}
    >
      {/* Background Image */}
      {bgImage && (
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={bgImage}
            alt=""
            aria-hidden="true"
            className="
              h-full
              w-full
              object-cover
              opacity-15
            "
          />

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-r
              from-[#07111f]
              via-[#081426]/95
              to-[#081426]/80
            "
          />
        </div>
      )}

      {/* Ambient Glow */}
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 p-3">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          
          <div className="flex min-w-0 items-center gap-2">
            
            {/* Sponsor Logo */}
            {currentSponsor?.sponsorLogo && (
              <div className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-lg
                border
                border-white/10
                bg-white/5
              ">
                <img
                  src={currentSponsor.sponsorLogo}
                  alt={currentSponsor.sponsorName || 'Sponsor'}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-widest
                  text-amber-400
                ">
                  {accentBadge ||
                    currentSponsor?.badgeText ||
                    'Sponsored'}
                </span>
              </div>

              <p className="
                truncate
                text-[10px]
                font-semibold
                text-slate-400
              ">
                {currentSponsor?.sponsorName}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close sponsored content"
            className="
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-white/10
              bg-white/5
              text-slate-400
              transition
              hover:border-white/20
              hover:bg-white/10
              hover:text-white
              focus:outline-none
              focus:ring-2
              focus:ring-amber-400/40
            "
          >
            <FiX className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="mt-2">
          <h3 className="
            max-w-[340px]
            text-sm
            font-extrabold
            leading-tight
            text-white
            line-clamp-2
          ">
            {currentSponsor?.title}
          </h3>

          {currentSponsor?.tagline && (
            <p className="
              mt-1
              max-w-[390px]
              text-[10px]
              font-medium
              leading-relaxed
              text-slate-400
              line-clamp-1
            ">
              {currentSponsor.tagline}
            </p>
          )}
        </div>

        {/* Bottom Row */}
        <div className="
          mt-3
          flex
          items-center
          gap-2
        ">
          
          {/* CTA */}
          <a
            href={currentSponsor?.targetUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleClick}
            className="
              inline-flex
              min-h-[32px]
              flex-1
              items-center
              justify-center
              gap-1.5
              rounded-lg
              bg-gradient-to-r
              from-amber-500
              to-orange-500
              px-3
              py-1.5
              text-[10px]
              font-black
              uppercase
              tracking-wide
              text-slate-950
              shadow-md
              shadow-amber-950/30
              transition
              hover:from-amber-400
              hover:to-orange-400
              active:scale-[0.98]
            "
          >
            <span className="truncate">
              {currentSponsor?.ctaText || 'View Offer'}
            </span>

            <FiExternalLink className="h-3 w-3 shrink-0" />
          </a>

          {/* Navigation */}
          {sponsorships.length > 1 && (
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous sponsor"
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-white/10
                  bg-white/5
                  text-slate-400
                  transition
                  hover:bg-white/10
                  hover:text-white
                "
              >
                <FiChevronLeft className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next sponsor"
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-white/10
                  bg-white/5
                  text-slate-400
                  transition
                  hover:bg-white/10
                  hover:text-white
                "
              >
                <FiChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Carousel Indicators */}
        {sponsorships.length > 1 && (
          <div className="
            mt-2
            flex
            items-center
            justify-center
            gap-1
          ">
            {sponsorships.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to sponsor ${idx + 1}`}
                className="p-1"
              >
                <span
                  className={`
                    block
                    h-1
                    rounded-full
                    transition-all
                    duration-300
                    ${
                      idx === currentIndex
                        ? 'w-4 bg-amber-400'
                        : 'w-1 bg-slate-600'
                    }
                  `}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SponsoredBannerCard;