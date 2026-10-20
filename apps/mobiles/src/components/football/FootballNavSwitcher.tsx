import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';

export type MainCategoryTab =
  | 'all'
  | 'CAF'
  | 'top5'
  | 'UEFA'
  | 'FIFA'
  | 'CONMEBOL'
  | 'CONCACAF'
  | 'AFC'
  | 'OFC';

export interface FootballNavSwitcherProps {
  selectedCategory: MainCategoryTab;
  onCategoryChange: (category: MainCategoryTab) => void;
  selectedCountry: string | null;
  onCountryChange: (countryCode: string | null) => void;
  selectedGender: 'all' | 'men' | 'women';
  onGenderChange: (gender: 'all' | 'men' | 'women') => void;
  selectedAgeCategory: 'all' | 'senior' | 'youth';
  onAgeCategoryChange: (age: 'all' | 'senior' | 'youth') => void;
  onResetFilters?: () => void;
}

const CONFED_TABS: { id: MainCategoryTab; label: string; icon: string; badge?: string }[] = [
  { id: 'all', label: 'All Football', icon: '🌐' },
  { id: 'CAF', label: 'Africa (CAF)', icon: '🌍', badge: 'Premier' },
  { id: 'top5', label: 'Top 5 Europe', icon: '⭐' },
  { id: 'UEFA', label: 'Europe (UEFA)', icon: '🏆' },
  { id: 'FIFA', label: 'FIFA (Global)', icon: '🌐' },
  { id: 'CONMEBOL', label: 'South America', icon: '🌎' },
  { id: 'CONCACAF', label: 'North America', icon: '🌎' },
  { id: 'AFC', label: 'Asia (AFC)', icon: '🌏' },
  { id: 'OFC', label: 'Oceania (OFC)', icon: '🌊' },
];

