import { useRouter } from 'expo-router';
import { IconBadgeButton } from '@/shared/components/molecules';
import { ROUTES } from '@/shared/constants';
import { useNotifications } from '../hooks/use-notifications';

/** Header (1) (ui-ux.md §6): bell + unread badge ("N+" when more may be unread) → notifications list. Logged-in header only. */
export function NotificationHeaderButton() {
  const router = useRouter();
  const { data } = useNotifications();
  return (
    <IconBadgeButton
      icon="notifications-outline"
      accessibilityLabel="Thông báo"
      count={data?.unreadCount ?? 0}
      countAtLeast={data?.unreadCountIsLowerBound}
      onPress={() => router.push(ROUTES.notifications)}
    />
  );
}
