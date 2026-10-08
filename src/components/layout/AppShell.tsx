import React, { useState, useEffect } from 'react';
import styles from './AppShell.module.css';
import { NavigationTab } from './Sidebar';
import { FloatingNavbar } from './FloatingNavbar';
import { TopBar } from './TopBar';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useOrg } from '../../context/OrgContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import { TaskPriority, ScopeSource } from '../../types';
import { Search, FolderKanban, CheckSquare, BookOpenCheck } from 'lucide-react';
import { ContextRecoveryDrawer } from '../intelligence/ContextRecoveryDrawer';
import { TaskDetailDrawer } from '../tasks/TaskDetailDrawer';
import { GuidedTourModal } from '../tour/GuidedTourModal';

interface AppShellProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  children: React.ReactNode;
  onOpenMetaPage?: (page: 'brand' | 'security' | 'privacy' | 'terms' | 'sitemap') => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onSelectTab,
  children,
  onOpenMetaPage,
}) => {
  const { projects, tasks, decisions, createTask } = useOrg();
  const { users, role } = useAuth();
  const { showToast } = useToast();
  const isClient = role === 'client';

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search Modal state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Create Task Modal state
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [contextRecoveryOpen, setContextRecoveryOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [selectedDrawerTaskId, setSelectedDrawerTaskId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskProjectId, setTaskProjectId] = useState(projects[0]?.id || '');
  const [taskAssigneeId, setTaskAssigneeId] = useState(users[0]?.id || '');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskScopeSource, setTaskScopeSource] = useState<ScopeSource>('unknown');

  // Keyboard shortcut listener (/ or Cmd+K for search) - Internal team only
  useEffect(() => {
    if (isClient) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isClient]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskProjectId) return;

    createTask({
      projectId: taskProjectId,
      title: taskTitle.trim(),
      description: taskDescription.trim(),
      assigneeId: taskAssigneeId,
      collaboratorIds: [],
      status: 'not_started',
      priority: taskPriority,
      labels: ['work'],
      dueDate: taskDueDate || undefined,
      estimatedMinutes: 240, // 4 hours default
      checklist: [],
    }, taskScopeSource !== 'unknown' ? taskScopeSource : undefined);

    showToast({
      type: 'success',
      title: 'Task Created',
      message: `"${taskTitle.trim()}" added to project.`,
    });

    setTaskTitle('');
    setTaskDescription('');
    setCreateTaskOpen(false);
  };

  // Filtered search results
  const q = searchQuery.toLowerCase().trim();
  const matchedProjects = q ? projects.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) : [];
  const matchedTasks = q ? tasks.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) : [];
  const matchedDecisions = q ? decisions.filter((d) => d.title.toLowerCase().includes(q) || d.decision.toLowerCase().includes(q) || d.reason.toLowerCase().includes(q)) : [];

  return (
    <div className={styles.layout}>
      {/* Main Content Area */}
      <div className={styles.mainWrapper}>
        <TopBar
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          onOpenCreateTask={isClient ? undefined : () => setCreateTaskOpen(true)}
          onOpenSearch={isClient ? undefined : () => setSearchOpen(true)}
          onOpenContextRecovery={isClient ? undefined : () => setContextRecoveryOpen(true)}
          onOpenTour={isClient ? undefined : () => setIsTourOpen(true)}
          onNavigateToDashboard={() => onSelectTab(isClient ? 'client-portal' : 'dashboard')}
          onOpenMetaPage={onOpenMetaPage}
        />

        <main className={styles.contentArea} style={isClient ? { paddingBottom: '48px' } : undefined}>
          {children}

        </main>
      </div>

      {/* Floating Navigation Dock - Hidden for Client Persona */}
      {!isClient && (
        <FloatingNavbar
          currentTab={currentTab}
          onSelectTab={onSelectTab}
        />
      )}

      {/* Global Search Modal (FR-SEARCH-01, 02, 03) */}
      <Modal
        isOpen={searchOpen}
        onClose={() => {
          setSearchOpen(false);
          setSearchQuery('');
        }}
        title="Global Search"
        maxWidth="600px"
      >
        <div className={styles.searchModalBody}>
          <Input
            autoFocus
            placeholder="Search projects, tasks, decisions (press ESC to exit)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={16} />}
          />

          <div className={styles.searchResults}>
            {searchQuery && matchedProjects.length === 0 && matchedTasks.length === 0 && matchedDecisions.length === 0 && (
              <div className={styles.searchEmpty}>No results found for "{searchQuery}".</div>
            )}

            {matchedProjects.length > 0 && (
              <div className={styles.searchSection}>
                <div className={styles.sectionHeading}>
                  <FolderKanban size={13} />
                  <span>Projects</span>
                </div>
                {matchedProjects.map((p) => (
                  <div
                    key={p.id}
                    className={styles.searchResultItem}
                    onClick={() => {
                      onSelectTab('projects');
                      setSearchOpen(false);
                    }}
                  >
                    <div>
                      <div className={styles.resultTitle}>{p.name}</div>
                      <div className={styles.resultSnippet}>{p.description}</div>
                    </div>
                    <Badge variant={p.health === 'on_track' ? 'success' : p.health === 'at_risk' ? 'warning' : 'critical'} size="sm">
                      {p.health.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {matchedTasks.length > 0 && (
              <div className={styles.searchSection}>
                <div className={styles.sectionHeading}>
                  <CheckSquare size={13} />
                  <span>Tasks</span>
                </div>
                {matchedTasks.map((t) => (
                  <div
                    key={t.id}
                    className={styles.searchResultItem}
                    onClick={() => {
                      setSelectedDrawerTaskId(t.id);
                      setSearchOpen(false);
                    }}
                  >
                    <div>
                      <div className={styles.resultTitle}>{t.title}</div>
                      <div className={styles.resultSnippet}>{t.description}</div>
                    </div>
                    <Badge variant={t.isBlocked ? 'critical' : t.status === 'done' ? 'success' : 'default'} size="sm">
                      {t.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {matchedDecisions.length > 0 && (
              <div className={styles.searchSection}>
                <div className={styles.sectionHeading}>
                  <BookOpenCheck size={13} />
                  <span>Decisions</span>
                </div>
                {matchedDecisions.map((d) => (
                  <div
                    key={d.id}
                    className={styles.searchResultItem}
                    onClick={() => {
                      onSelectTab('decisions');
                      setSearchOpen(false);
                    }}
                  >
                    <div>
                      <div className={styles.resultTitle}>#{d.decisionNumber} — {d.title}</div>
                      <div className={styles.resultSnippet}>{d.reason}</div>
                    </div>
                    <Badge variant={d.status === 'active' ? 'intel' : 'default'} size="sm">
                      {d.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Quick Task Creation Modal */}
      <Modal
        isOpen={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        title="Create New Task"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateTaskOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateTask}>
              Create Task
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateTask} className={styles.createTaskForm}>
          <Input
            label="Task Title"
            required
            placeholder="e.g. Implement biometric sign-in flow"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />

          <Textarea
            label="Description & Context"
            placeholder="Provide context, acceptance criteria, or requirements..."
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />

          <div className={styles.formRow}>
            <Select
              label="Project"
              options={projects.map((p) => ({ value: p.id, label: p.name }))}
              value={taskProjectId}
              onChange={(e) => setTaskProjectId(e.target.value)}
            />

            <Select
              label="Assignee"
              options={users.map((u) => ({ value: u.id, label: `${u.name} (${u.role})` }))}
              value={taskAssigneeId}
              onChange={(e) => setTaskAssigneeId(e.target.value)}
            />
          </div>

          <div className={styles.formRow}>
            <Select
              label="Priority"
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
            />

            <Input
              label="Due Date"
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
            />
          </div>

          {/* Scope Source Attribution (PRD FR-SCOPE-04) */}
          <Select
            label="Scope Origin (Scope Creep Radar)"
            helperText="Attributing scope prevents unexplained additions to baseline."
            options={[
              { value: 'unknown', label: 'Standard Planned Work / Unknown' },
              { value: 'client_request', label: 'Client Request' },
              { value: 'internal_request', label: 'Internal Team Request' },
              { value: 'technical_change', label: 'Technical Necessity' },
            ]}
            value={taskScopeSource}
            onChange={(e) => setTaskScopeSource(e.target.value as ScopeSource)}
          />
        </form>
      </Modal>

      {/* Context Recovery Drawer ("What Changed?") */}
      <ContextRecoveryDrawer
        isOpen={contextRecoveryOpen}
        onClose={() => setContextRecoveryOpen(false)}
        onOpenTask={(id) => setSelectedDrawerTaskId(id)}
        onEnterFocusMode={() => {
          setContextRecoveryOpen(false);
          onSelectTab('focus-mode');
        }}
      />

      {/* Global Task Detail Drawer */}
      <TaskDetailDrawer
        taskId={selectedDrawerTaskId}
        isOpen={Boolean(selectedDrawerTaskId)}
        onClose={() => setSelectedDrawerTaskId(null)}
        onOpenTask={(id) => setSelectedDrawerTaskId(id)}
      />

      {/* Guided Evaluator Tour */}
      <GuidedTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigateToTab={onSelectTab}
      />
    </div>
  );
};
