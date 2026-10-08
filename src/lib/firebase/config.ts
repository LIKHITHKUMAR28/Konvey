import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

/**
 * Public Firebase Client Configuration for KONVEY.
 * Sourced strictly from Vite environment variables (VITE_FIREBASE_*).
 * Operating under Firebase Spark (No-Cost) Free Tier.
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

/**
 * Validates whether essential Firebase configuration parameters are present.
 */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('your_firebase_api_key_here')
);

if (!isFirebaseConfigured && import.meta.env.DEV) {
  console.info(
    '[KONVEY Firebase] Environment variables not fully configured. Using fallback local configuration. Populate .env.local with real project credentials when connecting live.'
  );
}

/**
 * Centralized Firebase App Singleton.
 * Guarantees a single initializeApp invocation across the entire frontend lifetime.
 */
export const app: FirebaseApp = getApps().length > 0 
  ? getApp() 
  : initializeApp(firebaseConfig);
