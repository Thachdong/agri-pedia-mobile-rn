import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLogout, type TCurrentUser } from '@/features/auth';
import { Avatar, Icon, type TIconName } from '@/shared/components/atoms';
import { ROUTES } from '@/shared/constants';
import { AppSheet, type TAppSheetProps } from '@/shared/lib/sheet';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';

export type TUserMenuSheetProps = {
  /** From `useAppSheet()` of the opener. */
  sheetRef: TAppSheetProps['sheetRef'];
  onClose: () => void;
  user: Pick<TCurrentUser, 'id' | 'role' | 'username' | 'avatar'>;
};

/**
 * Header (4) avatar menu (ui-ux.md §6): Trang cá nhân (DISTRIBUTOR only — FARMER profile is not built yet), Đăng xuất.
 */
export function UserMenuSheet({ sheetRef, onClose, user }: TUserMenuSheetProps) {
  const router = useRouter();
  const logout = useLogout();
  const insets = useSafeAreaInsets();

  return (
    <AppSheet sheetRef={sheetRef} accessibilityLabel="Menu tài khoản">
      {/* Bottom padding clears the home indicator / gesture bar. */}
      <View style={{ paddingBottom: insets.bottom + 16 }} className="gap-1 px-4 pt-2">
        <View className="mb-2 flex-row items-center gap-3 border-b border-border-subtle pb-4">
          <Avatar src={user.avatar} name={user.username} />
          <Text numberOfLines={1} className={cn(TEXT.titleMedium, 'flex-1')}>
            {user.username}
          </Text>
        </View>
        {user.role === 'DISTRIBUTOR' && (
          <MenuItem
            icon="person-outline"
            label="Trang cá nhân"
            onPress={() => {
              onClose();
              router.push(ROUTES.profile(user.id));
            }}
          />
        )}
        <MenuItem
          icon="log-out-outline"
          label="Đăng xuất"
          disabled={logout.isPending}
          // Close first: once the session turns guest the header unmounts this sheet, so it must not stay presented.
          onPress={() => {
            onClose();
            logout.mutate();
          }}
        />
      </View>
    </AppSheet>
  );
}

type TMenuItemProps = { icon: TIconName; label: string; onPress: () => void; disabled?: boolean };

function MenuItem({ icon, label, onPress, disabled = false }: TMenuItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      // Explicit label: otherwise the icon glyph is read as part of the name.
      accessibilityLabel={label}
      accessibilityState={{ disabled, busy: disabled }}
      disabled={disabled}
      onPress={onPress}
      className={cn('min-h-12 flex-row items-center gap-3 rounded-lg px-2 active:bg-surface', disabled && 'opacity-50')}
    >
      <Icon name={icon} />
      <Text className={TEXT.bodyLarge}>{label}</Text>
    </Pressable>
  );
}
