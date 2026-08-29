import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#091529',
          borderTopColor: 'rgba(245, 158, 11, 0.25)',
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#F59E0B',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '800',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Sports',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="football" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transfers"
        options={{
          title: 'Transfers',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: 'Analysis',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: 'News',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="highlight"
        options={{
          title: 'Highlights',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="videocam" size={size - 2} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
