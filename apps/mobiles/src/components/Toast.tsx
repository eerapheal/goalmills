import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
  ToastAndroid,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [currentToast, setCurrentToast] = useState<ToastItem | null>(null);
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<any>(null);

  const showToast = useCallback((message: string, type: ToastType) => {
    if (Platform.OS === 'android') {
      try {
        ToastAndroid.show(message, ToastAndroid.SHORT);
      } catch (e) {
        // Fallback to in-app animated toast
      }
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const id = Math.random().toString(36).substring(2, 9);
    setCurrentToast({ id, message, type });

    translateY.setValue(-80);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: Platform.OS === 'ios' ? 50 : 20,
        useNativeDriver: true,
        bounciness: 6,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    timerRef.current = setTimeout(() => {
      hideToast();
    }, 3500);
  }, []);

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentToast(null);
    });
  }, []);

  const toast = {
    success: (message: string) => showToast(message, 'success'),
    error: (message: string) => showToast(message, 'error'),
    info: (message: string) => showToast(message, 'info'),
    warning: (message: string) => showToast(message, 'warning'),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {currentToast && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              transform: [{ translateY }],
              opacity,
            },
            currentToast.type === 'success' && styles.toastSuccess,
            currentToast.type === 'error' && styles.toastError,
            currentToast.type === 'warning' && styles.toastWarning,
            currentToast.type === 'info' && styles.toastInfo,
          ]}
        >
          <View style={styles.contentRow}>
            <Ionicons
              name={
                currentToast.type === 'success'
                  ? 'checkmark-circle'
                  : currentToast.type === 'error'
                    ? 'alert-circle'
                    : currentToast.type === 'warning'
                      ? 'warning'
                      : 'information-circle'
              }
              size={20}
              color={
                currentToast.type === 'success'
                  ? '#10b981'
                  : currentToast.type === 'error'
                    ? '#ef4444'
                    : currentToast.type === 'warning'
                      ? '#f59e0b'
                      : '#4f9bff'
              }
            />
            <Text style={styles.toastText} numberOfLines={3}>
              {currentToast.message}
            </Text>
          </View>
          <TouchableOpacity onPress={hideToast} style={styles.closeBtn}>
            <Ionicons name="close" size={16} color="#94a3b8" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    zIndex: 99999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
  },
  toastSuccess: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: 'rgba(6, 78, 59, 0.95)',
  },
  toastError: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(127, 29, 29, 0.95)',
  },
  toastWarning: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: 'rgba(120, 53, 15, 0.95)',
  },
  toastInfo: {
    borderColor: 'rgba(79, 155, 255, 0.4)',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    gap: 8,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
});
