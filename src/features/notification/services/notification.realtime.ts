/** Socket event names (api.md — Realtime events). Server push only; no client → server event. */
export const NOTIFICATION_EVENTS = {
  /** Same item shape as GET /notifications (`createdAt` ISO string), to every connection of the recipient. */
  created: 'notification.created',
} as const;
