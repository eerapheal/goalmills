import { Stack } from 'expo-router';
import { COLORS } from '@goalmills/ui';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.backgroundDark,
        },
        headerTintColor: COLORS.text,
        headerShown: false, // Hide header by default for the main screen, show in sub-screens if needed
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      {/* You can add other screens here if you want specific options */}
    </Stack>
  );
}
