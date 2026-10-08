import { useEffect, useRef, useSyncExternalStore } from 'react';
import { realtimeClient, realtimeConnection } from './realtime-client';
import type { TRealtimeStatus } from './realtime.types';

/** Connection status for UI ("Đang kết nối…", enter a room only when connected). */
export function useRealtimeStatus(): TRealtimeStatus {
  return useSyncExternalStore(realtimeConnection.subscribeStatus, realtimeConnection.getStatus);
}

/** Listens to one server → client event while mounted. The latest handler is used — no need to memoize it. */
export function useRealtimeEvent<TPayload>(event: string, handler: (payload: TPayload) => void): void {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => realtimeClient.on<TPayload>(event, (payload) => handlerRef.current(payload)), [event]);
}
