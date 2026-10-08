import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '@/shared/lib/utils';

export type TMapListLayoutProps = {
  header: ReactNode;
  /** Map — fills its area. */
  map: ReactNode;
  /** Search / filter above the list (ui-ux.md §6 (6)). */
  filters?: ReactNode;
  /** List — scrolls itself (FlatList), so this slot is a plain flex area, not a ScrollView. */
  list: ReactNode;
  className?: string;
};

/**
 * Map + list screen frame (ui-ux.md §6, image-4). Phone: header, map on top (~40%), then filter + list below
 * (same as web mobile).
 */
export function MapListLayout({ header, map, filters, list, className }: TMapListLayoutProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top }} className={cn('flex-1 bg-background', className)}>
      {header}
      <View className="h-2/5 overflow-hidden">{map}</View>
      <View style={{ paddingBottom: insets.bottom }} className="flex-1 border-t border-border-subtle">
        {filters && <View className="border-b border-border-subtle p-4">{filters}</View>}
        <View className="flex-1">{list}</View>
      </View>
    </View>
  );
}
