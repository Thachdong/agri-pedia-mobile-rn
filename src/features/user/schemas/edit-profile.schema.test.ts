import type { TEditProfileFormValues } from '../types/user.types';
import { editProfileSchema, getEditProfileSchema } from './edit-profile.schema';

const valid: TEditProfileFormValues = {
  username: 'Đại lý',
  bussinessType: 'SEEDS_SEEDLINGS',
  bio: '',
  avatar: null,
  bussinessLicense: null,
};
const file = (extension: string, size: number | null = 1000) => ({
  uri: 'file:///x',
  name: `x.${extension}`,
  mimeType: 'x',
  size,
  extension,
});
const errorPaths = (values: Partial<TEditProfileFormValues>) =>
  editProfileSchema.validate({ ...valid, ...values }, { abortEarly: false }).error?.details.map((d) => d.path.join('.')) ?? [];

describe('editProfileSchema', () => {
  it('valid profile, files optional', () => {
    expect(errorPaths({})).toEqual([]);
  });

  it('username 1..100 after trim, business type required, bio ≤ 1000', () => {
    expect(errorPaths({ username: '   ' })).toContain('username');
    expect(errorPaths({ username: 'a'.repeat(101) })).toContain('username');
    expect(errorPaths({ bussinessType: null })).toContain('bussinessType');
    expect(errorPaths({ bio: 'a'.repeat(1001) })).toContain('bio');
  });

  it('avatar image only; license image or pdf; ≤ 10 MB', () => {
    expect(errorPaths({ avatar: file('png') })).toEqual([]);
    expect(errorPaths({ avatar: file('pdf') })).toContain('avatar.extension');
    expect(errorPaths({ bussinessLicense: file('pdf') })).toEqual([]);
    expect(errorPaths({ bussinessLicense: file('docx') })).toContain('bussinessLicense.extension');
    expect(errorPaths({ avatar: file('jpg', 10 * 1024 * 1024 + 1) })).toContain('avatar.size');
    expect(errorPaths({ avatar: file('jpg', null) })).toEqual([]);
  });
});

describe('getEditProfileSchema', () => {
  const farmer: TEditProfileFormValues = { ...valid, bussinessType: null };
  const farmerErrors = (values: Partial<TEditProfileFormValues>) =>
    getEditProfileSchema('FARMER')
      .validate({ ...farmer, ...values }, { abortEarly: false })
      .error?.details.map((d) => d.path.join('.')) ?? [];

  it('DISTRIBUTOR → the distributor schema', () => {
    expect(getEditProfileSchema('DISTRIBUTOR')).toBe(editProfileSchema);
  });

  it('FARMER: no business type needed; username / bio / avatar rules kept', () => {
    expect(farmerErrors({})).toEqual([]);
    expect(farmerErrors({ username: ' ' })).toContain('username');
    expect(farmerErrors({ bio: 'a'.repeat(1001) })).toContain('bio');
    expect(farmerErrors({ avatar: file('pdf') })).toContain('avatar.extension');
  });

  it('FARMER: business type / license must stay empty', () => {
    expect(farmerErrors({ bussinessType: 'SEEDS_SEEDLINGS' })).toContain('bussinessType');
    expect(farmerErrors({ bussinessLicense: file('pdf') })).toContain('bussinessLicense');
  });
});
