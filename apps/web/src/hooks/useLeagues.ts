'use client';

import { useState, useEffect, useCallback } from 'react';
import { advancedFootballApi } from '@/services/advancedFootballApi';
import { FootballLeague } from '@goalmills/types';
import { sortByLeagueRanking, getLeaguePriority } from '@/lib/football/leagueRanking';

// Module-level cache so components share leagues without duplicate network fetches
let cachedLeagues: FootballLeague[] | null = null;
let fetchPromise: Promise<FootballLeague[]> | null = null;

export function useLeagues() {
  const [leagues, setLeagues] = useState<FootballLeague[]>(cachedLeagues || []);
  const [loading, setLoading] = useState<boolean>(!cachedLeagues);
  const [error, setError] = useState<string | null>(null);

  const fetchLeagues = useCallback(async (force = false) => {
    if (!force && cachedLeagues) {
      setLeagues(cachedLeagues);
      setLoading(false);
      return;
    }

    if (!fetchPromise || force) {
      fetchPromise = (async () => {
        const response = await advancedFootballApi.getLeagues();
        const raw = Array.isArray(response?.result) ? response.result : [];
        const sorted = sortByLeagueRanking(raw);
        cachedLeagues = sorted;
        return sorted;
      })();
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchPromise;
      setLeagues(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch leagues');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeagues();
  }, [fetchLeagues]);

  return { leagues, loading, error, refetch: () => fetchLeagues(true) };
}
