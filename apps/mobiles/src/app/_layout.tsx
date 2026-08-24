import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Header from '../components/Header';

export default function RootLayout() {
    return (
        <>
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
            </Stack>
        </>
    );
}
