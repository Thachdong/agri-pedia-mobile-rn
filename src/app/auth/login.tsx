import { Text, View } from 'react-native';
import { TEXT } from '@/shared/theme';

// Placeholder so the (private) guard has a typed target. Replaced by the auth-login feature.
export default function LoginScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className={TEXT.titleLarge}>Đăng nhập</Text>
    </View>
  );
}
