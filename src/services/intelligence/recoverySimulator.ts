import { Project, Task, RecoveryOption, RecoveryStrategyType } from '../../types';

export function simulateRecoveryOptions(
  project: Project,
  projectTasks: Task[],
  estimatedDelayDays: number
): RecoveryOption[] {
  const activeTasks = projectTasks.filter((t) => t.status !== 'done');
  const lowPriorityTasks = activeTasks.filter((t) => t.priority === 'low' || t.priority === 'medium');

  return [
    {
      id: 'rec-parallel',
      type: 'parallelize_work' as RecoveryStrategyType,
      title: 'Strategy 1: Parallelize UI & Mock Integrations',
      description: 'Decouple frontend checkout UI work from live banking credentials using an agreed mock contract stub.',
      proposedChanges: [
        'Allow Priya and Aarav to complete checkout UI against mock gateway responses',
        'Do not wait for 3rd-party banking approval to start integration tests',
        'Schedule end-to-end sandbox validation as the final milestone step',
      ],
      potentialTimeSavedDays: 4,
      tradeOffs: [
        'Requires 1 additional day of integration testing once real sandbox keys arrive',
        'Small risk of schema drift if mock spec deviates from production API',
      ],
      confidence: 0.91,
      tasksAffectedCount: 2,
    },
    {
      id: 'rec-scope',
      type: 'reduce_scope' as RecoveryStrategyType,
      title: 'Strategy 2: Defer Client Biometric Unlock to v2.1',
      description: 'Postpone the recently added biometric unlock requirement to a follow-up patch release.',
      proposedChanges: [
        'Move Task #103 (Biometric Face Unlock) out of current milestone',
        'Focus engineering exclusively on core payment completion',
        'Reduces required sprint scope by 12 developer hours',
      ],
      potentialTimeSavedDays: 3,
      tradeOffs: [
        'Requires communication with client regarding phased feature rollout',
        'Biometric authentication delivered in sprint following launch',
      ],
      confidence: 0.88,
      tasksAffectedCount: 1,
    },
    {
      id: 'rec-resources',
      type: 'add_resources' as RecoveryStrategyType,
      title: 'Strategy 3: Allocate Secondary Frontend Engineer',
      description: 'Assign Aarav Patel full-time to assist on checkout drawer implementation.',
      proposedChanges: [
        'Reassign offline synchronization tasks to sprint backlog',
        'Pair Aarav directly with Maya to clear gateway contract questions',
      ],
      potentialTimeSavedDays: 4,
      tradeOffs: [
        'Slight context switching overhead for Aarav during day 1',
        'Defers offline basket caching deliverable',
      ],
      confidence: 0.84,
      tasksAffectedCount: 3,
    },
    {
      id: 'rec-deadline',
      type: 'extend_deadline' as RecoveryStrategyType,
      title: 'Strategy 4: Extend Target Delivery by 7 Days',
      description: 'Revise target delivery date from 24 Oct to 31 Oct, absorbing partner approval delay without sacrificing scope.',
      proposedChanges: [
        'Move project target date to 31 Oct 2026',
        'Preserve all planned client features and offline capabilities',
        'Allows thorough QA and security sign-off before public release',
      ],
      potentialTimeSavedDays: estimatedDelayDays || 7,
      tradeOffs: [
        'Pushes release date by 1 calendar week',
        'Stakeholder notification required',
      ],
      confidence: 0.98,
      tasksAffectedCount: projectTasks.length,
    },
  ];
}
