import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { ChecklistItem } from '../../types';
import { Button } from '../ui/Button';
import styles from './TaskDetailDrawer.module.css';

interface TaskChecklistProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

export const TaskChecklist: React.FC<TaskChecklistProps> = ({ items = [], onChange }) => {
  const [newItemText, setNewItemText] = useState('');

  const completedCount = items.filter((i) => i.completed).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const handleToggle = (id: string) => {
    const updated = items.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i));
    onChange(updated);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const newItem: ChecklistItem = {
      id: `check-${Date.now().toString(36)}`,
      text: newItemText.trim(),
      completed: false,
    };
    onChange([...items, newItem]);
    setNewItemText('');
  };

  const handleDelete = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  return (
    <div className={styles.sectionBlock}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <CheckCircle2 size={15} className={styles.sectionIcon} />
          <span>Checklist & Subtasks</span>
          {items.length > 0 && (
            <span className={styles.badgeCount}>
              {completedCount}/{items.length} ({progressPercent}%)
            </span>
          )}
        </div>
      </div>

      {items.length > 0 && (
        <div className={styles.progressBarWrapper} aria-label={`Checklist progress: ${progressPercent}%`}>
          <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }} />
        </div>
      )}

      <div className={styles.checklistItems}>
        {items.map((item) => (
          <div key={item.id} className={styles.checklistItem}>
            <input
              type="checkbox"
              id={`check-${item.id}`}
              checked={item.completed}
              onChange={() => handleToggle(item.id)}
              className={styles.checkboxInput}
            />
            <label
              htmlFor={`check-${item.id}`}
              className={`${styles.checklistLabel} ${item.completed ? styles.itemCompleted : ''}`}
            >
              {item.text}
            </label>
            <button
              type="button"
              className={styles.itemDeleteBtn}
              onClick={() => handleDelete(item.id)}
              aria-label="Delete checklist item"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className={styles.addChecklistForm}>
        <input
          type="text"
          placeholder="Add subtask or acceptance criterion..."
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          className={styles.addChecklistInput}
        />
        <Button variant="secondary" size="sm" type="submit" disabled={!newItemText.trim()}>
          <Plus size={13} /> Add
        </Button>
      </form>
    </div>
  );
};
