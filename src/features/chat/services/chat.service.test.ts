import { http } from '@/shared/lib/http';
import { CHAT_MESSAGES_PAGE_SIZE, CHAT_ROOMS_PAGE_SIZE, getChatRooms, getRoomMessages } from './chat.service';

jest.mock('@/shared/lib/http', () => ({ http: { get: jest.fn() } }));

describe('chat.service', () => {
  beforeEach(() => jest.mocked(http.get).mockReset().mockResolvedValue({}));

  it('GET /chat/rooms with cursor + page size and the abort signal', async () => {
    const { signal } = new AbortController();
    await getChatRooms('c1', signal);
    expect(http.get).toHaveBeenCalledWith('/chat/rooms', { query: { cursor: 'c1', limit: CHAT_ROOMS_PAGE_SIZE }, signal });
  });

  it('GET /chat/rooms/{roomId}/messages with the room id encoded', async () => {
    await getRoomMessages('a/b', undefined);
    expect(http.get).toHaveBeenCalledWith('/chat/rooms/a%2Fb/messages', {
      query: { cursor: undefined, limit: CHAT_MESSAGES_PAGE_SIZE },
      signal: undefined,
    });
  });
});
