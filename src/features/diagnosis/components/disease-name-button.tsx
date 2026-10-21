import { Pressable, Text } from 'react-native';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';

export type TDiseaseNameButtonProps = {
  name: string;
  variantName?: string | null;
  onPress: () => void;
  className?: string;
};

/** Disease name as a link — opens the disease information sheet. */
export function DiseaseNameButton({ name, variantName, onPress, className }: TDiseaseNameButtonProps) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${name}${variantName ? ` — ${variantName}` : ''}, xem thông tin bệnh`}
      onPress={onPress}
      hitSlop={8}
      className={cn('self-start active:opacity-70', className)}
    >
      <Text className={cn(TEXT.labelLarge, 'text-highlight underline')}>
        {name}
        {variantName && <Text className="font-normal">{` — ${variantName}`}</Text>}
      </Text>
    </Pressable>
  );
}
