import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSession } from '@/features/auth';
import { Avatar, Button, IconButton } from '@/shared/components/atoms';
import { ROUTES } from '@/shared/constants';
import { useAppSheet } from '@/shared/lib/sheet';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';
import { UserMenuSheet } from './user-menu-sheet';

/**
 * Right side of SiteHeader (ui-ux.md §6 (1)–(4)). Guest → Login / Register. Logged in → (1) notification, (2) chat,
 * (3) username + (4) avatar opening the user menu. Notification / chat are icons only for now (their features come next).
 */
export function AccountHeaderActions() {
  const session = useSession();
  const menu = useAppSheet();

  // Session still loading (token present, /users/me pending) → keep the slot empty instead of flashing Login.
  if (session.status === 'loading') return <View accessibilityLabel="Đang tải tài khoản" accessibilityState={{ busy: true }} />;

  if (!session.isLoggedIn) {
    return (
      <View className="flex-row items-center gap-2">
        <Link href={ROUTES.login} asChild>
          <Button label="Login" variant="ghost" size="sm" />
        </Link>
        <Link href={ROUTES.register} asChild>
          <Button label="Register" size="sm" />
        </Link>
      </View>
    );
  }

  const { user } = session;
  return (
    <View className="min-w-0 flex-row items-center">
      <IconButton icon="notifications-outline" accessibilityLabel="Thông báo" />
      <IconButton icon="chatbubbles-outline" accessibilityLabel="Tin nhắn" />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Tài khoản: ${user.username}`}
        onPress={menu.open}
        className="min-h-11 min-w-0 shrink flex-row items-center gap-2 rounded-full pl-2 active:bg-surface"
      >
        <Text numberOfLines={1} className={cn(TEXT.labelLarge, 'max-w-24 shrink text-foreground')}>
          {user.username}
        </Text>
        <Avatar src={user.avatar} name={user.username} size="sm" />
      </Pressable>
      <UserMenuSheet sheetRef={menu.ref} onClose={menu.close} user={user} />
    </View>
  );
}
