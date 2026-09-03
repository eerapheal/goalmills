import React, { useState, useEffect, useRef } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { goalmillsApi, TenantConfig } from '../services/goalmillsApi';

export function Header() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tenantConfig, setTenantConfig] = useState<TenantConfig | null>(null);

  // Animated notification dot
  const notifDotOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let mounted = true;
    goalmillsApi.getTenantConfig().then((cfg) => {
      if (mounted && cfg) setTenantConfig(cfg);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(notifDotOpacity, { toValue: 0.2, duration: 800, useNativeDriver: true }),
        Animated.timing(notifDotOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [notifDotOpacity]);

  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 24) + 4;
  const brandName = tenantConfig?.settings?.brandName || 'GoalMills';
  const primaryColor = tenantConfig?.settings?.primaryColor || '#3B82F6';
  const accentColor = tenantConfig?.settings?.accentColor || '#6366F1';

  return (
    <View style={[styles.outerContainer, { paddingTop: topPadding }]}>
      <View style={styles.navBar}>
        {/* Brand Logo & Title */}
        <TouchableOpacity
          style={styles.brandContainer}
          onPress={() => router.push('/(tabs)/home')}
          activeOpacity={0.85}
          accessibilityLabel={`${brandName} Home`}
          accessibilityRole="button"
        >
          {/* Logo Frame with Gradient Border */}
          <LinearGradient
            colors={[primaryColor, accentColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGradientBorder}
          >
            <View style={styles.logoInnerContainer}>
              <Image
                source={require('../../assets/icon.png')}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
          </LinearGradient>

          {/* Brand Typography */}
          <View style={styles.brandTextContainer}>
            <View style={styles.brandTitleRow}>
              {brandName.toLowerCase() === 'goalmills' ? (
                <>
                  <Text style={styles.brandGoal}>GOAL</Text>
                  <Text style={styles.brandMills}>MILLS</Text>
                </>
              ) : (
                <Text style={[styles.brandMills, { color: primaryColor }]}>{brandName}</Text>
              )}
            </View>
            <Text style={styles.brandSubtitle}>Live Scores & Sports News</Text>
          </View>
        </TouchableOpacity>

        {/* Right Actions */}
        <View style={styles.rightActions}>
          {/* Search */}
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => router.push('/(tabs)/news')}
            activeOpacity={0.7}
            accessibilityLabel="Search News & Scores"
            accessibilityRole="button"
          >
            <Ionicons name="search" size={13} color="#60A5FA" />
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>

          {/* Notifications Bell */}
          <TouchableOpacity
            style={styles.actionIconButton}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.7}
            accessibilityLabel="Match Alerts & Notifications"
            accessibilityRole="button"
          >
            <Ionicons name="notifications-outline" size={17} color="#60A5FA" />
            <Animated.View style={[styles.notificationDot, { opacity: notifDotOpacity }]} />
          </TouchableOpacity>

          {/* Privacy */}
          <TouchableOpacity
            style={styles.actionIconButton}
            onPress={() => router.push('/privacy')}
            activeOpacity={0.7}
            accessibilityLabel="Data Protection & Privacy"
            accessibilityRole="button"
          >
            <Ionicons name="shield-checkmark-outline" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: '#070D18',
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59, 130, 246, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0C1726',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  logoGradientBorder: {
    width: 34,
    height: 34,
    borderRadius: 9,
    padding: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInnerContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#020617',
    borderRadius: 7.5,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  brandTextContainer: {
    justifyContent: 'center',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandGoal: {
    fontSize: 17,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#38BDF8',
    letterSpacing: -0.3,
  },
  brandMills: {
    fontSize: 17,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginLeft: 1.5,
  },
  brandSubtitle: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginTop: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5.5,
  },
  searchButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#60A5FA',
  },
  actionIconButton: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#0C1726',
  },
});

export default Header;
