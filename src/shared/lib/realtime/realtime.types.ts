export type TRealtimeStatus = 'connecting' | 'connected' | 'disconnected';

/** Server error returned in an ack: `{ error: { code, message, details? } }` (api.md — Realtime). */
export type TRealtimeAckError = {
  error: { code: string; message: string; details?: Record<string, unknown> | string[] };
};

export type TEmitOptions = {
  /** Max wait for the ack — exceeded (offline, server down) → AppError TIMEOUT. */
  timeoutMs?: number;
};

export const REALTIME_ACK_TIMEOUT_MS = 10_000;

/** Handshake rejected because the access token expired (api.md — Realtime). */
export const REALTIME_AUTH_ERROR = 'AUTH_INVALID_ACCESS_TOKEN';
