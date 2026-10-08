import { Timestamp, FieldValue } from 'firebase/firestore';

/**
 * Top-level Firestore Collections for KONVEY.
 * Structured around multi-tenant organizational hierarchy and intelligence layer.
 */
export const FIRESTORE_COLLECTIONS = {
  ORGANIZATIONS: 'organizations',
  USERS: 'users',
  TEAMS: 'teams',
  PROJECTS: 'projects',
  TASKS: 'tasks',
  DEPENDENCIES: 'dependencies',
  COMMENTS: 'comments',
  ACTIVITIES: 'activities',
  BLOCKERS: 'blockers',
  DECISIONS: 'decisions',
  SCOPE_EVENTS: 'scopeEvents',
  FOCUS_SESSIONS: 'focusSessions',
  NOTIFICATIONS: 'notifications',
  PROJECT_HEALTH_SNAPSHOTS: 'projectHealthSnapshots',
} as const;

export type FirestoreCollectionName =
  typeof FIRESTORE_COLLECTIONS[keyof typeof FIRESTORE_COLLECTIONS];

/**
 * Base document metadata required on all multi-tenant entity records.
 * Guarantees organization isolation, auditability, and soft-delete capabilities.
 */
export interface BaseFirestoreDoc {
  id: string;
  organizationId: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  createdBy?: string;
  updatedBy?: string;
  isDeleted?: boolean;
}

/**
 * Organization document representation in Firestore.
 */
export interface FirestoreOrganization {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  memberIds: string[];
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

/**
 * User account profile representation in Firestore.
 */
export interface FirestoreUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  organizationIds: string[];
  currentOrgId?: string;
  role: 'admin' | 'manager' | 'member';
  title?: string;
  teamIds?: string[];
  createdAt: Timestamp | FieldValue;
  lastActiveAt?: Timestamp | FieldValue;
}
