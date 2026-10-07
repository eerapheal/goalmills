'use client';

import { useState, useEffect, useCallback } from 'react';
import { advancedFootballApi } from '@/services/advancedFootballApi';
import { FootballTeam, FootballTeamsParams } from '@goalmills/types';

export function useTeams(params?: FootballTeamsParams) {
  const [teams, setTeams] = useState<FootballTeam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await advancedFootballApi.getTeams(params);
      const list = Array.isArray(response?.result) ? response.result : [];
      setTeams(list);
    } catch (err: any) {
      console.error('Error fetching teams:', err);
      setError(err?.message || 'Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  }, [params?.leagueId, params?.teamId, params?.teamName]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return { teams, loading, error, refetch: fetchTeams };
}
