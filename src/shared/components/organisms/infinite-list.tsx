import { useCallback, useEffect, useImperativeHandle, useRef, useState, type ReactElement, type Ref } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import { getErrorMessage } from '@/shared/lib/http';
import { cn } from '@/shared/lib/utils';
import { colors, TEXT } from '@/shared/theme';
import { Button, type TIconName } from '../atoms';
import { EmptyState } from '../molecules';

/** The infinite-query fields the list reads — what `useAppInfiniteQuery` returns, whatever the pagination (cursor / page). */
export type TInfiniteListQuery = {
  /** First page not loaded yet (also while the query is disabled, e.g. waiting for a location). */
  isPending: boolean;
  /** First-page error — a next-page error keeps the loaded items (`isFetchNextPageError`). */
  isError: boolean;
  error: unknown;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  fetchNextPage: () => unknown;
  refetch: () => Promise<unknown>;
};

export type TInfiniteListHandle = {
  /** Scrolls so the item with this key is in the middle of the list (no-op when not loaded). */
  scrollToItem: (key: string) => void;
};

export type TInfiniteListProps<T> = {
  ref?: Ref<TInfiniteListHandle>;
  query: TInfiniteListQuery;
  items: readonly T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T, index: number) => ReactElement;
  /** Shown when the first page came back empty. */
  emptyTitle: string;
  emptyDescription?: string;
  emptyIcon?: TIconName;
  /** Above the items (e.g. a note on the result); hidden while loading / on error. */
  header?: ReactElement | null;
  className?: string;
  contentContainerClassName?: string;
  accessibilityLabel?: string;
};

const SCROLL_RETRY_MS = 100;
const END_REACHED_THRESHOLD = 0.5;

/**
 * The one infinite list of the app (decision 4): first-page loading / error + retry / empty, `onEndReached` →
 * next page, footer spinner or inline retry, pull-to-refresh. Rows come from `renderItem`; keep them memoized.
 */
export function InfiniteList<T>({
  ref,
  query,
  items,
  keyExtractor,
  renderItem,
  emptyTitle,
  emptyDescription,
  emptyIcon = 'file-tray-outline',
  header,
  className,
  contentContainerClassName,
  accessibilityLabel,
}: TInfiniteListProps<T>) {
  const listRef = useRef<FlatList<T>>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isPending, isError, error, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage, refetch } =
    query;

  useEffect(() => () => clearTimeout(retryTimerRef.current), []);

  useImperativeHandle(
    ref,
    () => ({
      scrollToItem: (key) => {
        const index = items.findIndex((item) => keyExtractor(item) === key);
        if (index >= 0) listRef.current?.scrollToIndex({ index, viewPosition: 0.5, animated: true });
      },
    }),
    [items, keyExtractor],
  );

  // Target row not measured yet → jump near it, then retry once it has rendered.
  const onScrollToIndexFailed = useCallback(
    ({ index, averageItemLength }: { index: number; averageItemLength: number }) => {
      listRef.current?.scrollToOffset({ offset: averageItemLength * index, animated: false });
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = setTimeout(
        () => listRef.current?.scrollToIndex({ index, viewPosition: 0.5, animated: true }),
        SCROLL_RETRY_MS,
      );
    },
    [],
  );

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  if (isPending) {
    return (
      <View className={cn('flex-1 items-center justify-center py-8', className)} accessibilityLabel="Đang tải">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Không tải được dữ liệu"
        description={getErrorMessage(error)}
        action={<Button label="Thử lại" variant="outline" size="sm" onPress={() => void refetch()} />}
        className={className}
      />
    );
  }

  const footer = isFetchingNextPage ? (
    <View className="items-center py-4" accessibilityLabel="Đang tải thêm">
      <ActivityIndicator color={colors.primary} />
    </View>
  ) : isFetchNextPageError ? (
    <View className="items-center gap-2 py-4">
      <Text className={cn(TEXT.bodySmall, 'text-center text-muted-foreground')}>Không tải được thêm.</Text>
      <Button label="Thử lại" variant="outline" size="sm" onPress={() => void fetchNextPage()} />
    </View>
  ) : null;

  return (
    <FlatList
      ref={listRef}
      data={items}
      keyExtractor={keyExtractor}
      renderItem={({ item, index }) => renderItem(item, index)}
      ListHeaderComponent={header}
      ListEmptyComponent={<EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />}
      ListFooterComponent={footer}
      onEndReached={onEndReached}
      onEndReachedThreshold={END_REACHED_THRESHOLD}
      onScrollToIndexFailed={onScrollToIndexFailed}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => void onRefresh()}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      keyboardShouldPersistTaps="handled"
      accessibilityLabel={accessibilityLabel}
      className={cn('flex-1', className)}
      contentContainerClassName={cn('grow', contentContainerClassName)}
    />
  );
}
