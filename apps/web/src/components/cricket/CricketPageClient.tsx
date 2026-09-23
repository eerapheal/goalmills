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
import { INITIAL_MAJOR_TOURNAMENTS, INITIAL_FEATURED_TEAMS } from '@/components/CricketSidebar';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MatchStatus = 'LIVE' | 'FT' | 'UPCOMING' | 'DAY2' | 'DAY3';
export type MainTab = 'live' | 'upcoming' | 'results' | 'table' | 'scorers' | 'odds';

export interface CricketMatch {
  id: string;
  comp: string;
  compFlag: string;
  format: 'T20' | 'ODI' | 'TEST' | '100-Ball';
  team1: string;
  team1Badge: string;
  team1Logo?: string;
  team2: string;
  team2Badge: string;
  team2Logo?: string;
  score1?: string;
  score2?: string;
  status: MatchStatus;
  statusLabel: string;
  note?: string;
  time?: string;
  date?: string;
  venue?: string;
}

export interface PointsRow {
  pos: number;
  team: string;
  slug?: string;
  badge: string;
  logo?: string;
  p: number;
  w: number;
  l: number;
  nr: number;
  pts: number;
  nrr: string;
  form: ('W' | 'L' | 'NR')[];
  zone?: 'qualification' | 'elimination';
}

export interface TopBatter {
  rank: number;
  name: string;
  playerId?: string;
  team: string;
  badge: string;
  flag: string;
  runs: number;
  avg: number;
  sr: number;
  hs: number;
  photo: string;
}

export interface CompGroup {
  region: string;
  icon: string;
  comps: { name: string; flag: string; format: string; season: string; country: string; href?: string }[];
}

export interface CricketTeamHub {
  name: string;
  slug: string;
  badge: string;
  logo?: string;
  coach: string;
  format: string;
}

// ─── Curated Fallback / Baseline Data (from Figma) ─────────────────────────────

const DEFAULT_LIVE_MATCHES: CricketMatch[] = [
  {
    id: 'cric-1',
    comp: 'IPL 2026',
    compFlag: '🇮🇳',
    format: 'T20',
    team1: 'Mumbai Indians',
    team1Badge: '🔵',
    team1Logo: 'https://apiv2.allsportsapi.com/logo-cricket/144_mumbai-indians.png',
    team2: 'Royal Challengers Bengaluru',
    team2Badge: '🔴',
    team2Logo: 'https://apiv2.allsportsapi.com/logo-cricket/146_royal-challengers-bangalore.png',
    score1: '187/4 (18.2)',
    score2: 'Yet to bat',
    status: 'LIVE',
    statusLabel: 'Live · 18.2 Ov',
    note: 'Mumbai need 23 off 10 balls',
    venue: 'Wankhede Stadium, Mumbai',
  },
  {
    id: 'cric-2',
    comp: 'WTC 2025/26',
    compFlag: '🌍',
    format: 'TEST',
    team1: 'India',
    team1Badge: '🇮🇳',
    team1Logo: 'https://apiv2.allsportsapi.com/logo-cricket/139_india.png',
    team2: 'Australia',
    team2Badge: '🇦🇺',
    score1: '342/6',
    score2: '187 all out',
    status: 'DAY2',
    statusLabel: 'Day 2 · Session 2',
    note: 'India lead by 155 runs',
    venue: 'MCG, Melbourne',
  },
  {
    id: 'cric-3',
    comp: 'SA20',
    compFlag: '🇿🇦',
    format: 'T20',
    team1: 'Joburg Super Kings',
    team1Badge: '🟡',
    team2: 'MI Cape Town',
    team2Badge: '🔵',
    score1: '156/8 (20)',
    score2: '143/6 (18.4)',
    status: 'LIVE',
    statusLabel: 'Live · 18.4 Ov',
    note: 'Cape Town need 14 off 8 balls',
    venue: 'Wanderers Stadium, Johannesburg',
  },
  {
    id: 'cric-4',
    comp: 'England vs Sri Lanka',
    compFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    format: 'ODI',
    team1: 'England',
    team1Badge: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    team2: 'Sri Lanka',
    team2Badge: '🇱🇰',
    score1: '298/7 (50)',
    score2: 'FT',
    status: 'FT',
    statusLabel: 'England won by 42 runs',
    venue: 'Lord’s, London',
  },
  {
    id: 'cric-5',
    comp: 'Pakistan vs NZ',
    compFlag: '🇵🇰',
    format: 'T20',
    team1: 'Pakistan',
    team1Badge: '🇵🇰',
    team2: 'New Zealand',
    team2Badge: '🇳🇿',
    score1: '201/3 (20)',
    score2: '198/6 (20)',
    status: 'FT',
    statusLabel: 'Pakistan won by 3 runs',
    venue: 'Gaddafi Stadium, Lahore',
  },
  {
    id: 'cric-6',
    comp: 'Big Bash League',
    compFlag: '🇦🇺',
    format: 'T20',
    team1: 'Sydney Sixers',
    team1Badge: '🟣',
    team2: 'Melbourne Stars',
    team2Badge: '🟢',
    score1: '—',
    score2: '—',
    status: 'LIVE',
    statusLabel: 'Innings Break',
    note: 'Sydney Sixers set 177 target (176/7)',
    venue: 'SCG, Sydney',
  },
];

const DEFAULT_UPCOMING_MATCHES: CricketMatch[] = [
  {
    id: 'cric-7',
    comp: 'IPL 2026',
    compFlag: '🇮🇳',
    format: 'T20',
    team1: 'Chennai Super Kings',
    team1Badge: '🟡',
    team1Logo: 'https://apiv2.allsportsapi.com/logo-cricket/141_chennai-super-kings.png',
    team2: 'Kolkata Knight Riders',
    team2Badge: '🟣',
    team2Logo: 'https://apiv2.allsportsapi.com/logo-cricket/142_kolkata-knight-riders.png',
    status: 'UPCOMING',
    statusLabel: 'Tonight · 19:30 IST',
    venue: 'Chepauk, Chennai',
    time: '19:30 IST',
    date: 'Today',
  },
  {
    id: 'cric-8',
    comp: 'WTC 2025/26',
    compFlag: '🌍',
    format: 'TEST',
    team1: 'India',
    team1Badge: '🇮🇳',
    team2: 'Australia',
    team2Badge: '🇦🇺',
    status: 'DAY3',
    statusLabel: 'Day 3 · Tomorrow',
    venue: 'MCG, Melbourne',
    date: 'Tomorrow',
  },
  {
    id: 'cric-9',
    comp: 'T20 World Cup Q.',
    compFlag: '🌍',
    format: 'T20',
    team1: 'Nigeria',
    team1Badge: '🇳🇬',
    team2: 'Uganda',
    team2Badge: '🇺🇬',
    status: 'UPCOMING',
    statusLabel: 'Sep 17 · 14:00 WAT',
    venue: 'Tafawa Balewa Cricket Oval, Lagos',
    date: 'Sep 17',
  },
  {
    id: 'cric-10',
    comp: 'The Hundred',
    compFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    format: '100-Ball',
    team1: 'Oval Invincibles',
    team1Badge: '🟡',
    team2: 'Manchester Originals',
    team2Badge: '🔵',
    status: 'UPCOMING',
    statusLabel: 'Sep 18 · 18:30 BST',
    venue: 'Kia Oval, London',
    date: 'Sep 18',
  },
  {
    id: 'cric-11',
    comp: 'Pakistan vs NZ',
    compFlag: '🇵🇰',
    format: 'ODI',
    team1: 'Pakistan',
    team1Badge: '🇵🇰',
    team2: 'New Zealand',
    team2Badge: '🇳🇿',
    status: 'UPCOMING',
    statusLabel: 'Sep 19 · 09:30 PKT',
    venue: 'National Bank Stadium, Karachi',
    date: 'Sep 19',
  },
  {
    id: 'cric-12',
    comp: 'CPL 2026',
    compFlag: '🌴',
    format: 'T20',
    team1: 'Trinbago Knight Riders',
    team1Badge: '🔴',
    team2: 'Barbados Royals',
    team2Badge: '🔵',
    status: 'UPCOMING',
    statusLabel: 'Sep 20 · 20:00 AST',
    venue: 'Queen’s Park Oval, Port of Spain',
    date: 'Sep 20',
  },
];

