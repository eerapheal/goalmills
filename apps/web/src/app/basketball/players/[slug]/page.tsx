'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { basketballApi } from '@/services/basketballApi';
import { BasketballPlayer } from '@goalmills/types';
import { GoalmillsLoader } from '@/components/GoalmillsLoader';
import { BackButton } from '@/components/BackButton';
import { extractKeyFromSlug, basketballRoutes, slugify } from '@/lib/slugUtils';
import {
  FiUser,
  FiAward,
  FiActivity,
  FiShield,
  FiTrendingUp,
  FiMapPin,
  FiCalendar,
} from 'react-icons/fi';

export default function BasketballPlayerSlugPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';
  const playerIdStr = extractKeyFromSlug(slug);
  const playerId = parseInt(playerIdStr, 10);

  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState<BasketballPlayer | null>(null);

  useEffect(() => {
    async function loadPlayerData() {
      if (!playerId && !slug) return;
      setLoading(true);
      try {
        const res = await basketballApi.getPlayers(playerId ? { playerId } : {});
        const list = Array.isArray(res?.result) ? res.result : [];
        if (list.length > 0) {
          const found =
            list.find(
              (p) => Number(p.player_key) === playerId || slugify(p.player_name) === slug
            ) || list[0];
          setPlayer(found);
        }
      } catch (err) {
        console.error('Error loading player data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPlayerData();
  }, [playerId, slug]);

  const playerName =
    player?.player_name || (playerId ? `Player #${playerId}` : 'Basketball Athlete');

  // JSON-LD structured data for Person
  const jsonLd = useMemo(() => {
    if (!player) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: playerName,
      jobTitle: player.player_type || 'Basketball Player',
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
          Loading Athlete Profile & Metrics...
        </p>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-[#070a1a] pt-[90px] flex flex-col items-center justify-center p-8 text-center text-slate-200">
        <span className="text-5xl mb-4">🏀</span>
        <h1 className="text-2xl font-black text-white mb-2">Player Not Found</h1>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          The requested player profile could not be loaded.
        </p>
        <Link
          href="/basketball"
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all"
        >
          Return to Basketball Hub
        </Link>
      </div>
    );
  }

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
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#0F1D38]/80 border border-white/10 overflow-hidden flex items-center justify-center shadow-2xl">
                {player.player_image ? (
                  <img
                    src={player.player_image}
                    alt={playerName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-black text-amber-400">
                    {player.player_number ? `#${player.player_number}` : '🏀'}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                    {player.player_type || 'Basketball Athlete'}
                  </span>
                  {player.player_number && (
                    <span className="text-xs text-slate-400 font-mono font-bold">
                      #{player.player_number}
                    </span>
                  )}
                  {player.player_age && (
                    <span className="text-xs text-slate-400">• {player.player_age} years</span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1">
                  {playerName}
                </h1>

                {player.team_name && (
                  <Link
                    href={basketballRoutes.teamFromName(player.team_name, player.team_key)}
                    className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold mt-1.5 transition-colors"
                  >
                    <span>{player.team_name}</span>
                    <span>→</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics Cards */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-3xl bg-[#08142A]/90 border border-blue-500/20 shadow-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Points / Game
            </span>
            <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
              {player.player_points_per_game || player.player_goals || '-'}
            </span>
          </div>

          <div className="p-4 rounded-3xl bg-[#08142A]/90 border border-blue-500/20 shadow-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Rebounds / Game
            </span>
            <span className="text-2xl font-black text-sky-400 font-mono mt-1 block">
              {player.player_rebounds_per_game || player.player_rebounds || '-'}
            </span>
          </div>

          <div className="p-4 rounded-3xl bg-[#08142A]/90 border border-blue-500/20 shadow-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Assists / Game
            </span>
            <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
              {player.player_assists_per_game || player.player_assists || '-'}
            </span>
          </div>

          <div className="p-4 rounded-3xl bg-[#08142A]/90 border border-blue-500/20 shadow-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Games Played
            </span>
            <span className="text-2xl font-black text-purple-400 font-mono mt-1 block">
              {player.player_match_played || '-'}
            </span>
          </div>
        </div>

        {/* Shooting Percentages & Defense */}
        <div className="rounded-3xl border border-blue-500/20 bg-[#08142A]/90 p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <FiActivity className="text-amber-400" />
            <span>Shooting & Defensive Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-[#060D18] border border-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold">Field Goal %</span>
              <span className="text-sm font-black font-mono text-white">
                {player.player_field_goal_percentage || '-'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#060D18] border border-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold">3-Point %</span>
              <span className="text-sm font-black font-mono text-amber-400">
                {player.player_three_point_percentage || '-'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#060D18] border border-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold">Free Throw %</span>
              <span className="text-sm font-black font-mono text-emerald-400">
                {player.player_free_throw_percentage || '-'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#060D18] border border-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold">Blocks</span>
              <span className="text-sm font-black font-mono text-white">
                {player.player_blocks || '-'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#060D18] border border-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold">Steals</span>
              <span className="text-sm font-black font-mono text-white">
                {player.player_steals || '-'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#060D18] border border-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold">Discipline (Fouls)</span>
              <span className="text-sm font-black font-mono text-slate-400">
                {player.player_yellow_cards || '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
