import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '@/shared/lib/utils';

export type TScreenLayoutProps = {
  /** Usually a ScreenHeader. */
  header: ReactNode;
  /** Fills the rest of the screen (lists, chat) — handles its own scrolling / keyboard. */
  children: ReactNode;
  className?: string;
};

/** Frame of a pushed screen (chat list, conversation): safe areas, fixed header, body `flex-1`. */
export function ScreenLayout({ header, children, className }: TScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className={cn('flex-1 bg-background', className)}
    >
      {header}
      <View className="flex-1">{children}</View>
    </View>
  );
}
