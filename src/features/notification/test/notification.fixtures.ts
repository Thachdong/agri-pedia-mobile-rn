import type { TNotification, TNotificationsCache, TNotificationsPage } from '../types/notification.types';

/** One item of GET /notifications. */
export const notification = (overrides: Partial<TNotification> = {}): TNotification => ({
  id: 'n1',
  type: 'REVIEW',
  label: 'Đánh giá mới',
  content: 'Bạn nhận được đánh giá 5 sao',
  isRead: false,
  referenceId: 'rv1',
  createdAt: '2026-10-08T10:00:00.000Z',
  ...overrides,
});

export const notificationsPage = (overrides: Partial<TNotificationsPage> = {}): TNotificationsPage => ({
  notifications: [notification()],
  nextCursor: null,
  ...overrides,
});

export const notificationsCache = (...pages: TNotificationsPage[]): TNotificationsCache => ({
  pages,
  pageParams: pages.map((_, index) => (index === 0 ? undefined : `c${index}`)),
});
