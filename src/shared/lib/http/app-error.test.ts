import { APP_ERROR_CODE, AppError, isAppError, toAppError } from './app-error';

describe('toAppError', () => {
  it('maps a NestJS domain error body', () => {
    const error = toAppError(409, {
      statusCode: 409,
      code: 'USER_IDENTIFIER_ALREADY_USED',
      message: 'Identifier already used',
      details: { field: 'identifier' },
    });

    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({
      status: 409,
      code: 'USER_IDENTIFIER_ALREADY_USED',
      message: 'Identifier already used',
      details: { field: 'identifier' },
    });
  });

  it('maps a class-validator body to VALIDATION_ERROR with the messages as details', () => {
    const error = toAppError(400, {
      statusCode: 400,
      message: ['password must be longer than or equal to 8 characters', 'identifier should not be empty'],
      error: 'Bad Request',
    });

    expect(error.code).toBe(APP_ERROR_CODE.VALIDATION_ERROR);
    expect(error.message).toBe('password must be longer than or equal to 8 characters');
    expect(error.details).toEqual([
      'password must be longer than or equal to 8 characters',
      'identifier should not be empty',
    ]);
  });

  it.each([undefined, 'Bad gateway', { foo: 1 }])('falls back to UNKNOWN_ERROR for body %p', (body) => {
    const error = toAppError(502, body);
    expect(error).toMatchObject({ status: 502, code: APP_ERROR_CODE.UNKNOWN_ERROR });
  });
});

describe('isAppError', () => {
  it('is true only for AppError instances', () => {
    expect(isAppError(new AppError({ status: 0, code: 'X', message: 'x' }))).toBe(true);
    expect(isAppError(new Error('x'))).toBe(false);
    expect(isAppError({ code: 'X' })).toBe(false);
  });
});
