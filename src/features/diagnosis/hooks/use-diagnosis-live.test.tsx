import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useRealtimeEvent } from '@/shared/lib/realtime';
import { hookWrapper } from '@/test-utils';
import { POLL_INTERVAL_MS, POLL_TIMEOUT_MS } from '../constants/diagnosis.constants';
import { getDiagnosis } from '../services/diagnosis.service';
import { diagnosis, processingDiagnosis } from '../test/diagnosis.fixtures';
import { useDiagnosisLive } from './use-diagnosis-live';

jest.mock('../services/diagnosis.service');
jest.mock('@/shared/lib/realtime', () => ({ useRealtimeEvent: jest.fn() }));

/** Latest handler registered for a realtime event. */
const handlerOf = (event: string) =>
  jest
    .mocked(useRealtimeEvent)
    .mock.calls.filter(([name]) => name === event)
    .at(-1)?.[1] as (payload?: unknown) => void;

describe('useDiagnosisLive', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  it('polls every 3s while PROCESSING, stops once COMPLETED', async () => {
    jest
      .mocked(getDiagnosis)
      .mockResolvedValueOnce(processingDiagnosis())
      .mockResolvedValueOnce(processingDiagnosis())
      .mockResolvedValue(diagnosis());
    const { result } = await renderHook(() => useDiagnosisLive('g1'), { wrapper: hookWrapper() });
    await waitFor(() => expect(result.current.data?.status).toBe('PROCESSING'));

    await act(() => jest.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 2));
    await waitFor(() => expect(result.current.data?.status).toBe('COMPLETED'));
    const calls = jest.mocked(getDiagnosis).mock.calls.length;
    await act(() => jest.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 3));
    expect(getDiagnosis).toHaveBeenCalledTimes(calls);
  });

  it('5 minutes still PROCESSING → timedOut, polling stops; reload waits again', async () => {
    jest.mocked(getDiagnosis).mockResolvedValue(processingDiagnosis());
    const { result } = await renderHook(() => useDiagnosisLive('g1'), { wrapper: hookWrapper() });
    await waitFor(() => expect(result.current.data).toBeDefined());

    await act(() => jest.advanceTimersByTimeAsync(POLL_TIMEOUT_MS));
    expect(result.current.timedOut).toBe(true);
    const calls = jest.mocked(getDiagnosis).mock.calls.length;
    await act(() => jest.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 3));
    expect(getDiagnosis).toHaveBeenCalledTimes(calls);

    await act(() => result.current.reload());
    expect(result.current.timedOut).toBe(false);
    expect(jest.mocked(getDiagnosis).mock.calls.length).toBeGreaterThan(calls);
  });

  it('realtime diagnosis.completed of this id → refetch; another id → nothing', async () => {
    jest.mocked(getDiagnosis).mockResolvedValueOnce(processingDiagnosis()).mockResolvedValue(diagnosis());
    const { result } = await renderHook(() => useDiagnosisLive('g1'), { wrapper: hookWrapper() });
    await waitFor(() => expect(result.current.data?.status).toBe('PROCESSING'));

    await act(async () => handlerOf('diagnosis.completed')({ id: 'other', status: 'COMPLETED' }));
    expect(getDiagnosis).toHaveBeenCalledTimes(1);
    await act(async () => handlerOf('diagnosis.completed')({ id: 'g1', status: 'COMPLETED' }));
    await waitFor(() => expect(result.current.data?.status).toBe('COMPLETED'));
  });
});
