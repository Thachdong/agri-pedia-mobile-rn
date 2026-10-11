import { getMediaExtensions, resolveMediaType } from './media-type.util';

describe('media-type util', () => {
  it('extensions of several types, merged in order', () => {
    expect(getMediaExtensions(['IMAGE', 'FILE'])).toEqual(['jpg', 'jpeg', 'png', 'webp', 'pdf']);
  });

  it('first type accepting the extension (case-insensitive); none → null', () => {
    expect(resolveMediaType('PDF', ['IMAGE', 'FILE'])).toBe('FILE');
    expect(resolveMediaType('png', ['IMAGE', 'FILE'])).toBe('IMAGE');
    expect(resolveMediaType('exe', ['IMAGE', 'FILE'])).toBeNull();
  });
});
