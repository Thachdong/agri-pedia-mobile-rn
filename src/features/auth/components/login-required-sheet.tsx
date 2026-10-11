import { usePathname, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/shared/components/atoms';
import { ROUTES } from '@/shared/constants';
import { AppSheet, type TAppSheetProps } from '@/shared/lib/sheet';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';

export type TLoginRequiredSheetProps = {
  /** From `useAppSheet()` of the opener. */
  sheetRef: TAppSheetProps['sheetRef'];
  onClose: () => void;
  /** What needs a login, e.g. "Đăng nhập để chat với nhà phân phối." */
  description?: string;
};

/**
 * M1 — a guest tapped a login-only action (Chat, Đánh giá): explains and links to login (comes back here after) or
 * register. Calls no action itself.
 */
export function LoginRequiredSheet({
  sheetRef,
  onClose,
  description = 'Bạn cần đăng nhập để dùng chức năng này.',
}: TLoginRequiredSheetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const go = (target: 'login' | 'register') => {
    onClose();
    if (target === 'login') router.push({ pathname: ROUTES.login, params: { from: pathname } });
    else router.push(ROUTES.register);
  };

  return (
    <AppSheet sheetRef={sheetRef} accessibilityLabel="Yêu cầu đăng nhập">
      <View style={{ paddingBottom: insets.bottom + 16 }} className="gap-4 px-4 pt-2">
        <View className="gap-1">
          <Text accessibilityRole="header" className={TEXT.titleMedium}>
            Cần đăng nhập
          </Text>
          <Text className={cn(TEXT.bodyMedium, 'text-muted-foreground')}>{description}</Text>
        </View>
        <Button label="Đăng nhập" onPress={() => go('login')} />
        <Button label="Đăng ký" variant="outline" onPress={() => go('register')} />
      </View>
    </AppSheet>
  );
}
