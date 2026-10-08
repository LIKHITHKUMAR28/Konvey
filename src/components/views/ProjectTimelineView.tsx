import React from 'react';
import { Flag, GitFork, AlertTriangle, Calendar } from 'lucide-react';
import { useOrg } from '../../context/OrgContext';
import styles from './Views.module.css';

interface ProjectTimelineViewProps {
  projectId: string;
  onOpenTask: (taskId: string) => void;
}

export const ProjectTimelineView: React.FC<ProjectTimelineViewProps> = ({ projectId, onOpenTask }) => {
  const { tasks, projects, dependencies } = useOrg();
  const project = projects.find((p) => p.id === projectId);
  const projectTasks = tasks.filter((t) => t.projectId === projectId);

  // Timeline base window: Sept 20 to Oct 31, 2026 (42 days)
  const startDateMs = new Date('2026-09-20').getTime();
  const endDateMs = new Date('2026-10-31').getTime();
  const totalDays = Math.round((endDateMs - startDateMs) / (1000 * 60 * 60 * 24));

  // Helper to convert date string to percentage position
  const getPercent = (dateStr?: string, fallbackOffset = 0) => {
    if (!dateStr) return fallbackOffset;
    const dateMs = new Date(dateStr).getTime();
    const clamped = Math.max(startDateMs, Math.min(endDateMs, dateMs));
    const offsetDays = (clamped - startDateMs) / (1000 * 60 * 60 * 24);
    return Math.max(2, Math.min(96, (offsetDays / totalDays) * 100));
  };

  const todayPercent = getPercent('2026-10-06');

  // Days marker labels (every 5 days)
  const dayMarkers = [
    { label: 'Sep 25', percent: getPercent('2026-09-25') },
    { label: 'Oct 01', percent: getPercent('2026-10-01') },
    { label: 'Oct 08', percent: getPercent('2026-10-08') },
    { label: 'Oct 15', percent: getPercent('2026-10-15') },
    { label: 'Oct 22', percent: getPercent('2026-10-22') },
    { label: 'Oct 29', percent: getPercent('2026-10-29') },
  ];

  return (
    <div className={styles.timelineContainer}>
      {/* Header Info */}
      <div className={styles.timelineHeaderInfo}>
        <div className={styles.timelineTitleGroup}>
          <h3>Timeline & Dependency Flow</h3>
          <span className={styles.timelineSubText}>
            Visual schedule showing task duration spans and prerequisite relationships.
          </span>
        </div>

        <div className={styles.timelineLegend}>
          <span className={styles.legendItem}>
            <span className={`${styles.legendColor} ${styles.legendBlocked}`} /> Blocked / Risk
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendColor} ${styles.legendProgress}`} /> In Progress
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendColor} ${styles.legendDone}`} /> Done
          </span>
        </div>
      </div>

      <div className={styles.ganttWrapper}>
        {/* Left Tasks Names Column */}
        <div className={styles.ganttLeftRail}>
          <div className={styles.ganttRailHeader}>Task</div>
          {projectTasks.map((t) => (
            <div
              key={t.id}
              className={styles.ganttRailRow}
              onClick={() => onOpenTask(t.id)}
              title={t.title}
            >
              {t.isBlocked && <AlertTriangle size={13} className={styles.blockerIcon} />}
              <span className={styles.railTaskTitle}>{t.title}</span>
            </div>
          ))}
        </div>

        {/* Right Gantt Chart Grid Area */}
        <div className={styles.ganttChartArea}>
          {/* Time axis header */}
          <div className={styles.timeAxisHeader}>
            {dayMarkers.map((m) => (
              <span
                key={m.label}
                className={styles.axisLabel}
                style={{ left: `${m.percent}%` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Today vertical line */}
          <div className={styles.todayLine} style={{ left: `${todayPercent}%` }}>
            <span className={styles.todayFlag}>Today</span>
          </div>

          {/* Milestone markers */}
          {project?.milestones?.map((m) => {
            const mPercent = getPercent(m.targetDate);
            return (
              <div
                key={m.id}
                className={styles.timelineMilestoneLine}
                style={{ left: `${mPercent}%` }}
                title={`Milestone: ${m.title} (${m.targetDate})`}
              >
                <div className={styles.milestoneMarkerFlag}>
                  <Flag size={12} />
                  <span>{m.title}</span>
                </div>
              </div>
            );
          })}

          {/* Task Gantt Bar Rows */}
          {projectTasks.map((task) => {
            const startP = getPercent(task.startDate, 10);
            const dueP = getPercent(task.dueDate, startP + 15);
            const widthP = Math.max(5, dueP - startP);

            const hasDeps = dependencies.some(
              (d) => d.sourceTaskId === task.id || d.targetTaskId === task.id
            );

            return (
              <div key={task.id} className={styles.ganttRow}>
                <div
                  className={`${styles.ganttBar} ${styles[`bar-${task.status}`]} ${task.isBlocked ? styles.barBlocked : ''}`}
                  style={{ left: `${startP}%`, width: `${widthP}%` }}
                  onClick={() => onOpenTask(task.id)}
                  title={`${task.title} (${task.startDate || 'No start'} to ${task.dueDate || 'No due'})`}
                >
                  <span className={styles.barLabel}>{task.title}</span>
                  {hasDeps && <GitFork size={11} className={styles.barDepIcon} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
