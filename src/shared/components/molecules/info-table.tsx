import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';

export type TInfoTableItem = {
  /** Stable key; defaults to `label`. */
  id?: string;
  label: string;
  /** String → body text; other nodes render as is. `null` / `undefined` / "" → `emptyText`. */
  value?: ReactNode;
};

export type TInfoTableProps = {
  items: readonly TInfoTableItem[];
  emptyText?: string;
  className?: string;
};

const isEmpty = (value: ReactNode) => value === null || value === undefined || value === '';

/**
 * Label / value table (distributor info — ui-ux.md §7). Phone width: label above value (same as web mobile).
 */
export function InfoTable({ items, emptyText = 'Chưa cập nhật', className }: TInfoTableProps) {
  return (
    <View className={cn('overflow-hidden rounded-lg border border-border-subtle', className)}>
      {items.map(({ id, label, value }, index) => (
        <View key={id ?? label} className={cn(index > 0 && 'border-t border-border-subtle')}>
          <Text className={cn(TEXT.labelLarge, 'bg-surface px-4 pb-1 pt-3 text-surface-foreground')}>{label}</Text>
          <View className="px-4 pb-3 pt-1">
            {isEmpty(value) ? (
              <Text className={cn(TEXT.bodyMedium, 'text-muted-foreground')}>{emptyText}</Text>
            ) : typeof value === 'string' || typeof value === 'number' ? (
              <Text selectable className={TEXT.bodyMedium}>
                {value}
              </Text>
            ) : (
              value
            )}
          </View>
        </View>
      ))}
    </View>
  );
}
