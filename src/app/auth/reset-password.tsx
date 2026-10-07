import { Text, View } from 'react-native';
import { TEXT } from '@/shared/theme';

// Placeholder so auth links / redirects have a typed target. Replaced by the auth-reset-password feature.
export default function ResetPasswordScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className={TEXT.titleLarge}>Reset mật khẩu</Text>
    </View>
  );
}
