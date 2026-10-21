import { chatMessageSchema } from './chat-message.schema';

describe('chatMessageSchema', () => {
  it('trims the message', () => {
    const { value, error } = chatMessageSchema.validate({ message: '  chào  ' });
    expect(error).toBeUndefined();
    expect(value?.message).toBe('chào');
  });

  it('blank → "Nhập tin nhắn"', () => {
    expect(chatMessageSchema.validate({ message: '   ' }).error?.details[0]?.message).toBe('Nhập tin nhắn');
  });

  it('2000 chars ok, 2001 rejected', () => {
    expect(chatMessageSchema.validate({ message: 'a'.repeat(2000) }).error).toBeUndefined();
    expect(chatMessageSchema.validate({ message: 'a'.repeat(2001) }).error).toBeDefined();
  });
});
