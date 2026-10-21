import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

export type TResizeImageLimits = { maxWidth: number; maxHeight: number; maxBytes: number };
export type TResizedImage = { uri: string; width: number; height: number };

/** Longest edge sent (and never above the server limits); JPEG quality, then a lower one when still too heavy. */
const MAX_EDGE = 2048;
const QUALITY = 0.85;
const RETRY_QUALITY = 0.7;
/** Still above `maxBytes` → shrink by this factor, at most SHRINK_MAX_STEPS times. */
const SHRINK_FACTOR = 0.8;
const SHRINK_MAX_STEPS = 6;

/** Fit `width` x `height` inside the box, keeping the ratio; never upscales. */
const fitInside = (width: number, height: number, maxWidth: number, maxHeight: number) => {
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
};

const sizeOf = (uri: string) => new File(uri).size;

/**
 * Local image → JPEG inside the limits (EXIF orientation applied): long edge ≤ 2048 and ≤ maxWidth/maxHeight, quality
 * 0.85 → 0.7, then shrink until ≤ maxBytes. Not decodable or still too heavy → null (never throws to the UI).
 */
export async function resizeImage(uri: string, limits: TResizeImageLimits): Promise<TResizedImage | null> {
  try {
    const source = await ImageManipulator.manipulate(uri).renderAsync();
    let size = fitInside(
      source.width,
      source.height,
      Math.min(MAX_EDGE, limits.maxWidth),
      Math.min(MAX_EDGE, limits.maxHeight),
    );
    for (let step = 0; step <= SHRINK_MAX_STEPS; step += 1) {
      const image = await ImageManipulator.manipulate(uri).resize(size).renderAsync();
      for (const compress of step === 0 ? [QUALITY, RETRY_QUALITY] : [RETRY_QUALITY]) {
        const result = await image.saveAsync({ compress, format: SaveFormat.JPEG });
        if (sizeOf(result.uri) <= limits.maxBytes) return { uri: result.uri, width: result.width, height: result.height };
      }
      size = fitInside(size.width, size.height, size.width * SHRINK_FACTOR, size.height * SHRINK_FACTOR);
    }
    return null;
  } catch {
    return null;
  }
}
