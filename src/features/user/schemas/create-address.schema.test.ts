import type { TCreateAddressFormValues } from '../types/user.types';
import { createAddressSchema } from './create-address.schema';

const valid: TCreateAddressFormValues = {
  province: 'ha_noi',
  ward: 'ba_dinh',
  houseNumber: '1 Kim Mã',
  lat: 21,
  long: 105,
};
const errorsOf = (values: Partial<TCreateAddressFormValues>) =>
  Object.fromEntries(
    createAddressSchema
      .validate({ ...valid, ...values }, { abortEarly: false })
      .error?.details.map((d) => [d.path.join('.'), d.message]) ?? [],
  );

describe('createAddressSchema', () => {
  it('valid address', () => {
    expect(errorsOf({})).toEqual({});
  });

  it('province, ward, house number and map position required', () => {
    expect(
      errorsOf({
        province: '',
        ward: '',
        houseNumber: '  ',
        lat: undefined,
        long: undefined,
      }),
    ).toEqual({
      province: 'Vui lòng chọn tỉnh/thành phố',
      ward: 'Vui lòng chọn phường/xã',
      houseNumber: 'Trường này là bắt buộc',
      lat: 'Vui lòng chọn vị trí trên bản đồ',
      long: 'Vui lòng chọn vị trí trên bản đồ',
    });
  });

  it('house number ≤ 255, coordinates in range', () => {
    expect(Object.keys(errorsOf({ houseNumber: 'a'.repeat(256) }))).toEqual(['houseNumber']);
    expect(Object.keys(errorsOf({ lat: 91, long: -181 }))).toEqual(['lat', 'long']);
  });
});
