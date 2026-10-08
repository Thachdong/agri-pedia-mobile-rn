import { toIdentifier } from './identifier.schema';

describe('toIdentifier', () => {
  it('PHONE: strips separators like the schema', () => {
    expect(toIdentifier('PHONE', ' 090 123.4567 ')).toBe('0901234567');
  });

  it('EMAIL: trims', () => {
    expect(toIdentifier('EMAIL', ' npp@example.com ')).toBe('npp@example.com');
  });

  it('invalid → trimmed input', () => {
    expect(toIdentifier('PHONE', ' abc ')).toBe('abc');
  });
});
