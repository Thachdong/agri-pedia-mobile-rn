import '@/shared/theme/global.css';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppProviders } from '@/shared/providers';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Hides the splash once the first frame is ready. Session restore (foundation CP5) will gate this. System font, no font loading (same as Flutter).
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </AppProviders>
  );
}
