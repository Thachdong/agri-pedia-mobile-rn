import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ROUTES } from '@/shared/constants';
import { colors } from '@/shared/theme';
import { useRoomWithUser } from '../hooks/use-room-with-user';
import { ChatConversation } from './chat-conversation';

export type TChatWithUserProps = {
  userId: string;
  /** Logged-in user. */
  currentUserId: string;
  /** Height of the screen header above (keyboard offset). */
  headerHeight: number;
};

/**
 * Chat with one user (profile "Chat", ui-ux.md §7 M2 as a screen): room already there → replaced by that room's screen;
 * none → empty conversation, the first message creates the room and this screen becomes the room screen.
 */
export function ChatWithUser({ userId, currentUserId, headerHeight }: TChatWithUserProps) {
  const router = useRouter();
  const roomId = useRoomWithUser(userId);

  useEffect(() => {
    if (roomId) router.replace(ROUTES.chatRoom(roomId));
  }, [roomId, router]);

  if (roomId !== null) {
    return (
      <View className="flex-1 items-center justify-center" accessibilityLabel="Đang mở cuộc trò chuyện">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ChatConversation
      target={{ receiverId: userId }}
      currentUserId={currentUserId}
      headerHeight={headerHeight}
      onRoomCreated={(createdRoomId) => router.replace(ROUTES.chatRoom(createdRoomId))}
    />
  );
}
