'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FiMoreHorizontal,
  FiPlay,
  FiTrendingUp,
  FiActivity,
  FiChevronRight,
  FiRadio,
  FiAward,
  FiZap,
  FiShield,
  FiArrowRight,
  FiCheckCircle,
} from 'react-icons/fi';
import { FootballScreen } from './FootballScreen';
import { getNewsUrl, slugify } from '@/lib/slugUtils';

export function GoalmillsFootballDashboard() {
  const [activeSubTab, setActiveSubTab] = useState<'hub' | 'livescores'>('hub');
  const [tickerIndex, setTickerIndex] = useState(0);
  const [pulseNews, setPulseNews] = useState<
    { id?: string; _id?: string; tag: string; title: string; time: string }[]
  >([
    { id: 'football-1', tag: 'TRANSFER', title: 'Victor Osimhen signs landmark deal with €75M release clause', time: '10m ago' },
    { id: 'football-2', tag: 'UCL', title: 'Champions League Quarterfinal Draw announced: Blockbuster ties set', time: '25m ago' },
    { id: 'football-3', tag: 'EPL', title: 'Arsenal narrow gap at top of table after dramatic North London Derby', time: '1h ago' },
    { id: 'football-4', tag: 'EL CLÁSICO', title: 'Real Madrid vs Barcelona: Tactical team news and predicted lineups', time: '2h ago' },
    { id: 'football-5', tag: 'AFCON', title: 'CAF confirms host venues and official tournament schedule for 2025/26', time: '3h ago' },
  ]);

  const [liveMatches, setLiveMatches] = useState<any[]>([
    {
      id: 'm-1',
      league: 'Premier League • Matchday 28',
      status: '78\'',
      isLive: true,
      homeTeam: 'Man United',
      homeCode: 'MU',
      homeGoalScorer: 'B. Fernandes (60\')',
      awayTeam: 'Arsenal',
      awayCode: 'ARS',
      awayGoalScorer: 'B. Saka (76\')',
      score: '2 - 1',
      homePossession: 54,
      awayPossession: 46,
      homeXg: '1.82',
      awayXg: '1.45',
    },
    {
      id: 'm-2',
      league: 'La Liga • El Clásico',
      status: 'HT',
      isLive: true,
      homeTeam: 'Real Madrid',
      homeCode: 'RMA',
      homeGoalScorer: 'Vinicius Jr (32\')',
      awayTeam: 'Barcelona',
      awayCode: 'FCB',
      awayGoalScorer: 'Lamine Yamal (18\')',
      score: '1 - 1',
      homePossession: 49,
      awayPossession: 51,
      homeXg: '1.10',
      awayXg: '1.30',
    },
  ]);

  const [marqueeMatch, setMarqueeMatch] = useState<{
    league: string;
    stage: string;
    homeTeam: string;
    homeCode: string;
    awayTeam: string;
    awayCode: string;
    kickoff: string;
    venue: string;
    probability: string;
  }>({
    league: 'UEFA Champions League',
    stage: 'UCL Semi-Final',
    homeTeam: 'Man City',
    homeCode: 'MCFC',
    awayTeam: 'Real Madrid',
    awayCode: 'RMA',
    kickoff: '20:00 GMT',
    venue: 'Tomorrow • Etihad',
    probability: 'Win Probability: City 44% • Draw 28% • Madrid 28%',
  });

  const [transfers, setTransfers] = useState<any[]>([
    {
      id: 't-1',
      player: 'Victor Osimhen',
      summary: 'Napoli → Galatasaray (Permanent €75M)',
      tag: 'DONE DEAL',
      tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 't-2',
      player: 'Viktor Gyökeres',
      summary: 'Sporting CP → Arsenal (Talks Ongoing)',
      tag: 'HOT RUMOR',
      tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
  ]);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        const [newsRes, matchRes, transferRes] = await Promise.all([
          fetch('/api/news?sport=football&limit=8').catch(() => null),
          fetch('/api/football?met=Livescore').catch(() => null),
          fetch('/api/news?category=transfers&limit=3').catch(() => null),
        ]);

        if (newsRes && newsRes.ok) {
          const data = await newsRes.json();
          const items = Array.isArray(data) ? data : data?.news || data?.data;
          if (items && items.length > 0 && isMounted) {
            const formatted = items.map((item: any) => ({
              id: item._id || item.id,
              _id: item._id || item.id,
              slug: item.slug || slugify(item.title) || item._id,
              tag: (item.competition || item.category || item.tags?.[0] || 'FOOTBALL').toUpperCase(),
              title: item.title,
              time: item.createdAt ? `${Math.max(1, Math.floor((Date.now() - new Date(item.createdAt).getTime()) / 3600000))}h ago` : 'Recent',
            }));
            setPulseNews(formatted);
          }
        }

        let matches: any[] = [];
        if (matchRes && matchRes.ok) {
          const mData = await matchRes.json();
          matches = mData?.result || mData?.response || (Array.isArray(mData) ? mData : []);
        }

        if (matches.length === 0) {
          const fixRes = await fetch('/api/football?met=Fixtures').catch(() => null);
          if (fixRes && fixRes.ok) {
            const fData = await fixRes.json();
            matches = fData?.result || fData?.response || (Array.isArray(fData) ? fData : []);
          }
        }

        if (Array.isArray(matches) && matches.length > 0 && isMounted) {
          const mappedMatches = matches.slice(0, 2).map((m: any, idx: number) => {
            const home = m.event_home_team || m.homeTeam || 'Team A';
            const away = m.event_away_team || m.awayTeam || 'Team B';
            const score = m.event_final_result || m.event_ft_result || `${m.event_home_final_result ?? 0} - ${m.event_away_final_result ?? 0}`;
            const isLive = m.event_live === '1' || m.event_status === 'LIVE' || !isNaN(Number(m.event_status));

              return {
                id: m.event_key || `live-m-${idx}`,
                league: m.league_name || 'Premier League',
                status: m.event_status ? `${m.event_status}'` : 'LIVE',
                isLive,
                homeTeam: home,
                homeCode: home.substring(0, 3).toUpperCase(),
                homeGoalScorer: m.event_scorer || '',
                awayTeam: away,
                awayCode: away.substring(0, 3).toUpperCase(),
                awayGoalScorer: '',
                score,
                homePossession: 52,
                awayPossession: 48,
                homeXg: '1.45',
                awayXg: '1.20',
              };
            });
            setLiveMatches(mappedMatches);

            // Update marquee match
            const topM = matches[0];
            const topHome = topM.event_home_team || 'Man City';
            const topAway = topM.event_away_team || 'Real Madrid';
            setMarqueeMatch({
              league: topM.league_name || 'UEFA Champions League',
              stage: topM.league_round || 'Matchday Fixture',
              homeTeam: topHome,
              homeCode: topHome.substring(0, 4).toUpperCase(),
              awayTeam: topAway,
              awayCode: topAway.substring(0, 3).toUpperCase(),
              kickoff: topM.event_time || '20:00 GMT',
              venue: topM.event_stadium || 'Official Stadium',
              probability: `Win Probability: ${topHome.substring(0, 4)} 45% • Draw 25% • ${topAway.substring(0, 3)} 30%`,
            });
          }

        if (transferRes && transferRes.ok) {
          const tData = await transferRes.json();
          const tItems = Array.isArray(tData) ? tData : tData?.news || tData?.data;
          if (Array.isArray(tItems) && tItems.length > 0 && isMounted) {
            const mappedTransfers = tItems.slice(0, 2).map((item: any, idx: number) => ({
              id: item._id || item.id || `tr-${idx}`,
              player: item.title.split(/signs|joins|talks|deal/i)[0]?.trim() || item.title,
              summary: item.summary || item.excerpt || item.title,
              tag: idx === 0 ? 'DONE DEAL' : 'HOT RUMOR',
              tagColor: idx === 0
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30',
            }));
            setTransfers(mappedTransfers);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch football dashboard live data:', err);
      }
    }
    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (pulseNews.length === 0) return;
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % pulseNews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [pulseNews.length]);

  const currentItem = pulseNews[tickerIndex] || pulseNews[0];
  const newsLink = getNewsUrl(currentItem);

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-6 py-3.5 space-y-4">
      {/* ─── TOP FOOTBALL BREAKING WIRE TICKER ─── */}
      <div className="rounded-xl bg-[#0B172B]/90 border border-blue-500/25 p-2 sm:p-2.5 flex items-center justify-between gap-3 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            FOOTBALL PULSE
          </span>
          <div className="min-w-0 flex-1 flex items-center gap-2 text-xs">
            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-bold uppercase text-[9px]">
              {currentItem?.tag || 'EPL'}
            </span>
            <Link
              href={newsLink}
              className="text-white font-bold truncate text-xs hover:text-blue-400 hover:underline transition-colors flex-1"
            >
              {currentItem?.title}
            </Link>
            <span className="text-slate-500 text-[10px] hidden sm:inline flex-shrink-0">
              • {currentItem?.time}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setActiveSubTab(activeSubTab === 'hub' ? 'livescores' : 'hub')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all border ${
              activeSubTab === 'livescores'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-400 shadow-sm'
                : 'bg-blue-600/20 text-blue-300 border-blue-500/30 hover:bg-blue-600/30'
            }`}
          >
            {activeSubTab === 'hub' ? '⚡ Open LiveScore Screen' : '📊 Back to Football Hub'}
          </button>
        </div>
      </div>

      {activeSubTab === 'livescores' ? (
        <div className="rounded-2xl border border-blue-500/20 bg-[#091529]/90 p-3 sm:p-4 shadow-xl backdrop-blur-md">
          <FootballScreen />
        </div>
      ) : (
        /* ─── PRIMARY FOOTBALL INTELLIGENCE GRID ─── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* ─── LEFT COLUMN (col-span-7): MATCH TELEMETRY & TACTICAL RADAR ─── */}
          <div className="lg:col-span-7 space-y-4">
            {/* 1. LIVE FOOTBALL MATCHES IN-PLAY */}
            <div className="rounded-xl bg-[#09162C]/90 border border-blue-500/25 p-3 sm:p-4 shadow-lg backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-32 bg-blue-600/10 blur-3xl -z-10" />
              <div className="absolute bottom-0 left-1/3 w-64 h-32 bg-blue-500/5 blur-3xl -z-10" />

              <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <h3 className="text-xs font-black tracking-wider text-white uppercase flex items-center gap-2">
                    <span>LIVE MATCHES & SCORES</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                      In-Play
                    </span>
                  </h3>
                </div>
                <Link
                  href="/football"
                  className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <span>All Leagues</span>
                  <FiArrowRight size={11} />
                </Link>
              </div>

              <div className="space-y-3.5">
                {liveMatches.map((m) => (
                  <Link
                    href={`/matches/${m.id}`}
                    key={m.id}
                    className="block rounded-2xl bg-[#0E1F38] border border-blue-500/20 p-3.5 sm:p-4 hover:border-amber-400/40 transition-all duration-300 shadow-md group cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5 truncate pr-2 group-hover:text-amber-300 transition-colors">
                        <span className="text-amber-400">🏆</span> {m.league}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black tracking-wider flex items-center gap-1.5 animate-pulse flex-shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        {m.status || 'LIVE'}
                      </span>
                    </div>

                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
                      {/* Home Team */}
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-900/40 border border-blue-500/30 flex items-center justify-center text-xs font-black text-white shadow flex-shrink-0">
                          {m.homeCode}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-amber-300 transition-colors">{m.homeTeam}</div>
                          {m.homeGoalScorer && (
                            <div className="text-[10px] text-slate-400 truncate">{m.homeGoalScorer}</div>
                          )}
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div className="flex flex-col items-center justify-center px-3 sm:px-4 py-1.5 rounded-xl bg-slate-950/90 border border-amber-500/40 flex-shrink-0 min-w-[64px] sm:min-w-[76px] text-center shadow-inner">
                        <span className="text-base sm:text-lg font-black text-amber-400 tracking-tight leading-none">
                          {m.score}
                        </span>
                        <span className="text-[10px] font-bold text-amber-300 mt-0.5">{m.status}</span>
                      </div>

                      {/* Away Team */}
                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 min-w-0 text-right">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-amber-300 transition-colors">{m.awayTeam}</div>
                          {m.awayGoalScorer && (
                            <div className="text-[10px] text-slate-400 truncate">{m.awayGoalScorer}</div>
                          )}
                        </div>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-900/40 border border-red-400/30 flex items-center justify-center text-xs font-black text-white shadow flex-shrink-0">
                          {m.awayCode}
                        </div>
                      </div>
                    </div>

                    {/* Possession & xG Progress Bar */}
                    <div className="mt-3 pt-2.5 border-t border-white/5 space-y-1.5">
                      <div className="flex justify-between text-[10px] text-slate-300 font-semibold">
                        <span>Possession {m.homePossession}% • xG {m.homeXg}</span>
                        <span>{m.awayPossession}% • xG {m.awayXg}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden flex">
                        <div className="bg-gradient-to-r from-blue-500 to-sky-400 h-full" style={{ width: `${m.homePossession}%` }} />
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full" style={{ width: `${m.awayPossession}%` }} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 2. TACTICAL RADAR & EXPECTED GOALS (xG) MATRIX */}
            <div className="rounded-2xl bg-[#09162C]/90 border border-blue-500/25 p-4 sm:p-5 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-blue-500/20 text-blue-300 text-xs">📊</span>
                  <h3 className="text-sm font-black tracking-wider text-white uppercase">
                    TACTICAL PERFORMANCE & PASSING NETWORK
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 font-mono">
                  Matchday Analytics
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Metric 1: Passing Accuracy */}
                <div className="p-3.5 rounded-2xl bg-[#0E1F38] border border-blue-500/15 flex flex-col items-center justify-center text-center shadow-inner">
                  <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">
                    89.4%
                  </span>
                  <span className="text-xs font-bold text-white mt-1">Passing Accuracy</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">542 / 606 Completed</span>
                </div>

                {/* Metric 2: High Press Turnover Efficiency */}
                <div className="p-3.5 rounded-2xl bg-[#0E1F38] border border-blue-500/15 flex flex-col items-center justify-center text-center shadow-inner">
                  <span className="text-2xl sm:text-3xl font-black text-amber-400">
                    14
                  </span>
                  <span className="text-xs font-bold text-white mt-1">High Turnovers</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Final Third Ball Wins</span>
                </div>

                {/* Metric 3: xG Difference */}
                <div className="p-3.5 rounded-2xl bg-[#0E1F38] border border-blue-500/15 flex flex-col items-center justify-center text-center shadow-inner">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                    +0.84
                  </span>
                  <span className="text-xs font-bold text-white mt-1">xG Delta</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Expected Threat Index</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── RIGHT COLUMN (col-span-5): VIP MATCH OF THE DAY, TRANSFERS & LEAGUES ─── */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. VIP MATCH OF THE DAY SHOWDOWN */}
            <div className="rounded-2xl bg-gradient-to-br from-[#0D213F] via-[#09172E] to-[#060E1C] border border-amber-500/30 p-4 sm:p-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
                <span className="flex items-center gap-1.5 text-xs font-black uppercase text-amber-400 tracking-wider">
                  <FiAward /> MATCH OF THE WEEK
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {marqueeMatch.stage}
                </span>
              </div>

              <div className="text-center py-2 space-y-2">
                <div className="flex items-center justify-around">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-white/15 p-2 flex items-center justify-center shadow-lg">
                      <span className="text-xs font-black text-blue-400">{marqueeMatch.homeCode}</span>
                    </div>
                    <span className="text-xs font-bold text-white truncate max-w-[90px]">{marqueeMatch.homeTeam}</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-xs font-black text-amber-400 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-xl">
                      {marqueeMatch.kickoff}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 font-semibold">{marqueeMatch.venue}</span>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-white/15 p-2 flex items-center justify-center shadow-lg">
                      <span className="text-xs font-black text-amber-400">{marqueeMatch.awayCode}</span>
                    </div>
                    <span className="text-xs font-bold text-white truncate max-w-[90px]">{marqueeMatch.awayTeam}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold">{marqueeMatch.probability}</span>
                </div>
              </div>
            </div>

            {/* 2. CONFIRMED TRANSFERS SNIPPET */}
            <div className="rounded-2xl bg-[#09162C]/90 border border-blue-500/25 p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FiTrendingUp className="text-amber-400" />
                  <span>Transfer News & Rumours</span>
                </h3>
                <Link href="/transfers" className="text-xs font-bold text-amber-400 hover:underline">
                  View All →
                </Link>
              </div>

              <div className="space-y-2.5">
                {transfers.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-[#0E1F38] border border-blue-500/15 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{t.player}</h4>
                      <p className="text-[10px] text-slate-400">{t.summary}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${t.tagColor}`}>
                      {t.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. MAJOR COMPETITIONS DIRECTORY */}
            <div className="rounded-2xl bg-[#09162C]/90 border border-blue-500/25 p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FiShield className="text-blue-400" />
                  <span>Popular Football Competitions</span>
                </h3>
                <span className="text-[10px] text-blue-300 font-mono font-bold">Tier 1</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Premier League', slug: 'premier-league', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
                  { name: 'Champions League', slug: 'champions-league', flag: '⭐' },
                  { name: 'La Liga', slug: 'la-liga', flag: '🇪🇸' },
                  { name: 'Serie A', slug: 'serie-a', flag: '🇮🇹' },
                  { name: 'Bundesliga', slug: 'bundesliga', flag: '🇩🇪' },
                  { name: 'CAF Champions', slug: 'caf-champions-league', flag: '🌍' },
                ].map((comp) => (
                  <Link
                    key={comp.slug}
                    href={`/football/${comp.slug}`}
                    className="p-2.5 rounded-xl bg-[#0E1F38] hover:bg-blue-600/20 border border-blue-500/15 hover:border-amber-400/40 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-2"
                  >
                    <span>{comp.flag}</span>
                    <span className="truncate">{comp.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
