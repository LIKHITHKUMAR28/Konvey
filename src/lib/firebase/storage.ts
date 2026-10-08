import { getStorage, FirebaseStorage } from 'firebase/storage';
import { app } from './config';

/**
 * Centralized Firebase Storage Singleton.
 * Prepared for future assets (avatars, attachments), but strictly minimal/dormant
 * during this phase to preserve Firebase Spark (No-Cost) limits.
 */
export const storage: FirebaseStorage = getStorage(app);
