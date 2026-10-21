import { crop, durian } from '../test/diagnosis.fixtures';
import { fallbackPlantPart, invalidImageIndexes, pickDefaultCrop } from './diagnosis-form.util';

describe('pickDefaultCrop', () => {
  const crops = [durian(), crop(), crop({ code: 'COFFEE', nameVi: 'Cà phê' })];

  it("admins' default → RICE → first crop; nothing → undefined", () => {
    expect(pickDefaultCrop(crops, 'COFFEE')?.code).toBe('COFFEE');
    expect(pickDefaultCrop(crops, 'MANGO')?.code).toBe('RICE');
    expect(pickDefaultCrop(crops, null)?.code).toBe('RICE');
    expect(pickDefaultCrop([durian()], null)?.code).toBe('DURIAN');
    expect(pickDefaultCrop([], 'RICE')).toBeUndefined();
  });
});

describe('fallbackPlantPart', () => {
  it('"Cả cây" when the crop has it, else its first part', () => {
    expect(fallbackPlantPart(crop())).toBe('WHOLE_PLANT');
    expect(fallbackPlantPart(durian())).toBe('FRUIT');
  });
});

describe('invalidImageIndexes', () => {
  it('reads details.images[].index; anything else → []', () => {
    expect(invalidImageIndexes({ images: [{ index: 1 }, { index: null }] })).toEqual([1, null]);
    expect(invalidImageIndexes(undefined)).toEqual([]);
    expect(invalidImageIndexes(['images must be ...'])).toEqual([]);
  });
});
