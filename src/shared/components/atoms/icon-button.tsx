import { Pressable } from 'react-native';
import { cn } from '@/shared/lib/utils';
import type { TColorToken } from '@/shared/theme';
import { Icon, type TIconName, type TIconProps } from './icon';

export type TIconButtonProps = Omit<React.ComponentProps<typeof Pressable>, 'children' | 'accessibilityLabel'> & {
  icon: TIconName;
  /** Required: an icon-only button has no visible text. */
  accessibilityLabel: string;
  size?: TIconProps['size'];
  color?: TColorToken;
  className?: string;
};

/** Icon-only button, 44pt tap target. */
export function IconButton({
  icon,
  accessibilityLabel,
  size = 'lg',
  color = 'foreground',
  disabled,
  className,
  ...props
}: TIconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      className={cn(
        'min-h-11 min-w-11 items-center justify-center rounded-full active:bg-surface',
        disabled && 'opacity-50',
        className,
      )}
      {...props}
    >
      <Icon name={icon} size={size} color={color} />
    </Pressable>
  );
}
