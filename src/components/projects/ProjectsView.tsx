import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Project, ProjectPriority, ProjectHealth } from '../../types';
import { useOrg } from '../../context/OrgContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { ProjectWorkspace } from './ProjectWorkspace';
import styles from './Projects.module.css';

interface ProjectsViewProps {
  onOpenCreateTask: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onOpenCreateTask }) => {
  const { projects, tasks, blockers, createProject } = useOrg();
  const { users } = useAuth();
  const { showToast } = useToast();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [filterHealth, setFilterHealth] = useState<'all' | ProjectHealth>('all');

  // Create Project Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ProjectPriority>('high');
  const [targetDate, setTargetDate] = useState('2026-11-30');
  const [ownerId, setOwnerId] = useState(users[0]?.id || '');

  // If a project is selected, render the full workspace
  if (selectedProjectId) {
    return (
      <ProjectWorkspace
        projectId={selectedProjectId}
        onBackToProjects={() => setSelectedProjectId(null)}
        onOpenCreateTask={onOpenCreateTask}
      />
    );
  }

  const filteredProjects =
    filterHealth === 'all'
      ? projects
      : projects.filter((p) => p.health === filterHealth);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProj = createProject({
      name: name.trim(),
      description: description.trim(),
      ownerId,
      teamIds: ['team-eng'],
      memberIds: [ownerId, 'user-priya', 'user-alex'],
      status: 'active',
      priority,
      health: 'on_track',
      healthConfidence: 0.95,
      startDate: new Date().toISOString().split('T')[0],
      targetDate,
      goals: [{ id: 'g-new', title: 'Achieve primary project release criteria', progressPercent: 0 }],
      milestones: [
        {
          id: `m-${Date.now().toString(36)}`,
          projectId: '',
          title: 'Initial Scope Verification',
          targetDate,
          completed: false,
          order: 1,
        },
      ],
    });

    showToast({
      type: 'success',
      title: 'Project Created',
      message: `"${newProj.name}" initialized and added to portfolio.`,
    });

    setName('');
    setDescription('');
    setCreateModalOpen(false);
    setSelectedProjectId(newProj.id);
  };

  const getUser = (id: string) => users.find((u) => u.id === id);

  return (
    <div className={styles.directoryContainer}>
      {/* Directory Header */}
      <div className={styles.directoryHeader}>
        <div>
          <div className={styles.metaRowHeader}>
            <span className={styles.sectionCategory}>WORKSPACE PROJECTS</span>
          </div>
          <h2>Projects Directory</h2>
          <p className={styles.directorySubtitle}>
            Manage cross-functional initiatives, track milestone progress, and observe real-time project pulse health.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus size={15} />}
          onClick={() => setCreateModalOpen(true)}
        >
          New Project
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className={styles.filterBar}>
        <div className={styles.filterTabs}>
          <button
            type="button"
            className={`${styles.filterBtn} ${filterHealth === 'all' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilterHealth('all')}
          >
            All Projects ({projects.length})
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${filterHealth === 'on_track' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilterHealth('on_track')}
          >
            🟢 On Track ({projects.filter((p) => p.health === 'on_track').length})
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${filterHealth === 'at_risk' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilterHealth('at_risk')}
          >
            🟡 At Risk ({projects.filter((p) => p.health === 'at_risk').length})
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${filterHealth === 'not_started' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilterHealth('not_started')}
          >
            ⚪ Not Started ({projects.filter((p) => p.health === 'not_started').length})
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className={styles.projectsGrid}>
        {filteredProjects.map((p) => {
          const owner = getUser(p.ownerId);
          const pTasks = tasks.filter((t) => t.projectId === p.id);
          const pCompleted = pTasks.filter((t) => t.status === 'done');
          const pBlockers = blockers.filter((b) => b.projectId === p.id && b.status === 'active');
          const pct = pTasks.length > 0 ? Math.round((pCompleted.length / pTasks.length) * 100) : 0;

          return (
            <div
              key={p.id}
              className={`${styles.projectCard} ${p.health === 'at_risk' ? styles.cardAtRisk : ''}`}
              onClick={() => setSelectedProjectId(p.id)}
            >
              <div className={styles.cardTop}>
                <Badge
                  variant={
                    p.health === 'on_track'
                      ? 'success'
                      : p.health === 'at_risk'
                      ? 'warning'
                      : 'critical'
                  }
                  size="sm"
                  dot
                >
                  {p.health.replace('_', ' ').toUpperCase()}
                </Badge>
                <span className={styles.priorityMini}>{p.priority.toUpperCase()}</span>
              </div>

              <div className={styles.cardMain}>
                <h3 className={styles.cardName}>{p.name}</h3>
                <p className={styles.cardDesc}>{p.description}</p>
              </div>

              {pBlockers.length > 0 && (
                <div className={styles.cardBlockerNotice}>
                  <AlertTriangle size={12} color="var(--critical)" />
                  <span>{pBlockers.length} active blocker requiring action</span>
                </div>
              )}

              {/* Progress and Target Date */}
              <div className={styles.cardProgressArea}>
                <div className={styles.progressRow}>
                  <span className={styles.progressLabel}>Completion</span>
                  <span className={styles.progressVal}>{pct}% ({pCompleted.length}/{pTasks.length})</span>
                </div>
                <div className={styles.progressTrackMini}>
                  <div className={styles.progressFillMini} style={{ width: `${pct}%` }} />
                </div>
              </div>

              {/* Card Footer */}
              <div className={styles.cardFooterBar}>
                <div className={styles.footerOwner}>
                  {owner && (
                    <>
                      <img src={owner.avatarUrl} alt={owner.name} className={styles.ownerAvatar} />
                      <span>{owner.name}</span>
                    </>
                  )}
                </div>

                <div className={styles.footerDate}>
                  <Calendar size={12} />
                  <span>{new Date(p.targetDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>

              <div className={styles.openProjectHover}>
                <span>Open Project Workspace</span>
                <ArrowRight size={13} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Project"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateProject}>
              Create & Open Project
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateProject} className={styles.createProjForm}>
          <Input
            label="Project Name"
            required
            placeholder="e.g. SOC2 Type II Certification"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Textarea
            label="Project Objective & Scope"
            placeholder="Describe the primary business outcomes, scope parameters, and deliverables..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className={styles.formRowModal}>
            <Select
              label="Project Lead"
              options={users.map((u) => ({ value: u.id, label: `${u.name} (${u.role})` }))}
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
            />

            <Select
              label="Priority"
              options={[
                { value: 'urgent', label: 'Urgent Priority' },
                { value: 'high', label: 'High Priority' },
                { value: 'medium', label: 'Medium Priority' },
                { value: 'low', label: 'Low Priority' },
              ]}
              value={priority}
              onChange={(e) => setPriority(e.target.value as ProjectPriority)}
            />
          </div>

          <Input
            label="Target Delivery Date"
            type="date"
            required
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
};
