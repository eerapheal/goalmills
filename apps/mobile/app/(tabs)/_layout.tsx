import { Tabs } from 'expo-router';
// Attempt to use Ionicons. If it fails due to missing package, we can remove it.
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#001f3f',
                    borderTopColor: '#001a35',
                },
                tabBarActiveTintColor: '#fff',
                tabBarInactiveTintColor: '#aaa',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="news"
                options={{
                    title: 'News',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="newspaper" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="highlight"
                options={{
                    title: 'Highlights',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="videocam" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
