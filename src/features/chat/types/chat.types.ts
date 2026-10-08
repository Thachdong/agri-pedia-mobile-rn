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
