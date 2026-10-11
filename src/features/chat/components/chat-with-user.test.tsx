import { render, screen } from '@testing-library/react-native';
import { useRoomWithUser } from '../hooks/use-room-with-user';
import { ChatWithUser } from './chat-with-user';

const mockReplace = jest.fn();
let mockConversationProps: { target: unknown; onRoomCreated?: (roomId: string) => void } | undefined;

jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace }) }));
jest.mock('../hooks/use-room-with-user');
jest.mock('./chat-conversation', () => ({
  ChatConversation: (props: typeof mockConversationProps) => {
    mockConversationProps = props;
    return null;
  },
}));

const renderChat = () => render(<ChatWithUser userId="d1" currentUserId="u1" headerHeight={56} />);

describe('ChatWithUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConversationProps = undefined;
  });

  it('existing room → replaced by the room screen', async () => {
    jest.mocked(useRoomWithUser).mockReturnValue('r1');
    await renderChat();
    expect(mockReplace).toHaveBeenCalledWith('/chat/r1');
    expect(mockConversationProps).toBeUndefined();
  });

  it('rooms loading → spinner only', async () => {
    jest.mocked(useRoomWithUser).mockReturnValue(undefined);
    await renderChat();
    expect(screen.getByLabelText('Đang mở cuộc trò chuyện')).toBeOnTheScreen();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('no room → conversation by receiverId; first message room → replace', async () => {
    jest.mocked(useRoomWithUser).mockReturnValue(null);
    await renderChat();
    expect(mockConversationProps?.target).toEqual({ receiverId: 'd1' });
    mockConversationProps?.onRoomCreated?.('r2');
    expect(mockReplace).toHaveBeenCalledWith('/chat/r2');
  });
});
