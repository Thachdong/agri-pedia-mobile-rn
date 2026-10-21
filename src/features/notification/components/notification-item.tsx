import { memo } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Icon, type TIconName } from '@/shared/components/atoms';
import { cn } from '@/shared/lib/utils';
import { colors, TEXT } from '@/shared/theme';
import { formatRelativeTime } from '@/shared/utils';
import type { TNotification, TNotificationType } from '../types/notification.types';

const TYPE_ICONS: Record<TNotificationType, TIconName> = {
  PLATFORM: 'notifications-outline',
  REVIEW: 'star-outline',
};

export type TNotificationItemProps = {
  notification: TNotification;
  onPress: (notification: TNotification) => void;
  /** Its target is being resolved (REVIEW) — spinner instead of the unread dot. */
  isOpening?: boolean;
  /** One reference time for the whole list. */
  now?: number;
  className?: string;
};

/** One notification: icon by type, label, content, relative time; unread → highlighted background + dot. */
export const NotificationItem = memo(function NotificationItem({
  notification,
  onPress,
  isOpening = false,
  now,
  className,
}: TNotificationItemProps) {
  const { type, label, content, isRead, createdAt } = notification;
  const time = formatRelativeTime(createdAt, now);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${isRead ? '' : 'Chưa đọc, '}${label}, ${content}, ${time}`}
      accessibilityHint={type === 'REVIEW' ? 'Mở đánh giá' : undefined}
      accessibilityState={{ busy: isOpening }}
      onPress={() => onPress(notification)}
      className={cn(
        'min-h-16 flex-row items-start gap-3 border-b border-border-subtle px-4 py-3',
        isRead ? 'active:bg-surface' : 'bg-highlight-subtle active:opacity-80',
        className,
      )}
    >
      <View className="pt-0.5">
        <Icon name={TYPE_ICONS[type]} color={isRead ? 'mutedForeground' : 'highlight'} />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <Text numberOfLines={1} className={cn(TEXT.bodyMedium, !isRead && 'font-semibold')}>
          {label}
        </Text>
        <Text numberOfLines={2} className={cn(TEXT.bodySmall, 'text-muted-foreground')}>
          {content}
        </Text>
        <Text className={cn(TEXT.bodySmall, 'text-muted-foreground')}>{time}</Text>
      </View>
      {isOpening ? (
        <ActivityIndicator size="small" color={colors.highlight} />
      ) : (
        !isRead && <View className="mt-1.5 h-2 w-2 rounded-full bg-highlight" />
      )}
    </Pressable>
  );
});
