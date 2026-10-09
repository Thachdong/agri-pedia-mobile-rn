import { useNotificationRealtime } from '../hooks/use-notification-realtime';

/** Keeps the notifications cache in sync with the socket on every screen — mounted once in the root layout. Renders nothing. */
export function NotificationRealtimeSync() {
  useNotificationRealtime();
  return null;
}
