import { useRouter } from 'expo-router';
import { IconBadgeButton } from '@/shared/components/molecules';
import { ROUTES } from '@/shared/constants';
import { useChatRooms } from '../hooks/use-chat-rooms';

/** Header (2) (ui-ux.md §6): chat icon + total unread badge → chat list. Logged-in header only. */
export function ChatHeaderButton() {
  const router = useRouter();
  const { data } = useChatRooms();
  return (
    <IconBadgeButton
      icon="chatbubbles-outline"
      accessibilityLabel="Tin nhắn"
      count={data?.totalUnread ?? 0}
      onPress={() => router.push(ROUTES.chat)}
    />
  );
}
