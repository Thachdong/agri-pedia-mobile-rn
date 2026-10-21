import { formatDistance } from './format-distance.util';

describe('formatDistance', () => {
  it.each([
    [0, '0 m'],
    [850.4, '850 m'],
    [999.6, '1 km'],
    [1234, '1,2 km'],
    [12_000, '12 km'],
    [99_950, '100 km'],
    [128_400, '128 km'],
  ])('%p m → %p', (meters, expected) => {
    expect(formatDistance(meters)).toBe(expected);
  });
});
