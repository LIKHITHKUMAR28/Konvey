import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, FIRESTORE_COLLECTIONS } from '../../lib/firebase';
import { Blocker } from '../../types';

/**
 * Blocker Data Service (Firestore Layer)
 * Manages blocker tracking and resolutions within an organization.
 */
export const blockerService = {
  /**
   * Fetches active and resolved blockers for an organization.
   */
  async getBlockersByOrg(organizationId: string): Promise<Blocker[]> {
    const q = query(
      collection(db, FIRESTORE_COLLECTIONS.BLOCKERS),
      where('organizationId', '==', organizationId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Blocker[];
  },

  /**
   * Creates a new blocker record.
   */
  async createBlocker(blocker: Blocker): Promise<void> {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.BLOCKERS, blocker.id);
    await setDoc(docRef, {
      ...blocker,
      createdAt: serverTimestamp(),
    });
  },

  /**
   * Marks a blocker as resolved with resolution timestamp.
   */
  async resolveBlocker(blockerId: string): Promise<void> {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.BLOCKERS, blockerId);
    await updateDoc(docRef, {
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
    });
  },
};
