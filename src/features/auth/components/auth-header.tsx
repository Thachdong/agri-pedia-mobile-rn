import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { ROUTES } from '@/shared/constants';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';

export type TAuthHeaderProps = { className?: string };

/** Header of auth screens (ui-ux.md (1)): logo AgriPedia + "Back To Home". Both go home. */
export function AuthHeader({ className }: TAuthHeaderProps) {
  return (
    <View
      className={cn(
        'h-14 flex-row items-center justify-between border-b border-border-subtle bg-background px-4',
        className,
      )}
    >
      <Link href={ROUTES.home} replace asChild>
        <Pressable accessibilityRole="link" accessibilityLabel="AgriPedia, về trang chủ" hitSlop={8} className="min-h-11 justify-center">
          <Text className={cn(TEXT.titleLarge, 'font-bold text-primary')}>AgriPedia</Text>
        </Pressable>
      </Link>
      <Link href={ROUTES.home} replace asChild>
        <Pressable accessibilityRole="link" hitSlop={8} className="min-h-11 justify-center px-1">
          <Text className={cn(TEXT.bodyMedium, 'text-foreground')}>← Back To Home</Text>
        </Pressable>
      </Link>
    </View>
  );
}
