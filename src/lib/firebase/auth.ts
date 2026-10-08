import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import { app } from './config';

/**
 * Centralized Firebase Authentication Singleton.
 * Provider: Email & Password (Spark-compatible).
 */
export const auth: Auth = getAuth(app);

/**
 * Registers a new user with email and password, optionally setting their display name.
 */
export async function signUpWithEmail(
  email: string,
  pass: string,
  displayName?: string
): Promise<FirebaseUser> {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (displayName && credential.user) {
    await updateProfile(credential.user, { displayName: displayName.trim() });
  }
  return credential.user;
}

/**
 * Authenticates an existing user via email and password.
 */
export async function signInWithEmail(
  email: string,
  pass: string
): Promise<FirebaseUser> {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return credential.user;
}

/**
 * Signs out the currently authenticated user session.
 */
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Dispatches a password reset email to the specified address.
 */
export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Returns the currently signed-in Firebase user, or null if unauthenticated.
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

/**
 * Subscribes to authentication state changes across the application.
 */
export function onAuthChange(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}
