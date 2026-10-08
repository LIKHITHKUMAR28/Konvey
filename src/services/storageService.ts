import {
  Organization,
  User,
  Team,
  Project,
  Task,
  Dependency,
  Blocker,
  Decision,
  ScopeEvent,
  Activity,
  Notification,
  FocusSession,
  ClientChangeRequest,
  ClientDelayInquiry,
} from '../types';
import {
  SEED_ORGANIZATION,
  SEED_USERS,
  SEED_TEAMS,
  SEED_PROJECTS,
  SEED_TASKS,
  SEED_BLOCKERS,
  SEED_DEPENDENCIES,
  SEED_DECISIONS,
  SEED_SCOPE_EVENTS,
  SEED_ACTIVITIES,
  SEED_NOTIFICATIONS,
  SEED_CLIENT_CHANGE_REQUESTS,
  SEED_CLIENT_DELAY_INQUIRIES,
} from '../data/seedData';

const STORAGE_KEYS = {
  ORGANIZATION: 'konvey_org',
  USERS: 'konvey_users',
  TEAMS: 'konvey_teams',
  PROJECTS: 'konvey_projects',
  TASKS: 'konvey_tasks',
  DEPENDENCIES: 'konvey_dependencies',
  BLOCKERS: 'konvey_blockers',
  DECISIONS: 'konvey_decisions',
  SCOPE_EVENTS: 'konvey_scope_events',
  ACTIVITIES: 'konvey_activities',
  NOTIFICATIONS: 'konvey_notifications',
  FOCUS_SESSIONS: 'konvey_focus_sessions',
  CLIENT_CHANGE_REQUESTS: 'konvey_client_change_requests',
  CLIENT_DELAY_INQUIRIES: 'konvey_client_delay_inquiries',
  CURRENT_USER_ID: 'konvey_current_user_id',
  AUTH_STATE: 'konvey_is_authenticated',
};

