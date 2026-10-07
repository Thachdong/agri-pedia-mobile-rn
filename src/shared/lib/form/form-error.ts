import type { FieldValues, Path } from 'react-hook-form';
import { APP_ERROR_CODE, getErrorMessage, isAppError } from '@/shared/lib/http';
import type { TAppForm } from './use-app-form';

/** Form-level server error, shown under the form (spec: "hiển thị message dưới form"). */
export const FORM_ROOT_ERROR = 'root.server' as const;

function hasPath(values: unknown, path: string): boolean {
  let current: unknown = values;
  for (const key of path.split('.')) {
    if (typeof current !== 'object' || current === null || !(key in current)) return false;
    current = (current as Record<string, unknown>)[key];
  }
  return true;
}

/**
 * Puts an API error on the form: NestJS validation errors ("<field> must be ...") → that field (generic Vietnamese text,
 * the server text is English); anything else → `errors.root.server` with `getErrorMessage`.
 * Field-specific domain codes (e.g. USER_IDENTIFIER_ALREADY_USED → identifier) are mapped by the form itself with
 * `form.setError(field, { message: getErrorMessage(error) })` before/instead of calling this.
 * Returns false when `error` is not an AppError.
 */
export function applyServerErrors<T extends FieldValues>(form: TAppForm<T>, error: unknown): boolean {
  if (!isAppError(error)) return false;

  if (error.code === APP_ERROR_CODE.VALIDATION_ERROR && Array.isArray(error.details)) {
    const values = form.getValues();
    let applied = false;
    for (const message of error.details) {
      const field = message.split(' ')[0];
      if (field && hasPath(values, field)) {
        form.setError(field as Path<T>, { type: 'server', message: 'Giá trị không hợp lệ' });
        applied = true;
      }
    }
    if (applied) return true;
  }

  form.setError(FORM_ROOT_ERROR, { type: 'server', message: getErrorMessage(error) });
  return true;
}
