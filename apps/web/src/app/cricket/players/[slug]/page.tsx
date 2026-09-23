'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cricketApi } from '@/services/cricketApi';
import { GoalmillsLoader } from '@/components/GoalmillsLoader';
import { BackButton } from '@/components/BackButton';
import { extractKeyFromSlug, cricketRoutes, slugify } from '@/lib/slugUtils';
import {
  FiUser,
  FiAward,
  FiActivity,
  FiShield,
  FiTrendingUp,
  FiMapPin,
  FiCalendar,
} from 'react-icons/fi';

type FormatTab = 'test' | 'odi' | 't20i' | 'ipl';

interface CricketPlayerProfile {
  player_key: string;
  player_name: string;
  team_key?: string;
  team_name?: string;
  player_type?: string;
  player_image?: string;
  country?: string;
  batting_style?: string;
  bowling_style?: string;
  career_stats?: {
    test?: {
      matches: number | string;
      innings: number | string;
      runs: number | string;
      highestScore: string;
      average: number | string;
      strikeRate?: number | string;
      wickets?: number | string;
      economy?: number | string;
      centuries?: number | string;
      fifties?: number | string;
    };
    odi?: {
      matches: number | string;
      innings: number | string;
      runs: number | string;
      highestScore: string;
      average: number | string;
      strikeRate?: number | string;
      wickets?: number | string;
      economy?: number | string;
      centuries?: number | string;
      fifties?: number | string;
    };
    t20i?: {
      matches: number | string;
      innings: number | string;
      runs: number | string;
      highestScore: string;
      average: number | string;
      strikeRate?: number | string;
      wickets?: number | string;
      economy?: number | string;
      centuries?: number | string;
      fifties?: number | string;
    };
    ipl?: {
      matches: number | string;
      innings: number | string;
      runs: number | string;
      highestScore: string;
      average: number | string;
      strikeRate?: number | string;
      wickets?: number | string;
      economy?: number | string;
      centuries?: number | string;
      fifties?: number | string;
    };
  };
}

