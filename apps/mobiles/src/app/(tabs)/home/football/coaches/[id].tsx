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
import { EntityService, CLUBS_REGISTRY } from '../../../../../lib/entityService';
import { CoachImage } from '../../../../../components/CoachImage';

export default function CoachDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const coach = EntityService.getCoach(id || '');

  if (!coach) {
    return (
      <View style={styles.notFoundContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#3B82F6" />
        <Text style={styles.notFoundTitle}>Football Manager Not Found</Text>
        <Pressable onPress={() => router.back()} style={styles.notFoundButton}>
          <Text style={styles.notFoundButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const club = CLUBS_REGISTRY[coach.currentClubSlug];
  const otherCoaches = EntityService.getAllCoaches()
    .filter((c) => c.slug !== coach.slug)
    .slice(0, 4);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070D18" />

      {/* Top Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {coach.name}
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ─── Hero Profile Card ────────────────────────────────────────── */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <CoachImage
              src={coach.photo}
              name={coach.name}
              countryFlag={coach.countryFlag}
              clubLogo={club?.logo}
              size={84}
            />
            <View style={styles.heroInfo}>
              <View style={styles.trophyBadgeRow}>
                <View style={styles.trophyBadge}>
                  <Text style={styles.trophyBadgeText}>🏆 {coach.trophiesCount} Major Honours</Text>
                </View>
              </View>

              <Text style={styles.coachNameLarge}>{coach.name}</Text>
              <Text style={styles.coachClubLarge}>{coach.currentClubName}</Text>
              <Text style={styles.coachMetaLarge}>
                {coach.nationality} • {coach.age} years old
              </Text>
            </View>
          </View>

          {/* Preferred Formation Pill */}
          <View style={styles.formationBox}>
            <Text style={styles.formationBoxTitle}>⚙️ Preferred Tactical Formation:</Text>
            <Text style={styles.formationBoxValue}>{coach.preferredFormation}</Text>
          </View>

          <Text style={styles.bioText}>{coach.bio}</Text>
        </View>

        {/* ─── Managerial Record Dashboard ──────────────────────────────── */}
        <Text style={styles.sectionHeading}>MANAGERIAL RECORD</Text>
        <View style={styles.recordGrid}>
          <View style={styles.recordCard}>
            <Text style={styles.recordCardLabel}>MATCHES</Text>
            <Text style={styles.recordCardValue}>{coach.matchesManaged}</Text>
            <Text style={styles.recordCardSub}>Total Games</Text>
          </View>
          <View style={styles.recordCard}>
            <Text style={[styles.recordCardLabel, { color: '#34D399' }]}>WIN RATE</Text>
            <Text style={[styles.recordCardValue, { color: '#34D399' }]}>
              {coach.winPercentage}%
            </Text>
            <Text style={styles.recordCardSub}>
              ~{Math.round((coach.matchesManaged * coach.winPercentage) / 100)} Wins
            </Text>
          </View>
          <View style={styles.recordCard}>
            <Text style={[styles.recordCardLabel, { color: '#FBBF24' }]}>DRAW RATE</Text>
            <Text style={[styles.recordCardValue, { color: '#FBBF24' }]}>
              {coach.drawPercentage}%
            </Text>
            <Text style={styles.recordCardSub}>
              ~{Math.round((coach.matchesManaged * coach.drawPercentage) / 100)} Draws
            </Text>
          </View>
          <View style={styles.recordCard}>
            <Text style={[styles.recordCardLabel, { color: '#C084FC' }]}>HONOURS</Text>
            <Text style={[styles.recordCardValue, { color: '#C084FC' }]}>
              {coach.trophiesCount}
            </Text>
            <Text style={styles.recordCardSub}>Trophies</Text>
          </View>
        </View>

        {/* ─── Tactical Philosophy ──────────────────────────────────────── */}
        <View style={styles.philosophyBox}>
          <View style={styles.philosophyHeader}>
            <Ionicons name="compass-outline" size={16} color="#60A5FA" />
            <Text style={styles.philosophyTitle}>Tactical Philosophy & Style</Text>
          </View>
          <Text style={styles.philosophyContent}>{coach.coachingStyle}</Text>

          {/* Record Split Bar */}
          <View style={styles.ratioBar}>
            <View style={[styles.ratioWin, { width: `${coach.winPercentage}%` }]} />
            <View style={[styles.ratioDraw, { width: `${coach.drawPercentage}%` }]} />
            <View style={[styles.ratioLoss, { width: `${coach.lossPercentage}%` }]} />
          </View>
          <View style={styles.ratioLegend}>
            <Text style={styles.legendText}>Win {coach.winPercentage}%</Text>
            <Text style={styles.legendText}>Draw {coach.drawPercentage}%</Text>
            <Text style={styles.legendText}>Loss {coach.lossPercentage}%</Text>
          </View>
        </View>

        {/* ─── Trophy Cabinet ───────────────────────────────────────────── */}
        <Text style={styles.sectionHeading}>TROPHY CABINET & MAJOR HONOURS</Text>
        <View style={styles.trophyGrid}>
          {coach.majorHonours.map((honour, idx) => (
            <View key={idx} style={styles.trophyCard}>
              <Text style={styles.trophyEmoji}>🏆</Text>
              <Text style={styles.trophyName}>{honour}</Text>
            </View>
          ))}
        </View>

        {/* ─── Career Club Timeline ─────────────────────────────────────── */}
        <Text style={styles.sectionHeading}>CAREER CLUB TIMELINE</Text>
        <View style={styles.timelineList}>
          {coach.careerClubs.map((c, idx) => (
            <View key={idx} style={styles.timelineCard}>
              <View>
                <Text style={styles.timelineClub}>{c.club}</Text>
                <Text style={styles.timelineYears}>
                  {c.years} • {c.matches} Matches
                </Text>
              </View>
              <View style={styles.winBadge}>
                <Text style={styles.winBadgeText}>{c.winRate} Win</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ─── Related Managers ─────────────────────────────────────────── */}
        <Text style={styles.sectionHeading}>RELATED ELITE MANAGERS</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.relatedScroll}
        >
          {otherCoaches.map((c) => (
            <Pressable
              key={c.slug}
              onPress={() => router.push(`/home/football/coaches/${c.slug}` as any)}
              style={styles.relatedCard}
            >
              <CoachImage
                src={c.photo}
                name={c.name}
                countryFlag={c.countryFlag}
                size={44}
              />
              <Text style={styles.relatedName} numberOfLines={1}>
                {c.name}
              </Text>
              <Text style={styles.relatedStats}>
                {c.trophiesCount} 🏆 • {c.winPercentage}%
              </Text>
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
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  notFoundButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroCard: {
    backgroundColor: '#0B1526',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
  },
  heroTop: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
  },
  heroInfo: {
    flex: 1,
  },
  trophyBadgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  trophyBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  trophyBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FBBF24',
  },
  coachNameLarge: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  coachClubLarge: {
    fontSize: 13,
    fontWeight: '800',
    color: '#60A5FA',
    marginTop: 1,
  },
  coachMetaLarge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 1,
  },
  formationBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 12,
  },
  formationBoxTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  formationBoxValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#93C5FD',
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
  recordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    gap: 8,
  },
  recordCard: {
    width: '48.5%',
    backgroundColor: '#0C1728',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  recordCardLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 2,
  },
  recordCardValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  recordCardSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  philosophyBox: {
    backgroundColor: '#0C1728',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  philosophyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  philosophyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#60A5FA',
  },
  philosophyContent: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 12,
  },
  ratioBar: {
    height: 8,
    backgroundColor: '#070D18',
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 6,
  },
  ratioWin: {
    backgroundColor: '#10B981',
    height: '100%',
  },
  ratioDraw: {
    backgroundColor: '#FBBF24',
    height: '100%',
  },
  ratioLoss: {
    backgroundColor: '#EF4444',
    height: '100%',
  },
  ratioLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  trophyGrid: {
    marginHorizontal: 16,
    gap: 8,
  },
  trophyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C1728',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 10,
  },
  trophyEmoji: {
    fontSize: 16,
  },
  trophyName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  timelineList: {
    marginHorizontal: 16,
    gap: 8,
  },
  timelineCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0C1728',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  timelineClub: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  timelineYears: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  winBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  winBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#34D399',
  },
  relatedScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  relatedCard: {
    width: 105,
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
  relatedStats: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FBBF24',
    marginTop: 2,
  },
});
