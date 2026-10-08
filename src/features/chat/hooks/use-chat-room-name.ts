import { CHAT_UNKNOWN_USER_NAME } from '../constants/chat.constants';
import { useChatRooms } from './use-chat-rooms';

/**
 * Name of the other member of a room, from the rooms list already in cache (no room endpoint).
 * Empty while the list loads; room not on a loaded page / user gone → "Người dùng".
 */
export function useChatRoomName(roomId: string): string {
  const { data, isPending } = useChatRooms();
  if (isPending) return '';
  return data?.rooms.find((room) => room.roomId === roomId)?.otherUsername ?? CHAT_UNKNOWN_USER_NAME;
}
