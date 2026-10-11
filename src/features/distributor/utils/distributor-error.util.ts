import { isAppError } from '@/shared/lib/http';

const DISTRIBUTOR_NOT_FOUND = 'USER_DISTRIBUTOR_NOT_FOUND';

/** GET /distributors/{id} answered "no such (ACTIVE) distributor" — a final state, retrying won't help. */
export const isDistributorNotFound = (error: unknown) =>
  isAppError(error) && (error.code === DISTRIBUTOR_NOT_FOUND || error.status === 404);
