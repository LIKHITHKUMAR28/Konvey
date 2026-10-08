import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Boxes,
  FolderKanban,
  Zap,
  ArrowRight,
  TrendingUp,
  History,
  ShieldAlert,
  Flame,
  ArrowUpRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { TaskDetailDrawer } from '../tasks/TaskDetailDrawer';
import { NavigationTab } from '../layout/Sidebar';
import styles from './Dashboard.module.css';

interface DashboardViewProps {
  onSelectTab: (tab: NavigationTab) => void;
  onOpenProject: (projectId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectTab,
  onOpenProject,
}) => {
  const { currentUser, users } = useAuth();
  const { projects, tasks, blockers, activities } = useOrg();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Attention Items
  const activeBlockers = blockers.filter((b) => b.status === 'active');
  const overdueTasks = tasks.filter((t) => t.dueDate && t.dueDate < '2026-10-09' && t.status !== 'done');
  const myTasks = tasks.filter((t) => t.assigneeId === currentUser.id && t.status !== 'done');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'done');
  const overallProgress = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return (
    <div className={styles.dashboardContainer}>
      {/* Welcome Banner */}
      <div className={styles.bannerRow}>
        <div>
          <div className={styles.greetingRow}>
            <h1 className={styles.heading}>Good morning, {currentUser.name.split(' ')[0]}</h1>
            <span className={styles.workspaceTag}>ROY Tech solutions</span>
          </div>
          <p className={styles.subheading}>
            Here is a pulse of your team's projects, active blockers, and assigned work for today.
          </p>
        </div>

        <div className={styles.bannerActions}>
          <Button
            variant="secondary"
            size="md"
            leftIcon={<Zap size={14} />}
            onClick={() => onSelectTab('focus-mode')}
          >
            Focus Mode
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<FolderKanban size={14} />}
            onClick={() => onSelectTab('projects')}
          >
            All Projects ({projects.length})
          </Button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard} onClick={() => onSelectTab('projects')}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Active Projects</span>
            <span className={styles.kpiIconWrapper}>
              <FolderKanban size={15} color="#2563eb" />
            </span>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiNumber}>{projects.length}</span>
            <span className={styles.kpiBadgeSuccess}>All on track</span>
          </div>
          <div className={styles.kpiFooter}>Across engineering and product</div>
        </div>

        <div className={styles.kpiCard} onClick={() => onSelectTab('my-work')}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>In Progress</span>
            <span className={styles.kpiIconWrapper}>
              <TrendingUp size={15} color="#06b6d4" />
            </span>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiNumber}>{inProgressTasks.length}</span>
            <span className={styles.kpiSubText}>{myTasks.length} assigned to you</span>
          </div>
          <div className={styles.kpiProgressBar}>
            <div className={styles.kpiProgressFill} style={{ width: `${overallProgress}%` }} />
          </div>
        </div>

        <div className={styles.kpiCard} onClick={() => onSelectTab('dashboard')}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Active Blockers</span>
            <span className={styles.kpiIconWrapperCritical}>
              <AlertTriangle size={15} color="#d97706" />
            </span>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiNumberCritical}>{activeBlockers.length}</span>
            <span className={styles.kpiBadgeWarning}>
              {activeBlockers.length === 1 ? '1 needs review' : `${activeBlockers.length} need review`}
            </span>
          </div>
          <div className={styles.kpiFooter}>
            {activeBlockers[0]?.description || 'No critical dependencies stalled'}
          </div>
        </div>

        <div className={styles.kpiCard} onClick={() => onSelectTab('focus-mode')}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Sprint Progress</span>
            <span className={styles.kpiIconWrapper}>
              <CheckCircle2 size={15} color="#16a34a" />
            </span>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiNumber}>{overallProgress}%</span>
            <span className={styles.kpiBadgePurple}>{completedTasks.length}/{tasks.length} done</span>
          </div>
          <div className={styles.kpiFooter}>On target for sprint milestone</div>
        </div>
      </div>

      {/* SECTION 1: ATTENTION INBOX */}
      <div className={styles.attentionSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleRow}>
            <AlertTriangle size={17} color="#d97706" />
            <h3>Needs Attention</h3>
          </div>
          <span className={styles.sectionHint}>Items requiring action or review</span>
        </div>

        <div className={styles.attentionGrid}>
          {activeBlockers.map((b) => (
            <div
              key={b.id}
              className={`${styles.attentionCard} ${styles.cardCritical}`}
              onClick={() => setSelectedTaskId(b.taskId)}
            >
              <div className={styles.attentionTop}>
                <span className={styles.attentionType}>
                  <AlertTriangle size={13} /> Blocker
                </span>
                <Badge variant="critical" size="sm">Action needed</Badge>
              </div>
              <div className={styles.attentionTitle}>{b.description}</div>
              <div className={styles.attentionMeta}>
                Payment Gateway SDK • Blocking downstream checkout UI
              </div>
              <div className={styles.attentionAction}>
                <span>Inspect task</span>
                <ArrowRight size={13} />
              </div>
            </div>
          ))}

          {overdueTasks.slice(0, 1).map((t) => (
            <div
              key={t.id}
              className={`${styles.attentionCard} ${styles.cardWarning}`}
              onClick={() => setSelectedTaskId(t.id)}
            >
              <div className={styles.attentionTop}>
                <span className={styles.attentionTypeWarning}>
                  <Clock size={13} /> Due date passed
                </span>
                <Badge variant="warning" size="sm">Overdue</Badge>
              </div>
              <div className={styles.attentionTitle}>{t.title}</div>
              <div className={styles.attentionMeta}>
                Due on {new Date(t.dueDate!).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </div>
              <div className={styles.attentionAction}>
                <span>View details</span>
                <ArrowRight size={13} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: PROJECT OVERVIEW */}
      <div className={styles.pulseSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleRow}>
            <FolderKanban size={17} color="#2563eb" />
            <h3>Projects Overview</h3>
          </div>
          <button
            type="button"
            className={styles.viewAllBtn}
            onClick={() => onSelectTab('projects')}
          >
            <span>View all projects</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className={styles.pulseCardsGrid}>
          {projects.map((p) => {
            const pTasks = tasks.filter((t) => t.projectId === p.id);
            const pDone = pTasks.filter((t) => t.status === 'done');
            const pct = pTasks.length > 0 ? Math.round((pDone.length / pTasks.length) * 100) : 0;

            return (
              <Card
                key={p.id}
                variant={p.health === 'at_risk' ? 'default' : 'subtle'}
                padding="md"
                className={styles.pulseCardInteractive}
                onClick={() => onOpenProject(p.id)}
              >
                <div className={styles.pulseCardTop}>
                  <div className={styles.pTitleWithIcon}>
                    <FolderKanban size={16} color="var(--primary-600)" />
                    <span className={styles.pulseCardName}>{p.name}</span>
                  </div>
                  <Badge
                    variant={
                      p.health === 'on_track'
                        ? 'success'
                        : p.health === 'at_risk'
                        ? 'warning'
                        : 'critical'
                    }
                    size="sm"
                    dot
                  >
                    {p.health === 'on_track' ? 'On track' : p.health === 'at_risk' ? 'At risk' : 'Planned'}
                  </Badge>
                </div>

                <div className={styles.pulseExplanation}>
                  {p.health === 'at_risk' ? (
                    <span className={styles.riskReason}>
                      <strong>Why at risk:</strong> Payment Gateway blocked for 4 days; scope increased +39% above baseline.
                    </span>
                  ) : p.health === 'on_track' ? (
                    <span className={styles.trackReason}>
                      <strong>On track:</strong> Milestone 1 reached on schedule. All checklist deliverables advancing smoothly.
                    </span>
                  ) : (
                    <span className={styles.neutralReason}>
                      <strong>Baseline stage:</strong> Initial requirements and scope definitions undergoing sign-off.
                    </span>
                  )}
                </div>

                <div className={styles.pulseProgressRow}>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                  </div>
                  <span className={styles.progressLabel}>{pct}% ({pDone.length}/{pTasks.length})</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* SECTION 3 & 4: MY PRIORITIES & ACTIVITY */}
      <div className={styles.splitGrid}>
        {/* Left: My Work Assigned */}
        <Card variant="default" padding="lg">
          <div className={styles.splitHeader}>
            <div className={styles.splitTitleRow}>
              <CheckCircle2 size={16} color="var(--primary-600)" />
              <h4>Assigned to You ({myTasks.length})</h4>
            </div>
            <button
              type="button"
              className={styles.viewAllBtn}
              onClick={() => onSelectTab('my-work')}
            >
              <span>View all tasks</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className={styles.myTasksList}>
            {myTasks.length === 0 ? (
              <div className={styles.emptyTasksNotice}>No active tasks currently assigned to you.</div>
            ) : (
              myTasks.map((t) => (
                <div
                  key={t.id}
                  className={`${styles.myTaskItem} ${t.isBlocked ? styles.myTaskBlocked : ''}`}
                  onClick={() => setSelectedTaskId(t.id)}
                >
                  <div className={styles.myTaskLeft}>
                    <span className={styles.taskDot} />
                    <span className={styles.myTaskTitle}>{t.title}</span>
                  </div>
                  <Badge
                    variant={
                      t.priority === 'urgent'
                        ? 'critical'
                        : t.priority === 'high'
                        ? 'warning'
                        : 'default'
                    }
                    size="sm"
                  >
                    {t.priority}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Right: Recent Activity */}
        <Card variant="default" padding="lg">
          <div className={styles.splitHeader}>
            <div className={styles.splitTitleRow}>
              <History size={16} color="var(--primary-600)" />
              <h4>Recent Activity</h4>
            </div>
            <span className={styles.sectionHint}>Workspace updates</span>
          </div>

          <div className={styles.auditList}>
            {activities.slice(0, 5).map((act) => {
              const actor = users.find((u) => u.id === act.actorId);
              return (
                <div key={act.id} className={styles.auditRow}>
                  <span className={styles.auditDot} />
                  <div className={styles.auditBody}>
                    <div className={styles.auditAction}>
                      <strong>{actor ? actor.name : 'Team Member'}</strong> {act.action}
                    </div>
                    <span className={styles.auditTime}>
                      {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Drawer for task inspection */}
      {selectedTaskId && (
        <TaskDetailDrawer
          taskId={selectedTaskId}
          isOpen={!!selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onOpenTask={(id) => setSelectedTaskId(id)}
        />
      )}
    </div>
  );
};
