import { getMediaExtensions, isMediaOfType, resolveMediaType } from './media-type.util';

describe('media-type util', () => {
  it('extensions of several types, merged in order', () => {
    expect(getMediaExtensions(['IMAGE', 'FILE'])).toEqual(['jpg', 'jpeg', 'png', 'webp', 'pdf']);
  });

  it('first type accepting the extension (case-insensitive); none → null', () => {
    expect(resolveMediaType('PDF', ['IMAGE', 'FILE'])).toBe('FILE');
    expect(resolveMediaType('png', ['IMAGE', 'FILE'])).toBe('IMAGE');
    expect(resolveMediaType('exe', ['IMAGE', 'FILE'])).toBeNull();
  });

  it('isMediaOfType narrows by type', () => {
    const pdf = { type: 'FILE' as const, key: 'k', extension: 'pdf', filename: 'a.pdf' };
    expect(isMediaOfType(pdf, ['IMAGE'])).toBe(false);
    expect(isMediaOfType(pdf, ['IMAGE', 'FILE'])).toBe(true);
  });
});
