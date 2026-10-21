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
import { useCallback, useMemo, useRef, type ComponentRef, type ComponentType, type ReactNode, type Ref } from 'react';
import type { TextInput, TextInputProps } from 'react-native';

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
  /**
   * Fixed heights (e.g. `['80%']`) instead of following the content. Required around an `AppSheetFlatList`:
   * with dynamic sizing the list reports its full content height and the sheet can't size / scroll it.
   * Children then fill the sheet (`flex-1` on the list's container).
   */
  snapPoints?: (string | number)[];
};

const FILL = { flex: 1 } as const;

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
  snapPoints,
}: TAppSheetProps) {
  const Container = scrollable ? BottomSheetScrollView : BottomSheetView;
  const isFixed = !!snapPoints;
  return (
    <BottomSheetModal
      ref={sheetRef}
      enableDynamicSizing={!isFixed}
      snapPoints={snapPoints}
      enablePanDownToClose
      // A sheet opened from another sheet (SelectField options inside EditProfileSheet / ProductFormSheet) stacks on top.
      // The default 'switch' minimizes the opener; the nested sheet lives in the opener's tree, so both ended up closed.
      stackBehavior="push"
      enableContentPanningGesture={contentPanningEnabled}
      backdropComponent={renderBackdrop}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      onDismiss={onDismiss}
      accessibilityLabel={accessibilityLabel}
    >
      <Container style={isFixed ? FILL : undefined}>{children}</Container>
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

/**
 * TextInput for use inside an AppSheet (keeps the sheet above the keyboard). Takes `className`.
 * Typed as a plain TextInput (its ref is `TextInput | undefined` upstream) so it fits the `Input` atom's `as` prop.
 */
export const AppSheetTextInput = BottomSheetTextInput as unknown as ComponentType<
  TextInputProps & { ref?: Ref<TextInput>; className?: string }
>;

/** FlatList for long lists inside an AppSheet with `snapPoints` (not `scrollable`, not dynamic sizing) — container `flex-1`. */
export const AppSheetFlatList = BottomSheetFlatList;
