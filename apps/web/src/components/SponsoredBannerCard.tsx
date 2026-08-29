'use client';

import React, { useState, useEffect } from 'react';
import { FiExternalLink, FiAward, FiTag } from 'react-icons/fi';
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
  const [sponsorship, setSponsorship] = useState<any | null>(null);
  const [trackedImpression, setTrackedImpression] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchSponsor = async () => {
      try {
        const res = await fetch(`/api/sponsorships?placement=${placement}&sport=${sport}`);
        const data = await res.json();
        if (data.success && data.sponsorships && data.sponsorships.length > 0 && isMounted) {
          // Select highest priority or random sponsor among active list
          setSponsorship(data.sponsorships[0]);
        }
      } catch (err) {
        console.error('Error loading sponsorship banner:', err);
      }
    };

    fetchSponsor();
    return () => {
      isMounted = false;
    };
  }, [placement, sport]);

  useEffect(() => {
    if (sponsorship && sponsorship._id && !trackedImpression) {
      setTrackedImpression(true);
      fetch(`/api/sponsorships/${sponsorship._id}/track?type=impression`, {
        method: 'POST',
      }).catch(() => {});
    }
  }, [sponsorship, trackedImpression]);

  if (!sponsorship) {
    return null;
  }

  const handleClick = () => {
    if (sponsorship._id) {
      fetch(`/api/sponsorships/${sponsorship._id}/track?type=click`, {
        method: 'POST',
      }).catch(() => {});
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-[#141C2B] via-[#1E293B] to-[#121A28] p-4 sm:p-5 shadow-xl ${className}`}
    >
      {/* Background Accent Glow */}
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {sponsorship.imageUrl ? (
            <img
              src={sponsorship.imageUrl}
              alt={sponsorship.sponsorName}
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl object-cover border border-amber-500/30 shadow-md flex-shrink-0"
            />
          ) : (
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/30 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-sm flex-shrink-0">
              <FiAward className="w-6 h-6" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider text-amber-300">
                {sponsorship.badgeText || 'SPONSORED'}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {sponsorship.sponsorName}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white mt-1">
              {sponsorship.title}
            </h4>
            {sponsorship.tagline && (
              <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                {sponsorship.tagline}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <a
            href={sponsorship.targetUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-950/50 transition transform active:scale-95 whitespace-nowrap"
          >
            <span>{sponsorship.ctaText || 'Claim Offer'}</span>
            <FiExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default SponsoredBannerCard;
