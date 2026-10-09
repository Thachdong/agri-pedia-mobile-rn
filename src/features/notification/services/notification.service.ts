import { http } from '@/shared/lib/http';
import type { TNotificationsPage } from '../types/notification.types';

export const NOTIFICATIONS_PAGE_SIZE = 20;

/** Caller's notifications, newest first (read and unread). 400 NOTIFICATION_INVALID_CURSOR. */
export const getNotifications = (cursor: string | undefined, signal?: AbortSignal) =>
  http.get<TNotificationsPage>('/notifications', { query: { cursor, limit: NOTIFICATIONS_PAGE_SIZE }, signal });

/** Empty body; already read → 200 too. Another user's notification → 404 NOTIFICATION_NOT_FOUND. */
export const markNotificationRead = (notificationId: string) =>
  http.patch<void>(`/notifications/${encodeURIComponent(notificationId)}/read`);

/** Empty body; every unread notification of the caller → read (200 also when there is nothing to mark). */
export const markAllNotificationsRead = () => http.patch<void>('/notifications/read-all');
