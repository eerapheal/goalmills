'use client';

import { useState, useEffect, useCallback } from 'react';
import { advancedFootballApi } from '@/services/advancedFootballApi';
import { FootballCoach } from '@goalmills/types';

export function useCoaches() {
  const [coaches, setCoaches] = useState<FootballCoach[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoaches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await advancedFootballApi.getCoaches();
      const list = Array.isArray(response?.result) ? response.result : [];
      setCoaches(list);
    } catch (err: any) {
      console.error('Error fetching coaches:', err);
      setError(err?.message || 'Failed to fetch coaches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoaches();
  }, [fetchCoaches]);

  return { coaches, loading, error, refetch: fetchCoaches };
}
