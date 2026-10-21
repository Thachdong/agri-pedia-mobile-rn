import { renderHook, waitFor } from '@testing-library/react-native';
import { queryKeys, useAppMutation } from '@/shared/lib/query';
import { createTestQueryClient, hookWrapper } from '@/test-utils';
import { createMyAddress, deleteMyAddress, getMyAddresses, setMyPrimaryAddress } from '../services/user.service';
import { myAddress } from '../test/user.fixtures';
import { useCreateMyAddress } from './use-create-my-address';
import { useDeleteMyAddress } from './use-delete-my-address';
import { useMyAddresses } from './use-my-addresses';
import { useSetMyPrimaryAddress } from './use-set-my-primary-address';

jest.mock('../services/user.service');

const input = {
  province: 'ha_noi',
  ward: 'ba_dinh',
  houseNumber: '2 Kim Mã',
  lat: 21,
  long: 105,
};
const primaryKeys = [
  queryKeys.users.addresses(),
  queryKeys.users.me(),
  queryKeys.distributors.detail('u1'),
  queryKeys.distributors.nearbyLists(),
];

async function runMutation<TVars>(useHook: () => ReturnType<typeof useAppMutation<unknown, TVars>>, vars: TVars) {
  const client = createTestQueryClient();
  const spy = jest.spyOn(client, 'invalidateQueries');
  const { result } = await renderHook(useHook, {
    wrapper: hookWrapper(client),
  });
  await result.current.mutateAsync(vars);
  return spy.mock.calls.map(([filters]) => filters?.queryKey);
}

describe('address hooks', () => {
  beforeEach(() => jest.clearAllMocks());

  it('useMyAddresses → the addresses array', async () => {
    jest.mocked(getMyAddresses).mockResolvedValue({ addresses: [myAddress()] });
    const { result } = await renderHook(() => useMyAddresses(), {
      wrapper: hookWrapper(),
    });
    await waitFor(() => expect(result.current.data).toEqual([myAddress()]));
  });

  it('useCreateMyAddress: normal address → only the address list is stale', async () => {
    jest.mocked(createMyAddress).mockResolvedValue({ addressId: 'a2' });
    const keys = await runMutation(() => useCreateMyAddress('u1'), {
      ...input,
      isPrimary: false,
    });
    expect(createMyAddress).toHaveBeenCalledWith({
      ...input,
      isPrimary: false,
    });
    expect(keys).toEqual([queryKeys.users.addresses()]);
  });

  it('useCreateMyAddress: primary address → profile + nearby stale too', async () => {
    jest.mocked(createMyAddress).mockResolvedValue({ addressId: 'a2' });
    const keys = await runMutation(() => useCreateMyAddress('u1'), {
      ...input,
      isPrimary: true,
    });
    expect(keys).toEqual(primaryKeys);
  });

  it('useSetMyPrimaryAddress → PATCH id, profile + nearby stale', async () => {
    jest.mocked(setMyPrimaryAddress).mockResolvedValue(undefined);
    const keys = await runMutation(() => useSetMyPrimaryAddress('u1'), 'a2');
    expect(setMyPrimaryAddress).toHaveBeenCalledWith('a2');
    expect(keys).toEqual(primaryKeys);
  });

  it('useDeleteMyAddress → DELETE id, address list stale', async () => {
    jest.mocked(deleteMyAddress).mockResolvedValue(undefined);
    const keys = await runMutation(() => useDeleteMyAddress(), 'a2');
    expect(deleteMyAddress).toHaveBeenCalledWith('a2');
    expect(keys).toEqual([queryKeys.users.addresses()]);
  });
});
