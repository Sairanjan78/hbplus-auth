import { useCallback } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { env } from '../config/env';

/**
 * Web: Firebase's own Google popup. Returns a Firebase credential directly.
 * `hd` pre-selects the company domain in Google's account chooser
 * (a UX hint only; the real check happens after sign-in).
 */
export function useGoogleSignIn() {
  const promptGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ hd: env.allowedDomain, prompt: 'select_account' });
    await signInWithPopup(auth, provider);
  }, []);

  return { promptGoogle, ready: true };
}
