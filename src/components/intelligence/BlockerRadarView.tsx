import React from 'react';
import {
  AlertTriangle,
  Clock,
  GitFork,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  User,
} from 'lucide-react';
import { Project, BlockerCategory } from '../../types';
import { useOrg } from '../../context/OrgContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import styles from './Intelligence.module.css';

interface BlockerRadarViewProps {
  projectId: string;
  onOpenTask: (taskId: string) => void;
}

const CATEGORY_LABELS: Record<BlockerCategory, string> = {
  waiting_approval: 'Waiting for Approval',
  waiting_person: 'Waiting for Person',
  waiting_info: 'Waiting for Information',
  technical: 'Technical Issue',
  external_dependency: 'External Dependency',
  unclear_requirements: 'Unclear Requirements',
  resource_unavailable: 'Resource Unavailable',
  client_response: 'Client Response Pending',
  personal_workload: 'Personal Workload',
};

export const BlockerRadarView: React.FC<BlockerRadarViewProps> = ({ projectId, onOpenTask }) => {
  const { blockers, tasks, dependencies, resolveBlocker } = useOrg();
  const { users } = useAuth();
  const { showToast } = useToast();

  const projectBlockers = blockers.filter((b) => b.projectId === projectId);
  const activeBlockers = projectBlockers.filter((b) => b.status === 'active');
  const resolvedBlockers = projectBlockers.filter((b) => b.status === 'resolved');

  const handleResolve = (blockerId: string) => {
    resolveBlocker(blockerId);
    showToast({
      type: 'success',
      title: 'Blocker Resolved',
      message: 'Blocker cleared. Project Pulse recalculated.',
    });
  };

  const getUser = (id?: string) => users.find((u) => u.id === id);
  const getTask = (id: string) => tasks.find((t) => t.id === id);

  return (
    <div className={styles.intelContainer}>
      <div className={styles.intelHeader}>
        <div>
          <div className={styles.intelCategory}>BLOCKER INTELLIGENCE</div>
          <h2>Active Blockers & Systemic Radar</h2>
          <p className={styles.intelSubtitle}>
            Track root causes, blocker duration, downstream impact, and recurring team bottlenecks.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className={styles.intelStatsRow}>
        <Card variant="default" padding="md">
          <span className={styles.statLabel}>Active Blockers</span>
          <span className={styles.statValCritical}>{activeBlockers.length}</span>
          <span className={styles.statSub}>Impacting Project Pulse</span>
        </Card>
        <Card variant="default" padding="md">
          <span className={styles.statLabel}>Longest Duration</span>
          <span className={styles.statValWarning}>4 days</span>
          <span className={styles.statSub}>Partner Compliance Approval</span>
        </Card>
        <Card variant="default" padding="md">
          <span className={styles.statLabel}>Downstream Impact</span>
          <span className={styles.statVal}>2 tasks</span>
          <span className={styles.statSub}>Waiting on resolution</span>
        </Card>
        <Card variant="intel" padding="md">
          <span className={styles.statLabel}>Resolved to Date</span>
          <span className={styles.statValIntel}>{resolvedBlockers.length} cleared</span>
          <span className={styles.statSub}>Historical bottleneck resolution</span>
        </Card>
      </div>

      {/* Active Blockers Detailed Cards */}
      <div className={styles.blockersListSection}>
        <div className={styles.sectionHeaderTitle}>
          ACTIVE BLOCKERS REQUIRING ATTENTION ({activeBlockers.length})
        </div>

        {activeBlockers.length === 0 ? (
          <div className={styles.emptyNotice}>
            <CheckCircle2 size={24} color="var(--success)" />
            <span>No active blockers on this project. Work is moving without obstruction.</span>
          </div>
        ) : (
          activeBlockers.map((b) => {
            const task = getTask(b.taskId);
            const owner = getUser(b.ownerId);
            const downstreamCount = dependencies.filter(
              (d) => d.sourceTaskId === b.taskId && (d.type === 'blocking' || d.type === 'blocked_by')
            ).length;

            return (
              <div key={b.id} className={styles.blockerDetailCard}>
                <div className={styles.blockerCardHeader}>
                  <div className={styles.blockerCardTitleGroup}>
                    <AlertTriangle size={18} className={styles.iconCritical} />
                    <div>
                      <div className={styles.blockerCategoryBadge}>
                        {CATEGORY_LABELS[b.type] || b.type}
                      </div>
                      <h4 className={styles.blockerTaskName}>{task?.title || 'Unknown Task'}</h4>
                    </div>
                  </div>

                  <Button
                    variant="intel"
                    size="sm"
                    leftIcon={<CheckCircle2 size={13} />}
                    onClick={() => handleResolve(b.id)}
                  >
                    Resolve Blocker
                  </Button>
                </div>

                <p className={styles.blockerDesc}>{b.description}</p>

                <div className={styles.blockerMetaGrid}>
                  <div className={styles.blockerMetaItem}>
                    <Clock size={12} />
                    <span>Duration: <strong>4 days active</strong></span>
                  </div>
                  <div className={styles.blockerMetaItem}>
                    <User size={12} />
                    <span>Reported by: <strong>{owner?.name || 'Maya Patel'}</strong></span>
                  </div>
                  <div className={styles.blockerMetaItem}>
                    <GitFork size={12} />
                    <span>Impact: <strong>{downstreamCount} downstream task{downstreamCount > 1 ? 's' : ''} blocked</strong></span>
                  </div>
                </div>

                <div className={styles.blockerActionFooter}>
                  <button
                    type="button"
                    className={styles.jumpToTaskBtn}
                    onClick={() => onOpenTask(b.taskId)}
                  >
                    Open Task in Detail Drawer <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
