import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, type TColorToken } from '@/shared/theme';

/** Ionicons glyph names (https://icons.expo.fyi, set "Ionicons"). */
export type TIconName = keyof typeof Ionicons.glyphMap;

const ICON_SIZE = { sm: 16, md: 20, lg: 24 } as const;

export type TIconProps = {
  name: TIconName;
  size?: keyof typeof ICON_SIZE;
  /** Semantic color token (icons take a color value, not a class). */
  color?: TColorToken;
};

/**
 * The only place that renders @expo/vector-icons (lint). Decorative: hidden from screen readers —
 * the pressable around it carries the label (see IconButton).
 */
export function Icon({ name, size = 'md', color = 'foreground' }: TIconProps) {
  return (
    <Ionicons
      name={name}
      size={ICON_SIZE[size]}
      color={colors[color]}
      accessible={false}
      importantForAccessibility="no"
    />
  );
}
