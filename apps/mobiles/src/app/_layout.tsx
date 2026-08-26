import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Header from '../components/Header';
import { notificationService } from '../services/notificationService';
import { ToastProvider } from '../components/Toast';

export default function RootLayout() {
    const router = useRouter();
    const notificationListener = useRef<any>(null);
    const responseListener = useRef<any>(null);

    useEffect(() => {
        // Automatically attempt background registration with default topics (mocked safely in Expo Go Android)
        notificationService.registerForPushNotificationsAsync().catch(() => {});

        // Listen for foreground notification events
        notificationListener.current = notificationService.addReceivedListener((notification) => {
            console.log('Foreground notification received:', notification);
        });

        // Listen for user clicking on a notification
        responseListener.current = notificationService.addResponseListener((response) => {
            const data = response?.notification?.request?.content?.data;
            if (data?.newsId) {
                router.push(`/(tabs)/news/${data.newsId}` as any);
            } else if (data?.matchId) {
                router.push(`/(tabs)/home/football/matches/${data.matchId}` as any);
            } else {
                router.push('/notifications' as any);
            }
        });

        return () => {
            if (notificationListener.current) {
                (notificationListener.current as any)?.remove?.();
            }
            if (responseListener.current) {
                (responseListener.current as any)?.remove?.();
            }
        };
    }, []);

    return (
        <ToastProvider>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#001f3f',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    // Use custom Header component for stack screens by default
                    header: () => <Header />,
                }}
            >
                <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
                <Stack.Screen name="privacy" options={{ headerShown: false }} />
                <Stack.Screen name="notifications" options={{ headerShown: false }} />
            </Stack>
        </ToastProvider>
    );
}

export { ErrorBoundary } from 'expo-router';
