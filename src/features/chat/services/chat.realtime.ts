import { realtimeClient } from '@/shared/lib/realtime';
import type { TSendMessageAck, TSendMessageInput } from '../types/chat.types';

/** Socket event names (api.md 16, 32 — Realtime events). */
export const CHAT_EVENTS = {
  send: 'chat.message.send',
  received: 'chat.message.received',
  enterRoom: 'chat.room.enter',
  leaveRoom: 'chat.room.leave',
} as const;

/** Errors: CHAT_ROOM_OR_RECEIVER_REQUIRED, CHAT_SENDER_NOT_ALLOWED, CHAT_ROOM_NOT_FOUND, CHAT_NOT_ROOM_MEMBER,
 *  CHAT_RECEIVER_NOT_FOUND, CHAT_INVALID_RECEIVER, CHAT_INVALID_MESSAGE. */
export const sendMessage = (input: TSendMessageInput) =>
  realtimeClient.emitWithAck<TSendMessageAck, TSendMessageInput>(CHAT_EVENTS.send, input);

/** Marks every message of the room read; messages arriving while entered are read at once. */
export const enterRoom = (roomId: string) =>
  realtimeClient.emitWithAck<{ roomId: string }>(CHAT_EVENTS.enterRoom, { roomId });

/** New messages count as unread again. */
export const leaveRoom = (roomId: string) =>
  realtimeClient.emitWithAck<{ roomId: string }>(CHAT_EVENTS.leaveRoom, { roomId });
