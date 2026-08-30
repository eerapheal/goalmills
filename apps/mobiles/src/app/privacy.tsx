import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '@goalmills/ui';

export default function PrivacyScreen() {
  const router = useRouter();

  const openWebUrl = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Error opening URL:', err));
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar / Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Data Safety & Privacy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Badge & Title */}
        <View style={styles.badgeContainer}>
          <Ionicons name="shield-checkmark" size={16} color="#10b981" />
          <Text style={styles.badgeText}>Google Play &amp; Global Compliance</Text>
        </View>

        <Text style={styles.mainTitle}>GoalMills Privacy &amp; Data Safety</Text>
        <Text style={styles.subtitle}>
          We are committed to full transparency regarding what data is collected, how it is secured,
          and your rights over your data.
        </Text>

        {/* Highlight Cards */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="lock-closed" size={20} color="#4f9bff" />
            <Text style={styles.cardTitle}>Encrypted in Transit</Text>
          </View>
          <Text style={styles.cardText}>
            All network communication between the GoalMills app, servers, and third-party APIs is
            encrypted using industry-standard HTTPS/TLS protocols.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="eye-off" size={20} color="#10b981" />
            <Text style={styles.cardTitle}>Zero Sensitive Tracking</Text>
          </View>
          <Text style={styles.cardText}>
            GoalMills does <Text style={styles.bold}>NOT</Text> track your GPS location, access your
            contacts, collect financial details, or record audio. Basic sports scores and highlights
            require no personal data.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="logo-youtube" size={20} color="#ef4444" />
            <Text style={styles.cardTitle}>Third-Party Video Highlights</Text>
          </View>
          <Text style={styles.cardText}>
            Our match video highlights are delivered via YouTube API Services. By viewing
            highlights, you acknowledge the{' '}
            <Text
              style={styles.linkText}
              onPress={() => openWebUrl('https://www.youtube.com/t/terms')}
            >
              YouTube Terms of Service
            </Text>{' '}
            and the{' '}
            <Text
              style={styles.linkText}
              onPress={() => openWebUrl('https://policies.google.com/privacy')}
            >
              Google Privacy Policy
            </Text>
            .
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="trash-bin" size={20} color="#f59e0b" />
            <Text style={styles.cardTitle}>Data Deletion &amp; Account Control</Text>
          </View>
          <Text style={styles.cardText}>
            You have the right to request permanent deletion of your account credentials,
            preferences, and all associated personal data at any time.
          </Text>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => openWebUrl('https://goalmills-web.vercel.app/data-deletion')}
          >
            <Ionicons name="open-outline" size={16} color="#fff" />
            <Text style={styles.secondaryButtonText}>View Data Deletion Instructions</Text>
          </TouchableOpacity>
        </View>

        {/* Data Types Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionHeading}>Data Categories Handled</Text>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Account Data</Text>
            <Text style={styles.dataValue}>Username &amp; Email (Only if registered)</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>In-App Activity</Text>
            <Text style={styles.dataValue}>Saved Favorite Teams &amp; Preferences</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>App Diagnostics</Text>
            <Text style={styles.dataValue}>Crash logs &amp; performance metrics</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Push Tokens</Text>
            <Text style={styles.dataValue}>Only if opted in for match alerts</Text>
          </View>
        </View>

        {/* Web Links & Actions */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => openWebUrl('https://goalmills-web.vercel.app/privacy-policy')}
          >
            <Ionicons name="globe-outline" size={18} color="#fff" />
            <Text style={styles.primaryButtonText}>Read Full Official Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() => openWebUrl('mailto:privacy@goalmills.com')}
          >
            <Ionicons name="mail-outline" size={18} color="#4f9bff" />
            <Text style={styles.outlineButtonText}>Contact Data Protection Team</Text>
          </TouchableOpacity>
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>GoalMills • Version 1.0.0 (Play Store Edition)</Text>
          <Text style={styles.footerText}>Last Policy Revision: April 2026</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001224',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : 12,
    paddingBottom: 12,
    backgroundColor: '#001f3f',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: 12,
    marginTop: 8,
  },
  badgeText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  cardText: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 19,
  },
  bold: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
  linkText: {
    color: '#4f9bff',
    textDecorationLine: 'underline',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  secondaryButtonText: {
    color: '#fbbf24',
    fontSize: 13,
    fontWeight: '600',
  },
  summarySection: {
    backgroundColor: 'rgba(0, 31, 63, 0.6)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 155, 255, 0.2)',
    marginTop: 8,
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  dataLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  dataValue: {
    fontSize: 13,
    color: '#e2e8f0',
    fontWeight: '600',
    maxWidth: '55%',
    textAlign: 'right',
  },
  actionSection: {
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'transparent',
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(79, 155, 255, 0.5)',
  },
  outlineButtonText: {
    color: '#4f9bff',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    color: '#64748b',
  },
});
