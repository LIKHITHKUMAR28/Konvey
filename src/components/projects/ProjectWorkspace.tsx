import React, { useState } from 'react';
import {
  FolderKanban,
  LayoutList,
  Columns3,
  CalendarDays,
  GanttChart,
  ArrowLeft,
  Calendar,
  User,
  Plus,
  Activity,
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { Project } from '../../types';
import { useOrg } from '../../context/OrgContext';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProjectOverviewTab } from './ProjectOverviewTab';
import { ProjectListView } from '../views/ProjectListView';
import { ProjectKanbanView } from '../views/ProjectKanbanView';
import { ProjectCalendarView } from '../views/ProjectCalendarView';
import { ProjectTimelineView } from '../views/ProjectTimelineView';
import { TaskDetailDrawer } from '../tasks/TaskDetailDrawer';
import { ProjectPulseModal } from '../intelligence/ProjectPulseModal';
import { BlockerRadarView } from '../intelligence/BlockerRadarView';
import { ScopeRadarView } from '../intelligence/ScopeRadarView';
import { RecoveryModeModal } from '../intelligence/RecoveryModeModal';
import styles from './Projects.module.css';

export type ProjectViewTab =
  | 'overview'
  | 'list'
  | 'kanban'
  | 'calendar'
  | 'timeline'
  | 'blockers'
  | 'scope-radar';

