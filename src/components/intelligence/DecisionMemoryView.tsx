import React, { useState } from 'react';
import {
  BookOpenCheck,
  Search,
  Plus,
  ArrowRight,
  GitCommit,
  ShieldCheck,
  History,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { Decision } from '../../types';
import { useOrg } from '../../context/OrgContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import styles from './Intelligence.module.css';

interface DecisionMemoryViewProps {
  projectId?: string;
}

export const DecisionMemoryView: React.FC<DecisionMemoryViewProps> = ({ projectId }) => {
  const { decisions, projects, recordDecision, supersedeDecision } = useOrg();
  const { users, currentUser } = useAuth();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'superseded'>('all');

  // Record Decision Modal state
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [decisionText, setDecisionText] = useState('');
  const [reason, setReason] = useState('');
  const [alternativesText, setAlternativesText] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || projects[0]?.id || '');

  // Superseding Modal state
  const [supersedeModalOpen, setSupersedeModalOpen] = useState(false);
  const [targetOldDecision, setTargetOldDecision] = useState<Decision | null>(null);

  const filteredDecisions = decisions.filter((d) => {
    if (projectId && d.projectId !== projectId) return false;
    if (filterStatus !== 'all' && d.status !== filterStatus) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.decision.toLowerCase().includes(q) ||
      d.reason.toLowerCase().includes(q) ||
      d.alternatives.some((a) => a.toLowerCase().includes(q))
    );
  });

  const handleCreateDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !decisionText.trim() || !reason.trim()) return;

    const altList = alternativesText
      .split('\n')
      .map((a) => a.trim())
      .filter(Boolean);

    recordDecision({
      projectId: selectedProjectId,
      title: title.trim(),
      decision: decisionText.trim(),
      reason: reason.trim(),
      alternatives: altList.length > 0 ? altList : ['No alternatives formally recorded.'],
      decisionMakerIds: [currentUser.id],
      relatedTaskIds: [],
      createdBy: currentUser.id,
    });

    showToast({
      type: 'success',
      title: 'Decision Recorded',
      message: `Official decision added to institutional memory.`,
    });

    setTitle('');
    setDecisionText('');
    setReason('');
    setAlternativesText('');
    setRecordModalOpen(false);
  };

  const handleOpenSupersede = (decision: Decision) => {
    setTargetOldDecision(decision);
    setTitle(`Revised: ${decision.title}`);
    setDecisionText('');
    setReason(`Supersedes Decision #${decision.decisionNumber} because: `);
    setAlternativesText('');
    setSelectedProjectId(decision.projectId);
    setSupersedeModalOpen(true);
  };

  const handleConfirmSupersede = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetOldDecision || !title.trim() || !decisionText.trim() || !reason.trim()) return;

    const altList = alternativesText
      .split('\n')
      .map((a) => a.trim())
      .filter(Boolean);

    supersedeDecision(targetOldDecision.id, {
      projectId: selectedProjectId,
      title: title.trim(),
      decision: decisionText.trim(),
      reason: reason.trim(),
      alternatives: altList.length > 0 ? altList : ['Previously established approach.'],
      decisionMakerIds: [currentUser.id],
      relatedTaskIds: [],
      createdBy: currentUser.id,
    });

    showToast({
      type: 'info',
      title: 'Decision Superseded',
      message: `Decision #${targetOldDecision.decisionNumber} superseded without destroying history.`,
    });

    setSupersedeModalOpen(false);
    setTargetOldDecision(null);
    setTitle('');
    setDecisionText('');
    setReason('');
  };

  const getProject = (id: string) => projects.find((p) => p.id === id);

  return (
    <div className={styles.intelContainer}>
      {/* Header */}
      <div className={styles.intelHeader}>
        <div>
          <h2>Decisions Log</h2>
          <p className={styles.intelSubtitle}>
            A permanent record of technical and product decisions, context, and alternatives considered.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus size={15} />}
          onClick={() => setRecordModalOpen(true)}
        >
          Record Decision
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className={styles.decisionFilterRow}>
        <div className={styles.decisionSearchWrapper}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search decisions by title, rationale, or alternatives (e.g. 'Firebase', 'Inter')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.decisionSearchInput}
          />
        </div>

        <div className={styles.decisionStatusFilter}>
          <button
            type="button"
            className={`${styles.filterTab} ${filterStatus === 'all' ? styles.filterTabActive : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({decisions.length})
          </button>
          <button
            type="button"
            className={`${styles.filterTab} ${filterStatus === 'active' ? styles.filterTabActive : ''}`}
            onClick={() => setFilterStatus('active')}
          >
            Active Official ({decisions.filter((d) => d.status === 'active').length})
          </button>
          <button
            type="button"
            className={`${styles.filterTab} ${filterStatus === 'superseded' ? styles.filterTabActive : ''}`}
            onClick={() => setFilterStatus('superseded')}
          >
            Superseded History ({decisions.filter((d) => d.status === 'superseded').length})
          </button>
        </div>
      </div>

      {/* Decisions Cards List */}
      <div className={styles.decisionsList}>
        {filteredDecisions.length === 0 ? (
          <div className={styles.emptyNotice}>
            <BookOpenCheck size={28} color="var(--gray-400)" />
            <span>No decisions match your search criteria.</span>
          </div>
        ) : (
          filteredDecisions.map((d) => {
            const project = getProject(d.projectId);

            return (
              <Card
                key={d.id}
                variant={d.status === 'active' ? 'default' : 'subtle'}
                padding="lg"
                className={styles.decisionCard}
              >
                <div className={styles.decisionCardTop}>
                  <div className={styles.decisionNumberPill}>
                    <BookOpenCheck size={13} />
                    <span>DECISION #{d.decisionNumber}</span>
                  </div>

                  <div className={styles.decisionTopRight}>
                    <Badge variant={d.status === 'active' ? 'intel' : 'default'} size="sm">
                      {d.status.toUpperCase()}
                    </Badge>
                    {d.status === 'active' && (
                      <button
                        type="button"
                        className={styles.supersedeBtn}
                        onClick={() => handleOpenSupersede(d)}
                        title="Establish revised decision superseding this record"
                      >
                        <GitCommit size={12} /> Supersede
                      </button>
                    )}
                  </div>
                </div>

                <h3 className={styles.decisionTitle}>{d.title}</h3>

                {/* The Established Decision */}
                <div className={styles.decisionBox}>
                  <div className={styles.boxLabel}>ESTABLISHED DECISION</div>
                  <p className={styles.decisionText}>{d.decision}</p>
                </div>

                {/* Problem Rationale */}
                <div className={styles.rationaleBox}>
                  <div className={styles.boxLabel}>RATIONALE & JUSTIFICATION</div>
                  <p className={styles.rationaleText}>{d.reason}</p>
                </div>

                {/* Alternatives Considered */}
                {d.alternatives.length > 0 && (
                  <div className={styles.alternativesBox}>
                    <div className={styles.boxLabel}>ALTERNATIVES CONSIDERED & REJECTED</div>
                    <ul className={styles.alternativesList}>
                      {d.alternatives.map((alt, idx) => (
                        <li key={idx}>{alt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Decision Footer Metadata */}
                <div className={styles.decisionFooter}>
                  <span className={styles.footerProject}>
                    Project: <strong>{project?.name || 'Workspace Core'}</strong>
                  </span>
                  <span className={styles.footerDate}>
                    <Calendar size={11} /> Established {new Date(d.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className={styles.immutableTag}>
                    <ShieldCheck size={11} color="var(--success)" /> Permanent History
                  </span>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Record Decision Modal */}
      <Modal
        isOpen={recordModalOpen}
        onClose={() => setRecordModalOpen(false)}
        title="Record Official Project Decision"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRecordModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateDecision}>
              Record in Memory
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateDecision} className={styles.modalForm}>
          <Input
            label="Decision Title"
            required
            placeholder="e.g. Choose Hybrid Client Architecture with Deterministic Engine"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Select
            label="Associated Project"
            options={projects.map((p) => ({ value: p.id, label: p.name }))}
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          />

          <Textarea
            label="The Decision (What was decided?)"
            required
            placeholder="State the choice clearly and concisely..."
            value={decisionText}
            onChange={(e) => setDecisionText(e.target.value)}
          />

          <Textarea
            label="Rationale (Why was this chosen?)"
            required
            placeholder="Provide context, constraints, and requirements driving the decision..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <Textarea
            label="Alternatives Considered (1 per line)"
            placeholder="Alternative option A (reason rejected)&#10;Alternative option B (reason rejected)"
            value={alternativesText}
            onChange={(e) => setAlternativesText(e.target.value)}
          />
        </form>
      </Modal>

      {/* Supersede Modal */}
      <Modal
        isOpen={supersedeModalOpen}
        onClose={() => setSupersedeModalOpen(false)}
        title={`Supersede Decision #${targetOldDecision?.decisionNumber}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSupersedeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmSupersede}>
              Establish Successor Decision
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmSupersede} className={styles.modalForm}>
          <div className={styles.supersedeWarning}>
            <GitCommit size={16} />
            <span>
              Decision #{targetOldDecision?.decisionNumber} will be marked as <strong>Superseded</strong> and permanently linked to this new record. Historical memory is preserved.
            </span>
          </div>

          <Input
            label="New Decision Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            label="New Decision Statement"
            required
            placeholder="What is the updated architectural policy?"
            value={decisionText}
            onChange={(e) => setDecisionText(e.target.value)}
          />

          <Textarea
            label="Reason for Superseding Previous Decision"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <Textarea
            label="Alternatives Considered"
            value={alternativesText}
            onChange={(e) => setAlternativesText(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
};
