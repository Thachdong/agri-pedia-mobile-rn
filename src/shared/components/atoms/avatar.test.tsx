import { fireEvent, render, screen } from '@testing-library/react-native';
import { Avatar } from './avatar';

// expo-image's host view hides `source` / `onError` → stand-in that exposes them.
jest.mock('expo-image', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    Image: ({ source, onError }: { source: { uri: string }; onError: () => void }) => (
      <View testID="avatar-image" accessibilityHint={source.uri} {...({ onError } as object)} />
    ),
  };
});

describe('Avatar', () => {
  it('no src → upper-case initial, labelled with the name', async () => {
    await render(<Avatar name="  đức anh" />);
    expect(screen.getByText('Đ')).toBeOnTheScreen();
    expect(screen.getByLabelText('  đức anh')).toBeOnTheScreen();
    expect(screen.queryByTestId('avatar-image')).toBeNull();
  });

  it('blank name → "?"', async () => {
    await render(<Avatar name="   " src={null} />);
    expect(screen.getByText('?')).toBeOnTheScreen();
  });

  it('src → image instead of the initial', async () => {
    await render(<Avatar name="An" src="https://cdn.test/a.png" />);
    expect(screen.getByTestId('avatar-image')).toHaveProp('accessibilityHint', 'https://cdn.test/a.png');
    expect(screen.queryByText('A')).toBeNull();
  });

  it('image load error (expired URL) → initial; a new src tries again', async () => {
    await render(<Avatar name="An" src="https://cdn.test/old.png" />);
    await fireEvent(screen.getByTestId('avatar-image'), 'error');
    expect(screen.getByText('A')).toBeOnTheScreen();
    expect(screen.queryByTestId('avatar-image')).toBeNull();

    await screen.rerender(<Avatar name="An" src="https://cdn.test/new.png" />);
    expect(screen.getByTestId('avatar-image')).toHaveProp('accessibilityHint', 'https://cdn.test/new.png');
  });
});
