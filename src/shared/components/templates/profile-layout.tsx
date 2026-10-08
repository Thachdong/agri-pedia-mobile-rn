import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '@/shared/lib/utils';

export type TProfileLayoutProps = {
  header: ReactNode;
  /** Info part (title + buttons + info table). */
  info: ReactNode;
  /** Content tabs below (Sản Phẩm | Đánh giá). */
  tabs?: ReactNode;
  className?: string;
};

/**
 * Profile screen frame (ui-ux.md §7, image-5 / image-6): fixed header, then info and tabs scrolling together.
 */
export function ProfileLayout({ header, info, tabs, className }: TProfileLayoutProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top }} className={cn('flex-1 bg-background', className)}>
      {header}
      {/* Inset on the ScrollView style, spacing on an inner View: NativeWind maps contentContainerClassName onto
          contentContainerStyle, so the two must not be mixed. */}
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom }}>
        <View className="gap-6 px-4 py-6">
          {info}
          {tabs}
        </View>
      </ScrollView>
    </View>
  );
}
