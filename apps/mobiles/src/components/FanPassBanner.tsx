import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface FanPassBannerProps {
  currentTier?: string;
  onUpgradePress?: () => void;
}

export const FanPassBanner: React.FC<FanPassBannerProps> = ({
  currentTier = 'free',
  onUpgradePress,
}) => {
  if (currentTier !== 'free') return null;

  return (
    <LinearGradient
      colors={['#1E1B4B', '#0F172A', '#1E1B4B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Decorative corner accent */}
      <View style={styles.accentTopRight} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.badge}>
            <Ionicons name="star" size={9} color="#FBBF24" style={{ marginRight: 3 }} />
            <Text style={styles.badgeText}>FAN PASS</Text>
          </View>
          <View style={styles.priceChip}>
            <Text style={styles.priceText}>$4.99/mo</Text>
          </View>
        </View>

        <Text style={styles.title}>Go Ad-Free & Unlock HD Replays</Text>
        <Text style={styles.subtitle}>
          Stream live goals, access 10-year H2H records, and remove all ads.
        </Text>

        <View style={styles.features}>
          {['Live goal streams', 'No ads ever', '10yr H2H stats'].map((f) => (
            <View key={f} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={12} color="#10B981" />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={onUpgradePress}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#F59E0B', '#D97706']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>UPGRADE NOW</Text>
          <Ionicons name="arrow-forward" size={13} color="#000000" />
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  accentTopRight: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  content: {
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  priceChip: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  priceText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 5,
    letterSpacing: -0.2,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
  },
  button: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonGradient: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  buttonText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});

export default FanPassBanner;
