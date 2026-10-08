import { useCallback, useState, useSyncExternalStore } from 'react';
import { ActivityIndicator, AppState, FlatList, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, IconButton, Input } from '@/shared/components/atoms';
import { EmptyState } from '@/shared/components/molecules';
import { applyServerErrors, FormField, useAppForm } from '@/shared/lib/form';
import { getErrorMessage } from '@/shared/lib/http';
import { useRealtimeStatus } from '@/shared/lib/realtime';
import { cn } from '@/shared/lib/utils';
import { colors, TEXT } from '@/shared/theme';
import { useRoomMessages } from '../hooks/use-room-messages';
import { useRoomPresence } from '../hooks/use-room-presence';
import { useSendMessage } from '../hooks/use-send-message';
import { chatMessageSchema } from '../schemas/chat-message.schema';
import type { TChatMessage, TChatMessageFormValues } from '../types/chat.types';
import { ChatMessageBubble } from './chat-message-bubble';

/** Existing room → `roomId`; first message to someone (profile M2, later) → `receiverId`. */
export type TChatTarget = { roomId: string; receiverId?: never } | { roomId?: never; receiverId: string };

export type TChatConversationProps = {
  target: TChatTarget;
  /** Logged-in user. */
  currentUserId: string;
  /** Height of what sits above this component (screen header) — keeps the composer above the keyboard. */
  headerHeight: number;
  /** First message sent with `receiverId` created a room. */
  onRoomCreated?: (roomId: string) => void;
  className?: string;
};

const DEFAULT_VALUES: TChatMessageFormValues = { message: '' };
const EMPTY_HINT = 'Chưa có tin nhắn. Hãy gửi lời chào đầu tiên!';
const keyExtractor = (message: TChatMessage) => message.id;

const subscribeAppState = (onChange: () => void) => {
  const subscription = AppState.addEventListener('change', onChange);
  return () => subscription.remove();
};
const isAppActive = () => AppState.currentState === 'active';

/**
 * Conversation (chat screen, later profile M2): messages newest at the bottom (inverted list, scroll up loads
 * older), composer sent through the socket. On screen + app in foreground → room entered (messages marked read).
 * No room yet → empty, the first message goes by `receiverId`, the ack's room is used from then on.
 */
export function ChatConversation({ target, currentUserId, headerHeight, onRoomCreated, className }: TChatConversationProps) {
  // react-hook-form's `formState` mutates one stable object — opt out of React Compiler memoization here.
  'use no memo';
  const insets = useSafeAreaInsets();
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const roomId = target.roomId ?? createdRoomId;

  const appActive = useSyncExternalStore(subscribeAppState, isAppActive);
  const status = useRealtimeStatus();
  useRoomPresence(roomId, appActive);
  const messages = useRoomMessages(roomId);
  const send = useSendMessage(currentUserId);
  const form = useAppForm<TChatMessageFormValues>({ schema: chatMessageSchema, defaultValues: DEFAULT_VALUES });
  const { errors } = form.formState;
  const formError = errors.message?.message ?? errors.root?.server?.message;

  const onSubmit = form.handleSubmit(async ({ message }) => {
    try {
      const ack = await send.mutateAsync(roomId ? { roomId, message } : { receiverId: target.receiverId, message });
      if (!roomId) {
        setCreatedRoomId(ack.roomId);
        onRoomCreated?.(ack.roomId);
      }
      form.reset(DEFAULT_VALUES);
    } catch (error) {
      applyServerErrors(form, error);
    }
  });

  const renderItem = useCallback(
    ({ item }: { item: TChatMessage }) => <ChatMessageBubble message={item} mine={item.senderId === currentUserId} />,
    [currentUserId],
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top + headerHeight}
      className={cn('flex-1 bg-background', className)}
    >
      {status !== 'connected' && (
        <View accessibilityLiveRegion="polite" className="bg-highlight-subtle px-4 py-1.5">
          <Text className={cn(TEXT.bodySmall, 'text-center text-highlight')}>Đang kết nối máy chủ chat…</Text>
        </View>
      )}

      <MessageList roomId={roomId} messages={messages} renderItem={renderItem} />

      <View className="gap-1 border-t border-border-subtle px-3 py-2">
        <View className="flex-row items-end gap-2">
          <FormField
            control={form.control}
            name="message"
            render={({ value, onChange, onBlur, ref }) => (
              <Input
                ref={ref}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                maxLength={2000}
                placeholder="Nhập tin nhắn…"
                accessibilityLabel="Tin nhắn"
                invalid={!!formError}
                className="max-h-32 min-h-11 flex-1 py-2.5"
              />
            )}
          />
          {send.isPending ? (
            <View className="min-h-11 min-w-11 items-center justify-center" accessibilityLabel="Đang gửi">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <IconButton icon="send" color="primary" accessibilityLabel="Gửi" onPress={() => void onSubmit()} />
          )}
        </View>
        {formError ? (
          <Text accessibilityRole="alert" className={cn(TEXT.bodySmall, 'text-destructive')}>
            {formError}
          </Text>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

type TMessageListProps = {
  roomId: string | null;
  messages: ReturnType<typeof useRoomMessages>;
  renderItem: ({ item }: { item: TChatMessage }) => React.ReactElement;
};

function MessageList({ roomId, messages, renderItem }: TMessageListProps) {
  const { data, isPending, isError, error, refetch, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } =
    messages;

  const loadOlder = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);
  // Before the early returns: past `isError`, the query type narrows and drops `fetchNextPage`.
  const retryOlder = useCallback(() => void fetchNextPage(), [fetchNextPage]);

  if (!roomId) return <EmptyState icon="chatbubble-ellipses-outline" title={EMPTY_HINT} className="flex-1" />;
  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center" accessibilityLabel="Đang tải tin nhắn">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (isError) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Không tải được tin nhắn"
        description={getErrorMessage(error)}
        action={<Button label="Thử lại" variant="outline" size="sm" onPress={() => void refetch()} />}
        className="flex-1"
      />
    );
  }

  // Not in the inverted list: an empty component would render upside down on some RN versions.
  if (!data?.length) return <EmptyState icon="chatbubble-ellipses-outline" title={EMPTY_HINT} className="flex-1" />;

  // Inverted: the footer renders at the TOP (older messages side).
  const olderStatus = isFetchingNextPage ? (
    <View className="items-center py-3" accessibilityLabel="Đang tải tin cũ hơn">
      <ActivityIndicator color={colors.primary} />
    </View>
  ) : isFetchNextPageError ? (
    <View className="items-center py-2">
      <Button label="Tải tin cũ thất bại — thử lại" variant="ghost" size="sm" onPress={retryOlder} />
    </View>
  ) : null;

  return (
    <FlatList
      inverted
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      onEndReached={loadOlder}
      onEndReachedThreshold={0.5}
      ListFooterComponent={olderStatus}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      accessibilityLabel="Tin nhắn"
      className="flex-1"
      contentContainerClassName="grow gap-1.5 px-4 py-3"
    />
  );
}
