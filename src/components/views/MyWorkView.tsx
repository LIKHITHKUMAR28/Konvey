import React, { useState } from 'react';
import {
  CheckSquare,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Zap,
  Clock,
  ArrowRight,
  FolderKanban,
  History,
} from 'lucide-react';
import { Task } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { TaskDetailDrawer } from '../tasks/TaskDetailDrawer';
import styles from './MyWork.module.css';

interface MyWorkViewProps {
  onEnterFocusMode: () => void;
  onOpenContextRecovery?: () => void;
}

export const MyWorkView: React.FC<MyWorkViewProps> = ({
  onEnterFocusMode,
  onOpenContextRecovery,
}) => {
  const { currentUser } = useAuth();
  const { tasks, projects } = useOrg();

  const [activeTab, setActiveTab] = useState<'all' | 'due_soon' | 'blocked' | 'done'>('all');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Filter tasks assigned to current persona
  const myTasks = tasks.filter((t) => t.assigneeId === currentUser.id);

  const blockedTasks = myTasks.filter((t) => t.isBlocked || t.status === 'blocked');
  const completedTasks = myTasks.filter((t) => t.status === 'done');
  const activeTasks = myTasks.filter((t) => t.status !== 'done');

  // Filter based on active tab
  const displayedTasks =
    activeTab === 'all'
      ? activeTasks
      : activeTab === 'due_soon'
      ? activeTasks.filter((t) => Boolean(t.dueDate))
      : activeTab === 'blocked'
      ? blockedTasks
      : completedTasks;

  const getProject = (id: string) => projects.find((p) => p.id === id);

  return (
    <div className={styles.myWorkContainer}>
      {/* Header with Quick Focus Mode Bridge */}
      <div className={styles.headerRow}>
        <div>
          <h2>My Work</h2>
          <p className={styles.subtext}>
            Tasks assigned to <strong>{currentUser.name}</strong> ({currentUser.title || currentUser.role}). Focus on what is due next.
          </p>
        </div>

        <div className={styles.actionCluster}>
          {onOpenContextRecovery && (
            <Button
              variant="secondary"
              size="md"
              leftIcon={<History size={14} />}
              onClick={onOpenContextRecovery}
            >
              Catch up
            </Button>
          )}

          <Button
            variant="primary"
            size="md"
            leftIcon={<Zap size={14} />}
            onClick={onEnterFocusMode}
          >
            Focus Mode
          </Button>
        </div>
      </div>

      {/* Segmented Filter Bar */}
      <div className={styles.filterRow}>
        <div className={styles.tabGroup}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'all' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Active Tasks ({activeTasks.length})
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'due_soon' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('due_soon')}
          >
            <Clock size={13} /> Scheduled ({activeTasks.filter((t) => Boolean(t.dueDate)).length})
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'blocked' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('blocked')}
          >
            <AlertTriangle size={13} color="var(--critical)" /> Blocked ({blockedTasks.length})
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'done' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('done')}
          >
            <CheckCircle2 size={13} color="var(--success)" /> Completed ({completedTasks.length})
          </button>
        </div>
      </div>

      {/* Tasks List Stream */}
      <div className={styles.tasksStream}>
        {displayedTasks.length === 0 ? (
          <div className={styles.emptyState}>
            <CheckSquare size={32} className={styles.emptyIcon} />
            <h4>No tasks in this view</h4>
            <p>You have no items matching this criteria. Enjoy the calm workspace.</p>
          </div>
        ) : (
          displayedTasks.map((task) => {
            const project = getProject(task.projectId);
            const checklist = task.checklist || [];
            const completedChecklist = checklist.filter((c) => c.completed).length;

            return (
              <div
                key={task.id}
                className={`${styles.taskItem} ${task.isBlocked ? styles.itemBlocked : ''}`}
                onClick={() => setSelectedTaskId(task.id)}
              >
                <div className={styles.itemLeft}>
                  {task.isBlocked ? (
                    <AlertTriangle size={18} className={styles.blockerIcon} />
                  ) : (
                    <CheckSquare size={18} className={styles.checkIcon} />
                  )}

                  <div className={styles.itemTitleGroup}>
                    <div className={styles.titleRow}>
                      <span className={styles.taskTitle}>{task.title}</span>
                      {task.isBlocked && (
                        <Badge variant="critical" size="sm">
                          Blocked
                        </Badge>
                      )}
                    </div>

                    <div className={styles.itemSubRow}>
                      {project && (
                        <span className={styles.projectTag}>
                          <FolderKanban size={11} /> {project.name}
                        </span>
                      )}

                      {task.dueDate && (
                        <span className={styles.dueDateTag}>
                          <Calendar size={11} /> Due {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      )}

                      {checklist.length > 0 && (
                        <span className={styles.checklistTag}>
                          <CheckCircle2 size={11} color="var(--success)" />
                          {completedChecklist}/{checklist.length} checklist items
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.itemRight}>
                  <span className={`${styles.priorityBadge} ${styles[`p-${task.priority}`]}`}>
                    {task.priority.toUpperCase()}
                  </span>

                  <ArrowRight size={15} className={styles.chevron} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Slide-In Task Detail Drawer */}
      <TaskDetailDrawer
        taskId={selectedTaskId}
        isOpen={Boolean(selectedTaskId)}
        onClose={() => setSelectedTaskId(null)}
        onOpenTask={(id) => setSelectedTaskId(id)}
      />
    </div>
  );
};
