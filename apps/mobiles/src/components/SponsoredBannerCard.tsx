import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@goalmills/ui';

interface SponsoredBannerProps {
  placement?: string;
  sport?: string;
}

export function SponsoredBannerCard({
  placement = 'homepage_hero',
  sport = 'all',
}: SponsoredBannerProps) {
  const [sponsorship, setSponsorship] = useState<any | null>(null);

  useEffect(() => {
    // In mobile, we can fetch from API or display default VIP partner
    // For standalone offline resilience, fallback data is provided
    setSponsorship({
      _id: 'default_mobile_sponsor',
      title: 'GoalMills VIP Match Access',
      sponsorName: 'GoalMills Global',
      badgeText: 'SPONSORED',
      tagline: 'Get instant live scores, statistics & tactical match debriefs',
      ctaText: 'Explore VIP',
      targetUrl: 'https://goalmills.com',
      imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    });
  }, [placement, sport]);

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
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={styles.cardContainer}
    >
      {/* Background Banner Image */}
      {sponsorship.imageUrl && (
        <View style={styles.bgImageContainer}>
          <Image
            source={{ uri: sponsorship.imageUrl }}
            style={styles.bgImage}
            resizeMode="cover"
          />
          {/* Dark High-Contrast Gradient/Overlay */}
          <View style={styles.bgOverlay} />
        </View>
      )}

      <View style={styles.contentRow}>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{sponsorship.badgeText}</Text>
          </View>
          <Text style={styles.sponsorName}>{sponsorship.sponsorName}</Text>
        </View>
        <Text style={styles.title}>{sponsorship.title}</Text>
        {sponsorship.tagline && (
          <Text style={styles.tagline} numberOfLines={1}>
            {sponsorship.tagline}
          </Text>
        )}
      </View>

      <View style={styles.ctaButton}>
        <Text style={styles.ctaText}>{sponsorship.ctaText}</Text>
      </View>
    </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    opacity: 0.35,
  },
  bgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7, 14, 26, 0.75)',
  },
  contentRow: {
    flex: 1,
    marginRight: SPACING.sm,
    zIndex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
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
    fontWeight: '600',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 2,
  },
  tagline: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 2,
  },
  ctaButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  ctaText: {
    color: '#0A0E27',
    fontSize: 11,
    fontWeight: '900',
  },
});

export default SponsoredBannerCard;
