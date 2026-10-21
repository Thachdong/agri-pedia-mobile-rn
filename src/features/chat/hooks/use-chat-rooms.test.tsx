import { act, renderHook, waitFor } from '@testing-library/react-native';
import { hookWrapper } from '@/test-utils';
import { getChatRooms } from '../services/chat.service';
import { chatRoom, chatRoomsPage } from '../test/chat.fixtures';
import { useChatRooms } from './use-chat-rooms';

jest.mock('../services/chat.service');

describe('useChatRooms', () => {
  beforeEach(() => jest.resetAllMocks());

  it('merges pages; totalUnread from the first page; stops when nextCursor is null', async () => {
    jest
      .mocked(getChatRooms)
      .mockResolvedValueOnce(chatRoomsPage({ rooms: [chatRoom({ roomId: 'r1' })], totalUnread: 5, nextCursor: 'c1' }))
      .mockResolvedValueOnce(chatRoomsPage({ rooms: [chatRoom({ roomId: 'r2' })], totalUnread: 0, nextCursor: null }));
    const { result } = await renderHook(() => useChatRooms(), { wrapper: hookWrapper() });
    await waitFor(() => expect(result.current.hasNextPage).toBe(true));

    await act(() => result.current.fetchNextPage());

    await waitFor(() => expect(result.current.data?.rooms).toHaveLength(2));
    expect(getChatRooms).toHaveBeenLastCalledWith('c1', expect.anything());
    expect(result.current.data?.rooms.map((room) => room.roomId)).toEqual(['r1', 'r2']);
    expect(result.current.data?.totalUnread).toBe(5);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('enabled: false → no request', async () => {
    const { result } = await renderHook(() => useChatRooms({ enabled: false }), { wrapper: hookWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(getChatRooms).not.toHaveBeenCalled();
  });
});
