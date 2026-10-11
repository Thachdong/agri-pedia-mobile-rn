import { renderHook } from '@testing-library/react-native';
import { chatRoom } from '../test/chat.fixtures';
import { useChatRooms } from './use-chat-rooms';
import { useRoomWithUser } from './use-room-with-user';

jest.mock('./use-chat-rooms');

const rooms = (value: Partial<ReturnType<typeof useChatRooms>>) =>
  jest.mocked(useChatRooms).mockReturnValue(value as ReturnType<typeof useChatRooms>);

describe('useRoomWithUser', () => {
  it('loading → undefined; room with the user → its id; none / error → null', async () => {
    rooms({ isPending: true });
    expect((await renderHook(() => useRoomWithUser('u2'))).result.current).toBeUndefined();

    rooms({ isPending: false, data: { rooms: [chatRoom({ roomId: 'r9', otherUserId: 'u2' })], totalUnread: 0 } });
    expect((await renderHook(() => useRoomWithUser('u2'))).result.current).toBe('r9');
    expect((await renderHook(() => useRoomWithUser('u3'))).result.current).toBeNull();

    rooms({ isPending: false, isError: true });
    expect((await renderHook(() => useRoomWithUser('u2'))).result.current).toBeNull();
  });
});
