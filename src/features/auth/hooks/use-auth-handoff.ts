import { useEffect, useState } from 'react';
import type { TAuthHandoff, TOtpPurpose } from '../types/auth.types';
import { authHandoffStore } from '../utils/auth-handoff.store';

type TAuthHandoffState = { status: 'loading'; handoff: null } | { status: 'ready'; handoff: TAuthHandoff | null };

/**
 * Reads the handoff of `purpose` once on mount (async storage) — the screen waits for `ready` before init
 * (pre-fill, focus, countdown). Later writes (resend) go through authHandoffStore directly.
 */
export function useAuthHandoff(purpose: TOtpPurpose): TAuthHandoffState {
  const [state, setState] = useState<TAuthHandoffState>({ status: 'loading', handoff: null });

  useEffect(() => {
    let active = true;
    void authHandoffStore.read(purpose).then((handoff) => {
      if (active) setState({ status: 'ready', handoff });
    });
    return () => {
      active = false;
    };
  }, [purpose]);

  return state;
}
