import { toConfirmPasswordResetInput } from './change-password.util';

describe('toConfirmPasswordResetInput', () => {
  it('keeps only the DTO fields (drops loginType + confirmPassword)', () => {
    expect(
      toConfirmPasswordResetInput({
        loginType: 'PHONE',
        identifier: '0901234567',
        newPassword: '12345678',
        confirmPassword: '12345678',
        code: '123456',
      }),
    ).toEqual({ identifier: '0901234567', code: '123456', newPassword: '12345678' });
  });
});
