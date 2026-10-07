import type { Config } from 'tailwindcss';
import { fontSize, radius, semantic as c } from './src/shared/theme/tokens';

const px = (value: number) => `${value}px`;

/**
 * NativeWind v4 (Tailwind v3). Class names match the web client (`bg-primary`, `text-highlight`, `border-border-subtle`,
 * `rounded-lg`...). Values come from src/shared/theme/tokens.ts — never hardcode colors here.
 */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: c.background,
        foreground: c.foreground,
        surface: { DEFAULT: c.surface, foreground: c.surfaceForeground },
        card: { DEFAULT: c.card, foreground: c.cardForeground },
        primary: { DEFAULT: c.primary, foreground: c.primaryForeground },
        secondary: { DEFAULT: c.secondary, foreground: c.secondaryForeground },
        muted: { DEFAULT: c.muted, foreground: c.mutedForeground },
        accent: { DEFAULT: c.accent, foreground: c.accentForeground },
        highlight: { DEFAULT: c.highlight, foreground: c.highlightForeground, subtle: c.highlightSubtle },
        rating: { DEFAULT: c.rating, muted: c.ratingMuted },
        destructive: { DEFAULT: c.destructive, foreground: c.destructiveForeground },
        border: c.border,
        'border-subtle': c.borderSubtle,
        input: c.input,
        ring: c.ring,
      },
      borderRadius: Object.fromEntries(Object.entries(radius).map(([key, value]) => [key, px(value)])),
      fontSize: Object.fromEntries(
        Object.entries(fontSize).map(([key, [size, lineHeight]]) => [key, [px(size), { lineHeight: px(lineHeight) }]]),
      ),
    },
  },
  plugins: [],
} satisfies Config;
