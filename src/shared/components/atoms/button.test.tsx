import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from './button';

describe('Button', () => {
  it('calls onPress', async () => {
    const onPress = jest.fn();
    await render(<Button label="REGISTER" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'REGISTER' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('loading → busy and disabled, press ignored', async () => {
    const onPress = jest.fn();
    await render(<Button label="REGISTER" loading onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'REGISTER' });
    expect(button).toBeBusy();
    expect(button).toBeDisabled();
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});
