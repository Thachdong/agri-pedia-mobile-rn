import { formatRelativeTime } from './format-relative-time.util';

const NOW = Date.parse('2026-10-08T12:00:00.000Z');
const ago = (seconds: number) => new Date(NOW - seconds * 1000).toISOString();

describe('formatRelativeTime', () => {
  it.each([
    [30, 'vừa xong'],
    [5 * 60, '5 phút trước'],
    [3 * 3600, '3 giờ trước'],
    [24 * 3600, 'hôm qua'],
    [3 * 24 * 3600, '3 ngày trước'],
    [30 * 24 * 3600, 'tháng trước'],
    [65 * 24 * 3600, '2 tháng trước'],
    [365 * 24 * 3600, 'năm ngoái'],
    [3 * 365 * 24 * 3600, '3 năm trước'],
  ])('%i s ago → %s', (seconds, expected) => {
    expect(formatRelativeTime(ago(seconds), NOW)).toBe(expected);
  });

  it('future (clock skew) or invalid → "vừa xong"', () => {
    expect(formatRelativeTime(ago(-600), NOW)).toBe('vừa xong');
    expect(formatRelativeTime('nope', NOW)).toBe('vừa xong');
  });
});
