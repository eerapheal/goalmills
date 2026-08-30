import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>⭐ FAN PASS</Text>
        </View>
        <Text style={styles.title}>Go Ad-Free & Unlock HD Replays</Text>
        <Text style={styles.subtitle}>
          Stream live goals, access 10-year H2H records, and remove all sponsor banners.
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={onUpgradePress}>
        <Text style={styles.buttonText}>UPGRADE ($4.99/MO)</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e1b4b',
    borderColor: '#f59e0b',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  content: {
    marginBottom: 12,
  },
  badge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  badgeText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    backgroundColor: '#f59e0b',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});

export default FanPassBanner;
