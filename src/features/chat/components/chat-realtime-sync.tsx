import { useChatRealtime } from '../hooks/use-chat-realtime';

/** Keeps the chat cache in sync with the socket on every screen — mounted once in the root layout. Renders nothing. */
export function ChatRealtimeSync() {
  useChatRealtime();
  return null;
}
