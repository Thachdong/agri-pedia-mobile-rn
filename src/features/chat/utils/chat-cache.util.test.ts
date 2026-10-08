import { chatMessage, chatMessagesPage } from '../test/chat.fixtures';
import type { TChatMessagesCache } from '../types/chat.types';
import { prependMessage } from './chat-cache.util';

const cache = (): TChatMessagesCache => ({
  pages: [chatMessagesPage({ messages: [chatMessage({ id: 'm2' })] }), chatMessagesPage({ messages: [chatMessage({ id: 'm1' })] })],
  pageParams: [undefined, 'c1'],
});

describe('prependMessage', () => {
  it('adds the message at the top of page 0, other pages untouched', () => {
    const next = prependMessage(cache(), chatMessage({ id: 'm3' }));
    expect(next?.pages.map((page) => page.messages.map((message) => message.id))).toEqual([['m3', 'm2'], ['m1']]);
  });

  it('same id already in any page → unchanged (ack + push)', () => {
    const current = cache();
    expect(prependMessage(current, chatMessage({ id: 'm1' }))).toBe(current);
  });

  it('room not loaded → undefined', () => {
    expect(prependMessage(undefined, chatMessage())).toBeUndefined();
  });
});
