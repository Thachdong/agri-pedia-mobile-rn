import { act, renderHook } from '@testing-library/react-native';
import { AppError } from '@/shared/lib/http';
import { queryKeys } from '@/shared/lib/query';
import { createTestQueryClient, hookWrapper } from '@/test-utils';
import { sendMessage } from '../services/chat.realtime';
import { chatMessage, chatMessagesPage } from '../test/chat.fixtures';
import type { TChatMessagesCache } from '../types/chat.types';
import { useSendMessage } from './use-send-message';

jest.mock('../services/chat.realtime');

const ACK = { messageId: 'm9', roomId: 'r1', createdAt: '2026-10-08T11:00:00.000Z' };

describe('useSendMessage', () => {
  beforeEach(() => jest.resetAllMocks());

  it('sends the trimmed message, adds it to the room cache and invalidates rooms', async () => {
    jest.mocked(sendMessage).mockResolvedValue(ACK);
    const client = createTestQueryClient();
    client.setQueryData<TChatMessagesCache>(queryKeys.chat.messages('r1'), {
      pages: [chatMessagesPage({ messages: [chatMessage({ id: 'm1' })] })],
      pageParams: [undefined],
    });
    const invalidate = jest.spyOn(client, 'invalidateQueries');
    const { result } = await renderHook(() => useSendMessage('u1'), { wrapper: hookWrapper(client) });

    await act(() => result.current.mutateAsync({ roomId: 'r1', message: '  xin chào  ' }));

    expect(sendMessage).toHaveBeenCalledWith({ roomId: 'r1', message: 'xin chào' });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.chat.rooms() });
    const cache = client.getQueryData<TChatMessagesCache>(queryKeys.chat.messages('r1'));
    expect(cache?.pages[0]?.messages.map((message) => message.id)).toEqual(['m9', 'm1']);
    expect(cache?.pages[0]?.messages[0]).toMatchObject({ senderId: 'u1', message: 'xin chào', createdAt: ACK.createdAt });
  });

  it('ack error → AppError with the server code', async () => {
    jest
      .mocked(sendMessage)
      .mockRejectedValue(new AppError({ status: 400, code: 'CHAT_INVALID_RECEIVER', message: 'x' }));
    const { result } = await renderHook(() => useSendMessage('u1'), { wrapper: hookWrapper() });

    await expect(act(() => result.current.mutateAsync({ receiverId: 'u1', message: 'hi' }))).rejects.toMatchObject({
      code: 'CHAT_INVALID_RECEIVER',
    });
  });
});
