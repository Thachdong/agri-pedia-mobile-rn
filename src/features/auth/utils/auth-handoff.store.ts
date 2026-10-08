import { keyValueStorage } from '@/shared/lib/storage';
import type { TAuthHandoff, TOtpPurpose } from '../types/auth.types';

const storageKey = (purpose: TOtpPurpose) => `auth-handoff.${purpose}`;

const isHandoff = (value: unknown, purpose: TOtpPurpose): value is TAuthHandoff => {
  if (typeof value !== 'object' || value === null) return false;
  const { loginType, identifier, at, purpose: storedPurpose } = value as Record<string, unknown>;
  return (
    (loginType === 'EMAIL' || loginType === 'PHONE') &&
    typeof identifier === 'string' &&
    identifier.length > 0 &&
    typeof at === 'string' &&
    !Number.isNaN(Date.parse(at)) &&
    storedPurpose === purpose
  );
};

/**
 * Local persistence of the auth handoff, one key per purpose. Written by register / reset-password,
 * read by activate / change-password, cleared on their success. Never throws: storage failure → behaves as "no handoff".
 */
export const authHandoffStore = {
  async save(handoff: TAuthHandoff): Promise<void> {
    try {
      await keyValueStorage.setJson(storageKey(handoff.purpose), handoff);
    } catch {
      // Next screen falls back to its no-handoff state (manual identifier, resend enabled).
    }
  },

  /** Missing, corrupt or of another shape → null. */
  async read(purpose: TOtpPurpose): Promise<TAuthHandoff | null> {
    const value = await keyValueStorage.getJson<unknown>(storageKey(purpose));
    return isHandoff(value, purpose) ? value : null;
  },

  async clear(purpose: TOtpPurpose): Promise<void> {
    try {
      await keyValueStorage.remove(storageKey(purpose));
    } catch {
      // Stale handoff only pre-fills the next visit; nothing to recover.
    }
  },
};
