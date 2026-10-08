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
import { Decision } from '../../types';

/**
 * Decision Data Service (Firestore Layer)
 * Manages institutional memory and decision logging with audit history.
 */
export const decisionService = {
  /**
   * Fetches all decisions for an organization.
   */
  async getDecisionsByOrg(organizationId: string): Promise<Decision[]> {
    const q = query(
      collection(db, FIRESTORE_COLLECTIONS.DECISIONS),
      where('organizationId', '==', organizationId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Decision[];
  },

  /**
   * Records a new decision.
   */
  async createDecision(decision: Decision): Promise<void> {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.DECISIONS, decision.id);
    await setDoc(docRef, {
      ...decision,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Marks an existing decision as superseded by a newer decision.
   */
  async supersedeDecision(oldDecisionId: string, newerDecisionId: string): Promise<void> {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.DECISIONS, oldDecisionId);
    await updateDoc(docRef, {
      status: 'superseded',
      supersededById: newerDecisionId,
      updatedAt: serverTimestamp(),
    });
  },
};
