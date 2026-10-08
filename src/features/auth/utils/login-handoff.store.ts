import { keyValueStorage } from '@/shared/lib/storage';
import type { TLoginHandoff } from '../types/auth.types';

const STORAGE_KEY = 'auth-handoff.LOGIN';

const isLoginHandoff = (value: unknown): value is TLoginHandoff => {
  if (typeof value !== 'object' || value === null) return false;
  const { loginType, identifier } = value as Record<string, unknown>;
  return (loginType === 'EMAIL' || loginType === 'PHONE') && typeof identifier === 'string' && identifier.length > 0;
};

/**
 * Pre-fill of the login form (own key, separate from the OTP handoffs). Written right before a flow redirects to
 * /auth/login, read once by LoginForm, cleared on login success. Never throws: storage failure → empty login form.
 */
export const loginHandoffStore = {
  async save({ loginType, identifier }: TLoginHandoff): Promise<void> {
    try {
      await keyValueStorage.setJson(STORAGE_KEY, { loginType, identifier });
    } catch {
      // Login opens empty, nothing else depends on it.
    }
  },

  /** Missing, corrupt or of another shape → null. */
  async read(): Promise<TLoginHandoff | null> {
    const value = await keyValueStorage.getJson<unknown>(STORAGE_KEY);
    return isLoginHandoff(value) ? { loginType: value.loginType, identifier: value.identifier } : null;
  },

  async clear(): Promise<void> {
    try {
      await keyValueStorage.remove(STORAGE_KEY);
    } catch {
      // Stale pre-fill only; nothing to recover.
    }
  },
};
