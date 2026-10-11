import { act, renderHook } from '@testing-library/react-native';
import { queryKeys } from '@/shared/lib/query';
import { createTestQueryClient, hookWrapper } from '@/test-utils';
import { updateMe } from '../services/user.service';
import { useUpdateMe } from './use-update-me';

jest.mock('../services/user.service');

describe('useUpdateMe', () => {
  it('PATCHes and invalidates the session user + own distributor profile', async () => {
    jest.mocked(updateMe).mockResolvedValue({} as never);
    const client = createTestQueryClient();
    const spy = jest.spyOn(client, 'invalidateQueries');
    const { result } = await renderHook(() => useUpdateMe('d1'), { wrapper: hookWrapper(client) });

    await act(() => result.current.mutateAsync({ username: 'Mới' }));

    expect(updateMe).toHaveBeenCalledWith({ username: 'Mới' });
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.users.me() });
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.distributors.detail('d1') });
  });
});
