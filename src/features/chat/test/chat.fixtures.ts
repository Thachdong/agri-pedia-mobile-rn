import type { TChatMessage, TChatMessagesPage, TChatRoom, TChatRoomsPage } from '../types/chat.types';

/** One room of GET /chat/rooms. */
export const chatRoom = (overrides: Partial<TChatRoom> = {}): TChatRoom => ({
  roomId: 'r1',
  otherUserId: 'u2',
  otherUsername: 'Đại lý Minh Phát',
  otherUserAvatar: null,
  lastMessage: { messageId: 'm1', senderId: 'u2', message: 'Chào anh', type: 'TEXT', diagnosisId: null },
  lastMessageAt: '2026-10-08T10:00:00.000Z',
  unreadCount: 0,
  ...overrides,
});

export const chatRoomsPage = (overrides: Partial<TChatRoomsPage> = {}): TChatRoomsPage => ({
  totalUnread: 0,
  rooms: [chatRoom()],
  nextCursor: null,
  ...overrides,
});

/** One message of GET /chat/rooms/{roomId}/messages. */
export const chatMessage = (overrides: Partial<TChatMessage> = {}): TChatMessage => ({
  id: 'm1',
  senderId: 'u2',
  senderUsername: 'Đại lý Minh Phát',
  senderAvatar: null,
  message: 'Chào anh',
  type: 'TEXT',
  diagnosisId: null,
  createdAt: '2026-10-08T10:00:00.000Z',
  ...overrides,
});

export const chatMessagesPage = (overrides: Partial<TChatMessagesPage> = {}): TChatMessagesPage => ({
  messages: [chatMessage()],
  nextCursor: null,
  ...overrides,
});
