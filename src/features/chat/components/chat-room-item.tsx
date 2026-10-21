import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Avatar, CountBadge } from '@/shared/components/atoms';
import { cn } from '@/shared/lib/utils';
import { formatRelativeTime } from '@/shared/utils';
import { TEXT } from '@/shared/theme';
import { CHAT_UNKNOWN_USER_NAME } from '../constants/chat.constants';
import type { TChatRoom } from '../types/chat.types';

export type TChatRoomItemProps = {
  room: TChatRoom;
  /** Logged-in user — own last message reads "Bạn: ...". */
  currentUserId: string;
  onPress: (room: TChatRoom) => void;
  /** One reference time for the whole list. */
  now?: number;
  className?: string;
};

/** One room in the chat list: avatar, name, last message, relative time, unread count. */
export const ChatRoomItem = memo(function ChatRoomItem({
  room,
  currentUserId,
  onPress,
  now,
  className,
}: TChatRoomItemProps) {
  const { otherUsername, otherUserAvatar, lastMessage, lastMessageAt, unreadCount } = room;
  const name = otherUsername ?? CHAT_UNKNOWN_USER_NAME;
  const unread = unreadCount > 0;
  const preview = lastMessage
    ? `${lastMessage.senderId === currentUserId ? 'Bạn: ' : ''}${lastMessage.message}`
    : 'Chưa có tin nhắn';
  const time = formatRelativeTime(lastMessageAt, now);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={unread ? `${name}, ${unreadCount} tin chưa đọc, ${time}` : `${name}, ${time}`}
      accessibilityHint="Mở cuộc trò chuyện"
      onPress={() => onPress(room)}
      className={cn('min-h-16 flex-row items-center gap-3 border-b border-border-subtle px-4 py-3 active:bg-surface', className)}
    >
      <Avatar src={otherUserAvatar} name={name} size="md" />
      <View className="min-w-0 flex-1 gap-0.5">
        <View className="flex-row items-baseline justify-between gap-2">
          <Text numberOfLines={1} className={cn(TEXT.bodyMedium, 'shrink', unread && 'font-semibold')}>
            {name}
          </Text>
          <Text className={cn(TEXT.bodySmall, 'shrink-0 text-muted-foreground')}>{time}</Text>
        </View>
        <View className="flex-row items-center justify-between gap-2">
          <Text
            numberOfLines={1}
            className={cn(TEXT.bodySmall, 'shrink', unread ? 'font-medium' : 'text-muted-foreground')}
          >
            {preview}
          </Text>
          <CountBadge count={unreadCount} className="shrink-0 border-0" />
        </View>
      </View>
    </Pressable>
  );
});
