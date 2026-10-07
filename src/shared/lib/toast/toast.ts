import { toast as sonnerToast } from 'sonner-native';

export type TToastOptions = {
  /** Secondary line under the title. */
  description?: string;
  /** Same id → replaces the previous toast instead of stacking. */
  id?: string | number;
  /** ms; default from ToastHost. */
  duration?: number;
};

type TToastId = string | number;

/** Short notifications of the project (same API as web) — only this folder calls `sonner-native`. */
export const toast = {
  success: (message: string, options?: TToastOptions): TToastId => sonnerToast.success(message, options),
  error: (message: string, options?: TToastOptions): TToastId => sonnerToast.error(message, options),
  info: (message: string, options?: TToastOptions): TToastId => sonnerToast.info(message, options),
  warning: (message: string, options?: TToastOptions): TToastId => sonnerToast.warning(message, options),
  /** No id → dismiss all. */
  dismiss: (id?: TToastId) => {
    sonnerToast.dismiss(id);
  },
};
