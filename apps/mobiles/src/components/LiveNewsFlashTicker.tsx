/**
 * LiveNewsFlashTicker – Mobile (React Native / Expo)
 *
 * Fetches 8 randomly selected posts from /api/news/flash every 60 s,
 * renders them as a continuously scrolling horizontal marquee with a
 * pulsing live badge. Tapping any title opens the article via slug URL.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  LayoutChangeEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { goalmillsApi } from '../services/goalmillsApi';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FlashPost {
  _id?: string;
  id?: string;
  slug?: string;
  title: string;
}

interface LiveNewsFlashTickerProps {
  /** Filter posts by sport (passed to /api/news/flash) */
  sport?: string;
  /** Badge label shown before the scrolling titles */
  badgeText?: string;
}

// ─── Fallback data (shown while real data loads) ──────────────────────────────

const FALLBACK_POSTS: FlashPost[] = [
  { id: 'f1', title: 'Champions League Quarterfinal Draw – Blockbuster ties confirmed' },
  { id: 'f2', title: 'Arsenal narrow gap at the top after dramatic North London Derby' },
  { id: 'f3', title: 'Victor Osimhen signs landmark deal with €75M release clause' },
  { id: 'f4', title: 'India retain #1 ICC T20 World Championship ranking spot' },
  { id: 'f5', title: 'NBA Playoffs: Celtics extend lead with dominant road victory' },
  { id: 'f6', title: 'Real Madrid vs Barcelona Tactical Preview – lineups & key battles' },
  { id: 'f7', title: 'IPL 2026 Auction – most expensive buys and surprise inclusions' },
  { id: 'f8', title: 'EuroLeague Final Four Road – Real Madrid vs Panathinaikos analysis' },
];

// ─── Scroll duration per unit width (ms/px) ──────────────────────────────────
const SCROLL_SPEED = 50; // lower = faster
const SEPARATOR = '   •   ';

// ─── Component ────────────────────────────────────────────────────────────────

export function LiveNewsFlashTicker({
  sport,
  badgeText = 'LIVE FLASH',
}: LiveNewsFlashTickerProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<FlashPost[]>(FALLBACK_POSTS);

  // Animation
  const scrollX = useRef(new Animated.Value(0)).current;
  const contentWidth = useRef(0);
  const containerWidth = useRef(0);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const dotOpacity = useRef(new Animated.Value(1)).current;

  // ── Fetch flash posts ────────────────────────────────────────────────────────
  const loadFlash = useCallback(async () => {
    try {
      const data = await goalmillsApi.getFlashNews(sport);
      if (Array.isArray(data) && data.length > 0) {
        setPosts(data);
      }
    } catch {
      // keep fallback
    }
  }, [sport]);

  useEffect(() => {
    loadFlash();
    const interval = setInterval(loadFlash, 60_000);
    return () => clearInterval(interval);
  }, [loadFlash]);

  // ── Pulsing dot animation ────────────────────────────────────────────────────
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, { toValue: 0.2, duration: 600, useNativeDriver: true }),
        Animated.timing(dotOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [dotOpacity]);

  // ── Continuous marquee ───────────────────────────────────────────────────────
  const startScroll = useCallback(
    (cWidth: number, tWidth: number) => {
      if (tWidth === 0 || cWidth === 0) return;
      animRef.current?.stop();
      // We duplicate text so it loops seamlessly; travel = half the total text width
      const travel = tWidth / 2;
      const duration = travel * SCROLL_SPEED;
      scrollX.setValue(0);
      animRef.current = Animated.loop(
        Animated.timing(scrollX, {
          toValue: -travel,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animRef.current.start();
    },
    [scrollX]
  );

  const onContainerLayout = (e: LayoutChangeEvent) => {
    containerWidth.current = e.nativeEvent.layout.width;
    if (contentWidth.current > 0) {
      startScroll(containerWidth.current, contentWidth.current);
    }
  };

  const onContentLayout = (e: LayoutChangeEvent) => {
    contentWidth.current = e.nativeEvent.layout.width;
    if (containerWidth.current > 0) {
      startScroll(containerWidth.current, contentWidth.current);
    }
  };

  // ── Navigate to article ──────────────────────────────────────────────────────
  const handlePress = (post: FlashPost) => {
    const target = post.slug || post.id || post._id;
    if (target) {
      router.push(`/(tabs)/news/${target}` as any);
    }
  };

  // Build the repeated title string for seamless looping
  const duplicatedPosts = [...posts, ...posts];

  return (
    <View style={styles.wrapper}>
      {/* ── Live Badge ── */}
      <View style={styles.badge}>
        <Animated.View style={[styles.dot, { opacity: dotOpacity }]} />
        <Text style={styles.badgeText} numberOfLines={1}>
          ⚡ {badgeText}
        </Text>
      </View>

      {/* ── Scrolling Ticker ── */}
      <View style={styles.tickerTrack} onLayout={onContainerLayout} pointerEvents="box-none">
        <Animated.View
          style={[styles.tickerInner, { transform: [{ translateX: scrollX }] }]}
          onLayout={onContentLayout}
        >
          {duplicatedPosts.map((post, idx) => (
            <Pressable
              key={`${post.id || post._id || idx}-${idx}`}
              onPress={() => handlePress(post)}
              style={styles.item}
            >
              <Text style={styles.title} numberOfLines={1}>
                {post.title}
              </Text>
              <Text style={styles.separator}>{SEPARATOR}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B172B',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(59,130,246,0.25)',
    paddingVertical: 6,
    paddingLeft: 6,
    overflow: 'hidden',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,158,11,0.18)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginRight: 8,
    flexShrink: 0,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#FBBF24',
    marginRight: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FCD34D',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tickerTrack: {
    flex: 1,
    overflow: 'hidden',
  },
  tickerInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F1F5F9',
    maxWidth: 260,
  },
  separator: {
    fontSize: 11,
    color: 'rgba(148,163,184,0.5)',
    fontWeight: '400',
  },
});
