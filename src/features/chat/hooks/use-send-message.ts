import { queryKeys, useAppMutation, useAppQueryClient } from '@/shared/lib/query';
import { sendMessage } from '../services/chat.realtime';
import type { TChatMessagesCache, TSendMessageInput } from '../types/chat.types';
import { prependMessage } from '../utils/chat-cache.util';

/**
 * Sends through the socket and waits for the ack. The server does not push the message back to the sender, so the
 * ack's message goes into the room's cache here; rooms are invalidated (lastMessage, order).
 * Sent with `receiverId` (no room yet) → the ack carries the new `roomId`; the caller switches to it.
 * @param senderId the logged-in user.
 */
export function useSendMessage(senderId: string) {
  const client = useAppQueryClient();
  return useAppMutation({
    mutationFn: (input: TSendMessageInput) => sendMessage({ ...input, message: input.message.trim() }),
    // The conversation shows the error under the composer.
    meta: { silent: true },
    invalidates: () => [queryKeys.chat.rooms()],
    onSuccess: (ack, input) => {
      client.setQueryData<TChatMessagesCache>(queryKeys.chat.messages(ack.roomId), (cache) =>
        prependMessage(cache, {
          id: ack.messageId,
          senderId,
          senderUsername: null,
          senderAvatar: null,
          message: input.message.trim(),
          createdAt: ack.createdAt,
        }),
      );
    },
  });
}
