import { Stack } from 'expo-router';

// Providers (query, sheet, toast, session) are added in the foundation plan, CP2 + CP5.
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
