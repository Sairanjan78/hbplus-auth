// Web build (Metro picks firebase.native.ts on Android/iOS).
import { getApp, getApps, initializeApp } from 'firebase/app';
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { env } from '../config/env';

export const app = getApps().length ? getApp() : initializeApp(env.firebase);
export const auth = getAuth(app);
// Session survives reloads; Firebase stores it in IndexedDB and refreshes
// the 1-hour ID token automatically. We never store tokens ourselves.
setPersistence(auth, browserLocalPersistence).catch(() => {});
export const db = getFirestore(app);
