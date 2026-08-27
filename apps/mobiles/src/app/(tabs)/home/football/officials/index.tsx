import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { advancedFootballApi } from '../../../../../services/advancedFootballApi';
import { FootballOfficial } from '@goalmills/types';

export default function OfficialsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [officials, setOfficials] = useState<FootballOfficial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOfficials();
  }, []);

  const loadOfficials = async () => {
    try {
      const res = await advancedFootballApi.getOfficials();
      setOfficials(res.result);
    } catch (error) {
      console.error('Error loading officials:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOfficials = officials.filter(
    (official) =>
      official.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      official.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.background} />
        </Pressable>
        <Text style={styles.headerTitle}>👨‍⚖️ Match Officials</Text>
        <Text style={styles.headerSubtitle}>
          {filteredOfficials.length} official{filteredOfficials.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Officials List */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {filteredOfficials.map((official, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [styles.officialCard, pressed && styles.pressed]}
          >
            <View style={styles.officialInfo}>
              {official.image ? (
                <Image source={{ uri: official.image }} style={styles.officialImage} />
              ) : (
                <View style={styles.officialInitials}>
                  <Text style={styles.initialsText}>
                    {official.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </Text>
                </View>
              )}
              <View style={styles.officialText}>
                <Text style={styles.officialName}>{official.name}</Text>
                <Text style={styles.officialCountry}>🌍 {official.country}</Text>
              </View>
            </View>
            <View style={styles.officialStats}>
              <View style={styles.statRow}>
                <Text style={styles.statValue}>🎮 {official.matches}</Text>
                <Text style={styles.statLabel}>Matches</Text>
              </View>
              {official.yellowCards !== undefined && (
                <View style={styles.statRow}>
                  <Text style={styles.statValue}>🟨 {official.yellowCards}</Text>
                  <Text style={styles.statLabel}>Yellow</Text>
                </View>
              )}
              {official.redCards !== undefined && (
                <View style={styles.statRow}>
                  <Text style={styles.statValue}>🟥 {official.redCards}</Text>
                  <Text style={styles.statLabel}>Red</Text>
                </View>
              )}
            </View>
          </Pressable>
        ))}

        {filteredOfficials.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No officials found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundDark,
  },
  header: {
    backgroundColor: 'rgba(0, 31, 63, 0.9)',
    padding: SPACING.lg,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.secondary,
    paddingTop: 50,
  },
  backButton: {
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '900',
    color: COLORS.background,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
  },
  officialCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  officialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  officialImage: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.md,
  },
  officialInitials: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  initialsText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.background,
  },
  officialText: {
    flex: 1,
  },
  officialName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.background,
    marginBottom: 2,
  },
  officialCountry: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  officialStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statRow: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
  },
});
