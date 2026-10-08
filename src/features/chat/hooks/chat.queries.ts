import { appInfiniteQueryOptions, queryKeys } from '@/shared/lib/query';
import { getChatRooms, getRoomMessages } from '../services/chat.service';

/** Rooms, latest message first, cursor pages. `silent`: lists show errors inline, no toast on top. */
export const chatRoomsQuery = () =>
  appInfiniteQueryOptions({
    queryKey: queryKeys.chat.rooms(),
    queryFn: ({ pageParam, signal }) => getChatRooms(pageParam, signal),
    meta: { silent: true },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });

/** Messages of one room — page 0 = newest, the next page is OLDER (scroll up). */
export const roomMessagesQuery = (roomId: string) =>
  appInfiniteQueryOptions({
    queryKey: queryKeys.chat.messages(roomId),
    queryFn: ({ pageParam, signal }) => getRoomMessages(roomId, pageParam, signal),
    meta: { silent: true },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
