import React from 'react';
import {
  History,
  AlertTriangle,
  CheckCircle2,
  BookOpenCheck,
  Calendar,
  ArrowRight,
  Zap,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import { extractContextRecovery } from '../../services/intelligence/contextRecoveryEngine';
import { Drawer } from '../ui/Drawer';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import styles from './Intelligence.module.css';

interface ContextRecoveryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTask: (taskId: string) => void;
  onEnterFocusMode?: () => void;
}

export const ContextRecoveryDrawer: React.FC<ContextRecoveryDrawerProps> = ({
  isOpen,
  onClose,
  onOpenTask,
  onEnterFocusMode,
}) => {
  const { currentUser } = useAuth();
  const { tasks, projects, activities, decisions, blockers } = useOrg();

  if (!isOpen) return null;

  const report = extractContextRecovery(
    currentUser,
    tasks,
    projects,
    activities,
    decisions,
    blockers
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={18} color="var(--intel-600)" />
          <span>Context Recovery — What Changed While Away?</span>
        </div>
      }
      width="560px"
    >
      <div className={styles.contextDrawerBody}>
        {/* Welcome Back Card */}
        <div className={styles.welcomeBanner}>
          <div className={styles.welcomeTag}>
            <Clock size={12} /> Last active {Math.round(report.inactivityHours / 24)} days ago
          </div>
          <h3>Welcome back, {currentUser.name.split(' ')[0]}</h3>
          <p className={styles.welcomeSubtitle}>
            Here is a curated summary of decisions established, blockers flagged, and deliverables completed while you were away.
          </p>
        </div>

        {/* Recommended Next Step (PRD Section 6.10: Recommend next action) */}
        {report.recommendedNextTask && (
          <div className={styles.recommendationBox}>
            <div className={styles.recHeader}>
              <div className={styles.recTitleRow}>
                <Sparkles size={15} color="var(--intel-600)" />
                <strong>RECOMMENDED IMMEDIATE NEXT STEP</strong>
              </div>
              <Badge variant="intel" size="sm">High Priority</Badge>
            </div>

            <h4 className={styles.recTaskTitle}>{report.recommendedNextTask.title}</h4>
            <p className={styles.recReason}>{report.recommendedNextActionReason}</p>

            <div className={styles.recActions}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenTask(report.recommendedNextTask!.id);
                }}
              >
                Inspect Task Details
              </Button>
              {onEnterFocusMode && (
                <Button
                  variant="intel"
                  size="sm"
                  leftIcon={<Zap size={13} />}
                  onClick={() => {
                    onClose();
                    onEnterFocusMode();
                  }}
                >
                  Execute in Focus Mode
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Chronological Changes Stream */}
        <div className={styles.changesSection}>
          <div className={styles.sectionHeaderTitle}>
            CHRONOLOGICAL CHANGES SINCE YOUR LAST SESSION ({report.changes.length})
          </div>

          <div className={styles.changesStream}>
            {report.changes.length === 0 ? (
              <div className={styles.emptyNotice}>Nothing critical changed while you were away.</div>
            ) : (
              report.changes.map((item) => (
                <div key={item.id} className={styles.changeItem}>
                  <div className={styles.changeIconCol}>
                    {item.entityType === 'decision' && <BookOpenCheck size={16} color="var(--intel-600)" />}
                    {item.entityType === 'blocker' && <AlertTriangle size={16} color="var(--critical)" />}
                    {item.entityType === 'task' && <CheckCircle2 size={16} color="var(--success)" />}
                    {item.entityType === 'comment' && <History size={16} color="var(--primary-600)" />}
                    <div className={styles.timelineConnectLine} />
                  </div>

                  <div className={styles.changeContent}>
                    <div className={styles.changeItemTop}>
                      <span className={styles.changeTitle}>{item.title}</span>
                      <span className={styles.changeTime}>
                        {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <p className={styles.changeDesc}>{item.changeDescription}</p>

                    <div className={styles.changeAuthor}>
                      By: <strong>{item.actorName}</strong>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
};
