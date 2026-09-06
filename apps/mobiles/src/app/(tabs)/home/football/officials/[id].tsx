import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EntityService, OfficialMeta } from '../../../../../lib/entityService';
import { OfficialImage } from '../../../../../components/OfficialImage';

export default function OfficialDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const official = EntityService.getOfficial(id || '');

  if (!official) {
    return (
      <View style={styles.notFoundContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#F59E0B" />
        <Text style={styles.notFoundTitle}>Match Official Not Found</Text>
        <Pressable onPress={() => router.back()} style={styles.notFoundButton}>
          <Text style={styles.notFoundButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const otherOfficials = EntityService.getAllOfficials()
    .filter((o) => o.slug !== official.slug)
    .slice(0, 4);

  const getStrictnessColors = (rating: OfficialMeta['strictnessRating']) => {
    switch (rating) {
      case 'High-Card Index':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#F87171', border: 'rgba(239, 68, 68, 0.3)' };
      case 'Strict':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#FBBF24', border: 'rgba(245, 158, 11, 0.3)' };
      case 'Balanced':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34D399', border: 'rgba(16, 185, 129, 0.3)' };
      case 'Permissive':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA', border: 'rgba(59, 130, 246, 0.3)' };
      default:
        return { bg: 'rgba(100, 116, 139, 0.15)', text: '#94A3B8', border: 'rgba(100, 116, 139, 0.3)' };
    }
  };

  const strict = getStrictnessColors(official.strictnessRating);
  const totalCards = official.yellowCardsTotal + official.redCardsTotal;
  const yellowPct = Math.round((official.yellowCardsTotal / Math.max(1, totalCards)) * 100);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070D18" />

      {/* Top Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {official.name}
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ─── Hero Profile Card ────────────────────────────────────────── */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <OfficialImage
              src={official.photo}
              name={official.name}
              countryFlag={official.countryFlag}
              size={80}
              style={styles.heroPhoto}
            />
            <View style={styles.heroInfo}>
              <View style={styles.heroBadges}>
                <View
                  style={[
                    styles.strictBadge,
                    { backgroundColor: strict.bg, borderColor: strict.border },
                  ]}
                >
                  <Text style={[styles.strictBadgeText, { color: strict.text }]}>
                    {official.strictnessRating}
                  </Text>
                </View>
                <Text style={styles.fifaTag}>FIFA: {official.fifaBadgeSince}</Text>
              </View>

              <Text style={styles.officialNameLarge}>{official.name}</Text>
              <Text style={styles.officialRoleText}>{official.role}</Text>
              <Text style={styles.officialCountryLarge}>
                {official.country} • {official.age} years old
              </Text>
            </View>
          </View>

          {/* Competitions */}
          <View style={styles.competitionsList}>
            {official.competitions.map((comp) => (
              <View key={comp} style={styles.compBadge}>
                <Text style={styles.compBadgeText}>{comp}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.bioText}>{official.bio}</Text>
        </View>

        {/* ─── Officiating Metrics Dashboard ────────────────────────────── */}
        <Text style={styles.sectionHeading}>OFFICIATING INTELLIGENCE</Text>
        <View style={styles.metricsGridLarge}>
          <View style={styles.metricCard}>
            <Text style={styles.metricCardLabel}>MATCHES</Text>
            <Text style={styles.metricCardValue}>{official.matches}</Text>
            <Text style={styles.metricCardSub}>Career Total</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricCardLabel, { color: '#FBBF24' }]}>🟨 / GAME</Text>
            <Text style={[styles.metricCardValue, { color: '#FBBF24' }]}>
              {official.yellowCardsPerGame}
            </Text>
            <Text style={styles.metricCardSub}>{official.yellowCardsTotal} Total</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricCardLabel, { color: '#F87171' }]}>🟥 / GAME</Text>
            <Text style={[styles.metricCardValue, { color: '#F87171' }]}>
              {official.redCardsPerGame}
            </Text>
            <Text style={styles.metricCardSub}>{official.redCardsTotal} Total</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricCardLabel, { color: '#60A5FA' }]}>FOULS / G</Text>
            <Text style={[styles.metricCardValue, { color: '#60A5FA' }]}>
              {official.foulsPerGame}
            </Text>
            <Text style={styles.metricCardSub}>Tolerance</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricCardLabel, { color: '#C084FC' }]}>PENALTIES</Text>
            <Text style={[styles.metricCardValue, { color: '#C084FC' }]}>
              {official.penaltiesPerGame}
            </Text>
            <Text style={styles.metricCardSub}>{official.penaltiesAwardedTotal} Total</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricCardLabel, { color: '#34D399' }]}>VAR PRECISION</Text>
            <Text style={[styles.metricCardValue, { color: '#34D399' }]}>
              {official.varAccuracy}
            </Text>
            <Text style={styles.metricCardSub}>Confirmed</Text>
          </View>
        </View>

        {/* ─── Disciplinary Breakdown Bar ────────────────────────────────── */}
        <View style={styles.cardBreakdownBox}>
          <View style={styles.cardBreakdownHeader}>
            <Text style={styles.cardBreakdownTitle}>Disciplinary Card Ratio</Text>
            <Text style={styles.cardBreakdownTotal}>{totalCards} Total Cards</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressYellow, { width: `${yellowPct}%` }]} />
            <View style={[styles.progressRed, { width: `${100 - yellowPct}%` }]} />
          </View>
          <View style={styles.progressLegend}>
            <Text style={styles.legendText}>
              🟨 Yellows: {official.yellowCardsTotal} ({yellowPct}%)
            </Text>
            <Text style={styles.legendText}>
              🟥 Reds: {official.redCardsTotal} ({100 - yellowPct}%)
            </Text>
          </View>
        </View>

        {/* ─── Recent Fixture Logs ──────────────────────────────────────── */}
        <Text style={styles.sectionHeading}>RECENT FIXTURE ASSIGNMENTS</Text>
        <View style={styles.logsList}>
          {official.recentMatches.map((match, idx) => (
            <View key={idx} style={styles.logCard}>
              <View style={styles.logTop}>
                <Text style={styles.logComp}>{match.competition}</Text>
                <Text style={styles.logDate}>{match.date}</Text>
              </View>
              <Text style={styles.logFixture}>{match.fixture}</Text>
              <View style={styles.logStats}>
                <Text style={styles.logStatYellow}>🟨 {match.yellowCards} Yellows</Text>
                <Text style={styles.logStatRed}>🟥 {match.redCards} Reds</Text>
                <Text style={styles.logStatPen}>🎯 {match.penalties} Pens</Text>
              </View>
              {match.varDecision ? (
                <View style={styles.varDecisionBox}>
                  <Ionicons name="checkmark-circle" size={14} color="#34D399" />
                  <Text style={styles.varDecisionText}>{match.varDecision}</Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>

        {/* ─── Related Officials ────────────────────────────────────────── */}
        <Text style={styles.sectionHeading}>RELATED ELITE OFFICIALS</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.relatedScroll}
        >
          {otherOfficials.map((ref) => (
            <Pressable
              key={ref.slug}
              onPress={() => router.push(`/home/football/officials/${ref.slug}` as any)}
              style={styles.relatedCard}
            >
              <OfficialImage
                src={ref.photo}
                name={ref.name}
                countryFlag={ref.countryFlag}
                size={44}
              />
              <Text style={styles.relatedName} numberOfLines={1}>
                {ref.name}
              </Text>
              <Text style={styles.relatedYellows}>{ref.yellowCardsPerGame} 🟨/G</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070D18',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#0A1424',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59, 130, 246, 0.15)',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  scrollContent: {
    flex: 1,
  },
  notFoundContainer: {
    flex: 1,
    backgroundColor: '#070D18',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 12,
  },
  notFoundButton: {
    marginTop: 16,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  notFoundButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#070D18',
  },
  heroCard: {
    backgroundColor: '#0B1526',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  heroTop: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
  },
  heroPhoto: {
    borderWidth: 3,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderRadius: 40,
  },
  heroInfo: {
    flex: 1,
  },
  heroBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  strictBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  strictBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  fifaTag: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  officialNameLarge: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  officialRoleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
    marginTop: 1,
  },
  officialCountryLarge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 1,
  },
  competitionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  compBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  compBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  bioText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#94A3B8',
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.8,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  metricsGridLarge: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    gap: 8,
  },
  metricCard: {
    width: '31%',
    backgroundColor: '#0C1728',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  metricCardLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 2,
    textAlign: 'center',
  },
  metricCardValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  metricCardSub: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },
  cardBreakdownBox: {
    backgroundColor: '#0C1728',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  cardBreakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardBreakdownTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cardBreakdownTotal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FBBF24',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#070D18',
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 8,
  },
  progressYellow: {
    backgroundColor: '#FBBF24',
    height: '100%',
  },
  progressRed: {
    backgroundColor: '#EF4444',
    height: '100%',
  },
  progressLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  logsList: {
    marginHorizontal: 16,
    gap: 10,
  },
  logCard: {
    backgroundColor: '#0C1728',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  logTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logComp: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F59E0B',
    textTransform: 'uppercase',
  },
  logDate: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  logFixture: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  logStats: {
    flexDirection: 'row',
    gap: 12,
  },
  logStatYellow: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FBBF24',
  },
  logStatRed: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F87171',
  },
  logStatPen: {
    fontSize: 11,
    fontWeight: '700',
    color: '#60A5FA',
  },
  varDecisionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  varDecisionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#34D399',
  },
  relatedScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  relatedCard: {
    width: 100,
    backgroundColor: '#0C1728',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  relatedName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 6,
    textAlign: 'center',
  },
  relatedYellows: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FBBF24',
    marginTop: 2,
  },
});
