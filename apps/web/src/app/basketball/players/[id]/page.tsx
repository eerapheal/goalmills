'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { basketballApi } from '../../../../services/basketballApi';
import Image from 'next/image';
import Link from 'next/link';

export default function BasketballPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        const playerId = parseInt(params.id as string);
        const playersData = await basketballApi.getPlayers({ id: playerId } as any);

        const playerList = playersData.result || playersData || [];
        if (playerList.length > 0) {
          setPlayer(playerList[0]);
        }
      } catch (error) {
        console.error('Error loading player data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlayerData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27] pt-[90px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-[#0a0e27] pt-[90px] flex items-center justify-center">
        <p className="text-white">Player not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] pt-[90px]">
      <div className="max-w-4xl mx-auto p-4">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-text-secondary hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        {/* Player Header */}
        <div className="glass-card rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full bg-white/5 overflow-hidden">
              <Image
                src={player.player_image || 'https://via.placeholder.com/96'}
                alt={player.player_name}
                width={96}
                height={96}
                priority
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{player.player_name}</h1>
              <div className="flex items-center gap-4 text-text-secondary">
                <span>#{player.player_number}</span>
                <span>•</span>
                <span>{player.player_type}</span>
                {player.player_age && (
                  <>
                    <span>•</span>
                    <span>{player.player_age} years</span>
                  </>
                )}
              </div>
              {player.team_name && (
                <Link
                  href={`/basketball/teams/${player.team_key}`}
                  className="inline-block mt-2 text-sm text-yellow-500 hover:text-yellow-400 transition-colors"
                >
                  {player.team_name}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Player Stats */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Season Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {player.player_points_per_game && (
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs text-text-muted mb-1">Points Per Game</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {player.player_points_per_game}
                </p>
              </div>
            )}
            {player.player_rebounds_per_game && (
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs text-text-muted mb-1">Rebounds Per Game</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {player.player_rebounds_per_game}
                </p>
              </div>
            )}
            {player.player_assists_per_game && (
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs text-text-muted mb-1">Assists Per Game</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {player.player_assists_per_game}
                </p>
              </div>
            )}
            {player.player_field_goal_percentage && (
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs text-text-muted mb-1">FG%</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {player.player_field_goal_percentage}%
                </p>
              </div>
            )}
            {player.player_three_point_percentage && (
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs text-text-muted mb-1">3P%</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {player.player_three_point_percentage}%
                </p>
              </div>
            )}
            {player.player_free_throw_percentage && (
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs text-text-muted mb-1">FT%</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {player.player_free_throw_percentage}%
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