interface ProjectWorkspaceProps {
  projectId: string;
  onBackToProjects: () => void;
  onOpenCreateTask: () => void;
}

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({
  projectId,
  onBackToProjects,
  onOpenCreateTask,
}) => {
  const { projects, tasks, blockers } = useOrg();
  const { users } = useAuth();

  const [activeTab, setActiveTab] = useState<ProjectViewTab>('overview');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isPulseModalOpen, setIsPulseModalOpen] = useState(false);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);

  const project = projects.find((p) => p.id === projectId);
  if (!project) return null;

  const owner = users.find((u) => u.id === project.ownerId);
  const projectTasks = tasks.filter((t) => t.projectId === projectId);
  const projectBlockers = blockers.filter((b) => b.projectId === projectId && b.status === 'active');
  const completedTasks = projectTasks.filter((t) => t.status === 'done');
  const progressPercent =
    projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0;

  return (
    <div className={styles.workspaceWrapper}>
      {/* Top Breadcrumb & Return to Projects Directory */}
      <div className={styles.topNavRow}>
        <button type="button" className={styles.backButton} onClick={onBackToProjects}>
          <ArrowLeft size={14} /> Back to Projects
        </button>

        <div className={styles.quickActionGroup}>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Activity size={14} />}
            onClick={() => setIsPulseModalOpen(true)}
          >
            Project Pulse
          </Button>

          <Button
            variant="destructive"
            size="sm"
            leftIcon={<ShieldAlert size={14} />}
            onClick={() => setIsRecoveryModalOpen(true)}
          >
            Recovery Mode
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={onOpenCreateTask}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Project Header Banner */}
      <div className={styles.projectHeaderCard}>
        <div className={styles.headerTitleRow}>
          <div className={styles.titleWithIcon}>
            <div className={styles.projectIconBadge}>
              <FolderKanban size={20} />
            </div>
            <div>
              <div className={styles.titleMeta}>
                <Badge
                  variant={
                    project.health === 'on_track'
                      ? 'success'
                      : project.health === 'at_risk'
                      ? 'warning'
                      : 'critical'
                  }
                  size="sm"
                  dot
                >
                  Health: {project.health.replace('_', ' ').toUpperCase()}
                </Badge>
                <span className={styles.priorityLabel}>{project.priority.toUpperCase()} PRIORITY</span>
              </div>
              <h1 className={styles.projectName}>{project.name}</h1>
              <p className={styles.projectDesc}>{project.description}</p>
            </div>
          </div>
        </div>

        {/* Project Metrics Strip */}
        <div className={styles.metricsStrip}>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>
              <User size={13} /> Project Lead
            </span>
            <span className={styles.metricValue}>{owner?.name || 'Unassigned'}</span>
          </div>

          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>
              <Calendar size={13} /> Target Date
            </span>
            <span className={styles.metricValue}>
              {new Date(project.targetDate).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>Overall Progress</span>
            <div className={styles.progressWithBar}>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
              </div>
              <span className={styles.metricValue}>{progressPercent}% ({completedTasks.length}/{projectTasks.length})</span>
            </div>
          </div>
        </div>

        {/* Perspective Navigation Tabs */}
        <div className={styles.perspectiveTabs}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FolderKanban size={14} /> Overview
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'list' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <LayoutList size={14} /> List
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'kanban' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('kanban')}
          >
            <Columns3 size={14} /> Kanban
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'calendar' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            <CalendarDays size={14} /> Calendar
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'timeline' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            <GanttChart size={14} /> Timeline
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'blockers' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('blockers')}
          >
            <AlertTriangle size={14} color={projectBlockers.length > 0 ? 'var(--critical)' : undefined} />
            Blocker Radar
            {projectBlockers.length > 0 && (
              <Badge variant="critical" size="sm">
                {projectBlockers.length}
              </Badge>
            )}
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'scope-radar' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('scope-radar')}
          >
            <TrendingUp size={14} /> Scope Radar
          </button>
        </div>
      </div>

      {/* Render Active Perspective View */}
      <div className={styles.activeViewArea}>
        {activeTab === 'overview' && (
          <ProjectOverviewTab
            project={project}
            onOpenTask={(id) => setSelectedTaskId(id)}
            onSelectViewTab={(tab) => setActiveTab(tab)}
            onOpenPulse={() => setIsPulseModalOpen(true)}
            onOpenRecovery={() => setIsRecoveryModalOpen(true)}
          />
        )}

        {activeTab === 'list' && (
          <ProjectListView
            projectId={project.id}
            onOpenTask={(id) => setSelectedTaskId(id)}
          />
        )}

        {activeTab === 'kanban' && (
          <ProjectKanbanView
            projectId={project.id}
            onOpenTask={(id) => setSelectedTaskId(id)}
          />
        )}

        {activeTab === 'calendar' && (
          <ProjectCalendarView
            projectId={project.id}
            onOpenTask={(id) => setSelectedTaskId(id)}
          />
        )}

        {activeTab === 'timeline' && (
          <ProjectTimelineView
            projectId={project.id}
            onOpenTask={(id) => setSelectedTaskId(id)}
          />
        )}

        {activeTab === 'blockers' && (
          <BlockerRadarView
            projectId={project.id}
            onOpenTask={(id) => setSelectedTaskId(id)}
          />
        )}

        {activeTab === 'scope-radar' && (
          <ScopeRadarView
            projectId={project.id}
            onLaunchRecoveryMode={() => setIsRecoveryModalOpen(true)}
          />
        )}
      </div>

      {/* Slide-In Task Detail Drawer */}
      <TaskDetailDrawer
        taskId={selectedTaskId}
        isOpen={Boolean(selectedTaskId)}
        onClose={() => setSelectedTaskId(null)}
        onOpenTask={(id) => setSelectedTaskId(id)}
      />

      {/* Project Pulse Explainable Analysis Modal */}
      <ProjectPulseModal
        project={project}
        isOpen={isPulseModalOpen}
        onClose={() => setIsPulseModalOpen(false)}
        onOpenTask={(id) => setSelectedTaskId(id)}
        onLaunchRecoveryMode={() => {
          setIsPulseModalOpen(false);
          setIsRecoveryModalOpen(true);
        }}
      />

      {/* Recovery Mode Trade-Off Simulator Modal */}
      <RecoveryModeModal
        project={project}
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
      />
    </div>
  );
};
