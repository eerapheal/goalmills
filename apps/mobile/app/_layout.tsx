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
          // Use custom Header component for all screens
          header: () => <Header />, // hides default title
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            // title is ignored because custom header renders logo/name
            title: '⚡GoalMills',
          }}
        />
      </Stack>
    </>
  );
}
