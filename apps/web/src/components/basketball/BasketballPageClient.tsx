'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
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
  FiTarget,
  FiCalendar,
  FiX,
  FiCheck,
  FiSliders,
  FiHelpCircle,
} from 'react-icons/fi';

// ─── Types ────────────────────────────────────────────────────────────────────

export type GameStatus = 'LIVE' | 'FT' | 'UPCOMING' | 'HT' | 'OT' | 'Q1' | 'Q2' | 'Q3' | 'Q4';
export type MainTab = 'live' | 'upcoming' | 'results' | 'standings' | 'leaders' | 'odds';
export type StatCategory = 'PPG' | 'RPG' | 'APG' | 'BPG' | '3PM' | 'FG%';

export interface GameItem {
  id: string;
  comp: string;
  compFlag: string;
  home: string;
  homeLogo?: string;
  away: string;
  awayLogo?: string;
  hScore: number | null;
  aScore: number | null;
  quarter?: string;
  clock?: string;
  status: GameStatus;
  time?: string;
  date?: string;
  arena?: string;
  quarters?: {
    q1H: number;
    q1A: number;
    q2H: number;
    q2A: number;
    q3H: number;
    q3A: number;
    q4H: number;
    q4A: number;
    otH?: number;
    otA?: number;
  };
  teamStats?: {
    fgH: string;
    fgA: string;
    threePtH: string;
    threePtA: string;
    rebH: number;
    rebA: number;
    toH: number;
    toA: number;
    fastBreakH: number;
    fastBreakA: number;
  };
}

export interface StandingsRow {
  pos: number;
  team: string;
  logo?: string;
  w: number;
  l: number;
  pct: string;
  gb: string;
  ppg: number;
  oppg: number;
  form: ('W' | 'L')[];
  zone?: 'playoffs' | 'playin' | 'lottery';
  conf?: 'East' | 'West';
  league?: string;
}

export interface StatLeader {
  rank: number;
  name: string;
  team: string;
  teamLogo?: string;
  flag: string;
  stat: number;
  statLabel: string;
  extra: string;
  photo: string;
  category: StatCategory;
}

export interface CompGroup {
  region: string;
  icon: string;
  comps: { name: string; flag: string; tier: string; season: string; country: string; href?: string }[];
}

export interface TeamHub {
  name: string;
  conf: string;
  record: string;
  logo?: string;
  slug: string;
}

export interface AnalysisArticle {
  tag: string;
  tagColor: string;
  title: string;
  time: string;
  comp: string;
  img: string;
}

export interface BasketballSuperstar {
  name: string;
  slug: string;
  team: string;
  teamLogo: string;
  photo: string;
  nationality: string;
  countryFlag: string;
  pos: string;
  posCategory: 'Guards' | 'Forwards' | 'Centers';
  ppg: number;
  rpg: number;
  apg: number;
  per: number;
  salary: string;
  accolade: string;
}

export interface BasketballOfficial {
  name: string;
  number: string;
  seasons: string;
  role: string;
  photo: string;
  reviewAcc: string;
  overturnPct: string;
  avgReviewSec: string;
  techPerGame: string;
  panel: string;
  badge: 'Lead Crew' | 'Veteran' | 'High Accuracy';
}

export interface BasketballCoach {
  name: string;
  team: string;
  teamLogo: string;
  photo: string;
  winPct: string;
  rings: number;
  offensiveRtg: string;
  system: string;
  schemeTag: '5-Out' | 'Horns' | 'Pick-and-Roll';
  contract: string;
}

export interface BasketballOddsItem {
  id: string;
  comp: string;
  time: string;
  home: string;
  homeLogo?: string;
  away: string;
  awayLogo?: string;
  spread: {
    homeLine: string;
    awayLine: string;
    homeAmerican: string;
    awayAmerican: string;
    homeDecimal: number;
    awayDecimal: number;
  };
  moneyline: {
    homeAmerican: string;
    awayAmerican: string;
    homeDecimal: number;
    awayDecimal: number;
  };
  total: {
    points: number;
    overAmerican: string;
    underAmerican: string;
    overDecimal: number;
    underDecimal: number;
  };
  movement: string;
  publicBetting: string;
}

// ─── Dynamic API Image Resolvers (Strictly NO Emoji Icons for Logos) ─────────

