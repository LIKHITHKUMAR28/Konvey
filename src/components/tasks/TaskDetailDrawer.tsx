import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  Clock,
  User,
  Trash2,
  Tag,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, BlockerCategory } from '../../types';
import { useOrg } from '../../context/OrgContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { TaskChecklist } from './TaskChecklist';
import { TaskDependencies } from './TaskDependencies';
import { TaskComments } from './TaskComments';
import styles from './TaskDetailDrawer.module.css';

interface TaskDetailDrawerProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenTask: (taskId: string) => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  taskId,
  isOpen,
  onClose,
  onOpenTask,
}) => {
  const { tasks, updateTask, deleteTask, blockers, addBlocker, resolveBlocker } = useOrg();
  const { users } = useAuth();
  const { showToast } = useToast();

  const task = tasks.find((t) => t.id === taskId);
  const activeBlocker = blockers.find((b) => b.taskId === taskId && b.status === 'active');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('not_started');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(240);
  const [actualMinutes, setActualMinutes] = useState<number>(0);

  // Blocker Flagging Modal state
  const [blockerModalOpen, setBlockerModalOpen] = useState(false);
  const [blockerType, setBlockerType] = useState<BlockerCategory>('waiting_approval');
  const [blockerDesc, setBlockerDesc] = useState('');

  // Sync state with incoming task
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeId(task.assigneeId || '');
      setDueDate(task.dueDate || '');
      setEstimatedMinutes(task.estimatedMinutes || 240);
      setActualMinutes(task.actualMinutes || 0);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) {
      updateTask(task.id, { title: title.trim() });
    }
  };

  const handleDescBlur = () => {
    if (description !== task.description) {
      updateTask(task.id, { description });
    }
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    setStatus(newStatus);
    updateTask(task.id, { status: newStatus });
    showToast({
      type: 'info',
      title: 'Status Updated',
      message: `Task is now marked as "${newStatus.replace('_', ' ')}".`,
    });
  };

  const handlePriorityChange = (newPriority: TaskPriority) => {
    setPriority(newPriority);
    updateTask(task.id, { priority: newPriority });
  };

  const handleAssigneeChange = (newAssigneeId: string) => {
    setAssigneeId(newAssigneeId);
    updateTask(task.id, { assigneeId: newAssigneeId });
  };

  const handleDueDateChange = (newDueDate: string) => {
    setDueDate(newDueDate);
    updateTask(task.id, { dueDate: newDueDate });
  };

  const handleBlockerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockerDesc.trim()) return;

    addBlocker(task.id, blockerType, blockerDesc.trim());
    setBlockerModalOpen(false);
    setBlockerDesc('');
    showToast({
      type: 'warning',
      title: 'Blocker Recorded',
      message: 'Task flagged as blocked. Project Pulse notified.',
    });
  };

  const handleResolveBlocker = () => {
    if (activeBlocker) {
      resolveBlocker(activeBlocker.id);
      showToast({
        type: 'success',
        title: 'Blocker Cleared',
        message: 'Task blocker resolved. Resumed in progress.',
      });
    }
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      deleteTask(task.id);
      onClose();
      showToast({
        type: 'info',
        title: 'Task Deleted',
        message: `Task "${task.title}" was removed.`,
      });
    }
  };

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <aside className={styles.drawer} aria-label="Task Detail Panel">
        {/* Drawer Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.taskIdBadge}>{task.id.toUpperCase()}</span>
            <span className={styles.headerDot}>•</span>
            <span className={styles.headerProjectName}>Mobile App 2.0</span>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.headerIconBtn}
              onClick={handleDelete}
              title="Delete task"
              aria-label="Delete task"
            >
              <Trash2 size={16} />
            </button>
            <button
              type="button"
              className={styles.headerIconBtn}
              onClick={onClose}
              title="Close drawer"
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Quick Status & Action Control Bar */}
        <div className={styles.controlBar}>
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Status</label>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
              className={`${styles.statusSelect} ${styles[`status-${status}`]}`}
            >
              <option value="not_started">⚪ Not Started</option>
              <option value="in_progress">🔵 In Progress</option>
              <option value="blocked">🔴 Blocked</option>
              <option value="done">🟢 Done</option>
            </select>
          </div>

          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Priority</label>
            <select
              value={priority}
              onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
              className={styles.controlSelect}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {!task.isBlocked ? (
            <Button
              variant="tertiary"
              size="sm"
              leftIcon={<AlertTriangle size={13} color="var(--critical)" />}
              onClick={() => setBlockerModalOpen(true)}
            >
              Flag Blocker
            </Button>
          ) : (
            <Button
              variant="intel"
              size="sm"
              leftIcon={<CheckCircle size={13} />}
              onClick={handleResolveBlocker}
            >
              Resolve Blocker
            </Button>
          )}
        </div>

        {/* Active Blocker Alert Banner (Blocker Intelligence) */}
        {task.isBlocked && activeBlocker && (
          <div className={styles.blockerBanner}>
            <div className={styles.blockerBannerHeader}>
              <div className={styles.blockerTitleRow}>
                <AlertTriangle size={16} className={styles.blockerIcon} />
                <strong>BLOCKED: {activeBlocker.type.replace('_', ' ').toUpperCase()}</strong>
              </div>
              <Badge variant="critical" size="sm">Active</Badge>
            </div>
            <p className={styles.blockerBannerDesc}>{activeBlocker.description}</p>
            <div className={styles.blockerFooter}>
              <span className={styles.blockerMeta}>
                Flagged {new Date(activeBlocker.createdAt).toLocaleDateString()} • Affects Project Pulse
              </span>
              <button
                type="button"
                className={styles.resolveInlineBtn}
                onClick={handleResolveBlocker}
              >
                Clear this blocker
              </button>
            </div>
          </div>
        )}

        {/* Drawer Scrollable Content */}
        <div className={styles.body}>
          {/* Editable Title */}
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            rows={2}
            className={styles.titleInput}
            placeholder="Task title..."
          />

          {/* Core Metadata Grid */}
          <div className={styles.metaGrid}>
            <div className={styles.metaRow}>
              <div className={styles.metaKey}>
                <User size={14} /> Assignee
              </div>
              <div className={styles.metaValue}>
                <select
                  value={assigneeId}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  className={styles.metaSelect}
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.metaRow}>
              <div className={styles.metaKey}>
                <Clock size={14} /> Due Date
              </div>
              <div className={styles.metaValue}>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => handleDueDateChange(e.target.value)}
                  className={styles.metaInput}
                />
              </div>
            </div>

            <div className={styles.metaRow}>
              <div className={styles.metaKey}>
                <ShieldCheck size={14} /> Effort Estimate
              </div>
              <div className={styles.metaValue}>
                <span className={styles.effortBadge}>
                  {Math.round(estimatedMinutes / 60)} hrs planned
                  {actualMinutes > 0 && ` • ${Math.round(actualMinutes / 60)} hrs spent`}
                </span>
              </div>
            </div>

            <div className={styles.metaRow}>
              <div className={styles.metaKey}>
                <Tag size={14} /> Labels
              </div>
              <div className={styles.metaValue}>
                <div className={styles.labelsList}>
                  {task.labels?.map((l) => (
                    <Badge key={l} variant="default" size="sm">
                      {l}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitleText}>Description & Context</span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescBlur}
              rows={4}
              placeholder="Add requirements, context, or links to specifications..."
              className={styles.descTextarea}
            />
          </div>

          {/* Checklist & Subtasks */}
          <TaskChecklist
            items={task.checklist || []}
            onChange={(items) => updateTask(task.id, { checklist: items })}
          />

          {/* Dependencies & Relationships */}
          <TaskDependencies
            currentTask={task}
            allTasks={tasks}
            onOpenTask={onOpenTask}
          />

          {/* Comments & Immutable Audit Feed */}
          <TaskComments task={task} />
        </div>
      </aside>

      {/* Flag as Blocked Modal (PRD Section 6.8 - 9 Categories) */}
      <Modal
        isOpen={blockerModalOpen}
        onClose={() => setBlockerModalOpen(false)}
        title="Record Blocker on Task"
        footer={
          <>
            <Button variant="secondary" onClick={() => setBlockerModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBlockerSubmit} disabled={!blockerDesc.trim()}>
              Flag as Blocked
            </Button>
          </>
        }
      >
        <form onSubmit={handleBlockerSubmit} className={styles.blockerModalForm}>
          <p className={styles.blockerModalNotice}>
            Marking this task blocked communicates why work is stalled to the project manager and updates Project Pulse.
          </p>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Blocker Category</label>
            <select
              value={blockerType}
              onChange={(e) => setBlockerType(e.target.value as BlockerCategory)}
              className={styles.formSelect}
            >
              <option value="waiting_approval">Waiting for approval (e.g. compliance, security)</option>
              <option value="waiting_person">Waiting for person (teammate / review)</option>
              <option value="waiting_info">Waiting for information / spec</option>
              <option value="technical">Technical issue / bug</option>
              <option value="external_dependency">External dependency / partner SDK</option>
              <option value="unclear_requirements">Unclear requirements</option>
              <option value="resource_unavailable">Resource unavailable / capacity</option>
              <option value="client_response">Client response pending</option>
              <option value="personal_workload">Personal workload crunch</option>
            </select>
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Specific Blocker Rationale & Impact</label>
            <textarea
              required
              rows={3}
              value={blockerDesc}
              onChange={(e) => setBlockerDesc(e.target.value)}
              placeholder="Explain exactly what is preventing progress..."
              className={styles.formTextarea}
            />
          </div>
        </form>
      </Modal>
    </>
  );
};
