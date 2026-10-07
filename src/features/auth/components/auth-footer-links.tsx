import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { ROUTES } from '@/shared/constants';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';

const AUTH_FOOTER_LINKS = {
  register: { question: 'Bạn chưa có account?', label: 'Đăng ký', href: ROUTES.register },
  login: { question: 'Đã có account?', label: 'Đăng nhập', href: ROUTES.login },
  activate: { question: 'Account chưa kích hoạt?', label: 'Kích hoạt', href: ROUTES.activate },
  resetPassword: { question: 'Quên mật khẩu?', label: 'Reset mật khẩu', href: ROUTES.resetPassword },
} as const;

export type TAuthFooterLinkKey = keyof typeof AUTH_FOOTER_LINKS;

export type TAuthFooterLinksProps = {
  /** Links shown, in order — each auth screen picks its own (ui-ux.md (4)). */
  links: readonly TAuthFooterLinkKey[];
  className?: string;
};

/** Links between auth screens. `replace`: moving between auth screens doesn't grow the back stack. */
export function AuthFooterLinks({ links, className }: TAuthFooterLinksProps) {
  return (
    <View className={cn('items-center gap-1', className)}>
      {links.map((key) => {
        const { question, label, href } = AUTH_FOOTER_LINKS[key];
        return (
          <View key={key} className="min-h-11 flex-row flex-wrap items-center justify-center gap-1">
            <Text className={cn(TEXT.bodyMedium, 'text-muted-foreground')}>{question}</Text>
            <Link href={href} replace asChild>
              <Pressable accessibilityRole="link" hitSlop={10} className="min-h-11 justify-center">
                <Text className={cn(TEXT.labelLarge, 'text-highlight underline')}>{label}</Text>
              </Pressable>
            </Link>
          </View>
        );
      })}
    </View>
  );
}
