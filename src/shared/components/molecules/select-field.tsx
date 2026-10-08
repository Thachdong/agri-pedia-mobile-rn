import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { AppSheet, AppSheetFlatList, AppSheetTextInput, useAppSheet } from '@/shared/lib/sheet';
import { cn } from '@/shared/lib/utils';
import { colors, TEXT } from '@/shared/theme';

export type TSelectOption<T extends string> = { value: T; label: string };

export type TSelectFieldProps<T extends string> = {
  label: string;
  options: readonly TSelectOption<T>[];
  value: T | null | undefined;
  onChange: (value: T) => void;
  placeholder?: string;
  required?: boolean;
  /** Translated message (schema / server / load error). */
  error?: string;
  /** Options are loading → field disabled with a spinner. */
  loading?: boolean;
  /** Shown with the error when options failed to load. */
  onRetry?: () => void;
  disabled?: boolean;
  /** Search box in the sheet. Default: on when there are more than 8 options. */
  searchable?: boolean;
  /** Sheet text when there are no options at all (e.g. "Chọn tỉnh/thành phố trước"). */
  emptyText?: string;
  className?: string;
};

const SEARCHABLE_FROM = 8;

/** Lowercase, no Vietnamese diacritics — "Hà Nội" matches "ha noi". */
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim();

/** Field that opens a bottom sheet of options (province, ward, business type). Optional diacritic-insensitive search. */
export function SelectField<T extends string>({
  label,
  options,
  value,
  onChange,
  placeholder = 'Chọn',
  required,
  error,
  loading = false,
  onRetry,
  disabled = false,
  searchable,
  emptyText = 'Không có lựa chọn',
  className,
}: TSelectFieldProps<T>) {
  const sheet = useAppSheet();
  const [query, setQuery] = useState('');
  const isDisabled = disabled || loading;
  const showSearch = searchable ?? options.length > SEARCHABLE_FROM;
  const selected = options.find((option) => option.value === value);

  const filtered = useMemo(() => {
    const needle = normalize(query);
    return needle ? options.filter((option) => normalize(option.label).includes(needle)) : options;
  }, [options, query]);

  const choose = (next: T) => {
    onChange(next);
    sheet.close();
  };

  return (
    <View className={cn('gap-1.5', className)}>
      <Text className={cn(TEXT.labelLarge, 'text-foreground')}>
        {label}
        {required && <Text className="text-destructive"> *</Text>}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? placeholder}`}
        accessibilityHint={error}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        disabled={isDisabled}
        onPress={sheet.open}
        className={cn(
          'min-h-12 flex-row items-center gap-2 rounded-lg border border-input bg-background px-3',
          error && 'border-destructive',
          isDisabled && 'bg-muted opacity-60',
        )}
      >
        <Text
          numberOfLines={1}
          className={cn('flex-1 text-base', selected ? 'text-foreground' : 'text-muted-foreground')}
        >
          {loading ? 'Đang tải...' : (selected?.label ?? placeholder)}
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color={colors.mutedForeground} />
        ) : (
          <Text className={cn(TEXT.labelLarge, 'text-muted-foreground')}>▾</Text>
        )}
      </Pressable>
      {error && (
        <View className="flex-row flex-wrap items-center gap-x-2">
          <Text accessibilityLiveRegion="polite" className={cn(TEXT.bodySmall, 'text-destructive')}>
            {error}
          </Text>
          {onRetry && (
            <Pressable accessibilityRole="button" onPress={onRetry} hitSlop={12}>
              <Text className={cn(TEXT.labelMedium, 'text-highlight underline')}>Thử lại</Text>
            </Pressable>
          )}
        </View>
      )}

      <AppSheet sheetRef={sheet.ref} accessibilityLabel={label} onDismiss={() => setQuery('')}>
        <View className="gap-3 px-4 pb-6 pt-1">
          <Text accessibilityRole="header" className={TEXT.titleMedium}>
            {label}
          </Text>
          {showSearch && (
            <AppSheetTextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Tìm kiếm"
              placeholderTextColor={colors.mutedForeground}
              autoCorrect={false}
              accessibilityLabel={`Tìm ${label.toLowerCase()}`}
              className="min-h-11 rounded-lg border border-input bg-background px-3 text-base text-foreground"
            />
          )}
          <View className={cn(options.length > SEARCHABLE_FROM ? 'h-96' : 'max-h-96')}>
            <AppSheetFlatList
              data={filtered}
              keyExtractor={(option: TSelectOption<T>) => option.value}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text className={cn(TEXT.bodyMedium, 'py-6 text-center text-muted-foreground')}>
                  {options.length === 0 ? emptyText : 'Không tìm thấy kết quả'}
                </Text>
              }
              renderItem={({ item }: { item: TSelectOption<T> }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    onPress={() => choose(item.value)}
                    className={cn(
                      'min-h-12 flex-row items-center justify-between gap-2 rounded-md px-3 active:bg-surface',
                      isSelected && 'bg-surface',
                    )}
                  >
                    <Text className={cn(TEXT.bodyLarge, 'flex-1', isSelected && 'font-semibold text-primary')}>
                      {item.label}
                    </Text>
                    {isSelected && <Text className={cn(TEXT.labelLarge, 'text-primary')}>✓</Text>}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </AppSheet>
    </View>
  );
}
