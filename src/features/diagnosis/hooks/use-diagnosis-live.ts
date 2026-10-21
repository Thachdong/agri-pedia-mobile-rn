import { useCallback, useEffect, useRef, useState } from 'react';
import { queryKeys, useAppQuery, useAppQueryClient } from '@/shared/lib/query';
import { useRealtimeEvent } from '@/shared/lib/realtime';
import { DIAGNOSIS_EVENTS, POLL_INTERVAL_MS, POLL_TIMEOUT_MS } from '../constants/diagnosis.constants';
import type { TDiagnosis, TDiagnosisCompletedEvent } from '../types/diagnosis.types';
import { diagnosisQuery } from './diagnosis.queries';

const isProcessing = (diagnosis: TDiagnosis | undefined) => diagnosis?.status === 'PROCESSING';

/**
 * One diagnosis + waiting for its result (same as web):
 * - realtime `diagnosis.completed` of this id → refetch;
 * - fallback: poll every 3s while PROCESSING; 5 min after the wait started → stop polling, `timedOut`;
 * - socket connected AGAIN → refetch (events missed while offline are not replayed).
 * `reload()` refetches and starts waiting again.
 */
export function useDiagnosisLive(id: string) {
  const client = useAppQueryClient();
  const [waitStartedAt, setWaitStartedAt] = useState(() => Date.now());
  const [timedOut, setTimedOut] = useState(false);
  const hasConnected = useRef(false);

  const query = useAppQuery({
    ...diagnosisQuery(id),
    refetchInterval: ({ state }) => (isProcessing(state.data) && !timedOut ? POLL_INTERVAL_MS : false),
  });
  const processing = isProcessing(query.data);

  useEffect(() => {
    if (!processing) return;
    const timer = setTimeout(() => setTimedOut(true), Math.max(0, waitStartedAt + POLL_TIMEOUT_MS - Date.now()));
    return () => clearTimeout(timer);
  }, [processing, waitStartedAt]);

  const refresh = useCallback(
    () => client.invalidateQueries({ queryKey: queryKeys.diagnoses.detail(id) }),
    [client, id],
  );

  useRealtimeEvent<TDiagnosisCompletedEvent>(DIAGNOSIS_EVENTS.completed, (event) => {
    if (event.id === id) void refresh();
  });

  useRealtimeEvent('connect', () => {
    if (hasConnected.current && processing) void refresh();
    hasConnected.current = true;
  });

  const reload = useCallback(() => {
    setWaitStartedAt(Date.now());
    setTimedOut(false);
    void refresh();
  }, [refresh]);

  return { ...query, timedOut: processing && timedOut, reload };
}
