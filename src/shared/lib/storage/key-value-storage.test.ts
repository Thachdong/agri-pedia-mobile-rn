import AsyncStorage from '@react-native-async-storage/async-storage';
import { keyValueStorage } from './key-value-storage';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('keyValueStorage', () => {
  it('round-trips JSON under the app prefix', async () => {
    await keyValueStorage.setJson('handoff', { identifier: '0912345678', at: '2026-10-07T00:00:00.000Z' });

    expect(await keyValueStorage.getJson('handoff')).toEqual({
      identifier: '0912345678',
      at: '2026-10-07T00:00:00.000Z',
    });
    expect(await AsyncStorage.getItem('agripedia:handoff')).not.toBeNull();
  });

  it('returns null for a missing key', async () => {
    expect(await keyValueStorage.getJson('missing')).toBeNull();
  });

  it('returns null instead of throwing on corrupt JSON', async () => {
    await AsyncStorage.setItem('agripedia:broken', '{not json');
    expect(await keyValueStorage.getJson('broken')).toBeNull();
  });

  it('removes a key', async () => {
    await keyValueStorage.setJson('k', 1);
    await keyValueStorage.remove('k');
    expect(await keyValueStorage.getJson('k')).toBeNull();
  });
});
