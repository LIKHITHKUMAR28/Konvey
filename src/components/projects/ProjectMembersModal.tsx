import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ArrowRightLeft,
  Trash2,
  Edit3,
  Check,
} from 'lucide-react';
import { UserRole } from '../../types';
import { useOrg } from '../../context/OrgContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import styles from './ProjectMembersModal.module.css';

interface ProjectMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export const ProjectMembersModal: React.FC<ProjectMembersModalProps> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const {
    projects,
    tasks,
    addProjectMember,
    removeProjectMember,
    reassignProjectMember,
    updateProjectMemberRole,
  } = useOrg();
  const { users } = useAuth();

  const [activeTab, setActiveTab] = useState<'roster' | 'add'>('roster');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state for existing member
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('member');
  const [editTitle, setEditTitle] = useState<string>('');

  // Reassigning state
  const [reassignUserId, setReassignUserId] = useState<string | null>(null);
  const [targetProjectId, setTargetProjectId] = useState<string>('');
  const [reassignTasksToLead, setReassignTasksToLead] = useState<boolean>(true);

  // Adding new member state
  const [selectedAddUserId, setSelectedAddUserId] = useState<string>('');
  const [addMemberRole, setAddMemberRole] = useState<UserRole>('member');
  const [addMemberTitle, setAddMemberTitle] = useState<string>('');

  const project = projects.find((p) => p.id === projectId);
  if (!project) return null;

  const currentMembers = users.filter((u) => project.memberIds.includes(u.id));
  const availableUsers = users.filter((u) => !project.memberIds.includes(u.id));
  const otherProjects = projects.filter((p) => p.id !== projectId);

  const filteredAvailableUsers = availableUsers.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.title && u.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleStartEdit = (memberId: string) => {
    const member = users.find((u) => u.id === memberId);
    if (!member) return;
    setEditingUserId(memberId);
    setEditRole(member.role);
    setEditTitle(project.memberRoles?.[memberId] || member.title || '');
    setReassignUserId(null);
  };

  const handleSaveEdit = (memberId: string) => {
    updateProjectMemberRole(projectId, memberId, editRole, editTitle);
    setEditingUserId(null);
  };

  const handleStartReassign = (memberId: string) => {
    setReassignUserId(memberId);
    setEditingUserId(null);
    if (otherProjects.length > 0) {
      setTargetProjectId(otherProjects[0].id);
    }
  };

  const handleConfirmReassign = (memberId: string) => {
    if (!targetProjectId) return;
    const targetLeadId = reassignTasksToLead ? project.ownerId : undefined;
    reassignProjectMember(projectId, targetProjectId, memberId, targetLeadId);
    setReassignUserId(null);
  };

  const handleRemoveMember = (memberId: string) => {
    const member = users.find((u) => u.id === memberId);
    const confirmMessage = `Remove ${member?.name || 'this member'} from ${project.name}? Open tasks will be unassigned.`;
    if (window.confirm(confirmMessage)) {
      removeProjectMember(projectId, memberId, true);
    }
  };

  const handleAddMember = (userToAddId: string) => {
    const user = users.find((u) => u.id === userToAddId);
    if (!user) return;
    addProjectMember(projectId, userToAddId, addMemberTitle || user.title || 'Project Member');
    if (addMemberRole !== user.role) {
      updateProjectMemberRole(projectId, userToAddId, addMemberRole, addMemberTitle || user.title || 'Project Member');
    }
    setSelectedAddUserId('');
    setAddMemberTitle('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={20} color="var(--primary-600)" />
          <span>Manage Project Team & Roles — {project.name}</span>
        </div>
      }
      size="lg"
    >
      <div className={styles.container}>
        {/* Tab Switcher */}
        <div className={styles.tabBar}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'roster' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('roster')}
          >
            <Users size={16} />
            <span>Active Team Roster</span>
            <span className={styles.badgePill}>{currentMembers.length}</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'add' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <UserPlus size={16} />
            <span>Add Workspace Members</span>
            <span className={styles.badgePill}>{availableUsers.length}</span>
          </button>
        </div>

        {/* Tab 1: Active Team Roster */}
        {activeTab === 'roster' && (
          <div className={styles.memberList}>
            {currentMembers.map((member) => {
              const isLead = member.id === project.ownerId;
              const assignedTaskCount = tasks.filter(
                (t) => t.projectId === projectId && t.assigneeId === member.id && t.status !== 'done'
              ).length;
              const projectRoleDisplay = project.memberRoles?.[member.id] || member.title || member.role;
              const isEditing = editingUserId === member.id;
              const isReassigning = reassignUserId === member.id;

              return (
                <div key={member.id} className={styles.memberCard}>
                  <div className={styles.memberRow}>
                    <div className={styles.memberLeft}>
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className={styles.avatar}
                      />
                      <div className={styles.memberMeta}>
                        <div className={styles.nameRow}>
                          <span className={styles.memberName}>{member.name}</span>
                          {isLead && (
                            <Badge variant="primary" size="sm">
                              Project Lead
                            </Badge>
                          )}
                          <Badge
                            variant={member.role === 'admin' ? 'intel' : member.role === 'manager' ? 'warning' : 'default'}
                            size="sm"
                          >
                            {member.role.toUpperCase()}
                          </Badge>
                        </div>
                        <div className={styles.memberSub}>
                          <span className={styles.roleTag}>{projectRoleDisplay}</span>
                          <span>•</span>
                          <span>{assignedTaskCount} active tasks</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.actionsGroup}>
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Edit3 size={13} />}
                        onClick={() => (isEditing ? setEditingUserId(null) : handleStartEdit(member.id))}
                      >
                        {isEditing ? 'Cancel' : 'Edit Role'}
                      </Button>

                      {otherProjects.length > 0 && !isLead && (
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<ArrowRightLeft size={13} />}
                          onClick={() => (isReassigning ? setReassignUserId(null) : handleStartReassign(member.id))}
                        >
                          Reassign
                        </Button>
                      )}

                      {!isLead && (
                        <Button
                          variant="tertiary"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                          title="Remove from project"
                        >
                          <Trash2 size={14} color="var(--critical-600)" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Inline Role & Title Edit Panel */}
                  {isEditing && (
                    <div className={styles.editPanel}>
                      <div className={styles.editRow}>
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>System Workspace Role</label>
                          <select
                            className={styles.fieldSelect}
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value as UserRole)}
                          >
                            <option value="member">Member (Individual Contributor)</option>
                            <option value="manager">Manager (Project Lead)</option>
                            <option value="admin">Admin (Full Organization Authority)</option>
                            <option value="client">Client (External Sponsor / Stakeholder)</option>
                          </select>
                        </div>

                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>Project Role Title</label>
                          <input
                            type="text"
                            className={styles.fieldInput}
                            placeholder="e.g. Lead Mobile Architect, QA Engineer"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className={styles.editActions}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingUserId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Check size={13} />}
                          onClick={() => handleSaveEdit(member.id)}
                        >
                          Save Role
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Reassignment to Another Project Sub-panel */}
                  {isReassigning && (
                    <div className={styles.reassignPanel}>
                      <div className={styles.reassignTitle}>
                        <ArrowRightLeft size={14} />
                        <span>Reassign {member.name} to Another Project</span>
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Destination Project</label>
                        <select
                          className={styles.fieldSelect}
                          value={targetProjectId}
                          onChange={(e) => setTargetProjectId(e.target.value)}
                        >
                          {otherProjects.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.status})
                            </option>
                          ))}
                        </select>
                      </div>

                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={reassignTasksToLead}
                          onChange={(e) => setReassignTasksToLead(e.target.checked)}
                        />
                        <span>
                          Reassign {assignedTaskCount} open tasks in {project.name} to Project Lead ({users.find(u => u.id === project.ownerId)?.name || 'Lead'})
                        </span>
                      </label>

                      <div className={styles.editActions}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setReassignUserId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<ArrowRightLeft size={13} />}
                          onClick={() => handleConfirmReassign(member.id)}
                        >
                          Confirm Reassignment
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Add Workspace Members */}
        {activeTab === 'add' && (
          <div className={styles.addMemberSection}>
            <input
              type="text"
              className={styles.searchBar}
              placeholder="Search available teammates by name, title, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {filteredAvailableUsers.length === 0 ? (
              <div className={styles.emptyState}>
                No available workspace members found matching your search.
              </div>
            ) : (
              <div className={styles.memberList}>
                {filteredAvailableUsers.map((user) => {
                  const isSelected = selectedAddUserId === user.id;

                  return (
                    <div key={user.id} className={styles.memberCard}>
                      <div className={styles.memberRow}>
                        <div className={styles.memberLeft}>
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className={styles.avatar}
                          />
                          <div className={styles.memberMeta}>
                            <div className={styles.nameRow}>
                              <span className={styles.memberName}>{user.name}</span>
                              <Badge
                                variant={user.role === 'admin' ? 'intel' : user.role === 'manager' ? 'warning' : 'default'}
                                size="sm"
                              >
                                {user.role.toUpperCase()}
                              </Badge>
                            </div>
                            <span className={styles.memberSub}>
                              {user.title || user.email}
                            </span>
                          </div>
                        </div>

                        <div className={styles.actionsGroup}>
                          {isSelected ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setSelectedAddUserId('')}
                            >
                              Cancel
                            </Button>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              leftIcon={<UserPlus size={13} />}
                              onClick={() => {
                                setSelectedAddUserId(user.id);
                                setAddMemberTitle(user.title || 'Project Member');
                              }}
                            >
                              Configure & Add
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Custom Title Input when selected */}
                      {isSelected && (
                        <div className={styles.editPanel}>
                          <div className={styles.editRow}>
                            <div className={styles.fieldGroup}>
                              <label className={styles.fieldLabel}>System Workspace Role</label>
                              <select
                                className={styles.fieldSelect}
                                value={addMemberRole}
                                onChange={(e) => setAddMemberRole(e.target.value as UserRole)}
                              >
                                <option value="member">Member (Individual Contributor)</option>
                                <option value="manager">Manager (Project Lead)</option>
                                <option value="admin">Admin (Full Organization Authority)</option>
                                <option value="client">Client (External Sponsor / Stakeholder)</option>
                              </select>
                            </div>

                            <div className={styles.fieldGroup}>
                              <label className={styles.fieldLabel}>Role Title for this Project</label>
                              <input
                                type="text"
                                className={styles.fieldInput}
                                placeholder="e.g. Lead Frontend Engineer, Security Auditor"
                                value={addMemberTitle}
                                onChange={(e) => setAddMemberTitle(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className={styles.editActions}>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setSelectedAddUserId('')}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              leftIcon={<Check size={13} />}
                              onClick={() => handleAddMember(user.id)}
                            >
                              Add to {project.name}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
