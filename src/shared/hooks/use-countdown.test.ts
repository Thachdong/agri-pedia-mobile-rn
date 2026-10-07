import { act, renderHook } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import { useCountdown } from './use-countdown';

const MIN_3 = 3 * 60 * 1000;
const NOW = new Date('2026-10-07T08:00:00.000Z');

describe('useCountdown', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('idle without `from`', async () => {
    const { result } = await renderHook(() => useCountdown({ durationMs: MIN_3 }));
    expect(result.current).toMatchObject({ remainingMs: 0, isRunning: false });
  });

  it('counts down from `from` every second and stops at 0', async () => {
    const clear = jest.spyOn(globalThis, 'clearInterval');
    const { result } = await renderHook(() => useCountdown({ durationMs: MIN_3, from: NOW.toISOString() }));
    expect(result.current).toMatchObject({ remainingMs: MIN_3, isRunning: true });

    await act(() => jest.advanceTimersByTime(1000));
    expect(result.current.remainingMs).toBe(MIN_3 - 1000);

    await act(() => jest.advanceTimersByTime(MIN_3));
    expect(result.current).toMatchObject({ remainingMs: 0, isRunning: false });
    expect(clear).toHaveBeenCalled(); // interval torn down once finished
  });

  it('`from` older than the window → not running', async () => {
    const from = new Date(NOW.getTime() - MIN_3 - 1000);
    const { result } = await renderHook(() => useCountdown({ durationMs: MIN_3, from }));
    expect(result.current.isRunning).toBe(false);
  });

  it('`from` 1 min ago → 2 min left', async () => {
    const from = new Date(NOW.getTime() - 60_000).toISOString();
    const { result } = await renderHook(() => useCountdown({ durationMs: MIN_3, from }));
    expect(result.current.remainingMs).toBe(2 * 60_000);
  });

  it('invalid `from` → idle', async () => {
    const { result } = await renderHook(() => useCountdown({ durationMs: MIN_3, from: 'not a date' }));
    expect(result.current.isRunning).toBe(false);
  });

  it('`from` arriving after mount starts the countdown', async () => {
    const { result, rerender } = await renderHook(
      ({ from }: { from?: string }) => useCountdown({ durationMs: MIN_3, from }),
      { initialProps: {} },
    );
    expect(result.current.isRunning).toBe(false);

    await rerender({ from: NOW.toISOString() });
    expect(result.current.remainingMs).toBe(MIN_3);
  });

  it('restart() starts a new window from now; stop() goes idle', async () => {
    const { result } = await renderHook(() => useCountdown({ durationMs: MIN_3 }));

    await act(() => result.current.restart());
    expect(result.current.remainingMs).toBe(MIN_3);

    await act(() => result.current.stop());
    expect(result.current).toMatchObject({ remainingMs: 0, isRunning: false });
  });

  it('recomputes when the app comes back to foreground', async () => {
    let onChange: ((state: AppStateStatus) => void) | undefined;
    const remove = jest.fn();
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_, handler) => {
      onChange = handler;
      return { remove };
    });
    const { result, unmount } = await renderHook(() => useCountdown({ durationMs: MIN_3, from: NOW }));

    // Background: timers paused, wall clock moves on.
    jest.setSystemTime(NOW.getTime() + 2 * 60_000);
    await act(() => onChange?.('active'));
    expect(result.current.remainingMs).toBe(60_000);

    await unmount();
    expect(remove).toHaveBeenCalled();
  });
});
