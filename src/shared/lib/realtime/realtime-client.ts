import { io, type Socket } from 'socket.io-client';
import { env } from '@/shared/config';
import { refreshTokens, tokenStore } from '@/shared/lib/auth';
import { APP_ERROR_CODE, AppError } from '@/shared/lib/http';
import {
  REALTIME_ACK_TIMEOUT_MS,
  REALTIME_AUTH_ERROR,
  type TEmitOptions,
  type TRealtimeAckError,
  type TRealtimeStatus,
} from './realtime.types';

type TStatusListener = () => void;

let socket: Socket | null = null;
let status: TRealtimeStatus = 'disconnected';
/** One refresh per rejected handshake; reset once a connection succeeds. */
let authRetried = false;
const statusListeners = new Set<TStatusListener>();

function setStatus(next: TRealtimeStatus) {
  if (status === next) return;
  status = next;
  statusListeners.forEach((listener) => listener());
}

/** `active` = socket.io is still trying (network loss) — otherwise it gave up (handshake rejected / disconnect()). */
const idleStatus = (instance: Socket): TRealtimeStatus => (instance.active ? 'connecting' : 'disconnected');

/**
 * One socket for the app, created on first use, never auto-connected (RealtimeProvider decides).
 * `auth` is a callback → every (re)connect sends the CURRENT access token (decision 9, not the web ticket flow).
 * `websocket` only: no long-polling fallback.
 */
function getSocket(): Socket {
  if (socket) return socket;
  const instance = io(env.socketUrl, {
    autoConnect: false,
    transports: ['websocket'],
    auth: (callback) => callback({ token: tokenStore.get()?.accessToken }),
  });

  instance.on('connect', () => {
    authRetried = false;
    setStatus('connected');
  });
  instance.on('disconnect', () => setStatus(idleStatus(instance)));
  instance.on('connect_error', (error) => {
    setStatus(idleStatus(instance));
    // Expired access token → one refresh. The new token reaches tokenStore, RealtimeProvider sees the change and
    // reconnects. Refresh rejected → tokens cleared → provider stays disconnected (session = guest).
    if (error.message === REALTIME_AUTH_ERROR && !authRetried) {
      authRetried = true;
      void refreshTokens();
    }
  });

  socket = instance;
  return instance;
}

const isAckError = (ack: unknown): ack is TRealtimeAckError =>
  typeof ack === 'object' &&
  ack !== null &&
  'error' in ack &&
  typeof (ack as TRealtimeAckError).error?.code === 'string';

/** Lifecycle API — used by RealtimeProvider only. Features use `realtimeClient` / `useRealtimeEvent`. */
export const realtimeConnection = {
  connect(): void {
    const instance = getSocket();
    if (instance.connected || instance.active) return;
    setStatus('connecting');
    instance.connect();
  },

  disconnect(): void {
    socket?.disconnect();
    authRetried = false;
    setStatus('disconnected');
  },

  /** Drops the current connection and opens a new one (new token in the handshake). */
  reconnect(): void {
    socket?.disconnect();
    authRetried = false;
    realtimeConnection.connect();
  },

  getStatus: (): TRealtimeStatus => status,

  subscribeStatus(listener: TStatusListener): () => void {
    statusListeners.add(listener);
    return () => statusListeners.delete(listener);
  },
};

export const realtimeClient = {
  /**
   * Emits and waits for the ack. Ack `{ error }` → AppError with the server code; no ack in time → AppError TIMEOUT.
   * Emitted while disconnected → socket.io buffers it until connected (or the timeout fires).
   */
  async emitWithAck<TResponse, TPayload = unknown>(
    event: string,
    payload: TPayload,
    { timeoutMs = REALTIME_ACK_TIMEOUT_MS }: TEmitOptions = {},
  ): Promise<TResponse> {
    let ack: unknown;
    try {
      ack = await getSocket().timeout(timeoutMs).emitWithAck(event, payload);
    } catch {
      throw new AppError({ status: 0, code: APP_ERROR_CODE.TIMEOUT, message: `No ack for ${event}` });
    }
    if (isAckError(ack)) {
      const { code, message, details } = ack.error;
      throw new AppError({ status: 400, code, message, details });
    }
    return ack as TResponse;
  },

  /** Server → client event (also `connect` / `disconnect`). Listeners survive reconnects. Returns `off`. */
  on<TPayload>(event: string, handler: (payload: TPayload) => void): () => void {
    const instance = getSocket();
    instance.on(event, handler);
    return () => {
      instance.off(event, handler);
    };
  },
};
