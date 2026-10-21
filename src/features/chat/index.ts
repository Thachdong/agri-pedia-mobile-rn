// Public API of the `chat` feature. Other features and src/app import only this file.
export { ChatConversation, type TChatConversationProps, type TChatTarget } from './components/chat-conversation';
export { ChatHeaderButton } from './components/chat-header-button';
export { ChatRealtimeSync } from './components/chat-realtime-sync';
export { ChatRoomItem, type TChatRoomItemProps } from './components/chat-room-item';
export { ChatRoomList } from './components/chat-room-list';
export { ChatWithUser, type TChatWithUserProps } from './components/chat-with-user';
export { chatRoomsQuery, roomMessagesQuery } from './hooks/chat.queries';
export { useChatRoomName } from './hooks/use-chat-room-name';
export { useChatRooms } from './hooks/use-chat-rooms';
export { useRoomMessages } from './hooks/use-room-messages';
export { useSendMessage } from './hooks/use-send-message';
export { formatReportMessage } from './utils/report-message.util';
export type {
  TChatMessage,
  TChatRoom,
  TChatRoomsView,
  TSendMessageAck,
  TSendMessageInput,
} from './types/chat.types';
