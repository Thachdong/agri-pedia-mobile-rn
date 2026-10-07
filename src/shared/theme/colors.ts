import { semantic } from './tokens';

/**
 * Semantic colors as values — ONLY for props that can't take `className`
 * (`ActivityIndicator color`, icon `color`, `placeholderTextColor`, map markers, toast/sheet styles).
 * Everything else uses classes (`bg-primary`, `text-muted-foreground`).
 */
export const colors = semantic;

export type TColorToken = keyof typeof colors;
