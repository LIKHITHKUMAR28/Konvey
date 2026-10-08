import React from 'react';
import styles from './EmptyState.module.css';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`${styles.container} ${className}`}>
      {icon && <div className={styles.iconWrapper}>{icon}</div>}
      <h4 className={styles.title}>{title}</h4>
      <p className={styles.description}>{description}</p>
      {actionLabel && onAction && (
        <div className={styles.action}>
          <Button variant="primary" size="md" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
