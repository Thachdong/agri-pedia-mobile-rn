import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useRef, type ComponentRef, type ReactNode } from 'react';

type TSheetRef = ComponentRef<typeof BottomSheetModal>;

/** Hosts every AppSheet — mounted once in AppProviders. */
export function AppSheetProvider({ children }: { children: ReactNode }) {
  return <BottomSheetModalProvider>{children}</BottomSheetModalProvider>;
}

export type TAppSheetProps = {
  /** From `useAppSheet()`. */
  sheetRef: React.RefObject<TSheetRef | null>;
  children: ReactNode;
  /** Long content (lists, forms) → true: wraps children in a scroll view that cooperates with the sheet gesture. */
  scrollable?: boolean;
  onDismiss?: () => void;
  /** Accessibility label read when the sheet opens. */
  accessibilityLabel?: string;
};

function renderBackdrop(props: BottomSheetBackdropProps) {
  return <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />;
}

/**
 * Bottom sheet modal (M1–M10). Height follows content, backdrop tap / swipe down closes it,
 * keyboard pushes it up. Feature sheets (`<name>-sheet.tsx`) render their content inside this.
 */
export function AppSheet({ sheetRef, children, scrollable, onDismiss, accessibilityLabel }: TAppSheetProps) {
  const Container = scrollable ? BottomSheetScrollView : BottomSheetView;
  return (
    <BottomSheetModal
      ref={sheetRef}
      enableDynamicSizing
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      onDismiss={onDismiss}
      accessibilityLabel={accessibilityLabel}
    >
      <Container>{children}</Container>
    </BottomSheetModal>
  );
}

/** Controls one AppSheet: `<AppSheet sheetRef={sheet.ref}>`, then `sheet.open()` / `sheet.close()`. */
export function useAppSheet() {
  const ref = useRef<TSheetRef>(null);
  const open = useCallback(() => ref.current?.present(), []);
  const close = useCallback(() => ref.current?.dismiss(), []);
  return useMemo(() => ({ ref, open, close }), [open, close]);
}

/** TextInput for use inside an AppSheet (keeps the sheet above the keyboard). */
export const AppSheetTextInput = BottomSheetTextInput;
