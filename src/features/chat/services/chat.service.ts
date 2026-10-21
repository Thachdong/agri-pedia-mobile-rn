import { http } from '@/shared/lib/http';
import type { TChatMessagesPage, TChatRoomsPage } from '../types/chat.types';

export const CHAT_ROOMS_PAGE_SIZE = 20;
export const CHAT_MESSAGES_PAGE_SIZE = 30;

/** Caller's rooms, latest message first. `totalUnread` covers all rooms. 400 CHAT_INVALID_CURSOR. */
export const getChatRooms = (cursor: string | undefined, signal?: AbortSignal) =>
  http.get<TChatRoomsPage>('/chat/rooms', { query: { cursor, limit: CHAT_ROOMS_PAGE_SIZE }, signal });

/**
 * Newest first; `nextCursor` → older messages. Read-only: does not mark as read (socket `chat.room.enter` does).
 * 403 CHAT_NOT_ROOM_MEMBER, 404 CHAT_ROOM_NOT_FOUND.
 */
export const getRoomMessages = (roomId: string, cursor: string | undefined, signal?: AbortSignal) =>
  http.get<TChatMessagesPage>(`/chat/rooms/${encodeURIComponent(roomId)}/messages`, {
    query: { cursor, limit: CHAT_MESSAGES_PAGE_SIZE },
    signal,
  });
