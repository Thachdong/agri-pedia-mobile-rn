// Public API of the `notification` feature. Other features and src/app import only this file.
export { notificationsQuery } from './hooks/notification.queries';
export { useMarkAllNotificationsRead } from './hooks/use-mark-all-notifications-read';
export { useMarkNotificationRead } from './hooks/use-mark-notification-read';
export { useNotifications } from './hooks/use-notifications';
export type { TNotification, TNotificationType, TNotificationsView } from './types/notification.types';
