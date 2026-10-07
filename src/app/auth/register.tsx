import { Text, View } from 'react-native';
import { TEXT } from '@/shared/theme';

// Placeholder so auth links / redirects have a typed target. Replaced by the register screen (auth-register CP8).
export default function RegisterScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className={TEXT.titleLarge}>Đăng ký</Text>
    </View>
  );
}
