/**
 * DESIGN TOKENS — nguồn duy nhất cho màu / radius / cỡ chữ của app RN.
 * Đồng bộ 1:1 với web `../../client/src/app/globals.css` (RAW PALETTE + SEMANTIC TOKENS) và Flutter `ui_ux/lib/shared/theme`.
 * Đọc bởi `tailwind.config.ts` (class `bg-primary`, `text-highlight`...) và `colors.ts` (prop cần giá trị màu).
 * Màu mới → thêm vào web trước (báo developer) để 3 app giống nhau.
 * Chỉ dùng giá trị thuần (không import gì) vì file được load bởi Tailwind lúc build.
 */

/* ------------------------------------------------------------------ */
/* 1) RAW PALETTE — đổi màu brand thì chỉ sửa ở đây (web --palette-*)  */
/* ------------------------------------------------------------------ */
export const palette = {
  bgPage: '#ffffff', // --palette-bg-page
  bgSurface: '#f3f7f5', // --palette-bg-surface
  textMain: '#1a2521', // --palette-text-main
  textHighlight: '#c86d4b', // --palette-text-highlight
  btnMain: '#1e4d3b', // --palette-btn-main
  borderSubtle: '#e1eadf', // --palette-border-subtle
  bgHighlightSubtle: '#fff4f0', // --palette-bg-highlight-subtle
  ratingStar: '#b7791f', // --palette-rating-star
  ratingStarEmpty: '#a9b8af', // --palette-rating-star-empty
  white: '#ffffff',
  destructive: '#e7000b', // web --destructive: oklch(0.577 0.245 27.325)
} as const;

/* ------------------------------------------------------------------ */
/* 2) SEMANTIC TOKENS — component chỉ dùng các tên này (web :root)     */
/* ------------------------------------------------------------------ */
export const semantic = {
  background: palette.bgPage,
  foreground: palette.textMain,
  surface: palette.bgSurface,
  surfaceForeground: palette.textMain,
  card: palette.bgPage,
  cardForeground: palette.textMain,
  primary: palette.btnMain,
  primaryForeground: palette.white,
  secondary: palette.bgSurface,
  secondaryForeground: palette.textMain,
  muted: palette.bgSurface,
  mutedForeground: palette.textMain,
  accent: palette.bgHighlightSubtle,
  accentForeground: palette.textHighlight,
  highlight: palette.textHighlight,
  highlightForeground: palette.white,
  highlightSubtle: palette.bgHighlightSubtle,
  /** Sao đánh giá: rating = sao đã chọn/đạt, ratingMuted = sao trống (đồ hoạ, không phải chữ). */
  rating: palette.ratingStar,
  ratingMuted: palette.ratingStarEmpty,
  destructive: palette.destructive,
  destructiveForeground: palette.white,
  border: palette.borderSubtle,
  borderSubtle: palette.borderSubtle,
  input: palette.borderSubtle,
  ring: palette.textHighlight,
} as const;

/* ------------------------------------------------------------------ */
/* 3) RADIUS — web --radius 0.625rem (10px) × 0.6 / 0.8 / 1 / 1.4 / 1.8 */
/* ------------------------------------------------------------------ */
export const radius = { sm: 6, md: 8, lg: 10, xl: 14, '2xl': 18, full: 9999 } as const;

/* ------------------------------------------------------------------ */
/* 4) FONT SIZE [size, lineHeight] (px) — cùng scale với Flutter         */
/*    app_typography.dart (display 36/44 ... label-sm 11/16)           */
/* ------------------------------------------------------------------ */
export const fontSize = {
  '2xs': [11, 16],
  xs: [12, 16],
  sm: [14, 20],
  base: [16, 24],
  lg: [18, 26],
  xl: [20, 28],
  '2xl': [24, 32],
  '3xl': [28, 36],
  '4xl': [36, 44],
} as const;
