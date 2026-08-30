import goalmillsApi from '../services/goalmillsApi';

export interface MobileAnalyticsEvent {
  eventType: 'page_view' | 'article_read' | 'scroll_depth' | 'video_play' | 'share' | 'search' | 'notification_click';
  entityType?: 'article' | 'category' | 'video' | 'newsletter' | 'sponsorship' | 'page' | 'search';
  entityId?: string;
  metadata?: {
    sportSlug?: string;
    categorySlug?: string;
    authorSlug?: string;
    scrollPercentage?: number;
    durationMs?: number;
    readTimeMs?: number;
    title?: string;
    screenName?: string;
    searchQuery?: string;
  };
}

let eventQueue: MobileAnalyticsEvent[] = [];
let isFlushing = false;

export const mobileAnalytics = {
  /**
   * Tracks a mobile screen transition
   */
  trackScreenView: (screenName: string, metadata?: Record<string, any>) => {
    mobileAnalytics.track({
      eventType: 'page_view',
      entityType: 'page',
      entityId: screenName,
      metadata: {
        screenName,
        title: screenName,
        ...metadata,
      },
    });
  },

  /**
   * Tracks article engagement duration and scroll milestones
   */
  trackArticleEngagement: (
    articleId: string,
    title: string,
    durationMs: number,
    scrollPercentage?: number,
    metadata?: {
      sportSlug?: string;
      categorySlug?: string;
      authorSlug?: string;
    }
  ) => {
    mobileAnalytics.track({
      eventType: 'article_read',
      entityType: 'article',
      entityId: articleId,
      metadata: {
        title,
        durationMs,
        readTimeMs: durationMs,
        scrollPercentage: scrollPercentage || 100,
        ...metadata,
      },
    });
  },

  /**
   * Tracks video highlight play
   */
  trackVideoPlay: (videoId: string, title: string, sportSlug?: string) => {
    mobileAnalytics.track({
      eventType: 'video_play',
      entityType: 'video',
      entityId: videoId,
      metadata: {
        title,
        sportSlug: sportSlug || 'football',
      },
    });
  },

  /**
   * Tracks article or highlight share event
   */
  trackShare: (entityId: string, entityType: 'article' | 'video', title: string) => {
    mobileAnalytics.track({
      eventType: 'share',
      entityType,
      entityId,
      metadata: {
        title,
      },
    });
  },

  /**
   * Tracks search query
   */
  trackSearch: (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    mobileAnalytics.track({
      eventType: 'search',
      entityType: 'search',
      entityId: searchQuery.trim(),
      metadata: {
        searchQuery: searchQuery.trim(),
      },
    });
  },

  /**
   * Tracks sports live match moment or goal alert
   */
  trackLiveMatchMoment: (matchId: string, sport: string, eventType: string, headline: string) => {
    goalmillsApi.trackSportsTelemetry('live_match_moment', {
      matchId,
      sport,
      eventType,
      headline,
      timestamp: new Date().toISOString(),
    }).catch(() => {});
  },

  /**
   * Tracks sponsorship viewability
   */
  trackSponsorshipImpression: (campaignId: string, sponsorName: string, placement: string) => {
    goalmillsApi.trackSportsTelemetry('ad_impression', {
      campaignId,
      sponsorName,
      placement,
      timestamp: new Date().toISOString(),
    }).catch(() => {});
  },

  /**
   * Internal queue & dispatch
   */
  track: (event: MobileAnalyticsEvent) => {
    eventQueue.push(event);

    if (!isFlushing) {
      isFlushing = true;
      setTimeout(() => {
        mobileAnalytics.flush();
      }, 500);
    }
  },

  flush: async () => {
    if (eventQueue.length === 0) {
      isFlushing = false;
      return;
    }

    const batch = [...eventQueue];
    eventQueue = [];

    for (const evt of batch) {
      goalmillsApi
        .trackAnalyticsEvent(
          evt.eventType,
          evt.entityType || 'page',
          evt.entityId || 'mobile_app',
          evt.metadata
        )
        .catch(() => {});
      
      // Also produce stream telemetry
      goalmillsApi
        .trackSportsTelemetry(evt.eventType, {
          entityType: evt.entityType,
          entityId: evt.entityId,
          ...evt.metadata,
        })
        .catch(() => {});
    }

    isFlushing = false;
  },
};

export default mobileAnalytics;