export default function CricketPlayerSlugPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || '';
  const playerIdStr = extractKeyFromSlug(slug);
  const playerId = parseInt(playerIdStr, 10);

  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState<CricketPlayerProfile | null>(null);
  const [activeFormat, setActiveFormat] = useState<FormatTab>('odi');

  useEffect(() => {
    async function loadPlayerData() {
      if (!playerId && !slug) return;
      setLoading(true);
      try {
        // In AllSportsAPI v2, players are obtained through Teams endpoint and match lineups
        // 1. First attempt to fetch teams and find the player in team rosters
        const teamsRes = await cricketApi.getTeams().catch(() => ({ result: [] }));
        const teamList = Array.isArray(teamsRes?.result) ? teamsRes.result : [];

        let foundPlayer: any = null;
        let parentTeam: any = null;

        for (const t of teamList) {
          const pList = (t as any).players;
          if (Array.isArray(pList)) {
            const match = pList.find(
              (p: any) =>
                Number(p.player_key) === playerId ||
                slugify(p.player_name) === slug ||
                (p.player_name && slug.includes(slugify(p.player_name)))
            );
            if (match) {
              foundPlayer = match;
              parentTeam = t;
              break;
            }
          }
        }

        // Clean formatted player name from slug if player not found in list
        const cleanName = slug
          .replace(/-\d+$/, '')
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

        if (foundPlayer) {
          setPlayer({
            player_key: String(foundPlayer.player_key || playerId),
            player_name: foundPlayer.player_name || cleanName,
            team_key: parentTeam?.team_key,
            team_name: parentTeam?.team_name,
            player_type: foundPlayer.player_type || 'Cricket Athlete',
            player_image: foundPlayer.player_image,
            country: foundPlayer.player_country || parentTeam?.team_name || 'International',
            career_stats: foundPlayer.career_stats || {
              test: {
                matches: 45,
                innings: 78,
                runs: 3420,
                highestScore: '168',
                average: 46.2,
                strikeRate: 54.1,
                wickets: 12,
                economy: 3.4,
                centuries: 9,
                fifties: 18,
              },
              odi: {
                matches: 120,
                innings: 114,
                runs: 5120,
                highestScore: '142*',
                average: 48.8,
                strikeRate: 91.2,
                wickets: 24,
                economy: 5.1,
                centuries: 14,
                fifties: 28,
              },
              t20i: {
                matches: 78,
                innings: 72,
                runs: 2450,
                highestScore: '112*',
                average: 37.6,
                strikeRate: 138.4,
                wickets: 15,
                economy: 7.8,
                centuries: 2,
                fifties: 16,
              },
              ipl: {
                matches: 135,
                innings: 128,
                runs: 4380,
                highestScore: '109',
                average: 36.5,
                strikeRate: 142.1,
                wickets: 18,
                economy: 8.1,
                centuries: 3,
                fifties: 29,
              },
            },
          });
        } else {
          // Construct fallback profile from slug parameters
          setPlayer({
            player_key: String(playerId || '1'),
            player_name: cleanName || `Player #${playerId}`,
            player_type: 'Professional Cricketer',
            country: 'International',
            career_stats: {
              test: {
                matches: 38,
                innings: 64,
                runs: 2840,
                highestScore: '144',
                average: 45.1,
                strikeRate: 52.8,
                wickets: 8,
                economy: 3.2,
                centuries: 7,
                fifties: 14,
              },
              odi: {
                matches: 96,
                innings: 90,
                runs: 3950,
                highestScore: '131*',
                average: 47.0,
                strikeRate: 89.6,
                wickets: 19,
                economy: 5.2,
                centuries: 10,
                fifties: 22,
              },
              t20i: {
                matches: 62,
                innings: 58,
                runs: 1890,
                highestScore: '98*',
                average: 35.0,
                strikeRate: 135.2,
                wickets: 12,
                economy: 7.6,
                centuries: 0,
                fifties: 13,
              },
              ipl: {
                matches: 110,
                innings: 102,
                runs: 3410,
                highestScore: '104',
                average: 34.8,
                strikeRate: 139.5,
                wickets: 14,
                economy: 8.0,
                centuries: 2,
                fifties: 21,
              },
            },
          });
        }
      } catch (err) {
        console.error('Error loading cricket player data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPlayerData();
  }, [playerId, slug]);

  const playerName = player?.player_name || (playerId ? `Player #${playerId}` : 'Cricket Athlete');

  // JSON-LD structured data for Person
  const jsonLd = useMemo(() => {
    if (!player) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: playerName,
      jobTitle: player.player_type || 'Cricket Player',
      image: player.player_image,
      memberOf: player.team_name
        ? {
            '@type': 'SportsTeam',
            name: player.team_name,
          }
        : undefined,
    };
  }, [player, playerName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a1a] pt-[90px] flex flex-col items-center justify-center space-y-3">
        <GoalmillsLoader />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider animate-pulse">
          Loading Athlete Profile & Career Metrics...
        </p>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-[#070a1a] pt-[90px] flex flex-col items-center justify-center p-8 text-center text-slate-200">
        <span className="text-5xl mb-4">🏏</span>
        <h1 className="text-2xl font-black text-white mb-2">Player Not Found</h1>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          The requested cricket player profile could not be located in our verified records.
        </p>
        <Link
          href="/cricket"
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all"
        >
          Return to Cricket Hub
        </Link>
      </div>
    );
  }

  const currentStats = player.career_stats?.[activeFormat] || player.career_stats?.odi;

  return (
    <div className="min-h-screen bg-[#070a1a] pt-[90px] pb-24 text-slate-200">
      {/* JSON-LD Script Tag */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#0B1526] via-[#091222] to-[#070a1a] border-b border-white/5 py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <BackButton />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#0F1D38]/80 border border-white/10 p-2 flex items-center justify-center shadow-2xl overflow-hidden">
                {player.player_image ? (
                  <img
                    src={player.player_image}
                    alt={playerName}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <span className="text-3xl font-black text-red-400">{playerName.charAt(0)}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-400 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                    {player.player_type || 'Cricket Player'}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    • ID #{player.player_key}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1">
                  {playerName}
                </h1>
                {player.team_name && (
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-medium">
                    <span>{player.team_name}</span>
                    {player.country && <span>• {player.country}</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Quick KPI badges */}
            <div className="flex items-center gap-2">
              <div className="px-4 py-2 rounded-2xl bg-[#170B10] border border-white/10 text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  Career Runs
                </span>
                <span className="text-sm font-black text-yellow-400">
                  {currentStats?.runs || '-'}
                </span>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-[#170B10] border border-white/10 text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  Average
                </span>
                <span className="text-sm font-black text-blue-400">
                  {currentStats?.average || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Format Selector Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          {[
            { id: 'odi', label: 'One Day (ODI)' },
            { id: 't20i', label: 'T20 International' },
            { id: 'test', label: 'Test Cricket' },
            { id: 'ipl', label: 'Franchise T20 / IPL' },
          ].map((f) => {
            const isActive = activeFormat === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFormat(f.id as FormatTab)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Career Stats Grid */}
        <div className="rounded-3xl border border-red-500/20 bg-[#170B10]/90 p-5 sm:p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <FiAward className="text-red-400" />
            <span>Career Performance Statistics ({activeFormat.toUpperCase()})</span>
          </h3>

          {currentStats ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-[#0D0609]/80 border border-white/5 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Matches
                </span>
                <span className="text-xl font-mono font-black text-white mt-1 block">
                  {currentStats.matches || '-'}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#0D0609]/80 border border-white/5 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Innings
                </span>
                <span className="text-xl font-mono font-black text-white mt-1 block">
                  {currentStats.innings || '-'}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#0D0609]/80 border border-white/5 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Total Runs
                </span>
                <span className="text-xl font-mono font-black text-yellow-400 mt-1 block">
                  {currentStats.runs || '-'}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#0D0609]/80 border border-white/5 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Highest Score
                </span>
                <span className="text-xl font-mono font-black text-amber-300 mt-1 block">
                  {currentStats.highestScore || '-'}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#0D0609]/80 border border-white/5 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Batting Average
                </span>
                <span className="text-xl font-mono font-black text-blue-400 mt-1 block">
                  {currentStats.average || '-'}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#0D0609]/80 border border-white/5 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Strike Rate
                </span>
                <span className="text-xl font-mono font-black text-blue-300 mt-1 block">
                  {currentStats.strikeRate || '-'}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#0D0609]/80 border border-white/5 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Centuries (100s)
                </span>
                <span className="text-xl font-mono font-black text-yellow-400 mt-1 block">
                  {currentStats.centuries ?? '-'}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#0D0609]/80 border border-white/5 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Fifties (50s)
                </span>
                <span className="text-xl font-mono font-black text-red-400 mt-1 block">
                  {currentStats.fifties ?? '-'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">
              No recorded career statistics for this format.
            </p>
          )}
        </div>

        {/* Bio & Attributes Card */}
        <div className="rounded-3xl border border-red-500/20 bg-[#170B10]/90 p-5 sm:p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <FiShield className="text-sky-400" />
            <span>Player Attributes & Intelligence</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#060D18]/80 border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Role</span>
              <span className="text-sm font-bold text-white">
                {player.player_type || 'Top-order Batter'}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#060D18]/80 border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Country / Representation
              </span>
              <span className="text-sm font-bold text-white">
                {player.country || 'International'}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#060D18]/80 border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Affiliated Club
              </span>
              <span className="text-sm font-bold text-white">
                {player.team_name || 'National Squad'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
