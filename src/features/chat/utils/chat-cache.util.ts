import type { TChatMessage, TChatMessagesCache } from '../types/chat.types';

/**
 * Adds the newest message at the top of page 0 (cache is newest first). No-op when the room isn't loaded
 * or the id is already there (a message can arrive by ack and by push / refetch).
 */
export function prependMessage(cache: TChatMessagesCache | undefined, message: TChatMessage) {
  if (!cache) return cache;
  if (cache.pages.some((page) => page.messages.some((item) => item.id === message.id))) return cache;
  const [first, ...rest] = cache.pages;
  if (!first) return cache;
  return { ...cache, pages: [{ ...first, messages: [message, ...first.messages] }, ...rest] };
}
