'use client';

import { useEffect, useRef } from 'react';
import type { AnalyticsEventMetadata } from '@goalmills/types';

interface UseArticleEngagementProps {
  articleId: string;
  title: string;
  categorySlug?: string;
  sportSlug?: string;
  authorId?: string;
  authorSlug?: string;
  slug?: string;
}

export function useArticleEngagement({
  articleId,
  title,
  categorySlug,
  sportSlug,
  authorId,
  authorSlug,
  slug,
}: UseArticleEngagementProps) {
  const startTimeRef = useRef<number>(Date.now());
  const activeDurationRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);
  const reachedMilestonesRef = useRef<Set<number>>(new Set());

  const metadataRef = useRef<AnalyticsEventMetadata>({
    title,
    categorySlug,
    sportSlug,
    authorId,
    authorSlug,
    url: typeof window !== 'undefined' ? window.location.pathname : '',
  });

  // Keep metadata updated
  metadataRef.current = {
    title,
    categorySlug,
    sportSlug,
    authorId,
    authorSlug,
    url: typeof window !== 'undefined' ? window.location.pathname : '',
  };

  const sendEvent = (
    eventType: 'article_read' | 'scroll_depth' | 'share' | 'video_play',
    extraMeta?: Partial<AnalyticsEventMetadata>
  ) => {
    if (!articleId) return;

    const payload = {
      eventType,
      entityType: 'article',
      entityId: articleId,
      metadata: {
        ...metadataRef.current,
        ...extraMeta,
      },
      timestamp: new Date().toISOString(),
    };

    const endpoint = '/api/analytics/track';

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(endpoint, blob);
    } else {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  };

  useEffect(() => {
    if (!articleId) return;

    startTimeRef.current = Date.now();
    activeDurationRef.current = 0;
    reachedMilestonesRef.current.clear();

    // 1. Initial Page View is tracked by AnalyticsTracker

    // 2. Window Focus / Visibility Change Tracking
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isVisibleRef.current) {
          const now = Date.now();
          activeDurationRef.current += now - startTimeRef.current;
          isVisibleRef.current = false;

          if (activeDurationRef.current > 3000) {
            sendEvent('article_read', {
              durationMs: activeDurationRef.current,
              readTimeMs: activeDurationRef.current,
            });
          }
        }
      } else {
        isVisibleRef.current = true;
        startTimeRef.current = Date.now();
      }
    };

    // 3. Scroll Depth Milestone Tracker
    const handleScroll = () => {
      if (typeof window === 'undefined') return;

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const scrolled = window.scrollY;
      const percentage = Math.min(100, Math.round((scrolled / docHeight) * 100));

      const milestones = [25, 50, 75, 100];
      for (const m of milestones) {
        if (percentage >= m && !reachedMilestonesRef.current.has(m)) {
          reachedMilestonesRef.current.add(m);
          sendEvent('scroll_depth', { scrollPercentage: m });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 4. Teardown / Unmount Flush
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (isVisibleRef.current) {
        const totalDuration = activeDurationRef.current + (Date.now() - startTimeRef.current);
        if (totalDuration > 3000) {
          sendEvent('article_read', {
            durationMs: totalDuration,
            readTimeMs: totalDuration,
          });
        }
      }
    };
  }, [articleId]);

  return {
    trackShare: () => sendEvent('share'),
    trackVideoPlay: () => sendEvent('video_play'),
  };
}
