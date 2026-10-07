import type { TApiSchema } from './api-types';

type TDomainErrorBody = TApiSchema<'DomainErrorResponse'>;
type TValidationErrorBody = TApiSchema<'ValidationErrorResponse'>;

/** Client-side codes (no server response, or a response we can't read). Server codes pass through as-is. */
export const APP_ERROR_CODE = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type TAppErrorInit = {
  status: number;
  code: string;
  message: string;
  /** Domain error: detail object; validation error: class-validator messages. */
  details?: Record<string, unknown> | string[];
};

/** One error type for every request — `status` 0 means no response was received. */
export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Record<string, unknown> | string[];

  constructor({ status, code, message, details }: TAppErrorInit) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

function isDomainErrorBody(body: unknown): body is TDomainErrorBody {
  return typeof body === 'object' && body !== null && typeof (body as TDomainErrorBody).code === 'string';
}

function isValidationErrorBody(body: unknown): body is TValidationErrorBody {
  return typeof body === 'object' && body !== null && Array.isArray((body as TValidationErrorBody).message);
}

/** Normalises a NestJS error body (DomainErrorResponse | ValidationErrorResponse) into an AppError. */
export function toAppError(status: number, body: unknown): AppError {
  if (isDomainErrorBody(body)) {
    return new AppError({ status, code: body.code, message: body.message, details: body.details });
  }
  if (isValidationErrorBody(body)) {
    return new AppError({
      status,
      code: APP_ERROR_CODE.VALIDATION_ERROR,
      message: body.message[0] ?? 'Validation failed',
      details: body.message,
    });
  }
  return new AppError({ status, code: APP_ERROR_CODE.UNKNOWN_ERROR, message: `HTTP ${status}` });
}
