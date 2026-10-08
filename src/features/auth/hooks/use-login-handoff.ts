import { useEffect, useState } from 'react';
import type { TLoginHandoff } from '../types/auth.types';
import { loginHandoffStore } from '../utils/login-handoff.store';

type TLoginHandoffState = { status: 'loading'; handoff: null } | { status: 'ready'; handoff: TLoginHandoff | null };

/** Reads the login pre-fill once on mount (async storage) — LoginForm waits for `ready` before init (pre-fill, focus). */
export function useLoginHandoff(): TLoginHandoffState {
  const [state, setState] = useState<TLoginHandoffState>({ status: 'loading', handoff: null });

  useEffect(() => {
    let active = true;
    void loginHandoffStore.read().then((handoff) => {
      if (active) setState({ status: 'ready', handoff });
    });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
