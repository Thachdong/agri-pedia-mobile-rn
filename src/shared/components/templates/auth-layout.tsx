import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '@/shared/lib/utils';
import { TEXT } from '@/shared/theme';

export type TAuthLayoutProps = {
  /** Top bar (logo + link home). */
  header: ReactNode;
  title: string;
  /** Card content (the form). */
  children: ReactNode;
  /** Bottom of the card (navigation links). */
  footer?: ReactNode;
  className?: string;
};

/**
 * Auth screens frame (ui-ux.md: register / activate / login / reset-password): header, centered card with title,
 * the whole screen scrolls when content is long and stays above the keyboard.
 */
export function AuthLayout({ header, title, children, footer, className }: TAuthLayoutProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className={cn('flex-1 bg-background', className)}
    >
      {header}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerClassName="flex-grow justify-center px-4 py-6"
        >
          <View className="w-full max-w-md gap-4 self-center rounded-xl border border-border-subtle bg-card p-5">
            <Text accessibilityRole="header" className={cn(TEXT.headlineSmall, 'text-center')}>
              {title}
            </Text>
            {children}
            {footer}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
