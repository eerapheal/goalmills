'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { FootballOdds } from '@goalmills/types';
import {
  OddsFormat,
  MarketComparison,
  extractAllMarketComparisons,
  formatOdds,
} from '@/lib/betting/oddsComparisonEngine';
import {
  sortBookmakerEntries,
  BookmakerSortOption,
  DEFAULT_COMMERCIAL_DISCLOSURE,
} from '@/lib/betting/commercialPlacement';
import { buildSecureAffiliateRedirectUrl } from '@/lib/betting/affiliateEngine';
import { isBettingFeatureEnabled } from '@/lib/betting/bettingFeatureFlags';

export interface OddsComparisonMatrixProps {
  eventId?: string | number;
  homeTeam: string;
  awayTeam: string;
  rawOdds?: FootballOdds[];
  initialFormat?: OddsFormat;
  className?: string;
}

export const OddsComparisonMatrix: React.FC<OddsComparisonMatrixProps> = ({
  eventId,
  homeTeam,
  awayTeam,
  rawOdds = [],
  initialFormat = 'decimal',
  className = '',
}) => {
  const [format, setFormat] = useState<OddsFormat>(initialFormat);
  const [selectedMarketKey, setSelectedMarketKey] = useState<string>('1X2');
  const [sortBy, setSortBy] = useState<BookmakerSortOption>('BEST_ODDS');
  const [activeOutcomeFilter, setActiveOutcomeFilter] = useState<string | undefined>(undefined);
  const [openingOddsMap, setOpeningOddsMap] = useState<Record<string, Record<string, number>>>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch opening odds / API enrichment if eventId is provided
  useEffect(() => {
    if (!eventId) return;

    let isMounted = true;
    const fetchMatrixData = async () => {
      try {
        const res = await fetch(`/api/v1/betting/odds/${eventId}?format=${format}`);
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data?.success) {
          // If server provided opening odds or markets, we can sync
        }
      } catch (e) {
        // Silently fall back to rawOdds
      }
    };

    fetchMatrixData();
    return () => {
      isMounted = false;
    };
  }, [eventId, format]);

  // Compile all available markets from raw odds data
  const markets = useMemo(() => {
    return extractAllMarketComparisons(rawOdds, {
      homeTeam,
      awayTeam,
      format,
      openingOddsMap,
    });
  }, [rawOdds, homeTeam, awayTeam, format, openingOddsMap]);

  const marketKeys = Object.keys(markets);

  // Set active market safely
  const activeMarketKey = markets[selectedMarketKey] ? selectedMarketKey : marketKeys[0] || '1X2';
  const currentMarket: MarketComparison | undefined = markets[activeMarketKey];

  // Sort bookmakers in current market based on active sort option
  const sortedBookmakers = useMemo(() => {
    if (!currentMarket) return [];
    return sortBookmakerEntries(currentMarket.bookmakers, sortBy, activeOutcomeFilter);
  }, [currentMarket, sortBy, activeOutcomeFilter]);

  const showAffiliate = isBettingFeatureEnabled('affiliateLinks');
  const showSponsored = isBettingFeatureEnabled('sponsoredBookmakers');

  if (!rawOdds || rawOdds.length === 0 || marketKeys.length === 0) {
    return (
      <div className={`bg-[#0f172a] rounded-2xl border border-[#1e293b] p-12 text-center text-slate-400 text-sm ${className}`}>
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center text-xl">
          🎲
        </div>
        <p className="font-semibold text-white mb-1">Odds Comparison Unavailable</p>
        <p className="text-xs text-slate-400">Bookmaker odds have not yet opened for this match.</p>
      </div>
    );
  }

  const marketTabTitles: Record<string, string> = {
    '1X2': 'Match Winner (1X2)',
    'DOUBLE_CHANCE': 'Double Chance',
    'OVER_UNDER_2_5': 'Over / Under 2.5',
    'BOTH_TEAMS_TO_SCORE': 'Both Teams To Score',
    'OVER_UNDER_1_5': 'Over / Under 1.5',
    'OVER_UNDER_3_5': 'Over / Under 3.5',
    'DRAW_NO_BET': 'Draw No Bet',
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Header & Controls Panel */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
          {/* Title & Stats */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">🎲</span>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Odds Comparison Engine
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Comparing {sortedBookmakers.length} verified operators • Mathematical best-odds detection
            </p>
          </div>

          {/* Controls: Odds Format & Sorting */}
          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
            {/* Format Switcher */}
            <div className="flex items-center bg-black/40 border border-[#1e293b] rounded-lg p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFormat('decimal')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  format === 'decimal'
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Decimal Odds (e.g. 2.10)"
              >
                DEC
              </button>
              <button
                type="button"
                onClick={() => setFormat('fractional')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  format === 'fractional'
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Fractional Odds (e.g. 11/10)"
              >
                FRAC
              </button>
              <button
                type="button"
                onClick={() => setFormat('american')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  format === 'american'
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="American / Moneyline (e.g. +110)"
              >
                US
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider hidden sm:inline">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as BookmakerSortOption)}
                aria-label="Sort bookmakers"
                className="bg-black/40 border border-[#1e293b] text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="BEST_ODDS">Best Odds (Top Value)</option>
                <option value="FEATURED">Featured Partners</option>
                <option value="PAYOUT">Highest Payout %</option>
                <option value="ALPHABETICAL">Bookmaker Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Market Navigation Tabs */}
        <div className="flex items-center gap-1.5 pt-3 overflow-x-auto scrollbar-none pb-1">
          {marketKeys.map((key) => {
            const isActive = activeMarketKey === key;
            const market = markets[key];
            const title = marketTabTitles[key] || market?.marketName || key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedMarketKey(key);
                  setActiveOutcomeFilter(undefined);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-[#1e293b]'
                }`}
              >
                <span>{title}</span>
                {market?.averagePayoutPercent && (
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded ${
                      isActive ? 'bg-black/30 text-blue-100' : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {market.averagePayoutPercent}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Matrix Table */}
      {currentMarket && (
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl">
          {/* Best Odds Banner across Outcomes */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent px-5 py-2.5 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
                Market Best Odds
              </span>
            </div>
            <div className="flex items-center gap-3">
              {currentMarket.outcomes.map((outcome) => {
                const maxPrice = currentMarket.bestOdds[outcome];
                return (
                  <button
                    key={outcome}
                    type="button"
                    onClick={() =>
                      setActiveOutcomeFilter(activeOutcomeFilter === outcome ? undefined : outcome)
                    }
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] transition-colors border ${
                      activeOutcomeFilter === outcome
                        ? 'bg-amber-400 text-black border-amber-300 font-black'
                        : 'bg-amber-400/10 text-amber-300 border-amber-400/20 hover:bg-amber-400/20 font-bold'
                    }`}
                    title={`Click to sort bookmakers by ${outcome}`}
                  >
                    <span className="opacity-80">{outcome}:</span>
                    <span className="font-mono">{maxPrice ? formatOdds(maxPrice, format) : '-'}</span>
                    {activeOutcomeFilter === outcome && <span>▼</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Odds Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#1e293b] text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/[0.01]">
                  <th className="px-5 py-3.5 min-w-[160px]">Bookmaker</th>
                  {currentMarket.outcomes.map((outcome) => (
                    <th
                      key={outcome}
                      onClick={() =>
                        setActiveOutcomeFilter(
                          activeOutcomeFilter === outcome ? undefined : outcome
                        )
                      }
                      className={`px-3 py-3.5 text-center cursor-pointer select-none transition-colors hover:text-white ${
                        activeOutcomeFilter === outcome ? 'text-amber-400 font-extrabold' : ''
                      }`}
                      title="Click to sort by this outcome"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>{outcome}</span>
                        {activeOutcomeFilter === outcome && (
                          <span className="text-[9px] text-amber-400">▼</span>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-3.5 text-center hidden md:table-cell">Payout</th>
                  {showAffiliate && <th className="px-5 py-3.5 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {sortedBookmakers.map((b) => {
                  const redirectUrl = buildSecureAffiliateRedirectUrl({
                    bookmakerId: b.bookmakerId,
                    campaign: 'match_details',
                    placement: 'odds_comparison_matrix',
                    eventId: eventId ? String(eventId) : undefined,
                  });

                  return (
                    <tr
                      key={b.bookmakerId}
                      className={`transition-colors ${
                        b.isFeatured && showSponsored
                          ? 'bg-blue-950/20 hover:bg-blue-950/30'
                          : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      {/* Bookmaker Brand Cell */}
                      <td className="px-5 py-3.5 font-bold text-white">
                        <div className="flex items-center gap-2.5">
                          {b.bookmakerLogo ? (
                            <img
                              src={b.bookmakerLogo}
                              alt={b.bookmakerName}
                              className="w-5 h-5 rounded-md object-contain bg-white/10 p-0.5 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-[10px] font-bold text-slate-400 flex-shrink-0">
                              {b.bookmakerName?.[0] || 'B'}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-white text-xs">{b.bookmakerName}</span>
                            {b.isFeatured && showSponsored && (
                              <span className="text-[9px] text-blue-400 font-semibold uppercase tracking-wider">
                                Featured Partner
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Outcome Quotes */}
                      {currentMarket.outcomes.map((outcome) => {
                        const quote = b.outcomes[outcome];
                        if (!quote || quote.price <= 1.0) {
                          return (
                            <td key={outcome} className="px-3 py-3.5 text-center text-slate-600 font-mono">
                              -
                            </td>
                          );
                        }

                        return (
                          <td key={outcome} className="px-3 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {/* Price Pill */}
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-mono text-xs font-extrabold transition-transform ${
                                  quote.isBest
                                    ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/40 ring-1 ring-amber-300 scale-105'
                                    : 'bg-white/[0.04] text-slate-200 border border-[#1e293b]'
                                }`}
                              >
                                {quote.formattedPrice}
                                {quote.isBest && (
                                  <span className="text-[8px] font-black bg-black/80 text-amber-300 px-1 rounded uppercase tracking-tight">
                                    BEST
                                  </span>
                                )}
                              </span>

                              {/* Movement Indicator */}
                              {quote.movement === 'UP' && (
                                <span
                                  className="text-emerald-400 text-[10px] font-bold"
                                  title={`Lengthened (${quote.changePercent ? '+' + quote.changePercent + '%' : 'Up'})`}
                                >
                                  ▲
                                </span>
                              )}
                              {quote.movement === 'DOWN' && (
                                <span
                                  className="text-rose-400 text-[10px] font-bold"
                                  title={`Shortened (${quote.changePercent ? quote.changePercent + '%' : 'Down'})`}
                                >
                                  ▼
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* Payout % */}
                      <td className="px-3 py-3.5 text-center hidden md:table-cell">
                        {b.payoutPercent ? (
                          <span
                            className={`text-[11px] font-mono font-bold ${
                              b.payoutPercent >= 96
                                ? 'text-emerald-400'
                                : b.payoutPercent >= 93
                                ? 'text-slate-300'
                                : 'text-slate-500'
                            }`}
                          >
                            {b.payoutPercent}%
                          </span>
                        ) : (
                          <span className="text-slate-600 text-xs">-</span>
                        )}
                      </td>

                      {/* Bet Now CTA */}
                      {showAffiliate && (
                        <td className="px-5 py-3.5 text-right">
                          <a
                            href={redirectUrl}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-all shadow-sm shadow-blue-600/30 hover:scale-105 active:scale-95"
                          >
                            <span>Bet Now</span>
                            <span className="text-[10px]">&rarr;</span>
                          </a>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Commercial Disclosure & Responsible Gambling Notice */}
      <div className="bg-[#0b1120] border border-[#1e293b] rounded-xl p-3.5 text-slate-400 text-[11px] leading-relaxed flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-black text-[10px]">
            18+
          </span>
          <p>
            {DEFAULT_COMMERCIAL_DISCLOSURE.responsibleGamblingText}{' '}
            <span className="hidden sm:inline">{DEFAULT_COMMERCIAL_DISCLOSURE.body}</span>
          </p>
        </div>
        <a
          href={DEFAULT_COMMERCIAL_DISCLOSURE.helplineUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="text-blue-400 hover:text-blue-300 underline font-semibold whitespace-nowrap text-[11px]"
        >
          BeGambleAware.org
        </a>
      </div>
    </div>
  );
};

export default OddsComparisonMatrix;
