import React, { useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import Header from '../components/Header';
import { notificationService } from '../services/notificationService';
import { ToastProvider } from '../components/Toast';

export default function RootLayout() {
    const router = useRouter();
    const notificationListener = useRef<any>(null);
    const responseListener = useRef<any>(null);

    useEffect(() => {
        // Automatically attempt background registration with default topics
        notificationService.registerForPushNotificationsAsync().catch((err) => {
            console.log('Background push registration notice:', err);
        });

        // Listen for foreground notification events
        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
            console.log('Foreground notification received:', notification);
        });

        // Listen for user clicking on a notification
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            const data = response.notification.request.content.data;
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
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
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
