import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

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
                }}
            >
                <Stack.Screen
                    name="index"
                    options={{
                        title: '⚡GoalMills',
                    }}
                />
            </Stack>
        </>
    );
}
