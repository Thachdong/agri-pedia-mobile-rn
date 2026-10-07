import { Toaster } from 'sonner-native';

/** Renders toasts — mounted once at the end of AppProviders. Brand styling is added with the design tokens. */
export function ToastHost() {
  return <Toaster position="top-center" duration={4000} visibleToasts={3} closeButton={false} richColors />;
}
