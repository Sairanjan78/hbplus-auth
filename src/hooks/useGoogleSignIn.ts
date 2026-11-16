import { useCallback, useEffect, useRef } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { env } from '../config/env';

WebBrowser.maybeCompleteAuthSession();

/**
 * Android / iOS: OAuth 2.0 Authorization Code + PKCE via the system browser
 * (expo-auth-session). The Google ID token is exchanged once for a Firebase
 * session and then discarded; it is never persisted by the app.
 */
export function useGoogleSignIn() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: env.google.webClientId,
    androidClientId: env.google.androidClientId,
    iosClientId: env.google.iosClientId,
    selectAccount: true,
    extraParams: { hd: env.allowedDomain },
  });

  const pending = useRef<{ resolve: () => void; reject: (e: unknown) => void } | null>(null);

  useEffect(() => {
    if (!response || !pending.current) return;
    const { resolve, reject } = pending.current;
    pending.current = null;

    if (response.type === 'success') {
      const idToken = response.params.id_token;
      const credential = GoogleAuthProvider.credential(idToken);
      signInWithCredential(auth, credential).then(() => resolve(), reject);
    } else if (response.type === 'error') {
      reject(response.error ?? new Error('Google sign-in failed.'));
    } else {
      reject(Object.assign(new Error('Sign-in was cancelled.'), { code: 'auth/cancelled' }));
    }
  }, [response]);

  const promptGoogle = useCallback(
    () =>
      new Promise<void>((resolve, reject) => {
        pending.current = { resolve, reject };
        promptAsync().catch(reject);
      }),
    [promptAsync],
  );

  return { promptGoogle, ready: !!request };
}
