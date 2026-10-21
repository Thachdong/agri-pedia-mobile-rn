import { formatMessageTime } from './chat-time.util';

const NOW = new Date(2026, 9, 8, 15, 0);

describe('formatMessageTime', () => {
  it('today → HH:mm', () => {
    expect(formatMessageTime(new Date(2026, 9, 8, 9, 5).toISOString(), NOW)).toBe('09:05');
  });
  it('this year → dd/MM HH:mm', () => {
    expect(formatMessageTime(new Date(2026, 0, 2, 14, 30).toISOString(), NOW)).toBe('02/01 14:30');
  });
  it('earlier year → dd/MM/yyyy HH:mm', () => {
    expect(formatMessageTime(new Date(2025, 11, 31, 23, 59).toISOString(), NOW)).toBe('31/12/2025 23:59');
  });
  it('invalid date → empty', () => {
    expect(formatMessageTime('nope', NOW)).toBe('');
  });
});
