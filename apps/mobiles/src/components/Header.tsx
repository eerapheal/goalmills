import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Header = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.brandContainer}
        onPress={() => router.push('/(tabs)/home')}
        activeOpacity={0.8}
        accessibilityLabel="Go to Home"
      >
        <View style={styles.logoWrapper}>
          <Image source={require('../assets/icon.png')} style={styles.logo} />
        </View>
        <Text style={styles.title}>
          <Text style={styles.titleGradient}>GOAL</Text>
          <Text style={styles.titlePlain}>MILLS</Text>
        </Text>
      </TouchableOpacity>

      <View style={styles.rightActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/notifications')}
          activeOpacity={0.7}
          accessibilityLabel="Alerts and Notifications"
          accessibilityRole="button"
        >
          <Ionicons name="notifications-outline" size={21} color="#4f9bff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/privacy')}
          activeOpacity={0.7}
          accessibilityLabel="Data Safety and Privacy Policy"
          accessibilityRole="button"
        >
          <Ionicons name="shield-checkmark-outline" size={21} color="#4f9bff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#091529',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.25)',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
  },
  logoWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginRight: 12,
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  titleGradient: {
    color: '#38bdf8',
  },
  titlePlain: {
    color: '#F59E0B',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Header;
