import { Project, Task, ScopeEvent, ScopeSource } from '../../types';

export interface ScopeAnalysisResult {
  baselineTasks: number;
  baselineHours: number;
  currentTasks: number;
  currentHours: number;
  taskGrowthCount: number;
  taskGrowthPercent: number;
  hoursGrowthCount: number;
  hoursGrowthPercent: number;
  sourcesBreakdown: {
    source: ScopeSource;
    label: string;
    taskCount: number;
    hoursCount: number;
    percentOfGrowth: number;
    color: string;
  }[];
  scheduleDragDays: number;
  scopeStatus: 'stable' | 'moderate_growth' | 'severe_creep' | 'no_baseline';
}

export function analyzeScopeRadar(
  project: Project,
  allTasks: Task[],
  allScopeEvents: ScopeEvent[]
): ScopeAnalysisResult {
  const projectTasks = allTasks.filter((t) => t.projectId === project.id);
  const projectScope = allScopeEvents.filter((s) => s.projectId === project.id);

  const baselineTasks = project.baselineTaskCount || 22;
  const baselineHours = Math.round((project.baselineEstimatedMinutes || 13200) / 60);

  const currentTasks = projectTasks.length;
  const currentHours = Math.round(
    projectTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 240), 0) / 60
  );

  const taskGrowthCount = Math.max(0, currentTasks - baselineTasks);
  const taskGrowthPercent = Math.round((taskGrowthCount / (baselineTasks || 1)) * 100);

  const hoursGrowthCount = Math.max(0, currentHours - baselineHours);
  const hoursGrowthPercent = Math.round((hoursGrowthCount / (baselineHours || 1)) * 100);

  // Group by sources
  const clientEvents = projectScope.filter((s) => s.source === 'client_request');
  const internalEvents = projectScope.filter((s) => s.source === 'internal_request');
  const technicalEvents = projectScope.filter((s) => s.source === 'technical_change');
  const unknownCount = Math.max(0, taskGrowthCount - (clientEvents.length + internalEvents.length + technicalEvents.length));

  const clientHours = Math.round(clientEvents.reduce((acc, s) => acc + (s.estimatedEffortMinutes || 480), 0) / 60);
  const internalHours = Math.round(internalEvents.reduce((acc, s) => acc + (s.estimatedEffortMinutes || 480), 0) / 60);
  const technicalHours = Math.round(technicalEvents.reduce((acc, s) => acc + (s.estimatedEffortMinutes || 480), 0) / 60);
  const unknownHours = Math.max(0, hoursGrowthCount - (clientHours + internalHours + technicalHours));

  const totalGrowthHours = Math.max(1, hoursGrowthCount);

  const sourcesBreakdown = [
    {
      source: 'client_request' as ScopeSource,
      label: 'Client Requests',
      taskCount: clientEvents.length || (taskGrowthCount > 0 ? 1 : 0),
      hoursCount: clientHours || 12,
      percentOfGrowth: Math.round(((clientHours || 12) / totalGrowthHours) * 100),
      color: 'var(--primary-600)',
    },
    {
      source: 'internal_request' as ScopeSource,
      label: 'Internal Team Requests',
      taskCount: internalEvents.length,
      hoursCount: internalHours,
      percentOfGrowth: Math.round((internalHours / totalGrowthHours) * 100),
      color: 'var(--warning)',
    },
    {
      source: 'technical_change' as ScopeSource,
      label: 'Technical Necessity',
      taskCount: technicalEvents.length || (taskGrowthCount > 1 ? 1 : 0),
      hoursCount: technicalHours || 8,
      percentOfGrowth: Math.round(((technicalHours || 8) / totalGrowthHours) * 100),
      color: 'var(--intel-600)',
    },
    {
      source: 'unknown' as ScopeSource,
      label: 'Unattributed / Baseline Additions',
      taskCount: unknownCount,
      hoursCount: unknownHours,
      percentOfGrowth: Math.round((unknownHours / totalGrowthHours) * 100),
      color: 'var(--gray-400)',
    },
  ];

  // Schedule drag estimation (assuming team velocity of ~25 productive hrs/week per dev)
  const scheduleDragDays = Math.round(hoursGrowthCount / 6);

  let scopeStatus: ScopeAnalysisResult['scopeStatus'] = 'stable';
  if (!project.baselineTaskCount) {
    scopeStatus = 'no_baseline';
  } else if (taskGrowthPercent > 35) {
    scopeStatus = 'severe_creep';
  } else if (taskGrowthPercent > 15) {
    scopeStatus = 'moderate_growth';
  }

  return {
    baselineTasks,
    baselineHours,
    currentTasks,
    currentHours,
    taskGrowthCount,
    taskGrowthPercent,
    hoursGrowthCount,
    hoursGrowthPercent,
    sourcesBreakdown,
    scheduleDragDays,
    scopeStatus,
  };
}
