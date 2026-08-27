'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { advancedFootballApi } from '../../../services/advancedFootballApi';
import { FootballPlayer } from '@goalmills/types';
import { BackButton } from '../../../components/BackButton';

export default function PlayerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const playerId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState<FootballPlayer | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!playerId) return;
      try {
        // In a real scenario, use getPlayers with playerId
        // Since mock might return array, we find the specific one
        const res = await advancedFootballApi.getPlayers({ playerId });
        if (res.result && res.result.length > 0) {
          setPlayer(res.result[0]);
        }
      } catch (error) {
        console.error('Error loading player data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [playerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold text-white mb-4">Player Not Found</h1>
        <BackButton className="mt-4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-[90px] pb-20 p-4">
      <div className="max-w-4xl mx-auto glass-card rounded-2xl overflow-hidden animate-fade-in relative">
        {/* Back Button */}
        <BackButton className="absolute top-4 left-4 z-20" />

        {/* Background Gradient */}
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-br from-secondary/20 to-primary/20" />

        <div className="relative pt-12 px-8 flex flex-col md:flex-row items-center md:items-end gap-8 pb-8 border-b border-white/5">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface shadow-xl bg-white/10 shrink-0">
            <img
              src={player.player_image}
              alt={player.player_name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center md:text-left mb-2 flex-1">
            <h1 className="text-4xl font-black text-white mb-2">{player.player_name}</h1>
            <div className="flex items-center justify-center md:justify-start gap-4 text-text-muted">
              <span className="flex items-center gap-2">
                <span className="text-2xl">👕</span> #{player.player_number}
              </span>
              <span className="flex items-center gap-2">
                <span className="text-2xl">🌍</span> {player.player_country || 'Unknown'}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center p-4 bg-surfaceHighlight/30 rounded-xl backdrop-blur-md">
            <span className="text-sm text-text-muted uppercase tracking-wider font-bold">
              Rating
            </span>
            <span className="text-3xl font-black text-accent-green">{player.player_rating}</span>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold text-white mb-4 border-b border-white/5 pb-2">
              Personal Info
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-text-muted">Position</span>
                <span className="text-white font-bold">{player.player_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Age</span>
                <span className="text-white font-bold">{player.player_age}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Team</span>
                <span className="text-white font-bold">{player.team_name}</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-4 border-b border-white/5 pb-2">
              Season Stats
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4 rounded-xl text-center">
                <span className="text-3xl font-black text-secondary">{player.player_goals}</span>
                <p className="text-sm text-text-muted mt-1">Goals</p>
              </div>
              <div className="glass-card p-4 rounded-xl text-center">
                <span className="text-3xl font-black text-blue-400">
                  {player.player_assists || 0}
                </span>
                <p className="text-sm text-text-muted mt-1">Assists</p>
              </div>
              <div className="glass-card p-4 rounded-xl text-center">
                <span className="text-3xl font-black text-white">{player.player_match_played}</span>
                <p className="text-sm text-text-muted mt-1">Matches</p>
              </div>
              <div className="glass-card p-4 rounded-xl text-center">
                <span className="text-3xl font-black text-yellow-400">
                  {player.player_yellow_cards}
                </span>
                <p className="text-sm text-text-muted mt-1">Cards</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
