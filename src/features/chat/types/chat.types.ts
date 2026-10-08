import type { TApiSchema } from '@/shared/lib/http';

/** One room of GET /chat/rooms — `otherUserAvatar` is a signed read URL (expires), never persisted. */
export type TChatRoom = TApiSchema<'ChatRoomResponse'>;
export type TChatRoomsPage = TApiSchema<'ListMyChatRoomsResponse'>;

/** All loaded pages merged — the rooms list and the header badge read this one result. */
export type TChatRoomsView = {
  rooms: TChatRoom[];
  /** Unread over EVERY room (server-side), not only the loaded pages. */
  totalUnread: number;
};

/** One message of GET /chat/rooms/{roomId}/messages. */
export type TChatMessage = TApiSchema<'RoomMessageResponse'>;
export type TChatMessagesPage = TApiSchema<'ListRoomMessagesResponse'>;

/** Infinite-query cache of a room's messages: page 0 = newest, each page newest first. */
export type TChatMessagesCache = { pages: TChatMessagesPage[]; pageParams: unknown[] };

/**
 * Socket `chat.message.send` (not in openapi — api.md 16). `roomId` wins over `receiverId`;
 * `receiverId` only for a first message to someone without a room yet.
 */
export type TSendMessageInput = { roomId?: string; receiverId?: string; message: string };
/** Ack of `chat.message.send`; `createdAt` ISO string. */
export type TSendMessageAck = { messageId: string; roomId: string; createdAt: string };

/** Socket `chat.message.received` (server → the other member); no sender username / avatar. */
export type TChatMessageReceivedEvent = {
  messageId: string;
  roomId: string;
  senderId: string;
  message: string;
  createdAt: string;
};
