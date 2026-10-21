import { NotificationList } from '@/features/notification';
import { ScreenHeader } from '@/shared/components/organisms';
import { ScreenLayout } from '@/shared/components/templates';

/** Notifications list (ui-ux.md §6 (1)) — opened from the header bell. */
export default function NotificationsScreen() {
  return (
    <ScreenLayout header={<ScreenHeader title="Thông báo" />}>
      <NotificationList />
    </ScreenLayout>
  );
}
