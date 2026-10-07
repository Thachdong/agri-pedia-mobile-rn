import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

const TICK_MS = 1000;

type TCountdownFrom = Date | string | null | undefined;

export type TUseCountdownOptions = {
  /** Length of the window, e.g. 3 min for resend. */
  durationMs: number;
  /** Start of the window (e.g. handoff `at`). Missing / invalid → idle. A new value restarts from it. */
  from?: TCountdownFrom;
};

const toMs = (from: TCountdownFrom): number | null => {
  if (from === null || from === undefined) return null;
  const ms = new Date(from).getTime();
  return Number.isNaN(ms) ? null : ms;
};

/**
 * Countdown over a window [from, from + durationMs]. Computed from timestamps, so it stays right after the app was in
 * background (JS timers paused) — recomputed on AppState `active`. Ticks every 1s while running; interval and
 * AppState subscription cleaned up on finish / unmount.
 */
export function useCountdown({ durationMs, from }: TUseCountdownOptions) {
  const fromMs = toMs(from);
  const [startMs, setStartMs] = useState<number | null>(fromMs);
  const [syncedFromMs, setSyncedFromMs] = useState<number | null>(fromMs);
  const [nowMs, setNowMs] = useState(() => Date.now());

  // `from` arrives after mount (async handoff read) or changes → restart from it (state adjusted during render).
  if (fromMs !== syncedFromMs) {
    setSyncedFromMs(fromMs);
    setStartMs(fromMs);
  }

  const remainingMs = startMs === null ? 0 : Math.max(0, startMs + durationMs - nowMs);
  const isRunning = remainingMs > 0;

  useEffect(() => {
    if (startMs === null) return;
    const tick = () => setNowMs(Date.now());
    tick();
    if (startMs + durationMs <= Date.now()) return;
    const id = setInterval(tick, TICK_MS);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') tick();
    });
    return () => {
      clearInterval(id);
      subscription.remove();
    };
  }, [startMs, durationMs, isRunning]);

  /** Starts a new window from `from` (default now) — e.g. after a successful resend. */
  const restart = useCallback((nextFrom?: Date | string) => {
    setStartMs(toMs(nextFrom ?? new Date()));
    setNowMs(Date.now());
  }, []);

  /** Back to idle (no countdown) — e.g. the identifier changed, the old window no longer applies. */
  const stop = useCallback(() => setStartMs(null), []);

  return { remainingMs, isRunning, restart, stop };
}
