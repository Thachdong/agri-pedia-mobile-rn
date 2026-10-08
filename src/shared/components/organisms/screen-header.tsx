import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { ROUTES } from '@/shared/constants';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import { IconButton } from '../atoms';

export type TScreenHeaderProps = {
  title: string;
  /** Second line (e.g. connection state). */
  subtitle?: string;
  /** Right side. */
  actions?: ReactNode;
  /** Default: back, or home when there is no screen to go back to (opened from a link). */
  onBack?: () => void;
  className?: string;
};

/** Header of a pushed screen: back + title (+ subtitle) + actions. Safe area is the template's job. */
export function ScreenHeader({ title, subtitle, actions, onBack, className }: TScreenHeaderProps) {
  const router = useRouter();
  const goBack = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace(ROUTES.home)));

  return (
    <View
      className={cn('h-14 flex-row items-center gap-1 border-b border-border-subtle bg-background pr-4', className)}
    >
      <IconButton icon="chevron-back" accessibilityLabel="Quay lại" onPress={goBack} />
      <View className="min-w-0 flex-1">
        <Text accessibilityRole="header" numberOfLines={1} className={TEXT.titleMedium}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} className={cn(TEXT.bodySmall, 'text-muted-foreground')}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actions}
    </View>
  );
}
