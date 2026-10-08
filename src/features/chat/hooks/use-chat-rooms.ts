import { useAppInfiniteQuery } from '@/shared/lib/query';
import type { TChatRoomsPage, TChatRoomsView } from '../types/chat.types';
import { chatRoomsQuery } from './chat.queries';

// totalUnread from the first page: a refetch always reloads page 0 first, and the server counts every room.
const toView = ({ pages }: { pages: TChatRoomsPage[] }): TChatRoomsView => ({
  rooms: pages.flatMap((page) => page.rooms),
  totalUnread: pages[0]?.totalUnread ?? 0,
});

/** Rooms list + header badge (one query). `enabled: false` for guests (endpoint needs a login). */
export const useChatRooms = ({ enabled = true }: { enabled?: boolean } = {}) =>
  useAppInfiniteQuery({ ...chatRoomsQuery(), select: toView, enabled });
