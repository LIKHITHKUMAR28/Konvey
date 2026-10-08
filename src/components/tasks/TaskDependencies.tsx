import React, { useState } from 'react';
import { GitFork, Link2, AlertCircle, X, Plus } from 'lucide-react';
import { Task, DependencyType } from '../../types';
import { useOrg } from '../../context/OrgContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import styles from './TaskDetailDrawer.module.css';

interface TaskDependenciesProps {
  currentTask: Task;
  allTasks: Task[];
  onOpenTask: (taskId: string) => void;
}

export const TaskDependencies: React.FC<TaskDependenciesProps> = ({
  currentTask,
  allTasks,
  onOpenTask,
}) => {
  const { dependencies, addDependency, removeDependency } = useOrg();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [dependencyType, setDependencyType] = useState<DependencyType>('blocking');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter dependencies related to this task
  const blockedByDeps = dependencies.filter(
    (d) => d.targetTaskId === currentTask.id && (d.type === 'blocking' || d.type === 'blocked_by')
  );
  const blockingDeps = dependencies.filter(
    (d) => d.sourceTaskId === currentTask.id && (d.type === 'blocking' || d.type === 'blocked_by')
  );
  const relatedDeps = dependencies.filter(
    (d) => (d.sourceTaskId === currentTask.id || d.targetTaskId === currentTask.id) && d.type === 'related_to'
  );

  // Available tasks to link (exclude current task)
  const candidateTasks = allTasks.filter((t) => t.id !== currentTask.id && t.projectId === currentTask.projectId);

  const handleAddDependency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId) return;
    setErrorMsg(null);

    // If type is "blocked_by", current task is target, selected task is source
    // If type is "blocking", current task is source, selected task is target
    const sourceId = dependencyType === 'blocked_by' ? selectedTaskId : currentTask.id;
    const targetId = dependencyType === 'blocked_by' ? currentTask.id : selectedTaskId;

    const result = addDependency(sourceId, targetId, dependencyType);
    if (!result.success) {
      setErrorMsg(result.error || 'Failed to add dependency.');
    } else {
      setIsAdding(false);
      setSelectedTaskId('');
      setErrorMsg(null);
    }
  };

  const getTask = (id: string) => allTasks.find((t) => t.id === id);

  return (
    <div className={styles.sectionBlock}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <GitFork size={15} className={styles.sectionIcon} />
          <span>Dependencies & Relationships</span>
          <span className={styles.badgeCount}>
            {blockedByDeps.length + blockingDeps.length + relatedDeps.length}
          </span>
        </div>
        {!isAdding && (
          <Button variant="tertiary" size="sm" onClick={() => setIsAdding(true)}>
            <Plus size={12} /> Add Dependency
          </Button>
        )}
      </div>

      {/* Add Dependency Sub-Form */}
      {isAdding && (
        <form onSubmit={handleAddDependency} className={styles.addDepForm}>
          <div className={styles.addDepRow}>
            <select
              value={dependencyType}
              onChange={(e) => setDependencyType(e.target.value as DependencyType)}
              className={styles.depSelect}
            >
              <option value="blocked_by">Blocked by (Prerequisite)</option>
              <option value="blocking">Blocks (Downstream task)</option>
              <option value="related_to">Related to</option>
            </select>

            <select
              value={selectedTaskId}
              onChange={(e) => {
                setSelectedTaskId(e.target.value);
                setErrorMsg(null);
              }}
              className={styles.depSelect}
              required
            >
              <option value="">Select project task...</option>
              {candidateTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.status})
                </option>
              ))}
            </select>
          </div>

          {errorMsg && (
            <div className={styles.depError}>
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className={styles.depFormActions}>
            <Button
              variant="tertiary"
              size="sm"
              type="button"
              onClick={() => {
                setIsAdding(false);
                setErrorMsg(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={!selectedTaskId}>
              Save Link
            </Button>
          </div>
        </form>
      )}

      {/* Blocked By List */}
      {blockedByDeps.length > 0 && (
        <div className={styles.depGroup}>
          <span className={styles.depGroupLabel}>BLOCKED BY (Must complete first)</span>
          {blockedByDeps.map((dep) => {
            const task = getTask(dep.sourceTaskId);
            if (!task) return null;
            return (
              <div key={dep.id} className={styles.depItem}>
                <div className={styles.depInfo} onClick={() => onOpenTask(task.id)}>
                  <Link2 size={13} className={styles.linkIcon} />
                  <span className={styles.depTitle}>{task.title}</span>
                  <Badge variant={task.status === 'done' ? 'success' : 'warning'} size="sm">
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
                <button
                  type="button"
                  className={styles.removeDepBtn}
                  onClick={() => removeDependency(dep.id)}
                  aria-label="Remove dependency"
                >
                  <X size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Blocking List */}
      {blockingDeps.length > 0 && (
        <div className={styles.depGroup}>
          <span className={styles.depGroupLabel}>BLOCKS (Waiting on this task)</span>
          {blockingDeps.map((dep) => {
            const task = getTask(dep.targetTaskId);
            if (!task) return null;
            return (
              <div key={dep.id} className={styles.depItem}>
                <div className={styles.depInfo} onClick={() => onOpenTask(task.id)}>
                  <Link2 size={13} className={styles.linkIcon} />
                  <span className={styles.depTitle}>{task.title}</span>
                  <Badge variant={task.status === 'done' ? 'success' : 'default'} size="sm">
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
                <button
                  type="button"
                  className={styles.removeDepBtn}
                  onClick={() => removeDependency(dep.id)}
                  aria-label="Remove dependency"
                >
                  <X size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Related Tasks */}
      {relatedDeps.length > 0 && (
        <div className={styles.depGroup}>
          <span className={styles.depGroupLabel}>RELATED TASKS</span>
          {relatedDeps.map((dep) => {
            const otherId = dep.sourceTaskId === currentTask.id ? dep.targetTaskId : dep.sourceTaskId;
            const task = getTask(otherId);
            if (!task) return null;
            return (
              <div key={dep.id} className={styles.depItem}>
                <div className={styles.depInfo} onClick={() => onOpenTask(task.id)}>
                  <Link2 size={13} className={styles.linkIcon} />
                  <span className={styles.depTitle}>{task.title}</span>
                  <Badge variant="default" size="sm">
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
                <button
                  type="button"
                  className={styles.removeDepBtn}
                  onClick={() => removeDependency(dep.id)}
                  aria-label="Remove dependency"
                >
                  <X size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {blockedByDeps.length === 0 && blockingDeps.length === 0 && relatedDeps.length === 0 && !isAdding && (
        <div className={styles.depEmpty}>No active dependencies. This task can proceed independently.</div>
      )}
    </div>
  );
};