const DEFAULT_RESULTS: CricketMatch[] = [
  {
    id: 'cric-13',
    comp: 'England vs Sri Lanka',
    compFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    format: 'ODI',
    team1: 'England',
    team1Badge: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    team2: 'Sri Lanka',
    team2Badge: '🇱🇰',
    score1: '298/7 (50)',
    score2: '256 all out (47.2)',
    status: 'FT',
    statusLabel: 'England won by 42 runs',
    date: 'Yesterday',
    venue: 'Lord’s, London',
  },
  {
    id: 'cric-14',
    comp: 'IPL 2026',
    compFlag: '🇮🇳',
    format: 'T20',
    team1: 'Delhi Capitals',
    team1Badge: '🔵',
    team2: 'Sunrisers Hyderabad',
    team2Badge: '🟠',
    score1: '183/5 (20)',
    score2: '178/7 (20)',
    status: 'FT',
    statusLabel: 'Delhi won by 5 runs',
    date: '2 days ago',
    venue: 'Arun Jaitley Stadium, Delhi',
  },
  {
    id: 'cric-15',
    comp: 'WTC',
    compFlag: '🌍',
    format: 'TEST',
    team1: 'South Africa',
    team1Badge: '🇿🇦',
    team2: 'Bangladesh',
    team2Badge: '🇧🇩',
    score1: '412 & 204/4d',
    score2: '221 & 311 all out',
    status: 'FT',
    statusLabel: 'South Africa won by 84 runs',
    date: 'Sep 11',
    venue: 'SuperSport Park, Centurion',
  },
];

const IPL_TABLE: PointsRow[] = [
  { pos: 1, team: 'Mumbai Indians', slug: 'mumbai-indians-144', badge: '🔵', p: 10, w: 8, l: 2, nr: 0, pts: 16, nrr: '+1.24', form: ['W', 'W', 'L', 'W', 'W'], zone: 'qualification' },
  { pos: 2, team: 'Royal Challengers Bengaluru', slug: 'royal-challengers-bangalore-146', badge: '🔴', p: 10, w: 7, l: 3, nr: 0, pts: 14, nrr: '+0.87', form: ['L', 'W', 'W', 'W', 'L'], zone: 'qualification' },
  { pos: 3, team: 'Chennai Super Kings', slug: 'chennai-super-kings-141', badge: '🟡', p: 10, w: 6, l: 4, nr: 0, pts: 12, nrr: '+0.55', form: ['W', 'L', 'W', 'W', 'L'], zone: 'qualification' },
  { pos: 4, team: 'Kolkata Knight Riders', slug: 'kolkata-knight-riders-142', badge: '🟣', p: 10, w: 6, l: 4, nr: 0, pts: 12, nrr: '+0.31', form: ['W', 'W', 'L', 'L', 'W'], zone: 'qualification' },
  { pos: 5, team: 'Delhi Capitals', slug: 'delhi-capitals-143', badge: '🔵', p: 10, w: 5, l: 5, nr: 0, pts: 10, nrr: '-0.12', form: ['W', 'L', 'W', 'L', 'W'] },
  { pos: 6, team: 'Sunrisers Hyderabad', slug: 'sunrisers-hyderabad-148', badge: '🟠', p: 10, w: 5, l: 5, nr: 0, pts: 10, nrr: '-0.34', form: ['L', 'W', 'L', 'W', 'L'] },
  { pos: 7, team: 'Punjab Kings', slug: 'punjab-kings-145', badge: '🔴', p: 10, w: 3, l: 7, nr: 0, pts: 6, nrr: '-0.78', form: ['L', 'L', 'L', 'W', 'L'], zone: 'elimination' },
  { pos: 8, team: 'Rajasthan Royals', slug: 'rajasthan-royals-150', badge: '🩷', p: 10, w: 2, l: 8, nr: 0, pts: 4, nrr: '-1.03', form: ['L', 'L', 'L', 'L', 'W'], zone: 'elimination' },
];

