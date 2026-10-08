import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  PlusCircle,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Sparkles,
  Send,
  Flag,
  BookOpenCheck,
  Building,
  Edit3,
} from 'lucide-react';
import { ClientChangeType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import styles from './ClientPortalView.module.css';

interface ClientPortalViewProps {
  onOpenProject?: (projectId: string) => void;
}

export const ClientPortalView: React.FC<ClientPortalViewProps> = () => {
  const { currentUser } = useAuth();
  const {
    projects,
    tasks,
    blockers,
    decisions,
    clientChangeRequests,
    clientDelayInquiries,
    submitClientChangeRequest,
    submitClientDelayInquiry,
  } = useOrg();

  // Selected project (default to first active project or mobile redesign)
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    () => projects.find((p) => p.id === 'proj-mobile')?.id || projects[0]?.id || ''
  );

  // Modals state
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);

  // Form states: Change Request
  const [changeType, setChangeType] = useState<ClientChangeType>('scope_addition');
  const [changeTitle, setChangeTitle] = useState('');
  const [changeDescription, setChangeDescription] = useState('');
  const [changeJustification, setChangeJustification] = useState('');
  const [changeUrgency, setChangeUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [deadlineFlexibility, setDeadlineFlexibility] = useState<'flexible' | 'firm'>('flexible');

  // Form states: Delay Inquiry
  const [delayQuestionTitle, setDelayQuestionTitle] = useState('');
  const [delayQuestionMessage, setDelayQuestionMessage] = useState('');

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  if (!currentProject) return null;

  const projectTasks = tasks.filter((t) => t.projectId === currentProject.id);
  const activeBlockers = blockers.filter((b) => b.projectId === currentProject.id && b.status === 'active');
  const projectRequests = clientChangeRequests.filter((r) => r.projectId === currentProject.id);
  const projectInquiries = clientDelayInquiries.filter((i) => i.projectId === currentProject.id);
  const projectDecisions = decisions.filter((d) => d.projectId === currentProject.id);

  const completedTasks = projectTasks.filter((t) => t.status === 'done');
  const inProgressTasks = projectTasks.filter((t) => t.status === 'in_progress');
  const blockedTasks = projectTasks.filter((t) => t.isBlocked);
  const progressPercent =
    projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0;

  // Handlers
  const handleOpenSuggestChange = () => {
    setChangeType('scope_addition');
    setChangeTitle('');
    setChangeDescription('');
    setChangeJustification('');
    setIsChangeModalOpen(true);
  };

  const handleOpenChangeRequirement = () => {
    setChangeType('requirement_modification');
    setChangeTitle('');
    setChangeDescription('');
    setChangeJustification('');
    setIsChangeModalOpen(true);
  };

  const handleOpenQuestionDelay = () => {
    if (activeBlockers.length > 0) {
      setDelayQuestionTitle(`Inquiry on ${activeBlockers[0].type.replace('_', ' ')} blocker`);
    } else {
      setDelayQuestionTitle('Inquiry on project milestone timeline & release date');
    }
    setDelayQuestionMessage('');
    setIsDelayModalOpen(true);
  };

  const handleSubmitChangeRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeTitle.trim() || !changeDescription.trim()) return;

    submitClientChangeRequest({
      projectId: currentProject.id,
      clientId: currentUser.id,
      clientName: currentUser.name || 'Client Stakeholder',
      clientEmail: currentUser.email,
      type: changeType,
      title: changeTitle.trim(),
      description: changeDescription.trim(),
      businessJustification: changeJustification.trim(),
      urgency: changeUrgency,
      deadlineFlexibility,
    });

    setChangeTitle('');
    setChangeDescription('');
    setChangeJustification('');
    setIsChangeModalOpen(false);
  };

  const handleSubmitDelayInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!delayQuestionTitle.trim() || !delayQuestionMessage.trim()) return;

    submitClientDelayInquiry({
      projectId: currentProject.id,
      clientId: currentUser.id,
      clientName: currentUser.name || 'Client Stakeholder',
      title: delayQuestionTitle.trim(),
      message: delayQuestionMessage.trim(),
      targetTaskId: activeBlockers[0]?.taskId,
    });

    setDelayQuestionTitle('');
    setDelayQuestionMessage('');
    setIsDelayModalOpen(false);
  };

  return (
    <div className={styles.portalContainer}>
      {/* Executive Header */}
      <div className={styles.portalHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.clientBadgeRow}>
            <Badge variant="intel" size="sm">
              <Building size={12} style={{ marginRight: 4 }} />
              Roy Global Client Portal
            </Badge>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--gray-500)', fontWeight: 600 }}>
              <img src="/logo.png" alt="Konvey" style={{ width: '15px', height: '15px', borderRadius: '4px', background: '#ffffff', border: '1px solid #e2e8f0', padding: '1px', objectFit: 'contain' }} />
              Powered by KONVEY
            </span>
            <Badge
              variant={
                currentProject.health === 'on_track'
                  ? 'success'
                  : currentProject.health === 'at_risk'
                  ? 'warning'
                  : 'critical'
              }
              size="sm"
            >
              {currentProject.health.toUpperCase().replace('_', ' ')}
            </Badge>
          </div>

          <h1 className={styles.portalTitle}>{currentProject.name}</h1>
          <p className={styles.portalSubtitle}>
            Dedicated client workspace to monitor delivery progress, suggest changes, question delays, and submit requirement adjustments directly to PM Rahul Sharma and Admin Sameera Rao.
          </p>
        </div>

        <div className={styles.headerActions}>
          <select
            className={styles.formSelect}
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{ fontWeight: 500 }}
            aria-label="Select Project to Monitor"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                Project: {p.name}
              </option>
            ))}
          </select>

          {/* Feature 1: Question Delay */}
          <Button
            variant="secondary"
            leftIcon={<HelpCircle size={14} color="var(--critical-600)" />}
            onClick={handleOpenQuestionDelay}
            title="Question project delay or blocker"
          >
            Question Delay
          </Button>

          {/* Feature 2: Change Requirement */}
          <Button
            variant="secondary"
            leftIcon={<Edit3 size={14} />}
            onClick={handleOpenChangeRequirement}
            title="Modify existing scope or requirement"
          >
            Change Requirement
          </Button>

          {/* Feature 3: Suggest Changes */}
          <Button
            variant="primary"
            leftIcon={<PlusCircle size={14} />}
            onClick={handleOpenSuggestChange}
            title="Propose a new feature or scope addition"
          >
            Suggest Change
          </Button>
        </div>
      </div>

      {/* Key Delivery Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span>Target Delivery Date</span>
            <Calendar size={16} color="var(--primary-600)" />
          </div>
          <div className={styles.metricValue}>
            {new Date(currentProject.targetDate).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
          <div className={styles.metricSubtext}>
            {Math.ceil((new Date(currentProject.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days until target release
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span>Milestone Completion</span>
            <CheckCircle2 size={16} color="var(--success-600)" />
          </div>
          <div className={styles.metricValue}>
            {currentProject.milestones?.filter((m) => m.completed).length || 0} /{' '}
            {currentProject.milestones?.length || 0}
          </div>
          <div className={styles.metricSubtext}>
            {Math.round(
              ((currentProject.milestones?.filter((m) => m.completed).length || 0) /
                (currentProject.milestones?.length || 1)) *
                100
            )}% of strategic deliverables verified
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span>Sprint Velocity Progress</span>
            <TrendingUp size={16} color="var(--intel-600)" />
          </div>
          <div className={styles.metricValue}>{progressPercent}%</div>
          <div className={styles.metricSubtext}>
            {completedTasks.length} of {projectTasks.length} deliverables completed
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span>Client Change Requests</span>
            <Sparkles size={16} color="var(--accent-teal)" />
          </div>
          <div className={styles.metricValue}>{projectRequests.length}</div>
          <div className={styles.metricSubtext}>
            {projectRequests.filter((r) => r.status === 'approved').length} approved & queued in sprint
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className={styles.contentGrid}>
        {/* Left Column: Progress, Milestones & Delay Inquiry */}
        <div className={styles.column}>
          {/* Active Delay / Blocker Notice with Question Delay Action */}
          {activeBlockers.length > 0 ? (
            <div className={styles.delayCard}>
              <div className={styles.delayCardTop}>
                <div>
                  <div className={styles.delayHeading}>
                    <AlertTriangle size={18} />
                    <span>Delivery Delay Notice: {activeBlockers.length} Blocker Impeding Sprint</span>
                  </div>
                  <p className={styles.delayBody}>
                    "{activeBlockers[0].description}" — This blocker is currently affecting delivery confidence. Our engineering team is reviewing mitigations.
                  </p>
                </div>
              </div>

              <div className={styles.delayFooter}>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<HelpCircle size={14} />}
                  onClick={handleOpenQuestionDelay}
                >
                  Question This Delay
                </Button>
              </div>
            </div>
          ) : (
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.15rem 1.35rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--success-700)', fontSize: '0.95rem' }}>
                  <CheckCircle2 size={16} />
                  <span>Sprint Flow: No Active Delay Blockers</span>
                </div>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  All deliverables are pacing normally toward the release target.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<HelpCircle size={13} />}
                onClick={handleOpenQuestionDelay}
              >
                Inquire on Schedule
              </Button>
            </div>
          )}

          {/* Strategic Milestones Roadmap */}
          <Card variant="default" padding="lg">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Flag size={18} color="var(--primary-600)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Milestone Delivery Roadmap</h3>
              </div>
              <Badge variant="default" size="sm">Executive View</Badge>
            </div>

            <div className={styles.milestonesContainer}>
              {currentProject.milestones?.map((m, idx) => (
                <div key={m.id} className={styles.milestoneRow}>
                  <div className={styles.milestoneIndicator}>
                    <div className={`${styles.milestoneDot} ${m.completed ? styles.dotCompleted : ''}`}>
                      {m.completed && <CheckCircle2 size={12} color="var(--white)" />}
                    </div>
                    {idx < (currentProject.milestones?.length || 0) - 1 && (
                      <div className={`${styles.milestoneLine} ${m.completed ? styles.lineCompleted : ''}`} />
                    )}
                  </div>

                  <div className={styles.milestoneCard}>
                    <div className={styles.milestoneTop}>
                      <span className={styles.milestoneTitle}>{m.title}</span>
                      <Badge variant={m.completed ? 'success' : 'default'} size="sm">
                        {m.completed ? 'Delivered & Verified' : 'In Progress'}
                      </Badge>
                    </div>
                    <div className={styles.milestoneDate}>
                      <Calendar size={12} /> Target Delivery: {new Date(m.targetDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Delay Inquiries & PM Responses Timeline */}
          {projectInquiries.length > 0 && (
            <Card variant="default" padding="lg">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <MessageSquare size={18} color="var(--intel-600)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                  Delay Inquiries & PM Responses ({projectInquiries.length})
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {projectInquiries.map((inq) => (
                  <div key={inq.id} className={styles.inquiryItem}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={styles.inquiryQuestion}>{inq.title}</span>
                      <Badge variant={inq.status === 'responded' ? 'success' : 'warning'} size="sm">
                        {inq.status === 'responded' ? 'PM Responded' : 'Under PM Review'}
                      </Badge>
                    </div>
                    <p className={styles.inquiryMsg}>{inq.message}</p>

                    {inq.pmResponse && (
                      <div className={styles.pmReplyBox}>
                        <span className={styles.pmReplyLabel}>Rahul Sharma (Senior Project Manager):</span>
                        <p className={styles.pmReplyText}>{inq.pmResponse}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Change Requests & Strategic Decisions */}
        <div className={styles.column}>
          {/* Client Change Requests Tracker */}
          <Card variant="default" padding="lg">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color="var(--primary-600)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Change Proposals & Scope</h3>
              </div>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<PlusCircle size={13} />}
                onClick={() => setIsChangeModalOpen(true)}
              >
                Propose
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {projectRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                  No change proposals submitted yet. Click "Suggest Change" to propose a feature or requirement adjustment.
                </div>
              ) : (
                projectRequests.map((req) => (
                  <div key={req.id} className={styles.requestCard}>
                    <div className={styles.requestTop}>
                      <div>
                        <div className={styles.requestTitle}>{req.title}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                          Type: {req.type.replace('_', ' ')} • Urgency: {req.urgency}
                        </span>
                      </div>
                      <Badge
                        variant={
                          req.status === 'approved'
                            ? 'success'
                            : req.status === 'rejected'
                            ? 'critical'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {req.status === 'approved'
                          ? 'Approved for Sprint'
                          : req.status === 'rejected'
                          ? 'Declined by PM'
                          : 'Pending PM Review'}
                      </Badge>
                    </div>

                    <p className={styles.requestDesc}>{req.description}</p>

                    {req.businessJustification && (
                      <div style={{ fontSize: '0.8rem', background: 'var(--bg-surface-elevated)', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-sm)' }}>
                        <strong>Business Justification:</strong> {req.businessJustification}
                      </div>
                    )}

                    {req.reviewNotes && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary-700)', background: 'var(--primary-50)', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-sm)' }}>
                        <strong>PM Review Notes:</strong> {req.reviewNotes}
                      </div>
                    )}

                    <div className={styles.requestMeta}>
                      <span>Submitted by {req.clientName}</span>
                      <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Transparent Decisions Memory Feed */}
          <Card variant="intel" padding="lg">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <BookOpenCheck size={18} color="var(--intel-700)" />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--intel-900)' }}>
                Decision Memory (Client Visibility)
              </h3>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.45 }}>
              Agreed architectural choices and scope boundaries recorded to prevent circular discussions.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {projectDecisions.slice(0, 3).map((d) => (
                <div
                  key={d.id}
                  style={{
                    padding: '0.85rem',
                    background: 'var(--white)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      #{d.decisionNumber} {d.title}
                    </span>
                    <Badge variant="intel" size="sm">Ratified</Badge>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {d.decision}
                  </p>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)' }}>
                    Why: {d.reason}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Modal: Suggest Changes & Modify Requirements */}
      <Modal
        isOpen={isChangeModalOpen}
        onClose={() => setIsChangeModalOpen(false)}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--primary-600)" />
            <span>
              {changeType === 'requirement_modification'
                ? 'Change Project Requirement / Specification'
                : changeType === 'de_scope'
                ? 'De-scope Deliverable'
                : 'Suggest Feature / Scope Change'}
            </span>
          </div>
        }
        size="md"
      >
        <form onSubmit={handleSubmitChangeRequest} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Change Category</label>
            <select
              className={styles.formSelect}
              value={changeType}
              onChange={(e) => setChangeType(e.target.value as ClientChangeType)}
            >
              <option value="scope_addition">Scope Addition (New Feature / Screen)</option>
              <option value="requirement_modification">Requirement Modification (Alter Existing Spec)</option>
              <option value="priority_revision">Priority Revision (Expedite a Deliverable)</option>
              <option value="de_scope">De-scope (Postpone to Phase 2)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Title of Proposed Change *</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="e.g. Add Apple Pay & Google Pay Express Checkout"
              value={changeTitle}
              onChange={(e) => setChangeTitle(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Detailed Functional Description *</label>
            <textarea
              className={styles.formTextarea}
              placeholder="Describe what the application should do, user flow, or specification update..."
              value={changeDescription}
              onChange={(e) => setChangeDescription(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Business Value & Justification</label>
            <textarea
              className={styles.formTextarea}
              placeholder="Why is this change necessary? (e.g. Higher checkout conversion, partner compliance)"
              value={changeJustification}
              onChange={(e) => setChangeJustification(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Urgency</label>
              <select
                className={styles.formSelect}
                value={changeUrgency}
                onChange={(e) => setChangeUrgency(e.target.value as any)}
              >
                <option value="low">Low (Nice to have)</option>
                <option value="medium">Medium (Next sprint)</option>
                <option value="high">High (Current release)</option>
                <option value="critical">Critical (Blocking launch)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Deadline Flexibility</label>
              <select
                className={styles.formSelect}
                value={deadlineFlexibility}
                onChange={(e) => setDeadlineFlexibility(e.target.value as any)}
              >
                <option value="flexible">Flexible (Willing to extend target date)</option>
                <option value="firm">Firm (Must fit within current deadline)</option>
              </select>
            </div>
          </div>

          <div className={styles.formActions}>
            <Button variant="secondary" onClick={() => setIsChangeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" leftIcon={<Send size={14} />}>
              {changeType === 'requirement_modification' ? 'Submit Requirement Change' : 'Submit Change Proposal'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Question the Delay */}
      <Modal
        isOpen={isDelayModalOpen}
        onClose={() => setIsDelayModalOpen(false)}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={18} color="var(--critical-600)" />
            <span>Question Project Delay — Send Inquiry to PM</span>
          </div>
        }
        size="md"
      >
        <form onSubmit={handleSubmitDelayInquiry} className={styles.modalForm}>
          <div style={{ padding: '0.75rem', background: 'var(--critical-50)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--critical-800)' }}>
            This inquiry will be sent directly to <strong>Rahul Sharma (Senior Project Manager)</strong> and <strong>Sameera Rao (VP Operations)</strong> with high priority.
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Inquiry Subject *</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="e.g. Can we launch sandbox mock integration while gateway approval finishes?"
              value={delayQuestionTitle}
              onChange={(e) => setDelayQuestionTitle(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Specific Questions & Proposed Alternatives *</label>
            <textarea
              className={styles.formTextarea}
              placeholder="Detail your question, requested timeline clarification, or alternative approach to mitigate the delay..."
              value={delayQuestionMessage}
              onChange={(e) => setDelayQuestionMessage(e.target.value)}
              required
            />
          </div>

          <div className={styles.formActions}>
            <Button variant="secondary" onClick={() => setIsDelayModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" type="submit" leftIcon={<Send size={14} />}>
              Submit Delay Inquiry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
