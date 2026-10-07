/**
 * Text roles → class strings, same roles as Flutter `app_typography.dart`, so screens don't invent sizes.
 * Use: `<Text className={cn(TEXT.titleLarge, 'text-highlight')}>`.
 */
export const TEXT = {
  displaySmall: 'text-4xl font-semibold text-foreground',
  headlineMedium: 'text-3xl font-semibold text-foreground',
  headlineSmall: 'text-2xl font-semibold text-foreground',
  /** Page title. */
  titleLarge: 'text-xl font-semibold text-foreground',
  titleMedium: 'text-base font-semibold text-foreground',
  titleSmall: 'text-sm font-semibold text-foreground',
  bodyLarge: 'text-base text-foreground',
  /** Default body text. */
  bodyMedium: 'text-sm text-foreground',
  bodySmall: 'text-xs text-foreground',
  /** Buttons, tabs. */
  labelLarge: 'text-sm font-semibold',
  labelMedium: 'text-xs font-medium',
  labelSmall: 'text-2xs font-medium',
} as const;

export type TTextRole = keyof typeof TEXT;
