import { AppError } from '@/shared/lib/http';
import { getIssuedAt } from './otp.util';

const NOW = new Date('2026-10-07T03:05:00.000Z');

const alreadyRequested = (details?: AppError['details']) =>
  new AppError({ status: 409, code: 'OTP_ALREADY_REQUESTED', message: 'x', details });

describe('getIssuedAt', () => {
  it('OTP_ALREADY_REQUESTED → details.issuedAt as ISO', () => {
    expect(getIssuedAt(alreadyRequested({ issuedAt: '2026-10-07T10:00:00+07:00' }), NOW)).toBe('2026-10-07T03:00:00.000Z');
  });

  it.each([
    ['no details', undefined],
    ['issuedAt missing', { expiredAt: '2026-10-07T03:10:00.000Z' }],
    ['issuedAt not a date', { issuedAt: 'soon' }],
    ['issuedAt not a string', { issuedAt: 123 }],
    ['validation-style details', ['issuedAt']],
  ])('OTP_ALREADY_REQUESTED, %s → now', (_, details) => {
    expect(getIssuedAt(alreadyRequested(details as AppError['details']), NOW)).toBe(NOW.toISOString());
  });

  it.each([
    ['other code', new AppError({ status: 404, code: 'OTP_ACCOUNT_NOT_FOUND', message: 'x' })],
    ['not an AppError', new Error('x')],
    ['nothing', undefined],
  ])('%s → null', (_, error) => {
    expect(getIssuedAt(error, NOW)).toBeNull();
  });
});
