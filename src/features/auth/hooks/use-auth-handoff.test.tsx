import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { TAuthHandoff } from '../types/auth.types';
import { authHandoffStore } from '../utils/auth-handoff.store';
import { useAuthHandoff } from './use-auth-handoff';

const HANDOFF: TAuthHandoff = {
  loginType: 'PHONE',
  identifier: '0901234567',
  at: '2026-10-07T08:00:00.000Z',
  purpose: 'ACTIVATE_DISTRIBUTOR',
};

describe('useAuthHandoff', () => {
  beforeEach(() => AsyncStorage.clear());

  it('loading, then ready with the stored handoff', async () => {
    await authHandoffStore.save(HANDOFF);
    const { result } = await renderHook(() => useAuthHandoff('ACTIVATE_DISTRIBUTOR'));

    await waitFor(() => expect(result.current).toEqual({ status: 'ready', handoff: HANDOFF }));
  });

  it('ready with null when none (or another purpose) is stored', async () => {
    await authHandoffStore.save({ ...HANDOFF, purpose: 'RESET_PASSWORD' });
    const { result } = await renderHook(() => useAuthHandoff('ACTIVATE_DISTRIBUTOR'));

    await waitFor(() => expect(result.current).toEqual({ status: 'ready', handoff: null }));
  });
});
