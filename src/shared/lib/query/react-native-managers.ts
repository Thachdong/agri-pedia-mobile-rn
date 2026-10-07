import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager } from '@tanstack/react-query';
import { AppState, Platform, type AppStateStatus } from 'react-native';

let wired = false;

/**
 * React Native has no window focus / online events: feed react-query from AppState and NetInfo,
 * so stale queries refetch when the app returns to foreground and paused ones resume when back online.
 */
export function wireReactNativeManagers(): void {
  if (wired) return;
  wired = true;

  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => setOnline(!!state.isConnected)),
  );

  AppState.addEventListener('change', (status: AppStateStatus) => {
    if (Platform.OS !== 'web') focusManager.setFocused(status === 'active');
  });
}
