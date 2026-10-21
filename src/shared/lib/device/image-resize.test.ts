import { File } from 'expo-file-system';
import { ImageManipulator } from 'expo-image-manipulator';
import { resizeImage } from './image-resize';

jest.mock('expo-file-system', () => ({ File: jest.fn() }));
jest.mock('expo-image-manipulator', () => ({ ImageManipulator: { manipulate: jest.fn() }, SaveFormat: { JPEG: 'jpeg' } }));

const LIMITS = { maxWidth: 4096, maxHeight: 4096, maxBytes: 1000 };

/**
 * Source `width` x `height`; every save answers the next size of `sizes` (bytes). Records each resize and each save
 * quality so the tests can read the steps.
 */
function setup(width: number, height: number, sizes: number[]) {
  const resizes: { width: number; height: number }[] = [];
  const qualities: number[] = [];
  let saved = 0;
  jest.mocked(ImageManipulator.manipulate).mockImplementation(() => {
    let size = { width, height };
    const context = {
      resize: (next: { width: number; height: number }) => {
        resizes.push(next);
        size = next;
        return context;
      },
      renderAsync: async () => ({
        ...size,
        saveAsync: async ({ compress }: { compress: number }) => {
          qualities.push(compress);
          saved += 1;
          return { uri: `file:///out-${saved}.jpg`, ...size };
        },
      }),
    };
    return context as never;
  });
  jest.mocked(File).mockImplementation(((uri: string) => {
    const index = Number(uri.match(/out-(\d+)/)?.[1] ?? 1) - 1;
    return { size: sizes[index] ?? 0 };
  }) as never);
  return { resizes, qualities };
}

describe('resizeImage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('long edge capped at 2048 (ratio kept), JPEG 0.85 when small enough', async () => {
    const { resizes, qualities } = setup(4000, 3000, [800]);
    await expect(resizeImage('file:///in.jpg', LIMITS)).resolves.toEqual({
      uri: 'file:///out-1.jpg',
      width: 2048,
      height: 1536,
    });
    expect(resizes).toEqual([{ width: 2048, height: 1536 }]);
    expect(qualities).toEqual([0.85]);
  });

  it('never upscales; respects tighter server limits', async () => {
    const { resizes } = setup(800, 600, [10, 10]);
    await resizeImage('file:///in.jpg', LIMITS);
    expect(resizes[0]).toEqual({ width: 800, height: 600 });
    const second = setup(3000, 1000, [10]);
    await resizeImage('file:///in.jpg', { ...LIMITS, maxWidth: 1500 });
    expect(second.resizes[0]).toEqual({ width: 1500, height: 500 });
  });

  it('too heavy → 0.7, then shrinks by 0.8 until it fits', async () => {
    const { resizes, qualities } = setup(1000, 1000, [5000, 3000, 900]);
    await expect(resizeImage('file:///in.jpg', LIMITS)).resolves.toMatchObject({ uri: 'file:///out-3.jpg' });
    expect(qualities).toEqual([0.85, 0.7, 0.7]);
    expect(resizes).toEqual([
      { width: 1000, height: 1000 },
      { width: 800, height: 800 },
    ]);
  });

  it('still too heavy after every step, or not decodable → null', async () => {
    setup(1000, 1000, Array(20).fill(5000));
    await expect(resizeImage('file:///in.jpg', LIMITS)).resolves.toBeNull();
    jest.mocked(ImageManipulator.manipulate).mockImplementation(() => {
      throw new Error('decode');
    });
    await expect(resizeImage('file:///in.jpg', LIMITS)).resolves.toBeNull();
  });
});
