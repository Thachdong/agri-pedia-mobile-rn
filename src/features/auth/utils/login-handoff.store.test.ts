import AsyncStorage from '@react-native-async-storage/async-storage';
import { keyValueStorage } from '@/shared/lib/storage';
import { authHandoffStore } from './auth-handoff.store';
import { loginHandoffStore } from './login-handoff.store';

describe('loginHandoffStore', () => {
  beforeEach(() => AsyncStorage.clear());

  it('save → read → clear', async () => {
    await loginHandoffStore.save({ loginType: 'PHONE', identifier: '0901234567' });
    expect(await loginHandoffStore.read()).toEqual({ loginType: 'PHONE', identifier: '0901234567' });

    await loginHandoffStore.clear();
    expect(await loginHandoffStore.read()).toBeNull();
  });

  it('keeps only loginType + identifier (extra fields are not persisted)', async () => {
    await loginHandoffStore.save({ loginType: 'EMAIL', identifier: 'a@b.co', password: 'x' } as never);
    expect(await keyValueStorage.getJson('auth-handoff.LOGIN')).toEqual({ loginType: 'EMAIL', identifier: 'a@b.co' });
  });

  it('missing or corrupt → null', async () => {
    expect(await loginHandoffStore.read()).toBeNull();
    await keyValueStorage.setJson('auth-handoff.LOGIN', { loginType: 'SMS', identifier: 'a' });
    expect(await loginHandoffStore.read()).toBeNull();
    await keyValueStorage.setJson('auth-handoff.LOGIN', { loginType: 'EMAIL', identifier: '' });
    expect(await loginHandoffStore.read()).toBeNull();
  });

  it('is independent of the OTP handoffs', async () => {
    await authHandoffStore.save({ loginType: 'EMAIL', identifier: 'a@b.co', at: new Date().toISOString(), purpose: 'RESET_PASSWORD' });
    await loginHandoffStore.save({ loginType: 'PHONE', identifier: '0901234567' });

    await loginHandoffStore.clear();

    expect(await authHandoffStore.read('RESET_PASSWORD')).not.toBeNull();
  });
});
