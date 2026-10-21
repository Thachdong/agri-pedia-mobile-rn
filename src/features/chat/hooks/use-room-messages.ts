import { useAppInfiniteQuery } from '@/shared/lib/query';
import type { TChatMessage, TChatMessagesPage } from '../types/chat.types';
import { roomMessagesQuery } from './chat.queries';

/** Newest first, as the API returns them — the conversation list is `inverted`, so no reversing. */
const toMessages = ({ pages }: { pages: TChatMessagesPage[] }): TChatMessage[] => pages.flatMap((page) => page.messages);

/** `roomId` null = new conversation (no room yet) → no request, no messages. */
export const useRoomMessages = (roomId: string | null) =>
  useAppInfiniteQuery({ ...roomMessagesQuery(roomId ?? ''), select: toMessages, enabled: roomId !== null });
