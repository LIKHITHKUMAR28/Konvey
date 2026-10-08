import React, { useState } from 'react';
import {
  Flag,
  Target,
  AlertTriangle,
  Users2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  UserPlus,
  Sparkles,
  Check,
  X,
  FileCheck2,
} from 'lucide-react';
import { Project, Task } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import { hasPermission } from '../../services/permissionService';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProjectMembersModal } from './ProjectMembersModal';
import styles from './Projects.module.css';

export type ProjectOverviewTabTarget = 'list' | 'kanban' | 'calendar' | 'timeline' | 'blockers' | 'scope-radar';

interface ProjectOverviewTabProps {
  project: Project;
  onOpenTask: (taskId: string) => void;
  onSelectViewTab: (tab: ProjectOverviewTabTarget) => void;
  onOpenPulse?: () => void;
  onOpenRecovery?: () => void;
}

export const ProjectOverviewTab: React.FC<ProjectOverviewTabProps> = ({
  project,
  onOpenTask,
  onSelectViewTab,
  onOpenPulse,
  onOpenRecovery,
}) => {
  const { tasks, blockers, clientChangeRequests, approveClientChangeRequest, rejectClientChangeRequest } = useOrg();
  const { users, role } = useAuth();
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);

  const canManageMembers = hasPermission(role, 'CAN_MANAGE_PROJECT_MEMBERS');
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const activeBlockers = blockers.filter((b) => b.projectId === project.id && b.status === 'active');
  const projectMembers = users.filter((u) => project.memberIds.includes(u.id));

  // Client requests for this project
  const projectClientRequests = clientChangeRequests.filter((r) => r.projectId === project.id);
  const pendingClientRequests = projectClientRequests.filter((r) => r.status === 'pending_approval');
  const approvedClientRequests = projectClientRequests.filter((r) => r.status === 'approved');

  const completedTasks = projectTasks.filter((t) => t.status === 'done');
  const progressPercent =
    projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0;

  return (
    <div className={styles.overviewContainer}>
      {/* Pending Client Change Requests Notice for PM & Admin */}
      {pendingClientRequests.length > 0 && canManageMembers && (
        <div style={{
          padding: '1rem 1.25rem',
          background: 'var(--primary-50)',
          border: '1px solid var(--primary-200)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileCheck2 size={22} color="var(--primary-600)" />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--primary-900)', fontSize: '0.9rem' }}>
                {pendingClientRequests.length} Client Change Request(s) Awaiting Review & Approval
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--primary-700)', marginTop: '0.15rem' }}>
                {pendingClientRequests[0].clientName}: "{pendingClientRequests[0].title}" ({pendingClientRequests[0].type.replace('_', ' ')})
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Check size={13} />}
              onClick={() => approveClientChangeRequest(pendingClientRequests[0].id, 'Approved by Project Leadership for active sprint.')}
            >
              Approve for Sprint
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<X size={13} />}
              onClick={() => rejectClientChangeRequest(pendingClientRequests[0].id, 'Deferred to subsequent project phase.')}
            >
              Decline
            </Button>
          </div>
        </div>
      )}
      {/* Active Blocker Alert (Principle 2: Explain every important signal) */}
      {activeBlockers.length > 0 && (
        <div className={styles.blockerAlertBox}>
          <div className={styles.alertLeft}>
            <AlertTriangle size={20} className={styles.alertIcon} />
            <div>
              <div className={styles.alertHeading}>
                Project Health Signal: {activeBlockers.length} Active Blocker Impeding Progress
              </div>
              <div className={styles.alertBody}>
                {activeBlockers[0].description} ({activeBlockers[0].type.replace('_', ' ')})
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onSelectViewTab('blockers')}
            >
              Open Blocker Radar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onOpenTask(activeBlockers[0].taskId)}
            >
              Inspect Blocked Task
            </Button>
          </div>
        </div>
      )}

      {/* Main Grid: Milestones Roadmap & Goals */}
      <div className={styles.overviewGrid}>
        {/* Left Column: Milestones Roadmap */}
        <div className={styles.gridColumn}>
          <Card variant="default" padding="lg">
            <div className={styles.cardHeaderRow}>
              <div className={styles.cardTitleGroup}>
                <Flag size={16} color="var(--primary-600)" />
                <h4>Milestone Roadmap</h4>
              </div>
              <span className={styles.cardMeta}>
                {project.milestones?.filter((m) => m.completed).length || 0} of{' '}
                {project.milestones?.length || 0} reached
              </span>
            </div>

            <div className={styles.milestoneList}>
              {project.milestones?.map((m, idx) => (
                <div key={m.id} className={styles.milestoneRow}>
                  <div className={styles.milestoneIndicator}>
                    <div
                      className={`${styles.milestoneDot} ${m.completed ? styles.dotCompleted : ''}`}
                    >
                      {m.completed && <CheckCircle2 size={12} color="var(--white)" />}
                    </div>
                    {idx < (project.milestones?.length || 0) - 1 && (
                      <div
                        className={`${styles.milestoneLine} ${m.completed ? styles.lineCompleted : ''}`}
                      />
                    )}
                  </div>

                  <div className={styles.milestoneContent}>
                    <div className={styles.milestoneTop}>
                      <span className={`${styles.milestoneTitle} ${m.completed ? styles.titleDone : ''}`}>
                        {m.title}
                      </span>
                      <Badge variant={m.completed ? 'success' : 'default'} size="sm">
                        {m.completed ? 'Reached' : 'In Progress'}
                      </Badge>
                    </div>
                    <span className={styles.milestoneDate}>
                      <Calendar size={11} /> Target: {new Date(m.targetDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Project Team Members Roster */}
          <Card variant="default" padding="lg">
            <div className={styles.cardHeaderRow}>
              <div className={styles.cardTitleGroup}>
                <Users2 size={16} color="var(--primary-600)" />
                <h4>Project Team ({projectMembers.length})</h4>
              </div>
              {canManageMembers && (
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<UserPlus size={13} />}
                  onClick={() => setIsManageMembersOpen(true)}
                >
                  Manage Team & Roles
                </Button>
              )}
            </div>

            <div className={styles.teamGrid}>
              {projectMembers.map((member) => (
                <div key={member.id} className={styles.memberCard}>
                  <img src={member.avatarUrl} alt={member.name} className={styles.memberAvatar} />
                  <div className={styles.memberInfo}>
                    <span className={styles.memberName}>{member.name}</span>
                    <span className={styles.memberTitle}>
                      {project.memberRoles?.[member.id] || member.title || member.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Project Goals & Quick Action Bridge */}
        <div className={styles.gridColumn}>
          {/* Approved Client Requirements Section */}
          {approvedClientRequests.length > 0 && (
            <Card variant="default" padding="lg">
              <div className={styles.cardHeaderRow}>
                <div className={styles.cardTitleGroup}>
                  <Sparkles size={16} color="var(--primary-600)" />
                  <h4>Client Requirements in Sprint ({approvedClientRequests.length})</h4>
                </div>
                <Badge variant="success" size="sm">Approved</Badge>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
                {approvedClientRequests.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      padding: '0.75rem 0.9rem',
                      background: 'var(--bg-surface-elevated)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.3rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {req.title}
                      </span>
                      <Badge variant="intel" size="sm">{req.type.replace('_', ' ')}</Badge>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                      {req.description}
                    </p>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Client: {req.clientName}</span>
                      <span>PM Approved • Queued in sprint</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card variant="default" padding="lg">
            <div className={styles.cardHeaderRow}>
              <div className={styles.cardTitleGroup}>
                <Target size={16} color="var(--intel-600)" />
                <h4>Core Project Goals</h4>
              </div>
            </div>

            <div className={styles.goalsList}>
              {project.goals?.map((goal) => (
                <div key={goal.id} className={styles.goalItem}>
                  <div className={styles.goalHeader}>
                    <span className={styles.goalTitle}>{goal.title}</span>
                    <span className={styles.goalPercent}>{goal.progressPercent}%</span>
                  </div>
                  <div className={styles.goalProgressBg}>
                    <div
                      className={styles.goalProgressBar}
                      style={{ width: `${goal.progressPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Work Breakdown Quick Links */}
          <Card variant="intel" padding="lg">
            <h4 style={{ color: 'var(--intel-700)', marginBottom: '8px' }}>Execution Perspectives</h4>
            <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: '16px', lineHeight: 1.5 }}>
              Switch perspectives to evaluate the project from tabular, status board, deadline calendar, or timeline dependencies.
            </p>

            <div className={styles.perspectiveButtons}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onSelectViewTab('kanban')}
                rightIcon={<ArrowRight size={13} />}
              >
                Open Kanban Board ({projectTasks.filter((t) => t.status === 'in_progress').length} In Progress)
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onSelectViewTab('timeline')}
                rightIcon={<ArrowRight size={13} />}
              >
                Inspect Timeline & Dependencies
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onSelectViewTab('scope-radar')}
                rightIcon={<ArrowRight size={13} />}
              >
                Scope Creep Radar (+39% Growth)
              </Button>
              {onOpenPulse && (
                <Button
                  variant="intel"
                  size="sm"
                  onClick={onOpenPulse}
                  rightIcon={<ArrowRight size={13} />}
                >
                  Inspect Project Pulse & Drivers
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Member Governance Modal for Sameera & Rahul */}
      <ProjectMembersModal
        isOpen={isManageMembersOpen}
        onClose={() => setIsManageMembersOpen(false)}
        projectId={project.id}
      />
    </div>
  );
};