class StorageService {
  private memoryFallback: Record<string, string> = {};

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      let data: string | null = null;
      if (typeof localStorage !== 'undefined') {
        data = localStorage.getItem(key);
      } else {
        data = this.memoryFallback[key] ?? null;
      }
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, serialized);
      } else {
        this.memoryFallback[key] = serialized;
      }
    } catch (e) {
      console.warn('Local storage write failed', e);
    }
  }

  public initSeedIfEmpty(): void {
    const existing = typeof localStorage !== 'undefined'
      ? localStorage.getItem(STORAGE_KEYS.PROJECTS)
      : this.memoryFallback[STORAGE_KEYS.PROJECTS];

    if (!existing) {
      this.setItem(STORAGE_KEYS.ORGANIZATION, SEED_ORGANIZATION);
      this.setItem(STORAGE_KEYS.USERS, SEED_USERS);
      this.setItem(STORAGE_KEYS.TEAMS, SEED_TEAMS);
      this.setItem(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
      this.setItem(STORAGE_KEYS.TASKS, SEED_TASKS);
      this.setItem(STORAGE_KEYS.BLOCKERS, SEED_BLOCKERS);
      this.setItem(STORAGE_KEYS.DEPENDENCIES, SEED_DEPENDENCIES);
      this.setItem(STORAGE_KEYS.DECISIONS, SEED_DECISIONS);
      this.setItem(STORAGE_KEYS.SCOPE_EVENTS, SEED_SCOPE_EVENTS);
      this.setItem(STORAGE_KEYS.ACTIVITIES, SEED_ACTIVITIES);
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
      this.setItem(STORAGE_KEYS.CLIENT_CHANGE_REQUESTS, SEED_CLIENT_CHANGE_REQUESTS);
      this.setItem(STORAGE_KEYS.CLIENT_DELAY_INQUIRIES, SEED_CLIENT_DELAY_INQUIRIES);
      this.setItem(STORAGE_KEYS.FOCUS_SESSIONS, []);
      this.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'user-sam');
      this.setItem(STORAGE_KEYS.AUTH_STATE, false);
    }
  }

  public resetToSeed(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    } else {
      this.memoryFallback = {};
    }
    this.initSeedIfEmpty();
  }

  // Getters
  public getOrganization(): Organization {
    const org = this.getItem(STORAGE_KEYS.ORGANIZATION, SEED_ORGANIZATION);
    if (!org || org.name !== 'ROY Tech solutions') {
      const updatedOrg: Organization = {
        ...(org || SEED_ORGANIZATION),
        name: 'ROY Tech solutions',
      };
      this.setItem(STORAGE_KEYS.ORGANIZATION, updatedOrg);
      return updatedOrg;
    }
    return org;
  }

  public getUsers(): User[] {
    const users = this.getItem(STORAGE_KEYS.USERS, SEED_USERS);
    let modified = false;
    const migratedUsers = users.map((u: User) => {
      if (u.id === 'user-sam' && (u.name !== 'Sameera Rao' || u.email !== 'sameera@roytech.io')) {
        modified = true;
        return { ...u, name: 'Sameera Rao', email: 'sameera@roytech.io', title: 'VP of Product Operations' };
      }
      if (u.id === 'user-alex' && (u.name !== 'Aarav Patel' || u.email !== 'aarav@roytech.io')) {
        modified = true;
        return { ...u, name: 'Aarav Patel', email: 'aarav@roytech.io', title: 'Lead Frontend Engineer' };
      }
      if (u.id === 'user-elena' && (u.name !== 'Ananya Roy' || u.email !== 'ananya@royglobal.com')) {
        modified = true;
        return { ...u, name: 'Ananya Roy', email: 'ananya@royglobal.com', title: 'VP of Digital Transformation, Roy Global' };
      }
      if (u.id === 'user-rahul' && u.email !== 'rahul@roytech.io') {
        modified = true;
        return { ...u, email: 'rahul@roytech.io' };
      }
      if (u.id === 'user-priya' && u.email !== 'priya@roytech.io') {
        modified = true;
        return { ...u, email: 'priya@roytech.io' };
      }
      if (u.id === 'user-maya' && u.email !== 'maya@roytech.io') {
        modified = true;
        return { ...u, email: 'maya@roytech.io' };
      }
      if (!u.password) {
        modified = true;
        return { ...u, password: 'konvey123' };
      }
      return u;
    });

    const existingIds = new Set(migratedUsers.map((u: User) => u.id));
    for (const seedUser of SEED_USERS) {
      if (!existingIds.has(seedUser.id)) {
        migratedUsers.push(seedUser);
        modified = true;
      }
    }
    if (modified) {
      this.setItem(STORAGE_KEYS.USERS, migratedUsers);
    }
    return migratedUsers;
  }

  public getCurrentUserId(): string {
    return this.getItem(STORAGE_KEYS.CURRENT_USER_ID, 'user-rahul');
  }

  public setCurrentUserId(id: string): void {
    this.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
  }

  public getIsAuthenticated(): boolean {
    try {
      if (typeof window !== 'undefined' && !sessionStorage.getItem('konvey_session_active')) {
        return false;
      }
    } catch {
      // fallback
    }
    return this.getItem(STORAGE_KEYS.AUTH_STATE, false);
  }

  public setIsAuthenticated(authenticated: boolean): void {
    try {
      if (typeof window !== 'undefined') {
        if (authenticated) {
          sessionStorage.setItem('konvey_session_active', 'true');
        } else {
          sessionStorage.removeItem('konvey_session_active');
        }
      }
    } catch {
      // fallback
    }
    this.setItem(STORAGE_KEYS.AUTH_STATE, authenticated);
  }

  public saveUsers(users: User[]): void {
    this.setItem(STORAGE_KEYS.USERS, users);
  }

  public getTeams(): Team[] {
    return this.getItem(STORAGE_KEYS.TEAMS, SEED_TEAMS);
  }

  public getProjects(): Project[] {
    return this.getItem(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
  }

  public getTasks(): Task[] {
    return this.getItem(STORAGE_KEYS.TASKS, SEED_TASKS);
  }

  public getBlockers(): Blocker[] {
    return this.getItem(STORAGE_KEYS.BLOCKERS, SEED_BLOCKERS);
  }

  public getDependencies(): Dependency[] {
    return this.getItem(STORAGE_KEYS.DEPENDENCIES, SEED_DEPENDENCIES);
  }

  public getDecisions(): Decision[] {
    return this.getItem(STORAGE_KEYS.DECISIONS, SEED_DECISIONS);
  }

  public getScopeEvents(): ScopeEvent[] {
    return this.getItem(STORAGE_KEYS.SCOPE_EVENTS, SEED_SCOPE_EVENTS);
  }

  public getActivities(): Activity[] {
    return this.getItem(STORAGE_KEYS.ACTIVITIES, SEED_ACTIVITIES);
  }

  public getNotifications(): Notification[] {
    return this.getItem(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
  }

  public getFocusSessions(): FocusSession[] {
    return this.getItem(STORAGE_KEYS.FOCUS_SESSIONS, []);
  }

  // Setters / Updaters
  public saveProjects(projects: Project[]): void {
    this.setItem(STORAGE_KEYS.PROJECTS, projects);
  }

  public saveTasks(tasks: Task[]): void {
    this.setItem(STORAGE_KEYS.TASKS, tasks);
  }

  public saveBlockers(blockers: Blocker[]): void {
    this.setItem(STORAGE_KEYS.BLOCKERS, blockers);
  }

  public saveDependencies(deps: Dependency[]): void {
    this.setItem(STORAGE_KEYS.DEPENDENCIES, deps);
  }

  public saveDecisions(decisions: Decision[]): void {
    this.setItem(STORAGE_KEYS.DECISIONS, decisions);
  }

  public saveScopeEvents(events: ScopeEvent[]): void {
    this.setItem(STORAGE_KEYS.SCOPE_EVENTS, events);
  }

  public saveActivities(activities: Activity[]): void {
    this.setItem(STORAGE_KEYS.ACTIVITIES, activities);
  }

  public saveNotifications(notifications: Notification[]): void {
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }

  public saveFocusSessions(sessions: FocusSession[]): void {
    this.setItem(STORAGE_KEYS.FOCUS_SESSIONS, sessions);
  }

  public getClientChangeRequests(): ClientChangeRequest[] {
    const list = this.getItem(STORAGE_KEYS.CLIENT_CHANGE_REQUESTS, SEED_CLIENT_CHANGE_REQUESTS);
    if (!list || list.length === 0) {
      this.setItem(STORAGE_KEYS.CLIENT_CHANGE_REQUESTS, SEED_CLIENT_CHANGE_REQUESTS);
      return SEED_CLIENT_CHANGE_REQUESTS;
    }
    return list;
  }

  public saveClientChangeRequests(requests: ClientChangeRequest[]): void {
    this.setItem(STORAGE_KEYS.CLIENT_CHANGE_REQUESTS, requests);
  }

  public getClientDelayInquiries(): ClientDelayInquiry[] {
    const list = this.getItem(STORAGE_KEYS.CLIENT_DELAY_INQUIRIES, SEED_CLIENT_DELAY_INQUIRIES);
    if (!list || list.length === 0) {
      this.setItem(STORAGE_KEYS.CLIENT_DELAY_INQUIRIES, SEED_CLIENT_DELAY_INQUIRIES);
      return SEED_CLIENT_DELAY_INQUIRIES;
    }
    return list;
  }

  public saveClientDelayInquiries(inquiries: ClientDelayInquiry[]): void {
    this.setItem(STORAGE_KEYS.CLIENT_DELAY_INQUIRIES, inquiries);
  }

  // Audit Logging Utility (PRD FR-COL-04)
  public logActivity(activity: Omit<Activity, 'id' | 'createdAt'>): void {
    const activities = this.getActivities();
    const newAct: Activity = {
      ...activity,
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    this.saveActivities([newAct, ...activities]);
  }

  // Workspace Data Export & Import (Gate 3 Resilience)
  public exportAllState(): string {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      organization: this.getOrganization(),
      users: this.getUsers(),
      teams: this.getTeams(),
      projects: this.getProjects(),
      tasks: this.getTasks(),
      blockers: this.getBlockers(),
      dependencies: this.getDependencies(),
      decisions: this.getDecisions(),
      scopeEvents: this.getScopeEvents(),
      activities: this.getActivities(),
      notifications: this.getNotifications(),
    };
    return JSON.stringify(backup, null, 2);
  }

  public importState(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (!data.organization || !data.projects || !data.tasks) {
        throw new Error('Invalid KONVEY backup payload');
      }

      this.setItem(STORAGE_KEYS.ORGANIZATION, data.organization);
      if (data.users) this.setItem(STORAGE_KEYS.USERS, data.users);
      if (data.teams) this.setItem(STORAGE_KEYS.TEAMS, data.teams);
      if (data.projects) this.setItem(STORAGE_KEYS.PROJECTS, data.projects);
      if (data.tasks) this.setItem(STORAGE_KEYS.TASKS, data.tasks);
      if (data.blockers) this.setItem(STORAGE_KEYS.BLOCKERS, data.blockers);
      if (data.dependencies) this.setItem(STORAGE_KEYS.DEPENDENCIES, data.dependencies);
      if (data.decisions) this.setItem(STORAGE_KEYS.DECISIONS, data.decisions);
      if (data.scopeEvents) this.setItem(STORAGE_KEYS.SCOPE_EVENTS, data.scopeEvents);
      if (data.activities) this.setItem(STORAGE_KEYS.ACTIVITIES, data.activities);
      if (data.notifications) this.setItem(STORAGE_KEYS.NOTIFICATIONS, data.notifications);

      return true;
    } catch (e) {
      console.error('Failed to import KONVEY state', e);
      return false;
    }
  }
}

export const storageService = new StorageService();
storageService.initSeedIfEmpty();
