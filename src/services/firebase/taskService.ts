import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, FIRESTORE_COLLECTIONS } from '../../lib/firebase';
import { Task } from '../../types';

/**
 * Task Data Service (Firestore Layer)
 * Manages task persistence, project associations, and organization isolation.
 */
export const taskService = {
  /**
   * Fetches all tasks belonging to an organization.
   */
  async getTasksByOrg(organizationId: string): Promise<Task[]> {
    const q = query(
      collection(db, FIRESTORE_COLLECTIONS.TASKS),
      where('organizationId', '==', organizationId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Task[];
  },

  /**
   * Fetches tasks specifically assigned to a single project within an organization.
   */
  async getTasksByProject(projectId: string, organizationId: string): Promise<Task[]> {
    const q = query(
      collection(db, FIRESTORE_COLLECTIONS.TASKS),
      where('organizationId', '==', organizationId),
      where('projectId', '==', projectId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Task[];
  },

  /**
   * Fetches a single task by ID.
   */
  async getTaskById(taskId: string, organizationId: string): Promise<Task | null> {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.TASKS, taskId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    const data = snapshot.data() as Task;
    if (data.organizationId !== organizationId) return null;
    return { ...data, id: snapshot.id };
  },

  /**
   * Persists a newly created task.
   */
  async createTask(task: Task): Promise<void> {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.TASKS, task.id);
    await setDoc(docRef, {
      ...task,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Updates an existing task with partial modifications.
   */
  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.TASKS, taskId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Deletes a task document.
   */
  async deleteTask(taskId: string): Promise<void> {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.TASKS, taskId);
    await deleteDoc(docRef);
  },
};
