import '@/shared/theme/global.css';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SessionListener } from '@/features/auth';
import { tokenStore } from '@/shared/lib/auth';
import { AppProviders } from '@/shared/providers';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Splash stays until the stored session is read, so the first screen already knows guest vs logged in.
  // System font, no font loading (same as Flutter).
  const [ready, setReady] = useState(tokenStore.isLoaded());

  useEffect(() => {
    tokenStore.load().finally(() => {
      setReady(true);
      SplashScreen.hideAsync();
    });
  }, []);

  if (!ready) return null;

  return (
    <AppProviders>
      <SessionListener />
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </AppProviders>
  );
}
