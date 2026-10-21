// Public API of the `notification` feature. Other features and src/app import only this file.
export { NotificationHeaderButton } from './components/notification-header-button';
export { NotificationList } from './components/notification-list';
export { NotificationRealtimeSync } from './components/notification-realtime-sync';
export { notificationsQuery } from './hooks/notification.queries';
export { useMarkAllNotificationsRead } from './hooks/use-mark-all-notifications-read';
export { useMarkNotificationRead } from './hooks/use-mark-notification-read';
export { useNotifications } from './hooks/use-notifications';
export { useOpenNotification } from './hooks/use-open-notification';
export type { TNotification, TNotificationType, TNotificationsView } from './types/notification.types';
