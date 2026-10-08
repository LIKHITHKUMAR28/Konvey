import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Flag, AlertTriangle } from 'lucide-react';
import { useOrg } from '../../context/OrgContext';
import styles from './Views.module.css';

interface ProjectCalendarViewProps {
  projectId: string;
  onOpenTask: (taskId: string) => void;
}

export const ProjectCalendarView: React.FC<ProjectCalendarViewProps> = ({ projectId, onOpenTask }) => {
  const { tasks, projects } = useOrg();
  const project = projects.find((p) => p.id === projectId);
  const projectTasks = tasks.filter((t) => t.projectId === projectId && t.dueDate);

  // Focus on current or October 2026 month
  const [currentDate, setCurrentDate] = useState(new Date('2026-10-01'));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date('2026-10-01'));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Render day cells
  const dayCells = [];
  // Blanks before first day
  for (let i = 0; i < firstDayOfMonth; i++) {
    dayCells.push(<div key={`blank-${i}`} className={styles.calendarDayBlank} />);
  }

  // Days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTasks = projectTasks.filter((t) => t.dueDate === dateStr);
    const dayMilestones = project?.milestones?.filter((m) => m.targetDate === dateStr) || [];
    const isToday = day === 6 && month === 9 && year === 2026; // Oct 6 2026

    dayCells.push(
      <div key={`day-${day}`} className={`${styles.calendarDay} ${isToday ? styles.calendarDayToday : ''}`}>
        <div className={styles.dayHeader}>
          <span className={`${styles.dayNumber} ${isToday ? styles.dayNumberToday : ''}`}>{day}</span>
          {isToday && <span className={styles.todayLabel}>Today</span>}
        </div>

        {/* Milestones on this day */}
        {dayMilestones.map((m) => (
          <div key={m.id} className={styles.milestonePill} title={`Milestone: ${m.title}`}>
            <Flag size={11} />
            <span>{m.title}</span>
          </div>
        ))}

        {/* Tasks on this day */}
        <div className={styles.dayTasksList}>
          {dayTasks.map((task) => (
            <div
              key={task.id}
              className={`${styles.calendarTaskPill} ${task.isBlocked ? styles.pillBlocked : ''} ${task.status === 'done' ? styles.pillDone : ''}`}
              onClick={() => onOpenTask(task.id)}
              title={`${task.title} (${task.status})`}
            >
              {task.isBlocked && <AlertTriangle size={11} className={styles.pillIcon} />}
              <span className={styles.pillTitle}>{task.title}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.calendarContainer}>
      {/* Calendar Header Navigation */}
      <div className={styles.calendarNav}>
        <div className={styles.calendarMonthHeading}>
          <h2>{monthName}</h2>
          <span className={styles.calendarSubText}>{projectTasks.length} tasks scheduled</span>
        </div>

        <div className={styles.calendarNavButtons}>
          <button type="button" className={styles.navBtn} onClick={handlePrevMonth} aria-label="Previous month">
            <ChevronLeft size={16} />
          </button>
          <button type="button" className={styles.todayBtn} onClick={handleToday}>
            Today
          </button>
          <button type="button" className={styles.navBtn} onClick={handleNextMonth} aria-label="Next month">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday Names */}
      <div className={styles.weekdayGrid}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className={styles.weekdayHeader}>
            {d}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className={styles.daysGrid}>{dayCells}</div>
    </div>
  );
};
