import { Link } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ROUTES } from '@/shared/constants';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';

export type TSiteHeaderProps = {
  /** Right side (ui-ux.md §6 (1)–(4) or Login / Register) — the screen decides by session. */
  actions?: ReactNode;
  className?: string;
};

/** Header of the main screens (ui-ux.md §6, §7): logo AgriPedia → home + actions. Safe area is the template's job. */
export function SiteHeader({ actions, className }: TSiteHeaderProps) {
  return (
    <View
      className={cn(
        'h-14 flex-row items-center justify-between gap-3 border-b border-border-subtle bg-background px-4',
        className,
      )}
    >
      <Link href={ROUTES.home} replace asChild>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="AgriPedia, về trang chủ"
          hitSlop={8}
          className="min-h-11 shrink-0 justify-center"
        >
          <Text className={cn(TEXT.titleLarge, 'font-bold text-primary')}>AgriPedia</Text>
        </Pressable>
      </Link>
      <View className="min-w-0 flex-1 flex-row items-center justify-end gap-1">{actions}</View>
    </View>
  );
}
