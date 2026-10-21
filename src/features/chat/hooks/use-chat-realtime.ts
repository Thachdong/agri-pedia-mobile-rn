import { useRef } from 'react';
import { queryKeys, useAppQueryClient } from '@/shared/lib/query';
import { useRealtimeEvent } from '@/shared/lib/realtime';
import { CHAT_EVENTS } from '../services/chat.realtime';
import type { TChatMessageReceivedEvent, TChatMessagesCache } from '../types/chat.types';
import { prependMessage } from '../utils/chat-cache.util';

/**
 * Keeps the chat cache in sync with the socket — mount ONCE (root layout), so the header badge updates everywhere:
 * - `chat.message.received` → add to the room's cache (if loaded) + refetch rooms (lastMessage, unread, order).
 * - connected AGAIN after a drop → refetch all chat: the server doesn't replay messages missed while offline.
 */
export function useChatRealtime() {
  const client = useAppQueryClient();
  const hasConnected = useRef(false);

  useRealtimeEvent<TChatMessageReceivedEvent>(CHAT_EVENTS.received, ({ messageId, roomId, senderId, message, type, diagnosisId, createdAt }) => {
    client.setQueryData<TChatMessagesCache>(queryKeys.chat.messages(roomId), (cache) =>
      prependMessage(cache, {
        id: messageId,
        senderId,
        senderUsername: null,
        senderAvatar: null,
        message,
        type: type ?? 'TEXT',
        diagnosisId: diagnosisId ?? null,
        createdAt,
      }),
    );
    void client.invalidateQueries({ queryKey: queryKeys.chat.rooms() });
  });

  useRealtimeEvent('connect', () => {
    if (hasConnected.current) void client.invalidateQueries({ queryKey: queryKeys.chat.all });
    hasConnected.current = true;
  });
}
