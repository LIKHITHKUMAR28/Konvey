import React, { useState } from 'react';
import {
  Plus,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  GitFork,
  ChevronRight,
  GripVertical,
} from 'lucide-react';
import { Task, TaskStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import { useToast } from '../ui/Toast';
import styles from './Views.module.css';

interface ProjectKanbanViewProps {
  projectId: string;
  onOpenTask: (taskId: string) => void;
}

const COLUMNS: { id: TaskStatus; label: string; color: string; badgeColor: string }[] = [
  { id: 'not_started', label: 'Not Started', color: '#94a3b8', badgeColor: '#f1f5f9' },
  { id: 'in_progress', label: 'In Progress', color: '#2563eb', badgeColor: '#eff6ff' },
  { id: 'blocked', label: 'Blocked', color: '#ef4444', badgeColor: '#fef2f2' },
  { id: 'done', label: 'Done', color: '#10b981', badgeColor: '#f0fdf4' },
];

export const ProjectKanbanView: React.FC<ProjectKanbanViewProps> = ({ projectId, onOpenTask }) => {
  const { tasks, dependencies, updateTask, createTask } = useOrg();
  const { users } = useAuth();
  const { showToast } = useToast();

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<TaskStatus | null>(null);

  const projectTasks = tasks.filter((t) => t.projectId === projectId);

  const handleAdvance = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const sequence: TaskStatus[] = ['not_started', 'in_progress', 'done'];
    const currentIdx = sequence.indexOf(task.status);
    if (currentIdx !== -1 && currentIdx < sequence.length - 1) {
      updateTask(task.id, { status: sequence[currentIdx + 1] });
      showToast({
        type: 'info',
        title: 'Status Updated',
        message: `Task advanced to "${sequence[currentIdx + 1].replace('_', ' ')}".`,
      });
    } else if (task.status === 'blocked') {
      updateTask(task.id, { status: 'in_progress', isBlocked: false });
      showToast({
        type: 'success',
        title: 'Blocker Resolved',
        message: 'Task moved back to In Progress.',
      });
    }
  };

  const handleQuickAdd = (status: TaskStatus) => {
    const title = prompt(`Enter title for new task in "${status.replace('_', ' ')}":`);
    if (!title || !title.trim()) return;

    createTask({
      projectId,
      title: title.trim(),
      description: '',
      status,
      priority: 'medium',
      collaboratorIds: [],
      labels: ['work'],
      estimatedMinutes: 240,
      checklist: [],
    });

    showToast({
      type: 'success',
      title: 'Task Created',
      message: `"${title.trim()}" added to ${status.replace('_', ' ')}.`,
    });
  };

  const handleDropTask = (taskId: string, targetStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.status === targetStatus) return;

    const isBlocked = targetStatus === 'blocked';
    updateTask(taskId, {
      status: targetStatus,
      isBlocked,
    });

    const col = COLUMNS.find((c) => c.id === targetStatus);
    showToast({
      type: isBlocked ? 'warning' : targetStatus === 'done' ? 'success' : 'info',
      title: 'Task Moved',
      message: `"${task.title}" is now ${col?.label || targetStatus}.`,
    });
  };

  const getUser = (id?: string) => users.find((u) => u.id === id);

  return (
    <div className={styles.kanbanBoard}>
      {COLUMNS.map((col) => {
        const colTasks = projectTasks.filter((t) => t.status === col.id);
        const isColumnActiveTarget = dragOverColId === col.id;

        return (
          <div
            key={col.id}
            className={`${styles.kanbanColumn} ${isColumnActiveTarget ? styles.columnDragOver : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (dragOverColId !== col.id) {
                setDragOverColId(col.id);
              }
            }}
            onDragLeave={(e) => {
              if (e.currentTarget.contains(e.relatedTarget as Node)) return;
              if (dragOverColId === col.id) {
                setDragOverColId(null);
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
              if (taskId) {
                handleDropTask(taskId, col.id);
              }
              setDraggedTaskId(null);
              setDragOverColId(null);
            }}
          >
            {/* Column Header */}
            <div className={styles.columnHeader}>
              <div className={styles.columnTitleRow}>
                <span className={styles.columnDot} style={{ backgroundColor: col.color }} />
                <span className={styles.columnTitle}>{col.label}</span>
                <span className={styles.columnCount}>{colTasks.length}</span>
              </div>
              <button
                type="button"
                className={styles.colAddBtn}
                onClick={() => handleQuickAdd(col.id)}
                title={`Add task to ${col.label}`}
                aria-label={`Add task to ${col.label}`}
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Column Cards List */}
            <div className={styles.cardsContainer}>
              {isColumnActiveTarget && draggedTaskId && (
                <div className={styles.dropGhostIndicator}>
                  Drop here to move to {col.label}
                </div>
              )}

              {colTasks.length === 0 ? (
                <div className={styles.emptyColPlaceholder}>
                  <span>No tasks in {col.label}</span>
                  <span className={styles.emptyColSubtext}>Drag tasks here to update status</span>
                </div>
              ) : (
                colTasks.map((task) => {
                  const assignee = getUser(task.assigneeId);
                  const depCount = dependencies.filter(
                    (d) => d.sourceTaskId === task.id || d.targetTaskId === task.id
                  ).length;
                  const checklist = task.checklist || [];
                  const completedChecklist = checklist.filter((c) => c.completed).length;
                  const isDraggingThis = draggedTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', task.id);
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggedTaskId(task.id);
                      }}
                      onDragEnd={() => {
                        setDraggedTaskId(null);
                        setDragOverColId(null);
                      }}
                      className={`${styles.kanbanCard} ${task.isBlocked ? styles.cardBlocked : ''} ${
                        isDraggingThis ? styles.cardDragging : ''
                      }`}
                      onClick={() => onOpenTask(task.id)}
                    >
                      {/* Blocker alert ribbon */}
                      {task.isBlocked && (
                        <div className={styles.cardBlockerRibbon}>
                          <AlertTriangle size={12} />
                          <span>BLOCKED: Requires Attention</span>
                        </div>
                      )}

                      <div className={styles.cardHeader}>
                        <div className={styles.dragHandleRow}>
                          <span className={styles.dragHandle} title="Drag to reorder or move status">
                            <GripVertical size={13} />
                          </span>
                          <span
                            className={`${styles.priorityPill} ${styles[`priority-${task.priority}`]}`}
                          >
                            {task.priority.toUpperCase()}
                          </span>
                        </div>
                        {task.labels?.[0] && (
                          <span className={styles.miniLabel}>{task.labels[0]}</span>
                        )}
                      </div>

                      <div className={styles.cardTitle}>{task.title}</div>

                      {/* Card Metadata Footer */}
                      <div className={styles.cardFooter}>
                        <div className={styles.cardMetaLeft}>
                          {task.dueDate && (
                            <span className={styles.cardDue}>
                              <Calendar size={11} />
                              {new Date(task.dueDate).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          )}

                          {checklist.length > 0 && (
                            <span className={styles.cardChecklist}>
                              <CheckCircle2 size={11} color="var(--success)" />
                              {completedChecklist}/{checklist.length}
                            </span>
                          )}

                          {depCount > 0 && (
                            <span className={styles.cardDep} title={`${depCount} dependencies`}>
                              <GitFork size={11} />
                              {depCount}
                            </span>
                          )}
                        </div>

                        <div className={styles.cardMetaRight}>
                          {assignee ? (
                            <img
                              src={assignee.avatarUrl}
                              alt={assignee.name}
                              className={styles.avatarMini}
                              title={assignee.name}
                            />
                          ) : (
                            <span className={styles.unassignedDot} title="Unassigned" />
                          )}

                          {task.status !== 'done' && (
                            <button
                              type="button"
                              className={styles.advanceBtn}
                              onClick={(e) => handleAdvance(e, task)}
                              title="Advance to next status"
                            >
                              <ChevronRight size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
