import type { TDiagnosisFormValues } from '../types/diagnosis.types';
import { diagnosisFormSchema } from './diagnosis.schema';

const image = (id: string) => ({ id, uri: `file:///${id}.jpg`, plantPart: '' as const });
const errorsOf = (values: TDiagnosisFormValues, maxImages?: number) =>
  diagnosisFormSchema
    .validate(values, { abortEarly: false, context: maxImages ? { maxImages } : undefined })
    .error?.details.map((detail) => detail.message) ?? [];

describe('diagnosisFormSchema', () => {
  it('1..maxImages images, plant part optional, empty note ok', () => {
    expect(errorsOf({ images: [image('a')], note: '' })).toEqual([]);
    expect(errorsOf({ images: [{ ...image('a'), plantPart: 'LEAF' }], note: 'Lá vàng' })).toEqual([]);
  });

  it('no image → "Thêm ít nhất 1 ảnh"', () => {
    expect(errorsOf({ images: [], note: '' })).toEqual(['Thêm ít nhất 1 ảnh']);
  });

  it('above maxImages from the context (default 5) → "Tối đa N ảnh"', () => {
    const three = [image('a'), image('b'), image('c')];
    expect(errorsOf({ images: three, note: '' }, 2)).toEqual(['Tối đa 2 ảnh']);
    expect(errorsOf({ images: three, note: '' })).toEqual([]);
    expect(errorsOf({ images: [...three, image('d'), image('e'), image('f')], note: '' })).toEqual(['Tối đa 5 ảnh']);
  });

  it('note over 1000 characters', () => {
    expect(errorsOf({ images: [image('a')], note: 'x'.repeat(1001) })).toEqual(['Ghi chú tối đa 1000 ký tự']);
  });
});
