import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '@/shared/lib/utils';

export type TProfileLayoutProps = {
  header: ReactNode;
  /**
   * The scrolling part — ONE list (info + tabs as its header, then the active tab's items), so infinite tabs never nest
   * a FlatList in a ScrollView. The body owns its scroll and horizontal padding.
   */
  body: ReactNode;
  className?: string;
};

/** Profile screen frame (ui-ux.md §7, image-5 / image-6): fixed header, then the body list filling the rest. */
export function ProfileLayout({ header, body, className }: TProfileLayoutProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className={cn('flex-1 bg-background', className)}>
      {header}
      <View className="flex-1">{body}</View>
    </View>
  );
}
