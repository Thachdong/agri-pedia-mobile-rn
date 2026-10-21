import { PLANT_PART_LABELS } from '../constants/diagnosis.constants';
import { diagnosisImage, diagnosisRegion } from '../test/diagnosis.fixtures';
import {
  articlePathParts,
  formatLocation,
  imagePartLabel,
  regionName,
  regionsOfDisease,
  sortedImages,
  uniqueSymptoms,
} from './diagnosis-view.util';

const partLabel = (code: keyof typeof PLANT_PART_LABELS) => PLANT_PART_LABELS[code];

describe('diagnosis-view.util', () => {
  const uncertain = diagnosisRegion({ diagnosis: null, symptom: 'Đốm lạ' });
  const image = diagnosisImage({ regions: [diagnosisRegion(), diagnosisRegion(), uncertain] });

  it('regions of a disease; symptoms without duplicates in order', () => {
    expect(regionsOfDisease(image, 'RICE_BLAST')).toHaveLength(2);
    expect(uniqueSymptoms(image.regions)).toEqual(['Vết hình thoi màu nâu', 'Đốm lạ']);
  });

  it('part label: detected part first; location text', () => {
    expect(imagePartLabel({ plantPart: 'WHOLE_PLANT', detectedPart: 'LEAF' }, partLabel)).toBe('Lá');
    expect(imagePartLabel({ plantPart: 'STEM', detectedPart: null }, partLabel)).toBe('Thân');
    expect(formatLocation(image, 2, partLabel)).toBe('Lá · 2 vùng');
    expect(formatLocation(image, 0, partLabel)).toBe('Lá · không khoanh vùng');
  });

  it('region name: variant, disease, or "Chưa xác định"', () => {
    expect(regionName(diagnosisRegion())).toBe('Đạo ôn');
    expect(regionName(uncertain)).toBe('Chưa xác định');
    const variant = diagnosisRegion();
    expect(regionName({ diagnosis: { ...variant.diagnosis!, variantName: 'Đạo ôn cổ bông' } })).toBe('Đạo ôn cổ bông');
  });

  it('images by index; article path parts', () => {
    expect(sortedImages([{ index: 2 }, { index: 0 }]).map((item) => item.index)).toEqual([0, 2]);
    expect(articlePathParts('/benh-cay-trong/lua/dao-on')).toEqual({ cropSlug: 'lua', slug: 'dao-on' });
    expect(articlePathParts('/benh-cay-trong')).toBeNull();
  });
});
