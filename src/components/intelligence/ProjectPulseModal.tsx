import React from 'react';
import {
  Activity,
  AlertTriangle,
  Clock,
  GitFork,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { Project } from '../../types';
import { useOrg } from '../../context/OrgContext';
import { calculateProjectPulse } from '../../services/intelligence/pulseEngine';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import styles from './Intelligence.module.css';

interface ProjectPulseModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onOpenTask: (taskId: string) => void;
  onLaunchRecoveryMode: () => void;
}

export const ProjectPulseModal: React.FC<ProjectPulseModalProps> = ({
  project,
  isOpen,
  onClose,
  onOpenTask,
  onLaunchRecoveryMode,
}) => {
  const { tasks, blockers, dependencies, scopeEvents } = useOrg();

  if (!isOpen) return null;

  const pulse = calculateProjectPulse(project, tasks, blockers, dependencies, scopeEvents);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Project Pulse — Explainable Health Analysis"
      maxWidth="680px"
      footer={
        <div className={styles.pulseFooterBar}>
          <span className={styles.pulseConfidenceText}>
            Deterministic Engine • Confidence: {Math.round(pulse.confidence * 100)}%
          </span>
          <div className={styles.pulseFooterActions}>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Dismiss
            </Button>
            {pulse.health !== 'on_track' && (
              <Button
                variant="intel"
                size="sm"
                leftIcon={<Zap size={14} />}
                onClick={() => {
                  onClose();
                  onLaunchRecoveryMode();
                }}
              >
                Launch Recovery Mode
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className={styles.pulseModalBody}>
        {/* Main Score Banner */}
        <div className={`${styles.pulseScoreBanner} ${styles[`pulseBg-${pulse.health}`]}`}>
          <div className={styles.scoreLeft}>
            <div className={styles.pulseRing}>
              <span className={styles.pulseScoreNumber}>{pulse.score}</span>
              <span className={styles.pulseScoreMax}>/100</span>
            </div>
            <div>
              <div className={styles.pulseHealthTagRow}>
                <Badge
                  variant={
                    pulse.health === 'on_track'
                      ? 'success'
                      : pulse.health === 'at_risk'
                      ? 'warning'
                      : 'critical'
                  }
                  size="md"
                  dot
                >
                  {pulse.health.replace('_', ' ').toUpperCase()}
                </Badge>
                {pulse.delayDays > 0 && (
                  <span className={styles.delayTag}>
                    <Clock size={12} /> Projected {pulse.delayDays}-day delay
                  </span>
                )}
              </div>
              <h3 className={styles.pulseScoreHeading}>{project.name}</h3>
              <div className={styles.predictedDateText}>
                Target: {project.targetDate} • Predicted Completion: <strong>{pulse.predictedCompletionDate}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Explainable Synthesis (PRD Principle 2: Explain WHY) */}
        <div className={styles.aiExplanationBlock}>
          <div className={styles.explainerHeader}>
            <ShieldCheck size={16} color="var(--intel-600)" />
            <strong>Why is this project {pulse.health.replace('_', ' ')}?</strong>
          </div>
          <p className={styles.explainerBody}>{pulse.summaryExplanation}</p>
        </div>

        {/* Traceable Contributing Risk Factors */}
        <div className={styles.factorsSection}>
          <div className={styles.factorsSectionTitle}>
            CONTRIBUTING RISK FACTORS ({pulse.riskFactors.length})
          </div>

          <div className={styles.factorsList}>
            {pulse.riskFactors.map((factor) => (
              <div key={factor.id} className={styles.factorCard}>
                <div className={styles.factorTop}>
                  <div className={styles.factorTitleRow}>
                    <AlertTriangle
                      size={15}
                      color={factor.severity === 'critical' ? 'var(--critical)' : 'var(--warning)'}
                    />
                    <span className={styles.factorTitle}>{factor.title}</span>
                  </div>
                  <Badge variant={factor.severity === 'critical' ? 'critical' : 'warning'} size="sm">
                    {factor.category.toUpperCase()}
                  </Badge>
                </div>

                <p className={styles.factorExplanation}>{factor.explanation}</p>

                {factor.affectedTaskIds && factor.affectedTaskIds.length > 0 && (
                  <div className={styles.affectedTasksRow}>
                    <span className={styles.affectedLabel}>Affected Tasks:</span>
                    {factor.affectedTaskIds.map((id) => (
                      <button
                        key={id}
                        type="button"
                        className={styles.affectedTaskLink}
                        onClick={() => {
                          onClose();
                          onOpenTask(id);
                        }}
                      >
                        Inspect Task ({id}) <ArrowRight size={11} />
                      </button>
                    ))}
                  </div>
                )}

                {factor.suggestedAction && (
                  <div className={styles.factorAction}>
                    <strong>Suggested Action:</strong> {factor.suggestedAction}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
