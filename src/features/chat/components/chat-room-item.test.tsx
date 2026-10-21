import { fireEvent, render, screen } from '@testing-library/react-native';
import { chatRoom } from '../test/chat.fixtures';
import { ChatRoomItem } from './chat-room-item';

const NOW = Date.parse('2026-10-08T12:00:00.000Z');

describe('ChatRoomItem', () => {
  it('other member last message, unread count in label, press → onPress(room)', async () => {
    const room = chatRoom({ unreadCount: 2, lastMessageAt: '2026-10-08T09:00:00.000Z' });
    const onPress = jest.fn();
    await render(<ChatRoomItem room={room} currentUserId="u1" onPress={onPress} now={NOW} />);

    expect(screen.getByText('Chào anh')).toBeOnTheScreen();
    expect(screen.getByText('3 giờ trước')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Đại lý Minh Phát, 2 tin chưa đọc, 3 giờ trước' }));
    expect(onPress).toHaveBeenCalledWith(room);
  });

  it('own last message → "Bạn: ..."; no username / no message fallbacks', async () => {
    await render(
      <ChatRoomItem
        room={chatRoom({ lastMessage: { messageId: 'm1', senderId: 'u1', message: 'ok', type: 'TEXT', diagnosisId: null } })}
        currentUserId="u1"
        onPress={jest.fn()}
        now={NOW}
      />,
    );
    expect(screen.getByText('Bạn: ok')).toBeOnTheScreen();

    await render(
      <ChatRoomItem room={chatRoom({ otherUsername: null, lastMessage: null })} currentUserId="u1" onPress={jest.fn()} now={NOW} />,
    );
    expect(screen.getByText('Người dùng')).toBeOnTheScreen();
    expect(screen.getByText('Chưa có tin nhắn')).toBeOnTheScreen();
  });
});
