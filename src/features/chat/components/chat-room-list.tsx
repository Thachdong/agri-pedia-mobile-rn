import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useSession } from '@/features/auth';
import { InfiniteList } from '@/shared/components/organisms';
import { ROUTES } from '@/shared/constants';
import { useChatRooms } from '../hooks/use-chat-rooms';
import type { TChatRoom } from '../types/chat.types';
import { ChatRoomItem } from './chat-room-item';

const keyExtractor = (room: TChatRoom) => room.roomId;

/** Chat list (ui-ux.md §6 (2)): rooms, latest message first, infinite + pull-to-refresh → conversation. */
export function ChatRoomList({ className }: { className?: string }) {
  const router = useRouter();
  const session = useSession();
  const query = useChatRooms();
  const currentUserId = session.user?.id ?? '';

  const openRoom = useCallback((room: TChatRoom) => router.push(ROUTES.chatRoom(room.roomId)), [router]);

  return (
    <InfiniteList
      query={query}
      items={query.data?.rooms ?? []}
      keyExtractor={keyExtractor}
      renderItem={(room) => <ChatRoomItem room={room} currentUserId={currentUserId} onPress={openRoom} />}
      emptyIcon="chatbubbles-outline"
      emptyTitle="Chưa có cuộc trò chuyện nào"
      emptyDescription="Mở trang nhà phân phối để bắt đầu chat."
      accessibilityLabel="Danh sách tin nhắn"
      className={className}
    />
  );
}

