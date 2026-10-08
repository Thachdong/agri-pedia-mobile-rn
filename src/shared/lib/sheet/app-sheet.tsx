import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { cssInterop } from 'nativewind';
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
  /** false → dragging the content doesn't move the sheet (content with its own gestures, e.g. a map). Handle still drags. */
  contentPanningEnabled?: boolean;
};

function renderBackdrop(props: BottomSheetBackdropProps) {
  return <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />;
}

/**
 * Bottom sheet modal (M1–M10). Height follows content, backdrop tap / swipe down closes it,
 * keyboard pushes it up. Feature sheets (`<name>-sheet.tsx`) render their content inside this.
 */
export function AppSheet({
  sheetRef,
  children,
  scrollable,
  onDismiss,
  accessibilityLabel,
  contentPanningEnabled = true,
}: TAppSheetProps) {
  const Container = scrollable ? BottomSheetScrollView : BottomSheetView;
  return (
    <BottomSheetModal
      ref={sheetRef}
      enableDynamicSizing
      enablePanDownToClose
      enableContentPanningGesture={contentPanningEnabled}
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

// Third-party component → NativeWind needs an interop to turn `className` into `style`.
cssInterop(BottomSheetTextInput, { className: 'style' });

/** TextInput for use inside an AppSheet (keeps the sheet above the keyboard). Takes `className`. */
export const AppSheetTextInput = BottomSheetTextInput;

/** FlatList for long lists inside an AppSheet (not `scrollable`): give it a fixed height so dynamic sizing can measure it. */
export const AppSheetFlatList = BottomSheetFlatList;
