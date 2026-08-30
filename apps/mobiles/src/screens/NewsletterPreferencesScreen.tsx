import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import goalmillsApi from '../services/goalmillsApi';

export function NewsletterPreferencesScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [sports, setSports] = useState<string[]>(['football', 'cricket', 'basketball']);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [breakingAlerts, setBreakingAlerts] = useState(true);
  const [transfersOnly, setTransfersOnly] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const loadPreferences = async () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your subscriber email address.');
      return;
    }
    try {
      setLoading(true);
      const data = await goalmillsApi.getNewsletterPreferences(email.trim());
      if (data && data.preferences) {
        setSports(data.preferences.sports || ['football']);
        setFrequency(data.preferences.frequency || 'daily');
        setBreakingAlerts(data.preferences.breakingAlerts !== false);
        setTransfersOnly(data.preferences.transfersOnly === true);
        setIsPaused(data.preferences.isPaused === true);
        Alert.alert('Loaded', 'Preferences retrieved for ' + email);
      } else {
        Alert.alert('Notice', 'No existing subscriber profile found for ' + email);
      }
    } catch (err) {
      Alert.alert('Error', 'Unable to fetch preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email to save preferences.');
      return;
    }

    try {
      setSaving(true);
      const success = await goalmillsApi.updateNewsletterPreferences({
        email: email.trim(),
        preferences: {
          sports,
          frequency,
          breakingAlerts,
          transfersOnly,
          isPaused,
        },
      });

      if (success) {
        Alert.alert('Success', 'Newsletter & alert preferences updated successfully!');
      } else {
        Alert.alert('Error', 'Failed to save preferences. Please check your network connection.');
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const toggleSport = (sportId: string) => {
    if (sports.includes(sportId)) {
      if (sports.length === 1) return;
      setSports(sports.filter((s) => s !== sportId));
    } else {
      setSports([...sports, sportId]);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.iconCircle}>
          <Ionicons name="mail" size={24} color="#0F172A" />
        </View>
        <Text style={styles.title}>Newsletter Preferences</Text>
        <Text style={styles.subtitle}>
          Customize your sports digest, delivery frequency, and breaking alerts.
        </Text>
      </View>

      {/* Email Input */}
      <View style={styles.card}>
        <Text style={styles.label}>Subscriber Email Address</Text>
        <View style={styles.emailRow}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="fan@goalmills.com"
            placeholderTextColor="#64748B"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.loadButton}
            onPress={loadPreferences}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0F172A" size="small" />
            ) : (
              <Text style={styles.loadButtonText}>Load</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Sports Categories */}
      <View style={styles.card}>
        <Text style={styles.label}>Selected Sports Coverage</Text>
        <View style={styles.sportGrid}>
          {[
            { id: 'football', label: '⚽ Football' },
            { id: 'cricket', label: '🏏 Cricket' },
            { id: 'basketball', label: '🏀 Basketball' },
            { id: 'tennis', label: '🎾 Tennis' },
            { id: 'baseball', label: '⚾ Baseball' },
            { id: 'hockey', label: '🏒 Hockey' },
          ].map((item) => {
            const isSelected = sports.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.sportChip, isSelected && styles.sportChipActive]}
                onPress={() => toggleSport(item.id)}
              >
                <Text
                  style={[styles.sportChipText, isSelected && styles.sportChipTextActive]}
                >
                  {item.label}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={14} color="#F59E0B" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Frequency */}
      <View style={styles.card}>
        <Text style={styles.label}>Delivery Schedule</Text>
        <View style={styles.frequencyRow}>
          {[
            { id: 'daily', label: 'Daily Digest' },
            { id: 'weekly', label: 'Weekly' },
            { id: 'monthly', label: 'Monthly' },
          ].map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.freqButton,
                frequency === f.id && styles.freqButtonActive,
              ]}
              onPress={() => setFrequency(f.id as any)}
            >
              <Text
                style={[
                  styles.freqButtonText,
                  frequency === f.id && styles.freqButtonTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Toggles */}
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Breaking Sports Alerts</Text>
            <Text style={styles.toggleDesc}>Urgent notifications for key events</Text>
          </View>
          <Switch
            value={breakingAlerts}
            onValueChange={setBreakingAlerts}
            trackColor={{ false: '#334155', true: '#F59E0B' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={[styles.toggleRow, { marginTop: 16 }]}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Pause All Emails</Text>
            <Text style={styles.toggleDesc}>Temporary vacation hold mode</Text>
          </View>
          <Switch
            value={isPaused}
            onValueChange={setIsPaused}
            trackColor={{ false: '#334155', true: '#F59E0B' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#0F172A" />
        ) : (
          <Text style={styles.saveButtonText}>Save Preferences</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#CBD5E1',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#020617',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 13,
  },
  loadButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'uppercase',
  },
  sportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sportChipActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
  },
  sportChipText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  sportChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  freqButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#020617',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  freqButtonActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
  },
  freqButtonText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
  },
  freqButtonTextActive: {
    color: '#F59E0B',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 12,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  toggleDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default NewsletterPreferencesScreen;
