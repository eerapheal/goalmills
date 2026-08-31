import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SPACING, BORDER_RADIUS } from '@goalmills/ui';
import { goalmillsApi } from '../services/goalmillsApi';
import { getNewsTarget, slugify } from '../utils/slugUtils';

export interface PulseItem {
  id?: string;
  _id?: string;
  slug?: string;
  tag: string;
  title: string;
  time: string;
}

interface PulseNewsTickerProps {
  sport?: 'football' | 'cricket' | 'basketball' | 'all';
  pulseLabel?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  fallbackNews?: PulseItem[];
}

export function PulseNewsTicker({
  sport = 'football',
  pulseLabel,
  actionLabel,
  onActionPress,
  fallbackNews,
}: PulseNewsTickerProps) {
  const router = useRouter();
  const [tickerIndex, setTickerIndex] = useState(0);
  const activePulseLabel = pulseLabel || `${sport.toUpperCase()} PULSE`;

  const defaultFallbacks: Record<string, PulseItem[]> = {
    football: [
      { id: 'football-1', slug: 'victor-osimhen-signs-landmark-deal', tag: 'TRANSFER', title: 'Victor Osimhen signs landmark deal with €75M release clause', time: '10m ago' },
      { id: 'football-2', slug: 'champions-league-quarterfinal-draw', tag: 'UCL', title: 'Champions League Quarterfinal Draw announced: Blockbuster ties set', time: '25m ago' },
      { id: 'football-3', slug: 'arsenal-narrow-gap-north-london-derby', tag: 'EPL', title: 'Arsenal narrow gap at top of table after dramatic North London Derby', time: '1h ago' },
      { id: 'football-4', slug: 'real-madrid-vs-barcelona-tactical-preview', tag: 'EL CLÁSICO', title: 'Real Madrid vs Barcelona: Tactical team news and predicted lineups', time: '2h ago' },
      { id: 'football-5', slug: 'caf-confirms-host-venues-afcon', tag: 'AFCON', title: 'CAF confirms host venues and official tournament schedule for 2025/26', time: '3h ago' },
    ],
    cricket: [
      { id: 'cricket-1', slug: 'powerplay-analytics-boundary-percentages', tag: 'IPL 2026', title: 'Powerplay Analytics: Boundary percentages soar past 210 strike rate', time: '15m ago' },
      { id: 'cricket-2', slug: 'india-retain-icc-t20-world-ranking', tag: 'ICC RANKINGS', title: 'India retain #1 spot in ICC T20 World Championship rankings', time: '40m ago' },
      { id: 'cricket-3', slug: 'australia-announce-15-man-squad', tag: 'T20 CUP', title: 'Australia announce 15-man squad with surprise pace bowling inclusions', time: '1h ago' },
      { id: 'cricket-4', slug: 'perth-scorchers-vs-sydney-sixers', tag: 'BBL', title: 'Perth Scorchers vs Sydney Sixers: Tactical pitch report and keys to victory', time: '3h ago' },
      { id: 'cricket-5', slug: 'wpl-playoffs-set-high-drama', tag: 'WOMEN', title: 'WPL playoffs set: High drama expected in knockout semifinals', time: '5h ago' },
    ],
    basketball: [
      { id: 'hoops-1', slug: 'clutch-shooting-metrics-fourth-quarter', tag: 'NBA PLAYOFFS', title: 'Clutch Shooting Metrics: Fourth-quarter defensive ratings analysis', time: '10m ago' },
      { id: 'hoops-2', slug: 'lakers-exploring-perimeter-shooter-deals', tag: 'TRADE WIRE', title: 'Lakers exploring perimeter shooter deals ahead of trade deadline', time: '30m ago' },
      { id: 'hoops-3', slug: 'real-madrid-vs-panathinaikos-tactical-breakdown', tag: 'EUROLEAGUE', title: 'Real Madrid vs Panathinaikos: Full tactical breakdown and star matchups', time: '1h ago' },
      { id: 'hoops-4', slug: 'celtics-extend-eastern-conference-lead', tag: 'NBA', title: 'Celtics extend Eastern Conference lead with dominant road victory', time: '2h ago' },
      { id: 'hoops-5', slug: 'new-expansion-team-rosters-draft-lottery', tag: 'WNBA', title: 'New expansion team rosters and official draft lottery schedule set', time: '4h ago' },
    ],
    all: [
      { id: 'live-1', slug: 'mbappe-to-real-madrid-contract-signing', tag: 'TRANSFER', title: 'Mbappe to Real Madrid: Behind the scenes of landmark contract signing', time: '10m ago' },
      { id: 'live-2', slug: 'arsenal-narrow-gap-at-top-of-table', tag: 'EPL', title: 'Arsenal narrow gap at top of table after dramatic North London Derby', time: '25m ago' },
      { id: 'live-3', slug: 'lakers-rally-in-4th-quarter-against-celtics', tag: 'NBA', title: 'Lakers rally in 4th quarter against Celtics in historic thriller', time: '1h ago' },
      { id: 'live-4', slug: 'india-set-343-target-icc-clash', tag: 'CRICKET', title: 'India set 343 target in ICC Champions Trophy clash', time: '2h ago' },
    ],
  };

  const initialItems = fallbackNews && fallbackNews.length > 0
    ? fallbackNews
    : (defaultFallbacks[sport] || defaultFallbacks.all);

  const [newsList, setNewsList] = useState<PulseItem[]>(initialItems);

  useEffect(() => {
    let isMounted = true;
    async function fetchLiveNews() {
      try {
        const queryParams: any = { limit: 8 };
        if (sport !== 'all') {
          queryParams.sport = sport;
        }
        const data = await goalmillsApi.getNews(queryParams);
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const mapped: PulseItem[] = data.map((item: any) => ({
            id: item._id || item.id,
            _id: item._id || item.id,
            slug: item.slug || slugify(item.title) || item._id,
            tag: (item.competition || item.category || item.tags?.[0] || sport.toUpperCase()).toUpperCase(),
            title: item.title,
            time: item.createdAt
              ? `${Math.max(1, Math.floor((Date.now() - new Date(item.createdAt).getTime()) / 3600000))}h ago`
              : 'Recent',
          }));
          setNewsList(mapped);
        }
      } catch (err) {
        console.warn('Failed to load pulse news for ' + sport, err);
      }
    }
    fetchLiveNews();
    return () => {
      isMounted = false;
    };
  }, [sport]);

  useEffect(() => {
    if (newsList.length <= 1) return;
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % newsList.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [newsList.length]);

  const currentItem = newsList[tickerIndex] || newsList[0];

  const handleNewsPress = () => {
    const target = getNewsTarget(currentItem);
    if (target) {
      router.push({
        pathname: '/(tabs)/news/[id]',
        params: { id: target },
      } as any);
    } else {
      router.push('/(tabs)/news' as any);
    }
  };

  return (
    <View style={styles.tickerContainer}>
      {/* Pulse Badge */}
      <View style={styles.pulseBadge}>
        <View style={styles.pulseDot} />
        <Text style={styles.pulseText}>{activePulseLabel}</Text>
      </View>

      {/* Ticker Headline & Tag */}
      <Pressable style={styles.newsContent} onPress={handleNewsPress}>
        <View style={styles.tagBadge}>
          <Text style={styles.tagText} numberOfLines={1}>
            {currentItem?.tag || 'LIVE'}
          </Text>
        </View>
        <Text style={styles.titleText} numberOfLines={1}>
          {currentItem?.title}
        </Text>
        <Text style={styles.timeText}>• {currentItem?.time}</Text>
      </Pressable>

      {/* Action Button (Optional) */}
      {actionLabel && onActionPress && (
        <Pressable style={styles.actionBtn} onPress={onActionPress}>
          <Text style={styles.actionBtnText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B172B',
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginHorizontal: SPACING.sm,
    marginBottom: 4,
    minHeight: 28,
  },
  pulseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    marginRight: 5,
  },
  pulseDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#60A5FA',
    marginRight: 3,
  },
  pulseText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#60A5FA',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  newsContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    marginRight: 4,
  },
  tagBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 3,
    paddingVertical: 1,
    marginRight: 4,
    maxWidth: 55,
  },
  tagText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#93C5FD',
    textTransform: 'uppercase',
  },
  titleText: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: '#F8FAFC',
    marginRight: 3,
  },
  timeText: {
    fontSize: 8.5,
    color: '#64748B',
    fontWeight: '600',
  },
  actionBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  actionBtnText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#93C5FD',
    textTransform: 'uppercase',
  },
});
