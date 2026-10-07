'use client';

import { useState, useEffect, useCallback } from 'react';
import { advancedFootballApi } from '@/services/advancedFootballApi';
import { FootballPlayer, FootballPlayersParams } from '@goalmills/types';

export function usePlayers(params?: FootballPlayersParams) {
  const [players, setPlayers] = useState<FootballPlayer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await advancedFootballApi.getPlayers(params);
      const list = Array.isArray(response?.result) ? response.result : [];
      setPlayers(list);
    } catch (err: any) {
      console.error('Error fetching players:', err);
      setError(err?.message || 'Failed to fetch players');
    } finally {
      setLoading(false);
    }
  }, [params?.leagueId, params?.teamId, params?.playerId, params?.playerName]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  return { players, loading, error, refetch: fetchPlayers };
}
