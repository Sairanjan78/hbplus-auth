import type { User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { isBootstrapAdmin } from '../lib/domain';

export type Role = 'admin' | 'user';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: Role;
  createdAt?: Timestamp;
  lastLoginAt?: Timestamp;
}

const usersCol = collection(db, 'users');

/**
 * Create the profile on first login, otherwise refresh profile fields.
 * The role is never changed here; Firestore rules enforce that too.
 */
export async function upsertUserProfile(user: User): Promise<AppUser> {
  const ref = doc(usersCol, user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const profile = {
      uid: user.uid,
      email: user.email ?? '',
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: (isBootstrapAdmin(user.email) ? 'admin' : 'user') as Role,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };
    await setDoc(ref, profile);
    return { ...profile, createdAt: undefined, lastLoginAt: undefined };
  }

  await updateDoc(ref, {
    displayName: user.displayName,
    photoURL: user.photoURL,
    lastLoginAt: serverTimestamp(),
  });
  return snap.data() as AppUser;
}

export async function listUsers(): Promise<AppUser[]> {
  const snap = await getDocs(query(usersCol, orderBy('email')));
  return snap.docs.map((d) => d.data() as AppUser);
}

export async function setUserRole(uid: string, role: Role): Promise<void> {
  await updateDoc(doc(usersCol, uid), { role });
}
