import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';
import { Ionicons } from '@expo/vector-icons';

interface SponsoredBannerProps {
  placement?: string;
  sport?: string;
  category?: string;
}

export function SponsoredBannerCard({
  placement = 'homepage_hero',
  sport = 'all',
  category = 'vip',
}: SponsoredBannerProps) {
  const [sponsorship, setSponsorship] = useState<any | null>(null);

  useEffect(() => {
    setSponsorship({
      _id: 'default_mobile_sponsor',
      title: 'GoalMills VIP Match & Fantasy Hub',
      sponsorName: 'GoalMills Official',
      badgeText: 'VIP SPONSOR',
      tagline: 'Instant live scores, detailed statistics & tactical match debriefs with verified xG metrics',
      ctaText: 'Claim VIP Match Pass',
      targetUrl: 'https://goalmills.com',
      imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    });
  }, [placement, sport, category]);

  if (!sponsorship) {
    return null;
  }

  const handlePress = () => {
    if (sponsorship.targetUrl) {
      Linking.openURL(sponsorship.targetUrl).catch((err) =>
        console.error('Failed to open sponsor URL:', err)
      );
    }
  };

  return (
    <View style={styles.cardContainer}>
      {/* Background Banner Image */}
      {sponsorship.imageUrl && (
        <View style={styles.bgImageContainer}>
          <Image
            source={{ uri: sponsorship.imageUrl }}
            style={styles.bgImage}
            resizeMode="cover"
          />
          <View style={styles.bgOverlay} />
        </View>
      )}

      {/* Content Column (Flex-Col) */}
      <View style={styles.contentCol}>
        {/* Top Header Badge & Sponsor Name */}
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{sponsorship.badgeText}</Text>
          </View>
          <Text style={styles.sponsorName}>{sponsorship.sponsorName}</Text>
        </View>

        {/* Title & Tagline */}
        <Text style={styles.title}>{sponsorship.title}</Text>
        {sponsorship.tagline && (
          <Text style={styles.tagline} numberOfLines={2}>
            {sponsorship.tagline}
          </Text>
        )}
      </View>

      {/* CTA Button Below Content */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
        style={styles.ctaButton}
        accessibilityRole="button"
        accessibilityLabel={sponsorship.ctaText}
      >
        <Text style={styles.ctaText}>{sponsorship.ctaText}</Text>
        <Ionicons name="open-outline" size={14} color="#0A0E27" style={styles.ctaIcon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    padding: SPACING.md,
    backgroundColor: '#091529',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
  },
  bgImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  bgImage: {
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  bgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7, 14, 26, 0.85)',
  },
  contentCol: {
    zIndex: 1,
    marginBottom: SPACING.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  badge: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  badgeText: {
    color: '#FBBF24',
    fontSize: 9,
    fontWeight: '900',
  },
  sponsorName: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2,
    lineHeight: 18,
  },
  tagline: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },
  ctaButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 4,
  },
  ctaText: {
    color: '#0A0E27',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ctaIcon: {
    marginLeft: 6,
  },
});

export default SponsoredBannerCard;
