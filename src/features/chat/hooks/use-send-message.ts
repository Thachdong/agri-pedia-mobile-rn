import { queryKeys, useAppMutation, useAppQueryClient } from '@/shared/lib/query';
import { sendMessage } from '../services/chat.realtime';
import type { TChatMessagesCache, TSendMessageInput } from '../types/chat.types';
import { prependMessage } from '../utils/chat-cache.util';

/**
 * Sends through the socket and waits for the ack. The server does not push the message back to the sender, so the
 * ack's message goes into the room's cache here — FIRST, so it shows at once — then rooms are refetched in the
 * background (lastMessage, order) instead of awaited.
 * Sent with `receiverId` (no room yet) → the ack carries the new `roomId`; the caller switches to it.
 * @param senderId the logged-in user.
 */
export function useSendMessage(senderId: string) {
  const client = useAppQueryClient();
  return useAppMutation({
    mutationFn: (input: TSendMessageInput) => sendMessage({ ...input, message: input.message.trim() }),
    // The conversation shows the error under the composer.
    meta: { silent: true },
    // Cache updated below; rooms invalidated there too, not awaited before the message shows.
    invalidates: false,
    onSuccess: (ack, input) => {
      client.setQueryData<TChatMessagesCache>(queryKeys.chat.messages(ack.roomId), (cache) =>
        prependMessage(cache, {
          id: ack.messageId,
          senderId,
          senderUsername: null,
          senderAvatar: null,
          message: input.message.trim(),
          type: 'TEXT',
          diagnosisId: null,
          createdAt: ack.createdAt,
        }),
      );
      void client.invalidateQueries({ queryKey: queryKeys.chat.rooms() });
    },
  });
}