const TOP5_COUNTRIES = [
  { code: 'GB-ENG', name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
];

const AFRICA_PRIORITY_COUNTRIES = [
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
  { code: 'CD', name: 'DR Congo', flag: '🇨🇩' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'CI', name: 'Ivory Coast', flag: '🇨🇮' },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳' },
];

export function FootballNavSwitcher({
  selectedCategory,
  onCategoryChange,
  selectedCountry,
  onCountryChange,
  selectedGender,
  onGenderChange,
  selectedAgeCategory,
  onAgeCategoryChange,
  onResetFilters,
}: FootballNavSwitcherProps) {
  const [filterTrayOpen, setFilterTrayOpen] = useState(false);

  const countries =
    selectedCategory === 'CAF'
      ? AFRICA_PRIORITY_COUNTRIES
      : selectedCategory === 'top5'
      ? TOP5_COUNTRIES
      : [...AFRICA_PRIORITY_COUNTRIES.slice(0, 5), ...TOP5_COUNTRIES];

  const activeFiltersCount =
    (selectedCountry ? 1 : 0) +
    (selectedGender !== 'all' ? 1 : 0) +
    (selectedAgeCategory !== 'all' ? 1 : 0);

  return (
    <View style={styles.container}>
      {/* ── Confederation Navigation Bar ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.confedScroll}
      >
        {CONFED_TABS.map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <Pressable
              key={tab.id}
              style={[styles.confedTab, isActive && styles.confedTabActive]}
              onPress={() => onCategoryChange(tab.id)}
            >
              <Text style={styles.confedIcon}>{tab.icon}</Text>
              <Text style={[styles.confedLabel, isActive && styles.confedLabelActive]}>
                {tab.label}
              </Text>
              {tab.badge && (
                <View style={styles.confedBadge}>
                  <Text style={styles.confedBadgeText}>{tab.badge}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ── Filter Bar Controls (Toggle Tray + Quick Country Pills) ── */}
      <View style={styles.subFilterBar}>
        <Pressable
          style={[styles.filterToggleBtn, filterTrayOpen && styles.filterToggleBtnActive]}
          onPress={() => setFilterTrayOpen(!filterTrayOpen)}
        >
          <Ionicons
            name="options-outline"
            size={14}
            color={filterTrayOpen ? '#3B82F6' : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.filterToggleText,
              filterTrayOpen && { color: '#3B82F6', fontWeight: '700' },
            ]}
          >
            Filters
          </Text>
          {activeFiltersCount > 0 && (
            <View style={styles.filterCountBadge}>
              <Text style={styles.filterCountText}>{activeFiltersCount}</Text>
            </View>
          )}
          <Ionicons
            name={filterTrayOpen ? 'chevron-up' : 'chevron-down'}
            size={12}
            color={COLORS.textSecondary}
            style={{ marginLeft: 2 }}
          />
        </Pressable>

        {/* Quick Country Horizontal Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.countryScroll}
        >
          {countries.map((c) => {
            const isSelected = selectedCountry === c.code;
            return (
              <Pressable
                key={c.code}
                style={[styles.countryPill, isSelected && styles.countryPillActive]}
                onPress={() => onCountryChange(isSelected ? null : c.code)}
              >
                <Text style={styles.countryFlag}>{c.flag}</Text>
                <Text style={[styles.countryName, isSelected && styles.countryNameActive]}>
                  {c.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Expandable Filter Tray ── */}
      {filterTrayOpen && (
        <View style={styles.trayContainer}>
          {/* Gender Filter */}
          <View style={styles.traySection}>
            <Text style={styles.traySectionTitle}>Category</Text>
            <View style={styles.trayPillsRow}>
              {(['all', 'men', 'women'] as const).map((g) => (
                <Pressable
                  key={g}
                  style={[styles.trayPill, selectedGender === g && styles.trayPillActive]}
                  onPress={() => onGenderChange(g)}
                >
                  <Text
                    style={[styles.trayPillText, selectedGender === g && styles.trayPillTextActive]}
                  >
                    {g === 'all' ? 'All Genders' : g === 'men' ? "Men's" : "Women's"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Age Tier Filter */}
          <View style={styles.traySection}>
            <Text style={styles.traySectionTitle}>Tier</Text>
            <View style={styles.trayPillsRow}>
              {(['all', 'senior', 'youth'] as const).map((a) => (
                <Pressable
                  key={a}
                  style={[styles.trayPill, selectedAgeCategory === a && styles.trayPillActive]}
                  onPress={() => onAgeCategoryChange(a)}
                >
                  <Text
                    style={[
                      styles.trayPillText,
                      selectedAgeCategory === a && styles.trayPillTextActive,
                    ]}
                  >
                    {a === 'all' ? 'All Tiers' : a === 'senior' ? 'Senior' : 'Youth / U20'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Reset Filters Bar */}
          {activeFiltersCount > 0 && (
            <View style={styles.trayFooter}>
              <Pressable
                style={styles.resetBtn}
                onPress={() => {
                  onCountryChange(null);
                  onGenderChange('all');
                  onAgeCategoryChange('all');
                  onResetFilters?.();
                }}
              >
                <Ionicons name="refresh-outline" size={13} color="#F43F5E" />
                <Text style={styles.resetBtnText}>Reset Filters</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#070D18',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: SPACING.xs,
  },
  confedScroll: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
    paddingVertical: 4,
  },
  confedTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  confedTabActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3B82F6',
  },
  confedIcon: {
    fontSize: 13,
  },
  confedLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: '#94A3B8',
  },
  confedLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  confedBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.5)',
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  confedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FBBF24',
    textTransform: 'uppercase',
  },
  subFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: 6,
    paddingBottom: 2,
    gap: SPACING.xs,
  },
  filterToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 4,
  },
  filterToggleBtnActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: '#3B82F6',
  },
  filterToggleText: {
    fontSize: FONT_SIZES.xs,
    color: '#94A3B8',
    fontWeight: '600',
  },
  filterCountBadge: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    width: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCountText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  countryScroll: {
    gap: SPACING.xs,
    alignItems: 'center',
  },
  countryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 9,
    paddingVertical: 4,
    gap: 4,
  },
  countryPillActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderColor: '#3B82F6',
  },
  countryFlag: {
    fontSize: 12,
  },
  countryName: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  countryNameActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  trayContainer: {
    backgroundColor: 'rgba(10, 18, 33, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
    marginTop: 4,
  },
  traySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  traySectionTitle: {
    width: 60,
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  trayPillsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    flex: 1,
  },
  trayPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  trayPillActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    borderColor: '#3B82F6',
  },
  trayPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  trayPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  trayFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 4,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  resetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F43F5E',
  },
});
