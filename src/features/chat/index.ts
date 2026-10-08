// Public API of the `chat` feature. Other features and src/app import only this file.
export { ChatConversation, type TChatConversationProps, type TChatTarget } from './components/chat-conversation';
export { chatRoomsQuery, roomMessagesQuery } from './hooks/chat.queries';
export { useChatRealtime } from './hooks/use-chat-realtime';
export { useChatRooms } from './hooks/use-chat-rooms';
export { useRoomMessages } from './hooks/use-room-messages';
export { useRoomPresence } from './hooks/use-room-presence';
export { useSendMessage } from './hooks/use-send-message';
export type {
  TChatMessage,
  TChatRoom,
  TChatRoomsView,
  TSendMessageAck,
  TSendMessageInput,
} from './types/chat.types';
