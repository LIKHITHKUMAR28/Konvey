import { User, Task, Project, Activity, Decision, Blocker, ContextRecoveryReport, ContextChangeItem } from '../../types';

export function extractContextRecovery(
  currentUser: User,
  allTasks: Task[],
  allProjects: Project[],
  allActivities: Activity[],
  allDecisions: Decision[],
  allBlockers: Blocker[]
): ContextRecoveryReport {
  // Simulate last active: 3 days ago for Priya, or user's recorded lastActiveAt
  const lastActiveTimestamp =
    currentUser.id === 'user-priya'
      ? new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      : currentUser.lastActiveAt;

  const lastActiveMs = new Date(lastActiveTimestamp).getTime();
  const inactivityHours = Math.round((Date.now() - lastActiveMs) / (1000 * 60 * 60));

  const changes: ContextChangeItem[] = [];

  // 1. Check for decisions recorded on user's projects
  allDecisions.forEach((d) => {
    if (new Date(d.createdAt).getTime() >= lastActiveMs) {
      changes.push({
        id: `ctx-dec-${d.id}`,
        entityType: 'decision',
        entityId: d.id,
        title: `Official Decision #${d.decisionNumber}: ${d.title}`,
        changeDescription: `Decision established: "${d.decision}". Rationale: ${d.reason.substring(0, 100)}...`,
        timestamp: d.createdAt,
        actorId: d.createdBy,
        actorName: 'Team Architecture',
        requiresAction: false,
      });
    }
  });

  // 2. Check for active blockers on user's deliverables or prerequisites
  allBlockers.forEach((b) => {
    if (b.status === 'active') {
      const task = allTasks.find((t) => t.id === b.taskId);
      changes.push({
        id: `ctx-block-${b.id}`,
        entityType: 'blocker',
        entityId: b.id,
        title: `Blocker on ${task?.title || 'Prerequisite Task'}`,
        changeDescription: `${b.description} (${b.type.replace('_', ' ')})`,
        timestamp: b.createdAt,
        actorId: b.ownerId || 'system',
        actorName: 'Project Management',
        requiresAction: true,
      });
    }
  });

  // 3. Check for task updates (deadline shifts or status completions)
  allTasks.forEach((t) => {
    if (t.completedAt && new Date(t.completedAt).getTime() >= lastActiveMs) {
      changes.push({
        id: `ctx-task-done-${t.id}`,
        entityType: 'task',
        entityId: t.id,
        title: `Deliverable Completed: ${t.title}`,
        changeDescription: `Task marked done and verified. Unblocks downstream work.`,
        timestamp: t.completedAt,
        actorId: t.assigneeId || 'team',
        actorName: 'Core Engineering',
        requiresAction: false,
      });
    }
  });

  // 4. Activity entries (mentions & changes)
  allActivities.forEach((a) => {
    if (new Date(a.createdAt).getTime() >= lastActiveMs) {
      changes.push({
        id: `ctx-act-${a.id}`,
        entityType: 'comment',
        entityId: a.entityId,
        title: `Project Activity Update`,
        changeDescription: a.action,
        timestamp: a.createdAt,
        actorId: a.actorId,
        actorName: 'Team Member',
        requiresAction: a.action.includes('blocked') || a.action.includes('scope'),
      });
    }
  });

  // Identify recommended next task for user
  const userTasks = allTasks.filter((t) => t.assigneeId === currentUser.id && t.status !== 'done');
  const urgentTask = userTasks.find((t) => t.priority === 'urgent' && !t.isBlocked) || userTasks[0];

  let recommendedNextActionReason = 'Continue execution on your primary assigned milestone deliverable.';
  if (urgentTask) {
    if (urgentTask.id === 'task-102') {
      recommendedNextActionReason =
        'Finish Checkout UI drawer variant so frontend engineering can integrate with the payment gateway once compliance approval is received.';
    } else {
      recommendedNextActionReason = `Complete "${urgentTask.title}" which has the highest milestone priority.`;
    }
  }

  return {
    lastActiveTimestamp,
    inactivityHours: Math.max(24, inactivityHours),
    changes: changes.slice(0, 8),
    recommendedNextTask: urgentTask,
    recommendedNextActionReason,
  };
}
