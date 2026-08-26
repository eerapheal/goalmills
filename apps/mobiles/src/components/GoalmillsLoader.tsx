import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { THEME, COLORS } from '@goalmills/ui';

interface GoalmillsLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  label?: string;
  sublabel?: string;
  style?: any;
}

export function GoalmillsLoader({
  size = 'md',
  label = 'GoalMills Live',
  sublabel = 'Syncing real-time sports intelligence...',
  style,
}: GoalmillsLoaderProps) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Continuous rotation for outer radar ring
    const spinAnim = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Continuous pulse for inner core
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.15,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1.0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    spinAnim.start();
    pulseAnim.start();

    return () => {
      spinAnim.stop();
      pulseAnim.stop();
    };
  }, [spinValue, pulseValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const reverseSpin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  // Inline small spinner
  if (size === 'sm') {
    return (
      <View style={[styles.smContainer, style]}>
        <Animated.View style={[styles.smRing, { transform: [{ rotate: spin }] }]} />
        {label ? <Text style={styles.smLabel}>{label}</Text> : null}
      </View>
    );
  }

  const dimensions = {
    md: { outer: 56, core: 28, fontSize: 13, subSize: 11 },
    lg: { outer: 72, core: 36, fontSize: 15, subSize: 12 },
    fullscreen: { outer: 88, core: 44, fontSize: 17, subSize: 13 },
  }[size];

  const content = (
    <View style={[styles.container, style]}>
      {/* Orb Orbit */}
      <View style={{ width: dimensions.outer, height: dimensions.outer, alignItems: 'center', justifyContent: 'center' }}>
        {/* Outer Ring (Electric Blue) */}
        <Animated.View
          style={[
            styles.outerOrbit,
            {
              width: dimensions.outer,
              height: dimensions.outer,
              borderRadius: dimensions.outer / 2,
              transform: [{ rotate: spin }],
            },
          ]}
        />

        {/* Middle Ring (Live Emerald) */}
        <Animated.View
          style={[
            styles.middleOrbit,
            {
              width: dimensions.outer - 12,
              height: dimensions.outer - 12,
              borderRadius: (dimensions.outer - 12) / 2,
              transform: [{ rotate: reverseSpin }],
            },
          ]}
        />

        {/* Core Monogram */}
        <Animated.View
          style={[
            styles.coreMonogram,
            {
              width: dimensions.core,
              height: dimensions.core,
              borderRadius: dimensions.core / 2,
              transform: [{ scale: pulseValue }],
            },
          ]}
        >
          <Text style={styles.coreText}>GM</Text>
          <View style={styles.liveDot} />
        </Animated.View>
      </View>

      {/* Typography */}
      {label ? (
        <View style={styles.textContainer}>
          <Text style={[styles.label, { fontSize: dimensions.fontSize }]}>{label}</Text>
          {sublabel ? (
            <View style={styles.sublabelRow}>
              <View style={styles.pulseDot} />
              <Text style={[styles.sublabel, { fontSize: dimensions.subSize }]}>{sublabel}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );

  if (size === 'fullscreen') {
    return <View style={styles.fullscreenWrapper}>{content}</View>;
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  fullscreenWrapper: {
    flex: 1,
    minHeight: 300,
    backgroundColor: '#0B0F17',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smRing: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderTopColor: '#3B82F6',
    borderRightColor: '#10B981',
  },
  smLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  outerOrbit: {
    position: 'absolute',
    borderWidth: 2.5,
    borderColor: 'transparent',
    borderTopColor: '#3B82F6',
    borderRightColor: 'rgba(59, 130, 246, 0.7)',
  },
  middleOrbit: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'transparent',
    borderBottomColor: '#10B981',
    borderLeftColor: 'rgba(16, 185, 129, 0.7)',
  },
  coreMonogram: {
    backgroundColor: '#0E1726',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  coreText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: -0.5,
  },
  liveDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  textContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  sublabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  pulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  sublabel: {
    color: '#94A3B8',
    fontWeight: '500',
  },
});

export default GoalmillsLoader;
