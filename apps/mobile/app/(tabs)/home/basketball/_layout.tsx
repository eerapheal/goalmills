import { Stack } from 'expo-router';

export default function BasketballLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0a0e27' },
      }}
    >
      <Stack.Screen name="matches/[id]" />
      <Stack.Screen name="leagues/[id]" />
      <Stack.Screen name="teams/[id]" />
    </Stack>
  );
}
