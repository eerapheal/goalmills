'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { footballRoutes, buildMatchSlug } from '@/lib/slugUtils';
import {
  FiMoreHorizontal,
  FiPlay,
  FiTrendingUp,
  FiActivity,
  FiChevronRight,
  FiChevronLeft,
  FiRadio,
  FiAward,
  FiZap,
} from 'react-icons/fi';
import { FaFire } from 'react-icons/fa6';
import { getNewsUrl, slugify } from '@/lib/slugUtils';

export function GoalmillsLiveDashboard({
  onSelectTab,
}: {
  onSelectTab?: (tab: string) => void;
}) {
  const [activeTab, setActiveTab] = useState('LIVE SCORES');
  const [tickerIndex, setTickerIndex] = useState(0);
  const [pulseNews, setPulseNews] = useState<
    { id?: string; _id?: string; tag: string; title: string; time: string }[]
  >([
    { id: 'live-1', tag: 'TRANSFER', title: 'Mbappe to Real Madrid: Behind the scenes of landmark contract signing', time: '10m ago' },
    { id: 'live-2', tag: 'EPL', title: 'Arsenal narrow gap at top of table after dramatic North London Derby', time: '25m ago' },
    { id: 'live-3', tag: 'NBA', title: 'Lakers rally in 4th quarter against Celtics in historic thriller', time: '1h ago' },
    { id: 'live-4', tag: 'CRICKET', title: 'India set 343 target in ICC Champions Trophy clash', time: '2h ago' },
    { id: 'live-5', tag: 'F1', title: 'Max Verstappen Clinches Thrilling Monaco GP Victory with precision pit strategy', time: '3h ago' },
  ]);

  const [liveFootballMatches, setLiveFootballMatches] = useState<any[]>([
    {
      id: 'lf-1',
      league: 'Premier League',
      homeTeam: 'Man United',
      homeCode: 'MU',
      homeScorer: 'R. Fernandes (60\')',
      awayTeam: 'Arsenal',
      awayCode: 'ARS',
      awayScorer: 'B. Saka (76\')',
      score: '2 - 1',
      time: '(78\')',
      possession: 54,
    },
    {
      id: 'lf-2',
      league: 'La Liga • El Clásico',
      homeTeam: 'Real Madrid',
      homeCode: 'RMA',
      homeScorer: 'Vinicius (32\')',
      awayTeam: 'Barcelona',
      awayCode: 'FCB',
      awayScorer: 'Yamal (18\')',
      score: '1 - 1',
      time: '(45+2\')',
      possession: 49,
    },
  ]);

  const [liveCricket, setLiveCricket] = useState<any>({
    title: 'India vs Australia (T20I)',
    subtitle: 'ICC Champions Trophy • 2nd Inning',
    score: 'IND: 168/4',
    overs: '(17.5 ov • CRR 9.42)',
    batsman1: { name: 'H. Pandya*', r: '42', b: '21', f4: '3', f6: '2', sr: '200.0' },
    batsman2: { name: 'R. Jadeja', r: '18', b: '12', f4: '1', f6: '1', sr: '150.0' },
    comm1: { over: '17.5', text: 'Maxwell to Hardik — 4 runs! Driven through extra cover.' },
    comm2: { over: '17.4', text: 'Maxwell to Jadeja — Single taken towards long on.' },
  });

  const [liveStandings, setLiveStandings] = useState<any[]>([
    { rank: 1, code: 'ARS', name: 'Arsenal', p: 33, w: 23, d: 5, l: 5, gd: '+48', pts: 74 },
    { rank: 2, code: 'MCI', name: 'Man City', p: 32, w: 22, d: 7, l: 3, gd: '+45', pts: 73 },
    { rank: 3, code: 'LIV', name: 'Liverpool', p: 33, w: 21, d: 8, l: 4, gd: '+38', pts: 71 },
  ]);

  const [videoHighlights, setVideoHighlights] = useState<any[]>([
    { id: 'v-1', title: 'Mbappe\'s Stunning Solo Goal vs Lille', duration: '03:45', sport: 'football' },
    { id: 'v-2', title: 'Last Second Buzzer Beater - NBA Finals', duration: '01:20', sport: 'basketball' },
    { id: 'v-3', title: 'Kohli\'s Match Winning Six in Final Over', duration: '04:10', sport: 'cricket' },
  ]);

  const [basketballStats, setBasketballStats] = useState<any>({
    matchName: 'Lakers vs Celtics (4th Qtr 3:12)',
    efficiency: 88,
    starPlayer: 'LeBron James (+14)',
    fg: '52.4%',
    reb: '46 REB',
    totalPts: '58 PTS',
  });

  useEffect(() => {
    let isMounted = true;
    async function loadLivePulseDashboard() {
      try {
        const [newsRes, footRes, cricRes, standRes, vidRes] = await Promise.all([
          fetch('/api/news?limit=8').catch(() => null),
          fetch('/api/football?met=Livescore').catch(() => null),
          fetch('/api/cricket?met=Livescore').catch(() => null),
          fetch('/api/football?met=Standings&leagueId=152').catch(() => null),
          fetch('/api/videos?limit=3').catch(() => null),
        ]);

        if (newsRes && newsRes.ok) {
          const data = await newsRes.json();
          const items = Array.isArray(data) ? data : data?.news || data?.data;
          if (items && items.length > 0 && isMounted) {
            const formatted = items.map((item: any) => ({
              id: item._id || item.id,
              _id: item._id || item.id,
              slug: item.slug || slugify(item.title) || item._id,
              tag: (item.competition || item.sport || item.category || 'LIVE').toUpperCase(),
              title: item.title,
              time: item.createdAt ? `${Math.max(1, Math.floor((Date.now() - new Date(item.createdAt).getTime()) / 3600000))}h ago` : 'Recent',
            }));
            setPulseNews(formatted);
          }
        }

        let matches: any[] = [];
        if (footRes && footRes.ok) {
          const fData = await footRes.json();
          matches = fData?.result || fData?.response || (Array.isArray(fData) ? fData : []);
        }

        if (matches.length === 0) {
          const fixRes = await fetch('/api/football?met=Fixtures').catch(() => null);
          if (fixRes && fixRes.ok) {
            const fd = await fixRes.json();
            matches = fd?.result || fd?.response || (Array.isArray(fd) ? fd : []);
          }
        }

        if (Array.isArray(matches) && matches.length > 0 && isMounted) {
          const mapped = matches.slice(0, 2).map((m: any, idx: number) => {
            const home = m.event_home_team || m.homeTeam || 'Home';
            const away = m.event_away_team || m.awayTeam || 'Away';
            const score = m.event_final_result || m.event_ft_result || `${m.event_home_final_result ?? 0} - ${m.event_away_final_result ?? 0}`;
            return {
              id: m.event_key || `lf-${idx}`,
              league: m.league_name || 'Premier League',
              homeTeam: home,
              homeCode: home.substring(0, 3).toUpperCase(),
              home_team_key: m.home_team_key,
              home_team_logo: m.home_team_logo,
              homeScorer: m.event_scorer || '',
              awayTeam: away,
              awayCode: away.substring(0, 3).toUpperCase(),
              away_team_key: m.away_team_key,
              away_team_logo: m.away_team_logo,
              awayScorer: '',
              score,
              time: m.event_status ? `(${m.event_status}')` : 'LIVE',
              possession: 52,
            };
          });
          setLiveFootballMatches(mapped);
        }

        if (cricRes && cricRes.ok) {
          const cData = await cricRes.json();
          const cMatches = cData?.result || (Array.isArray(cData) ? cData : []);
          if (Array.isArray(cMatches) && cMatches.length > 0 && isMounted) {
            const topC = cMatches[0];
            setLiveCricket({
              title: `${topC.event_home_team || 'IND'} vs ${topC.event_away_team || 'AUS'}`,
              subtitle: topC.league_name || 'ICC Champions Trophy',
              score: topC.event_home_final_result || '168/4',
              overs: topC.event_status || '(Live Inning)',
              batsman1: { name: 'Top Batsman*', r: '42', b: '21', f4: '3', f6: '2', sr: '200.0' },
              batsman2: { name: 'Partner', r: '18', b: '12', f4: '1', f6: '1', sr: '150.0' },
              comm1: { over: '17.5', text: `${topC.event_home_team || 'Team'} in command of the run chase.` },
              comm2: { over: '17.4', text: 'Good length delivery rotated for a single.' },
            });
          }
        }

        if (standRes && standRes.ok) {
          const sData = await standRes.json();
          const table = sData?.result?.total || sData?.standings || (Array.isArray(sData?.result) ? sData.result : []);
          if (Array.isArray(table) && table.length > 0 && isMounted) {
            const mappedStandings = table.slice(0, 3).map((row: any, idx: number) => {
              const name = row.standing_team || row.team_name || row.team?.name || `Team ${idx + 1}`;
              return {
                rank: row.standing_place || row.rank || idx + 1,
                code: name.substring(0, 3).toUpperCase(),
                name,
                p: row.standing_P || row.played || 33,
                w: row.standing_W || row.win || 22,
                d: row.standing_D || row.draw || 5,
                l: row.standing_L || row.lose || 4,
                gd: row.standing_GD ? `+${row.standing_GD}` : '+35',
                pts: row.standing_PTS || row.points || 70,
              };
            });
            setLiveStandings(mappedStandings);
          }
        }

        if (vidRes && vidRes.ok) {
          const vData = await vidRes.json();
          const vItems = Array.isArray(vData) ? vData : vData?.videos || vData?.result || [];
          if (Array.isArray(vItems) && vItems.length > 0 && isMounted) {
            const mappedVids = vItems.slice(0, 3).map((v: any, idx: number) => ({
              id: v._id || v.id || `v-${idx}`,
              title: v.title || 'Match Highlight Recap',
              duration: v.duration || '03:30',
              thumbnail: v.thumbnailUrl || v.thumbnail,
              sport: v.sport || 'football',
            }));
            setVideoHighlights(mappedVids);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch live pulse news & dashboard feeds:', err);
      }
    }
    loadLivePulseDashboard();
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

  const currentPulse = pulseNews[tickerIndex] || pulseNews[0];
  const pulseLink = getNewsUrl(currentPulse);

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-6 py-3.5 space-y-4">
      {/* ─── TOP LIVE PULSE BAR ─── */}
      <div className="rounded-xl bg-[#0B172B]/90 border border-blue-500/25 p-2 sm:p-2.5 flex flex-col md:flex-row items-center justify-between gap-2 shadow-lg backdrop-blur-md min-h-[46px]">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="min-w-0 flex-col md:flex-row flex items-center gap-2 text-xs">
            <Link
              href={pulseLink}
              className="text-white font-bold truncate text-xs hover:text-blue-400 hover:underline transition-colors flex-1"
            >
              {currentPulse?.title}
            </Link>
            <span className="text-slate-300 text-[10px] hidden sm:inline flex-shrink-0 font-medium">
              • {currentPulse?.time}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onSelectTab?.('football')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all border bg-blue-600/20 text-blue-300 border-blue-500/30 hover:bg-blue-600/30"
          >
            Football Hub
          </button>
        </div>
      </div>

      {/* ─── ROW 1: PRIMARY SPORTS INTELLIGENCE GRID ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ─── LEFT COLUMN (col-span-6): FOOTBALL & BASKETBALL ─── */}
        <div className="lg:col-span-6 space-y-4">
          {/* 1. LIVE FOOTBALL SCORES CARD */}
          <div className="rounded-xl bg-[#0E1A29]/90 border border-blue-500/20 p-3 sm:p-4 shadow-lg backdrop-blur-md relative overflow-hidden">
            {/* Ambient subtle glow */}
            <div className="absolute top-0 right-0 w-64 h-32 bg-blue-600/5 blur-3xl -z-10" />

            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-xs font-black tracking-wider text-slate-200 uppercase">
                  Live
                </h3>
              </div>
              <button
                onClick={() => onSelectTab?.('football')}
                className="text-slate-400 hover:text-amber-400 transition p-1"
                aria-label="Options"
              >
                <FiMoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {liveFootballMatches.map((m) => (
                <Link
                  href={footballRoutes.matchFromEvent({ event_home_team: m.homeTeam, event_away_team: m.awayTeam, event_date: new Date().toISOString().split('T')[0], event_key: m.id })}
                  key={m.id}
                  className="block rounded-xl bg-[#142336] border border-white/5 p-3 sm:p-4 hover:border-amber-500/30 hover:bg-[#192b42] transition duration-300 group cursor-pointer"
                >
                  {/* Header info (League name, live status badge) */}
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-2.5">
                    <span className="font-semibold text-slate-200 truncate pr-2">{m.league}</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[9px] sm:text-[10px] font-black tracking-wider flex items-center gap-1.5 animate-pulse flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      LIVE
                    </span>
                  </div>

                  {/* Match Body */}
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 sm:gap-3">
                    {/* Home Team */}
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      className="inline-block"
                    >
                      <Link
                        href={footballRoutes.teamFromName(m.homeTeam)}
                        className="flex items-center gap-1.5 sm:gap-3 min-w-0 hover:text-blue-400"
                      >
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-900/80 border border-white/10 p-0.5 flex items-center justify-center shadow flex-shrink-0 transition-colors hover:border-blue-400/40">
                          {m.home_team_logo ? (
                            <img
                              src={m.home_team_logo}
                              alt={m.homeTeam}
                              className="h-full w-full object-contain rounded-full"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-[7px] sm:text-[9px] font-black text-blue-400">
                              {m.homeCode}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-[11px] sm:text-sm text-white truncate hover:text-blue-300 transition-colors">{m.homeTeam}</div>
                          {m.homeScorer && (
                            <div className="hidden sm:block text-[9px] sm:text-[10px] text-slate-300 truncate">{m.homeScorer}</div>
                          )}
                        </div>
                      </Link>
                    </span>

                    {/* Score & Time */}
                    <div className="flex flex-row sm:flex-col items-center justify-center gap-1.5 sm:gap-0 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg bg-slate-950/80 border border-amber-500/30 flex-shrink-0 min-w-[56px] sm:min-w-[68px] text-center shadow-inner">
                      <span className="text-xs sm:text-lg font-black text-amber-400 tracking-tight leading-none">
                        {m.score}
                      </span>
                      <span className="text-[8px] sm:text-[10px] font-bold text-slate-300">{m.time}</span>
                    </div>

                    {/* Away Team */}
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      className="inline-block text-right"
                    >
                      <Link
                        href={footballRoutes.teamFromName(m.awayTeam)}
                        className="flex items-center justify-end gap-1.5 sm:gap-3 min-w-0 hover:text-blue-400"
                      >
                        <div className="min-w-0 flex-1 text-right">
                          <div className="font-bold text-[11px] sm:text-sm text-white truncate hover:text-blue-300 transition-colors">{m.awayTeam}</div>
                          {m.awayScorer && (
                            <div className="hidden sm:block text-[9px] sm:text-[10px] text-slate-300 truncate text-right">{m.awayScorer}</div>
                          )}
                        </div>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-900/80 border border-white/10 p-0.5 flex items-center justify-center shadow flex-shrink-0 transition-colors hover:border-blue-400/40">
                          {m.away_team_logo ? (
                            <img
                              src={m.away_team_logo}
                              alt={m.awayTeam}
                              className="h-full w-full object-contain rounded-full"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-[7px] sm:text-[9px] font-black text-blue-400">
                              {m.awayCode}
                            </span>
                          )}
                        </div>
                      </Link>
                    </span>
                  </div>

                  {/* Timeline / Possession Progress Bar - Hidden on mobile viewports */}
                  <div className="hidden sm:block mt-2.5 pt-2 border-t border-white/5">
                    <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-300 mb-1 font-medium">
                      <span>Possession {m.possession}%</span>
                      <span>{100 - m.possession}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                      <div className="bg-amber-400 h-full" style={{ width: `${m.possession}%` }} />
                      <div className="bg-slate-700 h-full" style={{ width: `${100 - m.possession}%` }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 2. BASKETBALL ANALYTICS CARD */}
          <div className="rounded-2xl bg-[#0E1A29]/90 border border-amber-500/20 p-4 sm:p-5 shadow-xl shadow-amber-950/20 backdrop-blur-md">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3 sm:mb-4 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-amber-500/10 text-amber-400 text-xs">🏀</span>
                <h3 className="text-sm font-black tracking-wider text-slate-200 uppercase">
                  BASKETBALL ANALYTICS
                </h3>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                {basketballStats.matchName}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Radial Player Efficiency */}
              <div className="p-3 rounded-xl bg-[#142336] border border-white/5 flex flex-col items-center justify-center text-center">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-amber-400"
                      strokeDasharray={`${basketballStats.efficiency}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-xs sm:text-sm font-black text-white">{basketballStats.efficiency}%</div>
                </div>
                <span className="text-xs font-bold text-slate-200 mt-2">Player Efficiency</span>
                <span className="text-[10px] text-slate-300 font-medium">{basketballStats.starPlayer}</span>
              </div>

              {/* Points in Paint Bar Chart */}
              <div className="p-3 rounded-xl bg-[#142336] border border-white/5 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-200 text-center">Points in Paint</span>
                <div className="flex items-end justify-between h-14 sm:h-16 px-2 gap-1 pt-2">
                  <div className="w-full flex flex-col items-center gap-1">
                    <div className="w-full bg-amber-400/80 rounded-t h-[60%]" />
                    <span className="text-[9px] text-slate-300 font-medium">Q1</span>
                  </div>
                  <div className="w-full flex flex-col items-center gap-1">
                    <div className="w-full bg-amber-400 rounded-t h-[85%]" />
                    <span className="text-[9px] text-slate-300 font-medium">Q2</span>
                  </div>
                  <div className="w-full flex flex-col items-center gap-1">
                    <div className="w-full bg-amber-400/60 rounded-t h-[40%]" />
                    <span className="text-[9px] text-slate-300 font-medium">Q3</span>
                  </div>
                  <div className="w-full flex flex-col items-center gap-1">
                    <div className="w-full bg-orange-400 rounded-t h-[95%]" />
                    <span className="text-[9px] text-slate-300 font-medium">Q4</span>
                  </div>
                </div>
                <div className="text-[10px] text-amber-400 text-center font-bold mt-1">
                  Total: {basketballStats.totalPts}
                </div>
              </div>

              {/* Team Gauges */}
              <div className="p-3 rounded-xl bg-[#142336] border border-white/5 flex flex-col justify-around text-center">
                <div>
                  <div className="text-base sm:text-lg font-black text-orange-400">{basketballStats.fg}</div>
                  <span className="text-xs font-bold text-slate-200">Team FG%</span>
                </div>
                <div className="border-t border-white/5 pt-2">
                  <div className="text-base sm:text-lg font-black text-amber-400">{basketballStats.reb}</div>
                  <span className="text-xs font-bold text-slate-200">Total Rebounds</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN (col-span-6): CRICKET, STANDINGS & HIGHLIGHTS ─── */}
        <div className="lg:col-span-6 space-y-6">
          {/* 3. LIVE CRICKET SCORECARD CARD */}
          <div className="rounded-2xl bg-[#0E1A29]/90 border border-amber-500/20 p-4 sm:p-5 shadow-xl shadow-amber-950/20 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-amber-500/10 text-amber-400 text-xs">🏏</span>
                <h3 className="text-sm font-black tracking-wider text-slate-200 uppercase">
                  LIVE CRICKET SCORECARD
                </h3>
              </div>
              <button
                onClick={() => onSelectTab?.('cricket')}
                className="text-slate-300 hover:text-amber-400 transition p-1"
                aria-label="Options"
              >
                <FiMoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Match Header */}
            <div className="flex items-center justify-between flex-wrap gap-2 bg-[#142336] p-3 rounded-xl border border-white/5 mb-3">
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-200 truncate block">{liveCricket.title}</span>
                <p className="text-[10px] text-slate-300 truncate">{liveCricket.subtitle}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm sm:text-base font-black text-amber-400">{liveCricket.score}</div>
                <div className="text-[9px] sm:text-[10px] text-slate-300 font-medium">{liveCricket.overs}</div>
              </div>
            </div>

            {/* Batsmen Mini Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-200 border-b border-white/10 text-[10px] uppercase font-bold">
                    <th className="pb-1.5 font-bold">Batsman</th>
                    <th className="pb-1.5 text-center">R</th>
                    <th className="pb-1.5 text-center">B</th>
                    <th className="pb-1.5 text-center">4s</th>
                    <th className="pb-1.5 text-center">6s</th>
                    <th className="pb-1.5 text-right font-bold text-amber-400">SR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  <tr>
                    <td className="py-1.5 font-bold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      {liveCricket.batsman1.name}
                    </td>
                    <td className="py-1.5 text-center font-bold text-white">{liveCricket.batsman1.r}</td>
                    <td className="py-1.5 text-center">{liveCricket.batsman1.b}</td>
                    <td className="py-1.5 text-center">{liveCricket.batsman1.f4}</td>
                    <td className="py-1.5 text-center">{liveCricket.batsman1.f6}</td>
                    <td className="py-1.5 text-right text-amber-400 font-bold">{liveCricket.batsman1.sr}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-semibold text-slate-300">{liveCricket.batsman2.name}</td>
                    <td className="py-1.5 text-center font-bold text-white">{liveCricket.batsman2.r}</td>
                    <td className="py-1.5 text-center">{liveCricket.batsman2.b}</td>
                    <td className="py-1.5 text-center">{liveCricket.batsman2.f4}</td>
                    <td className="py-1.5 text-center">{liveCricket.batsman2.f6}</td>
                    <td className="py-1.5 text-right text-amber-400 font-bold">{liveCricket.batsman2.sr}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Ball-by-ball commentary preview */}
            <div className="mt-3 pt-2 border-t border-white/5 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-bold text-[10px]">
                  {liveCricket.comm1.over}
                </span>
                <span className="text-[11px] truncate">
                  {liveCricket.comm1.text}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">{liveCricket.comm2.over}</span>
                <span className="truncate">{liveCricket.comm2.text}</span>
              </div>
            </div>
          </div>

          {/* 4. FOOTBALL STANDINGS TABLE CARD */}
          <div className="rounded-2xl bg-[#0E1A29]/90 border border-amber-500/20 p-4 sm:p-5 shadow-xl shadow-amber-950/20 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <FiAward className="text-amber-400 w-4 h-4" />
                <h3 className="text-sm font-black tracking-wider text-slate-200 uppercase">
                  FOOTBALL STANDINGS TABLE
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">Premier League</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-white/10 uppercase text-[11px] text-slate-400 font-mono">
                  <tr>
                    <th className="py-3 px-2">#</th>
                    <th className="py-3 px-4">Club</th>
                    <th className="py-3 px-3 text-center">P</th>
                    <th className="py-3 px-3 text-center">W</th>
                    <th className="py-3 px-3 text-center">D</th>
                    <th className="py-3 px-3 text-center">L</th>
                    <th className="py-3 px-3 text-center">GD</th>
                    <th className="py-3 px-4 text-right">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {liveStandings.map((team, idx) => (
                    <tr
                      key={team.name}
                      className={idx === 0 ? "bg-amber-500/10" : "hover:bg-white/5"}
                    >
                      <td className="py-3 px-2 font-bold text-slate-400">
                        {team.rank}
                      </td>
                      <td className="py-3 px-4 font-bold text-white font-sans">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-600/40 flex items-center justify-center text-[9px] font-black font-mono">
                            {team.code}
                          </span>
                          <span className={idx === 0 ? "text-amber-400 font-black" : "truncate max-w-[90px] sm:max-w-none"}>
                            {team.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">{team.p}</td>
                      <td className="py-3 px-3 text-center text-emerald-400">{team.w}</td>
                      <td className="py-3 px-3 text-center text-slate-400">{team.d}</td>
                      <td className="py-3 px-3 text-center text-rose-400">{team.l}</td>
                      <td className="py-3 px-3 text-center">{team.gd}</td>
                      <td className="py-3 px-4 text-right font-black text-amber-400">
                        {team.pts}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. VIDEO HIGHLIGHTS CARD */}
          <div className="rounded-2xl bg-[#0E1A29]/90 border border-amber-500/20 p-4 sm:p-5 shadow-xl shadow-amber-950/20 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <FiPlay className="text-amber-400 w-4 h-4" />
                <h3 className="text-sm font-black tracking-wider text-slate-200 uppercase">
                  VIDEO HIGHLIGHTS
                </h3>
              </div>
              <Link href="/highlights" className="text-xs text-amber-400 hover:underline font-bold">
                View All HD Recaps →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {videoHighlights.map((v) => (
                <Link
                  key={v.id}
                  href="/highlights"
                  className="group relative rounded-xl overflow-hidden bg-slate-900 border border-white/10 hover:border-amber-400/50 transition duration-300"
                >
                  <div className="h-24 bg-gradient-to-tr from-slate-900 to-slate-800 relative flex items-center justify-center">
                    {v.thumbnail ? (
                      <img
                        src={v.thumbnail}
                        alt={v.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-opacity"
                      />
                    ) : null}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition duration-300 z-10">
                      <FiPlay className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                    <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-bold text-white z-10">
                      {v.duration}
                    </span>
                  </div>
                  <div className="p-2">
                    <p className="text-[11px] font-bold text-white line-clamp-2 group-hover:text-amber-400 transition">
                      {v.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── ROW 2: BREAKING SPORTS NEWS TICKER / CARDS ─── */}
      <div className="rounded-xl bg-[#0E1A29]/90 border border-blue-500/20 p-2.5 sm:p-3 shadow-lg backdrop-blur-md overflow-hidden min-h-[50px]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] sm:text-[11px] font-black tracking-wider uppercase flex items-center gap-1.5 whitespace-nowrap">
              <FaFire className="w-3 h-3 text-blue-400" />
              BREAKING NEWS
            </span>
          </div>

          {/* Ticker Item with glowing badges */}
          <div className="flex-1 min-w-0 w-full flex items-center justify-between overflow-hidden gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
              <span className="hidden md:block px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-black tracking-wider uppercase flex-shrink-0">
                {currentPulse?.tag || 'BREAKING'}
              </span>
              <Link
                href={pulseLink}
                className="text-xs font-bold text-slate-200 truncate hover:text-blue-400 hover:underline transition-colors flex-1"
              >
                {currentPulse?.title}
              </Link>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0 pl-1">
              <button
                onClick={() =>
                  setTickerIndex((prev) => (prev - 1 + pulseNews.length) % pulseNews.length)
                }
                className="min-w-[32px] min-h-[32px] p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition flex items-center justify-center"
                aria-label="Previous Breaking News"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTickerIndex((prev) => (prev + 1) % pulseNews.length)}
                className="min-w-[32px] min-h-[32px] p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition flex items-center justify-center"
                aria-label="Next Breaking News"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
