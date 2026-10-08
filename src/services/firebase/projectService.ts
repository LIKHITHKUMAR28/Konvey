import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, FIRESTORE_COLLECTIONS } from '../../lib/firebase';
import { Project } from '../../types';

/**
 * Project Data Service (Firestore Layer)
 * Manages CRUD operations for Project documents with organization isolation.
 */
export const projectService = {
  /**
   * Fetches all projects belonging strictly to an organization.
   */
  async getProjectsByOrg(organizationId: string): Promise<Project[]> {
    const q = query(
      collection(db, FIRESTORE_COLLECTIONS.PROJECTS),
      where('organizationId', '==', organizationId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Project[];
  },

  /**
   * Fetches a single project by ID, verifying organization ownership.
   */
  async getProjectById(projectId: string, organizationId: string): Promise<Project | null> {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.PROJECTS, projectId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    const data = snapshot.data() as Project;
    if (data.organizationId !== organizationId) return null;
    return { ...data, id: snapshot.id };
  },

  /**
   * Persists a new Project document.
   */
  async createProject(project: Project): Promise<void> {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.PROJECTS, project.id);
    await setDoc(docRef, {
      ...project,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Applies updates to an existing project.
   */
  async updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.PROJECTS, projectId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },
};
