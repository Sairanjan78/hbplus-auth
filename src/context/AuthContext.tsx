import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { ACCESS_RESTRICTED_MESSAGE, isAllowedEmail } from '../lib/domain';
import { upsertUserProfile, type AppUser } from '../services/userService';
import { useGoogleSignIn } from '../hooks/useGoogleSignIn';

type Status = 'initializing' | 'signedOut' | 'signedIn';

interface AuthContextValue {
  status: Status;
  user: AppUser | null;
  isAdmin: boolean;
  /** true while the Google flow or post-login verification is running */
  busy: boolean;
  error: string | null;
  ready: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function friendlyError(e: any): string | null {
  const code: string = e?.code ?? '';
  if (
    code === 'auth/popup-closed-by-user' ||
    code === 'auth/cancelled-popup-request' ||
    code === 'auth/cancelled'
  ) {
    return null; // user backed out; not an error worth showing
  }
  if (code === 'auth/popup-blocked') return 'Your browser blocked the sign-in popup. Allow popups and try again.';
  if (code === 'auth/network-request-failed') return 'Network error. Check your connection and try again.';
  if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait a moment and try again.';
  return 'Something went wrong while signing in. Please try again.';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('initializing');
  const [user, setUser] = useState<AppUser | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { promptGoogle, ready } = useGoogleSignIn();

  // Single source of truth: every session (new login, page reload, app restart)
  // passes through this listener, so the domain check can't be skipped.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setStatus('signedOut');
        return;
      }

      setVerifying(true);
      try {
        if (!fbUser.emailVerified || !isAllowedEmail(fbUser.email)) {
          setError(ACCESS_RESTRICTED_MESSAGE);
          // Remove the outsider's just-created Firebase account, then end the session.
          await fbUser.delete().catch(() => undefined);
          await firebaseSignOut(auth).catch(() => undefined);
          setUser(null);
          setStatus('signedOut');
          return;
        }

        const profile = await upsertUserProfile(fbUser);
        setUser(profile);
        setError(null);
        setStatus('signedIn');
      } catch (e) {
        console.warn('Profile load failed', e);
        setError('We could not load your profile. Please try again.');
        await firebaseSignOut(auth).catch(() => undefined);
        setUser(null);
        setStatus('signedOut');
      } finally {
        setVerifying(false);
      }
    });
    return unsubscribe;
  }, []);

  const signIn = useCallback(async () => {
    setError(null);
    setSigningIn(true);
    try {
      await promptGoogle();
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setSigningIn(false);
    }
  }, [promptGoogle]);

  const signOut = useCallback(async () => {
    setError(null);
    await firebaseSignOut(auth);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isAdmin: user?.role === 'admin',
      busy: signingIn || verifying,
      error,
      ready,
      signIn,
      signOut,
      clearError: () => setError(null),
    }),
    [status, user, signingIn, verifying, error, ready, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
