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
  FiChevronLeft,
  FiRadio,
  FiAward,
  FiZap,
} from 'react-icons/fi';
import { FaFire } from 'react-icons/fa6';

export function GoalmillsLiveDashboard({
  onSelectTab,
}: {
  onSelectTab?: (tab: string) => void;
}) {
  const [activeTab, setActiveTab] = useState('LIVE SCORES');
  const [tickerIndex, setTickerIndex] = useState(0);

  const breakingNews = [
    { tag: 'TRANSFER', title: 'Mbappe to Real Madrid Confirmed!', sport: 'football' },
    { tag: 'TRANSFER', title: 'Victor Osimhen signs new deal with release clause', sport: 'football' },
    { tag: 'F1', title: 'Max Verstappen Clinches Thrilling Monaco GP Victory', sport: 'f1' },
    { tag: 'NBA', title: 'Lakers rally in 4th quarter against Celtics in historic thriller', sport: 'basketball' },
    { tag: 'CRICKET', title: 'India set 343 target in ICC Champions Trophy clash', sport: 'cricket' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % breakingNews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [breakingNews.length]);

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* ─── ROW 1: PRIMARY SPORTS INTELLIGENCE GRID ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ─── LEFT COLUMN (col-span-6): FOOTBALL & BASKETBALL ─── */}
        <div className="lg:col-span-6 space-y-6">
          {/* 1. LIVE FOOTBALL SCORES CARD */}
          <div className="rounded-2xl bg-[#0E1A29]/90 border border-emerald-500/20 p-5 shadow-xl shadow-cyan-950/20 backdrop-blur-md relative overflow-hidden">
            {/* Ambient subtle glow */}
            <div className="absolute top-0 right-0 w-64 h-32 bg-emerald-500/5 blur-3xl -z-10" />

            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-sm font-black tracking-wider text-slate-200 uppercase">
                  LIVE FOOTBALL SCORES
                </h3>
              </div>
              <button
                onClick={() => onSelectTab?.('football')}
                className="text-slate-400 hover:text-emerald-400 transition p-1"
                aria-label="Options"
              >
                <FiMoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Match 1: Man United vs Arsenal */}
              <div className="rounded-xl bg-[#142336] border border-white/5 p-4 hover:border-emerald-500/30 transition duration-300">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold text-slate-300">Premier League</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black tracking-wider flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    LIVE
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  {/* Home Team */}
                  <div className="flex items-center gap-3 w-5/12">
                    <div className="w-8 h-8 rounded-full bg-red-900/40 border border-red-500/30 flex items-center justify-center text-xs font-bold text-white shadow">
                      MU
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white truncate">Man United</div>
                      <div className="text-[10px] text-slate-400">R. Fernandes (60&apos;)</div>
                    </div>
                  </div>

                  {/* Score & Time */}
                  <div className="text-center w-2/12">
                    <div className="text-xl font-black text-emerald-400 tracking-tight">2 - 1</div>
                    <div className="text-[11px] font-semibold text-slate-400">(78&apos;)</div>
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center justify-end gap-3 w-5/12 text-right">
                    <div>
                      <div className="font-bold text-sm text-white truncate">Arsenal</div>
                      <div className="text-[10px] text-slate-400">B. Saka (76&apos;)</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-red-600/30 border border-red-400/30 flex items-center justify-center text-xs font-bold text-white shadow">
                      ARS
                    </div>
                  </div>
                </div>

                {/* Timeline / Possession Progress Bar */}
                <div className="mt-3 pt-2 border-t border-white/5">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Possession 54%</span>
                    <span>46%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-400 h-full" style={{ width: '54%' }} />
                    <div className="bg-slate-700 h-full" style={{ width: '46%' }} />
                  </div>
                </div>
              </div>

              {/* Match 2: Real Madrid vs Barcelona */}
              <div className="rounded-xl bg-[#142336] border border-white/5 p-4 hover:border-emerald-500/30 transition duration-300">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold text-slate-300">La Liga • El Clásico</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black tracking-wider flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    LIVE
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 w-5/12">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-xs font-bold text-white shadow">
                      RMA
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white truncate">Real Madrid</div>
                      <div className="text-[10px] text-slate-400">Vinicius (32&apos;)</div>
                    </div>
                  </div>

                  <div className="text-center w-2/12">
                    <div className="text-xl font-black text-emerald-400 tracking-tight">1 - 1</div>
                    <div className="text-[11px] font-semibold text-slate-400">(45+2&apos;)</div>
                  </div>

                  <div className="flex items-center justify-end gap-3 w-5/12 text-right">
                    <div>
                      <div className="font-bold text-sm text-white truncate">Barcelona</div>
                      <div className="text-[10px] text-slate-400">Yamal (18&apos;)</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-900/40 border border-blue-400/30 flex items-center justify-center text-xs font-bold text-white shadow">
                      FCB
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-white/5">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Possession 49%</span>
                    <span>51%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-400 h-full" style={{ width: '49%' }} />
                    <div className="bg-slate-700 h-full" style={{ width: '51%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. BASKETBALL ANALYTICS CARD */}
          <div className="rounded-2xl bg-[#0E1A29]/90 border border-emerald-500/20 p-5 shadow-xl shadow-cyan-950/20 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-amber-500/10 text-amber-400 text-xs">🏀</span>
                <h3 className="text-sm font-black tracking-wider text-slate-200 uppercase">
                  BASKETBALL ANALYTICS
                </h3>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                Lakers vs Celtics (4th Qtr 3:12)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Radial Player Efficiency */}
              <div className="p-3 rounded-xl bg-[#142336] border border-white/5 flex flex-col items-center justify-center text-center">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-400"
                      strokeDasharray="88, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-sm font-black text-white">88%</div>
                </div>
                <span className="text-xs font-bold text-slate-300 mt-2">Player Efficiency</span>
                <span className="text-[10px] text-slate-500">LeBron James (+14)</span>
              </div>

              {/* Points in Paint Bar Chart */}
              <div className="p-3 rounded-xl bg-[#142336] border border-white/5 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-300 text-center">Points in Paint</span>
                <div className="flex items-end justify-between h-16 px-2 gap-1 pt-2">
                  <div className="w-full flex flex-col items-center gap-1">
                    <div className="w-full bg-emerald-400/80 rounded-t h-[60%]" />
                    <span className="text-[9px] text-slate-400">Q1</span>
                  </div>
                  <div className="w-full flex flex-col items-center gap-1">
                    <div className="w-full bg-emerald-400 rounded-t h-[85%]" />
                    <span className="text-[9px] text-slate-400">Q2</span>
                  </div>
                  <div className="w-full flex flex-col items-center gap-1">
                    <div className="w-full bg-emerald-400/60 rounded-t h-[40%]" />
                    <span className="text-[9px] text-slate-400">Q3</span>
                  </div>
                  <div className="w-full flex flex-col items-center gap-1">
                    <div className="w-full bg-cyan-400 rounded-t h-[95%]" />
                    <span className="text-[9px] text-slate-400">Q4</span>
                  </div>
                </div>
                <div className="text-[10px] text-emerald-400 text-center font-bold mt-1">
                  Total: 58 PTS
                </div>
              </div>

              {/* Team Gauges */}
              <div className="p-3 rounded-xl bg-[#142336] border border-white/5 flex flex-col justify-around text-center">
                <div>
                  <div className="text-lg font-black text-cyan-400">52.4%</div>
                  <span className="text-xs font-bold text-slate-300">Team FG%</span>
                </div>
                <div className="border-t border-white/5 pt-2">
                  <div className="text-lg font-black text-emerald-400">46 REB</div>
                  <span className="text-xs font-bold text-slate-300">Total Rebounds</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN (col-span-6): CRICKET, STANDINGS & HIGHLIGHTS ─── */}
        <div className="lg:col-span-6 space-y-6">
          {/* 3. LIVE CRICKET SCORECARD CARD */}
          <div className="rounded-2xl bg-[#0E1A29]/90 border border-emerald-500/20 p-5 shadow-xl shadow-cyan-950/20 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-blue-500/10 text-blue-400 text-xs">🏏</span>
                <h3 className="text-sm font-black tracking-wider text-slate-200 uppercase">
                  LIVE CRICKET SCORECARD
                </h3>
              </div>
              <button
                onClick={() => onSelectTab?.('cricket')}
                className="text-slate-400 hover:text-emerald-400 transition p-1"
                aria-label="Options"
              >
                <FiMoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Match Header */}
            <div className="flex items-center justify-between bg-[#142336] p-3 rounded-xl border border-white/5 mb-3">
              <div>
                <span className="text-xs font-bold text-slate-200">India vs Australia (T20I)</span>
                <p className="text-[10px] text-slate-400">ICC Champions Trophy • 2nd Inning</p>
              </div>
              <div className="text-right">
                <div className="text-base font-black text-emerald-400">IND: 168/4</div>
                <div className="text-[10px] text-slate-400">(17.5 overs • CRR 9.42)</div>
              </div>
            </div>

            {/* Batsmen Mini Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-500 border-b border-white/5 text-[10px] uppercase">
                    <th className="pb-1.5 font-bold">Batsman</th>
                    <th className="pb-1.5 text-center">R</th>
                    <th className="pb-1.5 text-center">B</th>
                    <th className="pb-1.5 text-center">4s</th>
                    <th className="pb-1.5 text-center">6s</th>
                    <th className="pb-1.5 text-right font-bold text-emerald-400">SR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  <tr>
                    <td className="py-1.5 font-bold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      H. Pandya*
                    </td>
                    <td className="py-1.5 text-center font-bold text-white">42</td>
                    <td className="py-1.5 text-center">21</td>
                    <td className="py-1.5 text-center">3</td>
                    <td className="py-1.5 text-center">2</td>
                    <td className="py-1.5 text-right text-emerald-400 font-bold">200.0</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-semibold text-slate-300">R. Jadeja</td>
                    <td className="py-1.5 text-center font-bold text-white">18</td>
                    <td className="py-1.5 text-center">12</td>
                    <td className="py-1.5 text-center">1</td>
                    <td className="py-1.5 text-center">1</td>
                    <td className="py-1.5 text-right text-emerald-400 font-bold">150.0</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Ball-by-ball commentary preview */}
            <div className="mt-3 pt-2 border-t border-white/5 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px]">
                  17.5
                </span>
                <span className="text-[11px] truncate">
                  Maxwell to Hardik — <strong className="text-emerald-400 font-bold">4 runs!</strong> Driven through extra cover.
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">17.4</span>
                <span className="truncate">Maxwell to Jadeja — Single taken towards long on.</span>
              </div>
            </div>
          </div>

          {/* 4. FOOTBALL STANDINGS TABLE CARD */}
          <div className="rounded-2xl bg-[#0E1A29]/90 border border-emerald-500/20 p-5 shadow-xl shadow-cyan-950/20 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <FiAward className="text-emerald-400 w-4 h-4" />
                <h3 className="text-sm font-black tracking-wider text-slate-200 uppercase">
                  FOOTBALL STANDINGS TABLE
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">Premier League</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-500 border-b border-white/5 text-[10px] uppercase">
                    <th className="pb-2 font-bold"># Team</th>
                    <th className="pb-2 text-center">P</th>
                    <th className="pb-2 text-center">W</th>
                    <th className="pb-2 text-center">D</th>
                    <th className="pb-2 text-center">L</th>
                    <th className="pb-2 text-center">GD</th>
                    <th className="pb-2 text-right font-bold text-emerald-400">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {/* Leader Row with glowing styling */}
                  <tr className="bg-emerald-500/10 font-bold text-white">
                    <td className="py-2 px-1 flex items-center gap-2">
                      <span className="text-emerald-400 font-black">1.</span>
                      <span className="w-5 h-5 rounded-full bg-red-600/40 flex items-center justify-center text-[9px] font-black">
                        ARS
                      </span>
                      <span>Arsenal</span>
                    </td>
                    <td className="py-2 text-center">33</td>
                    <td className="py-2 text-center">23</td>
                    <td className="py-2 text-center">5</td>
                    <td className="py-2 text-center">5</td>
                    <td className="py-2 text-center text-emerald-400">+48</td>
                    <td className="py-2 text-right font-black text-emerald-400">74</td>
                  </tr>
                  <tr className="text-slate-300 hover:bg-slate-800/30">
                    <td className="py-2 px-1 flex items-center gap-2">
                      <span className="text-slate-400 font-bold">2.</span>
                      <span className="w-5 h-5 rounded-full bg-sky-600/40 flex items-center justify-center text-[9px] font-black">
                        MCI
                      </span>
                      <span>Man City</span>
                    </td>
                    <td className="py-2 text-center">32</td>
                    <td className="py-2 text-center">22</td>
                    <td className="py-2 text-center">7</td>
                    <td className="py-2 text-center">3</td>
                    <td className="py-2 text-center text-emerald-400">+45</td>
                    <td className="py-2 text-right font-bold text-white">73</td>
                  </tr>
                  <tr className="text-slate-300 hover:bg-slate-800/30">
                    <td className="py-2 px-1 flex items-center gap-2">
                      <span className="text-slate-400 font-bold">3.</span>
                      <span className="w-5 h-5 rounded-full bg-red-800/40 flex items-center justify-center text-[9px] font-black">
                        LIV
                      </span>
                      <span>Liverpool</span>
                    </td>
                    <td className="py-2 text-center">33</td>
                    <td className="py-2 text-center">21</td>
                    <td className="py-2 text-center">8</td>
                    <td className="py-2 text-center">4</td>
                    <td className="py-2 text-center text-emerald-400">+38</td>
                    <td className="py-2 text-right font-bold text-white">71</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. VIDEO HIGHLIGHTS CARD */}
          <div className="rounded-2xl bg-[#0E1A29]/90 border border-emerald-500/20 p-5 shadow-xl shadow-cyan-950/20 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <FiPlay className="text-emerald-400 w-4 h-4" />
                <h3 className="text-sm font-black tracking-wider text-slate-200 uppercase">
                  VIDEO HIGHLIGHTS
                </h3>
              </div>
              <Link href="/highlights" className="text-xs text-emerald-400 hover:underline font-bold">
                View All HD Recaps →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Highlight 1 */}
              <Link
                href="/highlights"
                className="group relative rounded-xl overflow-hidden bg-slate-900 border border-white/10 hover:border-emerald-400/50 transition duration-300"
              >
                <div className="h-24 bg-gradient-to-tr from-slate-900 to-slate-800 relative flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/90 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition duration-300">
                    <FiPlay className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                  <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-bold text-white">
                    03:45
                  </span>
                </div>
                <div className="p-2">
                  <h4 className="text-[11px] font-bold text-white line-clamp-2 group-hover:text-emerald-400 transition">
                    Mbappe&apos;s Stunning Solo Goal vs Lille
                  </h4>
                </div>
              </Link>

              {/* Highlight 2 */}
              <Link
                href="/highlights"
                className="group relative rounded-xl overflow-hidden bg-slate-900 border border-white/10 hover:border-emerald-400/50 transition duration-300"
              >
                <div className="h-24 bg-gradient-to-tr from-amber-950/60 to-slate-800 relative flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/90 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition duration-300">
                    <FiPlay className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                  <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-bold text-white">
                    01:20
                  </span>
                </div>
                <div className="p-2">
                  <h4 className="text-[11px] font-bold text-white line-clamp-2 group-hover:text-emerald-400 transition">
                    Last Second Buzzer Beater - NBA Finals
                  </h4>
                </div>
              </Link>

              {/* Highlight 3 */}
              <Link
                href="/highlights"
                className="group relative rounded-xl overflow-hidden bg-slate-900 border border-white/10 hover:border-emerald-400/50 transition duration-300"
              >
                <div className="h-24 bg-gradient-to-tr from-blue-950/60 to-slate-800 relative flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/90 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition duration-300">
                    <FiPlay className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                  <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-bold text-white">
                    04:10
                  </span>
                </div>
                <div className="p-2">
                  <h4 className="text-[11px] font-bold text-white line-clamp-2 group-hover:text-emerald-400 transition">
                    Kohli&apos;s Match Winning Six in Final Over
                  </h4>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ROW 2: BREAKING SPORTS NEWS TICKER / CARDS ─── */}
      <div className="rounded-2xl bg-[#0E1A29]/90 border border-emerald-500/20 p-4 shadow-xl shadow-cyan-950/20 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-black tracking-wider uppercase flex items-center gap-1.5">
              <FaFire className="w-3.5 h-3.5 text-amber-400" />
              BREAKING SPORTS NEWS
            </span>
          </div>

          {/* Ticker Item with glowing badges */}
          <div className="flex-1 w-full flex items-center justify-between overflow-hidden">
            <div className="flex items-center gap-3 truncate">
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-black tracking-wider uppercase">
                {breakingNews[tickerIndex].tag}
              </span>
              <span className="text-sm font-semibold text-slate-200 truncate">
                {breakingNews[tickerIndex].title}
              </span>
            </div>

            <div className="flex items-center gap-1.5 pl-4">
              <button
                onClick={() =>
                  setTickerIndex((prev) => (prev - 1 + breakingNews.length) % breakingNews.length)
                }
                className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
                aria-label="Previous"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTickerIndex((prev) => (prev + 1) % breakingNews.length)}
                className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
                aria-label="Next"
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
