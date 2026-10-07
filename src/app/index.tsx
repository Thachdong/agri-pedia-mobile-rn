import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { Button } from '@/shared/components/atoms';
import { ROUTES } from '@/shared/constants';
import { TEXT } from '@/shared/theme';

// Placeholder until the distributor home ("/") is built.
// TODO(dev): remove DEV_LINKS when the real home lands — shortcuts so Expo Go can reach screens.
const DEV_LINKS = [
  { label: 'Đăng nhập', href: ROUTES.login },
  { label: 'Đăng ký', href: ROUTES.register },
  { label: 'Kích hoạt tài khoản', href: ROUTES.activate },
  { label: 'Quên mật khẩu', href: ROUTES.resetPassword },
  { label: 'Đổi mật khẩu', href: ROUTES.changePassword },
  { label: 'Sitemap', href: '/_sitemap' },
] as const;

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-background p-4">
      <Text className={TEXT.titleLarge}>AgriPedia</Text>
      {DEV_LINKS.map(({ label, href }) => (
        <Link key={href} href={href} asChild>
          <Button label={label} variant="outline" className="w-full" />
        </Link>
      ))}
    </View>
  );
}
