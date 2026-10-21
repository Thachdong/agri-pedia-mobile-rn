import { useChatRooms } from './use-chat-rooms';

/**
 * Existing room with `userId` among the loaded room pages (no endpoint looks a room up by member).
 * `undefined` while rooms load; `null` = none loaded → a first message by `receiverId` (the server also reuses
 * an existing room for the pair, so a room on a later page is not duplicated).
 */
export function useRoomWithUser(userId: string): string | null | undefined {
  const { data, isPending, isError } = useChatRooms();
  if (isPending) return undefined;
  if (isError) return null;
  return data?.rooms.find((room) => room.otherUserId === userId)?.roomId ?? null;
}
