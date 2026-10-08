import React, { useState } from 'react';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  GitFork,
  Zap,
  Users2,
  Calendar,
  Check,
} from 'lucide-react';
import { Project, RecoveryOption } from '../../types';
import { useOrg } from '../../context/OrgContext';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../services/permissionService';
import { simulateRecoveryOptions } from '../../services/intelligence/recoverySimulator';
import { useToast } from '../ui/Toast';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import styles from './Intelligence.module.css';

interface RecoveryModeModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export const RecoveryModeModal: React.FC<RecoveryModeModalProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  const { tasks, updateProject, updateTask } = useOrg();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const canAuthorize = hasPermission(currentUser.role, 'CAN_APPLY_RECOVERY');

  const [selectedOptionId, setSelectedOptionId] = useState<string>('rec-parallel');
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);

  if (!isOpen) return null;

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const recoveryOptions = simulateRecoveryOptions(project, projectTasks, 7);
  const selectedOption = recoveryOptions.find((o) => o.id === selectedOptionId) || recoveryOptions[0];

  const handleApplyStrategy = () => {
    setIsApplying(true);

    setTimeout(() => {
      // Execute the approved strategy safely
      if (selectedOption.type === 'extend_deadline') {
        updateProject(project.id, { targetDate: '2026-10-31', health: 'on_track' });
      } else if (selectedOption.type === 'parallelize_work') {
        // Parallelize task-102 unblocking
        updateTask('task-102', { status: 'in_progress', isBlocked: false });
        updateProject(project.id, { health: 'on_track' });
      } else if (selectedOption.type === 'reduce_scope') {
        // Move task-103 to backlog
        updateTask('task-103', { priority: 'low' });
        updateProject(project.id, { health: 'on_track' });
      }

      setIsApplying(false);
      setIsApproved(true);

      showToast({
        type: 'success',
        title: 'Recovery Strategy Applied',
        message: `Plan "${selectedOption.title}" approved by PM and committed to project state.`,
      });
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Project Recovery Mode — Strategy Decision Sandbox"
      maxWidth="820px"
      footer={
        <div className={styles.recoveryFooter}>
          <div className={styles.guardrailNotice}>
            <CheckCircle2 size={15} color={canAuthorize ? 'var(--primary-600)' : 'var(--warning)'} />
            <span>
              {canAuthorize ? (
                <>
                  <strong>PM Approval Guardrail:</strong> Algorithmic models never alter project timelines without your explicit confirmation.
                </>
              ) : (
                <>
                  <strong>Role Guardrail:</strong> Viewing as Individual Contributor ({currentUser.name}). Plan simulations are view-only; schedule mutations require PM authorization.
                </>
              )}
            </span>
          </div>

          <div className={styles.recoveryFooterBtns}>
            <Button variant="secondary" size="md" onClick={onClose}>
              {isApproved ? 'Done' : 'Cancel'}
            </Button>
            {!isApproved && (
              canAuthorize ? (
                <Button
                  variant="primary"
                  size="md"
                  isLoading={isApplying}
                  onClick={handleApplyStrategy}
                  leftIcon={<Check size={14} />}
                >
                  Approve & Apply Strategy
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="md"
                  disabled
                  title="Schedule adjustments must be authorized by a Project Manager (Rahul) or Admin (Sameera)"
                >
                  Requires PM Authorization
                </Button>
              )
            )}
          </div>
        </div>
      }
    >
      <div className={styles.recoveryModalBody}>
        {/* Current Posture vs Delay Header */}
        <div className={styles.recoveryDelayBanner}>
          <div className={styles.delayStat}>
            <span className={styles.delayLbl}>TARGET DEADLINE</span>
            <span className={styles.delayVal}>{project.targetDate}</span>
          </div>
          <div className={styles.delayArrow}>
            <Clock size={16} color="var(--critical)" />
            <span>7 Days Predicted Slip</span>
          </div>
          <div className={styles.delayStat}>
            <span className={styles.delayLbl}>PREDICTED COMPLETION</span>
            <span className={styles.delayValPredicted}>2026-10-31</span>
          </div>
        </div>

        {isApproved ? (
          /* Confirmation Success State */
          <div className={styles.approvedSuccessState}>
            <div className={styles.approvedIcon}>
              <CheckCircle2 size={40} color="var(--success)" />
            </div>
            <h3>Recovery Strategy Successfully Committed</h3>
            <p className={styles.approvedSub}>
              "{selectedOption.title}" has been authorized and applied. Downstream task statuses have updated and Project Pulse health recalculated to <strong>ON TRACK</strong>.
            </p>
          </div>
        ) : (
          /* Strategy Selection Cards Grid */
          <div className={styles.strategySelectionGrid}>
            <div className={styles.optionsList}>
              <span className={styles.optionsSectionTitle}>
                SELECT CORRECTIVE STRATEGY ({recoveryOptions.length} OPTIONS)
              </span>

              {recoveryOptions.map((opt) => (
                <div
                  key={opt.id}
                  className={`${styles.strategyCard} ${selectedOptionId === opt.id ? styles.strategyCardActive : ''}`}
                  onClick={() => setSelectedOptionId(opt.id)}
                >
                  <div className={styles.strategyTop}>
                    <span className={styles.strategyTitle}>{opt.title}</span>
                    <Badge variant="intel" size="sm">
                      Saves {opt.potentialTimeSavedDays} Days
                    </Badge>
                  </div>
                  <p className={styles.strategyShortDesc}>{opt.description}</p>
                </div>
              ))}
            </div>

            {/* Selected Strategy Deep Evaluation Pane */}
            <div className={styles.selectedEvaluationPane}>
              <div className={styles.evalHeader}>
                <h4>Strategy Impact & Trade-offs</h4>
                <span className={styles.evalConfidence}>
                  Confidence: {Math.round(selectedOption.confidence * 100)}%
                </span>
              </div>

              {/* Proposed Changes */}
              <div className={styles.evalBlock}>
                <div className={styles.evalBlockTitle}>PROPOSED OPERATIONAL CHANGES</div>
                <ul className={styles.evalList}>
                  {selectedOption.proposedChanges.map((change, idx) => (
                    <li key={idx} className={styles.evalItem}>
                      <ArrowRight size={12} color="var(--primary-600)" />
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trade-Offs Considered */}
              <div className={styles.evalBlock}>
                <div className={styles.evalBlockTitleTradeOff}>TRADE-OFFS & CONSTRAINTS</div>
                <ul className={styles.evalList}>
                  {selectedOption.tradeOffs.map((to, idx) => (
                    <li key={idx} className={styles.evalItem}>
                      <AlertTriangle size={12} color="var(--warning)" />
                      <span>{to}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.netImpactBanner}>
                <Zap size={16} color="var(--intel-600)" />
                <span>
                  <strong>Net Result:</strong> Absorbs project delay and restores project health to <strong>ON TRACK</strong>.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
