'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tennisApi } from '../../../../services/tennisApi';
import { TennisPlayer, TennisEvent } from '@goalmills/types';
import { TennisMatchCard } from '@/components/TennisMatchCard';
import Image from 'next/image';

export default function TennisPlayerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [player, setPlayer] = useState<TennisPlayer | null>(null);
  const [matches, setMatches] = useState<TennisEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!params.id) return;
      try {
        const playerId = Number(params.id);

        // Get Player Info
        const playersRes = await tennisApi.getPlayers({ playerId });
        const foundPlayer = playersRes.result[0];
        setPlayer(foundPlayer || null);

        // Get Recent Matches
        const matchesRes = await tennisApi.getFixtures({
          from: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
          to: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          playerId,
        });
        setMatches(matchesRes.result);
      } catch (error) {
        console.error('Error loading player details:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27] pt-[90px] flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-[#0a0e27] pt-[90px] flex flex-col justify-center items-center text-white">
        <h2 className="text-2xl font-bold mb-4">Player Not Found</h2>
        <button onClick={() => router.back()} className="text-yellow-500 hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const currentStats = player.stats?.[0]; // Get latest season stats

  return (
    <div className="min-h-screen bg-[#0a0e27] pt-[90px] pb-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-bold text-text-muted uppercase tracking-wider">
            Player Profile
          </span>
        </div>

        {/* Player Header Card */}
        <div className="glass-card rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8 border border-white/5">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-500/30 shadow-xl">
            <Image
              src={player.player_logo || 'https://via.placeholder.com/128'}
              alt={player.player_name}
              fill
              sizes="128px"
              priority
              className="object-cover"
            />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-white mb-2">{player.player_name}</h1>
            <p className="text-xl text-yellow-500">{player.player_country}</p>
          </div>
        </div>

        {/* Stats Card */}
        {currentStats && (
          <div className="glass-card rounded-2xl p-6 mb-8 border border-white/5">
            <h2 className="text-2xl font-bold text-white mb-6 pl-2 border-l-4 border-yellow-500">
              {currentStats.season} Stats
            </h2>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <p className="text-3xl font-black text-yellow-500 mb-1">{currentStats.rank}</p>
                <p className="text-xs text-text-muted uppercase tracking-wider">Rank</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <p className="text-3xl font-black text-yellow-500 mb-1">{currentStats.titles}</p>
                <p className="text-xs text-text-muted uppercase tracking-wider">Titles</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <p className="text-3xl font-black text-yellow-500 mb-1">
                  {currentStats.matches_won}/{currentStats.matches_lost}
                </p>
                <p className="text-xs text-text-muted uppercase tracking-wider">W/L</p>
              </div>
            </div>

            {/* Surface Stats */}
            <div className="border-t border-white/5 pt-4">
              <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3">
                Surface Performance
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-xs text-text-muted mb-1">Hard</p>
                  <p className="text-lg font-bold text-white">
                    {currentStats.hard_won}-{currentStats.hard_lost}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-xs text-text-muted mb-1">Clay</p>
                  <p className="text-lg font-bold text-white">
                    {currentStats.clay_won}-{currentStats.clay_lost}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-xs text-text-muted mb-1">Grass</p>
                  <p className="text-lg font-bold text-white">
                    {currentStats.grass_won}-{currentStats.grass_lost}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent & Upcoming Matches */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 pl-2 border-l-4 border-yellow-500">
            🎾 Recent & Upcoming Matches
          </h2>
          {matches.length > 0 ? (
            matches.map((match) => <TennisMatchCard key={match.event_key} match={match} />)
          ) : (
            <div className="glass-card rounded-xl p-8 text-center">
              <p className="text-text-muted italic">No match history found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
