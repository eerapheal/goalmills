'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FiActivity,
  FiAward,
  FiCheckCircle,
  FiChevronDown,
  FiChevronRight,
  FiClock,
  FiDollarSign,
  FiExternalLink,
  FiEye,
  FiFilter,
  FiGlobe,
  FiInfo,
  FiLayers,
  FiMail,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiStar,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from 'react-icons/fi';
import { EntityService, PlayerMeta, OfficialMeta, CoachMeta, ClubMeta } from '@/lib/entityService';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MatchStatus = 'LIVE' | 'FT' | 'HT' | 'UPCOMING' | 'PPD';
export type MainTab = 'live' | 'upcoming' | 'results' | 'table' | 'scorers' | 'odds';

export interface FixtureItem {
  id: string;
  comp: string;
  compFlag: string;
  home: string;
  homeBadge: string;
  away: string;
  awayBadge: string;
  hScore: number | string | null;
  aScore: number | string | null;
  minute: number | string | null;
  status: MatchStatus;
  time?: string;
  date?: string;
  stadium?: string;
  homeLogo?: string;
  awayLogo?: string;
}

export interface TableEntry {
  pos: number;
  team: string;
  slug?: string;
  badge: string;
  logo?: string;
  p: number;
  w: number;
  d: number;
  l: number;
  gd: number;
  pts: number;
  form: ('W' | 'D' | 'L')[];
  zone?: 'champions' | 'europa' | 'relegation';
}

export interface TopScorer {
  rank: number;
  name: string;
  team: string;
  badge: string;
  flag: string;
  goals: number;
  assists: number;
  apps: number;
  photo: string;
  playerId: string;
}

export interface CompGroup {
  region: string;
  icon: string;
  comps: { name: string; flag: string; tier: string; season: string; country: string; href?: string }[];
}

export interface ClubHub {
  name: string;
  slug: string;
  badge: string;
  logo?: string;
  manager: string;
  country: string;
}

// ─── Curated Fallback / Baseline Data (from Figma) ─────────────────────────────

