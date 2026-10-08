import React, { useState } from 'react';
import {
  Plus,
  GitFork,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ArrowUpDown,
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import styles from './Views.module.css';

interface ProjectListViewProps {
  projectId: string;
  onOpenTask: (taskId: string) => void;
}

export const ProjectListView: React.FC<ProjectListViewProps> = ({ projectId, onOpenTask }) => {
  const { tasks, dependencies, createTask } = useOrg();
  const { users } = useAuth();

  const [groupBy, setGroupBy] = useState<'status' | 'priority' | 'assignee'>('status');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickStatus, setQuickStatus] = useState<TaskStatus>('not_started');

  const projectTasks = tasks.filter((t) => t.projectId === projectId);

  const handleQuickCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    createTask({
      projectId,
      title: quickTitle.trim(),
      description: '',
      status: quickStatus,
      priority: 'medium',
      collaboratorIds: [],
      labels: ['work'],
      estimatedMinutes: 240,
      checklist: [],
    });

    setQuickTitle('');
  };

  const getUser = (id?: string) => users.find((u) => u.id === id);

  // Grouping logic
  const renderTaskRow = (task: Task) => {
    const assignee = getUser(task.assigneeId);
    const depCount = dependencies.filter(
      (d) => d.sourceTaskId === task.id || d.targetTaskId === task.id
    ).length;
    const checklistItems = task.checklist || [];
    const completedChecklist = checklistItems.filter((c) => c.completed).length;

    return (
      <tr
        key={task.id}
        className={`${styles.tableRow} ${task.isBlocked ? styles.blockedRow : ''}`}
        onClick={() => onOpenTask(task.id)}
      >
        <td className={styles.colTitle}>
          <div className={styles.taskTitleWrapper}>
            {task.isBlocked && <AlertTriangle size={14} className={styles.blockerIcon} />}
            <span className={styles.taskTitle}>{task.title}</span>
            {task.labels?.map((l) => (
              <span key={l} className={styles.miniLabel}>{l}</span>
            ))}
          </div>
        </td>

        <td className={styles.colStatus}>
          <Badge
            variant={
              task.status === 'done'
                ? 'success'
                : task.isBlocked
                ? 'critical'
                : task.status === 'in_progress'
                ? 'primary'
                : 'default'
            }
            size="sm"
            dot
          >
            {task.status.replace('_', ' ')}
          </Badge>
        </td>

        <td className={styles.colPriority}>
          <span className={`${styles.priorityPill} ${styles[`priority-${task.priority}`]}`}>
            {task.priority.toUpperCase()}
          </span>
        </td>

        <td className={styles.colAssignee}>
          {assignee ? (
            <div className={styles.assigneePill}>
              <img src={assignee.avatarUrl} alt={assignee.name} className={styles.avatarMini} />
              <span>{assignee.name.split(' ')[0]}</span>
            </div>
          ) : (
            <span className={styles.unassigned}>Unassigned</span>
          )}
        </td>

        <td className={styles.colDate}>
          {task.dueDate ? (
            <div className={styles.datePill}>
              <Calendar size={12} />
              <span>{new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
            </div>
          ) : (
            <span className={styles.unassigned}>No date</span>
          )}
        </td>

        <td className={styles.colProgress}>
          {checklistItems.length > 0 ? (
            <div className={styles.checklistIndicator}>
              <CheckCircle2 size={12} color="var(--success)" />
              <span>{completedChecklist}/{checklistItems.length}</span>
            </div>
          ) : (
            <span className={styles.unassigned}>—</span>
          )}
        </td>

        <td className={styles.colDeps}>
          {depCount > 0 ? (
            <div className={styles.depBadge}>
              <GitFork size={12} />
              <span>{depCount}</span>
            </div>
          ) : (
            <span className={styles.unassigned}>—</span>
          )}
        </td>
      </tr>
    );
  };

  // Group definitions
  const groups =
    groupBy === 'status'
      ? [
          { key: 'not_started', label: 'Not Started', tasks: projectTasks.filter((t) => t.status === 'not_started') },
          { key: 'in_progress', label: 'In Progress', tasks: projectTasks.filter((t) => t.status === 'in_progress') },
          { key: 'blocked', label: 'Blocked', tasks: projectTasks.filter((t) => t.status === 'blocked') },
          { key: 'done', label: 'Done', tasks: projectTasks.filter((t) => t.status === 'done') },
        ]
      : groupBy === 'priority'
      ? [
          { key: 'urgent', label: 'Urgent Priority', tasks: projectTasks.filter((t) => t.priority === 'urgent') },
          { key: 'high', label: 'High Priority', tasks: projectTasks.filter((t) => t.priority === 'high') },
          { key: 'medium', label: 'Medium Priority', tasks: projectTasks.filter((t) => t.priority === 'medium') },
          { key: 'low', label: 'Low Priority', tasks: projectTasks.filter((t) => t.priority === 'low') },
        ]
      : [
          ...users.map((u) => ({
            key: u.id,
            label: u.name,
            tasks: projectTasks.filter((t) => t.assigneeId === u.id),
          })),
          {
            key: 'unassigned',
            label: 'Unassigned',
            tasks: projectTasks.filter((t) => !t.assigneeId),
          },
        ];

  return (
    <div className={styles.viewContainer}>
      {/* List View Controls Bar */}
      <div className={styles.viewToolbar}>
        <div className={styles.toolbarLeft}>
          <span className={styles.toolbarLabel}>Group By:</span>
          <div className={styles.groupToggle}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${groupBy === 'status' ? styles.toggleBtnActive : ''}`}
              onClick={() => setGroupBy('status')}
            >
              Status
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${groupBy === 'priority' ? styles.toggleBtnActive : ''}`}
              onClick={() => setGroupBy('priority')}
            >
              Priority
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${groupBy === 'assignee' ? styles.toggleBtnActive : ''}`}
              onClick={() => setGroupBy('assignee')}
            >
              Assignee
            </button>
          </div>
        </div>

        <div className={styles.toolbarRight}>
          <span className={styles.taskCountBadge}>{projectTasks.length} tasks total</span>
        </div>
      </div>

      {/* Grouped Table */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thTitle}>Task</th>
              <th className={styles.thStatus}>Status</th>
              <th className={styles.thPriority}>Priority</th>
              <th className={styles.thAssignee}>Assignee</th>
              <th className={styles.thDate}>Due Date</th>
              <th className={styles.thProgress}>Checklist</th>
              <th className={styles.thDeps}>Deps</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => {
              if (group.tasks.length === 0) return null;
              return (
                <React.Fragment key={group.key}>
                  <tr className={styles.groupHeaderRow}>
                    <td colSpan={7}>
                      <div className={styles.groupHeaderContent}>
                        <ArrowUpDown size={12} />
                        <strong>{group.label}</strong>
                        <span className={styles.groupCount}>({group.tasks.length})</span>
                      </div>
                    </td>
                  </tr>
                  {group.tasks.map(renderTaskRow)}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {/* Quick Task Creation Row */}
        <form onSubmit={handleQuickCreate} className={styles.quickCreateRow}>
          <input
            type="text"
            placeholder="+ Add task to this project (press Enter to save)..."
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            className={styles.quickCreateInput}
          />
          <select
            value={quickStatus}
            onChange={(e) => setQuickStatus(e.target.value as TaskStatus)}
            className={styles.quickStatusSelect}
          >
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="blocked">Blocked</option>
          </select>
          <Button variant="primary" size="sm" type="submit" disabled={!quickTitle.trim()}>
            <Plus size={13} /> Add
          </Button>
        </form>
      </div>
    </div>
  );
};
