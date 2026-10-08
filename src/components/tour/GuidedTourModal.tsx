import React, { useState } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  Columns3,
  Activity,
  ShieldAlert,
  Zap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { NavigationTab } from '../layout/Sidebar';
import styles from './Tour.module.css';

interface TourStop {
  id: string;
  tag: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlights: string[];
  recommendedTab: NavigationTab;
  tabLabel: string;
}

const TOUR_STOPS: TourStop[] = [
  {
    id: 'dashboard',
    tag: 'STOP 1 OF 5 • EXECUTIVE POSTURE',
    title: 'Calm Executive Dashboard',
    description:
      'Designed to counter notification fatigue. Aggregates portfolio health, active blockers, and high-impact deliverables without endless noisy alerts or clutter.',
    icon: <LayoutDashboard size={22} />,
    highlights: ['Portfolio Health Strip', 'Blocker Alert Ribbons', 'Quick Persona Context'],
    recommendedTab: 'dashboard',
    tabLabel: 'Explore Dashboard',
  },
  {
    id: 'perspectives',
    tag: 'STOP 2 OF 5 • MULTI-PERSPECTIVE WORKSPACE',
    title: 'Execution Perspectives',
    description:
      'Switch dynamically between tabular List view, 4-column Kanban board, deadline Calendar, and dependency-linked Timeline without losing work state.',
    icon: <Columns3 size={22} />,
    highlights: ['Cycle-safe Dependency Engine', 'In-context Task Detail Drawer', 'Checklist Milestones'],
    recommendedTab: 'projects',
    tabLabel: 'Open Project Workspace',
  },
  {
    id: 'intelligence',
    tag: 'STOP 3 OF 5 • SIGNATURE INTELLIGENCE',
    title: 'Project Pulse & Scope Creep Radar',
    description:
      'Deterministic 0–100 health scoring, +39% scope creep detection, and root-cause blocker radar. Computes plain-English delay predictions offline.',
    icon: <Activity size={22} />,
    highlights: ['Explainable Health Factors', 'Origin Scope Attribution', 'Root Cause Blocker Radar'],
    recommendedTab: 'projects',
    tabLabel: 'Inspect Project Pulse',
  },
  {
    id: 'recovery',
    tag: 'STOP 4 OF 5 • STRATEGY SIMULATOR',
    title: 'Recovery Mode Sandbox & PM Guardrail',
    description:
      'Simulate 4 corrective strategies with trade-offs when projects slip. Strict PM guardrail: algorithmic recommendations NEVER mutate deadlines without explicit approval.',
    icon: <ShieldAlert size={22} />,
    highlights: ['4 Simulated Strategies', 'Strict Click-to-Apply Barrier', 'Non-destructive Adjustments'],
    recommendedTab: 'projects',
    tabLabel: 'Launch Recovery Sandbox',
  },
  {
    id: 'focus',
    tag: 'STOP 5 OF 5 • COGNITIVE PROTECTION',
    title: 'Focus Mode & Context Recovery',
    description:
      'Protects individual contributor attention by holding non-critical notifications during timed execution, paired with "What Changed?" instant catch-up.',
    icon: <Zap size={22} />,
    highlights: ['25:00 Focus Countdown Timer', 'Notification Holding Shield', 'What Changed While Away'],
    recommendedTab: 'focus-mode',
    tabLabel: 'Launch Focus Mode',
  },
];

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: NavigationTab) => void;
}

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const stop = TOUR_STOPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STOPS.length - 1;

  const handleJump = () => {
    onNavigateToTab(stop.recommendedTab);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="KONVEY Product Tour — 60-Second Walkthrough"
      maxWidth="680px"
      footer={
        <div className={styles.footerActions}>
          <Button
            variant="secondary"
            size="sm"
            disabled={isFirst}
            leftIcon={<ArrowLeft size={13} />}
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          >
            Previous Stop
          </Button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleJump}
            >
              {stop.tabLabel}
            </Button>

            {isLast ? (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CheckCircle2 size={13} />}
                onClick={onClose}
              >
                Finish Tour
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight size={13} />}
                onClick={() => setCurrentStep((s) => Math.min(TOUR_STOPS.length - 1, s + 1))}
              >
                Next Stop
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className={styles.tourModalContent}>
        {/* Step Progress Dots */}
        <div className={styles.tourStepsNav}>
          <div className={styles.stepIndicators}>
            {TOUR_STOPS.map((_, idx) => (
              <div
                key={idx}
                className={`${styles.stepDot} ${idx === currentStep ? styles.stepDotActive : ''}`}
                onClick={() => setCurrentStep(idx)}
                style={{ cursor: 'pointer' }}
                title={`Stop ${idx + 1}: ${TOUR_STOPS[idx].title}`}
              />
            ))}
          </div>

          <span className={styles.stepCounter}>
            Stop {currentStep + 1} of {TOUR_STOPS.length}
          </span>
        </div>

        {/* Current Stop Card */}
        <div className={styles.tourCard}>
          <div className={styles.cardTop}>
            <div className={styles.cardIconBox}>{stop.icon}</div>
            <div>
              <div className={styles.cardTag}>{stop.tag}</div>
              <h3 className={styles.cardHeading}>{stop.title}</h3>
            </div>
          </div>

          <p className={styles.cardBody}>{stop.description}</p>

          <div className={styles.featurePillList}>
            {stop.highlights.map((h, idx) => (
              <span key={idx} className={styles.featurePill}>
                ✓ {h}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
