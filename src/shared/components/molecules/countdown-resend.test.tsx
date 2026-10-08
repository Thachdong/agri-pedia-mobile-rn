import { fireEvent, render, screen } from '@testing-library/react-native';
import { CountdownResend } from './countdown-resend';

describe('CountdownResend', () => {
  it('while counting: shows mm:ss and disables resend', async () => {
    const onResend = jest.fn();
    await render(<CountdownResend remainingMs={125_000} onResend={onResend} />);

    expect(screen.getByText('02:05')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Gửi lại' })).toBeDisabled();
    await fireEvent.press(screen.getByRole('button', { name: 'Gửi lại' }));
    expect(onResend).not.toHaveBeenCalled();
  });

  it('rounds partial seconds up (00:01 until it reaches 0)', async () => {
    await render(<CountdownResend remainingMs={200} onResend={jest.fn()} />);
    expect(screen.getByText('00:01')).toBeTruthy();
  });

  it('at 0: no countdown, resend enabled', async () => {
    const onResend = jest.fn();
    await render(<CountdownResend remainingMs={0} onResend={onResend} />);

    expect(screen.queryByText(/^\d\d:\d\d$/)).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Gửi lại' }));
    expect(onResend).toHaveBeenCalledTimes(1);
  });

  it('sending or disabled → resend locked', async () => {
    const { rerender } = await render(<CountdownResend remainingMs={0} onResend={jest.fn()} isSending />);
    expect(screen.getByRole('button', { name: 'Gửi lại' })).toBeDisabled();

    await rerender(<CountdownResend remainingMs={0} onResend={jest.fn()} disabled />);
    expect(screen.getByRole('button', { name: 'Gửi lại' })).toBeDisabled();
  });
});
