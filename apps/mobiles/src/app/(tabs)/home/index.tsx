import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZES } from '@goalmills/ui';
import { SportType } from '@goalmills/types';
import { SportTabs } from '../../../components/SportTabs';
import { SponsoredBannerCard } from '../../../components/SponsoredBannerCard';
import { AdvancedFootballScreen } from '../../../screens/AdvancedFootballScreen';
import { CricketScreen } from '../../../screens/CricketScreen';
import BasketballScreen from '../../../screens/BasketballScreen';

const COMING_SOON_CONFIG: Record<string, { emoji: string; color: string; accentColor: string }> = {
  tennis: { emoji: '🎾', color: '#10B981', accentColor: '#065F46' },
  baseball: { emoji: '⚾', color: '#F59E0B', accentColor: '#78350F' },
  hockey: { emoji: '🏒', color: '#60A5FA', accentColor: '#1E3A5F' },
};

export default function HomeScreen() {
  const [selectedSport, setSelectedSport] = useState<SportType>('football');

  const renderSportContent = () => {
    switch (selectedSport) {
      case 'football':
        return <AdvancedFootballScreen />;

      case 'cricket':
        return <CricketScreen />;

      case 'basketball':
        return <BasketballScreen />;

      case 'tennis':
      case 'baseball':
      case 'hockey': {
        const cfg = COMING_SOON_CONFIG[selectedSport];
        return (
          <View style={styles.comingSoonContainer}>
            <LinearGradient
              colors={[`${cfg.accentColor}88`, '#080E18']}
              style={styles.comingSoonGradient}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            >
              <View style={[styles.glowOrb, { shadowColor: cfg.color }]} />

              <Text style={styles.comingSoonEmoji}>{cfg.emoji}</Text>

              <View style={[styles.comingSoonBadge, { borderColor: `${cfg.color}60` }]}>
                <View style={[styles.comingSoonDot, { backgroundColor: cfg.color }]} />
                <Text style={[styles.comingSoonBadgeText, { color: cfg.color }]}>
                  COMING SOON
                </Text>
              </View>

              <Text style={styles.comingSoonTitle}>
                {selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)}
              </Text>

              <Text style={styles.comingSoonSubtext}>
                We're working hard to bring you real-time {selectedSport} scores, fixtures, and statistics. Stay tuned!
              </Text>

              <View style={styles.comingSoonFeatures}>
                {['Live Scores', 'Match Stats', 'Standings'].map((f) => (
                  <View key={f} style={styles.featureChip}>
                    <Ionicons name="time-outline" size={11} color="#475569" />
                    <Text style={styles.featureChipText}>{f}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>
        );
      }

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Sport Category Tabs — navigation first */}
      <SportTabs selectedSport={selectedSport} onSelectSport={setSelectedSport} />

      {/* Sponsor Banner — below nav, above content */}
      {/* <SponsoredBannerCard placement="homepage_hero" sport={selectedSport} /> */}

      {/* Sport Content — fills remaining space */}
      <View style={styles.contentContainer}>{renderSportContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080E18',
  },
  contentContainer: {
    flex: 1,
  },
  comingSoonContainer: {
    flex: 1,
  },
  comingSoonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
    position: 'relative',
  },
  glowOrb: {
    position: 'absolute',
    top: '15%',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 80,
    elevation: 0,
  },
  comingSoonEmoji: {
    fontSize: 72,
    marginBottom: 20,
  },
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginBottom: 16,
  },
  comingSoonDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  comingSoonBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  comingSoonTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F1F5F9',
    marginBottom: 12,
    textTransform: 'capitalize',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  comingSoonSubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  comingSoonFeatures: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  featureChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
});
