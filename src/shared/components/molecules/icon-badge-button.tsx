import { View } from 'react-native';
import { CountBadge, formatCount, IconButton, type TIconButtonProps } from '../atoms';

export type TIconBadgeButtonProps = TIconButtonProps & {
  count?: number;
  countMax?: number;
  /** `count` is a lower bound → `N+`. */
  countAtLeast?: boolean;
};

/** Icon button with a count dot (header: notifications, chat). The label includes the count ("Tin nhắn, 3 mới"). */
export function IconBadgeButton({
  count = 0,
  countMax = 99,
  countAtLeast = false,
  accessibilityLabel,
  ...props
}: TIconBadgeButtonProps) {
  const label = count > 0 ? `${accessibilityLabel}, ${formatCount(count, countMax, countAtLeast)} mới` : accessibilityLabel;
  return (
    <View>
      <IconButton accessibilityLabel={label} {...props} />
      <View pointerEvents="none" className="absolute right-0.5 top-0.5">
        <CountBadge count={count} max={countMax} atLeast={countAtLeast} />
      </View>
    </View>
  );
}
