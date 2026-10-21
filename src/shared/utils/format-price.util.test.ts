import { formatPrice } from './format-price.util';

// Intl puts a no-break space before ₫ → normalise for readable expectations.
const plain = (text: string) => text.replace(/\s/g, ' ');

describe('formatPrice', () => {
  it('VND with vi-VN separators, up to 2 decimals', () => {
    expect(plain(formatPrice(150000))).toBe('150.000 ₫');
    expect(plain(formatPrice(12500.5))).toBe('12.500,5 ₫');
    expect(plain(formatPrice(0))).toBe('0 ₫');
  });
});
