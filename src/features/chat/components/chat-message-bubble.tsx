import { memo } from 'react';
import { Text, View } from 'react-native';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import type { TChatMessage } from '../types/chat.types';
import { formatMessageTime } from '../utils/chat-time.util';

export type TChatMessageBubbleProps = {
  message: TChatMessage;
  /** Sent by the logged-in user → right, primary; otherwise left, surface. */
  mine: boolean;
  className?: string;
};

/** One message: text + send time. 1-1 chat → no sender name. */
export const ChatMessageBubble = memo(function ChatMessageBubble({ message, mine, className }: TChatMessageBubbleProps) {
  const time = formatMessageTime(message.createdAt);
  return (
    <View
      accessible
      accessibilityLabel={`${mine ? 'Bạn' : 'Họ'}: ${message.message}, ${time}`}
      className={cn('max-w-[80%] gap-0.5 rounded-2xl px-3 py-2', mine ? 'self-end bg-primary' : 'self-start bg-surface', className)}
    >
      <Text selectable className={cn(TEXT.bodyMedium, mine && 'text-primary-foreground')}>
        {message.message}
      </Text>
      <Text className={cn(TEXT.labelSmall, 'self-end', mine ? 'text-primary-foreground opacity-80' : 'text-muted-foreground')}>
        {time}
      </Text>
    </View>
  );
});
