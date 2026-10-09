import { View } from 'react-native';
import { Button } from '@/shared/components/atoms';
import { InfiniteList } from '@/shared/components/organisms';
import { useMarkAllNotificationsRead } from '../hooks/use-mark-all-notifications-read';
import { useNotifications } from '../hooks/use-notifications';
import { useOpenNotification } from '../hooks/use-open-notification';
import type { TNotification } from '../types/notification.types';
import { NotificationItem } from './notification-item';

const keyExtractor = (notification: TNotification) => notification.id;

/**
 * Notifications list (ui-ux.md §6 (1)): newest first, infinite + pull-to-refresh, unread highlighted.
 * Tap → mark read, REVIEW → its shop / product. "Đánh dấu đã đọc tất cả" on top.
 */
export function NotificationList({ className }: { className?: string }) {
  const query = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const { open, openingId } = useOpenNotification();
  const items = query.data?.items ?? [];
  const unreadCount = query.data?.unreadCount ?? 0;

  const header =
    items.length > 0 ? (
      <View className="flex-row justify-end border-b border-border-subtle px-2">
        <Button
          label="Đánh dấu đã đọc tất cả"
          variant="link"
          size="sm"
          disabled={unreadCount === 0 || markAllRead.isPending}
          onPress={() => markAllRead.mutate()}
        />
      </View>
    ) : null;

  return (
    <InfiniteList
      query={query}
      items={items}
      keyExtractor={keyExtractor}
      renderItem={(notification) => (
        <NotificationItem
          notification={notification}
          onPress={open}
          isOpening={notification.type === 'REVIEW' && notification.referenceId === openingId}
        />
      )}
      header={header}
      emptyIcon="notifications-off-outline"
      emptyTitle="Chưa có thông báo nào"
      accessibilityLabel="Danh sách thông báo"
      className={className}
    />
  );
}
