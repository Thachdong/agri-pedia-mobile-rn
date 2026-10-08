import { fireEvent, render, screen } from '@testing-library/react-native';
import { IconBadgeButton } from './icon-badge-button';

describe('IconBadgeButton', () => {
  it('label includes the count; press calls onPress', async () => {
    const onPress = jest.fn();
    await render(<IconBadgeButton icon="chatbubbles-outline" accessibilityLabel="Tin nhắn" count={3} onPress={onPress} />);
    fireEvent.press(screen.getByRole('button', { name: 'Tin nhắn, 3 mới' }));
    expect(onPress).toHaveBeenCalled();
    expect(screen.getByText('3', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('count 0 → plain label, no badge', async () => {
    await render(<IconBadgeButton icon="chatbubbles-outline" accessibilityLabel="Tin nhắn" count={0} />);
    expect(screen.getByRole('button', { name: 'Tin nhắn' })).toBeOnTheScreen();
    expect(screen.queryByText('0', { includeHiddenElements: true })).toBeNull();
  });
});
