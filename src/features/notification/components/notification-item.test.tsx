import { fireEvent, render, screen } from '@testing-library/react-native';
import { notification } from '../test/notification.fixtures';
import { NotificationItem } from './notification-item';

const NOW = Date.parse('2026-10-08T12:00:00.000Z');

describe('NotificationItem', () => {
  it('unread: label says so, press → onPress(notification)', async () => {
    const item = notification();
    const onPress = jest.fn();
    await render(<NotificationItem notification={item} onPress={onPress} now={NOW} />);

    expect(screen.getByText('Bạn nhận được đánh giá 5 sao')).toBeOnTheScreen();
    expect(screen.getByText('2 giờ trước')).toBeOnTheScreen();
    fireEvent.press(
      screen.getByRole('button', { name: 'Chưa đọc, Đánh giá mới, Bạn nhận được đánh giá 5 sao, 2 giờ trước' }),
    );
    expect(onPress).toHaveBeenCalledWith(item);
  });

  it('read: no "Chưa đọc" in the label; opening → busy', async () => {
    await render(<NotificationItem notification={notification({ isRead: true })} onPress={jest.fn()} isOpening now={NOW} />);
    const button = screen.getByRole('button', { name: 'Đánh giá mới, Bạn nhận được đánh giá 5 sao, 2 giờ trước' });
    expect(button).toBeBusy();
  });
});
