import { useLocalSearchParams } from 'expo-router';
import { useSession } from '@/features/auth';
import { ChatConversation, useChatRoomName } from '@/features/chat';
import { SCREEN_HEADER_HEIGHT, ScreenHeader } from '@/shared/components/organisms';
import { ScreenLayout } from '@/shared/components/templates';

/** Conversation of one room — opened from the chat list. */
export default function ChatRoomScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const session = useSession();
  const name = useChatRoomName(roomId);

  return (
    <ScreenLayout header={<ScreenHeader title={name} />}>
      <ChatConversation
        key={roomId}
        target={{ roomId }}
        currentUserId={session.user?.id ?? ''}
        headerHeight={SCREEN_HEADER_HEIGHT}
      />
    </ScreenLayout>
  );
}
