import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TAuthHandoff } from '../types/auth.types';
import { authHandoffStore } from './auth-handoff.store';

const HANDOFF: TAuthHandoff = {
  loginType: 'PHONE',
  identifier: '0901234567',
  at: '2026-10-07T08:00:00.000Z',
  purpose: 'ACTIVATE_DISTRIBUTOR',
};

describe('authHandoffStore', () => {
  beforeEach(() => AsyncStorage.clear());

  it('saves and reads back per purpose', async () => {
    await authHandoffStore.save(HANDOFF);
    expect(await authHandoffStore.read('ACTIVATE_DISTRIBUTOR')).toEqual(HANDOFF);
    expect(await authHandoffStore.read('RESET_PASSWORD')).toBeNull();
  });

  it('clear removes only that purpose', async () => {
    await authHandoffStore.save(HANDOFF);
    await authHandoffStore.save({ ...HANDOFF, purpose: 'RESET_PASSWORD' });
    await authHandoffStore.clear('ACTIVATE_DISTRIBUTOR');
    expect(await authHandoffStore.read('ACTIVATE_DISTRIBUTOR')).toBeNull();
    expect(await authHandoffStore.read('RESET_PASSWORD')).not.toBeNull();
  });

  it.each([
    ['corrupt JSON', '{oops'],
    ['bad loginType', JSON.stringify({ ...HANDOFF, loginType: 'X' })],
    ['empty identifier', JSON.stringify({ ...HANDOFF, identifier: '' })],
    ['invalid date', JSON.stringify({ ...HANDOFF, at: 'yesterday' })],
    ['other purpose stored under the key', JSON.stringify({ ...HANDOFF, purpose: 'RESET_PASSWORD' })],
  ])('reads null for %s', async (_, raw) => {
    await AsyncStorage.setItem('agripedia:auth-handoff.ACTIVATE_DISTRIBUTOR', raw);
    expect(await authHandoffStore.read('ACTIVATE_DISTRIBUTOR')).toBeNull();
  });

  it('save never throws when storage fails', async () => {
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('quota'));
    await expect(authHandoffStore.save(HANDOFF)).resolves.toBeUndefined();
  });
});
