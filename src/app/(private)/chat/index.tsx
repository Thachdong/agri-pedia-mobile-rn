import { ChatRoomList } from '@/features/chat';
import { ScreenHeader } from '@/shared/components/organisms';
import { ScreenLayout } from '@/shared/components/templates';

/** Chat list (ui-ux.md §6 (2)) — opened from the header chat icon. */
export default function ChatListScreen() {
  return (
    <ScreenLayout header={<ScreenHeader title="Tin nhắn" />}>
      <ChatRoomList />
    </ScreenLayout>
  );
}
