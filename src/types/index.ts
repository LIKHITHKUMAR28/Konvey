// ==========================================
// KONVEY CORE DATA MODELS & DOMAIN TYPES
// Matches Section 7 Data Model Sketch from PRD
// ==========================================

export type UserRole = 'admin' | 'manager' | 'member' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  organizationIds: string[];
  role: UserRole;
  title?: string;
  password?: string;
  teamIds?: string[];
  createdAt: string;
  lastActiveAt: string;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  memberIds: string[];
  managerIds: string[];
  color?: string;
  createdAt: string;
}

export type ProjectStatus = 'active' | 'completed' | 'archived';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectHealth = 'not_started' | 'on_track' | 'at_risk' | 'critical';

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  targetDate: string;
  completed: boolean;
  order: number;
}

export interface ProjectGoal {
  id: string;
  title: string;
  progressPercent: number;
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  ownerId: string;
  teamIds: string[];
  memberIds: string[];
  memberRoles?: Record<string, string>; // Maps memberId to project role e.g. "Tech Lead", "Core Engineer", "Product Manager"
  goalIds?: string[];
  milestones?: Milestone[];
  goals?: ProjectGoal[];
  status: ProjectStatus;
  priority: ProjectPriority;
  health: ProjectHealth;
  healthConfidence?: number;
  startDate: string;
  targetDate: string;
  baselineTaskCount?: number;
  baselineEstimatedMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'not_started' | 'in_progress' | 'blocked' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  organizationId: string;
  projectId: string;
  milestoneId?: string;
  parentTaskId?: string;
  title: string;
  description: string;
  assigneeId?: string;
  collaboratorIds: string[];
  status: TaskStatus;
  priority: TaskPriority;
  labels: string[];
  startDate?: string;
  dueDate?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  isBlocked: boolean;
  blockerId?: string;
  checklist?: ChecklistItem[];
  subtaskCount?: number;
  completedSubtaskCount?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type DependencyType = 'blocking' | 'blocked_by' | 'waiting_for' | 'related_to';

export interface Dependency {
  id: string;
  organizationId: string;
  projectId: string;
  sourceTaskId: string; // The prerequisite task
  targetTaskId: string; // The dependent task
  type: DependencyType;
  createdBy: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  organizationId: string;
  projectId: string;
  taskId: string;
  authorId: string;
  body: string;
  mentionedUserIds: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Activity {
  id: string;
  organizationId: string;
  entityType: 'project' | 'task' | 'blocker' | 'decision' | 'scope';
  entityId: string;
  projectId?: string;
  actorId: string;
  action: string;
  previousValue?: string;
  newValue?: string;
  createdAt: string;
}

// ------------------------------------------
// THE 7 SIGNATURE DIFFERENTIATOR MODELS
// ------------------------------------------

// 1. Blocker Intelligence Categories
export type BlockerCategory =
  | 'waiting_person'
  | 'waiting_approval'
  | 'waiting_info'
  | 'technical'
  | 'external_dependency'
  | 'unclear_requirements'
  | 'resource_unavailable'
  | 'client_response'
  | 'personal_workload';

export interface Blocker {
  id: string;
  organizationId: string;
  projectId: string;
  taskId: string;
  type: BlockerCategory;
  description: string;
  ownerId?: string; // Who can clear this blocker
  status: 'active' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

// 2. Decision Memory
export interface Decision {
  id: string;
  organizationId: string;
  projectId: string;
  decisionNumber: number; // e.g. #042
  title: string;
  decision: string;
  reason: string;
  alternatives: string[];
  decisionMakerIds: string[];
  relatedTaskIds: string[];
  status: 'active' | 'superseded';
  supersededById?: string;
  supportingDocuments?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// 3. Project Pulse & Risk Factors
export interface PulseRiskFactor {
  id: string;
  category: 'schedule' | 'blocker' | 'dependency' | 'workload' | 'scope';
  severity: 'warning' | 'critical';
  title: string;
  explanation: string;
  affectedTaskIds?: string[];
  suggestedAction?: string;
}

export interface ProjectHealthSnapshot {
  id: string;
  organizationId: string;
  projectId: string;
  score: number; // 0 to 100
  status: ProjectHealth;
  confidence: number; // 0 to 1
  riskFactors: PulseRiskFactor[];
  calculatedAt: string;
  aiExplanation?: string;
}

// 4. Scope Creep Radar
export type ScopeSource = 'client_request' | 'internal_request' | 'technical_change' | 'unknown';

export interface ScopeEvent {
  id: string;
  organizationId: string;
  projectId: string;
  type: 'added' | 'removed' | 'scope_increase';
  source: ScopeSource;
  taskId: string;
  taskTitle?: string;
  description: string;
  estimatedEffortMinutes: number;
  createdBy: string;
  createdAt: string;
}

// 5. Context Recovery
export interface ContextChangeItem {
  id: string;
  entityType: 'task' | 'comment' | 'decision' | 'dependency' | 'blocker';
  entityId: string;
  title: string;
  changeDescription: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  requiresAction: boolean;
}

export interface ContextRecoveryReport {
  lastActiveTimestamp: string;
  inactivityHours: number;
  changes: ContextChangeItem[];
  recommendedNextTask?: Task;
  recommendedNextActionReason?: string;
}

// 6. Focus Mode
export interface FocusSession {
  id: string;
  organizationId: string;
  userId: string;
  startedAt: string;
  endedAt?: string;
  durationMinutes: number;
  taskIds: string[];
  completedTaskIds: string[];
  heldNotificationIds: string[];
  status: 'active' | 'completed' | 'interrupted';
}

// 7. Recovery Mode Strategy
export type RecoveryStrategyType = 'add_resources' | 'reduce_scope' | 'parallelize_work' | 'extend_deadline';

export interface RecoveryOption {
  id: string;
  type: RecoveryStrategyType;
  title: string;
  description: string;
  proposedChanges: string[];
  potentialTimeSavedDays: number;
  tradeOffs: string[];
  confidence: number;
  tasksAffectedCount: number;
}

// Notification System
export type NotificationPriority = 'critical' | 'important' | 'normal' | 'low';

export interface Notification {
  id: string;
  organizationId: string;
  recipientId: string;
  type: 'mention' | 'assignment' | 'blocker' | 'deadline' | 'pulse_alert' | 'decision';
  priority: NotificationPriority;
  title: string;
  message: string;
  entityType: 'project' | 'task' | 'decision' | 'blocker';
  entityId: string;
  isRead: boolean;
  isHeld: boolean; // Held during Focus Mode
  createdAt: string;
}

// Client Change Request & Delay Inquiry System
export type ClientChangeStatus = 'pending_approval' | 'approved' | 'rejected';
export type ClientChangeType = 'scope_addition' | 'requirement_modification' | 'priority_revision' | 'de_scope';

export interface ClientChangeRequest {
  id: string;
  organizationId: string;
  projectId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  type: ClientChangeType;
  title: string;
  description: string;
  businessJustification: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  deadlineFlexibility: 'flexible' | 'firm';
  status: ClientChangeStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdTaskId?: string;
  createdAt: string;
}

export interface ClientDelayInquiry {
  id: string;
  organizationId: string;
  projectId: string;
  clientId: string;
  clientName: string;
  targetTaskId?: string;
  targetMilestoneId?: string;
  title: string;
  message: string;
  status: 'pending_pm_review' | 'responded';
  pmResponse?: string;
  respondedBy?: string;
  respondedAt?: string;
  createdAt: string;
}
