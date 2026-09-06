import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EntityService, CLUBS_REGISTRY } from '../../../../../lib/entityService';
import { CoachImage } from '../../../../../components/CoachImage';

const LEAGUE_TABS = [
  { id: 'all', label: 'All Leagues' },
  { id: 'premier-league', label: 'Premier League' },
  { id: 'la-liga', label: 'La Liga' },
  { id: 'serie-a', label: 'Serie A' },
  { id: 'bundesliga', label: 'Bundesliga' },
  { id: 'ligue-1', label: 'Ligue 1' },
];

export default function CoachesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComp, setSelectedComp] = useState('all');
  const [sortBy, setSortBy] = useState<'winRate' | 'trophies' | 'matches'>('winRate');

  const coaches = useMemo(() => EntityService.getAllCoaches(), []);

  // Filter & sort
  const filteredCoaches = useMemo(() => {
    return coaches
      .filter((coach) => {
        const matchesSearch =
          coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          coach.currentClubName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          coach.nationality.toLowerCase().includes(searchQuery.toLowerCase()) ||
          coach.preferredFormation.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesComp =
          selectedComp === 'all' || coach.competitionSlug.toLowerCase() === selectedComp.toLowerCase();

        return matchesSearch && matchesComp;
      })
      .sort((a, b) => {
        if (sortBy === 'trophies') return b.trophiesCount - a.trophiesCount;
        if (sortBy === 'matches') return b.matchesManaged - a.matchesManaged;
        return b.winPercentage - a.winPercentage;
      });
  }, [coaches, searchQuery, selectedComp, sortBy]);

  // Aggregate stats
  const totalTrophies = useMemo(
    () => coaches.reduce((acc, curr) => acc + curr.trophiesCount, 0),
    [coaches]
  );
  const avgWinRate = (
    coaches.reduce((acc, curr) => acc + curr.winPercentage, 0) / Math.max(1, coaches.length)
  ).toFixed(1);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070D18" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>🧑‍💼 Football Managers</Text>
          <Text style={styles.headerSubtitle}>
            {filteredCoaches.length} Elite Tactician{filteredCoaches.length !== 1 ? 's' : ''} Profiled
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Aggregate Ribbon */}
        <View style={styles.ribbonContainer}>
          <View style={styles.ribbonCard}>
            <Text style={styles.ribbonLabel}>MANAGERS</Text>
            <Text style={styles.ribbonValue}>{coaches.length}</Text>
          </View>
          <View style={styles.ribbonCard}>
            <Text style={styles.ribbonLabel}>AVG WIN RATE</Text>
            <Text style={[styles.ribbonValue, { color: '#34D399' }]}>{avgWinRate}%</Text>
          </View>
          <View style={styles.ribbonCard}>
            <Text style={styles.ribbonLabel}>HONOURS</Text>
            <Text style={[styles.ribbonValue, { color: '#FBBF24' }]}>{totalTrophies} 🏆</Text>
          </View>
          <View style={styles.ribbonCard}>
            <Text style={styles.ribbonLabel}>MAIN SYSTEM</Text>
            <Text style={[styles.ribbonValue, { color: '#60A5FA', fontSize: 13 }]}>4-3-3</Text>
          </View>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search manager, club, formation..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </Pressable>
          ) : null}
        </View>

        {/* League Horizontal Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {LEAGUE_TABS.map((tab) => {
            const isActive = selectedComp === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setSelectedComp(tab.id)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                <Text
                  style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Sorting Bar */}
        <View style={styles.sortBar}>
          <Text style={styles.sortLabel}>SORT BY:</Text>
          <View style={styles.sortRow}>
            {[
              { id: 'winRate', label: 'Win %' },
              { id: 'trophies', label: 'Trophies' },
              { id: 'matches', label: 'Matches' },
            ].map((s) => (
              <Pressable
                key={s.id}
                onPress={() => setSortBy(s.id as any)}
                style={[styles.sortButton, sortBy === s.id && styles.sortButtonActive]}
              >
                <Text
                  style={[styles.sortButtonText, sortBy === s.id && styles.sortButtonTextActive]}
                >
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Coaches Cards List */}
        <View style={styles.listContainer}>
          {filteredCoaches.map((coach) => {
            const club = CLUBS_REGISTRY[coach.currentClubSlug];
            return (
              <Pressable
                key={coach.slug}
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => router.push(`/home/football/coaches/${coach.slug}` as any)}
              >
                <View style={styles.cardHeader}>
                  <CoachImage
                    src={coach.photo}
                    name={coach.name}
                    countryFlag={coach.countryFlag}
                    clubLogo={club?.logo}
                    size={58}
                  />
                  <View style={styles.cardHeaderInfo}>
                    <View style={styles.trophyRow}>
                      <View style={styles.trophyBadge}>
                        <Text style={styles.trophyBadgeText}>🏆 {coach.trophiesCount} Honours</Text>
                      </View>
                      <Text style={styles.coachAgeText}>{coach.age} yrs</Text>
                    </View>
                    <Text style={styles.coachName}>{coach.name}</Text>
                    <Text style={styles.coachClubText}>
                      {coach.currentClubName} • {coach.nationality}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#64748B" />
                </View>

                {/* Tactical Setup Pill */}
                <View style={styles.formationRow}>
                  <Text style={styles.formationText} numberOfLines={1}>
                    ⚙️ {coach.preferredFormation}
                  </Text>
                </View>

                {/* Win Percentage Progress Bar */}
                <View style={styles.winRateContainer}>
                  <View style={styles.winRateHeader}>
                    <Text style={styles.winRateLabel}>Career Win Rate</Text>
                    <Text style={styles.winRateValue}>{coach.winPercentage}%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${coach.winPercentage}%` }]} />
                  </View>
                  <View style={styles.winRateFooter}>
                    <Text style={styles.winRateSub}>{coach.matchesManaged} Matches</Text>
                    <Text style={styles.winRateSub}>
                      Draw {coach.drawPercentage}% • Loss {coach.lossPercentage}%
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

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
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#60A5FA',
    marginTop: 1,
  },
  scrollContent: {
    flex: 1,
  },
  ribbonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 8,
  },
  ribbonCard: {
    flex: 1,
    backgroundColor: '#0C1728',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
  },
  ribbonLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.4,
    marginBottom: 2,
    textAlign: 'center',
  },
  ribbonValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C1728',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  chipsScroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#0C1728',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
  },
  sortLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 6,
  },
  sortButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#0C1728',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  sortButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    borderColor: '#3B82F6',
  },
  sortButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  sortButtonTextActive: {
    color: '#60A5FA',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 12,
  },
  card: {
    backgroundColor: '#0B1526',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)',
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  trophyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  coachAgeText: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  coachName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  coachClubText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 1,
  },
  formationRow: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 10,
  },
  formationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#93C5FD',
  },
  winRateContainer: {
    backgroundColor: '#060D18',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  winRateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  winRateLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  winRateValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#34D399',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#0F172A',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  winRateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  winRateSub: {
    fontSize: 9,
    color: '#64748B',
    fontFamily: 'monospace',
  },
});