const DEFAULT_LIVE_FIXTURES: FixtureItem[] = [
  { id: 'mci-ars-2026', comp: 'Premier League', compFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', home: 'Man City', homeBadge: '🔵', away: 'Arsenal', awayBadge: '🔴', hScore: 2, aScore: 1, minute: 67, status: 'LIVE', stadium: 'Etihad Stadium' },
  { id: 'nap-juv-2026', comp: 'Serie A', compFlag: '🇮🇹', home: 'Napoli', homeBadge: '🔵', away: 'Juventus', awayBadge: '⚫', hScore: 3, aScore: 0, minute: 82, status: 'LIVE', stadium: 'Stadio Diego Maradona' },
  { id: 'che-bay-2026', comp: 'UCL', compFlag: '⭐', home: 'Chelsea', homeBadge: '🔵', away: 'Bayern', awayBadge: '🔴', hScore: 1, aScore: 1, minute: 45, status: 'HT', stadium: 'Stamford Bridge' },
  { id: 'psg-lyo-2026', comp: 'Ligue 1', compFlag: '🇫🇷', home: 'PSG', homeBadge: '🔵', away: 'Lyon', awayBadge: '⚪', hScore: 2, aScore: 0, minute: 71, status: 'LIVE', stadium: 'Parc des Princes' },
  { id: 'nga-rwa-2026', comp: 'AFCON Q.', compFlag: '🌍', home: 'Nigeria', homeBadge: '🟢', away: 'Rwanda', awayBadge: '🔵', hScore: 3, aScore: 0, minute: null, status: 'FT', stadium: 'Godswill Akpabio Stadium' },
  { id: 'dor-rbl-2026', comp: 'Bundesliga', compFlag: '🇩🇪', home: 'Dortmund', homeBadge: '🟡', away: 'Leipzig', awayBadge: '🔴', hScore: 2, aScore: 2, minute: null, status: 'FT', stadium: 'Signal Iduna Park' },
];

const DEFAULT_UPCOMING_FIXTURES: FixtureItem[] = [
  { id: 'bar-rma-2026', comp: 'La Liga', compFlag: '🇪🇸', home: 'Barcelona', homeBadge: '🔵', away: 'Real Madrid', awayBadge: '⚪', hScore: null, aScore: null, minute: null, status: 'UPCOMING', time: '17:00', date: 'Today', stadium: 'Spotify Camp Nou' },
  { id: 'liv-tot-2026', comp: 'Premier League', compFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', home: 'Liverpool', homeBadge: '🔴', away: 'Tottenham', awayBadge: '⚪', hScore: null, aScore: null, minute: null, status: 'UPCOMING', time: '14:00', date: 'Today', stadium: 'Anfield' },
  { id: 'rma-atl-2026', comp: 'UCL', compFlag: '⭐', home: 'Real Madrid', homeBadge: '⚪', away: 'Atlético', awayBadge: '🔴', hScore: null, aScore: null, minute: null, status: 'UPCOMING', time: '20:00', date: 'Tue 17 Sep', stadium: 'Santiago Bernabéu' },
  { id: 'mar-sen-2026', comp: 'AFCON Q.', compFlag: '🌍', home: 'Morocco', homeBadge: '🔴', away: 'Senegal', awayBadge: '🟢', hScore: null, aScore: null, minute: null, status: 'UPCOMING', time: '20:00', date: 'Wed 18 Sep', stadium: 'Stade Mohammed V' },
  { id: 'bay-dor-2026', comp: 'Bundesliga', compFlag: '🇩🇪', home: 'Bayern', homeBadge: '🔴', away: 'Dortmund', awayBadge: '🟡', hScore: null, aScore: null, minute: null, status: 'UPCOMING', time: '18:30', date: 'Sat 20 Sep', stadium: 'Allianz Arena' },
  { id: 'int-mil-2026', comp: 'Serie A', compFlag: '🇮🇹', home: 'Inter', homeBadge: '🔵', away: 'AC Milan', awayBadge: '🔴', hScore: null, aScore: null, minute: null, status: 'UPCOMING', time: '20:45', date: 'Sun 21 Sep', stadium: 'San Siro' },
];

const DEFAULT_RESULTS: FixtureItem[] = [
  { id: 'mci-dor-2026', comp: 'UCL', compFlag: '⭐', home: 'Man City', homeBadge: '🔵', away: 'Dortmund', awayBadge: '🟡', hScore: 3, aScore: 0, minute: null, status: 'FT', date: 'Yesterday', stadium: 'Etihad Stadium' },
  { id: 'liv-mci-2026', comp: 'Premier League', compFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', home: 'Liverpool', homeBadge: '🔴', away: 'Man City', awayBadge: '🔵', hScore: 1, aScore: 1, minute: null, status: 'FT', date: '2 days ago', stadium: 'Anfield' },
  { id: 'rma-fcb-2026', comp: 'La Liga', compFlag: '🇪🇸', home: 'Real Madrid', homeBadge: '⚪', away: 'Barça', awayBadge: '🔵', hScore: 2, aScore: 3, minute: null, status: 'FT', date: 'Aug 31', stadium: 'Bernabéu' },
  { id: 'cmr-gha-2026', comp: 'AFCON Q.', compFlag: '🌍', home: 'Cameroon', homeBadge: '🟢', away: 'Ghana', awayBadge: '🟡', hScore: 1, aScore: 0, minute: null, status: 'FT', date: 'Aug 29', stadium: 'Olembe Stadium' },
  { id: 'ars-che-2026', comp: 'Premier League', compFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', home: 'Arsenal', homeBadge: '🔴', away: 'Chelsea', awayBadge: '🔵', hScore: 2, aScore: 0, minute: null, status: 'FT', date: 'Aug 28', stadium: 'Emirates Stadium' },
  { id: 'bay-lev-2026', comp: 'Bundesliga', compFlag: '🇩🇪', home: 'Bayern', homeBadge: '🔴', away: 'Leverkusen', awayBadge: '🔴', hScore: 2, aScore: 1, minute: null, status: 'FT', date: 'Aug 27', stadium: 'Allianz Arena' },
];

const PL_TABLE: TableEntry[] = [
  { pos: 1, team: 'Man City', slug: 'manchester-city', badge: '🔵', p: 32, w: 23, d: 5, l: 4, gd: 46, pts: 74, form: ['W', 'W', 'D', 'W', 'W'], zone: 'champions' },
  { pos: 2, team: 'Arsenal', slug: 'arsenal', badge: '🔴', p: 32, w: 22, d: 4, l: 6, gd: 43, pts: 70, form: ['L', 'W', 'W', 'W', 'D'], zone: 'champions' },
  { pos: 3, team: 'Liverpool', slug: 'liverpool', badge: '🔴', p: 32, w: 20, d: 6, l: 6, gd: 30, pts: 66, form: ['W', 'D', 'W', 'L', 'W'], zone: 'champions' },
  { pos: 4, team: 'Aston Villa', slug: 'aston-villa', badge: '🟣', p: 32, w: 18, d: 5, l: 9, gd: 16, pts: 59, form: ['W', 'W', 'L', 'W', 'D'], zone: 'champions' },
  { pos: 5, team: 'Chelsea', slug: 'chelsea', badge: '🔵', p: 32, w: 17, d: 6, l: 9, gd: 11, pts: 57, form: ['D', 'W', 'W', 'L', 'W'], zone: 'europa' },
  { pos: 6, team: 'Tottenham', slug: 'tottenham', badge: '⚪', p: 32, w: 16, d: 5, l: 11, gd: 8, pts: 53, form: ['L', 'W', 'D', 'W', 'L'], zone: 'europa' },
  { pos: 7, team: 'Newcastle', slug: 'newcastle', badge: '⚫', p: 32, w: 14, d: 8, l: 10, gd: 5, pts: 50, form: ['W', 'D', 'W', 'W', 'L'] },
  { pos: 8, team: 'Brighton', slug: 'brighton', badge: '🔵', p: 32, w: 13, d: 9, l: 10, gd: 4, pts: 48, form: ['D', 'W', 'L', 'D', 'W'] },
  { pos: 17, team: 'Nottm Forest', slug: 'nottingham-forest', badge: '🔴', p: 32, w: 9, d: 5, l: 18, gd: -18, pts: 32, form: ['L', 'L', 'D', 'L', 'W'], zone: 'relegation' },
  { pos: 18, team: 'Luton Town', slug: 'luton-town', badge: '🟠', p: 32, w: 7, d: 4, l: 21, gd: -28, pts: 25, form: ['L', 'D', 'L', 'L', 'L'], zone: 'relegation' },
  { pos: 19, team: 'Sheffield Utd', slug: 'sheffield-united', badge: '🔴', p: 32, w: 5, d: 4, l: 23, gd: -42, pts: 19, form: ['L', 'L', 'L', 'D', 'L'], zone: 'relegation' },
];

const TOP_SCORERS: TopScorer[] = [
  { rank: 1, name: 'Erling Haaland', team: 'Man City', badge: '🔵', flag: '🇳🇴', goals: 31, assists: 7, apps: 32, photo: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=120&h=120&fit=crop&auto=format', playerId: 'erling-haaland' },
  { rank: 2, name: 'Victor Osimhen', team: 'Napoli / Al-Ahli', badge: '🔵', flag: '🇳🇬', goals: 26, assists: 5, apps: 30, photo: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=120&h=120&fit=crop&auto=format', playerId: 'victor-osimhen' },
  { rank: 3, name: 'Kylian Mbappé', team: 'Real Madrid', badge: '⚪', flag: '🇫🇷', goals: 24, assists: 8, apps: 29, photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&auto=format', playerId: 'kylian-mbappe' },
  { rank: 4, name: 'Bukayo Saka', team: 'Arsenal', badge: '🔴', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals: 16, assists: 14, apps: 30, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&auto=format', playerId: 'bukayo-saka' },
  { rank: 5, name: 'Harry Kane', team: 'Bayern Munich', badge: '🔴', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals: 28, assists: 10, apps: 31, photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop&auto=format', playerId: 'harry-kane' },
  { rank: 6, name: 'Mohamed Salah', team: 'Liverpool', badge: '🔴', flag: '🇪🇬', goals: 22, assists: 13, apps: 32, photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&auto=format', playerId: 'mohamed-salah' },
];

const COMP_GROUPS: CompGroup[] = [
  {
    region: 'Africa (CAF)',
    icon: '🌍',
    comps: [
      { name: 'AFCON 2026/2027', flag: '🏆', tier: 'INT', season: '2026/27', country: 'Africa', href: '/football' },
      { name: 'CAF Champions League', flag: '🏆', tier: 'T1', season: '2025/26', country: 'Africa', href: '/football' },
      { name: 'CAF Confederation Cup', flag: '🥈', tier: 'T2', season: '2025/26', country: 'Africa', href: '/football' },
      { name: 'NPFL — Nigeria', flag: '🇳🇬', tier: 'T1', season: '2025/26', country: 'Nigeria', href: '/football' },
      { name: 'Betway Premiership PSL', flag: '🇿🇦', tier: 'T1', season: '2025/26', country: 'South Africa', href: '/football' },
      { name: 'Botola Pro — Morocco', flag: '🇲🇦', tier: 'T1', season: '2025/26', country: 'Morocco', href: '/football' },
    ],
  },
  {
    region: 'Top 5 European Leagues',
    icon: '⭐',
    comps: [
      { name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', tier: 'T1', season: '2025/26', country: 'England', href: '/football' },
      { name: 'La Liga', flag: '🇪🇸', tier: 'T1', season: '2025/26', country: 'Spain', href: '/football' },
      { name: 'Bundesliga', flag: '🇩🇪', tier: 'T1', season: '2025/26', country: 'Germany', href: '/football' },
      { name: 'Serie A', flag: '🇮🇹', tier: 'T1', season: '2025/26', country: 'Italy', href: '/football' },
      { name: 'Ligue 1', flag: '🇫🇷', tier: 'T1', season: '2025/26', country: 'France', href: '/football' },
    ],
  },
  {
    region: 'European Cups',
    icon: '🏆',
    comps: [
      { name: 'UEFA Champions League', flag: '⭐', tier: 'T1', season: '2025/26', country: 'Europe', href: '/football' },
      { name: 'UEFA Europa League', flag: '🟠', tier: 'T2', season: '2025/26', country: 'Europe', href: '/football' },
      { name: 'UEFA Conference League', flag: '🟢', tier: 'T3', season: '2025/26', country: 'Europe', href: '/football' },
      { name: 'UEFA Super Cup', flag: '🏅', tier: 'T1', season: '2025/26', country: 'Europe', href: '/football' },
    ],
  },
  {
    region: 'FIFA Competitions',
    icon: '🌐',
    comps: [
      { name: 'FIFA World Cup 2026', flag: '🌎', tier: 'INT', season: '2026', country: 'Global', href: '/football' },
      { name: 'FIFA Club World Cup', flag: '🏆', tier: 'INT', season: '2025', country: 'Global', href: '/football' },
      { name: 'FIFA U-20 World Cup', flag: '🏆', tier: 'INT', season: '2025', country: 'Global', href: '/football' },
    ],
  },
  {
    region: 'South & North America',
    icon: '🌎',
    comps: [
      { name: 'Copa Libertadores', flag: '🏆', tier: 'T1', season: '2025/26', country: 'South America', href: '/football' },
      { name: 'Série A — Brazil', flag: '🇧🇷', tier: 'T1', season: '2025', country: 'Brazil', href: '/football' },
      { name: 'MLS — North America', flag: '🇺🇸', tier: 'T1', season: '2025', country: 'USA', href: '/football' },
      { name: 'Liga MX — Mexico', flag: '🇲🇽', tier: 'T1', season: '2025/26', country: 'Mexico', href: '/football' },
    ],
  },
];

const ANALYSIS_ARTICLES = [
  {
    tag: 'ANALYSIS',
    tagColor: 'bg-blue-600',
    title: "How Guardiola's inverted full-backs are breaking every pressing system in Europe",
    time: '2 hr ago',
    comp: 'Premier League',
    img: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=400&h=240&fit=crop&auto=format',
    slug: 'guardiola-inverted-fullbacks-pressing-system',
  },
  {
    tag: 'TRANSFER',
    tagColor: 'bg-rose-600',
    title: 'Osimhen to Al-Hilal & Premier League suitors: €120m record market valuation report',
    time: '4 hr ago',
    comp: 'Transfer Wire',
    img: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&h=240&fit=crop&auto=format',
    slug: 'osimhen-transfer-valuation-premier-league',
  },
  {
    tag: 'AFCON',
    tagColor: 'bg-amber-600',
    title: "Super Eagles' xG dominance and attacking depth make Nigeria 2026/27 favourites",
    time: '6 hr ago',
    comp: 'CAF Africa',
    img: 'https://images.unsplash.com/photo-1711645313209-a386d71bc991?w=400&h=240&fit=crop&auto=format',
    slug: 'super-eagles-xg-dominance-afcon',
  },
  {
    tag: 'STATS',
    tagColor: 'bg-purple-600',
    title: "Haaland's box conversion rate is statistically unprecedented in top-flight history",
    time: '8 hr ago',
    comp: 'Deep Data',
    img: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=240&fit=crop&auto=format',
    slug: 'haaland-conversion-rate-unprecedented',
  },
];

const COMP_FILTERS = ['All', '🏴󠁧󠁢󠁥󠁮󠁧󠁿 PL', '🇪🇸 La Liga', '🇮🇹 Serie A', '🇩🇪 Bundesliga', '⭐ UCL', '🌍 AFCON', '🇳🇬 NPFL'];

// ─── Sub-Components ───────────────────────────────────────────────────────────

function FormDot({ r }: { r: 'W' | 'D' | 'L' }) {
  return (
    <span
      className={`w-5 h-5 rounded text-[10px] font-black flex items-center justify-center ${
        r === 'W'
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          : r === 'D'
            ? 'bg-slate-700/50 text-slate-300 border border-slate-600/30'
            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
      }`}
    >
      {r}
    </span>
  );
}

function MatchCard({ f }: { f: FixtureItem }) {
  const isLive = f.status === 'LIVE' || f.status === 'HT';
  const isFT = f.status === 'FT';

  return (
    <Link
      href={`/football/matches/${f.id}`}
      className="block bg-[#0f172a] border border-[#1e293b] rounded-xl hover:border-blue-500/40 hover:bg-[#131f35] transition-all duration-200 group overflow-hidden shadow-sm"
    >
      <div className="flex items-center justify-between px-3.5 pt-3 pb-2 border-b border-[#1e293b]/60">
        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase truncate flex items-center gap-1.5">
          <span>{f.compFlag}</span>
          <span className="truncate">{f.comp}</span>
        </span>
        {isLive ? (
          <span className="flex items-center gap-1.5 text-[10px] font-black text-rose-400 uppercase tracking-widest flex-shrink-0 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block animate-pulse" />
            {f.status === 'HT' ? 'HT' : `${f.minute}'`}
          </span>
        ) : isFT ? (
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-800/60 px-2 py-0.5 rounded">
            FT {f.date || ''}
          </span>
        ) : (
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
            {f.time || 'UPCOMING'}
          </span>
        )}
      </div>

      <div className="px-3.5 py-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {f.homeLogo ? (
              <img
                src={f.homeLogo}
                alt=""
                className="w-5 h-5 object-contain rounded flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-base flex-shrink-0">{f.homeBadge}</span>
            )}
            <span className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors truncate">
              {f.home}
            </span>
          </div>
          <span
            className={`text-lg font-black tabular-nums flex-shrink-0 ${
              isLive ? 'text-white' : isFT ? 'text-slate-200' : 'text-slate-500'
            }`}
          >
            {f.hScore !== null ? f.hScore : '–'}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {f.awayLogo ? (
              <img
                src={f.awayLogo}
                alt=""
                className="w-5 h-5 object-contain rounded flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-base flex-shrink-0">{f.awayBadge}</span>
            )}
            <span className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors truncate">
              {f.away}
            </span>
          </div>
          <span
            className={`text-lg font-black tabular-nums flex-shrink-0 ${
              isLive ? 'text-white' : isFT ? 'text-slate-200' : 'text-slate-500'
            }`}
          >
            {f.aScore !== null ? f.aScore : '–'}
          </span>
        </div>
      </div>

      {(f.stadium || (f.date && !isFT)) && (
        <div className="px-3.5 pb-2.5 text-[10px] text-slate-500 truncate border-t border-[#1e293b]/40 pt-1.5 flex items-center justify-between">
          <span className="truncate">{f.stadium ? `🏟️ ${f.stadium}` : f.date}</span>
          <span className="text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform">
            Details →
          </span>
        </div>
      )}
    </Link>
  );
}

function SideSection({
  title,
  children,
  defaultOpen = true,
  action,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  action?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-sm">
      <button
        className="w-full flex items-center justify-between px-4 py-3 border-b border-[#1e293b] hover:bg-[#1e293b]/30 transition-colors lg:cursor-default group text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
          {title}
        </span>
        <div className="flex items-center gap-2">
          {action && <span className="hidden lg:block">{action}</span>}
          <FiChevronDown
            className={`w-4 h-4 text-slate-500 transition-transform lg:hidden ${
              open ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      <div className={`${open ? 'block' : 'hidden'} lg:block`}>
        {children}
        {action && (
          <div className="px-4 py-2 border-t border-[#1e293b] lg:hidden bg-[#0a1120]">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export interface FootballPageClientProps {
  initialPlayers?: PlayerMeta[];
  initialOfficials?: OfficialMeta[];
  initialCoaches?: CoachMeta[];
  initialClubs?: ClubMeta[];
}

export function FootballPageClient({
  initialPlayers,
  initialOfficials,
  initialCoaches,
  initialClubs,
}: FootballPageClientProps) {
  const [mainTab, setMainTab] = useState<MainTab>('live');
  const [compFilter, setCompFilter] = useState('All');
  const [tableLeague, setTableLeague] = useState('Premier League');
  const [expandedComp, setExpandedComp] = useState<string | null>('Africa (CAF)');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic Matches State
  const [liveFixtures, setLiveFixtures] = useState<FixtureItem[]>(DEFAULT_LIVE_FIXTURES);
  const [upcomingFixtures, setUpcomingFixtures] = useState<FixtureItem[]>(DEFAULT_UPCOMING_FIXTURES);
  const [resultsFixtures, setResultsFixtures] = useState<FixtureItem[]>(DEFAULT_RESULTS);

  // Daily Brief Newsletter State
  const [briefEmail, setBriefEmail] = useState('');
  const [briefSubscribed, setBriefSubscribed] = useState(false);
  const [briefSubmitting, setBriefSubmitting] = useState(false);
  const [briefMessage, setBriefMessage] = useState('');

  // Loaded Entities from Registry or Props
  const players = useMemo(() => {
    return initialPlayers || EntityService.getAllPlayers();
  }, [initialPlayers]);

  const officials = useMemo(() => {
    return initialOfficials || EntityService.getAllOfficials();
  }, [initialOfficials]);

  const coaches = useMemo(() => {
    return initialCoaches || EntityService.getAllCoaches();
  }, [initialCoaches]);

  const clubs = useMemo(() => {
    if (initialClubs && initialClubs.length > 0) return initialClubs;
    return [...EntityService.getAfricanClubs(), ...EntityService.getAllClubs()].slice(0, 10);
  }, [initialClubs]);

  // Featured subsets
  const featuredSuperstars = useMemo(() => {
    const af = players.filter((p) => p.africanOrigin);
    const gl = players.filter((p) => !p.africanOrigin);
    return [...af.slice(0, 4), ...gl.slice(0, 4)];
  }, [players]);

  const featuredOfficials = useMemo(() => {
    return officials.slice(0, 6);
  }, [officials]);

  const featuredCoaches = useMemo(() => {
    return coaches.slice(0, 6);
  }, [coaches]);

  // Live score counting
  const liveCount = useMemo(() => {
    return liveFixtures.filter((f) => f.status === 'LIVE' || f.status === 'HT').length;
  }, [liveFixtures]);

  // Fetch real matches from live API with fallbacks
  const fetchLiveMatches = useCallback(async () => {
    setIsSyncing(true);
    try {
      const timestamp = Date.now();
      const res = await fetch(`/api/football?met=Livescore&_t=${timestamp}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const fList = data?.result || data?.response || (Array.isArray(data) ? data : []);
        if (Array.isArray(fList) && fList.length > 0) {
          const parsedLive: FixtureItem[] = fList.slice(0, 20).map((m: any, idx: number) => {
            const rawStatus = (m.event_status || '').trim();
            const isHT = rawStatus.toLowerCase().includes('ht') || rawStatus.toLowerCase().includes('half');
            const minute = rawStatus ? (rawStatus.endsWith("'") ? rawStatus.replace("'", '') : rawStatus) : 'LIVE';
            return {
              id: String(m.event_key || `live-${idx}`),
              comp: m.league_name || 'Football League',
              compFlag: '⚽',
              home: m.event_home_team || 'Home',
              homeBadge: '🔵',
              homeLogo: m.home_team_logo,
              away: m.event_away_team || 'Away',
              awayBadge: '🔴',
              awayLogo: m.away_team_logo,
              hScore: m.event_final_result ? m.event_final_result.split('-')[0]?.trim() : (m.event_home_final_result ?? 0),
              aScore: m.event_final_result ? m.event_final_result.split('-')[1]?.trim() : (m.event_away_final_result ?? 0),
              minute: isHT ? 'HT' : minute,
              status: isHT ? 'HT' : 'LIVE',
              stadium: m.event_stadium || undefined,
            };
          });
          setLiveFixtures(parsedLive);
        }
      }

      // Fetch fixtures for upcoming/results
      const fixRes = await fetch(`/api/football?met=Fixtures&_t=${timestamp}`, { cache: 'no-store' });
      if (fixRes.ok) {
        const fixData = await fixRes.json();
        const fixList = fixData?.result || fixData?.response || (Array.isArray(fixData) ? fixData : []);
        if (Array.isArray(fixList) && fixList.length > 0) {
          const up: FixtureItem[] = [];
          const ft: FixtureItem[] = [];
          fixList.forEach((m: any, idx: number) => {
            const rawStatus = (m.event_status || '').trim();
            const isFinished = rawStatus === 'Finished' || rawStatus === 'FT';
            const item: FixtureItem = {
              id: String(m.event_key || `fix-${idx}`),
              comp: m.league_name || 'Football League',
              compFlag: '⚽',
              home: m.event_home_team || 'Home',
              homeBadge: '⚪',
              homeLogo: m.home_team_logo,
              away: m.event_away_team || 'Away',
              awayBadge: '⚫',
              awayLogo: m.away_team_logo,
              hScore: m.event_final_result ? m.event_final_result.split('-')[0]?.trim() : (m.event_home_final_result ?? null),
              aScore: m.event_final_result ? m.event_final_result.split('-')[1]?.trim() : (m.event_away_final_result ?? null),
              minute: null,
              status: isFinished ? 'FT' : 'UPCOMING',
              time: m.event_time || undefined,
              date: m.event_date || undefined,
              stadium: m.event_stadium || undefined,
            };
            if (isFinished) ft.push(item);
            else up.push(item);
          });
          if (up.length > 0) setUpcomingFixtures(up.slice(0, 16));
          if (ft.length > 0) setResultsFixtures(ft.slice(0, 16));
        }
      }

      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch {
      // Fallbacks already in state
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveMatches();
    const interval = setInterval(fetchLiveMatches, 25_000);
    return () => clearInterval(interval);
  }, [fetchLiveMatches]);

  const tabFixtures: Partial<Record<MainTab, FixtureItem[]>> = {
    live: liveFixtures,
    upcoming: upcomingFixtures,
    results: resultsFixtures,
  };

  const currentFixtures = useMemo(() => {
    const list = tabFixtures[mainTab] ?? [];
    if (compFilter === 'All') return list;
    const cleanFilter = compFilter.replace(/[^a-zA-Z]/g, '').toLowerCase();
    return list.filter((f) => {
      const c = f.comp.toLowerCase();
      if (cleanFilter === 'pl') return c.includes('premier') || c.includes('england');
      if (cleanFilter === 'laliga') return c.includes('la liga') || c.includes('spain');
      if (cleanFilter === 'seriea') return c.includes('serie a') || c.includes('italy');
      if (cleanFilter === 'bundesliga') return c.includes('bundesliga') || c.includes('germany');
      if (cleanFilter === 'ucl') return c.includes('champions league') || c.includes('ucl');
      if (cleanFilter === 'afcon') return c.includes('afcon') || c.includes('caf') || c.includes('africa');
      if (cleanFilter === 'npfl') return c.includes('npfl') || c.includes('nigeria');
      return c.includes(cleanFilter);
    });
  }, [tabFixtures, mainTab, compFilter]);

  const isFixtureTab = mainTab === 'live' || mainTab === 'upcoming' || mainTab === 'results';

  // Handle newsletter subscribe for Daily Brief
  const handleBriefSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!briefEmail.trim()) return;
    setBriefSubmitting(true);
    setBriefMessage('');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: briefEmail.trim(),
          source: 'football_daily_brief',
          frequency: 'daily',
        }),
      });
      const data = await res.json();
      if (res.ok && (data.success || data.subscribed)) {
        setBriefSubscribed(true);
      } else {
        setBriefMessage(data.message || 'Subscription registered! Check your inbox.');
        setBriefSubscribed(true);
      }
    } catch {
      setBriefSubscribed(true);
    } finally {
      setBriefSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      {/* ════════════════════════════════════════
          HERO BANNER
      ════════════════════════════════════════ */}
      <div className="hidden md:block relative bg-gradient-to-b from-[#0a1628] via-[#040d1a] to-[#020617] border-b border-[#1e293b] overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img
            src="https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=1400&h=300&fit=crop&auto=format"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/95 via-transparent to-[#020617]/95" />
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-rose-500 to-amber-400" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                <span className="text-2xl">⚽</span>
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded">
                  GoalMills Football Centre
                </span>
                {liveCount > 0 && (
                  <span className="flex items-center gap-1.5 bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
                    {liveCount} Live Matches
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Football Match Centre
              </h1>
              <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Live scores, fixtures, tables, tactical analytics, and superstar valuations across 75+
                competitions — from the Premier League and Champions League to CAF and AFCON.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-[#0f172a] border border-[#1e293b] px-3.5 py-2.5 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                <span>Live Feed: {lastSyncTime}</span>
              </span>
              <button
                onClick={fetchLiveMatches}
                disabled={isSyncing}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-blue-600/20 cursor-pointer"
              >
                <FiRefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Live'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          3-COLUMN MAIN DASHBOARD
      ════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[256px_1fr] xl:grid-cols-[256px_1fr_288px] gap-6 items-start">
          {/* ──────────────────────────────────────────
              LEFT SIDEBAR
          ────────────────────────────────────────── */}
          <aside className="hidden lg:block space-y-5 lg:sticky lg:top-24">
            {/* Football Analysis Articles */}
            <SideSection
              title="Football Analysis"
              action={
                <Link
                  href="/analysis"
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-bold transition-colors"
                >
                  All →
                </Link>
              }
            >
              <div className="divide-y divide-[#1e293b]">
                {ANALYSIS_ARTICLES.map((a, i) => (
                  <Link
                    key={i}
                    href={`/news/${a.slug}`}
                    className="flex gap-3 p-3.5 hover:bg-[#1e293b]/40 transition-colors group cursor-pointer"
                  >
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800">
                      <img
                        src={a.img}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-85"
                      />
                      <span
                        className={`absolute top-1 left-1 ${a.tagColor} text-white text-[8px] font-black uppercase px-1 py-0.5 rounded leading-tight`}
                      >
                        {a.tag}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1">
                        {a.comp}
                      </p>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-white leading-snug line-clamp-2 transition-colors">
                        {a.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1">{a.time}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </SideSection>

            {/* Competition Directory */}
            <SideSection
              title="Competition Directory"
              defaultOpen={false}
              action={<span className="text-[10px] text-slate-500 font-semibold">75+ Leagues</span>}
            >
              <div className="divide-y divide-[#1e293b]">
                {COMP_GROUPS.map((group) => (
                  <div key={group.region}>
                    <button
                      onClick={() => setExpandedComp(expandedComp === group.region ? null : group.region)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#1e293b]/40 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{group.icon}</span>
                        <span className="text-xs font-semibold text-slate-300">{group.region}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-semibold">
                          {group.comps.length}
                        </span>
                        <FiChevronDown
                          className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                            expandedComp === group.region ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>
                    {expandedComp === group.region && (
                      <div className="bg-[#080f1f] border-t border-[#1e293b] divide-y divide-[#1e293b]/60">
                        {group.comps.map((c) => (
                          <Link
                            key={c.name}
                            href={c.href || '/football'}
                            className="flex items-center gap-2.5 px-5 py-2 hover:bg-[#1e293b]/60 transition-colors group"
                          >
                            <span className="text-base flex-shrink-0">{c.flag}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-semibold text-slate-300 group-hover:text-white transition-colors truncate">
                                {c.name}
                              </p>
                              <p className="text-[10px] text-slate-500">{c.country}</p>
                            </div>
                            <span
                              className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${
                                c.tier === 'T1'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : c.tier === 'T2'
                                    ? 'bg-orange-500/20 text-orange-400'
                                    : 'bg-yellow-500/20 text-yellow-400'
                              }`}
                            >
                              {c.tier}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SideSection>

            {/* Featured Club Hubs */}
            <SideSection
              title="Featured Club Hubs"
              defaultOpen={false}
              action={
                <Link
                  href="/football/teams"
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-bold transition-colors"
                >
                  All →
                </Link>
              }
            >
              <div className="grid grid-cols-2 gap-px bg-[#1e293b]">
                {clubs.slice(0, 8).map((club) => (
                  <Link
                    key={club.slug}
                    href={`/football/teams/${club.slug}`}
                    className="flex flex-col items-center gap-1.5 p-3.5 bg-[#0f172a] hover:bg-[#131f35] transition-colors group text-center"
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/80 p-1">
                      {club.logo ? (
                        <img
                          src={club.logo}
                          alt=""
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-xl">⚽</span>
                      )}
                    </div>
                    <p className="text-[11px] font-bold text-slate-200 group-hover:text-white transition-colors leading-tight line-clamp-1">
                      {club.shortName || club.name}
                    </p>
                    <p className="text-[9px] text-slate-500 leading-tight">
                      {club.manager ? `Mgr: ${club.manager}` : 'Football Club'}
                    </p>
                    <p className="text-[9px] text-blue-400 font-semibold group-hover:text-blue-300 transition-colors mt-0.5">
                      Hub →
                    </p>
                  </Link>
                ))}
              </div>
            </SideSection>
          </aside>

          {/* ──────────────────────────────────────────
              CENTER COLUMN (MAIN CONTENT)
          ────────────────────────────────────────── */}
          <div className="min-w-0 space-y-6">
            {/* Mobile Dropdown Side Menu (Football Analysis, Competition Directory, Featured Club Hubs) */}
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#0f172a] border border-[#1e293b] hover:border-blue-500/50 rounded-2xl shadow-sm text-xs font-black uppercase tracking-wider text-slate-200 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <FiLayers className="w-3.5 h-3.5" />
                  </span>
                  <div className="text-left">
                    <p className="text-xs font-black text-white">Football Hubs & Directory</p>
                    <p className="text-[10px] text-slate-400 font-normal">Analysis · 75+ Competitions · Club Hubs</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-blue-400 border border-slate-700">
                    {mobileMenuOpen ? 'Close Menu' : 'Explore Menu'}
                  </span>
                  <FiChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      mobileMenuOpen ? 'rotate-180 text-blue-400' : ''
                    }`}
                  />
                </div>
              </button>

              {mobileMenuOpen && (
                <div className="mt-3 space-y-4 p-3.5 bg-[#080f1e] border border-blue-500/30 rounded-2xl shadow-xl animate-fadeIn">
                  {/* Football Analysis */}
                  <SideSection
                    title="Football Analysis"
                    defaultOpen={true}
                    action={
                      <Link href="/analysis" className="text-[10px] text-blue-400 hover:text-blue-300 font-bold">
                        All →
                      </Link>
                    }
                  >
                    <div className="divide-y divide-[#1e293b]">
                      {ANALYSIS_ARTICLES.slice(0, 4).map((a, i) => (
                        <Link
                          key={i}
                          href={`/news/${a.slug}`}
                          className="flex gap-3 p-3 hover:bg-[#1e293b]/40 transition-colors group cursor-pointer"
                        >
                          <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800">
                            <img src={a.img} alt="" className="w-full h-full object-cover opacity-85" />
                            <span className={`absolute top-1 left-1 ${a.tagColor} text-white text-[8px] font-black uppercase px-1 py-0.5 rounded`}>
                              {a.tag}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-semibold text-blue-400 uppercase tracking-wider mb-0.5">{a.comp}</p>
                            <h4 className="text-xs font-bold text-slate-200 group-hover:text-white leading-tight line-clamp-2">{a.title}</h4>
                            <p className="text-[9px] text-slate-500 mt-1">{a.time}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </SideSection>

                  {/* Competition Directory */}
                  <SideSection
                    title="Competition Directory"
                    defaultOpen={false}
                    action={<span className="text-[10px] text-slate-500 font-semibold">75+ Leagues</span>}
                  >
                    <div className="divide-y divide-[#1e293b]">
                      {COMP_GROUPS.map((group) => (
                        <div key={group.region}>
                          <button
                            onClick={() => setExpandedComp(expandedComp === group.region ? null : group.region)}
                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#1e293b]/40 transition-colors text-left"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{group.icon}</span>
                              <span className="text-xs font-semibold text-slate-300">{group.region}</span>
                            </div>
                            <FiChevronDown
                              className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                                expandedComp === group.region ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          {expandedComp === group.region && (
                            <div className="bg-[#080f1f] border-t border-[#1e293b] divide-y divide-[#1e293b]/60">
                              {group.comps.map((c) => (
                                <Link
                                  key={c.name}
                                  href={c.href || '/football'}
                                  className="flex items-center gap-2 px-3 py-2 hover:bg-[#1e293b]/60 transition-colors"
                                >
                                  <span className="text-sm">{c.flag}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-semibold text-slate-300 truncate">{c.name}</p>
                                    <p className="text-[9px] text-slate-500">{c.country}</p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </SideSection>

                  {/* Featured Club Hubs */}
                  <SideSection
                    title="Featured Club Hubs"
                    defaultOpen={false}
                    action={
                      <Link href="/football/teams" className="text-[10px] text-blue-400 hover:text-blue-300 font-bold">
                        All →
                      </Link>
                    }
                  >
                    <div className="grid grid-cols-2 gap-px bg-[#1e293b]">
                      {clubs.slice(0, 8).map((club) => (
                        <Link
                          key={club.slug}
                          href={`/football/teams/${club.slug}`}
                          className="flex flex-col items-center gap-1.5 p-3 bg-[#0f172a] hover:bg-[#131f35] transition-colors text-center"
                        >
                          <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/80 p-0.5">
                            {club.logo ? (
                              <img src={club.logo} alt="" className="w-5 h-5 object-contain" />
                            ) : (
                              <span className="text-base">⚽</span>
                            )}
                          </div>
                          <p className="text-[10px] font-bold text-slate-200 leading-tight line-clamp-1">{club.shortName || club.name}</p>
                          <span className="text-[9px] text-blue-400 font-semibold">Hub →</span>
                        </Link>
                      ))}
                    </div>
                  </SideSection>
                </div>
              )}
            </div>

            {/* Tab Bar */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-sm">
              <div className="flex overflow-x-auto no-scrollbar">
                {(['live', 'upcoming', 'results', 'table', 'scorers', 'odds'] as MainTab[]).map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setMainTab(tab)}
                      className={`flex-shrink-0 flex items-center gap-2 px-5 py-3.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                        mainTab === tab
                          ? 'border-blue-500 text-white bg-blue-500/10'
                          : 'border-transparent text-slate-400 hover:text-white hover:bg-[#1e293b]/40'
                      }`}
                    >
                      {tab === 'live' && liveCount > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                      )}
                      <span>
                        {tab === 'live'
                          ? 'Live'
                          : tab === 'upcoming'
                            ? 'Upcoming'
                            : tab === 'results'
                              ? 'Results'
                              : tab === 'table'
                                ? 'Table'
                                : tab === 'scorers'
                                  ? 'Top Scorer'
                                  : 'Odds'}
                      </span>
                      {tab === 'live' && liveCount > 0 && (
                        <span className="bg-rose-500/20 text-rose-400 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-rose-500/30">
                          {liveCount}
                        </span>
                      )}
                    </button>
                  )
                )}
              </div>

              {/* League Quick Filters */}
              {isFixtureTab && (
                <div className="flex gap-2 px-4 py-3 border-t border-[#1e293b] overflow-x-auto no-scrollbar bg-[#091120]">
                  {COMP_FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setCompFilter(f)}
                      className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        compFilter === f
                          ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                          : 'bg-transparent border-[#1e293b] text-slate-400 hover:border-[#334155] hover:text-slate-200'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Fixtures Grid Tab ── */}
            {isFixtureTab && (
              <>
                {currentFixtures.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {currentFixtures.map((f) => (
                      <MatchCard key={f.id} f={f} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl py-16 text-center">
                    <p className="text-3xl mb-3">📋</p>
                    <p className="text-slate-300 font-bold">No fixtures found for {compFilter}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      Try selecting &quot;All&quot; or another competition filter.
                    </p>
                    <button
                      onClick={() => setCompFilter('All')}
                      className="mt-4 text-xs text-blue-400 font-bold hover:underline"
                    >
                      Reset filter
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ── Standings Tab ── */}
            {mainTab === 'table' && (
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'CAF Champions League'].map(
                    (l) => (
                      <button
                        key={l}
                        onClick={() => setTableLeague(l)}
                        className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                          tableLeague === l
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                            : 'border-[#1e293b] text-slate-400 hover:border-[#334155] hover:text-white'
                        }`}
                      >
                        {l}
                      </button>
                    )
                  )}
                </div>

                <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-5 py-3.5 border-b border-[#1e293b] flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest flex items-center gap-2">
                      <span>🏆</span>
                      <span>{tableLeague} · 2025/2026 Standings</span>
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">Live Points Table</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#1e293b] bg-[#091120]">
                          {['#', 'Club', 'P', 'W', 'D', 'L', 'GD', 'Pts', 'Form'].map((h, i) => (
                            <th
                              key={h}
                              className={`py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-widest ${
                                i === 0
                                  ? 'pl-5 pr-2 text-left'
                                  : i === 1
                                    ? 'px-3 text-left'
                                    : i === 8
                                      ? 'pr-5 pl-2 text-right hidden md:table-cell'
                                      : 'px-2 text-center'
                              }`}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e293b]">
                        {PL_TABLE.map((row) => (
                          <tr
                            key={row.pos}
                            className={`hover:bg-[#1e293b]/40 transition-colors ${
                              row.zone === 'champions'
                                ? 'border-l-2 border-l-blue-500 bg-blue-500/[0.02]'
                                : row.zone === 'europa'
                                  ? 'border-l-2 border-l-amber-500 bg-amber-500/[0.02]'
                                  : row.zone === 'relegation'
                                    ? 'border-l-2 border-l-rose-500 bg-rose-500/[0.02]'
                                    : ''
                            }`}
                          >
                            <td className="pl-5 pr-2 py-3">
                              <span
                                className={`text-sm font-black tabular-nums ${
                                  row.zone === 'champions'
                                    ? 'text-blue-400'
                                    : row.zone === 'relegation'
                                      ? 'text-rose-400'
                                      : 'text-slate-400'
                                }`}
                              >
                                {row.pos}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <Link
                                href={`/football/teams/${row.slug || 'arsenal'}`}
                                className="flex items-center gap-2 group/link"
                              >
                                <span className="text-sm">{row.badge}</span>
                                <span className="text-sm font-semibold text-slate-100 group-hover/link:text-blue-400 transition-colors">
                                  {row.team}
                                </span>
                              </Link>
                            </td>
                            <td className="px-2 py-3 text-center text-sm text-slate-400 tabular-nums">
                              {row.p}
                            </td>
                            <td className="px-2 py-3 text-center text-sm text-slate-300 tabular-nums font-semibold">
                              {row.w}
                            </td>
                            <td className="px-2 py-3 text-center text-sm text-slate-300 tabular-nums">
                              {row.d}
                            </td>
                            <td className="px-2 py-3 text-center text-sm text-slate-300 tabular-nums">
                              {row.l}
                            </td>
                            <td className="px-2 py-3 text-center text-sm tabular-nums">
                              <span
                                className={
                                  row.gd > 0
                                    ? 'text-emerald-400 font-bold'
                                    : row.gd < 0
                                      ? 'text-rose-400 font-bold'
                                      : 'text-slate-400'
                                }
                              >
                                {row.gd > 0 ? `+${row.gd}` : row.gd}
                              </span>
                            </td>
                            <td className="px-2 py-3 text-center">
                              <span className="text-sm font-black text-white tabular-nums bg-slate-800/80 px-2 py-1 rounded">
                                {row.pts}
                              </span>
                            </td>
                            <td className="pr-5 pl-2 py-3 hidden md:table-cell">
                              <div className="flex gap-1 justify-end">
                                {row.form.map((f, i) => (
                                  <FormDot key={i} r={f} />
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-5 py-3 border-t border-[#1e293b] flex flex-wrap gap-5 text-[10px] text-slate-400 bg-[#091120]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2.5 rounded-sm bg-blue-500 inline-block" />
                      Champions League Qualification
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2.5 rounded-sm bg-amber-500 inline-block" />
                      Europa League Qualification
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2.5 rounded-sm bg-rose-500 inline-block" />
                      Relegation Zone
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Top Scorers Tab ── */}
            {mainTab === 'scorers' && (
              <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 border-b border-[#1e293b] flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest flex items-center gap-2">
                    <span>👟</span>
                    <span>European & African Golden Boot Race — 2025/2026</span>
                  </h3>
                  <Link
                    href="/football/players"
                    className="text-[10px] text-blue-400 hover:underline font-bold"
                  >
                    View All Players →
                  </Link>
                </div>

                <div className="divide-y divide-[#1e293b]">
                  {TOP_SCORERS.map((p) => (
                    <Link
                      key={p.rank}
                      href={`/football/players/${p.playerId}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-[#1e293b]/40 transition-colors group"
                    >
                      <span
                        className={`w-7 text-center text-sm font-black flex-shrink-0 ${
                          p.rank === 1
                            ? 'text-amber-400 text-lg'
                            : p.rank === 2
                              ? 'text-slate-300 text-lg'
                              : p.rank === 3
                                ? 'text-amber-600 text-lg'
                                : 'text-slate-500'
                        }`}
                      >
                        {p.rank <= 3 ? ['🥇', '🥈', '🥉'][p.rank - 1] : p.rank}
                      </span>

                      <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700">
                        <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors truncate">
                          {p.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {p.flag} · {p.badge} {p.team}
                        </p>
                      </div>

                      <div className="flex items-center gap-5 text-right flex-shrink-0">
                        <div>
                          <p className="text-lg font-black text-amber-400 tabular-nums">
                            {p.goals}
                          </p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                            Goals
                          </p>
                        </div>
                        <div className="hidden sm:block">
                          <p className="text-sm font-black text-blue-400 tabular-nums">
                            {p.assists}
                          </p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                            Assists
                          </p>
                        </div>
                        <div className="hidden sm:block">
                          <p className="text-sm font-black text-slate-300 tabular-nums">
                            {p.apps}
                          </p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                            Apps
                          </p>
                        </div>
                        <FiChevronRight className="text-slate-600 group-hover:text-white transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ── Odds Tab ── */}
            {mainTab === 'odds' && (
              <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-8 sm:p-12 text-center shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4 text-3xl">
                  📊
                </div>
                <h3 className="text-xl font-black text-white mb-2">
                  Match Odds & Real-Time Markets
                </h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                  Upcoming fixtures will display comprehensive 1X2 odds, over/under goal markets, and
                  win probabilities powered by certified bookmaker feeds.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                    Premier League 1X2
                  </span>
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                    Champions League Outrights
                  </span>
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                    Both Teams to Score (BTTS)
                  </span>
                </div>
                <button
                  onClick={() => alert('You will be notified when live odds markets launch.')}
                  className="mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  Get Market Alerts
                </button>
              </div>
            )}
          </div>

          {/* ──────────────────────────────────────────
              RIGHT SIDEBAR (XL screens only)
          ────────────────────────────────────────── */}
          <aside className="hidden xl:block space-y-5 sticky top-24">
            {/* Live Now Widget */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-[#1e293b] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400 inline-block animate-pulse" />
                  <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    Live Now
                  </h3>
                </div>
                <span className="text-[10px] font-black text-rose-400">{liveCount} matches</span>
              </div>
              <div className="divide-y divide-[#1e293b]">
                {liveFixtures.slice(0, 3).map((f) => (
                  <Link
                    key={f.id}
                    href={`/football/matches/${f.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#1e293b]/40 transition-colors group"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                          {f.home}
                        </span>
                        <span className="text-sm font-black text-white tabular-nums ml-2">
                          {f.hScore}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                          {f.away}
                        </span>
                        <span className="text-sm font-black text-white tabular-nums ml-2">
                          {f.aScore}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-rose-400 flex-shrink-0 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                      {f.minute}&apos;
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Standings Widget */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-[#1e293b] flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  PL Top 6
                </h3>
                <button
                  onClick={() => setMainTab('table')}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer"
                >
                  Full →
                </button>
              </div>
              <div className="divide-y divide-[#1e293b]">
                {PL_TABLE.slice(0, 6).map((row) => (
                  <div
                    key={row.pos}
                    className={`flex items-center gap-2.5 px-4 py-2 hover:bg-[#1e293b]/40 transition-colors ${
                      row.zone === 'champions'
                        ? 'border-l-2 border-l-blue-500'
                        : row.zone === 'europa'
                          ? 'border-l-2 border-l-amber-500'
                          : ''
                    }`}
                  >
                    <span
                      className={`text-xs font-black w-4 tabular-nums ${
                        row.zone === 'champions' ? 'text-blue-400' : 'text-slate-500'
                      }`}
                    >
                      {row.pos}
                    </span>
                    <span className="text-sm flex-shrink-0">{row.badge}</span>
                    <span className="text-xs font-semibold text-slate-200 flex-1 truncate">
                      {row.team}
                    </span>
                    <span className="text-xs font-black text-white tabular-nums">{row.pts}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Scorers Widget */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-[#1e293b] flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  Golden Boot
                </h3>
                <button
                  onClick={() => setMainTab('scorers')}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer"
                >
                  Full →
                </button>
              </div>
              <div className="divide-y divide-[#1e293b]">
                {TOP_SCORERS.slice(0, 4).map((p) => (
                  <Link
                    key={p.rank}
                    href={`/football/players/${p.playerId}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#1e293b]/40 transition-colors group"
                  >
                    <span className="text-xs font-black text-slate-500 w-4 tabular-nums">
                      {p.rank}
                    </span>
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                      <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {p.badge} {p.team}
                      </p>
                    </div>
                    <span className="text-sm font-black text-amber-400 tabular-nums">
                      {p.goals}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* ════════════════════════════════════════
            SPECIAL SECTION 1: SUPERSTARS & PLAYERS
        ════════════════════════════════════════ */}
        <section className="mt-14 pt-10 border-t border-[#1e293b]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                  Global & African Icons
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Superstars & Players
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Real-time 2026/2027 market valuations, scoring efficiency, and contract profiles.
              </p>
            </div>
            <Link
              href="/football/players"
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-4 py-2.5 rounded-xl transition-colors group"
            >
              <span>Explore All Players & Valuations</span>
              <FiChevronRight className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredSuperstars.map((p) => (
              <Link
                key={p.slug}
                href={`/football/players/${p.slug}`}
                className="group relative bg-[#0f172a] border border-[#1e293b] hover:border-amber-500/40 rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-amber-500/5 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
                    <img
                      src={p.photo}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-0 right-0 text-xs px-1 bg-slate-900/90 rounded-tl">
                      {p.countryFlag || '🌍'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="inline-block text-[11px] font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                      {p.marketValue || '€70.00m'}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">
                      Market Value
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-black text-slate-100 group-hover:text-white transition-colors truncate">
                    {p.name}
                  </h4>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {p.position} · {p.clubName}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1e293b] flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Goals: <strong className="text-white font-bold">{p.seasonStats?.goals ?? 18}</strong>
                  </span>
                  <span>
                    Assists: <strong className="text-blue-400 font-bold">{p.seasonStats?.assists ?? 6}</strong>
                  </span>
                  <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                    Age {p.age}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════
            SPECIAL SECTION 2: MATCH OFFICIALS & VAR
        ════════════════════════════════════════ */}
        <section className="mt-14 pt-10 border-t border-[#1e293b]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-[11px] font-black uppercase tracking-widest text-rose-400">
                  🚩 The Arbiters
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Match Officials & VAR
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                FIFA referee records, strictness indices, cards per match, and VAR review accuracy.
              </p>
            </div>
            <Link
              href="/football/officials"
              className="inline-flex items-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 rounded-xl transition-colors group"
            >
              <span>Explore Officials & VAR Desk</span>
              <FiChevronRight className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredOfficials.map((o) => (
              <Link
                key={o.slug}
                href={`/football/officials/${o.slug}`}
                className="group bg-[#0f172a] border border-[#1e293b] hover:border-rose-500/40 rounded-2xl p-4 transition-all duration-300 shadow-sm hover:shadow-rose-500/5 hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
                    <img
                      src={o.photo}
                      alt={o.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-black text-slate-100 group-hover:text-white transition-colors truncate">
                      {o.name}
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{o.countryFlag}</span>
                      <span>{o.country}</span>
                      <span className="text-[10px] text-slate-500">· FIFA since {o.fifaBadgeSince}</span>
                    </p>
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border flex-shrink-0 ${
                      o.strictnessRating === 'Strict'
                        ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                        : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    }`}
                  >
                    {o.strictnessRating || 'Strict'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-[#0a1120] rounded-xl border border-[#1e293b] text-center">
                  <div>
                    <span className="text-xs font-black text-white">{o.matches || 28}</span>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider">Matches</p>
                  </div>
                  <div>
                    <span className="text-xs font-black text-amber-400">
                      {o.yellowCardsPerGame?.toFixed(1) || '4.1'}
                    </span>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider">Cards/Gm</p>
                  </div>
                  <div>
                    <span className="text-xs font-black text-blue-400">
                      {o.varAccuracy || '98.5%'}
                    </span>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider">VAR Acc.</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════
            SPECIAL SECTION 3: TACTICIANS & MANAGERS
        ════════════════════════════════════════ */}
        <section className="mt-14 pt-10 border-t border-[#1e293b]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[11px] font-black uppercase tracking-widest text-blue-400">
                  Masterminds on the Touchline
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Tacticians & Managers
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Tactical formations, win records, philosophy breakdowns, and silverware counts.
              </p>
            </div>
            <Link
              href="/football/coaches"
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-4 py-2.5 rounded-xl transition-colors group"
            >
              <span>View All Managers & Systems</span>
              <FiChevronRight className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredCoaches.map((c) => (
              <Link
                key={c.slug}
                href={`/football/coaches/${c.slug}`}
                className="group bg-[#0f172a] border border-[#1e293b] hover:border-blue-500/40 rounded-2xl p-4 transition-all duration-300 shadow-sm hover:shadow-blue-500/5 hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
                    <img
                      src={c.photo}
                      alt={c.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-black text-slate-100 group-hover:text-white transition-colors truncate">
                      {c.name}
                    </h4>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {c.currentClubName} · {c.nationality}
                    </p>
                  </div>
                  <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md flex-shrink-0 flex items-center gap-1">
                    <span>🏆</span>
                    <span>{c.trophiesCount || 8}</span>
                  </span>
                </div>

                <div className="space-y-2 mt-2 pt-3 border-t border-[#1e293b]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">System:</span>
                    <span className="font-bold text-slate-200">
                      {c.preferredFormation || '4-3-3 Attacking'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Win Rate:</span>
                    <span className="font-black text-emerald-400">
                      {c.winPercentage?.toFixed(1) || '64.0'}%
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════
            SPECIAL SECTION 4: FOOTBALL DAILY BRIEF
        ════════════════════════════════════════ */}
        <section className="mt-14 pt-10 border-t border-[#1e293b]">
          <div className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-[#0a1628] via-[#091a32] to-[#040d1a] p-6 sm:p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left briefing text */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-[10px] font-black uppercase tracking-widest text-blue-300">
                    📰 GoalMills Intelligence
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Daily 10:00 AM WAT Edition
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Football Daily Brief
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed">
                  Start your morning with our curated tactical briefing, breaking African transfer
                  wires, injury alerts, and VAR debriefs synthesized for coaches, scouts, and football
                  fanatics.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-[#0f172a]/80 border border-slate-800 rounded-xl p-3">
                    <span className="text-amber-400 text-sm font-bold">⚡ Transfer Pulse</span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Saudi Pro League & European deadline day moves vetted in real-time.
                    </p>
                  </div>
                  <div className="bg-[#0f172a]/80 border border-slate-800 rounded-xl p-3">
                    <span className="text-blue-400 text-sm font-bold">📐 Tactical Breakdown</span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Full pitch maps and xG overperformance reports.
                    </p>
                  </div>
                  <div className="bg-[#0f172a]/80 border border-slate-800 rounded-xl p-3">
                    <span className="text-emerald-400 text-sm font-bold">🌍 African Wire</span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      CAF Champions League & NPFL insider reporting.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right newsletter subscribe box */}
              <div className="lg:col-span-5 bg-[#0f172a]/90 border border-[#1e293b] rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md">
                {briefSubscribed ? (
                  <div className="text-center py-6 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-xl">
                      ✓
                    </div>
                    <h4 className="text-base font-bold text-white">You&apos;re subscribed!</h4>
                    <p className="text-xs text-slate-400">
                      Tomorrow&apos;s Football Daily Brief will arrive in your inbox at 10:00 AM WAT.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleBriefSubscribe} className="space-y-3.5">
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">
                        Get the Morning Debrief
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Join 45,000+ football scouts, managers, and fans. 100% free, unsubscribe anytime.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="relative">
                        <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                        <input
                          type="email"
                          required
                          value={briefEmail}
                          onChange={(e) => setBriefEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#06101E] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={briefSubmitting}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-all shadow-md shadow-blue-600/30 cursor-pointer disabled:opacity-50"
                      >
                        {briefSubmitting ? 'Subscribing...' : 'Subscribe to Football Brief'}
                      </button>
                    </div>

                    {briefMessage && (
                      <p className="text-[10px] text-amber-400 text-center">{briefMessage}</p>
                    )}

                    <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 pt-1">
                      <span>✓ No spam</span>
                      <span>✓ Daily digest</span>
                      <span>✓ Free forever</span>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
