'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PlayerMeta, EntityService } from '@/lib/entityService';
import {
  FiTrendingUp,
  FiAward,
  FiArrowRight,
  FiShield,
  FiActivity,
  FiDollarSign,
  FiGlobe,
  FiCheckCircle,
} from 'react-icons/fi';
import { FaFire, FaTrophy, FaStar } from 'react-icons/fa6';

interface AfricanFootballHeroSpotlightProps {
  initialPlayers?: PlayerMeta[];
}

export function AfricanFootballHeroSpotlight({
  initialPlayers,
}: AfricanFootballHeroSpotlightProps) {
  const players = initialPlayers || EntityService.getAfricanPlayers();
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'strikers' | 'playmakers' | 'defenders'
  >('all');

  const filtered = players.filter((p) => {
    if (selectedCategory === 'strikers') {
      return /striker|forward/i.test(p.position);
    }
    if (selectedCategory === 'playmakers') {
      return /winger|midfield/i.test(p.position);
    }
    if (selectedCategory === 'defenders') {
      return /back|defender|goalkeeper/i.test(p.position);
    }
    return true;
  });

  const featuredSuperstar = players[0] || null; // Victor Osimhen or highest

  return (
    <section className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#0A162B] via-[#091C36] to-[#06101E] p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
      {/* Subtle Background Glow Elements */}
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Top Tagline & Season Indicator */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 text-[11px] font-black uppercase tracking-wider text-slate-950 shadow-md">
            <span>🦁</span>
            <span>GoalMills Africa</span>
          </span>
          <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-mono font-bold text-amber-300 border border-amber-500/20">
            2026/2027 Season Active
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
            <FiGlobe className="text-emerald-400" />
            <span>CAF & Diaspora Intelligence</span>
          </span>
        </div>

        {/* Quick Hub Links */}
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/football/caf-champions-league"
            className="hidden md:inline-flex items-center gap-1 text-slate-300 hover:text-amber-300 font-bold transition-colors"
          >
            <span>CAF Champions League</span>
            <FiArrowRight size={12} />
          </Link>
          <Link
            href="/football/players"
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 px-3 py-1.5 font-bold text-amber-300 hover:text-amber-200 transition-all text-xs"
          >
            <span>Market Value Index</span>
            <FiTrendingUp size={13} />
          </Link>
        </div>
      </div>

      {/* Main Banner Body: 2 Columns */}
      <div className="relative z-10 mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Headlines & Valuation Pitch */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-xl bg-amber-500/10 px-3 py-1 border border-amber-500/20 text-xs font-bold text-amber-400">
            <FaFire className="text-orange-400 animate-pulse" />
            <span>African Superstars 2026/2027 Valuation & Transfer Radar</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            The World’s #1 Hub for{' '}
            <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-emerald-400 bg-clip-text text-transparent">
              African Football Power
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
            Track live CAF Champions League, NPFL, Betway Premiership, and Botola Pro scores, alongside authenticated 2026/2027 real market valuations, contract statuses, and goals across Europe for Osimhen, Salah, Lookman, and Hakimi.
          </p>

          {/* Key Metrics Quick Ribbon */}
          <div className="grid grid-cols-3 gap-3 pt-1 max-w-lg">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
              <span className="block text-lg sm:text-xl font-black text-amber-400 font-mono">
                €580M+
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Combined Value
              </span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
              <span className="block text-lg sm:text-xl font-black text-emerald-400 font-mono">
                12 Leagues
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">
                CAF & Domestic
              </span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
              <span className="block text-lg sm:text-xl font-black text-blue-400 font-mono">
                2026/2027
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Active Season
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Spotlight Superstar Card */}
        {featuredSuperstar && (
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl border border-amber-500/40 bg-gradient-to-b from-[#0F2243] to-[#081224] p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="flex items-center gap-1.5 text-xs font-black uppercase text-amber-400 tracking-wider">
                  <FaStar className="text-amber-400" />
                  <span>Africa Valuation Leader</span>
                </span>
                <span className="text-[10px] font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
                  {featuredSuperstar.marketValue}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <div className="relative h-18 w-18 shrink-0">
                  <img
                    src={featuredSuperstar.photo}
                    alt={featuredSuperstar.name}
                    className="h-16 w-16 rounded-2xl object-cover border border-amber-500/30 bg-slate-900"
                  />
                  <span className="absolute -bottom-1 -right-1 text-base">
                    {featuredSuperstar.countryFlag}
                  </span>
                </div>

                <div className="min-w-0">
                  <h3 className="text-base font-extrabold text-white truncate">
                    {featuredSuperstar.name}
                  </h3>
                  <p className="text-xs font-bold text-amber-300 truncate">
                    {featuredSuperstar.clubName}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {featuredSuperstar.position} • {featuredSuperstar.age} yrs
                  </p>
                </div>
              </div>

              {/* Stats & Contract */}
              <div className="mt-3.5 pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white/5 p-2 rounded-xl">
                  <span className="block font-black text-white">
                    {featuredSuperstar.seasonStats.goals}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400">Goals</span>
                </div>
                <div className="bg-white/5 p-2 rounded-xl">
                  <span className="block font-black text-white">
                    {featuredSuperstar.seasonStats.assists}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400">Assists</span>
                </div>
                <div className="bg-white/5 p-2 rounded-xl">
                  <span className="block font-black text-emerald-400 font-mono">
                    {featuredSuperstar.seasonStats.rating.toFixed(2)}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400">Rating</span>
                </div>
              </div>

              {/* Contract Expiry & Wage */}
              {(featuredSuperstar.contractUntil || featuredSuperstar.weeklyWage) && (
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-300 px-1">
                  <span>
                    Contract: <strong>{featuredSuperstar.contractUntil}</strong>
                  </span>
                  {featuredSuperstar.weeklyWage && (
                    <span className="text-emerald-400 font-mono font-bold">
                      {featuredSuperstar.weeklyWage}/wk
                    </span>
                  )}
                </div>
              )}

              <Link
                href={`/players/${featuredSuperstar.slug}`}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg"
              >
                <span>Full Scouting Dossier</span>
                <FiArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Horizontal African Superstars Scroll */}
      <div className="relative z-10 mt-6 pt-5 border-t border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>🔥</span>
            <span>Trending African Stars (2026/2027 Market Values)</span>
          </h4>
          <Link
            href="/football/players"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline"
          >
            View All 16+ Stars →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {players.slice(0, 6).map((star) => (
            <Link
              key={star.slug}
              href={`/players/${star.slug}`}
              className="group flex flex-col items-center text-center p-3 rounded-2xl bg-[#061224]/80 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 transition-all"
            >
              <div className="relative mb-2">
                <img
                  src={star.photo}
                  alt={star.name}
                  className="h-12 w-12 rounded-xl object-cover bg-slate-900 border border-white/10 group-hover:scale-105 transition-transform"
                />
                <span className="absolute -bottom-1 -right-1 text-xs">{star.countryFlag}</span>
              </div>
              <h5 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate max-w-full">
                {star.name}
              </h5>
              <span className="text-[10px] font-mono font-bold text-emerald-400">
                {star.marketValue}
              </span>
              <span className="text-[9px] text-slate-400 truncate max-w-full">
                {star.clubName.split(' ')[0]}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* African Competitions Quick Switcher Bar */}
      <div className="relative z-10 mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar pt-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 pr-1">
          Featured CAF Leagues:
        </span>
        {[
          { name: 'CAF Champions League', slug: 'caf-champions-league', flag: '🌍' },
          { name: 'Betway Premiership (PSL)', slug: 'south-african-psl', flag: '🇿🇦' },
          { name: 'NPFL (Nigeria)', slug: 'npfl', flag: '🇳🇬' },
          { name: 'Egyptian Premier League', slug: 'egyptian-premier-league', flag: '🇪🇬' },
          { name: 'Botola Pro (Morocco)', slug: 'botola-pro', flag: '🇲🇦' },
          { name: 'Ghana Premier League', slug: 'ghanaian-premier-league', flag: '🇬🇭' },
          { name: 'AFCON 2027', slug: 'afcon', flag: '🏆' },
        ].map((item) => (
          <Link
            key={item.slug}
            href={`/football/${item.slug}`}
            className="flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/30 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white transition-all whitespace-nowrap shrink-0"
          >
            <span>{item.flag}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
