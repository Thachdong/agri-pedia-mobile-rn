import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { TEXT } from '@/shared/theme';

// Placeholder so login can land a DISTRIBUTOR on their profile. Replaced by the profile feature.
export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View className="flex-1 items-center justify-center gap-2 bg-background p-4">
      <Text className={TEXT.titleLarge}>Hồ sơ</Text>
      <Text className={TEXT.bodyMedium}>{id}</Text>
    </View>
  );
}
