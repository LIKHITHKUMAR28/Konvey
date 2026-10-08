import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { Project } from '../../types';
import { useOrg } from '../../context/OrgContext';
import { analyzeScopeRadar } from '../../services/intelligence/scopeRadarEngine';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import styles from './Intelligence.module.css';

interface ScopeRadarViewProps {
  projectId: string;
  onLaunchRecoveryMode: () => void;
}

export const ScopeRadarView: React.FC<ScopeRadarViewProps> = ({ projectId, onLaunchRecoveryMode }) => {
  const { projects, tasks, scopeEvents } = useOrg();
  const project = projects.find((p) => p.id === projectId);

  if (!project) return null;

  const analysis = analyzeScopeRadar(project, tasks, scopeEvents);

  return (
    <div className={styles.intelContainer}>
      {/* Header */}
      <div className={styles.intelHeader}>
        <div>
          <div className={styles.intelCategory}>SCOPE CREEP RADAR</div>
          <h2>Scope Baseline & Expansion Analysis</h2>
          <p className={styles.intelSubtitle}>
            Compare original planned scope against current execution requirements. Detect unbudgeted feature growth before it causes silent delays.
          </p>
        </div>

        {analysis.taskGrowthPercent > 20 && (
          <Button
            variant="intel"
            size="md"
            onClick={onLaunchRecoveryMode}
            rightIcon={<ArrowRight size={13} />}
          >
            Model Scope Recovery
          </Button>
        )}
      </div>

      {/* Primary Scope Growth Visualization Banner */}
      <div className={styles.scopeComparisonCard}>
        <div className={styles.comparisonColumn}>
          <span className={styles.comparisonLabel}>ORIGINAL BASELINE</span>
          <div className={styles.comparisonNum}>{analysis.baselineTasks} tasks</div>
          <span className={styles.comparisonSub}>{analysis.baselineHours} estimated hours</span>
        </div>

        <div className={styles.comparisonArrowCol}>
          <div className={styles.growthBadge}>
            <TrendingUp size={16} />
            <span>+{analysis.taskGrowthPercent}% Growth</span>
          </div>
          <div className={styles.growthSub}>+{analysis.taskGrowthCount} additional tasks</div>
        </div>

        <div className={styles.comparisonColumn}>
          <span className={styles.comparisonLabel}>CURRENT ACTIVE SCOPE</span>
          <div className={styles.comparisonNum}>{analysis.currentTasks} tasks</div>
          <span className={styles.comparisonSub}>{analysis.currentHours} total hours</span>
        </div>
      </div>

      {/* Scope Growth Breakdown by Origin Source (PRD FR-SCOPE-04: Categorize sources) */}
      <div className={styles.scopeSourcesGrid}>
        <Card variant="default" padding="lg">
          <h4 style={{ marginBottom: '12px' }}>Origin of Added Work</h4>
          <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '16px' }}>
            Attributed sources of added deliverables since baseline sign-off.
          </p>

          <div className={styles.sourceBarsList}>
            {analysis.sourcesBreakdown.map((src) => (
              <div key={src.source} className={styles.sourceBarItem}>
                <div className={styles.sourceBarHeader}>
                  <span className={styles.sourceName}>{src.label}</span>
                  <span className={styles.sourceStats}>
                    +{src.hoursCount} hrs ({src.percentOfGrowth}%)
                  </span>
                </div>
                <div className={styles.sourceTrack}>
                  <div
                    className={styles.sourceFill}
                    style={{ width: `${src.percentOfGrowth}%`, backgroundColor: src.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Schedule Drag & Impact Evaluation */}
        <Card variant="default" padding="lg">
          <h4 style={{ marginBottom: '12px' }}>Schedule Drag Evaluation</h4>
          <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '16px' }}>
            Quantified impact of scope additions on planned delivery milestones.
          </p>

          <div className={styles.dragMetricsList}>
            <div className={styles.dragMetricBox}>
              <Clock size={20} color="var(--warning)" />
              <div>
                <div className={styles.dragNum}>+{analysis.scheduleDragDays} Days Delay</div>
                <div className={styles.dragDesc}>
                  Added effort pushes project completion beyond target deadline.
                </div>
              </div>
            </div>

            <div className={styles.dragMetricBox}>
              <AlertTriangle size={20} color="var(--critical)" />
              <div>
                <div className={styles.dragNum}>+{analysis.hoursGrowthCount} Extra Engineering Hours</div>
                <div className={styles.dragDesc}>
                  Equivalent to ~1.5 full-time developer sprint cycles.
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Scope Events History */}
      <Card variant="default" padding="lg">
        <h4 style={{ marginBottom: '12px' }}>Recorded Scope Events ({scopeEvents.length})</h4>
        <div className={styles.scopeEventsTable}>
          {scopeEvents.map((evt) => (
            <div key={evt.id} className={styles.scopeEventRow}>
              <div className={styles.eventLeft}>
                <Badge
                  variant={
                    evt.source === 'client_request'
                      ? 'primary'
                      : evt.source === 'technical_change'
                      ? 'intel'
                      : 'warning'
                  }
                  size="sm"
                >
                  {evt.source.replace('_', ' ').toUpperCase()}
                </Badge>
                <div>
                  <div className={styles.eventTitle}>{evt.description}</div>
                  <div className={styles.eventMeta}>
                    Task: {evt.taskTitle || evt.taskId} • Added on {new Date(evt.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <span className={styles.effortAddedTag}>
                +{Math.round(evt.estimatedEffortMinutes / 60)} hrs
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
