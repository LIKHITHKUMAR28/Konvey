import { UserRole } from '../types';

export type Permission =
  | 'CAN_MANAGE_PROJECT_MEMBERS'
  | 'CAN_APPROVE_CLIENT_CHANGES'
  | 'CAN_VIEW_CLIENT_PORTAL'
  | 'CAN_APPLY_RECOVERY'
  | 'CAN_CREATE_PROJECT'
  | 'CAN_ARCHIVE_PROJECT'
  | 'CAN_DELETE_PROJECT'
  | 'CAN_CREATE_TASK'
  | 'CAN_RESOLVE_BLOCKER'
  | 'CAN_RECORD_DECISION'
  | 'CAN_SUPERSEDE_DECISION'
  | 'CAN_MANAGE_TEAM'
  | 'CAN_EXPORT_DATA'
  | 'CAN_IMPORT_DATA'
  | 'CAN_RESET_DEMO'
  | 'CAN_VIEW_AUDIT_LOG';

export interface RoleCapability {
  role: UserRole;
  label: string;
  description: string;
  permissions: Permission[];
}

export const ROLE_CAPABILITIES: Record<UserRole, RoleCapability> = {
  admin: {
    role: 'admin',
    label: 'Organization Administrator',
    description: 'Full workspace authority. Can manage members across projects, configure governance, approve client scope changes, export data, and authorize project recovery.',
    permissions: [
      'CAN_MANAGE_PROJECT_MEMBERS',
      'CAN_APPROVE_CLIENT_CHANGES',
      'CAN_VIEW_CLIENT_PORTAL',
      'CAN_APPLY_RECOVERY',
      'CAN_CREATE_PROJECT',
      'CAN_ARCHIVE_PROJECT',
      'CAN_DELETE_PROJECT',
      'CAN_CREATE_TASK',
      'CAN_RESOLVE_BLOCKER',
      'CAN_RECORD_DECISION',
      'CAN_SUPERSEDE_DECISION',
      'CAN_MANAGE_TEAM',
      'CAN_EXPORT_DATA',
      'CAN_IMPORT_DATA',
      'CAN_RESET_DEMO',
      'CAN_VIEW_AUDIT_LOG',
    ],
  },
  manager: {
    role: 'manager',
    label: 'Project Manager / Team Lead',
    description: 'Project delivery governance. Has authority to add/remove/reassign members, approve client requirement changes, authorize Recovery Mode timeline adjustments, and resolve critical blockers.',
    permissions: [
      'CAN_MANAGE_PROJECT_MEMBERS',
      'CAN_APPROVE_CLIENT_CHANGES',
      'CAN_VIEW_CLIENT_PORTAL',
      'CAN_APPLY_RECOVERY',
      'CAN_CREATE_PROJECT',
      'CAN_ARCHIVE_PROJECT',
      'CAN_CREATE_TASK',
      'CAN_RESOLVE_BLOCKER',
      'CAN_RECORD_DECISION',
      'CAN_SUPERSEDE_DECISION',
      'CAN_MANAGE_TEAM',
      'CAN_EXPORT_DATA',
      'CAN_VIEW_AUDIT_LOG',
    ],
  },
  member: {
    role: 'member',
    label: 'Individual Contributor',
    description: 'Execution specialist. Can manage assigned deliverables, enter Focus Mode, report blockers, and view approved client requirements.',
    permissions: [
      'CAN_CREATE_TASK',
      'CAN_RESOLVE_BLOCKER',
      'CAN_RECORD_DECISION',
      'CAN_VIEW_AUDIT_LOG',
    ],
  },
  client: {
    role: 'client',
    label: 'Client Stakeholder / Sponsor',
    description: 'Executive project visibility. Can monitor delivery milestones, question delays, suggest changes, and submit formal requirement modifications.',
    permissions: [
      'CAN_VIEW_CLIENT_PORTAL',
      'CAN_VIEW_AUDIT_LOG',
    ],
  },
};

/**
 * Checks if a given role has the requested permission
 */
export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  const capability = ROLE_CAPABILITIES[role];
  if (!capability) return false;
  return capability.permissions.includes(permission);
};

export const PERMISSION_LABELS: Record<Permission, { name: string; category: string }> = {
  CAN_MANAGE_PROJECT_MEMBERS: { name: 'Add, Remove & Reassign Project Members', category: 'Project Governance' },
  CAN_APPROVE_CLIENT_CHANGES: { name: 'Review & Approve Client Requirements', category: 'Project Governance' },
  CAN_VIEW_CLIENT_PORTAL: { name: 'Access Executive Client Portal', category: 'Client Relations' },
  CAN_APPLY_RECOVERY: { name: 'Authorize Recovery Mode Mutations', category: 'Project Governance' },
  CAN_CREATE_PROJECT: { name: 'Create New Projects', category: 'Project Governance' },
  CAN_ARCHIVE_PROJECT: { name: 'Archive Completed Projects', category: 'Project Governance' },
  CAN_DELETE_PROJECT: { name: 'Permanently Delete Projects', category: 'Administration' },
  CAN_CREATE_TASK: { name: 'Create & Assign Tasks', category: 'Task Execution' },
  CAN_RESOLVE_BLOCKER: { name: 'Resolve Active Blockers', category: 'Task Execution' },
  CAN_RECORD_DECISION: { name: 'Record Architectural Decisions', category: 'Institutional Memory' },
  CAN_SUPERSEDE_DECISION: { name: 'Supersede Past Decisions', category: 'Institutional Memory' },
  CAN_MANAGE_TEAM: { name: 'Manage Team Members & Seats', category: 'Administration' },
  CAN_EXPORT_DATA: { name: 'Export Workspace Data (JSON)', category: 'Administration' },
  CAN_IMPORT_DATA: { name: 'Import Workspace Backup', category: 'Administration' },
  CAN_RESET_DEMO: { name: 'Reset Demo State to Baseline', category: 'Administration' },
  CAN_VIEW_AUDIT_LOG: { name: 'Inspect System Audit Log', category: 'Institutional Memory' },
};
