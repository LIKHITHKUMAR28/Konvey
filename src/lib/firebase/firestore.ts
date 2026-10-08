import {
  getFirestore,
  Firestore,
  serverTimestamp as firestoreServerTimestamp,
  Timestamp,
  collection,
  doc,
  CollectionReference,
  DocumentReference,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { app } from './config';
import { FIRESTORE_COLLECTIONS, FirestoreCollectionName, BaseFirestoreDoc } from './types';

/**
 * Centralized Firebase Firestore Singleton.
 * Sourced from the shared FirebaseApp instance.
 */
export const db: Firestore = getFirestore(app);

/**
 * Re-export Firestore server timestamp generator.
 * Prefer this over client JavaScript date strings for audit timestamps.
 */
export const serverTimestamp = firestoreServerTimestamp;
export { Timestamp };
export { FIRESTORE_COLLECTIONS };

/**
 * Creates a generic FirestoreDataConverter for strongly-typed documents.
 */
export function createConverter<T extends BaseFirestoreDoc>(): FirestoreDataConverter<T> {
  return {
    toFirestore(modelObject: T) {
      return { ...modelObject };
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): T {
      const data = snapshot.data();
      return {
        id: snapshot.id,
        ...data,
      } as T;
    },
  };
}

/**
 * Returns a strongly-typed top-level CollectionReference.
 */
export function getCollectionRef<T extends BaseFirestoreDoc>(
  collectionName: FirestoreCollectionName
): CollectionReference<T> {
  return collection(db, collectionName).withConverter(createConverter<T>());
}

/**
 * Returns a strongly-typed DocumentReference within a top-level collection.
 */
export function getDocRef<T extends BaseFirestoreDoc>(
  collectionName: FirestoreCollectionName,
  documentId: string
): DocumentReference<T> {
  return doc(db, collectionName, documentId).withConverter(createConverter<T>());
}
