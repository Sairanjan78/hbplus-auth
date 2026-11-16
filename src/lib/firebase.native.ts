// Android / iOS build.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, type Auth } from 'firebase/auth';
// getReactNativePersistence is only present in the React Native bundle of firebase/auth.
// @ts-ignore - not in the web type definitions
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { env } from '../config/env';

export const app = getApps().length ? getApp() : initializeApp(env.firebase);

let authInstance: Auth;
try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  // Already initialised (fast refresh)
  authInstance = getAuth(app);
}
export const auth = authInstance;
export const db = getFirestore(app);