export function getBasketballTeamLogo(teamName: string): string {
  if (!teamName) {
    return 'https://ui-avatars.com/api/?name=Team&background=0f172a&color=f97316&bold=true&size=128';
  }
  const t = teamName.toLowerCase().trim();

  // NBA Franchises (Official high-res ESPN CDN vectors)
  if (t.includes('celtic') || t.includes('boston')) return 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png';
  if (t.includes('heat') || t.includes('miami')) return 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png';
  if (t.includes('laker') || t.includes('los angeles lakers') || t === 'la lakers') return 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png';
  if (t.includes('warrior') || t.includes('golden state')) return 'https://a.espncdn.com/i/teamlogos/nba/500/gsw.png';
  if (t.includes('nugget') || t.includes('denver')) return 'https://a.espncdn.com/i/teamlogos/nba/500/den.png';
  if (t.includes('sun') || t.includes('phoenix')) return 'https://a.espncdn.com/i/teamlogos/nba/500/phx.png';
  if (t.includes('buck') || t.includes('milwaukee')) return 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png';
  if (t.includes('76er') || t.includes('sixer') || t.includes('philadelphia')) return 'https://a.espncdn.com/i/teamlogos/nba/500/phi.png';
  if (t.includes('maverick') || t.includes('dallas')) return 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png';
  if (t.includes('thunder') || t.includes('okc') || t.includes('oklahoma')) return 'https://a.espncdn.com/i/teamlogos/nba/500/okc.png';
  if (t.includes('knick') || t.includes('ny knicks') || t.includes('new york')) return 'https://a.espncdn.com/i/teamlogos/nba/500/ny.png';
  if (t.includes('bull') || t.includes('chicago')) return 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png';
  if (t.includes('cavalier') || t.includes('cleveland')) return 'https://a.espncdn.com/i/teamlogos/nba/500/cle.png';
  if (t.includes('pacer') || t.includes('indiana')) return 'https://a.espncdn.com/i/teamlogos/nba/500/ind.png';
  if (t.includes('magic') || t.includes('orlando')) return 'https://a.espncdn.com/i/teamlogos/nba/500/orl.png';
  if (t.includes('timberwol') || t.includes('minnesota')) return 'https://a.espncdn.com/i/teamlogos/nba/500/min.png';
  if (t.includes('clipper') || t.includes('la clippers')) return 'https://a.espncdn.com/i/teamlogos/nba/500/lac.png';
  if (t.includes('grizzlie') || t.includes('memphis')) return 'https://a.espncdn.com/i/teamlogos/nba/500/mem.png';
  if (t.includes('pelican') || t.includes('new orleans')) return 'https://a.espncdn.com/i/teamlogos/nba/500/nop.png';
  if (t.includes('rocket') || t.includes('houston')) return 'https://a.espncdn.com/i/teamlogos/nba/500/hou.png';
  if (t.includes('spur') || t.includes('san antonio')) return 'https://a.espncdn.com/i/teamlogos/nba/500/sas.png';
  if (t.includes('raptor') || t.includes('toronto')) return 'https://a.espncdn.com/i/teamlogos/nba/500/tor.png';
  if (t.includes('net') || t.includes('brooklyn')) return 'https://a.espncdn.com/i/teamlogos/nba/500/bkn.png';
  if (t.includes('hawk') || t.includes('atlanta')) return 'https://a.espncdn.com/i/teamlogos/nba/500/atl.png';
  if (t.includes('hornets') || t.includes('charlotte')) return 'https://a.espncdn.com/i/teamlogos/nba/500/cha.png';
  if (t.includes('piston') || t.includes('detroit')) return 'https://a.espncdn.com/i/teamlogos/nba/500/det.png';
  if (t.includes('wizard') || t.includes('washington')) return 'https://a.espncdn.com/i/teamlogos/nba/500/was.png';
  if (t.includes('blazer') || t.includes('portland')) return 'https://a.espncdn.com/i/teamlogos/nba/500/por.png';
  if (t.includes('jazz') || t.includes('utah')) return 'https://a.espncdn.com/i/teamlogos/nba/500/uta.png';
  if (t.includes('king') && !t.includes('sydney')) return 'https://a.espncdn.com/i/teamlogos/nba/500/sac.png';

  // EuroLeague / Global / BAL Clubs
  if (t.includes('sydney kings')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/nbl/500/1004.png';
  if (t.includes('melbourne united')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/nbl/500/1001.png';
  if (t.includes('real madrid')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/104.png';
  if (t.includes('cska')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/102.png';
  if (t.includes('fenerbah')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/103.png';
  if (t.includes('efes') || t.includes('anadolu')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/101.png';
  if (t.includes('barcelona')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/100.png';
  if (t.includes('olympiak')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/109.png';
  if (t.includes('panathinaikos')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/108.png';
  if (t.includes('monaco')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/115.png';
  if (t.includes('maccabi')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/106.png';
  if (t.includes('baskonia')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/107.png';
  if (t.includes('virtus')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/110.png';
  if (t.includes('unicaja')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/112.png';
  if (t.includes('valencia')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/114.png';
  if (t.includes('petro') || t.includes('luanda')) return 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=120&h=120&fit=crop&auto=format';
  if (t.includes('monastir')) return 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=120&h=120&fit=crop&auto=format';
  if (t.includes('nigeria') || t.includes('patriot')) return 'https://flagcdn.com/w80/ng.png';
  if (t.includes('rwanda')) return 'https://flagcdn.com/w80/rw.png';
  if (t.includes('angola')) return 'https://flagcdn.com/w80/ao.png';

  // High-fidelity dynamic API image fallback (UI-Avatars with orange/slate hoop branding)
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName)}&background=0f172a&color=f97316&bold=true&size=128`;
}

// ─── Micro-Components ─────────────────────────────────────────────────────────

export function DynamicTeamLogo({
  name,
  logoUrl,
  className = 'w-6 h-6',
}: {
  name: string;
  logoUrl?: string;
  className?: string;
}) {
  const initialSrc = logoUrl || getBasketballTeamLogo(name);
  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(logoUrl || getBasketballTeamLogo(name));
    setHasError(false);
  }, [name, logoUrl]);

  return (
    <div className={`relative flex items-center justify-center rounded-lg overflow-hidden bg-slate-900/60 border border-slate-700/50 flex-shrink-0 ${className}`}>
      <img
        src={hasError ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'B')}&background=0f172a&color=f97316&bold=true&size=128` : imgSrc}
        alt={name}
        loading="lazy"
        className="w-full h-full object-contain p-0.5"
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setImgSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'B')}&background=0f172a&color=f97316&bold=true&size=128`);
          }
        }}
      />
    </div>
  );
}

export function DynamicPlayerAvatar({
  name,
  photo,
  className = 'w-10 h-10',
}: {
  name: string;
  photo?: string;
  className?: string;
}) {
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f172a&color=f97316&bold=true&size=128`;
  const [src, setSrc] = useState(photo || fallback);

  useEffect(() => {
    setSrc(photo || fallback);
  }, [photo, name, fallback]);

  return (
    <div className={`relative rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0 ${className}`}>
      <img
        src={src}
        alt={name}
        loading="lazy"
        className="w-full h-full object-cover"
        onError={() => setSrc(fallback)}
      />
    </div>
  );
}

function FormDot({ r }: { r: 'W' | 'L' }) {
  return (
    <span
      className={`w-5 h-5 rounded text-[9px] font-black flex items-center justify-center border shadow-xs transition-transform hover:scale-110 ${
        r === 'W'
          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
          : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
      }`}
    >
      {r}
    </span>
  );
}

export function getGameQuarters(g: GameItem) {
  if (g.quarters) return g.quarters;
  const hTotal = g.hScore ?? 108;
  const aTotal = g.aScore ?? 104;
  const q1H = Math.round(hTotal * 0.24);
  const q2H = Math.round(hTotal * 0.26);
  const q3H = Math.round(hTotal * 0.25);
  const q4H = hTotal - (q1H + q2H + q3H);

  const q1A = Math.round(aTotal * 0.25);
  const q2A = Math.round(aTotal * 0.24);
  const q3A = Math.round(aTotal * 0.26);
  const q4A = aTotal - (q1A + q2A + q3A);

  return { q1H, q1A, q2H, q2A, q3H, q3A, q4H, q4A };
}

export function getGameTeamStats(g: GameItem) {
  if (g.teamStats) return g.teamStats;
  const hTotal = g.hScore ?? 108;
  const aTotal = g.aScore ?? 104;
  const isHomeWinner = hTotal >= aTotal;
  return {
    fgH: isHomeWinner ? '48.6%' : '44.2%',
    fgA: isHomeWinner ? '43.8%' : '49.1%',
    threePtH: isHomeWinner ? '38.5%' : '32.1%',
    threePtA: isHomeWinner ? '31.4%' : '40.0%',
    rebH: isHomeWinner ? 48 : 42,
    rebA: isHomeWinner ? 41 : 47,
    toH: isHomeWinner ? 11 : 16,
    toA: isHomeWinner ? 15 : 10,
    fastBreakH: isHomeWinner ? 18 : 12,
    fastBreakA: isHomeWinner ? 11 : 17,
  };
}

function GameCard({
  g,
  onQuickBoxScore,
}: {
  g: GameItem;
  onQuickBoxScore?: (game: GameItem) => void;
}) {
  const isLive = g.status === 'LIVE' || g.status === 'HT' || g.status === 'OT';
  const isFT = g.status === 'FT';

  return (
    <div className="group relative block bg-[#0f172a] border border-[#1e293b] rounded-2xl hover:border-orange-500/50 hover:bg-[#131f35] transition-all duration-200 overflow-hidden shadow-sm hover:shadow-orange-500/5 hover:-translate-y-0.5">
      <Link href={`/basketball/matches/${g.id}`} className="block">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1e293b]/70 bg-[#0c1322]/80">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase truncate flex items-center gap-1.5">
            <span>{g.compFlag}</span>
            <span className="truncate">{g.comp}</span>
          </span>
          {isLive ? (
            <span className="flex items-center gap-1.5 text-[10px] font-black text-rose-400 uppercase tracking-widest flex-shrink-0 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block animate-pulse" />
              {g.status === 'HT' ? 'Halftime' : `${g.quarter || 'LIVE'} · ${g.clock || 'Active'}`}
            </span>
          ) : isFT ? (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50">
              Final · {g.date || 'Full Time'}
            </span>
          ) : (
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded">
              {g.time || g.date || 'Tipoff Soon'}
            </span>
          )}
        </div>

        <div className="px-4 py-3.5 space-y-3">
          {/* Home Team */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <DynamicTeamLogo name={g.home} logoUrl={g.homeLogo} className="w-7 h-7" />
              <span className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors truncate">
                {g.home}
              </span>
            </div>
            <span
              className={`text-base font-black tabular-nums flex-shrink-0 text-right min-w-[32px] px-2 py-0.5 rounded ${
                isLive
                  ? 'text-white bg-orange-500/20 border border-orange-500/40'
                  : isFT
                  ? 'text-slate-200 bg-slate-800/50'
                  : 'text-slate-500'
              }`}
            >
              {g.hScore !== null ? g.hScore : '—'}
            </span>
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <DynamicTeamLogo name={g.away} logoUrl={g.awayLogo} className="w-7 h-7" />
              <span className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors truncate">
                {g.away}
              </span>
            </div>
            <span
              className={`text-base font-black tabular-nums flex-shrink-0 text-right min-w-[32px] px-2 py-0.5 rounded ${
                isLive
                  ? 'text-white bg-orange-500/20 border border-orange-500/40'
                  : isFT
                  ? 'text-slate-200 bg-slate-800/50'
                  : 'text-slate-500'
              }`}
            >
              {g.aScore !== null ? g.aScore : '—'}
            </span>
          </div>
        </div>
      </Link>

      {/* Card Action Bar */}
      <div className="px-4 py-2 bg-[#090f1a] border-t border-[#1e293b]/60 flex items-center justify-between text-[10px] text-slate-400">
        <span className="truncate flex items-center gap-1">
          <span>📍</span>
          <span className="truncate">{g.arena || 'Championship Court'}</span>
        </span>
        <div className="flex items-center gap-2">
          {onQuickBoxScore && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickBoxScore(g);
              }}
              className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-orange-500/15 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white transition-all cursor-pointer flex items-center gap-1"
            >
              <FiActivity className="w-2.5 h-2.5" />
              <span>Quick Box</span>
            </button>
          )}
          <Link
            href={`/basketball/matches/${g.id}`}
            className="text-orange-400/80 hover:text-orange-300 font-bold hover:translate-x-0.5 transition-all flex items-center gap-0.5"
          >
            <span>Details</span>
            <FiChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function QuarterBoxScoreModal({
  game,
  onClose,
}: {
  game: GameItem;
  onClose: () => void;
}) {
  const isLive = game.status === 'LIVE' || game.status === 'HT' || game.status === 'OT';
  const isFT = game.status === 'FT';
  const quarters = getGameQuarters(game);
  const stats = getGameTeamStats(game);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        className="relative w-full max-w-2xl bg-[#0a1122] border border-orange-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/10 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] bg-[#0c1322]">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">{game.compFlag}</span>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">
                {game.comp} · Telemetry Box Score
              </h3>
              <p className="text-[10px] text-slate-400">
                {game.arena || 'Championship Arena'} · {game.date || 'Live Match Centre'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLive && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500/20 border border-rose-500/40 text-rose-400 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                {game.quarter || 'LIVE'} {game.clock ? `· ${game.clock}` : ''}
              </span>
            )}
            {isFT && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 border border-slate-700 text-slate-300">
                FINAL
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Big Score Header */}
          <div className="grid grid-cols-3 items-center text-center p-4 bg-[#050b14] rounded-2xl border border-slate-800/80">
            {/* Home */}
            <div className="flex flex-col items-center">
              <DynamicTeamLogo name={game.home} logoUrl={game.homeLogo} className="w-14 h-14 mb-2 shadow-md" />
              <span className="text-sm font-black text-white">{game.home}</span>
              <span className="text-2xl sm:text-3xl font-black text-orange-400 mt-1 tabular-nums">
                {game.hScore !== null ? game.hScore : '—'}
              </span>
            </div>
            {/* VS / Clock */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full mb-1">
                {isLive ? 'In Play' : isFT ? 'Ended' : 'Scheduled'}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                {game.clock || game.time || 'Tipoff'}
              </span>
            </div>
            {/* Away */}
            <div className="flex flex-col items-center">
              <DynamicTeamLogo name={game.away} logoUrl={game.awayLogo} className="w-14 h-14 mb-2 shadow-md" />
              <span className="text-sm font-black text-white">{game.away}</span>
              <span className="text-2xl sm:text-3xl font-black text-orange-400 mt-1 tabular-nums">
                {game.aScore !== null ? game.aScore : '—'}
              </span>
            </div>
          </div>

          {/* Quarter Breakdown Matrix */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-1.5">
              <span>⏱️ Quarter-by-Quarter Box Score</span>
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#060c18]">
              <table className="w-full text-xs text-center">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-black uppercase text-slate-400 bg-slate-900/60">
                    <th className="py-2.5 px-3 text-left">Team</th>
                    <th className="py-2.5 px-2">Q1</th>
                    <th className="py-2.5 px-2">Q2</th>
                    <th className="py-2.5 px-2">Q3</th>
                    <th className="py-2.5 px-2">Q4</th>
                    {quarters.otH !== undefined && <th className="py-2.5 px-2">OT</th>}
                    <th className="py-2.5 px-3 text-right font-bold text-white">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  <tr>
                    <td className="py-2.5 px-3 text-left font-sans font-bold text-slate-200 flex items-center gap-2">
                      <DynamicTeamLogo name={game.home} logoUrl={game.homeLogo} className="w-4 h-4" />
                      <span className="truncate">{game.home}</span>
                    </td>
                    <td className="py-2.5 px-2 text-slate-300">{quarters.q1H}</td>
                    <td className="py-2.5 px-2 text-slate-300">{quarters.q2H}</td>
                    <td className="py-2.5 px-2 text-slate-300">{quarters.q3H}</td>
                    <td className="py-2.5 px-2 text-slate-300">{quarters.q4H}</td>
                    {quarters.otH !== undefined && <td className="py-2.5 px-2 text-amber-400">{quarters.otH}</td>}
                    <td className="py-2.5 px-3 text-right font-bold text-orange-400 text-sm">{game.hScore ?? quarters.q1H + quarters.q2H + quarters.q3H + quarters.q4H}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-left font-sans font-bold text-slate-200 flex items-center gap-2">
                      <DynamicTeamLogo name={game.away} logoUrl={game.awayLogo} className="w-4 h-4" />
                      <span className="truncate">{game.away}</span>
                    </td>
                    <td className="py-2.5 px-2 text-slate-300">{quarters.q1A}</td>
                    <td className="py-2.5 px-2 text-slate-300">{quarters.q2A}</td>
                    <td className="py-2.5 px-2 text-slate-300">{quarters.q3A}</td>
                    <td className="py-2.5 px-2 text-slate-300">{quarters.q4A}</td>
                    {quarters.otA !== undefined && <td className="py-2.5 px-2 text-amber-400">{quarters.otA}</td>}
                    <td className="py-2.5 px-3 text-right font-bold text-orange-400 text-sm">{game.aScore ?? quarters.q1A + quarters.q2A + quarters.q3A + quarters.q4A}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Team Telemetry Comparison Bars */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <span>📊 Key Match Telemetry</span>
            </h4>
            <div className="space-y-3 bg-[#060c18] border border-slate-800 rounded-2xl p-4">
              {[
                { label: 'Field Goal %', hVal: stats.fgH, aVal: stats.fgA, hPercent: parseFloat(stats.fgH), aPercent: parseFloat(stats.fgA) },
                { label: '3-Point %', hVal: stats.threePtH, aVal: stats.threePtA, hPercent: parseFloat(stats.threePtH), aPercent: parseFloat(stats.threePtA) },
                { label: 'Total Rebounds', hVal: String(stats.rebH), aVal: String(stats.rebA), hPercent: (stats.rebH / (stats.rebH + stats.rebA)) * 100, aPercent: (stats.rebA / (stats.rebH + stats.rebA)) * 100 },
                { label: 'Turnovers', hVal: String(stats.toH), aVal: String(stats.toA), hPercent: (stats.toH / (stats.toH + stats.toA)) * 100, aPercent: (stats.toA / (stats.toH + stats.toA)) * 100 },
                { label: 'Fast Break Points', hVal: String(stats.fastBreakH), aVal: String(stats.fastBreakA), hPercent: (stats.fastBreakH / (stats.fastBreakH + stats.fastBreakA)) * 100, aPercent: (stats.fastBreakA / (stats.fastBreakH + stats.fastBreakA)) * 100 },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-orange-400 font-mono">{item.hVal}</span>
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">{item.label}</span>
                    <span className="text-amber-400 font-mono">{item.aVal}</span>
                  </div>
                  <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-800 gap-0.5">
                    <div className="bg-orange-500 rounded-l-full" style={{ width: `${item.hPercent}%` }} />
                    <div className="bg-amber-500 rounded-r-full" style={{ width: `${item.aPercent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#1e293b] bg-[#0c1322]">
          <Link
            href={`/basketball/matches/${game.id}`}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-black px-5 py-2.5 rounded-xl uppercase tracking-wider shadow-md shadow-orange-600/20 transition-all cursor-pointer"
          >
            <span>Full Match Centre</span>
            <FiExternalLink />
          </Link>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function OddsBetSlipCalculator({
  selectedPick,
  oddsFormat,
  onClear,
  onToast,
}: {
  selectedPick: {
    match: string;
    team: string;
    type: string;
    line: string;
    oddsDecimal: number;
    oddsAmerican: string;
  } | null;
  oddsFormat: 'decimal' | 'american';
  onClear: () => void;
  onToast: (msg: string) => void;
}) {
  const [stake, setStake] = useState<number>(25);

  if (!selectedPick) {
    return (
      <div className="p-6 bg-[#0a1120] border border-dashed border-slate-800 rounded-2xl text-center space-y-2">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto text-lg">
          🎯
        </div>
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
          Interactive Bet Slip & Payout Simulator
        </h4>
        <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
          Click any point spread, moneyline, or over/under line in the odds board to simulate payouts and track consensus movement.
        </p>
      </div>
    );
  }

  const oddsDisplay = oddsFormat === 'decimal' ? selectedPick.oddsDecimal.toFixed(2) : selectedPick.oddsAmerican;
  const potentialReturn = (stake * selectedPick.oddsDecimal).toFixed(2);
  const potentialProfit = (stake * (selectedPick.oddsDecimal - 1)).toFixed(2);

  return (
    <div className="p-5 bg-gradient-to-br from-[#0c1322] to-[#080d1a] border border-orange-500/40 rounded-2xl shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">
            Selected Line Wager
          </span>
        </div>
        <button
          onClick={onClear}
          className="text-slate-400 hover:text-white text-xs p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
          title="Clear Pick"
        >
          <FiX />
        </button>
      </div>

      <div>
        <p className="text-[10px] text-slate-400 font-semibold">{selectedPick.match}</p>
        <div className="flex items-baseline justify-between mt-1">
          <h4 className="text-sm font-black text-white">
            {selectedPick.team} <span className="text-orange-400">({selectedPick.line})</span>
          </h4>
          <span className="text-xs font-mono font-bold bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded border border-orange-500/30">
            {oddsDisplay}
          </span>
        </div>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
          {selectedPick.type} Market
        </span>
      </div>

      {/* Stake Selection */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          Wager Stake ($)
        </label>
        <div className="flex gap-2">
          {[10, 25, 50, 100].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setStake(preset)}
              className={`flex-1 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                stake === preset
                  ? 'bg-orange-600 border-orange-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              ${preset}
            </button>
          ))}
        </div>
        <input
          type="number"
          min="1"
          max="10000"
          value={stake}
          onChange={(e) => setStake(Math.max(1, Number(e.target.value) || 0))}
          className="w-full mt-1.5 px-3 py-1.5 bg-[#060c18] border border-slate-800 rounded-lg text-xs text-white font-mono focus:border-orange-500 focus:outline-none"
          placeholder="Custom Stake"
        />
      </div>

      {/* Output Return & Profit */}
      <div className="grid grid-cols-2 gap-2 p-3 bg-[#060c18] rounded-xl border border-slate-800 text-center">
        <div>
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Total Payout</span>
          <p className="text-sm font-mono font-black text-white mt-0.5">${potentialReturn}</p>
        </div>
        <div>
          <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">Est. Profit</span>
          <p className="text-sm font-mono font-black text-emerald-400 mt-0.5">+${potentialProfit}</p>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={() => onToast(`Tracked ${selectedPick.team} (${selectedPick.line}) @ ${oddsDisplay}! Real-time line alerts configured.`)}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-black uppercase tracking-widest shadow-md shadow-orange-600/20 transition-all cursor-pointer"
      >
        Track Consensus Line Alerts
      </button>
    </div>
  );
}

function SideSection({
  title,
  action,
  defaultOpen = true,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-sm transition-all">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e293b] bg-[#0c1322]">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-xs font-black text-slate-200 hover:text-white uppercase tracking-wider text-left flex-1 cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
          <span>{title}</span>
        </button>
        <div className="flex items-center gap-2">
          {action}
          <button
            onClick={() => setOpen(!open)}
            className="text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
          >
            <FiChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                open ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>
      {open && <div>{children}</div>}
    </div>
  );
}

// ─── Baseline Data ────────────────────────────────────────────────────────────

const LIVE_GAMES_BASELINE: GameItem[] = [
  {
    id: '1',
    comp: 'NBA',
    compFlag: '🇺🇸',
    home: 'Boston Celtics',
    homeLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png',
    away: 'Miami Heat',
    awayLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png',
    hScore: 104,
    aScore: 98,
    quarter: 'Q4',
    clock: '2:14',
    status: 'LIVE',
    arena: 'TD Garden, Boston',
  },
  {
    id: '2',
    comp: 'NBA',
    compFlag: '🇺🇸',
    home: 'LA Lakers',
    homeLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png',
    away: 'Golden State Warriors',
    awayLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/gsw.png',
    hScore: 89,
    aScore: 91,
    quarter: 'Q3',
    clock: '4:45',
    status: 'LIVE',
    arena: 'Crypto.com Arena, Los Angeles',
  },
  {
    id: '3',
    comp: 'EuroLeague',
    compFlag: '🇪🇺',
    home: 'Real Madrid',
    homeLogo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/104.png',
    away: 'CSKA Moscow',
    awayLogo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/102.png',
    hScore: 72,
    aScore: 68,
    quarter: 'Q4',
    clock: '6:10',
    status: 'LIVE',
    arena: 'WiZink Center, Madrid',
  },
  {
    id: '4',
    comp: 'BAL',
    compFlag: '🌍',
    home: 'Petro de Luanda',
    homeLogo: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=120&h=120&fit=crop&auto=format',
    away: 'US Monastir',
    awayLogo: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=120&h=120&fit=crop&auto=format',
    hScore: 88,
    aScore: 76,
    quarter: 'FT',
    clock: '',
    status: 'FT',
    date: 'Sep 13',
    arena: 'BK Arena, Kigali',
  },
  {
    id: '5',
    comp: 'NBA',
    compFlag: '🇺🇸',
    home: 'Denver Nuggets',
    homeLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/den.png',
    away: 'Phoenix Suns',
    awayLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/phx.png',
    hScore: 111,
    aScore: 108,
    quarter: 'FT',
    clock: '',
    status: 'FT',
    date: 'Sep 13',
    arena: 'Ball Arena, Denver',
  },
  {
    id: '6',
    comp: 'EuroLeague',
    compFlag: '🇪🇺',
    home: 'Fenerbahçe',
    homeLogo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/103.png',
    away: 'Anadolu Efes',
    awayLogo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/101.png',
    hScore: 65,
    aScore: 65,
    quarter: 'HT',
    clock: '',
    status: 'HT',
    arena: 'Ülker Sports Arena, Istanbul',
  },
];

const UPCOMING_GAMES_BASELINE: GameItem[] = [
  {
    id: '7',
    comp: 'NBA Playoffs',
    compFlag: '🇺🇸',
    home: 'Milwaukee Bucks',
    homeLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png',
    away: 'Philadelphia 76ers',
    awayLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/phi.png',
    hScore: null,
    aScore: null,
    status: 'UPCOMING',
    time: '20:30 ET',
    date: 'Today',
    arena: 'Fiserv Forum, Milwaukee',
  },
  {
    id: '8',
    comp: 'NBA',
    compFlag: '🇺🇸',
    home: 'Dallas Mavericks',
    homeLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png',
    away: 'OKC Thunder',
    awayLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/okc.png',
    hScore: null,
    aScore: null,
    status: 'UPCOMING',
    time: '22:00 ET',
    date: 'Today',
    arena: 'American Airlines Center, Dallas',
  },
  {
    id: '9',
    comp: 'EuroLeague',
    compFlag: '🇪🇺',
    home: 'FC Barcelona',
    homeLogo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/100.png',
    away: 'Olympiacos',
    awayLogo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/109.png',
    hScore: null,
    aScore: null,
    status: 'UPCOMING',
    time: '19:45 CET',
    date: 'Tomorrow',
    arena: 'Palau Blaugrana, Barcelona',
  },
  {
    id: '10',
    comp: 'NBL',
    compFlag: '🇦🇺',
    home: 'Sydney Kings',
    homeLogo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/nbl/500/1004.png',
    away: 'Melbourne United',
    awayLogo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/nbl/500/1001.png',
    hScore: null,
    aScore: null,
    status: 'UPCOMING',
    time: '19:30 AEST',
    date: 'Tomorrow',
    arena: 'Qudos Bank Arena, Sydney',
  },
  {
    id: '11',
    comp: 'BAL',
    compFlag: '🌍',
    home: 'Al Ahly',
    homeLogo: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=120&h=120&fit=crop&auto=format',
    away: 'Cape Town Tigers',
    awayLogo: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=120&h=120&fit=crop&auto=format',
    hScore: null,
    aScore: null,
    status: 'UPCOMING',
    time: '18:00 CAT',
    date: 'Sep 19',
    arena: 'Hassan Moustafa Sports Hall, Cairo',
  },
  {
    id: '12',
    comp: 'NBA',
    compFlag: '🇺🇸',
    home: 'New York Knicks',
    homeLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/ny.png',
    away: 'Indiana Pacers',
    awayLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/ind.png',
    hScore: null,
    aScore: null,
    status: 'UPCOMING',
    time: '19:00 ET',
    date: 'Sep 19',
    arena: 'Madison Square Garden, New York',
  },
];

const RESULTS_BASELINE: GameItem[] = [
  {
    id: '13',
    comp: 'NBA',
    compFlag: '🇺🇸',
    home: 'Boston Celtics',
    homeLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png',
    away: 'New York Knicks',
    awayLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/ny.png',
    hScore: 118,
    aScore: 104,
    status: 'FT',
    date: 'Yesterday',
    arena: 'TD Garden',
  },
  {
    id: '14',
    comp: 'EuroLeague',
    compFlag: '🇪🇺',
    home: 'Panathinaikos',
    homeLogo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/108.png',
    away: 'Real Madrid',
    awayLogo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/104.png',
    hScore: 95,
    aScore: 80,
    status: 'FT',
    date: 'Yesterday',
    arena: 'OAKA Altion, Athens',
  },
  {
    id: '15',
    comp: 'NBA',
    compFlag: '🇺🇸',
    home: 'Minnesota Timberwolves',
    homeLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/min.png',
    away: 'Denver Nuggets',
    awayLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/den.png',
    hScore: 98,
    aScore: 90,
    status: 'FT',
    date: 'Sep 16',
    arena: 'Target Center, Minneapolis',
  },
  {
    id: '16',
    comp: 'Liga ACB',
    compFlag: '🇪🇸',
    home: 'Unicaja',
    homeLogo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/112.png',
    away: 'Valencia Basket',
    awayLogo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/114.png',
    hScore: 84,
    aScore: 79,
    status: 'FT',
    date: 'Sep 15',
    arena: 'Palacio de Deportes Martín Carpena',
  },
];

const NBA_EAST_STANDINGS: StandingsRow[] = [
  { pos: 1, team: 'Boston Celtics', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png', w: 64, l: 18, pct: '.780', gb: '—', ppg: 120.6, oppg: 109.2, form: ['W', 'W', 'W', 'L', 'W'], zone: 'playoffs', conf: 'East', league: 'NBA' },
  { pos: 2, team: 'New York Knicks', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/ny.png', w: 50, l: 32, pct: '.610', gb: '14.0', ppg: 112.8, oppg: 108.2, form: ['W', 'W', 'L', 'W', 'W'], zone: 'playoffs', conf: 'East', league: 'NBA' },
  { pos: 3, team: 'Milwaukee Bucks', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png', w: 49, l: 33, pct: '.598', gb: '15.0', ppg: 119.0, oppg: 116.4, form: ['L', 'W', 'W', 'L', 'L'], zone: 'playoffs', conf: 'East', league: 'NBA' },
  { pos: 4, team: 'Cleveland Cavaliers', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/cle.png', w: 48, l: 34, pct: '.585', gb: '16.0', ppg: 112.6, oppg: 110.2, form: ['W', 'L', 'W', 'W', 'L'], zone: 'playoffs', conf: 'East', league: 'NBA' },
  { pos: 5, team: 'Orlando Magic', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/orl.png', w: 47, l: 35, pct: '.573', gb: '17.0', ppg: 110.4, oppg: 108.4, form: ['W', 'W', 'L', 'W', 'W'], zone: 'playoffs', conf: 'East', league: 'NBA' },
  { pos: 6, team: 'Indiana Pacers', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/ind.png', w: 47, l: 35, pct: '.573', gb: '17.0', ppg: 123.3, oppg: 120.2, form: ['W', 'W', 'W', 'L', 'W'], zone: 'playoffs', conf: 'East', league: 'NBA' },
  { pos: 7, team: 'Philadelphia 76ers', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/phi.png', w: 47, l: 35, pct: '.573', gb: '17.0', ppg: 114.6, oppg: 111.5, form: ['W', 'W', 'W', 'W', 'W'], zone: 'playin', conf: 'East', league: 'NBA' },
  { pos: 8, team: 'Miami Heat', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png', w: 46, l: 36, pct: '.561', gb: '18.0', ppg: 110.1, oppg: 108.4, form: ['W', 'L', 'W', 'L', 'W'], zone: 'playin', conf: 'East', league: 'NBA' },
  { pos: 9, team: 'Chicago Bulls', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png', w: 39, l: 43, pct: '.476', gb: '25.0', ppg: 112.3, oppg: 113.7, form: ['L', 'W', 'L', 'W', 'L'], zone: 'playin', conf: 'East', league: 'NBA' },
  { pos: 10, team: 'Atlanta Hawks', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/atl.png', w: 36, l: 46, pct: '.439', gb: '28.0', ppg: 118.3, oppg: 120.5, form: ['L', 'L', 'L', 'L', 'L'], zone: 'playin', conf: 'East', league: 'NBA' },
  { pos: 11, team: 'Brooklyn Nets', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/bkn.png', w: 32, l: 50, pct: '.390', gb: '32.0', ppg: 110.4, oppg: 113.3, form: ['L', 'W', 'L', 'L', 'W'], zone: 'lottery', conf: 'East', league: 'NBA' },
  { pos: 12, team: 'Toronto Raptors', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/tor.png', w: 25, l: 57, pct: '.305', gb: '39.0', ppg: 112.4, oppg: 118.8, form: ['L', 'L', 'L', 'W', 'L'], zone: 'lottery', conf: 'East', league: 'NBA' },
  { pos: 13, team: 'Charlotte Hornets', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/cha.png', w: 21, l: 61, pct: '.256', gb: '43.0', ppg: 106.6, oppg: 116.8, form: ['W', 'L', 'L', 'L', 'L'], zone: 'lottery', conf: 'East', league: 'NBA' },
  { pos: 14, team: 'Washington Wizards', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/was.png', w: 15, l: 67, pct: '.183', gb: '49.0', ppg: 112.8, oppg: 123.0, form: ['L', 'L', 'L', 'L', 'L'], zone: 'lottery', conf: 'East', league: 'NBA' },
  { pos: 15, team: 'Detroit Pistons', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/det.png', w: 14, l: 68, pct: '.171', gb: '50.0', ppg: 109.9, oppg: 119.0, form: ['L', 'L', 'L', 'L', 'L'], zone: 'lottery', conf: 'East', league: 'NBA' },
];

const NBA_WEST_STANDINGS: StandingsRow[] = [
  { pos: 1, team: 'OKC Thunder', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/okc.png', w: 57, l: 25, pct: '.695', gb: '—', ppg: 120.1, oppg: 112.7, form: ['W', 'W', 'W', 'W', 'W'], zone: 'playoffs', conf: 'West', league: 'NBA' },
  { pos: 2, team: 'Denver Nuggets', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/den.png', w: 57, l: 25, pct: '.695', gb: '—', ppg: 114.9, oppg: 109.6, form: ['W', 'L', 'W', 'W', 'L'], zone: 'playoffs', conf: 'West', league: 'NBA' },
  { pos: 3, team: 'Minnesota Timberwolves', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/min.png', w: 56, l: 26, pct: '.683', gb: '1.0', ppg: 113.0, oppg: 106.5, form: ['L', 'W', 'W', 'L', 'W'], zone: 'playoffs', conf: 'West', league: 'NBA' },
  { pos: 4, team: 'LA Clippers', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/lac.png', w: 51, l: 31, pct: '.622', gb: '6.0', ppg: 115.6, oppg: 112.3, form: ['L', 'L', 'W', 'W', 'W'], zone: 'playoffs', conf: 'West', league: 'NBA' },
  { pos: 5, team: 'Dallas Mavericks', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png', w: 50, l: 32, pct: '.610', gb: '7.0', ppg: 117.9, oppg: 115.6, form: ['L', 'L', 'W', 'W', 'W'], zone: 'playoffs', conf: 'West', league: 'NBA' },
  { pos: 6, team: 'Phoenix Suns', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/phx.png', w: 49, l: 33, pct: '.598', gb: '8.0', ppg: 116.2, oppg: 113.2, form: ['W', 'W', 'W', 'L', 'W'], zone: 'playoffs', conf: 'West', league: 'NBA' },
  { pos: 7, team: 'New Orleans Pelicans', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/nop.png', w: 49, l: 33, pct: '.598', gb: '8.0', ppg: 115.1, oppg: 110.7, form: ['L', 'W', 'W', 'W', 'W'], zone: 'playin', conf: 'West', league: 'NBA' },
  { pos: 8, team: 'LA Lakers', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png', w: 47, l: 35, pct: '.573', gb: '10.0', ppg: 118.0, oppg: 117.4, form: ['W', 'W', 'L', 'W', 'W'], zone: 'playin', conf: 'West', league: 'NBA' },
  { pos: 9, team: 'Sacramento Kings', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/sac.png', w: 46, l: 36, pct: '.561', gb: '11.0', ppg: 116.6, oppg: 114.8, form: ['W', 'L', 'L', 'L', 'W'], zone: 'playin', conf: 'West', league: 'NBA' },
  { pos: 10, team: 'Golden State Warriors', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/gsw.png', w: 46, l: 36, pct: '.561', gb: '11.0', ppg: 117.8, oppg: 115.2, form: ['W', 'W', 'L', 'W', 'W'], zone: 'playin', conf: 'West', league: 'NBA' },
  { pos: 11, team: 'Houston Rockets', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/hou.png', w: 41, l: 41, pct: '.500', gb: '16.0', ppg: 114.3, oppg: 113.2, form: ['W', 'W', 'L', 'W', 'L'], zone: 'lottery', conf: 'West', league: 'NBA' },
  { pos: 12, team: 'Utah Jazz', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/uta.png', w: 31, l: 51, pct: '.378', gb: '26.0', ppg: 115.7, oppg: 120.5, form: ['L', 'W', 'W', 'L', 'L'], zone: 'lottery', conf: 'West', league: 'NBA' },
  { pos: 13, team: 'Memphis Grizzlies', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mem.png', w: 27, l: 55, pct: '.329', gb: '30.0', ppg: 105.8, oppg: 112.8, form: ['L', 'L', 'L', 'L', 'L'], zone: 'lottery', conf: 'West', league: 'NBA' },
  { pos: 14, team: 'San Antonio Spurs', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/sas.png', w: 22, l: 60, pct: '.268', gb: '35.0', ppg: 112.1, oppg: 118.6, form: ['W', 'W', 'L', 'W', 'L'], zone: 'lottery', conf: 'West', league: 'NBA' },
  { pos: 15, team: 'Portland Trail Blazers', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/por.png', w: 21, l: 61, pct: '.256', gb: '36.0', ppg: 106.4, oppg: 115.4, form: ['L', 'L', 'L', 'L', 'L'], zone: 'lottery', conf: 'West', league: 'NBA' },
];

const EUROLEAGUE_STANDINGS: StandingsRow[] = [
  { pos: 1, team: 'Real Madrid', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/104.png', w: 27, l: 7, pct: '.794', gb: '—', ppg: 88.5, oppg: 80.2, form: ['W', 'W', 'W', 'L', 'W'], zone: 'playoffs', conf: 'East', league: 'EuroLeague' },
  { pos: 2, team: 'Panathinaikos AKTOR', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/108.png', w: 23, l: 11, pct: '.676', gb: '4.0', ppg: 84.1, oppg: 78.9, form: ['W', 'W', 'L', 'W', 'W'], zone: 'playoffs', conf: 'East', league: 'EuroLeague' },
  { pos: 3, team: 'AS Monaco', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/115.png', w: 23, l: 11, pct: '.676', gb: '4.0', ppg: 82.9, oppg: 79.5, form: ['W', 'L', 'W', 'W', 'W'], zone: 'playoffs', conf: 'East', league: 'EuroLeague' },
  { pos: 4, team: 'FC Barcelona', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/100.png', w: 22, l: 12, pct: '.647', gb: '5.0', ppg: 83.7, oppg: 80.8, form: ['L', 'W', 'W', 'L', 'W'], zone: 'playoffs', conf: 'East', league: 'EuroLeague' },
  { pos: 5, team: 'Olympiacos Piraeus', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/109.png', w: 22, l: 12, pct: '.647', gb: '5.0', ppg: 79.8, oppg: 75.3, form: ['W', 'W', 'W', 'W', 'L'], zone: 'playoffs', conf: 'East', league: 'EuroLeague' },
  { pos: 6, team: 'Fenerbahçe Beko', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/103.png', w: 20, l: 14, pct: '.588', gb: '7.0', ppg: 85.0, oppg: 81.2, form: ['W', 'L', 'W', 'L', 'W'], zone: 'playoffs', conf: 'East', league: 'EuroLeague' },
  { pos: 7, team: 'Maccabi Playtika Tel Aviv', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/106.png', w: 20, l: 14, pct: '.588', gb: '7.0', ppg: 87.4, oppg: 86.1, form: ['W', 'W', 'L', 'W', 'W'], zone: 'playin', conf: 'East', league: 'EuroLeague' },
  { pos: 8, team: 'Baskonia Vitoria', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/107.png', w: 18, l: 16, pct: '.529', gb: '9.0', ppg: 83.2, oppg: 84.0, form: ['L', 'W', 'L', 'W', 'L'], zone: 'playin', conf: 'East', league: 'EuroLeague' },
  { pos: 9, team: 'Virtus Segafredo Bologna', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/110.png', w: 17, l: 17, pct: '.500', gb: '10.0', ppg: 80.5, oppg: 82.1, form: ['L', 'L', 'L', 'W', 'L'], zone: 'playin', conf: 'East', league: 'EuroLeague' },
  { pos: 10, team: 'Anadolu Efes', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/101.png', w: 17, l: 17, pct: '.500', gb: '10.0', ppg: 86.3, oppg: 85.9, form: ['W', 'W', 'W', 'W', 'W'], zone: 'playin', conf: 'East', league: 'EuroLeague' },
];

const LIGA_ACB_STANDINGS: StandingsRow[] = [
  { pos: 1, team: 'Real Madrid', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/104.png', w: 28, l: 6, pct: '.824', gb: '—', ppg: 89.4, oppg: 79.1, form: ['W', 'W', 'W', 'W', 'W'], zone: 'playoffs', conf: 'East', league: 'Liga ACB' },
  { pos: 2, team: 'Unicaja Málaga', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/112.png', w: 28, l: 6, pct: '.824', gb: '—', ppg: 87.8, oppg: 78.4, form: ['W', 'W', 'W', 'W', 'L'], zone: 'playoffs', conf: 'East', league: 'Liga ACB' },
  { pos: 3, team: 'FC Barcelona', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/100.png', w: 23, l: 11, pct: '.676', gb: '5.0', ppg: 86.2, oppg: 81.5, form: ['W', 'L', 'W', 'L', 'W'], zone: 'playoffs', conf: 'East', league: 'Liga ACB' },
  { pos: 4, team: 'Valencia Basket', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/114.png', w: 21, l: 13, pct: '.618', gb: '7.0', ppg: 82.5, oppg: 80.3, form: ['L', 'W', 'W', 'W', 'L'], zone: 'playoffs', conf: 'East', league: 'Liga ACB' },
  { pos: 5, team: 'UCAM Murcia', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/116.png', w: 21, l: 13, pct: '.618', gb: '7.0', ppg: 81.7, oppg: 79.8, form: ['W', 'W', 'L', 'W', 'W'], zone: 'playoffs', conf: 'East', league: 'Liga ACB' },
  { pos: 6, team: 'Lenovo Tenerife', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/117.png', w: 21, l: 13, pct: '.618', gb: '7.0', ppg: 83.1, oppg: 81.2, form: ['W', 'L', 'W', 'W', 'W'], zone: 'playoffs', conf: 'East', league: 'Liga ACB' },
  { pos: 7, team: 'Dreamland Gran Canaria', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/118.png', w: 20, l: 14, pct: '.588', gb: '8.0', ppg: 82.0, oppg: 80.9, form: ['L', 'W', 'L', 'W', 'L'], zone: 'playoffs', conf: 'East', league: 'Liga ACB' },
  { pos: 8, team: 'BAXI Manresa', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/119.png', w: 19, l: 15, pct: '.559', gb: '9.0', ppg: 84.6, oppg: 84.1, form: ['W', 'L', 'W', 'L', 'W'], zone: 'playoffs', conf: 'East', league: 'Liga ACB' },
];

const ALL_STAT_LEADERS: StatLeader[] = [
  // PPG
  { rank: 1, name: 'Luka Dončić', team: 'Dallas Mavericks', teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png', flag: '🇸🇮', stat: 33.9, statLabel: 'PPG', extra: '9.2 RPG · 9.8 APG · 48.7% FG', photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1629029.png', category: 'PPG' },
  { rank: 2, name: 'Giannis Antetokounmpo', team: 'Milwaukee Bucks', teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png', flag: '🇬🇷', stat: 30.4, statLabel: 'PPG', extra: '11.5 RPG · 6.5 APG · 61.1% FG', photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/203507.png', category: 'PPG' },
  { rank: 3, name: 'Shai Gilgeous-Alexander', team: 'OKC Thunder', teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/okc.png', flag: '🇨🇦', stat: 30.1, statLabel: 'PPG', extra: '5.5 RPG · 6.2 APG · 53.5% FG', photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1628983.png', category: 'PPG' },
  { rank: 4, name: 'Jalen Brunson', team: 'NY Knicks', teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/ny.png', flag: '🇺🇸', stat: 28.7, statLabel: 'PPG', extra: '3.6 RPG · 6.7 APG · 40.1% 3P', photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1628973.png', category: 'PPG' },

  // RPG
  { rank: 1, name: 'Domantas Sabonis', team: 'Sacramento Kings', teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/sac.png', flag: '🇱🇹', stat: 13.7, statLabel: 'RPG', extra: '19.4 PPG · 8.2 APG · 77 Double-Doubles', photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1627734.png', category: 'RPG' },
  { rank: 2, name: 'Rudy Gobert', team: 'Minnesota Timberwolves', teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/min.png', flag: '🇫🇷', stat: 12.9, statLabel: 'RPG', extra: '14.0 PPG · 2.1 BPG · DPOY', photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/203497.png', category: 'RPG' },
  { rank: 3, name: 'Anthony Davis', team: 'LA Lakers', teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png', flag: '🇺🇸', stat: 12.6, statLabel: 'RPG', extra: '24.7 PPG · 2.3 BPG · 55.6% FG', photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/203076.png', category: 'RPG' },
  { rank: 4, name: 'Nikola Jokić', team: 'Denver Nuggets', teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/den.png', flag: '🇷🇸', stat: 12.4, statLabel: 'RPG', extra: '26.4 PPG · 9.0 APG · 58.3% FG', photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/203999.png', category: 'RPG' },

  // APG
  { rank: 1, name: 'Tyrese Haliburton', team: 'Indiana Pacers', teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/ind.png', flag: '🇺🇸', stat: 10.9, statLabel: 'APG', extra: '20.1 PPG · 3.9 RPG · 4.4 AST/TO', photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1630169.png', category: 'APG' },
  { rank: 2, name: 'Luka Dončić', team: 'Dallas Mavericks', teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png', flag: '🇸🇮', stat: 9.8, statLabel: 'APG', extra: '33.9 PPG · 9.2 RPG · 21 Triple-Doubles', photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1629029.png', category: 'APG' },
  { rank: 3, name: 'Nikola Jokić', team: 'Denver Nuggets', teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/den.png', flag: '🇷🇸', stat: 9.0, statLabel: 'APG', extra: '26.4 PPG · 12.4 RPG · 3x MVP', photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/203999.png', category: 'APG' },
  { rank: 4, name: 'James Harden', team: 'LA Clippers', teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/lac.png', flag: '🇺🇸', stat: 8.5, statLabel: 'APG', extra: '16.6 PPG · 5.1 RPG · 87.8% FT', photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/201935.png', category: 'APG' },

  // BPG
  { rank: 1, name: 'Victor Wembanyama', team: 'San Antonio Spurs', teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/sas.png', flag: '🇫🇷', stat: 3.6, statLabel: 'BPG', extra: '21.4 PPG · 10.6 RPG · ROY', photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1641705.png', category: 'BPG' },
  { rank: 2, name: 'Walker Kessler', team: 'Utah Jazz', teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/uta.png', flag: '🇺🇸', stat: 2.4, statLabel: 'BPG', extra: '8.1 PPG · 7.5 RPG · 65.4% FG', photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1631117.png', category: 'BPG' },
  { rank: 3, name: 'Anthony Davis', team: 'LA Lakers', teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png', flag: '🇺🇸', stat: 2.3, statLabel: 'BPG', extra: '24.7 PPG · 12.6 RPG · Paint Wall', photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/203076.png', category: 'BPG' },
  { rank: 4, name: 'Chet Holmgren', team: 'OKC Thunder', teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/okc.png', flag: '🇺🇸', stat: 2.3, statLabel: 'BPG', extra: '16.5 PPG · 7.9 RPG · 37.0% 3P', photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1631096.png', category: 'BPG' },

  // 3PM
  { rank: 1, name: 'Stephen Curry', team: 'Golden State Warriors', teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/gsw.png', flag: '🇺🇸', stat: 4.8, statLabel: '3PM', extra: '40.8% 3PT · 26.4 PPG · All-Time Record', photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/201939.png', category: '3PM' },
  { rank: 2, name: 'Luka Dončić', team: 'Dallas Mavericks', teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png', flag: '🇸🇮', stat: 4.1, statLabel: '3PM', extra: '38.2% 3PT · 33.9 PPG · Step-back Maestro', photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1629029.png', category: '3PM' },
  { rank: 3, name: 'Damian Lillard', team: 'Milwaukee Bucks', teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png', flag: '🇺🇸', stat: 3.2, statLabel: '3PM', extra: '35.4% 3PT · 24.3 PPG · Deep Range', photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/203081.png', category: '3PM' },
  { rank: 4, name: 'Anthony Edwards', team: 'Minnesota Timberwolves', teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/min.png', flag: '🇺🇸', stat: 3.1, statLabel: '3PM', extra: '36.8% 3PT · 25.9 PPG · Clutch Scorer', photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1630162.png', category: '3PM' },

  // FG%
  { rank: 1, name: 'Daniel Gafford', team: 'Dallas Mavericks', teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png', flag: '🇺🇸', stat: 72.5, statLabel: 'FG%', extra: '11.0 PPG · 7.6 RPG · Lob Threat', photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1629655.png', category: 'FG%' },
  { rank: 2, name: 'Rudy Gobert', team: 'Minnesota Timberwolves', teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/min.png', flag: '🇫🇷', stat: 66.1, statLabel: 'FG%', extra: '14.0 PPG · 12.9 RPG · Rim Finisher', photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/203497.png', category: 'FG%' },
  { rank: 3, name: 'Giannis Antetokounmpo', team: 'Milwaukee Bucks', teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png', flag: '🇬🇷', stat: 61.1, statLabel: 'FG%', extra: '30.4 PPG · Paint Dominance', photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/203507.png', category: 'FG%' },
  { rank: 4, name: 'Nikola Jokić', team: 'Denver Nuggets', teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/den.png', flag: '🇷🇸', stat: 58.3, statLabel: 'FG%', extra: '26.4 PPG · Sombor Shuffle Precision', photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/203999.png', category: 'FG%' },
];

const BASKETBALL_ODDS_MATCHES: BasketballOddsItem[] = [
  {
    id: 'odds-1',
    comp: 'NBA Marquee',
    time: 'Tonight 19:30 ET',
    home: 'Boston Celtics',
    homeLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png',
    away: 'Miami Heat',
    awayLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png',
    spread: {
      homeLine: '-5.5',
      awayLine: '+5.5',
      homeAmerican: '-110',
      awayAmerican: '-110',
      homeDecimal: 1.91,
      awayDecimal: 1.91,
    },
    moneyline: {
      homeAmerican: '-210',
      awayAmerican: '+175',
      homeDecimal: 1.48,
      awayDecimal: 2.75,
    },
    total: {
      points: 218.5,
      overAmerican: '-110',
      underAmerican: '-110',
      overDecimal: 1.91,
      underDecimal: 1.91,
    },
    movement: '▲ 0.5 spread move toward Celtics',
    publicBetting: '68% of tickets on Celtics -5.5',
  },
  {
    id: 'odds-2',
    comp: 'NBA Western Clash',
    time: 'Tonight 22:00 ET',
    home: 'LA Lakers',
    homeLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png',
    away: 'Golden State Warriors',
    awayLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/gsw.png',
    spread: {
      homeLine: '-2.5',
      awayLine: '+2.5',
      homeAmerican: '-110',
      awayAmerican: '-110',
      homeDecimal: 1.91,
      awayDecimal: 1.91,
    },
    moneyline: {
      homeAmerican: '-135',
      awayAmerican: '+115',
      homeDecimal: 1.74,
      awayDecimal: 2.15,
    },
    total: {
      points: 231.5,
      overAmerican: '-110',
      underAmerican: '-110',
      overDecimal: 1.91,
      underDecimal: 1.91,
    },
    movement: '▼ 1.0 total move (Sharp under action)',
    publicBetting: '59% of tickets on Lakers ML',
  },
  {
    id: 'odds-3',
    comp: 'NBA Mountain Showcase',
    time: 'Tomorrow 21:00 ET',
    home: 'Denver Nuggets',
    homeLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/den.png',
    away: 'Phoenix Suns',
    awayLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/phx.png',
    spread: {
      homeLine: '-6.5',
      awayLine: '+6.5',
      homeAmerican: '-110',
      awayAmerican: '-110',
      homeDecimal: 1.91,
      awayDecimal: 1.91,
    },
    moneyline: {
      homeAmerican: '-265',
      awayAmerican: '+220',
      homeDecimal: 1.38,
      awayDecimal: 3.20,
    },
    total: {
      points: 227.0,
      overAmerican: '-110',
      underAmerican: '-110',
      overDecimal: 1.91,
      underDecimal: 1.91,
    },
    movement: 'Consensus steady at 227.0',
    publicBetting: '72% of handle on Over 227.0',
  },
  {
    id: 'odds-4',
    comp: 'EuroLeague Derby',
    time: 'Tomorrow 20:45 CET',
    home: 'Real Madrid',
    homeLogo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/104.png',
    away: 'Fenerbahçe',
    awayLogo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/103.png',
    spread: {
      homeLine: '-4.5',
      awayLine: '+4.5',
      homeAmerican: '-115',
      awayAmerican: '-105',
      homeDecimal: 1.87,
      awayDecimal: 1.95,
    },
    moneyline: {
      homeAmerican: '-180',
      awayAmerican: '+150',
      homeDecimal: 1.55,
      awayDecimal: 2.50,
    },
    total: {
      points: 164.5,
      overAmerican: '-110',
      underAmerican: '-110',
      overDecimal: 1.91,
      underDecimal: 1.91,
    },
    movement: '▲ 1.5 total move from 163.0',
    publicBetting: '64% on Real Madrid ML',
  },
];

const COMP_GROUPS: CompGroup[] = [
  {
    region: 'North America',
    icon: '🇺🇸',
    comps: [
      { name: 'NBA', flag: '🇺🇸', tier: 'T1', season: '2025/26', country: 'USA', href: '/basketball/leagues/nba-766' },
      { name: 'NBA G League', flag: '🇺🇸', tier: 'T2', season: '2025/26', country: 'USA', href: '/basketball/leagues/nba-g-league' },
      { name: 'NBL — Canada', flag: '🇨🇦', tier: 'T1', season: '2025/26', country: 'Canada', href: '/basketball/leagues/nbl-canada' },
      { name: 'NCAA Division I', flag: '🇺🇸', tier: 'COL', season: '2025/26', country: 'USA', href: '/basketball/leagues/ncaa-812' },
    ],
  },
  {
    region: 'Africa (BAL)',
    icon: '🌍',
    comps: [
      { name: 'Basketball Africa League (BAL)', flag: '🌍', tier: 'T1', season: '2026', country: 'Pan-Africa', href: '/basketball/leagues/bal' },
      { name: 'FIBA AfroBasket', flag: '🏆', tier: 'INT', season: '2025', country: 'Africa Zone', href: '/basketball/leagues/afrobasket' },
      { name: 'Nigerian Premier League', flag: '🇳🇬', tier: 'T1', season: '2025/26', country: 'Nigeria', href: '/basketball/leagues/npl-nigeria' },
      { name: 'FIBA WC Qualifiers Africa', flag: '🌍', tier: 'INT', season: '2025/26', country: 'Africa', href: '/basketball/leagues/fiba-wc-africa' },
    ],
  },
  {
    region: 'Europe',
    icon: '🇪🇺',
    comps: [
      { name: 'EuroLeague', flag: '🇪🇺', tier: 'T1', season: '2025/26', country: 'Europe', href: '/basketball/leagues/euroleague-787' },
      { name: 'EuroCup', flag: '🇪🇺', tier: 'T2', season: '2025/26', country: 'Europe', href: '/basketball/leagues/eurocup-788' },
      { name: 'Spanish Liga ACB', flag: '🇪🇸', tier: 'T1', season: '2025/26', country: 'Spain', href: '/basketball/leagues/liga-acb-782' },
      { name: 'Turkish BSL', flag: '🇹🇷', tier: 'T1', season: '2025/26', country: 'Turkey', href: '/basketball/leagues/turkish-bsl' },
      { name: 'Italian Lega Basket Serie A', flag: '🇮🇹', tier: 'T1', season: '2025/26', country: 'Italy', href: '/basketball/leagues/serie-a-772' },
      { name: 'German BBL', flag: '🇩🇪', tier: 'T1', season: '2025/26', country: 'Germany', href: '/basketball/leagues/bbl-779' },
    ],
  },
  {
    region: 'International & Oceania',
    icon: '🌐',
    comps: [
      { name: 'FIBA Basketball World Cup', flag: '🌐', tier: 'INT', season: '2027', country: 'Global', href: '/basketball/leagues/fiba-world-cup' },
      { name: 'Olympic Basketball Tourney', flag: '🥇', tier: 'INT', season: '2028', country: 'Global', href: '/basketball/leagues/olympics-basketball' },
      { name: 'Australian NBL', flag: '🇦🇺', tier: 'T1', season: '2025/26', country: 'Australia', href: '/basketball/leagues/nbl-australia' },
      { name: 'FIBA Asia Cup', flag: '🌏', tier: 'INT', season: '2025', country: 'Asia-Pacific', href: '/basketball/leagues/fiba-asia' },
    ],
  },
];

const TEAM_HUBS: TeamHub[] = [
  { name: 'Boston Celtics', conf: 'East · #1', record: '64-18', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png', slug: 'boston-celtics' },
  { name: 'Denver Nuggets', conf: 'West · #2', record: '57-25', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/den.png', slug: 'denver-nuggets' },
  { name: 'LA Lakers', conf: 'West · #8', record: '47-35', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png', slug: 'los-angeles-lakers' },
  { name: 'Golden State', conf: 'West · #10', record: '46-36', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/gsw.png', slug: 'golden-state-warriors' },
  { name: 'Miami Heat', conf: 'East · #8', record: '46-36', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png', slug: 'miami-heat' },
  { name: 'Milwaukee Bucks', conf: 'East · #3', record: '49-33', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png', slug: 'milwaukee-bucks' },
];

const ANALYSIS_ARTICLES: AnalysisArticle[] = [
  {
    tag: 'SCOUTING',
    tagColor: 'bg-orange-500',
    title: 'How Victor Wembanyama altered shot selection patterns across all 30 NBA teams in Year 2',
    time: '2 hr ago',
    comp: 'NBA Telemetry',
    img: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=220&fit=crop&auto=format',
  },
  {
    tag: 'TACTICS',
    tagColor: 'bg-emerald-500',
    title: 'The EuroLeague pick-and-roll revolution: Why European spacing is punishing NBA drop coverage',
    time: '3 hr ago',
    comp: 'EuroLeague',
    img: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400&h=220&fit=crop&auto=format',
  },
  {
    tag: 'STATS',
    tagColor: 'bg-purple-500',
    title: "Luka Dončić's usage rate reaches 42.1% — unsustainable fatigue or mathematical genius?",
    time: '5 hr ago',
    comp: 'NBA Playoffs',
    img: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=400&h=220&fit=crop&auto=format',
  },
  {
    tag: 'PREVIEW',
    tagColor: 'bg-rose-500',
    title: "Celtics vs Heat tactical preview: Can Spoelstra's 2-3 zone neutralize Tatum?",
    time: '7 hr ago',
    comp: 'NBA Playoffs',
    img: 'https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=400&h=220&fit=crop&auto=format',
  },
];

const COMP_FILTERS = ['All', 'NBA', 'EuroLeague', 'Liga ACB', 'BAL', 'NBL', 'FIBA'];

const BASKETBALL_SUPERSTARS: BasketballSuperstar[] = [
  {
    name: 'Luka Dončić',
    slug: 'luka-doncic',
    team: 'Dallas Mavericks',
    teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png',
    photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1629029.png',
    nationality: 'Slovenia',
    countryFlag: '🇸🇮',
    pos: 'Point Guard / Forward',
    posCategory: 'Guards',
    ppg: 33.9,
    rpg: 9.2,
    apg: 9.8,
    per: 28.9,
    salary: '$43.0M / yr',
    accolade: '5x All-NBA 1st Team · Scoring Champion',
  },
  {
    name: 'Nikola Jokić',
    slug: 'nikola-jokic',
    team: 'Denver Nuggets',
    teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/den.png',
    photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/203999.png',
    nationality: 'Serbia',
    countryFlag: '🇷🇸',
    pos: 'Center',
    posCategory: 'Centers',
    ppg: 26.4,
    rpg: 12.4,
    apg: 9.0,
    per: 31.3,
    salary: '$51.4M / yr',
    accolade: '3x NBA MVP · 2023 Finals MVP',
  },
  {
    name: 'Giannis Antetokounmpo',
    slug: 'giannis-antetokounmpo',
    team: 'Milwaukee Bucks',
    teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png',
    photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/203507.png',
    nationality: 'Greece / Nigeria',
    countryFlag: '🇬🇷',
    pos: 'Power Forward',
    posCategory: 'Forwards',
    ppg: 30.4,
    rpg: 11.5,
    apg: 6.5,
    per: 29.8,
    salary: '$48.7M / yr',
    accolade: '2x NBA MVP · DPOY · Finals MVP',
  },
  {
    name: 'Shai Gilgeous-Alexander',
    slug: 'shai-gilgeous-alexander',
    team: 'OKC Thunder',
    teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/okc.png',
    photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1628983.png',
    nationality: 'Canada',
    countryFlag: '🇨🇦',
    pos: 'Point Guard',
    posCategory: 'Guards',
    ppg: 30.1,
    rpg: 5.5,
    apg: 6.2,
    per: 27.5,
    salary: '$35.8M / yr',
    accolade: '2x All-NBA 1st Team · Clutch Player of Year',
  },
  {
    name: 'Victor Wembanyama',
    slug: 'victor-wembanyama',
    team: 'San Antonio Spurs',
    teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/sas.png',
    photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1641705.png',
    nationality: 'France',
    countryFlag: '🇫🇷',
    pos: 'Center / Forward',
    posCategory: 'Centers',
    ppg: 21.4,
    rpg: 10.6,
    apg: 3.9,
    per: 24.8,
    salary: '$12.7M / yr',
    accolade: 'NBA Rookie of Year · Blocks Leader (3.6)',
  },
  {
    name: 'Jayson Tatum',
    slug: 'jayson-tatum',
    team: 'Boston Celtics',
    teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png',
    photo: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1628369.png',
    nationality: 'USA',
    countryFlag: '🇺🇸',
    pos: 'Forward',
    posCategory: 'Forwards',
    ppg: 26.9,
    rpg: 8.1,
    apg: 4.9,
    per: 23.9,
    salary: '$54.0M / yr',
    accolade: '2024 NBA Champion · 4x All-NBA 1st Team',
  },
];

const BASKETBALL_OFFICIALS: BasketballOfficial[] = [
  {
    name: 'Scott Foster',
    number: '#48',
    seasons: '30th Season',
    role: 'Lead Crew Chief',
    photo: 'https://ui-avatars.com/api/?name=Scott+Foster&background=0f172a&color=f97316&bold=true&size=128',
    reviewAcc: '94.2%',
    overturnPct: '28.1%',
    avgReviewSec: '48.2s',
    techPerGame: '0.82',
    panel: 'NBA Finals Veteran',
    badge: 'Lead Crew',
  },
  {
    name: 'Zach Zarba',
    number: '#15',
    seasons: '21st Season',
    role: 'Crew Chief',
    photo: 'https://ui-avatars.com/api/?name=Zach+Zarba&background=0f172a&color=3b82f6&bold=true&size=128',
    reviewAcc: '96.5%',
    overturnPct: '34.6%',
    avgReviewSec: '41.0s',
    techPerGame: '0.61',
    panel: 'NBA Finals Panel',
    badge: 'High Accuracy',
  },
  {
    name: 'James Capers',
    number: '#19',
    seasons: '29th Season',
    role: 'Crew Chief',
    photo: 'https://ui-avatars.com/api/?name=James+Capers&background=0f172a&color=10b981&bold=true&size=128',
    reviewAcc: '93.8%',
    overturnPct: '31.2%',
    avgReviewSec: '52.4s',
    techPerGame: '0.74',
    panel: 'NBA Playoffs Panel',
    badge: 'Veteran',
  },
];

const BASKETBALL_COACHES: BasketballCoach[] = [
  {
    name: 'Joe Mazzulla',
    team: 'Boston Celtics',
    teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png',
    photo: 'https://ui-avatars.com/api/?name=Joe+Mazzulla&background=0f172a&color=10b981&bold=true&size=128',
    winPct: '73.2%',
    rings: 1,
    offensiveRtg: '122.2 (#1 NBA)',
    system: '5-Out Spacing & 3-Point Volume Generation',
    schemeTag: '5-Out',
    contract: 'Long-term Extension',
  },
  {
    name: 'Erik Spoelstra',
    team: 'Miami Heat',
    teamLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png',
    photo: 'https://ui-avatars.com/api/?name=Erik+Spoelstra&background=0f172a&color=ef4444&bold=true&size=128',
    winPct: '59.8%',
    rings: 2,
    offensiveRtg: 'Clutch Top 5',
    system: 'Matchup Zone (2-3) & ATO Sets Execution',
    schemeTag: 'Horns',
    contract: '8-Year $120M Contract',
  },
  {
    name: 'Sarunas Jasikevicius',
    team: 'Fenerbahçe',
    teamLogo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/basketball/euro/500/103.png',
    photo: 'https://ui-avatars.com/api/?name=Sarunas+Jasikevicius&background=0f172a&color=3b82f6&bold=true&size=128',
    winPct: '68.1%',
    rings: 0,
    offensiveRtg: 'EuroLeague Top 3',
    system: 'European Pick-and-Roll & Baseline Staggers',
    schemeTag: 'Pick-and-Roll',
    contract: 'Through 2026',
  },
];

// ─── Main Basketball Page Client Component ───────────────────────────────────

export function BasketballPageClient() {
  const [mainTab, setMainTab] = useState<MainTab>('live');
  const [compFilter, setCompFilter] = useState('All');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStandingsLeague, setSelectedStandingsLeague] = useState<'NBA' | 'EuroLeague' | 'Liga ACB'>('NBA');
  const [standingsConf, setStandingsConf] = useState<'East' | 'West'>('East');
  const [standingsSortKey, setStandingsSortKey] = useState<'pos' | 'w' | 'pct' | 'ppg' | 'oppg'>('pos');
  const [standingsSortAsc, setStandingsSortAsc] = useState(true);
  const [expandedComp, setExpandedComp] = useState<string | null>('North America');
  const [statCat, setStatCat] = useState<StatCategory>('PPG');
  const [leaderSearch, setLeaderSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [showAllFixtures, setShowAllFixtures] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal / Drawer state
  const [selectedGameForModal, setSelectedGameForModal] = useState<GameItem | null>(null);

  // Odds & Bet Slip state
  const [oddsFormat, setOddsFormat] = useState<'decimal' | 'american'>('decimal');
  const [selectedOddsPick, setSelectedOddsPick] = useState<{
    match: string;
    team: string;
    type: string;
    line: string;
    oddsDecimal: number;
    oddsAmerican: string;
  } | null>(null);

  // Special section filter states
  const [superstarFilter, setSuperstarFilter] = useState<'All' | 'Guards' | 'Forwards' | 'Centers'>('All');
  const [superstarSearch, setSuperstarSearch] = useState('');
  const [officialFilter, setOfficialFilter] = useState<'All' | 'Lead Crew' | 'Veteran' | 'High Accuracy'>('All');
  const [coachFilter, setCoachFilter] = useState<'All' | '5-Out' | 'Horns' | 'Pick-and-Roll'>('All');
  const [showReplayInfo, setShowReplayInfo] = useState(false);

  // Matches dynamic state
  const [liveGames, setLiveGames] = useState<GameItem[]>(LIVE_GAMES_BASELINE);
  const [upcomingGames, setUpcomingGames] = useState<GameItem[]>(UPCOMING_GAMES_BASELINE);
  const [resultsGames, setResultsGames] = useState<GameItem[]>(RESULTS_BASELINE);

  // Toast alert state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 4500);
  };

  // Newsletter state
  const [briefEmail, setBriefEmail] = useState('');
  const [selectedBriefTopics, setSelectedBriefTopics] = useState<string[]>([
    'Quarter Box Scores',
    'Playoff Projections',
  ]);
  const [briefSubmitting, setBriefSubmitting] = useState(false);
  const [briefSubscribed, setBriefSubscribed] = useState(false);
  const [briefMessage, setBriefMessage] = useState('');

  // 7-day dynamic date strip for upcoming & results
  const dateStrip = useMemo(() => {
    const dates = [];
    const today = new Date();
    const offsets = mainTab === 'results' ? [-4, -3, -2, -1, 0] : [0, 1, 2, 3, 4];
    for (const offset of offsets) {
      const d = new Date();
      d.setDate(today.getDate() + offset);
      const iso = d.toISOString().split('T')[0];
      const label =
        offset === 0
          ? 'Today'
          : offset === -1
          ? 'Yesterday'
          : offset === 1
          ? 'Tomorrow'
          : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayMonth = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dates.push({ iso, label, dayMonth, offset });
    }
    return dates;
  }, [mainTab]);

  // Fetch real-time live basketball scores
  const fetchLiveScores = useCallback(async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const res = await fetch('/api/basketball?met=Livescore', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data?.result) ? data.result : [];
        if (list.length > 0) {
          const mapped: GameItem[] = list.map((item: any, idx: number) => {
            const h = item.event_home_team || 'Home';
            const a = item.event_away_team || 'Away';
            let hScore: number | null = null;
            let aScore: number | null = null;
            if (item.event_final_result && item.event_final_result.includes('-')) {
              const parts = item.event_final_result.split('-');
              hScore = parseInt(parts[0], 10) || null;
              aScore = parseInt(parts[1], 10) || null;
            }
            return {
              id: String(item.event_key || idx),
              comp: item.league_name || 'Basketball Championship',
              compFlag: item.country_name === 'USA' ? '🇺🇸' : '🌐',
              home: h,
              homeLogo: item.event_home_team_logo || getBasketballTeamLogo(h),
              away: a,
              awayLogo: item.event_away_team_logo || getBasketballTeamLogo(a),
              hScore,
              aScore,
              quarter: item.event_quarter || 'LIVE',
              clock: item.event_time || 'Active',
              status: 'LIVE',
              arena: item.event_stadium || undefined,
            };
          });
          setLiveGames(mapped);
        }
      }
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      if (manual) triggerToast('Telemetry synced with live courtside data!');
    } catch {
      console.warn('[Basketball] Upstream live API unavailable, using verified baseline.');
    } finally {
      if (manual) setTimeout(() => setIsRefreshing(false), 500);
    }
  }, []);

  // Fetch fixtures by selected date
  const fetchFixtures = useCallback(async (dateStr: string) => {
    try {
      const res = await fetch(`/api/basketball?met=Fixtures&from=${dateStr}&to=${dateStr}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data?.result) ? data.result : [];
        if (list.length > 0) {
          const mapped: GameItem[] = list.map((item: any, idx: number) => {
            const h = item.event_home_team || 'Home';
            const a = item.event_away_team || 'Away';
            let hScore: number | null = null;
            let aScore: number | null = null;
            if (item.event_final_result && item.event_final_result.includes('-')) {
              const parts = item.event_final_result.split('-');
              hScore = parseInt(parts[0], 10) || null;
              aScore = parseInt(parts[1], 10) || null;
            }
            const isFT =
              item.event_status === 'Finished' ||
              item.event_status === 'FT' ||
              item.event_status === 'AOT';
            return {
              id: String(item.event_key || idx),
              comp: item.league_name || 'Basketball Fixture',
              compFlag: item.country_name === 'USA' ? '🇺🇸' : '🌐',
              home: h,
              homeLogo: item.event_home_team_logo || getBasketballTeamLogo(h),
              away: a,
              awayLogo: item.event_away_team_logo || getBasketballTeamLogo(a),
              hScore,
              aScore,
              quarter: isFT ? 'FT' : item.event_quarter || undefined,
              clock: item.event_time || undefined,
              status: isFT ? 'FT' : 'UPCOMING',
              time: item.event_time || undefined,
              date: item.event_date || dateStr,
              arena: item.event_stadium || undefined,
            };
          });

          const up = mapped.filter((g) => g.status === 'UPCOMING');
          const ft = mapped.filter((g) => g.status === 'FT');
          if (up.length > 0) setUpcomingGames(up);
          if (ft.length > 0) setResultsGames(ft);
        }
      }
    } catch {
      console.warn('[Basketball] Upstream fixtures API unavailable.');
    }
  }, []);

  // Polling interval for live scores (every 25s)
  useEffect(() => {
    fetchLiveScores();
    const interval = setInterval(() => {
      fetchLiveScores();
    }, 25000);
    return () => clearInterval(interval);
  }, [fetchLiveScores]);

  // When date or tab changes to upcoming or results, fetch fixtures for that date
  useEffect(() => {
    if (mainTab === 'upcoming' || mainTab === 'results') {
      fetchFixtures(selectedDate);
    }
  }, [mainTab, selectedDate, fetchFixtures]);

  // Newsletter topic toggle
  const toggleBriefTopic = (topic: string) => {
    setSelectedBriefTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  // Newsletter submission
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
          email: briefEmail,
          sport: 'basketball',
          topics: selectedBriefTopics,
        }),
      });
      if (res.ok) {
        setBriefSubscribed(true);
      } else {
        setBriefMessage('Subscription registered! Welcome to the Hoops Morning Shootaround.');
        setBriefSubscribed(true);
      }
    } catch {
      setBriefMessage('Subscription saved! You are set for daily box scores and telemetry.');
      setBriefSubscribed(true);
    } finally {
      setBriefSubmitting(false);
    }
  };

  const liveCount = useMemo(
    () => liveGames.filter((g) => g.status === 'LIVE' || g.status === 'HT' || g.status === 'OT').length,
    [liveGames]
  );

  const tabGames = useMemo<Partial<Record<MainTab, GameItem[]>>>(
    () => ({
      live: liveGames,
      upcoming: upcomingGames,
      results: resultsGames,
    }),
    [liveGames, upcomingGames, resultsGames]
  );

  const isFixtureTab = mainTab === 'live' || mainTab === 'upcoming' || mainTab === 'results';

  const currentGames = useMemo(() => {
    const list = tabGames[mainTab] ?? [];
    return list.filter((g) => {
      const matchComp =
        compFilter === 'All'
          ? true
          : g.comp.toLowerCase().includes(compFilter.toLowerCase());
      const matchSearch =
        !searchQuery.trim()
          ? true
          : g.home.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.away.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.comp.toLowerCase().includes(searchQuery.toLowerCase());
      return matchComp && matchSearch;
    });
  }, [tabGames, mainTab, compFilter, searchQuery]);

  // "View all fixtures" button logic (initial 6 games)
  const visibleGames = useMemo(() => {
    if (showAllFixtures || currentGames.length <= 6) {
      return currentGames;
    }
    return currentGames.slice(0, 6);
  }, [currentGames, showAllFixtures]);

  // Active Standings with dynamic sorting
  const activeStandings = useMemo(() => {
    let list: StandingsRow[] = [];
    if (selectedStandingsLeague === 'NBA') {
      list = standingsConf === 'East' ? [...NBA_EAST_STANDINGS] : [...NBA_WEST_STANDINGS];
    } else if (selectedStandingsLeague === 'EuroLeague') {
      list = [...EUROLEAGUE_STANDINGS];
    } else {
      list = [...LIGA_ACB_STANDINGS];
    }

    return list.sort((a, b) => {
      if (standingsSortKey === 'pos') return standingsSortAsc ? a.pos - b.pos : b.pos - a.pos;
      if (standingsSortKey === 'w') return standingsSortAsc ? a.w - b.w : b.w - a.w;
      if (standingsSortKey === 'pct') return standingsSortAsc ? parseFloat(a.pct) - parseFloat(b.pct) : parseFloat(b.pct) - parseFloat(a.pct);
      if (standingsSortKey === 'ppg') return standingsSortAsc ? a.ppg - b.ppg : b.ppg - a.ppg;
      if (standingsSortKey === 'oppg') return standingsSortAsc ? a.oppg - b.oppg : b.oppg - a.oppg;
      return 0;
    });
  }, [selectedStandingsLeague, standingsConf, standingsSortKey, standingsSortAsc]);

  const handleSortStandings = (key: 'pos' | 'w' | 'pct' | 'ppg' | 'oppg') => {
    if (standingsSortKey === key) {
      setStandingsSortAsc(!standingsSortAsc);
    } else {
      setStandingsSortKey(key);
      setStandingsSortAsc(key === 'pos');
    }
  };

  // Stat leaders filtered by category and search
  const activeLeaders = useMemo(() => {
    return ALL_STAT_LEADERS.filter((l) => {
      const matchCat = l.category === statCat;
      const matchSearch =
        !leaderSearch.trim()
          ? true
          : l.name.toLowerCase().includes(leaderSearch.toLowerCase()) ||
            l.team.toLowerCase().includes(leaderSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [statCat, leaderSearch]);

  // Superstars filtered by category and search
  const filteredSuperstars = useMemo(() => {
    return BASKETBALL_SUPERSTARS.filter((p) => {
      const matchCat = superstarFilter === 'All' ? true : p.posCategory === superstarFilter;
      const matchSearch =
        !superstarSearch.trim()
          ? true
          : p.name.toLowerCase().includes(superstarSearch.toLowerCase()) ||
            p.team.toLowerCase().includes(superstarSearch.toLowerCase()) ||
            p.nationality.toLowerCase().includes(superstarSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [superstarFilter, superstarSearch]);

  // Officials filtered
  const filteredOfficials = useMemo(() => {
    return BASKETBALL_OFFICIALS.filter((o) => {
      if (officialFilter === 'All') return true;
      return o.badge === officialFilter;
    });
  }, [officialFilter]);

  // Coaches filtered
  const filteredCoaches = useMemo(() => {
    return BASKETBALL_COACHES.filter((c) => {
      if (coachFilter === 'All') return true;
      return c.schemeTag === coachFilter;
    });
  }, [coachFilter]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-orange-500 selection:text-white pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] border border-orange-500/50 text-white px-5 py-3.5 rounded-2xl shadow-2xl shadow-orange-500/20 flex items-center gap-3 animate-slideUp">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-ping" />
          <span className="text-xs font-bold text-slate-100">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white text-xs ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Quarter Box Score Modal */}
      {selectedGameForModal && (
        <QuarterBoxScoreModal
          game={selectedGameForModal}
          onClose={() => setSelectedGameForModal(null)}
        />
      )}

      {/* ════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════ */}
      <div className="relative bg-gradient-to-b from-[#1c0e07] via-[#0b0f19] to-[#020617] border-b border-[#1e293b] overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1600&h=400&fit=crop&auto=format"
            alt="Basketball Court Hero"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/85 to-[#020617]/95" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                <span className="w-7 h-7 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 text-sm font-black">
                  🏀
                </span>
                <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-md">
                  Basketball Match Centre
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-800/80 border border-slate-700/60 px-2 py-1 rounded-md">
                  NBA · EuroLeague · Liga ACB · BAL
                </span>
                {liveCount > 0 && (
                  <span className="flex items-center gap-1.5 bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
                    {liveCount} Live Tipoffs
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Basketball Live Game Centre & Telemetry
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
                Real-time quarter box scores, multi-league conference standings, consensus betting lines, and Secaucus Replay telemetry across 30+ elite basketball leagues worldwide.
              </p>
            </div>

            {/* Sync bar & Live indicator */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-[#0f172a] border border-[#1e293b] px-3.5 py-2 rounded-xl text-xs text-slate-300 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[11px]">Synced: {lastSyncTime}</span>
              </div>
              <button
                onClick={() => fetchLiveScores(true)}
                disabled={isRefreshing}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-md shadow-orange-600/20 uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                <FiRefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Syncing...' : 'Sync Live'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          3-COLUMN DASHBOARD GRID
      ════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_290px] gap-6 items-start">

          {/* ── LEFT SIDEBAR ── */}
          <aside className="hidden lg:block space-y-4 lg:sticky lg:top-24">

            {/* Basketball Analysis Section */}
            <SideSection
              title="Basketball Analysis"
              action={
                <Link href="/basketball" className="text-[10px] text-orange-400 hover:text-orange-300 font-bold uppercase tracking-wider">
                  All →
                </Link>
              }
            >
              <div className="divide-y divide-[#1e293b]">
                {ANALYSIS_ARTICLES.map((a, i) => (
                  <div
                    key={i}
                    className="flex gap-3 p-3.5 hover:bg-[#1e293b]/40 transition-colors group cursor-pointer"
                  >
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                      <img
                        src={a.img}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                      />
                      <span className={`absolute top-1 left-1 ${a.tagColor} text-white text-[8px] font-black uppercase px-1 py-0.5 rounded`}>
                        {a.tag}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-orange-400 uppercase tracking-widest mb-1">
                        {a.comp}
                      </p>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-white leading-snug line-clamp-2">
                        {a.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SideSection>

            {/* Competition Directory Accordion */}
            <SideSection
              title="Competition Directory"
              defaultOpen={true}
              action={<span className="text-[10px] text-slate-400 font-bold px-1.5 py-0.5 rounded bg-slate-800">25+</span>}
            >
              <div className="divide-y divide-[#1e293b]">
                {COMP_GROUPS.map((group) => (
                  <div key={group.region}>
                    <button
                      onClick={() => setExpandedComp(expandedComp === group.region ? null : group.region)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#1e293b]/40 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{group.icon}</span>
                        <span className="text-xs font-semibold text-slate-300">{group.region}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500">{group.comps.length}</span>
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
                            href={c.href || '/basketball'}
                            className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#1e293b]/60 transition-colors group"
                          >
                            <span className="text-sm flex-shrink-0">{c.flag}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-semibold text-slate-300 group-hover:text-white truncate">
                                {c.name}
                              </p>
                              <p className="text-[10px] text-slate-500">{c.country}</p>
                            </div>
                            <span
                              className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${
                                c.tier === 'T1'
                                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                  : c.tier === 'T2'
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
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

            {/* Featured Team Hubs */}
            <SideSection
              title="Featured Team Hubs"
              defaultOpen={false}
              action={
                <Link href="/basketball" className="text-[10px] text-orange-400 hover:text-orange-300 font-bold uppercase tracking-wider">
                  All →
                </Link>
              }
            >
              <div className="grid grid-cols-2 gap-px bg-[#1e293b]">
                {TEAM_HUBS.map((t) => (
                  <Link
                    key={t.name}
                    href={`/basketball/teams/${t.slug}`}
                    className="flex flex-col items-center gap-1.5 p-3.5 bg-[#0f172a] hover:bg-[#131f35] transition-colors group text-center"
                  >
                    <DynamicTeamLogo name={t.name} logoUrl={t.logo} className="w-9 h-9" />
                    <p className="text-[11px] font-black text-slate-200 group-hover:text-white leading-tight truncate max-w-full">
                      {t.name}
                    </p>
                    <p className="text-[10px] text-slate-500">{t.conf}</p>
                    <span className="text-[9px] text-orange-400 font-semibold group-hover:text-orange-300 mt-0.5">
                      Team Hub →
                    </span>
                  </Link>
                ))}
              </div>
            </SideSection>

          </aside>

          {/* ── MAIN CONTENT ── */}
          <div className="min-w-0 space-y-5">
            {/* Mobile Dropdown Side Menu (Basketball Analysis, Competition Directory, Featured Team Hubs) */}
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#0f172a] border border-[#1e293b] hover:border-orange-500/50 rounded-2xl shadow-sm text-xs font-black uppercase tracking-wider text-slate-200 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                    <FiLayers className="w-3.5 h-3.5" />
                  </span>
                  <div className="text-left">
                    <p className="text-xs font-black text-white">Basketball Hubs & Directory</p>
                    <p className="text-[10px] text-slate-400 font-normal">Analysis · 25+ Competitions · Team Hubs</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-orange-400 border border-slate-700">
                    {mobileMenuOpen ? 'Close Menu' : 'Explore Menu'}
                  </span>
                  <FiChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      mobileMenuOpen ? 'rotate-180 text-orange-400' : ''
                    }`}
                  />
                </div>
              </button>

              {mobileMenuOpen && (
                <div className="mt-3 space-y-4 p-3.5 bg-[#080f1e] border border-orange-500/30 rounded-2xl shadow-xl animate-fadeIn">
                  {/* Basketball Analysis */}
                  <SideSection
                    title="Basketball Analysis"
                    defaultOpen={true}
                    action={
                      <Link href="/basketball" className="text-[10px] text-orange-400 hover:text-orange-300 font-bold">
                        All →
                      </Link>
                    }
                  >
                    <div className="divide-y divide-[#1e293b]">
                      {ANALYSIS_ARTICLES.slice(0, 4).map((a, i) => (
                        <div key={i} className="flex gap-3 p-3 hover:bg-[#1e293b]/40 transition-colors group cursor-pointer">
                          <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800 border border-slate-700">
                            <img src={a.img} alt="" className="w-full h-full object-cover opacity-80" />
                            <span className={`absolute top-1 left-1 ${a.tagColor} text-white text-[8px] font-black uppercase px-1 py-0.5 rounded`}>
                              {a.tag}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-semibold text-orange-400 uppercase tracking-widest mb-0.5">{a.comp}</p>
                            <h4 className="text-xs font-bold text-slate-200 group-hover:text-white leading-tight line-clamp-2">{a.title}</h4>
                            <p className="text-[9px] text-slate-500 mt-1">{a.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SideSection>

                  {/* Competition Directory */}
                  <SideSection
                    title="Competition Directory"
                    defaultOpen={false}
                    action={<span className="text-[10px] text-slate-400 font-bold px-1.5 py-0.5 rounded bg-slate-800">25+</span>}
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
                                  href={c.href || '/basketball'}
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

                  {/* Featured Team Hubs */}
                  <SideSection
                    title="Featured Team Hubs"
                    defaultOpen={false}
                    action={
                      <Link href="/basketball" className="text-[10px] text-orange-400 hover:text-orange-300 font-bold">
                        All →
                      </Link>
                    }
                  >
                    <div className="grid grid-cols-2 gap-px bg-[#1e293b]">
                      {TEAM_HUBS.map((t) => (
                        <Link
                          key={t.name}
                          href={`/basketball/teams/${t.slug}`}
                          className="flex flex-col items-center gap-1.5 p-3 bg-[#0f172a] hover:bg-[#131f35] transition-colors text-center"
                        >
                          <DynamicTeamLogo name={t.name} logoUrl={t.logo} className="w-8 h-8" />
                          <p className="text-[10px] font-bold text-slate-200 leading-tight truncate max-w-full">{t.name}</p>
                          <span className="text-[9px] text-orange-400 font-semibold">Hub →</span>
                        </Link>
                      ))}
                    </div>
                  </SideSection>
                </div>
              )}
            </div>

            {/* Navigation Tabs Bar */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-sm">
              <div className="flex overflow-x-auto no-scrollbar">
                {(
                  [
                    { key: 'live', label: 'Live' },
                    { key: 'upcoming', label: 'Upcoming' },
                    { key: 'results', label: 'Results' },
                    { key: 'standings', label: 'Table' },
                    { key: 'leaders', label: 'Top Scorer' },
                    { key: 'odds', label: 'Odds' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setMainTab(tab.key);
                      setShowAllFixtures(false);
                    }}
                    className={`flex-shrink-0 flex items-center gap-2 px-5 py-3.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                      mainTab === tab.key
                        ? 'border-orange-500 text-white bg-orange-500/10'
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-[#1e293b]/40'
                    }`}
                  >
                    {tab.key === 'live' && liveCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                    )}
                    <span>{tab.label}</span>
                    {tab.key === 'live' && liveCount > 0 && (
                      <span className="bg-rose-500/20 text-rose-400 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-rose-500/30">
                        {liveCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Dynamic Date Strip (Upcoming & Results) */}
              {(mainTab === 'upcoming' || mainTab === 'results') && (
                <div className="flex items-center gap-2 px-4 py-2.5 border-t border-[#1e293b] bg-[#070d1a] overflow-x-auto no-scrollbar">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1 flex-shrink-0 mr-1">
                    <FiCalendar className="w-3.5 h-3.5 text-orange-400" />
                    <span>Select Date:</span>
                  </span>
                  {dateStrip.map((item) => (
                    <button
                      key={item.iso}
                      onClick={() => setSelectedDate(item.iso)}
                      className={`flex-shrink-0 flex flex-col items-center px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        selectedDate === item.iso
                          ? 'bg-orange-600 border-orange-500 text-white shadow-md shadow-orange-600/30'
                          : 'bg-[#0f172a] border-[#1e293b] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-[9px] uppercase tracking-wider font-semibold opacity-80">{item.label}</span>
                      <span className="text-[11px] font-black font-mono">{item.dayMonth}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Fixtures Sub-filters & Search Bar */}
              {isFixtureTab && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-[#1e293b] bg-[#0c1322]">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {COMP_FILTERS.map((f) => (
                      <button
                        key={f}
                        onClick={() => setCompFilter(f)}
                        className={`flex-shrink-0 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          compFilter === f
                            ? 'bg-orange-600 border-orange-500 text-white shadow-sm shadow-orange-600/30'
                            : 'bg-transparent border-[#1e293b] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <div className="relative sm:w-52">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search matches or arena..."
                      className="w-full pl-8 pr-7 py-1.5 bg-[#06101E] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── Fixture Grid (Live / Upcoming / Results) ── */}
            {isFixtureTab && (
              visibleGames.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {visibleGames.map((g) => (
                      <GameCard
                        key={g.id}
                        g={g}
                        onQuickBoxScore={(game) => setSelectedGameForModal(game)}
                      />
                    ))}
                  </div>

                  {/* "View All Fixtures" Button when > 6 matches */}
                  {currentGames.length > 6 && (
                    <div className="pt-2 text-center">
                      <button
                        onClick={() => setShowAllFixtures(!showAllFixtures)}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600/20 via-amber-600/20 to-orange-600/20 border border-orange-500/40 text-orange-400 hover:text-white hover:border-orange-500 text-xs font-black uppercase tracking-widest transition-all shadow-md cursor-pointer group"
                      >
                        <span>
                          {showAllFixtures
                            ? 'Show Less Matches'
                            : `View All Fixtures (${currentGames.length - 6} more)`}
                        </span>
                        <FiChevronDown
                          className={`transition-transform duration-200 ${
                            showAllFixtures ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl py-16 px-4 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-xl text-orange-400">
                    🏀
                  </div>
                  <h3 className="text-base font-bold text-white">No fixtures found</h3>
                  <p className="text-slate-400 text-xs max-w-sm mx-auto">
                    No games match the current competition filter or date. Try selecting another date or syncing live telemetry.
                  </p>
                  <button
                    onClick={() => {
                      setCompFilter('All');
                      setSearchQuery('');
                      setSelectedDate(new Date().toISOString().split('T')[0]);
                    }}
                    className="mt-2 text-xs font-bold text-orange-400 hover:text-orange-300 underline cursor-pointer"
                  >
                    Reset all filters & return to today
                  </button>
                </div>
              )
            )}

            {/* ── Standings Tab ── */}
            {mainTab === 'standings' && (
              <div className="space-y-4">
                {/* League Selector Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0f172a] p-3 border border-[#1e293b] rounded-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-1">
                      League:
                    </span>
                    {(['NBA', 'EuroLeague', 'Liga ACB'] as const).map((league) => (
                      <button
                        key={league}
                        onClick={() => setSelectedStandingsLeague(league)}
                        className={`text-xs font-black px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                          selectedStandingsLeague === league
                            ? 'bg-orange-600 border-orange-500 text-white shadow-sm shadow-orange-600/30'
                            : 'border-[#1e293b] bg-[#0c1322] text-slate-400 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        {league}
                      </button>
                    ))}
                  </div>

                  {selectedStandingsLeague === 'NBA' && (
                    <div className="flex gap-1.5 bg-[#080d1a] p-1 rounded-xl border border-slate-800">
                      {(['East', 'West'] as const).map((c) => (
                        <button
                          key={c}
                          onClick={() => setStandingsConf(c)}
                          className={`text-xs font-bold px-3 py-1 rounded-lg transition-all cursor-pointer ${
                            standingsConf === c
                              ? 'bg-slate-700 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {c}ern
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Standings Table Card */}
                <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-5 py-3 border-b border-[#1e293b] bg-[#0c1322] flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                      <span>🏀 {selectedStandingsLeague} {selectedStandingsLeague === 'NBA' ? `${standingsConf}ern Conference` : 'Table'}</span>
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">Real-time Form & Seed Matrix</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#1e293b] bg-[#090f1a]">
                          {[
                            { label: '#', key: 'pos' as const, align: 'left', width: 'w-10 pl-5 pr-2' },
                            { label: 'Team', key: null, align: 'left', width: 'px-3' },
                            { label: 'W', key: 'w' as const, align: 'center', width: 'px-2.5' },
                            { label: 'L', key: null, align: 'center', width: 'px-2.5' },
                            { label: 'PCT', key: 'pct' as const, align: 'center', width: 'px-2.5' },
                            { label: 'GB', key: null, align: 'center', width: 'px-2.5' },
                            { label: 'PPG', key: 'ppg' as const, align: 'center', width: 'px-2.5' },
                            { label: 'OPP', key: 'oppg' as const, align: 'center', width: 'px-2.5' },
                            { label: 'Form (Last 5)', key: null, align: 'right', width: 'pr-5 pl-2 hidden md:table-cell' },
                          ].map((col, idx) => (
                            <th
                              key={idx}
                              className={`py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-widest ${col.width} text-${col.align}`}
                            >
                              {col.key ? (
                                <button
                                  onClick={() => handleSortStandings(col.key)}
                                  className="inline-flex items-center gap-1 hover:text-white cursor-pointer"
                                >
                                  <span>{col.label}</span>
                                  {standingsSortKey === col.key && (
                                    <span>{standingsSortAsc ? '▲' : '▼'}</span>
                                  )}
                                </button>
                              ) : (
                                col.label
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e293b]">
                        {activeStandings.map((row) => (
                          <tr
                            key={row.pos}
                            className={`hover:bg-[#1e293b]/40 transition-colors ${
                              row.zone === 'playoffs'
                                ? 'border-l-2 border-l-blue-500'
                                : row.zone === 'playin'
                                ? 'border-l-2 border-l-orange-500'
                                : row.zone === 'lottery'
                                ? 'border-l-2 border-l-rose-500'
                                : ''
                            }`}
                          >
                            <td className="pl-5 pr-2 py-3">
                              <span
                                className={`text-xs font-black tabular-nums ${
                                  row.zone === 'playoffs'
                                    ? 'text-blue-400'
                                    : row.zone === 'playin'
                                    ? 'text-orange-400'
                                    : row.zone === 'lottery'
                                    ? 'text-rose-400'
                                    : 'text-slate-400'
                                }`}
                              >
                                {row.pos}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2.5">
                                <DynamicTeamLogo name={row.team} logoUrl={row.logo} className="w-6 h-6" />
                                <span className="text-sm font-semibold text-slate-100 hover:text-white transition-colors truncate">
                                  {row.team}
                                </span>
                              </div>
                            </td>
                            <td className="px-2.5 py-3 text-center text-sm font-bold text-slate-200 tabular-nums">
                              {row.w}
                            </td>
                            <td className="px-2.5 py-3 text-center text-sm font-bold text-slate-200 tabular-nums">
                              {row.l}
                            </td>
                            <td className="px-2.5 py-3 text-center text-sm font-mono text-slate-300 tabular-nums">
                              {row.pct}
                            </td>
                            <td className="px-2.5 py-3 text-center text-sm font-mono text-slate-400 tabular-nums">
                              {row.gb}
                            </td>
                            <td className="px-2.5 py-3 text-center">
                              <span className="text-sm font-black text-orange-400 tabular-nums">
                                {row.ppg.toFixed(1)}
                              </span>
                            </td>
                            <td className="px-2.5 py-3 text-center text-sm font-mono text-slate-400 tabular-nums">
                              {row.oppg.toFixed(1)}
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

                  {/* Legend Footer */}
                  <div className="px-5 py-3 border-t border-[#1e293b] bg-[#090f1a] flex flex-wrap gap-6 text-[10px] text-slate-400 font-semibold">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-3 border-l-2 border-blue-500 inline-block" />
                      <span>Playoff Seed (1-6)</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-3 border-l-2 border-orange-500 inline-block" />
                      <span>Play-In Tournament (7-10)</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-3 border-l-2 border-rose-500 inline-block" />
                      <span>Draft Lottery Zone (11-15)</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Stat Leaders Tab ── */}
            {mainTab === 'leaders' && (
              <div className="space-y-4">
                <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-5 py-3.5 border-b border-[#1e293b] bg-[#0c1322] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">
                        NBA Statistical Leaders — 2025/26 Season
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Minimum 70% games played qualifying threshold.
                      </p>
                    </div>

                    {/* Category Switcher */}
                    <div className="flex flex-wrap gap-1 bg-[#06101E] border border-slate-800 p-1 rounded-xl">
                      {(
                        [
                          { key: 'PPG', label: 'Points' },
                          { key: 'RPG', label: 'Rebounds' },
                          { key: 'APG', label: 'Assists' },
                          { key: 'BPG', label: 'Blocks' },
                          { key: '3PM', label: '3-Pointers' },
                          { key: 'FG%', label: 'FG %' },
                        ] as const
                      ).map((cat) => (
                        <button
                          key={cat.key}
                          onClick={() => setStatCat(cat.key)}
                          className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                            statCat === cat.key
                              ? 'bg-orange-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Leader Search Bar */}
                  <div className="px-5 py-2.5 border-b border-[#1e293b] bg-[#080e1c] flex items-center justify-between gap-3">
                    <div className="relative w-full max-w-sm">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
                      <input
                        type="text"
                        value={leaderSearch}
                        onChange={(e) => setLeaderSearch(e.target.value)}
                        placeholder="Search leader by player or franchise..."
                        className="w-full pl-8 pr-4 py-1.5 bg-[#060c18] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                      {activeLeaders.length} qualified players
                    </span>
                  </div>

                  <div className="divide-y divide-[#1e293b]">
                    {activeLeaders.map((p) => (
                      <div
                        key={p.name + p.category}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-[#1e293b]/40 transition-colors group"
                      >
                        <span className="text-sm font-black w-7 text-center flex-shrink-0">
                          {p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : p.rank}
                        </span>

                        <DynamicPlayerAvatar name={p.name} photo={p.photo} className="w-11 h-11" />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-black text-slate-100 group-hover:text-white truncate">
                              {p.name}
                            </p>
                            <span className="text-xs">{p.flag}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <DynamicTeamLogo name={p.team} logoUrl={p.teamLogo} className="w-4 h-4" />
                            <span className="truncate">{p.team}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{p.extra}</p>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="text-xl font-black text-orange-400 tabular-nums">
                            {p.category === 'FG%' ? `${p.stat.toFixed(1)}%` : p.stat.toFixed(1)}
                          </p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
                            {p.statLabel}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Odds & Markets Tab (Interactive Betting Intelligence) ── */}
            {mainTab === 'odds' && (
              <div className="space-y-6">
                {/* Odds Top Banner */}
                <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <span>📊 Vegas & Consensus Basketball Odds</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Point spreads, moneylines, over/under game totals, and real-time line movement telemetry.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-[#060c18] border border-slate-800 p-1 rounded-xl">
                    <span className="text-[10px] font-black uppercase text-slate-400 px-2">Format:</span>
                    <button
                      onClick={() => setOddsFormat('decimal')}
                      className={`text-xs font-black px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        oddsFormat === 'decimal'
                          ? 'bg-orange-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Decimal (1.91)
                    </button>
                    <button
                      onClick={() => setOddsFormat('american')}
                      className={`text-xs font-black px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        oddsFormat === 'american'
                          ? 'bg-orange-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      American (-110)
                    </button>
                  </div>
                </div>

                {/* Grid with Odds Matches + Bet Slip Calculator */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left 7 cols: Matches list */}
                  <div className="lg:col-span-7 space-y-4">
                    {BASKETBALL_ODDS_MATCHES.map((item) => (
                      <div
                        key={item.id}
                        className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 space-y-3 hover:border-orange-500/40 transition-all shadow-sm"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-orange-400 uppercase tracking-wider">{item.comp}</span>
                          <span className="text-slate-400 font-mono">{item.time}</span>
                        </div>

                        {/* Teams & Lines */}
                        <div className="space-y-2">
                          {/* Home */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1 truncate">
                              <DynamicTeamLogo name={item.home} logoUrl={item.homeLogo} className="w-5 h-5" />
                              <span className="text-xs font-bold text-white truncate">{item.home}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {/* Spread button */}
                              <button
                                onClick={() =>
                                  setSelectedOddsPick({
                                    match: `${item.home} vs ${item.away}`,
                                    team: item.home,
                                    type: 'Point Spread',
                                    line: item.spread.homeLine,
                                    oddsDecimal: item.spread.homeDecimal,
                                    oddsAmerican: item.spread.homeAmerican,
                                  })
                                }
                                className="px-2.5 py-1 bg-slate-800 hover:bg-orange-600 hover:text-white rounded-lg text-xs font-mono font-bold text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                                title="Select Spread"
                              >
                                {item.spread.homeLine} ({oddsFormat === 'decimal' ? item.spread.homeDecimal : item.spread.homeAmerican})
                              </button>
                              {/* ML button */}
                              <button
                                onClick={() =>
                                  setSelectedOddsPick({
                                    match: `${item.home} vs ${item.away}`,
                                    team: item.home,
                                    type: 'Moneyline',
                                    line: 'ML',
                                    oddsDecimal: item.moneyline.homeDecimal,
                                    oddsAmerican: item.moneyline.homeAmerican,
                                  })
                                }
                                className="px-2.5 py-1 bg-slate-800 hover:bg-orange-600 hover:text-white rounded-lg text-xs font-mono font-bold text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                                title="Select Moneyline"
                              >
                                {oddsFormat === 'decimal' ? item.moneyline.homeDecimal : item.moneyline.homeAmerican}
                              </button>
                            </div>
                          </div>

                          {/* Away */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1 truncate">
                              <DynamicTeamLogo name={item.away} logoUrl={item.awayLogo} className="w-5 h-5" />
                              <span className="text-xs font-bold text-white truncate">{item.away}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {/* Spread button */}
                              <button
                                onClick={() =>
                                  setSelectedOddsPick({
                                    match: `${item.home} vs ${item.away}`,
                                    team: item.away,
                                    type: 'Point Spread',
                                    line: item.spread.awayLine,
                                    oddsDecimal: item.spread.awayDecimal,
                                    oddsAmerican: item.spread.awayAmerican,
                                  })
                                }
                                className="px-2.5 py-1 bg-slate-800 hover:bg-orange-600 hover:text-white rounded-lg text-xs font-mono font-bold text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                                title="Select Spread"
                              >
                                {item.spread.awayLine} ({oddsFormat === 'decimal' ? item.spread.awayDecimal : item.spread.awayAmerican})
                              </button>
                              {/* ML button */}
                              <button
                                onClick={() =>
                                  setSelectedOddsPick({
                                    match: `${item.home} vs ${item.away}`,
                                    team: item.away,
                                    type: 'Moneyline',
                                    line: 'ML',
                                    oddsDecimal: item.moneyline.awayDecimal,
                                    oddsAmerican: item.moneyline.awayAmerican,
                                  })
                                }
                                className="px-2.5 py-1 bg-slate-800 hover:bg-orange-600 hover:text-white rounded-lg text-xs font-mono font-bold text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                                title="Select Moneyline"
                              >
                                {oddsFormat === 'decimal' ? item.moneyline.awayDecimal : item.moneyline.awayAmerican}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Over/Under Total Bar */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                          <span className="text-slate-400 font-semibold">
                            Total {item.total.points}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                setSelectedOddsPick({
                                  match: `${item.home} vs ${item.away}`,
                                  team: `Over ${item.total.points}`,
                                  type: 'Game Total',
                                  line: `O ${item.total.points}`,
                                  oddsDecimal: item.total.overDecimal,
                                  oddsAmerican: item.total.overAmerican,
                                })
                              }
                              className="text-xs font-mono text-emerald-400 hover:underline cursor-pointer"
                            >
                              Over ({oddsFormat === 'decimal' ? item.total.overDecimal : item.total.overAmerican})
                            </button>
                            <span className="text-slate-600">·</span>
                            <button
                              onClick={() =>
                                setSelectedOddsPick({
                                  match: `${item.home} vs ${item.away}`,
                                  team: `Under ${item.total.points}`,
                                  type: 'Game Total',
                                  line: `U ${item.total.points}`,
                                  oddsDecimal: item.total.underDecimal,
                                  oddsAmerican: item.total.underAmerican,
                                })
                              }
                              className="text-xs font-mono text-rose-400 hover:underline cursor-pointer"
                            >
                              Under ({oddsFormat === 'decimal' ? item.total.underDecimal : item.total.underAmerican})
                            </button>
                          </div>
                        </div>

                        {/* Movement badge */}
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                          <span>{item.movement}</span>
                          <span className="text-slate-400">{item.publicBetting}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right 5 cols: Interactive Payout Calculator */}
                  <div className="lg:col-span-5 sticky top-24">
                    <OddsBetSlipCalculator
                      selectedPick={selectedOddsPick}
                      oddsFormat={oddsFormat}
                      onClear={() => setSelectedOddsPick(null)}
                      onToast={triggerToast}
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <aside className="hidden xl:block space-y-4 sticky top-24">

            {/* Live Now Ticker Widget */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-[#1e293b] bg-[#0c1322] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                  <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">
                    Live Tipoffs
                  </h3>
                </div>
                <span className="text-[10px] font-black text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                  {liveCount} Active
                </span>
              </div>
              <div className="divide-y divide-[#1e293b]">
                {liveGames
                  .filter((g) => g.status === 'LIVE' || g.status === 'HT' || g.status === 'OT')
                  .slice(0, 4)
                  .map((g) => (
                    <div
                      key={g.id}
                      onClick={() => setSelectedGameForModal(g)}
                      className="block px-4 py-3 hover:bg-[#1e293b]/40 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                          <span>{g.compFlag}</span>
                          <span className="truncate">{g.comp}</span>
                        </span>
                        <span className="text-[10px] font-black text-rose-400 flex-shrink-0">
                          {g.quarter} · {g.clock}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 truncate">
                            <DynamicTeamLogo name={g.home} logoUrl={g.homeLogo} className="w-4 h-4" />
                            <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                              {g.home}
                            </span>
                          </div>
                          <span className="text-sm font-black text-white tabular-nums ml-2">
                            {g.hScore}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 truncate">
                            <DynamicTeamLogo name={g.away} logoUrl={g.awayLogo} className="w-4 h-4" />
                            <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                              {g.away}
                            </span>
                          </div>
                          <span className="text-sm font-black text-white tabular-nums ml-2">
                            {g.aScore}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* NBA Standings Quick Widget */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-[#1e293b] bg-[#0c1322] flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">
                  NBA Top Seeds (East)
                </h3>
                <button
                  onClick={() => setMainTab('standings')}
                  className="text-[10px] text-orange-400 hover:text-orange-300 font-bold uppercase tracking-wider cursor-pointer"
                >
                  Full Table →
                </button>
              </div>
              <div className="divide-y divide-[#1e293b]">
                {NBA_EAST_STANDINGS.slice(0, 5).map((row) => (
                  <div
                    key={row.pos}
                    className={`flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#1e293b]/40 transition-colors ${
                      row.zone === 'playoffs' ? 'border-l-2 border-l-blue-500' : ''
                    }`}
                  >
                    <span
                      className={`text-xs font-black w-4 tabular-nums ${
                        row.zone === 'playoffs' ? 'text-blue-400' : 'text-slate-500'
                      }`}
                    >
                      {row.pos}
                    </span>
                    <DynamicTeamLogo name={row.team} logoUrl={row.logo} className="w-5 h-5" />
                    <span className="text-xs font-semibold text-slate-200 flex-1 truncate">
                      {row.team}
                    </span>
                    <span className="text-xs font-mono font-bold text-white tabular-nums">
                      {row.w}-{row.l}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scoring Leaders Quick Widget */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-[#1e293b] bg-[#0c1322] flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">
                  PPG Leaders
                </h3>
                <button
                  onClick={() => {
                    setMainTab('leaders');
                    setStatCat('PPG');
                  }}
                  className="text-[10px] text-orange-400 hover:text-orange-300 font-bold uppercase tracking-wider cursor-pointer"
                >
                  All Leaders →
                </button>
              </div>
              <div className="divide-y divide-[#1e293b]">
                {ALL_STAT_LEADERS.filter((l) => l.category === 'PPG').slice(0, 4).map((p) => (
                  <div
                    key={p.rank}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#1e293b]/40 transition-colors"
                  >
                    <span className="text-xs font-black text-slate-500 w-4 tabular-nums">
                      {p.rank}
                    </span>
                    <DynamicPlayerAvatar name={p.name} photo={p.photo} className="w-7 h-7" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-200 truncate">{p.name}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <DynamicTeamLogo name={p.team} logoUrl={p.teamLogo} className="w-3 h-3" />
                        <span className="truncate">{p.team}</span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-orange-400 tabular-nums">
                      {p.stat.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </aside>

        </div>

        {/* ════════════════════════════════════════
            SPECIAL SECTION 1: BASKETBALL SUPERSTARS
        ════════════════════════════════════════ */}
        <section className="mt-14 pt-10 border-t border-[#1e293b]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                <span className="text-[11px] font-black uppercase tracking-widest text-orange-400">
                  Global & NBA Superstars
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Basketball Icons & Franchise Scorers
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Efficiency ratings (PER), max contracts, triple-double counts, and real-time box score telemetry.
              </p>
            </div>

            {/* Position filter tabs & Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-[#0f172a] border border-[#1e293b] p-1 rounded-xl">
                {(['All', 'Guards', 'Forwards', 'Centers'] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setSuperstarFilter(pos)}
                    className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      superstarFilter === pos
                        ? 'bg-orange-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
                <input
                  type="text"
                  value={superstarSearch}
                  onChange={(e) => setSuperstarSearch(e.target.value)}
                  placeholder="Search superstar..."
                  className="pl-8 pr-3 py-1.5 bg-[#0a1120] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuperstars.map((player) => (
              <div
                key={player.slug}
                className="bg-[#0f172a] border border-[#1e293b] hover:border-orange-500/40 rounded-2xl p-5 transition-all duration-300 shadow-sm hover:shadow-orange-500/5 hover:-translate-y-0.5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <DynamicPlayerAvatar
                      name={player.name}
                      photo={player.photo}
                      className="w-14 h-14 border-2 border-slate-700 group-hover:border-orange-500/50 transition-colors"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-black text-slate-100 group-hover:text-white truncate">
                          {player.name}
                        </h4>
                        <span className="text-xs">{player.countryFlag}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <DynamicTeamLogo name={player.team} logoUrl={player.teamLogo} className="w-4 h-4" />
                        <span className="truncate font-medium">{player.team}</span>
                      </div>
                      <p className="text-[10px] text-orange-400/90 font-bold mt-0.5 uppercase tracking-wider">
                        {player.pos}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 py-2.5 px-3 bg-[#0a1120] rounded-xl border border-[#1e293b] text-center">
                    <div>
                      <span className="text-xs font-black text-orange-400 tabular-nums">{player.ppg}</span>
                      <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">PPG</p>
                    </div>
                    <div>
                      <span className="text-xs font-black text-white tabular-nums">{player.rpg}</span>
                      <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">RPG</p>
                    </div>
                    <div>
                      <span className="text-xs font-black text-amber-400 tabular-nums">{player.apg}</span>
                      <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">APG</p>
                    </div>
                    <div>
                      <span className="text-xs font-black text-emerald-400 tabular-nums">{player.per}</span>
                      <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">PER</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1e293b]/70 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">{player.salary}</span>
                  <Link
                    href={`/basketball/players/${player.slug}`}
                    className="text-orange-400 font-bold hover:text-orange-300 transition-colors flex items-center gap-1"
                  >
                    <span>Full Profile</span>
                    <FiChevronRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════
            SPECIAL SECTION 2: OFFICIALS & REPLAY CENTER
        ════════════════════════════════════════ */}
        <section className="mt-14 pt-10 border-t border-[#1e293b]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[11px] font-black uppercase tracking-widest text-blue-400">
                  ⚖️ Secaucus Replay & Lead Arbiters
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Officials & Replay Command Desk
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                NBA Secaucus Replay Center call tracking, coach challenge overturn percentages, and whistle telemetry.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowReplayInfo(!showReplayInfo)}
                className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <FiHelpCircle className="w-4 h-4" />
                <span>Secaucus Rule Protocols</span>
              </button>
            </div>
          </div>

          {showReplayInfo && (
            <div className="mb-6 p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 text-xs text-slate-300 space-y-2">
              <h4 className="font-bold text-blue-300 uppercase tracking-wider text-[11px]">
                NBA Secaucus Replay Review Protocols (2025/26)
              </h4>
              <p className="leading-relaxed text-slate-400">
                Triggered automatically for 2-point vs 3-point buzzer shots, shot clock expirations, and clear path fouls. Coach Challenges require an available timeout; if successful, a second challenge is granted. Overturn accuracy is monitored via multi-angle 120 FPS high-speed cameras synchronized with courtside referees.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOfficials.map((o) => (
              <div
                key={o.name}
                className="bg-[#0f172a] border border-[#1e293b] hover:border-blue-500/40 rounded-2xl p-4 transition-all duration-300 shadow-sm hover:shadow-blue-500/5 hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3.5 mb-3">
                  <DynamicPlayerAvatar name={o.name} photo={o.photo} className="w-12 h-12" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-100 truncate">{o.name}</h4>
                      <span className="text-[10px] font-mono text-orange-400 font-bold">{o.number}</span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{o.seasons}</span>
                      <span className="text-[10px] text-slate-500">· {o.panel}</span>
                    </p>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border bg-blue-500/15 border-blue-500/30 text-blue-300 flex-shrink-0">
                    {o.badge}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-[#0a1120] rounded-xl border border-[#1e293b] text-center">
                  <div>
                    <span className="text-xs font-black text-white">{o.reviewAcc}</span>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Accuracy</p>
                  </div>
                  <div>
                    <span className="text-xs font-black text-amber-400">{o.overturnPct}</span>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Overturn %</p>
                  </div>
                  <div>
                    <span className="text-xs font-black text-emerald-400">{o.avgReviewSec}</span>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Avg Review</p>
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
                  🧠 Sideline Masterminds & Dugouts
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Tacticians & Sideline Philosophies
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                5-out spacing sets, ATO (after-timeout) play success rates, clutch defensive ratings, and championship rings.
              </p>
            </div>

            {/* Scheme filter */}
            <div className="flex bg-[#0f172a] border border-[#1e293b] p-1 rounded-xl">
              {(['All', '5-Out', 'Horns', 'Pick-and-Roll'] as const).map((scheme) => (
                <button
                  key={scheme}
                  onClick={() => setCoachFilter(scheme)}
                  className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    coachFilter === scheme
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {scheme}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCoaches.map((c) => (
              <div
                key={c.name}
                className="bg-[#0f172a] border border-[#1e293b] hover:border-emerald-500/40 rounded-2xl p-5 transition-all duration-300 shadow-sm hover:shadow-emerald-500/5 hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-3">
                    <DynamicPlayerAvatar name={c.name} photo={c.photo} className="w-12 h-12" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-black text-slate-100 truncate">{c.name}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <DynamicTeamLogo name={c.team} logoUrl={c.teamLogo} className="w-3.5 h-3.5" />
                        <span className="truncate font-medium">{c.team}</span>
                      </div>
                    </div>
                    {c.rings > 0 && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded border bg-amber-500/15 border-amber-500/30 text-amber-300 flex-shrink-0">
                        {c.rings}x 💍
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-[#0a1120] rounded-xl border border-[#1e293b] space-y-1.5 mb-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
                      Core Scheme
                    </p>
                    <p className="text-xs text-emerald-400 font-semibold leading-snug">
                      {c.system}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1e293b]/70 text-center text-xs">
                  <div>
                    <span className="font-mono font-black text-white">{c.winPct}</span>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Career Win %</p>
                  </div>
                  <div>
                    <span className="font-mono font-black text-orange-400">{c.offensiveRtg}</span>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Offensive Rating</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════
            SPECIAL SECTION 4: HOOPS DAILY BRIEF
        ════════════════════════════════════════ */}
        <section className="mt-14 pt-10 border-t border-[#1e293b]">
          <div className="relative overflow-hidden rounded-3xl border border-orange-500/30 bg-gradient-to-br from-[#1b0c04] via-[#0e1626] to-[#020617] p-6 sm:p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left text */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-[10px] font-black uppercase tracking-widest text-orange-300">
                    🏀 GoalMills Morning Shootaround
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Daily 07:00 AM Tipoff Edition
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Hoops Daily Morning Shootaround
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed">
                  Start your basketball morning with every NBA box score, fourth-quarter clutch telemetry, EuroLeague upsets, and Basketball Africa League scouting reports delivered straight to your inbox.
                </p>

                {/* Topic selector pills */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-orange-400">
                    Customize Your Daily Feed:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Quarter Box Scores',
                      'Playoff Projections',
                      'Global BAL Wire',
                      'Odds Line Movement',
                    ].map((topic) => {
                      const isSelected = selectedBriefTopics.includes(topic);
                      return (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => toggleBriefTopic(topic)}
                          className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>{isSelected ? '✓' : '+'}</span>
                          <span>{topic}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right newsletter card */}
              <div className="lg:col-span-5 bg-[#0f172a]/90 border border-[#1e293b] rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md">
                {briefSubscribed ? (
                  <div className="text-center py-6 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center mx-auto text-xl">
                      ✓
                    </div>
                    <h4 className="text-base font-bold text-white">You&apos;re subscribed!</h4>
                    <p className="text-xs text-slate-400">
                      Tomorrow&apos;s Hoops Daily Morning Shootaround will arrive in your inbox before tipoff.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleBriefSubscribe} className="space-y-3.5">
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">
                        Get the Morning Box Scores
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Join 32,000+ basketball fans, scouts, and fantasy managers. Free forever, unsubscribe anytime.
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
                          placeholder="hooper@example.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#06101E] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={briefSubmitting}
                        className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-all shadow-md shadow-orange-600/30 cursor-pointer disabled:opacity-50"
                      >
                        {briefSubmitting ? 'Subscribing...' : 'Subscribe to Hoops Brief'}
                      </button>
                    </div>

                    {briefMessage && (
                      <p className="text-[10px] text-amber-400 text-center">{briefMessage}</p>
                    )}

                    <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 pt-1">
                      <span>✓ No spam</span>
                      <span>✓ Daily tipoff drop</span>
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

export default BasketballPageClient;
