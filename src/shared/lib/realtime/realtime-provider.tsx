import { useEffect, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { tokenStore } from '@/shared/lib/auth';
import { realtimeConnection } from './realtime-client';

/**
 * Socket lifecycle from the session (decision 9): token present → connect; token changed (login, refresh) →
 * reconnect with the new token; cleared (logout, expired) → disconnect. App back to foreground → connect again
 * if logged in. Mounted once in AppProviders; renders its children unchanged.
 */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    let lastToken = tokenStore.get()?.accessToken;
    if (lastToken) realtimeConnection.connect();

    const unsubscribeToken = tokenStore.subscribe(() => {
      const token = tokenStore.get()?.accessToken;
      if (token === lastToken) return;
      const hadToken = !!lastToken;
      lastToken = token;
      if (!token) realtimeConnection.disconnect();
      else if (hadToken) realtimeConnection.reconnect();
      else realtimeConnection.connect();
    });

    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active' && tokenStore.get() && realtimeConnection.getStatus() === 'disconnected') {
        realtimeConnection.connect();
      }
    });

    return () => {
      unsubscribeToken();
      appState.remove();
      realtimeConnection.disconnect();
    };
  }, []);

  return <>{children}</>;
}