const TOP_BATTERS: TopBatter[] = [
  { rank: 1, name: 'Virat Kohli', playerId: 'virat-kohli', team: 'RCB', badge: '🔴', flag: '🇮🇳', runs: 742, avg: 61.8, sr: 148.4, hs: 113, photo: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=120&h=120&fit=crop&auto=format' },
  { rank: 2, name: 'Ruturaj Gaikwad', playerId: 'ruturaj-gaikwad', team: 'CSK', badge: '🟡', flag: '🇮🇳', runs: 694, avg: 57.8, sr: 152.1, hs: 108, photo: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=120&h=120&fit=crop&auto=format' },
  { rank: 3, name: 'Shubman Gill', playerId: 'shubman-gill', team: 'Gujarat Titans', badge: '🔵', flag: '🇮🇳', runs: 671, avg: 55.9, sr: 144.8, hs: 94, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&auto=format' },
  { rank: 4, name: 'Heinrich Klaasen', playerId: 'heinrich-klaasen', team: 'Sunrisers', badge: '🟠', flag: '🇿🇦', runs: 648, avg: 54.0, sr: 171.6, hs: 104, photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&auto=format' },
  { rank: 5, name: 'Nicholas Pooran', playerId: 'nicholas-pooran', team: 'LSG', badge: '🟢', flag: '🌴', runs: 602, avg: 46.3, sr: 178.4, hs: 98, photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop&auto=format' },
];

const COMP_GROUPS: CompGroup[] = [
  {
    region: 'Franchise T20 Leagues',
    icon: '🏏',
    comps: [
      { name: 'IPL 2026', flag: '🇮🇳', format: 'T20', season: '2026', country: 'India', href: '/cricket' },
      { name: 'Big Bash League', flag: '🇦🇺', format: 'T20', season: '2025/26', country: 'Australia', href: '/cricket' },
      { name: 'SA20 League', flag: '🇿🇦', format: 'T20', season: '2026', country: 'South Africa', href: '/cricket' },
      { name: 'Caribbean Premier League', flag: '🌴', format: 'T20', season: '2026', country: 'West Indies', href: '/cricket' },
      { name: 'Pakistan Super League', flag: '🇵🇰', format: 'T20', season: '2026', country: 'Pakistan', href: '/cricket' },
      { name: 'The Hundred (Men)', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', format: '100-Ball', season: '2026', country: 'England', href: '/cricket' },
    ],
  },
  {
    region: 'ICC Tournaments',
    icon: '🏆',
    comps: [
      { name: 'ICC World Test Championship', flag: '🌍', format: 'TEST', season: '2025/27', country: 'Global', href: '/cricket' },
      { name: 'ICC T20 World Cup', flag: '🌍', format: 'T20', season: '2026', country: 'Global', href: '/cricket' },
      { name: 'ICC Champions Trophy', flag: '🏆', format: 'ODI', season: '2025', country: 'Global', href: '/cricket' },
      { name: 'ICC U-19 World Cup', flag: '🏆', format: 'ODI', season: '2026', country: 'Global', href: '/cricket' },
    ],
  },
  {
    region: 'Africa (Cricket)',
    icon: '🌍',
    comps: [
      { name: 'Africa T20 Cup', flag: '🌍', format: 'T20', season: '2025/26', country: 'Africa', href: '/cricket' },
      { name: 'Nigeria Premier League', flag: '🇳🇬', format: 'T20', season: '2025', country: 'Nigeria', href: '/cricket' },
      { name: 'T20 World Cup Africa Qualifiers', flag: '🌍', format: 'T20', season: '2025/26', country: 'Africa', href: '/cricket' },
      { name: 'CSA T20 Challenge', flag: '🇿🇦', format: 'T20', season: '2025/26', country: 'South Africa', href: '/cricket' },
    ],
  },
  {
    region: 'International Bilaterals',
    icon: '🌐',
    comps: [
      { name: 'The Ashes (ENG vs AUS)', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', format: 'TEST', season: '2025/26', country: 'Bilateral', href: '/cricket' },
      { name: 'Border-Gavaskar Trophy', flag: '🇮🇳', format: 'TEST', season: '2025/26', country: 'India vs Australia', href: '/cricket' },
      { name: 'Pakistan vs New Zealand', flag: '🇵🇰', format: 'ODI', season: '2025', country: 'Pakistan', href: '/cricket' },
    ],
  },
];

const TEAM_HUBS: CricketTeamHub[] = [
  { name: 'India', slug: 'india-139', badge: '🇮🇳', coach: 'Gautam Gambhir', format: 'All formats' },
  { name: 'Australia', slug: 'australia-140', badge: '🇦🇺', coach: 'Andrew McDonald', format: 'All formats' },
  { name: 'England', slug: 'england-138', badge: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', coach: 'Brendon McCullum', format: 'All formats' },
  { name: 'South Africa', slug: 'south-africa-137', badge: '🇿🇦', coach: 'Rob Walter', format: 'All formats' },
  { name: 'Pakistan', slug: 'pakistan-136', badge: '🇵🇰', coach: 'Gary Kirsten', format: 'All formats' },
  { name: 'Nigeria', slug: 'nigeria-210', badge: '🇳🇬', coach: 'Clive Ogbogu', format: 'T20 / ODI' },
  { name: 'West Indies', slug: 'west-indies-135', badge: '🌴', coach: 'Daren Sammy', format: 'All formats' },
  { name: 'Chennai Super Kings', slug: 'chennai-super-kings-141', badge: '🟡', coach: 'Stephen Fleming', format: 'IPL T20' },
];

const ANALYSIS_ARTICLES = [
  {
    tag: 'ANALYSIS',
    tagColor: 'bg-emerald-600',
    title: "How Kohli's off-stump discipline and strike rotation are redefining modern T20 powerplays",
    time: '1 hr ago',
    comp: 'IPL 2026',
    img: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&h=240&fit=crop&auto=format',
    slug: 'kohli-t20-powerplay-discipline-breakdown',
  },
  {
    tag: 'STATS',
    tagColor: 'bg-purple-600',
    title: 'xRuns: The revolutionary tracking metric making T20 franchises completely rethink auction bidding',
    time: '3 hr ago',
    comp: 'Deep Data',
    img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=240&fit=crop&auto=format',
    slug: 'xruns-metric-t20-auction-analytics',
  },
  {
    tag: 'AFRICA',
    tagColor: 'bg-amber-600',
    title: 'Nigeria cricket is rising on the global radar — and the ICC T20 qualifiers prove the rapid ascent',
    time: '5 hr ago',
    comp: 'T20 WC Qual.',
    img: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=240&fit=crop&auto=format',
    slug: 'nigeria-cricket-rising-t20-qualifiers',
  },
  {
    tag: 'PREVIEW',
    tagColor: 'bg-rose-600',
    title: 'India vs Australia Day 3: Will the MCG pitch turn in session 2? Complete pitch & weather debrief',
    time: '8 hr ago',
    comp: 'WTC Final',
    img: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=240&fit=crop&auto=format',
    slug: 'india-australia-day-3-pitch-report-wtc',
  },
];

const COMP_FILTERS = ['All', '🇮🇳 IPL', '🌍 WTC', '🇦🇺 BBL', '🌴 CPL', '🇿🇦 SA20', '🏴 Hundred', '🇳🇬 Nigeria T20'];

// Featured Elite Cricket Arbiters & Umpires (SOLID / DRS Command Desk)
const CRICKET_OFFICIALS = [
  { name: 'Richard Illingworth', role: 'ICC Elite Panel Umpire', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', drsAcc: '94.8%', matches: 142, rating: 'Balanced' },
  { name: 'Nitin Menon', role: 'ICC Elite Panel Umpire', country: 'India', flag: '🇮🇳', drsAcc: '96.2%', matches: 118, rating: 'High Accuracy' },
  { name: 'Kumar Dharmasena', role: 'ICC Elite Panel Umpire', country: 'Sri Lanka', flag: '🇱🇰', drsAcc: '93.5%', matches: 165, rating: 'Veteran' },
  { name: 'Langton Rusere', role: 'International Panel Umpire', country: 'Zimbabwe / Africa', flag: '🇿🇼', drsAcc: '95.1%', matches: 74, rating: 'Fast Decisions' },
  { name: 'Rod Tucker', role: 'ICC Elite Panel Umpire', country: 'Australia', flag: '🇦🇺', drsAcc: '94.0%', matches: 154, rating: 'Strict' },
  { name: 'Chris Gaffaney', role: 'ICC Elite Panel Umpire', country: 'New Zealand', flag: '🇳🇿', drsAcc: '95.7%', matches: 122, rating: 'High Accuracy' },
];

// Featured Head Coaches & Tacticians
const CRICKET_COACHES = [
  { name: 'Gautam Gambhir', team: 'India', flag: '🇮🇳', role: 'Aggressive Intent & Deep Batting', winRate: '72.4%', trophies: 4, style: 'Fearless Matchups' },
  { name: 'Brendon McCullum', team: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', role: 'Bazball High-Tempo Philosophy', winRate: '68.0%', trophies: 2, style: 'Ultra-Attacking Strike' },
  { name: 'Andrew McDonald', team: 'Australia', flag: '🇦🇺', role: 'Data-Driven Pace Battery', winRate: '70.5%', trophies: 3, style: 'Disciplined Lengths' },
  { name: 'Stephen Fleming', team: 'CSK / Texas', flag: '🇳🇿', role: '5x IPL Champion Strategist', winRate: '62.8%', trophies: 7, style: 'Calm Execution' },
  { name: 'Rob Walter', team: 'South Africa', flag: '🇿🇦', role: 'White-Ball Power Hitting', winRate: '64.2%', trophies: 1, style: 'Middle-Overs Acceleration' },
  { name: 'Clive Ogbogu', team: 'Nigeria Senior Mens', flag: '🇳🇬', role: 'Emerging African Tactics', winRate: '60.0%', trophies: 2, style: 'Tight Spin Traps' },
];

// ─── Helpers & Micro-Components ───────────────────────────────────────────────

function FormatBadge({ format }: { format: string }) {
  const colors: Record<string, string> = {
    T20: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    TEST: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    ODI: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    '100-Ball': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };
  return (
    <span
      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
        colors[format] || 'bg-slate-700/50 text-slate-300 border-slate-600/30'
      }`}
    >
      {format}
    </span>
  );
}

function FormDot({ r }: { r: 'W' | 'L' | 'NR' }) {
  return (
    <span
      className={`w-5 h-5 rounded text-[9px] font-black flex items-center justify-center ${
        r === 'W'
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          : r === 'NR'
            ? 'bg-slate-700/50 text-slate-400 border border-slate-600/30'
            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
      }`}
    >
      {r}
    </span>
  );
}

function MatchCard({ m }: { m: CricketMatch }) {
  const isLive = m.status === 'LIVE' || m.status === 'DAY2' || m.status === 'DAY3';
  const isFT = m.status === 'FT';

  return (
    <Link
      href={`/cricket/matches/${m.id}`}
      className="block bg-[#0f172a] border border-[#1e293b] rounded-xl hover:border-emerald-500/40 hover:bg-[#131f35] transition-all duration-200 group overflow-hidden shadow-sm"
    >
      <div className="flex items-center justify-between px-3.5 pt-3 pb-2 border-b border-[#1e293b]/60">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase truncate flex items-center gap-1.5">
            <span>{m.compFlag}</span>
            <span className="truncate">{m.comp}</span>
          </span>
          <FormatBadge format={m.format} />
        </div>

        {isLive ? (
          <span className="flex items-center gap-1.5 text-[10px] font-black text-rose-400 uppercase tracking-widest flex-shrink-0 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block animate-pulse" />
            {m.statusLabel}
          </span>
        ) : isFT ? (
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-800/60 px-2 py-0.5 rounded">
            {m.date || 'RESULT'}
          </span>
        ) : (
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {m.time || m.date || 'UPCOMING'}
          </span>
        )}
      </div>

      <div className="px-3.5 py-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {m.team1Logo ? (
              <img
                src={m.team1Logo}
                alt=""
                className="w-5 h-5 object-contain rounded flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-base flex-shrink-0">{m.team1Badge}</span>
            )}
            <span className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors truncate">
              {m.team1}
            </span>
          </div>
          {m.score1 && (
            <span className="text-xs font-black text-white tabular-nums flex-shrink-0 text-right ml-2 bg-slate-800/60 px-2 py-1 rounded">
              {m.score1}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {m.team2Logo ? (
              <img
                src={m.team2Logo}
                alt=""
                className="w-5 h-5 object-contain rounded flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-base flex-shrink-0">{m.team2Badge}</span>
            )}
            <span className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors truncate">
              {m.team2}
            </span>
          </div>
          {m.score2 && (
            <span className="text-xs font-black text-white tabular-nums flex-shrink-0 text-right ml-2 bg-slate-800/60 px-2 py-1 rounded">
              {m.score2}
            </span>
          )}
        </div>
      </div>

      {(m.note || m.venue) && (
        <div className="px-3.5 pb-2.5 text-[10px] text-slate-400 truncate border-t border-[#1e293b]/40 pt-2 flex items-center justify-between">
          <span className="truncate">{m.note ? `💬 ${m.note}` : `🏟️ ${m.venue}`}</span>
          <span className="text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">
            Scorecard →
          </span>
        </div>
      )}

      {isFT && (
        <div className="px-3.5 pb-2.5 text-[10px] font-bold text-emerald-400 border-t border-[#1e293b]/40 pt-1.5 flex items-center justify-between">
          <span>✓ {m.statusLabel}</span>
          <span className="text-slate-400 font-normal">Match Ended</span>
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

// ─── Main Cricket Page Client Component ───────────────────────────────────────

export function CricketPageClient() {
  const [mainTab, setMainTab] = useState<MainTab>('live');
  const [compFilter, setCompFilter] = useState('All');
  const [tableLeague, setTableLeague] = useState('IPL 2026');
  const [expandedComp, setExpandedComp] = useState<string | null>('Franchise T20 Leagues');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic Matches State
  const [liveMatches, setLiveMatches] = useState<CricketMatch[]>(DEFAULT_LIVE_MATCHES);
  const [upcomingMatches, setUpcomingMatches] = useState<CricketMatch[]>(DEFAULT_UPCOMING_MATCHES);
  const [resultsMatches, setResultsMatches] = useState<CricketMatch[]>(DEFAULT_RESULTS);

  // Daily Pitch Brief Newsletter State
  const [briefEmail, setBriefEmail] = useState('');
  const [briefSubscribed, setBriefSubscribed] = useState(false);
  const [briefSubmitting, setBriefSubmitting] = useState(false);
  const [briefMessage, setBriefMessage] = useState('');

  // Live match counter
  const liveCount = useMemo(() => {
    return liveMatches.filter(
      (m) => m.status === 'LIVE' || m.status === 'DAY2' || m.status === 'DAY3'
    ).length;
  }, [liveMatches]);

  // Fetch real matches from live API with fallbacks
  const fetchLiveCricket = useCallback(async () => {
    setIsSyncing(true);
    try {
      const timestamp = Date.now();
      const res = await fetch(`/api/cricket?met=Livescore&_t=${timestamp}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const cList = data?.result || (Array.isArray(data) ? data : []);
        if (Array.isArray(cList) && cList.length > 0) {
          const parsed: CricketMatch[] = cList.slice(0, 16).map((m: any, idx: number) => {
            const rawStatus = (m.event_status || '').trim();
            const isLive =
              rawStatus.toLowerCase().includes('live') ||
              rawStatus.toLowerCase().includes('inn') ||
              rawStatus.includes('Ov');
            const isDay = rawStatus.toLowerCase().includes('day');
            const score1 = m.event_home_final_result || m.event_home_team_score || '--';
            const score2 = m.event_away_final_result || m.event_away_team_score || '--';

            return {
              id: String(m.event_key || `cric-${idx}`),
              comp: m.league_name || 'Cricket Series',
              compFlag: '🏏',
              format: (m.league_name || '').toLowerCase().includes('test') ? 'TEST' : 'T20',
              team1: m.event_home_team || 'Team 1',
              team1Badge: '🔵',
              team2: m.event_away_team || 'Team 2',
              team2Badge: '🔴',
              score1: score1 !== '--' ? score1 : undefined,
              score2: score2 !== '--' ? score2 : undefined,
              status: isDay ? 'DAY2' : isLive ? 'LIVE' : 'LIVE',
              statusLabel: rawStatus || 'Live in play',
              venue: m.event_stadium || undefined,
            };
          });
          setLiveMatches(parsed);
        }
      }

      // Fetch fixtures
      const fixRes = await fetch(`/api/cricket?met=Fixtures&_t=${timestamp}`, { cache: 'no-store' });
      if (fixRes.ok) {
        const fixData = await fixRes.json();
        const fixList = fixData?.result || (Array.isArray(fixData) ? fixData : []);
        if (Array.isArray(fixList) && fixList.length > 0) {
          const up: CricketMatch[] = [];
          const ft: CricketMatch[] = [];
          fixList.forEach((m: any, idx: number) => {
            const rawStatus = (m.event_status || '').trim();
            const isFinished =
              rawStatus.toLowerCase().includes('won') ||
              rawStatus.toLowerCase().includes('ended') ||
              rawStatus === 'Finished';

            const item: CricketMatch = {
              id: String(m.event_key || `cfix-${idx}`),
              comp: m.league_name || 'Cricket Series',
              compFlag: '🏏',
              format: (m.league_name || '').toLowerCase().includes('test')
                ? 'TEST'
                : (m.league_name || '').toLowerCase().includes('odi')
                  ? 'ODI'
                  : 'T20',
              team1: m.event_home_team || 'Team 1',
              team1Badge: '⚪',
              team2: m.event_away_team || 'Team 2',
              team2Badge: '⚫',
              score1: m.event_home_final_result || undefined,
              score2: m.event_away_final_result || undefined,
              status: isFinished ? 'FT' : 'UPCOMING',
              statusLabel: isFinished ? rawStatus : m.event_time || 'Upcoming',
              date: m.event_date || undefined,
              venue: m.event_stadium || undefined,
            };
            if (isFinished) ft.push(item);
            else up.push(item);
          });
          if (up.length > 0) setUpcomingMatches(up.slice(0, 12));
          if (ft.length > 0) setResultsMatches(ft.slice(0, 12));
        }
      }

      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch {
      // Retain robust defaults
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveCricket();
    const interval = setInterval(fetchLiveCricket, 25_000);
    return () => clearInterval(interval);
  }, [fetchLiveCricket]);

  const tabFixtures: Partial<Record<MainTab, CricketMatch[]>> = {
    live: liveMatches,
    upcoming: upcomingMatches,
    results: resultsMatches,
  };

  const isFixtureTab = mainTab === 'live' || mainTab === 'upcoming' || mainTab === 'results';

  const currentMatches = useMemo(() => {
    const list = tabFixtures[mainTab] ?? [];
    if (compFilter === 'All') return list;
    const cleanFilter = compFilter.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return list.filter((m) => {
      const c = m.comp.toLowerCase();
      if (cleanFilter.includes('ipl')) return c.includes('ipl') || c.includes('indian premier');
      if (cleanFilter.includes('wtc')) return c.includes('wtc') || c.includes('test');
      if (cleanFilter.includes('bbl')) return c.includes('bbl') || c.includes('big bash');
      if (cleanFilter.includes('cpl')) return c.includes('cpl') || c.includes('caribbean');
      if (cleanFilter.includes('sa20')) return c.includes('sa20') || c.includes('south africa');
      if (cleanFilter.includes('hundred')) return c.includes('hundred');
      if (cleanFilter.includes('nigeria')) return c.includes('nigeria') || c.includes('africa');
      return c.includes(cleanFilter);
    });
  }, [tabFixtures, mainTab, compFilter]);

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
          source: 'cricket_daily_pitch_brief',
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
      <div className="hidden md:block relative bg-gradient-to-b from-[#061a10] via-[#03120b] to-[#020617] border-b border-[#1e293b] overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img
            src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1400&h=300&fit=crop&auto=format"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/95 via-transparent to-[#020617]/95" />
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-blue-500" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                <span className="text-2xl">🏏</span>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
                  GoalMills Cricket Command Centre
                </span>
                {liveCount > 0 && (
                  <span className="flex items-center gap-1.5 bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
                    {liveCount} In Play
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Cricket Match Centre
              </h1>
              <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Live ball-by-ball scorecards, IPL & WTC points tables, DRS tracking, player auction
                analytics, and bilateral updates across 30+ tournaments worldwide.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-[#0f172a] border border-[#1e293b] px-3.5 py-2.5 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                <span>Live Feed: {lastSyncTime}</span>
              </span>
              <button
                onClick={fetchLiveCricket}
                disabled={isSyncing}
                className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-emerald-700/20 cursor-pointer"
              >
                <FiRefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Live'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          3-COLUMN DASHBOARD LAYOUT
      ════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[256px_1fr] xl:grid-cols-[256px_1fr_288px] gap-6 items-start">
          {/* ──────────────────────────────────────────
              LEFT SIDEBAR
          ────────────────────────────────────────── */}
          <aside className="hidden lg:block space-y-5 lg:sticky lg:top-24">
            {/* Cricket Analysis Articles */}
            <SideSection
              title="Cricket Analysis"
              action={
                <Link
                  href="/analysis"
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
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
                      <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">
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
              action={<span className="text-[10px] text-slate-500 font-semibold">30+ Leagues</span>}
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
                            href={c.href || '/cricket'}
                            className="flex items-center gap-2.5 px-5 py-2 hover:bg-[#1e293b]/60 transition-colors group"
                          >
                            <span className="text-base flex-shrink-0">{c.flag}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-semibold text-slate-300 group-hover:text-white transition-colors truncate">
                                {c.name}
                              </p>
                              <p className="text-[10px] text-slate-500">{c.country}</p>
                            </div>
                            <FormatBadge format={c.format} />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SideSection>

            {/* Featured Team Hubs */}
            <SideSection
              title="Featured Team Hubs"
              defaultOpen={false}
              action={
                <Link
                  href="/cricket/teams"
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
                >
                  All →
                </Link>
              }
            >
              <div className="grid grid-cols-2 gap-px bg-[#1e293b]">
                {TEAM_HUBS.map((t) => (
                  <Link
                    key={t.name}
                    href={`/cricket/teams/${t.slug}`}
                    className="flex flex-col items-center gap-1.5 p-3.5 bg-[#0f172a] hover:bg-[#131f35] transition-colors group text-center"
                  >
                    <span className="text-2xl">{t.badge}</span>
                    <p className="text-[11px] font-bold text-slate-200 group-hover:text-white transition-colors leading-tight line-clamp-1">
                      {t.name}
                    </p>
                    <p className="text-[9px] text-slate-500 leading-tight">Coach: {t.coach}</p>
                    <p className="text-[9px] text-emerald-400 font-semibold group-hover:text-emerald-300 transition-colors mt-0.5">
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
            {/* Mobile Dropdown Side Menu (Cricket Analysis, Tournament Directory, Featured Teams) */}
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#0f172a] border border-[#1e293b] hover:border-emerald-500/50 rounded-2xl shadow-sm text-xs font-black uppercase tracking-wider text-slate-200 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <FiLayers className="w-3.5 h-3.5" />
                  </span>
                  <div className="text-left">
                    <p className="text-xs font-black text-white">Cricket Hubs & Directory</p>
                    <p className="text-[10px] text-slate-400 font-normal">Analysis · Team Hubs · 30+ Tournaments</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                    {mobileMenuOpen ? 'Close Menu' : 'Explore Menu'}
                  </span>
                  <FiChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      mobileMenuOpen ? 'rotate-180 text-emerald-400' : ''
                    }`}
                  />
                </div>
              </button>

              {mobileMenuOpen && (
                <div className="mt-3 space-y-4 p-3.5 bg-[#080f1e] border border-emerald-500/30 rounded-2xl shadow-xl animate-fadeIn">
                  {/* Cricket Analysis */}
                  <SideSection
                    title="Cricket Analysis"
                    defaultOpen={true}
                    action={
                      <Link href="/analysis" className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold">
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
                            <p className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wider mb-0.5">{a.comp}</p>
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
                    action={<span className="text-[10px] text-slate-500 font-semibold">30+ Leagues</span>}
                  >
                    <div className="divide-y divide-[#1e293b]">
                      {COMP_GROUPS.map((group) => (
                        <div key={group.region}>
                          <button
                            onClick={() => setExpandedComp(expandedComp === group.region ? null : group.region)}
                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#1e293b]/40 transition-colors text-left"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base">{group.icon}</span>
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
                                  href={c.href || '/cricket'}
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

                  {/* Featured Cricket Teams */}
                  <SideSection
                    title="Featured Teams Hub"
                    defaultOpen={false}
                    action={
                      <Link href="/cricket" className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold">
                        All →
                      </Link>
                    }
                  >
                    <div className="grid grid-cols-2 gap-px bg-[#1e293b]">
                      {TEAM_HUBS.map((t) => (
                        <Link
                          key={t.name}
                          href={`/cricket/teams/${t.slug}`}
                          className="flex flex-col items-center gap-1.5 p-3 bg-[#0f172a] hover:bg-[#131f35] transition-colors text-center"
                        >
                          <span className="text-xl">{t.badge}</span>
                          <p className="text-[10px] font-bold text-slate-200 leading-tight line-clamp-1">{t.name}</p>
                          <span className="text-[9px] text-emerald-400 font-semibold">Hub →</span>
                        </Link>
                      ))}
                    </div>
                  </SideSection>
                </div>
              )}
            </div>

            {/* Tabs Bar */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-sm">
              <div className="flex overflow-x-auto no-scrollbar">
                {(['live', 'upcoming', 'results', 'table', 'scorers', 'odds'] as MainTab[]).map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setMainTab(tab)}
                      className={`flex-shrink-0 flex items-center gap-2 px-5 py-3.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                        mainTab === tab
                          ? 'border-emerald-500 text-white bg-emerald-500/10'
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

              {/* Competition Filters */}
              {isFixtureTab && (
                <div className="flex gap-2 px-4 py-3 border-t border-[#1e293b] overflow-x-auto no-scrollbar bg-[#091120]">
                  {COMP_FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setCompFilter(f)}
                      className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        compFilter === f
                          ? 'bg-emerald-700 border-emerald-600 text-white shadow-sm'
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
                {currentMatches.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {currentMatches.map((m) => (
                      <MatchCard key={m.id} m={m} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl py-16 text-center">
                    <p className="text-3xl mb-3">🏏</p>
                    <p className="text-slate-300 font-bold">No cricket matches found for {compFilter}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      Try selecting &quot;All&quot; or another tournament filter.
                    </p>
                    <button
                      onClick={() => setCompFilter('All')}
                      className="mt-4 text-xs text-emerald-400 font-bold hover:underline"
                    >
                      Reset filter
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ── Points Table Tab ── */}
            {mainTab === 'table' && (
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {['IPL 2026', 'WTC', 'CPL', 'BBL', 'SA20'].map((l) => (
                    <button
                      key={l}
                      onClick={() => setTableLeague(l)}
                      className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                        tableLeague === l
                          ? 'bg-emerald-700 border-emerald-600 text-white shadow-sm'
                          : 'border-[#1e293b] text-slate-400 hover:border-[#334155] hover:text-white'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>

                <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-5 py-3.5 border-b border-[#1e293b] flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest flex items-center gap-2">
                      <span>🏆</span>
                      <span>{tableLeague} · Official Points Table</span>
                    </h3>
                    <FormatBadge format="T20" />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#1e293b] bg-[#091120]">
                          {['#', 'Team', 'P', 'W', 'L', 'NR', 'Pts', 'NRR', 'Form'].map((h, i) => (
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
                        {IPL_TABLE.map((row) => (
                          <tr
                            key={row.pos}
                            className={`hover:bg-[#1e293b]/40 transition-colors ${
                              row.zone === 'qualification'
                                ? 'border-l-2 border-l-emerald-500 bg-emerald-500/[0.02]'
                                : row.zone === 'elimination'
                                  ? 'border-l-2 border-l-rose-500 bg-rose-500/[0.02]'
                                  : ''
                            }`}
                          >
                            <td className="pl-5 pr-2 py-3 text-sm font-black tabular-nums text-slate-400">
                              {row.pos}
                            </td>
                            <td className="px-3 py-3">
                              <Link
                                href={`/cricket/teams/${row.slug || 'chennai-super-kings-141'}`}
                                className="flex items-center gap-2 group/link"
                              >
                                <span className="text-sm">{row.badge}</span>
                                <span className="text-sm font-semibold text-slate-100 group-hover/link:text-emerald-400 transition-colors">
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
                              {row.l}
                            </td>
                            <td className="px-2 py-3 text-center text-sm text-slate-400 tabular-nums">
                              {row.nr}
                            </td>
                            <td className="px-2 py-3 text-center">
                              <span className="text-sm font-black text-white tabular-nums bg-slate-800/80 px-2 py-1 rounded">
                                {row.pts}
                              </span>
                            </td>
                            <td className="px-2 py-3 text-center text-sm tabular-nums font-bold">
                              <span
                                className={row.nrr.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}
                              >
                                {row.nrr}
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
                      <span className="w-2 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                      Qualifies for Playoffs / Knockouts
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2.5 rounded-sm bg-rose-500 inline-block" />
                      Elimination Danger Zone
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Top Batters Tab ── */}
            {mainTab === 'scorers' && (
              <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 border-b border-[#1e293b] flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest flex items-center gap-2">
                    <span>🏏</span>
                    <span>Orange Cap & Top Run Scorers — 2025/2026</span>
                  </h3>
                  <Link
                    href="/cricket/players"
                    className="text-[10px] text-emerald-400 hover:underline font-bold"
                  >
                    View All Batters →
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#1e293b] bg-[#091120]">
                        {['#', 'Batter', 'Franchise', 'Runs', 'Avg', 'SR', 'HS'].map((h, i) => (
                          <th
                            key={h}
                            className={`py-2.5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest ${
                              i <= 1 ? 'text-left' : 'text-center'
                            }`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e293b]">
                      {TOP_BATTERS.map((p) => (
                        <tr key={p.rank} className="hover:bg-[#1e293b]/40 transition-colors">
                          <td className="px-4 py-3 text-center w-12">
                            <span className="text-sm font-black">
                              {p.rank <= 3 ? ['🥇', '🥈', '🥉'][p.rank - 1] : p.rank}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/cricket/players/${p.playerId || 'virat-kohli'}`}
                              className="flex items-center gap-3 group/b"
                            >
                              <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700">
                                <img
                                  src={p.photo}
                                  alt={p.name}
                                  className="w-full h-full object-cover group-hover/b:scale-105 transition-transform"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-100 group-hover/b:text-emerald-400 transition-colors">
                                  {p.name}
                                </p>
                                <p className="text-[10px] text-slate-400">{p.flag} · Verified</p>
                              </div>
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-base">{p.badge}</span>
                            <span className="text-xs text-slate-300 ml-1">{p.team}</span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-black text-amber-400 tabular-nums">
                            {p.runs}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-slate-300 tabular-nums">
                            {p.avg}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`text-sm font-black tabular-nums ${
                                p.sr >= 170
                                  ? 'text-emerald-400'
                                  : p.sr >= 150
                                    ? 'text-blue-400'
                                    : 'text-slate-300'
                              }`}
                            >
                              {p.sr}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-bold text-slate-200 tabular-nums">
                            {p.hs}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Odds Tab ── */}
            {mainTab === 'odds' && (
              <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-8 sm:p-12 text-center shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-3xl">
                  📊
                </div>
                <h3 className="text-xl font-black text-white mb-2">
                  Cricket Match Odds & In-Play Markets
                </h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                  Real-time match winner markets, top batter props, boundaries over/under, and session
                  runs indexes powered by verified cricket feed telemetry.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                    IPL Match Winner 1X2
                  </span>
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                    Powerplay Runs (Over/Under)
                  </span>
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                    Top Batter Head-to-Head
                  </span>
                </div>
                <button
                  onClick={() => alert('Cricket in-play market alert requested!')}
                  className="mt-6 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-700/20 cursor-pointer"
                >
                  Get Cricket Market Alerts
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
                    Live In Play
                  </h3>
                </div>
                <span className="text-[10px] font-black text-rose-400">{liveCount} matches</span>
              </div>
              <div className="divide-y divide-[#1e293b]">
                {liveMatches
                  .filter((m) => m.status === 'LIVE' || m.status === 'DAY2' || m.status === 'DAY3')
                  .slice(0, 3)
                  .map((m) => (
                    <Link
                      key={m.id}
                      href={`/cricket/matches/${m.id}`}
                      className="block px-4 py-3 hover:bg-[#1e293b]/40 transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <span>{m.compFlag}</span>
                          <span className="truncate">{m.comp}</span>
                        </span>
                        <FormatBadge format={m.format} />
                      </div>
                      <p className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                        {m.team1} vs {m.team2}
                      </p>
                      {m.score1 && (
                        <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                          {m.score1}
                        </p>
                      )}
                      {m.note && <p className="text-[10px] text-slate-500 mt-0.5">{m.note}</p>}
                    </Link>
                  ))}
              </div>
            </div>

            {/* Quick IPL Table Widget */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-[#1e293b] flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  IPL Points Table
                </h3>
                <button
                  onClick={() => setMainTab('table')}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer"
                >
                  Full →
                </button>
              </div>
              <div className="divide-y divide-[#1e293b]">
                {IPL_TABLE.slice(0, 5).map((row) => (
                  <div
                    key={row.pos}
                    className={`flex items-center gap-2.5 px-4 py-2 hover:bg-[#1e293b]/40 transition-colors ${
                      row.zone === 'qualification' ? 'border-l-2 border-l-emerald-500' : ''
                    }`}
                  >
                    <span className="text-xs font-black text-slate-400 w-4 tabular-nums">
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

            {/* Quick Top Batters Widget */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-[#1e293b] flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  Top Run Scorers
                </h3>
                <button
                  onClick={() => setMainTab('scorers')}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer"
                >
                  Full →
                </button>
              </div>
              <div className="divide-y divide-[#1e293b]">
                {TOP_BATTERS.slice(0, 4).map((p) => (
                  <Link
                    key={p.rank}
                    href={`/cricket/players/${p.playerId || 'virat-kohli'}`}
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
                    <span className="text-sm font-black text-amber-400 tabular-nums">{p.runs}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* ════════════════════════════════════════
            SPECIAL SECTION 1: CRICKET SUPERSTARS
        ════════════════════════════════════════ */}
        <section className="mt-14 pt-10 border-t border-[#1e293b]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
                  Global & Franchise Superstars
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Cricket Icons & Master Batters
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Franchise auction contracts, strike rate indices, and international averages.
              </p>
            </div>
            <Link
              href="/cricket/players"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl transition-colors group"
            >
              <span>Explore All Cricket Players</span>
              <FiChevronRight className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Virat Kohli', slug: 'virat-kohli', team: 'Royal Challengers Bengaluru', role: 'Top-Order Anchor', flag: '🇮🇳', val: '₹21.0 Cr', runs: 742, sr: 148.4, photo: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=120&h=120&fit=crop&auto=format' },
              { name: 'Jasprit Bumrah', slug: 'jasprit-bumrah', team: 'Mumbai Indians', role: 'Death-Over Specialist', flag: '🇮🇳', val: '₹18.0 Cr', runs: '24 Wkts', sr: 'Econ: 6.4', photo: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=120&h=120&fit=crop&auto=format' },
              { name: 'Heinrich Klaasen', slug: 'heinrich-klaasen', team: 'Sunrisers Hyderabad', role: 'Middle-Over Enforcer', flag: '🇿🇦', val: '₹17.5 Cr', runs: 648, sr: 171.6, photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&auto=format' },
              { name: 'Travis Head', slug: 'travis-head', team: 'Sunrisers Hyderabad', role: 'Powerplay Destroyer', flag: '🇦🇺', val: '₹16.5 Cr', runs: 588, sr: 189.2, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&auto=format' },
            ].map((p) => (
              <Link
                key={p.slug}
                href={`/cricket/players/${p.slug}`}
                className="group relative bg-[#0f172a] border border-[#1e293b] hover:border-emerald-500/40 rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-emerald-500/5 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
                    <img
                      src={p.photo}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-0 right-0 text-xs px-1 bg-slate-900/90 rounded-tl">
                      {p.flag}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="inline-block text-[11px] font-black text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                      {p.val}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">
                      IPL Auction Value
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-black text-slate-100 group-hover:text-emerald-400 transition-colors truncate">
                    {p.name}
                  </h4>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {p.role} · {p.team}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1e293b] flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Output: <strong className="text-white font-bold">{p.runs}</strong>
                  </span>
                  <span>
                    Index: <strong className="text-emerald-400 font-bold">{p.sr}</strong>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════
            SPECIAL SECTION 2: DRS COMMAND DESK & UMPIRES
        ════════════════════════════════════════ */}
        <section className="mt-14 pt-10 border-t border-[#1e293b]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[11px] font-black uppercase tracking-widest text-blue-400">
                  ⚖️ DRS & Field Arbiters
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Umpires & DRS Command Desk
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                ICC Elite Panel umpire tracking, Hawk-Eye ball tracking reviews, and overturn percentages.
              </p>
            </div>
            <Link
              href="/cricket"
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-4 py-2.5 rounded-xl transition-colors group"
            >
              <span>Explore Review System Data</span>
              <FiChevronRight className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CRICKET_OFFICIALS.map((o) => (
              <div
                key={o.name}
                className="bg-[#0f172a] border border-[#1e293b] hover:border-blue-500/40 rounded-2xl p-4 transition-all duration-300 shadow-sm hover:shadow-blue-500/5 hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl flex-shrink-0">
                    <span>{o.flag}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-black text-slate-100 truncate">{o.name}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{o.country}</span>
                      <span className="text-[10px] text-slate-500">· {o.role}</span>
                    </p>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border bg-blue-500/15 border-blue-500/30 text-blue-300 flex-shrink-0">
                    {o.rating}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-[#0a1120] rounded-xl border border-[#1e293b] text-center">
                  <div>
                    <span className="text-xs font-black text-white">{o.matches}</span>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider">Tests/ODIs</p>
                  </div>
                  <div>
                    <span className="text-xs font-black text-emerald-400">{o.drsAcc}</span>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider">DRS Acc.</p>
                  </div>
                  <div>
                    <span className="text-xs font-black text-amber-400">Elite</span>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider">Panel</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════
            SPECIAL SECTION 3: HEAD COACHES & TACTICIANS
        ════════════════════════════════════════ */}
        <section className="mt-14 pt-10 border-t border-[#1e293b]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
                  Tactical Masterminds in the Dugout
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Cricket Tacticians & Head Coaches
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Strategic match philosophies, high-tempo run rates, and international series victories.
              </p>
            </div>
            <Link
              href="/cricket/teams"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl transition-colors group"
            >
              <span>View All Team Dugouts</span>
              <FiChevronRight className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CRICKET_COACHES.map((c) => (
              <div
                key={c.name}
                className="bg-[#0f172a] border border-[#1e293b] hover:border-emerald-500/40 rounded-2xl p-4 transition-all duration-300 shadow-sm hover:shadow-emerald-500/5 hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl flex-shrink-0">
                    <span>{c.flag}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-black text-slate-100 truncate">{c.name}</h4>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {c.team} · Head Coach
                    </p>
                  </div>
                  <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md flex-shrink-0 flex items-center gap-1">
                    <span>🏆</span>
                    <span>{c.trophies}</span>
                  </span>
                </div>

                <div className="space-y-2 mt-2 pt-3 border-t border-[#1e293b]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Philosophy:</span>
                    <span className="font-bold text-slate-200">{c.role}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Win Percentage:</span>
                    <span className="font-black text-emerald-400">{c.winRate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════
            SPECIAL SECTION 4: CRICKET DAILY PITCH BRIEF
        ════════════════════════════════════════ */}
        <section className="mt-14 pt-10 border-t border-[#1e293b]">
          <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-[#061a10] via-[#04140c] to-[#020617] p-6 sm:p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left text */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-black uppercase tracking-widest text-emerald-300">
                    🏏 GoalMills Pitch Report
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Daily 08:30 AM Matchday Edition
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Cricket Daily Pitch Brief
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed">
                  Start your cricket morning with curated pitch moisture reports, dew factor telemetry,
                  franchise auction rumors, and DRS debate summaries delivered straight to analysts and fans.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-[#0f172a]/80 border border-slate-800 rounded-xl p-3">
                    <span className="text-emerald-400 text-sm font-bold">🌱 Surface Moisture</span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Wankhede & MCG pitch grass density and first-innings totals.
                    </p>
                  </div>
                  <div className="bg-[#0f172a]/80 border border-slate-800 rounded-xl p-3">
                    <span className="text-amber-400 text-sm font-bold">⚡ Auction Pulse</span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Mega auction retention strategies and purse breakdowns.
                    </p>
                  </div>
                  <div className="bg-[#0f172a]/80 border border-slate-800 rounded-xl p-3">
                    <span className="text-blue-400 text-sm font-bold">🌍 African Emerging Wire</span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Nigeria, Uganda, and Namibia ICC pathway progress.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right newsletter card */}
              <div className="lg:col-span-5 bg-[#0f172a]/90 border border-[#1e293b] rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md">
                {briefSubscribed ? (
                  <div className="text-center py-6 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-xl">
                      ✓
                    </div>
                    <h4 className="text-base font-bold text-white">You&apos;re subscribed!</h4>
                    <p className="text-xs text-slate-400">
                      Tomorrow&apos;s Cricket Daily Pitch Brief will arrive in your inbox at 08:30 AM.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleBriefSubscribe} className="space-y-3.5">
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">
                        Get the Matchday Briefing
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Join 28,000+ cricket coaches, analysts, and fans. Free forever, unsubscribe anytime.
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
                          placeholder="cricketer@example.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#06101E] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={briefSubmitting}
                        className="w-full bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-all shadow-md shadow-emerald-700/30 cursor-pointer disabled:opacity-50"
                      >
                        {briefSubmitting ? 'Subscribing...' : 'Subscribe to Cricket Brief'}
                      </button>
                    </div>

                    {briefMessage && (
                      <p className="text-[10px] text-amber-400 text-center">{briefMessage}</p>
                    )}

                    <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 pt-1">
                      <span>✓ No spam</span>
                      <span>✓ Matchday drops</span>
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
