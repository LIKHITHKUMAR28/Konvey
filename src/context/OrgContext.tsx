import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import {
  Organization,
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
  BlockerCategory,
  ScopeSource,
  ClientChangeRequest,
  ClientDelayInquiry,
  UserRole,
} from '../types';
import { storageService } from '../services/storageService';
import { useAuth } from './AuthContext';
import { hasPermission } from '../services/permissionService';
import { sanitizeTitle, sanitizeDescription, validateWorkspaceBackup } from '../utils/sanitize';

interface OrgContextType {
  organization: Organization;
  teams: Team[];
  projects: Project[];
  tasks: Task[];
  dependencies: Dependency[];
  blockers: Blocker[];
  decisions: Decision[];
  scopeEvents: ScopeEvent[];
  activities: Activity[];
  notifications: Notification[];
  activeFocusSession: FocusSession | null;
  heldNotifications: Notification[];
  clientChangeRequests: ClientChangeRequest[];
  clientDelayInquiries: ClientDelayInquiry[];
  // Actions
  createProject: (project: Omit<Project, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  addProjectMember: (projectId: string, userId: string, projectRole?: string) => void;
  removeProjectMember: (projectId: string, userId: string, unassignTasks?: boolean) => void;
  reassignProjectMember: (fromProjectId: string, toProjectId: string, userId: string, targetAssigneeId?: string) => void;
  updateProjectMemberRole: (projectId: string, userId: string, newRole: UserRole, projectTitle?: string) => void;
  submitClientChangeRequest: (request: Omit<ClientChangeRequest, 'id' | 'organizationId' | 'createdAt' | 'status'>) => ClientChangeRequest;
  approveClientChangeRequest: (requestId: string, reviewNotes?: string) => void;
  rejectClientChangeRequest: (requestId: string, reviewNotes?: string) => void;
  submitClientDelayInquiry: (inquiry: Omit<ClientDelayInquiry, 'id' | 'organizationId' | 'createdAt' | 'status'>) => ClientDelayInquiry;
  respondToClientDelayInquiry: (inquiryId: string, response: string) => void;
  createTask: (task: Omit<Task, 'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'isBlocked'>, scopeSource?: ScopeSource) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addBlocker: (taskId: string, type: BlockerCategory, description: string) => void;
  resolveBlocker: (blockerId: string) => void;
  recordDecision: (decision: Omit<Decision, 'id' | 'organizationId' | 'decisionNumber' | 'createdAt' | 'updatedAt' | 'status'>) => Decision;
  supersedeDecision: (oldDecisionId: string, newDecision: Omit<Decision, 'id' | 'organizationId' | 'decisionNumber' | 'createdAt' | 'updatedAt' | 'status'>) => Decision;
  addDependency: (sourceTaskId: string, targetTaskId: string, type: Dependency['type']) => { success: boolean; error?: string };
  removeDependency: (dependencyId: string) => void;
  startFocusSession: (taskIds: string[], durationMinutes: number) => void;
  endFocusSession: () => FocusSession | null;
  markNotificationAsRead: (notificationId: string) => void;
  resetAllData: () => void;
  exportWorkspaceData: () => string;
  importWorkspaceData: (jsonStr: string) => boolean;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export const OrgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, updateUserRole, users } = useAuth();

  const [organization] = useState<Organization>(() => storageService.getOrganization());
  const [teams] = useState<Team[]>(() => storageService.getTeams());
  const [projects, setProjects] = useState<Project[]>(() => storageService.getProjects());
  const [tasks, setTasks] = useState<Task[]>(() => storageService.getTasks());
  const [dependencies, setDependencies] = useState<Dependency[]>(() => storageService.getDependencies());
  const [blockers, setBlockers] = useState<Blocker[]>(() => storageService.getBlockers());
  const [decisions, setDecisions] = useState<Decision[]>(() => storageService.getDecisions());
  const [scopeEvents, setScopeEvents] = useState<ScopeEvent[]>(() => storageService.getScopeEvents());
  const [activities, setActivities] = useState<Activity[]>(() => storageService.getActivities());
  const [notifications, setNotifications] = useState<Notification[]>(() => storageService.getNotifications());
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(() => storageService.getFocusSessions());
  const [clientChangeRequests, setClientChangeRequests] = useState<ClientChangeRequest[]>(() => storageService.getClientChangeRequests());
  const [clientDelayInquiries, setClientDelayInquiries] = useState<ClientDelayInquiry[]>(() => storageService.getClientDelayInquiries());
  const activeFocusSession = useMemo(() => {
    return focusSessions.find((s) => s.userId === currentUser.id && s.status === 'active') || null;
  }, [focusSessions, currentUser.id]);

  // Notifications held during active focus session
  const heldNotifications = useMemo(() => {
    if (!activeFocusSession) return [];
    return notifications.filter((n) => activeFocusSession.heldNotificationIds?.includes(n.id));
  }, [activeFocusSession, notifications]);

  // Create Project
  const createProject = useCallback((projectData: Omit<Project, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Project => {
    if (!hasPermission(currentUser.role, 'CAN_CREATE_PROJECT')) {
      throw new Error('Unauthorized: Project creation requires manager or admin role.');
    }
    const newProj: Project = {
      ...projectData,
      name: sanitizeTitle(projectData.name),
      description: sanitizeDescription(projectData.description),
      id: `proj-${Date.now().toString(36)}`,
      organizationId: organization.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      baselineTaskCount: 0,
      baselineEstimatedMinutes: 0,
    };
    const updated = [newProj, ...projects];
    setProjects(updated);
    storageService.saveProjects(updated);

    storageService.logActivity({
      organizationId: organization.id,
      entityType: 'project',
      entityId: newProj.id,
      projectId: newProj.id,
      actorId: currentUser.id,
      action: `created project "${newProj.name}"`,
    });
    setActivities(storageService.getActivities());

    return newProj;
  }, [organization.id, projects, currentUser.id, currentUser.role]);

  // Update Project
  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
      storageService.saveProjects(updated);
      return updated;
    });
  }, []);

  // Add Project Member (Admin & Manager)
  const addProjectMember = useCallback((projectId: string, userId: string, projectRole?: string) => {
    if (!hasPermission(currentUser.role, 'CAN_MANAGE_PROJECT_MEMBERS')) {
      throw new Error('Unauthorized: Adding project members requires manager or admin role.');
    }
    setProjects((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== projectId) return p;
        if (p.memberIds.includes(userId)) return p;
        const newRoles = { ...(p.memberRoles || {}) };
        if (projectRole) {
          newRoles[userId] = sanitizeTitle(projectRole);
        }
        return {
          ...p,
          memberIds: [...p.memberIds, userId],
          memberRoles: newRoles,
          updatedAt: new Date().toISOString(),
        };
      });
      storageService.saveProjects(updated);
      return updated;
    });

    const targetUser = users.find((u) => u.id === userId);
    storageService.logActivity({
      organizationId: organization.id,
      entityType: 'project',
      entityId: projectId,
      projectId,
      actorId: currentUser.id,
      action: `added ${targetUser?.name || 'member'} to project team`,
    });
    setActivities(storageService.getActivities());
  }, [organization.id, currentUser.id, currentUser.role, users]);

  // Remove Project Member (Admin & Manager)
  const removeProjectMember = useCallback((projectId: string, userId: string, unassignTasks = true) => {
    if (!hasPermission(currentUser.role, 'CAN_MANAGE_PROJECT_MEMBERS')) {
      throw new Error('Unauthorized: Removing project members requires manager or admin role.');
    }
    setProjects((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== projectId) return p;
        const newMemberRoles = { ...(p.memberRoles || {}) };
        delete newMemberRoles[userId];
        return {
          ...p,
          memberIds: p.memberIds.filter((id) => id !== userId),
          memberRoles: newMemberRoles,
          updatedAt: new Date().toISOString(),
        };
      });
      storageService.saveProjects(updated);
      return updated;
    });

    if (unassignTasks) {
      setTasks((prev) => {
        const updated = prev.map((t) => (t.projectId === projectId && t.assigneeId === userId ? { ...t, assigneeId: undefined, updatedAt: new Date().toISOString() } : t));
        storageService.saveTasks(updated);
        return updated;
      });
    }

    const targetUser = users.find((u) => u.id === userId);
    storageService.logActivity({
      organizationId: organization.id,
      entityType: 'project',
      entityId: projectId,
      projectId,
      actorId: currentUser.id,
      action: `removed ${targetUser?.name || 'member'} from project roster`,
    });
    setActivities(storageService.getActivities());
  }, [organization.id, currentUser.id, currentUser.role, users]);

  // Reassign / Transfer Project Member to another project
  const reassignProjectMember = useCallback((fromProjectId: string, toProjectId: string, userId: string, targetAssigneeId?: string) => {
    if (!hasPermission(currentUser.role, 'CAN_MANAGE_PROJECT_MEMBERS')) {
      throw new Error('Unauthorized: Reassigning project members requires manager or admin role.');
    }
    const fromProj = projects.find((p) => p.id === fromProjectId);
    const toProj = projects.find((p) => p.id === toProjectId);
    const targetUser = users.find((u) => u.id === userId);

    setProjects((prev) => {
      const updated = prev.map((p) => {
        if (p.id === fromProjectId) {
          const roles = { ...(p.memberRoles || {}) };
          delete roles[userId];
          return {
            ...p,
            memberIds: p.memberIds.filter((id) => id !== userId),
            memberRoles: roles,
            updatedAt: new Date().toISOString(),
          };
        }
        if (p.id === toProjectId) {
          if (p.memberIds.includes(userId)) return p;
          return {
            ...p,
            memberIds: [...p.memberIds, userId],
            memberRoles: { ...(p.memberRoles || {}), [userId]: targetUser?.title || 'Team Member' },
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      });
      storageService.saveProjects(updated);
      return updated;
    });

    // Reassign active tasks in source project if requested
    if (targetAssigneeId) {
      setTasks((prev) => {
        const updated = prev.map((t) => (t.projectId === fromProjectId && t.assigneeId === userId ? { ...t, assigneeId: targetAssigneeId, updatedAt: new Date().toISOString() } : t));
        storageService.saveTasks(updated);
        return updated;
      });
    }

    // Notify user of transfer
    const newNotif: Notification = {
      id: `notif-${Date.now().toString(36)}`,
      organizationId: organization.id,
      recipientId: userId,
      type: 'assignment',
      priority: 'important',
      title: 'Project Assignment Updated',
      message: `You were reassigned from "${fromProj?.name || 'Previous Project'}" to "${toProj?.name || 'Target Project'}".`,
      entityType: 'project',
      entityId: toProjectId,
      isRead: false,
      isHeld: false,
      createdAt: new Date().toISOString(),
    };
    const updatedNotifs = [newNotif, ...storageService.getNotifications()];
    setNotifications(updatedNotifs);
    storageService.saveNotifications(updatedNotifs);

    storageService.logActivity({
      organizationId: organization.id,
      entityType: 'project',
      entityId: toProjectId,
      projectId: toProjectId,
      actorId: currentUser.id,
      action: `reassigned ${targetUser?.name || 'member'} from "${fromProj?.name}" to "${toProj?.name}"`,
    });
    setActivities(storageService.getActivities());
  }, [organization.id, currentUser.id, currentUser.role, projects, users]);

  // Update member role (both in project and user profile)
  const updateProjectMemberRole = useCallback((projectId: string, userId: string, newRole: UserRole, projectTitle?: string) => {
    if (!hasPermission(currentUser.role, 'CAN_MANAGE_PROJECT_MEMBERS')) {
      throw new Error('Unauthorized: Modifying project member roles requires manager or admin role.');
    }
    setProjects((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          memberRoles: {
            ...(p.memberRoles || {}),
            [userId]: projectTitle || (p.memberRoles?.[userId] || newRole),
          },
          updatedAt: new Date().toISOString(),
        };
      });
      storageService.saveProjects(updated);
      return updated;
    });

    updateUserRole(userId, newRole, projectTitle);

    const targetUser = users.find((u) => u.id === userId);
    storageService.logActivity({
      organizationId: organization.id,
      entityType: 'project',
      entityId: projectId,
      projectId,
      actorId: currentUser.id,
      action: `updated role of ${targetUser?.name || 'member'} to ${newRole} (${projectTitle || ''})`,
    });
    setActivities(storageService.getActivities());
  }, [organization.id, currentUser.id, currentUser.role, users, updateUserRole]);

  // Submit Client Change Request
  const submitClientChangeRequest = useCallback((requestData: Omit<ClientChangeRequest, 'id' | 'organizationId' | 'createdAt' | 'status'>): ClientChangeRequest => {
    const newRequest: ClientChangeRequest = {
      ...requestData,
      title: sanitizeTitle(requestData.title),
      description: sanitizeDescription(requestData.description),
      businessJustification: sanitizeDescription(requestData.businessJustification),
      id: `cr-${Date.now().toString(36)}`,
      organizationId: organization.id,
      status: 'pending_approval',
      createdAt: new Date().toISOString(),
    };

    const updated = [newRequest, ...clientChangeRequests];
    setClientChangeRequests(updated);
    storageService.saveClientChangeRequests(updated);

    // Notify Project Manager & Admin
    const targetProject = projects.find((p) => p.id === requestData.projectId);
    const pmId = targetProject?.ownerId || 'user-rahul';
    const adminId = 'user-sam';

    const notifsToCreate: Notification[] = [
      {
        id: `notif-${Date.now()}-1`,
        organizationId: organization.id,
        recipientId: pmId,
        type: 'pulse_alert',
        priority: 'critical',
        title: `Client Change Request: ${newRequest.title}`,
        message: `${newRequest.clientName} submitted a change request for ${targetProject?.name || 'project'}. Review & approval required.`,
        entityType: 'project',
        entityId: newRequest.projectId,
        isRead: false,
        isHeld: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: `notif-${Date.now()}-2`,
        organizationId: organization.id,
        recipientId: adminId,
        type: 'pulse_alert',
        priority: 'important',
        title: `Client Change Request: ${newRequest.title}`,
        message: `${newRequest.clientName} submitted a change request for ${targetProject?.name || 'project'}.`,
        entityType: 'project',
        entityId: newRequest.projectId,
        isRead: false,
        isHeld: false,
        createdAt: new Date().toISOString(),
      },
    ];

    const updatedNotifs = [...notifsToCreate, ...notifications];
    setNotifications(updatedNotifs);
    storageService.saveNotifications(updatedNotifs);

    storageService.logActivity({
      organizationId: organization.id,
      entityType: 'project',
      entityId: newRequest.projectId,
      projectId: newRequest.projectId,
      actorId: currentUser.id,
      action: `submitted change request "${newRequest.title}" (${newRequest.type.replace('_', ' ')})`,
    });
    setActivities(storageService.getActivities());

    return newRequest;
  }, [organization.id, currentUser.id, clientChangeRequests, projects, notifications]);

  // Approve Client Change Request (By PM Rahul or Admin Samira)
  // CRITICAL: Once approved, automatically creates a project task and scope event so it appears on project members' dashboard!
  const approveClientChangeRequest = useCallback((requestId: string, reviewNotes?: string) => {
    if (!hasPermission(currentUser.role, 'CAN_APPROVE_CLIENT_CHANGES')) {
      throw new Error('Unauthorized: Reviewing client change requests requires manager or admin role.');
    }
    const request = clientChangeRequests.find((r) => r.id === requestId);
    if (!request) return;

    const targetProject = projects.find((p) => p.id === request.projectId);

    // 1. Create deliverable task for project members
    const newDeliverableTask: Task = {
      id: `task-${Date.now().toString(36)}`,
      organizationId: organization.id,
      projectId: request.projectId,
      title: `[Client Approved] ${request.title}`,
      description: `${request.description}\n\nClient Business Justification: ${request.businessJustification}\n\nApproved By: ${currentUser.name} (${reviewNotes || 'Approved for Sprint'})`,
      status: 'not_started',
      priority: request.urgency === 'critical' ? 'urgent' : request.urgency === 'high' ? 'high' : 'medium',
      estimatedMinutes: 480, // Default 8 hours
      isBlocked: false,
      collaboratorIds: [],
      labels: ['client-approved', request.type],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedTasks = [newDeliverableTask, ...tasks];
    setTasks(updatedTasks);
    storageService.saveTasks(updatedTasks);

    // 2. Track in Scope Creep Radar
    const newScopeEvent: ScopeEvent = {
      id: `scope-${Date.now().toString(36)}`,
      organizationId: organization.id,
      projectId: request.projectId,
      type: 'scope_increase',
      source: 'client_request',
      taskId: newDeliverableTask.id,
      taskTitle: newDeliverableTask.title,
      description: `Client Scope Request "${request.title}" approved by ${currentUser.name}. Justification: ${request.businessJustification}`,
      estimatedEffortMinutes: 480,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
    };
    const updatedScope = [newScopeEvent, ...scopeEvents];
    setScopeEvents(updatedScope);
    storageService.saveScopeEvents(updatedScope);

    // 3. Update Request Status to approved
    const updatedRequests = clientChangeRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: 'approved' as const,
            reviewedBy: currentUser.id,
            reviewedAt: new Date().toISOString(),
            reviewNotes: reviewNotes || 'Approved by Project Management. Deliverable queued into project backlog.',
            createdTaskId: newDeliverableTask.id,
          }
        : r
    );
    setClientChangeRequests(updatedRequests);
    storageService.saveClientChangeRequests(updatedRequests);

    // 4. Notify all project members about the approved client scope!
    const memberNotifs: Notification[] = (targetProject?.memberIds || []).map((memberId, idx) => ({
      id: `notif-${Date.now()}-${idx}`,
      organizationId: organization.id,
      recipientId: memberId,
      type: 'assignment',
      priority: 'important',
      title: `New Approved Client Requirement: ${request.title}`,
      message: `${currentUser.name} approved client requirement "${request.title}". Now visible on your project dashboard.`,
      entityType: 'task',
      entityId: newDeliverableTask.id,
      isRead: false,
      isHeld: false,
      createdAt: new Date().toISOString(),
    }));

    // Also notify the client
    const clientNotif: Notification = {
      id: `notif-${Date.now()}-client`,
      organizationId: organization.id,
      recipientId: request.clientId,
      type: 'decision',
      priority: 'important',
      title: `Change Request Approved!`,
      message: `Your request "${request.title}" has been approved by ${currentUser.name} and scheduled into the sprint.`,
      entityType: 'project',
      entityId: request.projectId,
      isRead: false,
      isHeld: false,
      createdAt: new Date().toISOString(),
    };

    const allNewNotifs = [clientNotif, ...memberNotifs, ...notifications];
    setNotifications(allNewNotifs);
    storageService.saveNotifications(allNewNotifs);

    storageService.logActivity({
      organizationId: organization.id,
      entityType: 'project',
      entityId: request.projectId,
      projectId: request.projectId,
      actorId: currentUser.id,
      action: `approved client change request "${request.title}" (Added to sprint tasks)`,
    });
    setActivities(storageService.getActivities());
  }, [clientChangeRequests, projects, organization.id, currentUser, tasks, scopeEvents, notifications]);

  // Reject Client Change Request
  const rejectClientChangeRequest = useCallback((requestId: string, reviewNotes?: string) => {
    if (!hasPermission(currentUser.role, 'CAN_APPROVE_CLIENT_CHANGES')) {
      throw new Error('Unauthorized: Rejecting client change requests requires manager or admin role.');
    }
    const request = clientChangeRequests.find((r) => r.id === requestId);
    if (!request) return;

    const updatedRequests = clientChangeRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: 'rejected' as const,
            reviewedBy: currentUser.id,
            reviewedAt: new Date().toISOString(),
            reviewNotes: sanitizeDescription(reviewNotes || 'Declined due to timeline constraints.'),
          }
        : r
    );
    setClientChangeRequests(updatedRequests);
    storageService.saveClientChangeRequests(updatedRequests);

    // Notify client
    const clientNotif: Notification = {
      id: `notif-${Date.now()}-client`,
      organizationId: organization.id,
      recipientId: request.clientId,
      type: 'decision',
      priority: 'important',
      title: `Change Request Update: ${request.title}`,
      message: `Review update: ${reviewNotes || 'Request could not be accommodated in current sprint baseline.'}`,
      entityType: 'project',
      entityId: request.projectId,
      isRead: false,
      isHeld: false,
      createdAt: new Date().toISOString(),
    };
    const updatedNotifs = [clientNotif, ...notifications];
    setNotifications(updatedNotifs);
    storageService.saveNotifications(updatedNotifs);

    storageService.logActivity({
      organizationId: organization.id,
      entityType: 'project',
      entityId: request.projectId,
      projectId: request.projectId,
      actorId: currentUser.id,
      action: `declined client change request "${request.title}"`,
    });
    setActivities(storageService.getActivities());
  }, [clientChangeRequests, organization.id, currentUser, notifications]);

  // Submit Client Delay Inquiry
  const submitClientDelayInquiry = useCallback((inquiryData: Omit<ClientDelayInquiry, 'id' | 'organizationId' | 'createdAt' | 'status'>): ClientDelayInquiry => {
    const newInquiry: ClientDelayInquiry = {
      ...inquiryData,
      title: sanitizeTitle(inquiryData.title),
      message: sanitizeDescription(inquiryData.message),
      id: `inq-${Date.now().toString(36)}`,
      organizationId: organization.id,
      status: 'pending_pm_review',
      createdAt: new Date().toISOString(),
    };

    const updated = [newInquiry, ...clientDelayInquiries];
    setClientDelayInquiries(updated);
    storageService.saveClientDelayInquiries(updated);

    const targetProject = projects.find((p) => p.id === inquiryData.projectId);
    const pmId = targetProject?.ownerId || 'user-rahul';

    const notif: Notification = {
      id: `notif-${Date.now()}`,
      organizationId: organization.id,
      recipientId: pmId,
      type: 'blocker',
      priority: 'critical',
      title: `Client Delay Inquiry: ${newInquiry.title}`,
      message: `${newInquiry.clientName} questioned the delay: "${newInquiry.message}". Please review and provide resolution ETA.`,
      entityType: 'project',
      entityId: newInquiry.projectId,
      isRead: false,
      isHeld: false,
      createdAt: new Date().toISOString(),
    };
    const updatedNotifs = [notif, ...notifications];
    setNotifications(updatedNotifs);
    storageService.saveNotifications(updatedNotifs);

    storageService.logActivity({
      organizationId: organization.id,
      entityType: 'project',
      entityId: newInquiry.projectId,
      projectId: newInquiry.projectId,
      actorId: currentUser.id,
      action: `submitted inquiry questioning project delay: "${newInquiry.title}"`,
    });
    setActivities(storageService.getActivities());

    return newInquiry;
  }, [organization.id, currentUser.id, clientDelayInquiries, projects, notifications]);

  // Respond to Client Delay Inquiry
  const respondToClientDelayInquiry = useCallback((inquiryId: string, response: string) => {
    if (!hasPermission(currentUser.role, 'CAN_APPROVE_CLIENT_CHANGES')) {
      throw new Error('Unauthorized: Responding to delay inquiries requires manager or admin role.');
    }
    const inquiry = clientDelayInquiries.find((i) => i.id === inquiryId);
    if (!inquiry) return;

    const sanitizedResponse = sanitizeDescription(response);
    const updated = clientDelayInquiries.map((i) =>
      i.id === inquiryId
        ? {
            ...i,
            status: 'responded' as const,
            pmResponse: sanitizedResponse,
            respondedBy: currentUser.id,
            respondedAt: new Date().toISOString(),
          }
        : i
    );
    setClientDelayInquiries(updated);
    storageService.saveClientDelayInquiries(updated);

    const clientNotif: Notification = {
      id: `notif-${Date.now()}`,
      organizationId: organization.id,
      recipientId: inquiry.clientId,
      type: 'mention',
      priority: 'important',
      title: `PM Responded to Delay Inquiry`,
      message: `${currentUser.name}: "${sanitizedResponse}"`,
      entityType: 'project',
      entityId: inquiry.projectId,
      isRead: false,
      isHeld: false,
      createdAt: new Date().toISOString(),
    };
    const updatedNotifs = [clientNotif, ...notifications];
    setNotifications(updatedNotifs);
    storageService.saveNotifications(updatedNotifs);

    storageService.logActivity({
      organizationId: organization.id,
      entityType: 'project',
      entityId: inquiry.projectId,
      projectId: inquiry.projectId,
      actorId: currentUser.id,
      action: `responded to client delay inquiry "${inquiry.title}"`,
    });
    setActivities(storageService.getActivities());
  }, [clientDelayInquiries, organization.id, currentUser, notifications]);

  // Create Task
  const createTask = useCallback((taskData: Omit<Task, 'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'isBlocked'>, scopeSource?: ScopeSource): Task => {
    if (!hasPermission(currentUser.role, 'CAN_CREATE_TASK')) {
      throw new Error('Unauthorized: Task creation requires team member role or above.');
    }

    const newTask: Task = {
      ...taskData,
      title: sanitizeTitle(taskData.title),
      description: sanitizeDescription(taskData.description),
      id: `task-${Date.now().toString(36)}`,
      organizationId: organization.id,
      isBlocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    storageService.saveTasks(updatedTasks);

    // Track Scope Event if source is defined or after project baseline
    if (scopeSource) {
      const newScopeEvent: ScopeEvent = {
        id: `scope-${Date.now().toString(36)}`,
        organizationId: organization.id,
        projectId: newTask.projectId,
        type: 'added',
        source: scopeSource,
        taskId: newTask.id,
        taskTitle: newTask.title,
        description: `Added task "${newTask.title}" via ${scopeSource.replace('_', ' ')}`,
        estimatedEffortMinutes: newTask.estimatedMinutes || 240,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
      };
      const updatedScope = [newScopeEvent, ...scopeEvents];
      setScopeEvents(updatedScope);
      storageService.saveScopeEvents(updatedScope);
    }

    storageService.logActivity({
      organizationId: organization.id,
      entityType: 'task',
      entityId: newTask.id,
      projectId: newTask.projectId,
      actorId: currentUser.id,
      action: `created task "${newTask.title}"`,
    });
    setActivities(storageService.getActivities());

    return newTask;
  }, [organization.id, tasks, currentUser.id, currentUser.role, scopeEvents]);

  // Update Task
  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    const sanitizedUpdates: Partial<Task> = {
      ...updates,
      ...(updates.title !== undefined ? { title: sanitizeTitle(updates.title) } : {}),
      ...(updates.description !== undefined ? { description: sanitizeDescription(updates.description) } : {}),
    };

    setTasks((prev) => {
      const target = prev.find((t) => t.id === id);
      const updated = prev.map((t) => {
        if (t.id === id) {
          const isDone = sanitizedUpdates.status === 'done' && t.status !== 'done';
          return {
            ...t,
            ...sanitizedUpdates,
            completedAt: isDone ? new Date().toISOString() : t.completedAt,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      });
      storageService.saveTasks(updated);

      if (target && sanitizedUpdates.status && sanitizedUpdates.status !== target.status) {
        storageService.logActivity({
          organizationId: organization.id,
          entityType: 'task',
          entityId: id,
          projectId: target.projectId,
          actorId: currentUser.id,
          action: `changed status from "${target.status}" to "${sanitizedUpdates.status}"`,
        });
        setActivities(storageService.getActivities());
      }

      return updated;
    });
  }, [organization.id, currentUser.id]);

  // Delete Task (Authorization: Assigned owner, manager, or admin only)
  const deleteTask = useCallback((id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (target) {
      const isAssignee = target.assigneeId === currentUser.id;
      const canManage = hasPermission(currentUser.role, 'CAN_MANAGE_PROJECT_MEMBERS');
      if (!isAssignee && !canManage) {
        throw new Error('Unauthorized: You can only delete tasks assigned to you or as a manager/admin.');
      }
    }

    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      storageService.saveTasks(updated);
      return updated;
    });
  }, [tasks, currentUser.id, currentUser.role]);

  // Blocker Management (PRD 6.8)
  const addBlocker = useCallback((taskId: string, type: BlockerCategory, description: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newBlocker: Blocker = {
      id: `block-${Date.now().toString(36)}`,
      organizationId: organization.id,
      projectId: task.projectId,
      taskId,
      type,
      description,
      ownerId: currentUser.id,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    const updatedBlockers = [newBlocker, ...blockers];
    setBlockers(updatedBlockers);
    storageService.saveBlockers(updatedBlockers);

    // Update task status
    updateTask(taskId, { isBlocked: true, blockerId: newBlocker.id, status: 'blocked' });

    // Notify project manager
    const newNotif: Notification = {
      id: `notif-${Date.now().toString(36)}`,
      organizationId: organization.id,
      recipientId: 'user-rahul',
      type: 'blocker',
      priority: 'important',
      title: `Task Blocked: ${task.title}`,
      message: `Blocked: ${description} (${type.replace('_', ' ')})`,
      entityType: 'task',
      entityId: taskId,
      isRead: false,
      isHeld: Boolean(activeFocusSession),
      createdAt: new Date().toISOString(),
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    storageService.saveNotifications(updatedNotifs);

    storageService.logActivity({
      organizationId: organization.id,
      entityType: 'blocker',
      entityId: newBlocker.id,
      projectId: task.projectId,
      actorId: currentUser.id,
      action: `flagged blocker on "${task.title}": ${description}`,
    });
    setActivities(storageService.getActivities());
  }, [tasks, organization.id, currentUser.id, blockers, updateTask, activeFocusSession, notifications]);

  const resolveBlocker = useCallback((blockerId: string) => {
    const blocker = blockers.find((b) => b.id === blockerId);
    if (!blocker) return;

    const updatedBlockers = blockers.map((b) =>
      b.id === blockerId ? { ...b, status: 'resolved' as const, resolvedAt: new Date().toISOString() } : b
    );
    setBlockers(updatedBlockers);
    storageService.saveBlockers(updatedBlockers);

    updateTask(blocker.taskId, { isBlocked: false, status: 'in_progress' });

    storageService.logActivity({
      organizationId: organization.id,
      entityType: 'blocker',
      entityId: blockerId,
      projectId: blocker.projectId,
      actorId: currentUser.id,
      action: 'resolved blocker',
    });
    setActivities(storageService.getActivities());
  }, [blockers, updateTask, organization.id, currentUser.id]);

  // Decision Memory (PRD 6.9)
  const recordDecision = useCallback((decisionData: Omit<Decision, 'id' | 'organizationId' | 'decisionNumber' | 'createdAt' | 'updatedAt' | 'status'>): Decision => {
    const nextNumber = decisions.length > 0 ? Math.max(...decisions.map((d) => d.decisionNumber)) + 1 : 1;
    const newDecision: Decision = {
      ...decisionData,
      id: `dec-${Date.now().toString(36)}`,
      organizationId: organization.id,
      decisionNumber: nextNumber,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newDecision, ...decisions];
    setDecisions(updated);
    storageService.saveDecisions(updated);

    storageService.logActivity({
      organizationId: organization.id,
      entityType: 'decision',
      entityId: newDecision.id,
      projectId: newDecision.projectId,
      actorId: currentUser.id,
      action: `recorded official decision #${newDecision.decisionNumber}: "${newDecision.title}"`,
    });
    setActivities(storageService.getActivities());

    return newDecision;
  }, [decisions, organization.id, currentUser.id]);

  const supersedeDecision = useCallback((oldDecisionId: string, newDecisionData: Omit<Decision, 'id' | 'organizationId' | 'decisionNumber' | 'createdAt' | 'updatedAt' | 'status'>): Decision => {
    const newDec = recordDecision(newDecisionData);

    const updated = decisions.map((d) =>
      d.id === oldDecisionId ? { ...d, status: 'superseded' as const, supersededById: newDec.id, updatedAt: new Date().toISOString() } : d
    );
    setDecisions(updated);
    storageService.saveDecisions(updated);

    return newDec;
  }, [recordDecision, decisions]);

  // Dependencies with Cycle Detection (PRD 6.5 & Edge Case 8.4)
  const addDependency = useCallback((sourceTaskId: string, targetTaskId: string, type: Dependency['type']): { success: boolean; error?: string } => {
    if (sourceTaskId === targetTaskId) {
      return { success: false, error: 'A task cannot depend on itself.' };
    }

    // Check existing
    const exists = dependencies.some((d) => d.sourceTaskId === sourceTaskId && d.targetTaskId === targetTaskId);
    if (exists) {
      return { success: false, error: 'This dependency already exists.' };
    }

    // Cycle detection check (Depth-First Search)
    const checkCycle = (currSource: string, targetToFind: string, visited: Set<string>): boolean => {
      if (currSource === targetToFind) return true;
      if (visited.has(currSource)) return false;
      visited.add(currSource);

      const outgoing = dependencies.filter((d) => d.targetTaskId === currSource);
      for (const dep of outgoing) {
        if (checkCycle(dep.sourceTaskId, targetToFind, visited)) return true;
      }
      return false;
    };

    if (checkCycle(sourceTaskId, targetTaskId, new Set())) {
      return { success: false, error: 'Circular dependency detected: adding this would create an infinite dependency loop.' };
    }

    const task = tasks.find((t) => t.id === sourceTaskId);
    const newDep: Dependency = {
      id: `dep-${Date.now().toString(36)}`,
      organizationId: organization.id,
      projectId: task ? task.projectId : '',
      sourceTaskId,
      targetTaskId,
      type,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    const updated = [...dependencies, newDep];
    setDependencies(updated);
    storageService.saveDependencies(updated);
    return { success: true };
  }, [dependencies, tasks, organization.id, currentUser.id]);

  const removeDependency = useCallback((dependencyId: string) => {
    const updated = dependencies.filter((d) => d.id !== dependencyId);
    setDependencies(updated);
    storageService.saveDependencies(updated);
  }, [dependencies]);

  // Focus Mode (PRD 6.11)
  const startFocusSession = useCallback((taskIds: string[], durationMinutes: number) => {
    const newSession: FocusSession = {
      id: `focus-${Date.now().toString(36)}`,
      organizationId: organization.id,
      userId: currentUser.id,
      startedAt: new Date().toISOString(),
      durationMinutes,
      taskIds,
      completedTaskIds: [],
      heldNotificationIds: [],
      status: 'active',
    };
    const updated = [newSession, ...focusSessions];
    setFocusSessions(updated);
    storageService.saveFocusSessions(updated);
  }, [organization.id, currentUser.id, focusSessions]);

  const endFocusSession = useCallback((): FocusSession | null => {
    if (!activeFocusSession) return null;

    const completedSession: FocusSession = {
      ...activeFocusSession,
      status: 'completed',
      endedAt: new Date().toISOString(),
    };

    const updated = focusSessions.map((s) => (s.id === activeFocusSession.id ? completedSession : s));
    setFocusSessions(updated);
    storageService.saveFocusSessions(updated);

    // Release held notifications
    if (activeFocusSession.heldNotificationIds?.length > 0) {
      setNotifications((prev) =>
        prev.map((n) => (activeFocusSession.heldNotificationIds.includes(n.id) ? { ...n, isHeld: false } : n))
      );
    }

    return completedSession;
  }, [activeFocusSession, focusSessions]);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n));
      storageService.saveNotifications(updated);
      return updated;
    });
  }, []);

  const resetAllData = useCallback(() => {
    storageService.resetToSeed();
    window.location.reload();
  }, []);

  // Multi-tab synchronization (Gate 3 Resilience)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('konvey_')) {
        setProjects(storageService.getProjects());
        setTasks(storageService.getTasks());
        setDependencies(storageService.getDependencies());
        setBlockers(storageService.getBlockers());
        setDecisions(storageService.getDecisions());
        setScopeEvents(storageService.getScopeEvents());
        setActivities(storageService.getActivities());
        setNotifications(storageService.getNotifications());
        setFocusSessions(storageService.getFocusSessions());
        setClientChangeRequests(storageService.getClientChangeRequests());
        setClientDelayInquiries(storageService.getClientDelayInquiries());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const exportWorkspaceData = useCallback(() => {
    return storageService.exportAllState();
  }, []);

  const importWorkspaceData = useCallback((jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!validateWorkspaceBackup(parsed)) {
        return false;
      }
    } catch {
      return false;
    }

    const success = storageService.importState(jsonStr);
    if (success) {
      setProjects(storageService.getProjects());
      setTasks(storageService.getTasks());
      setDependencies(storageService.getDependencies());
      setBlockers(storageService.getBlockers());
      setDecisions(storageService.getDecisions());
      setScopeEvents(storageService.getScopeEvents());
      setActivities(storageService.getActivities());
      setNotifications(storageService.getNotifications());
      setFocusSessions(storageService.getFocusSessions());
      setClientChangeRequests(storageService.getClientChangeRequests());
      setClientDelayInquiries(storageService.getClientDelayInquiries());
    }
    return success;
  }, []);

  const value: OrgContextType = {
    organization,
    teams,
    projects,
    tasks,
    dependencies,
    blockers,
    decisions,
    scopeEvents,
    activities,
    notifications,
    activeFocusSession,
    heldNotifications,
    clientChangeRequests,
    clientDelayInquiries,
    createProject,
    updateProject,
    addProjectMember,
    removeProjectMember,
    reassignProjectMember,
    updateProjectMemberRole,
    submitClientChangeRequest,
    approveClientChangeRequest,
    rejectClientChangeRequest,
    submitClientDelayInquiry,
    respondToClientDelayInquiry,
    createTask,
    updateTask,
    deleteTask,
    addBlocker,
    resolveBlocker,
    recordDecision,
    supersedeDecision,
    addDependency,
    removeDependency,
    startFocusSession,
    endFocusSession,
    markNotificationAsRead,
    resetAllData,
    exportWorkspaceData,
    importWorkspaceData,
  };

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
};

export const useOrg = () => {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error('useOrg must be used within an OrgProvider');
  }
  return context;
};
