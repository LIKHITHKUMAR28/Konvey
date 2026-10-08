import React, { useState, useEffect } from 'react';
import {
  Zap,
  CheckCircle2,
  Bell,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Square,
  Play,
  Pause,
} from 'lucide-react';
import { Task } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import styles from './Intelligence.module.css';

interface FocusModeViewProps {
  onExitFocusMode: () => void;
}

export const FocusModeView: React.FC<FocusModeViewProps> = ({ onExitFocusMode }) => {
  const { currentUser } = useAuth();
  const {
    tasks,
    updateTask,
    activeFocusSession,
    startFocusSession,
    endFocusSession,
    heldNotifications,
  } = useOrg();

  const userTasks = tasks.filter((t) => t.assigneeId === currentUser.id && t.status !== 'done');
  const [selectedTaskId, setSelectedTaskId] = useState<string>(userTasks[0]?.id || '');
  const [sessionMinutes, setSessionMinutes] = useState<number>(25);

  // Timer state
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);

  // If focus session starts
  const handleStartSession = () => {
    startFocusSession([selectedTaskId], sessionMinutes);
    setSecondsRemaining(sessionMinutes * 60);
    setTimerRunning(true);
    setSessionCompleted(false);
  };

  const handleEndSession = () => {
    setTimerRunning(false);
    endFocusSession();
    setSessionCompleted(true);
  };

  useEffect(() => {
    let interval: any = null;
    if (timerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            setSessionCompleted(true);
            endFocusSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, secondsRemaining, endFocusSession]);

  const activeTask = tasks.find((t) => t.id === selectedTaskId) || userTasks[0];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleToggleChecklist = (checkId: string) => {
    if (!activeTask || !activeTask.checklist) return;
    const updated = activeTask.checklist.map((c) => (c.id === checkId ? { ...c, completed: !c.completed } : c));
    updateTask(activeTask.id, { checklist: updated });
  };

  const handleMarkTaskDone = () => {
    if (!activeTask) return;
    updateTask(activeTask.id, { status: 'done' });
  };

  return (
    <div className={styles.focusContainer}>
      {/* Distraction-Free Header */}
      <div className={styles.focusHeader}>
        <div className={styles.focusBrand}>
          <Zap size={16} color="var(--primary-600)" />
          <span className={styles.focusTitle}>Focus Session</span>
        </div>

        <button type="button" className={styles.exitFocusBtn} onClick={onExitFocusMode}>
          Exit
        </button>
      </div>

      {!activeFocusSession && !sessionCompleted ? (
        /* Configuration Stage */
        <div className={styles.focusSetupCard}>
          <h2>Protect Your Focus</h2>
          <p className={styles.focusSubtitle}>
            Select a task to work on. Workspace notifications will be held quietly until your session ends.
          </p>

          <div className={styles.setupField}>
            <label className={styles.setupLabel}>Primary Focus Task</label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className={styles.setupSelect}
            >
              {userTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.priority})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.setupField}>
            <label className={styles.setupLabel}>Session Duration</label>
            <div className={styles.durationOptions}>
              {[25, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  className={`${styles.durationBtn} ${sessionMinutes === mins ? styles.durationActive : ''}`}
                  onClick={() => setSessionMinutes(mins)}
                >
                  {mins} Minutes
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="intel"
            size="lg"
            leftIcon={<Zap size={16} />}
            onClick={handleStartSession}
            style={{ width: '100%', marginTop: '16px' }}
          >
            Start Distraction-Free Focus Session
          </Button>
        </div>
      ) : activeFocusSession && !sessionCompleted ? (
        /* Active Focus Running */
        <div className={styles.activeFocusSpace}>
          {/* Ambient Timer Display */}
          <div className={styles.timerDisplay}>
            <div className={styles.timerDigits}>{formatTime(secondsRemaining)}</div>
            <div className={styles.timerSub}>
              {timerRunning ? 'Deep Focus Active' : 'Session Paused'} • Non-critical alerts held
            </div>
          </div>

          {/* Active Work Card */}
          {activeTask && (
            <div className={styles.focusedTaskCard}>
              <div className={styles.focusedTaskTop}>
                <span className={styles.focusedPriority}>{activeTask.priority.toUpperCase()}</span>
                <Badge variant={activeTask.status === 'done' ? 'success' : 'primary'} size="sm">
                  {activeTask.status.replace('_', ' ')}
                </Badge>
              </div>

              <h2 className={styles.focusedTaskTitle}>{activeTask.title}</h2>
              <p className={styles.focusedTaskDesc}>{activeTask.description || 'Focus exclusively on delivering this component.'}</p>

              {/* Subtasks Checklist */}
              {activeTask.checklist && activeTask.checklist.length > 0 && (
                <div className={styles.focusedChecklist}>
                  <div className={styles.checklistTitle}>Checklist Milestones</div>
                  {activeTask.checklist.map((c) => (
                    <div key={c.id} className={styles.focusedCheckItem}>
                      <input
                        type="checkbox"
                        checked={c.completed}
                        onChange={() => handleToggleChecklist(c.id)}
                        id={`focus-c-${c.id}`}
                        className={styles.checkInput}
                      />
                      <label htmlFor={`focus-c-${c.id}`} className={c.completed ? styles.checkDone : ''}>
                        {c.text}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.focusedActions}>
                {activeTask.status !== 'done' && (
                  <Button
                    variant="primary"
                    size="md"
                    leftIcon={<CheckCircle2 size={15} />}
                    onClick={handleMarkTaskDone}
                  >
                    Mark Deliverable Complete
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setTimerRunning(!timerRunning)}
                >
                  {timerRunning ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Resume</>}
                </Button>
                <Button variant="tertiary" size="md" onClick={handleEndSession}>
                  End Focus Session
                </Button>
              </div>
            </div>
          )}

          {/* Held Notifications Counter Banner */}
          <div className={styles.heldCounterBanner}>
            <ShieldCheck size={16} color="var(--intel-600)" />
            <span>
              Notification Shield active. Critical alerts bypass, routine notifications held for session debrief.
            </span>
          </div>
        </div>
      ) : (
        /* Debrief Summary (PRD Section 6.11: Post-session debrief) */
        <div className={styles.debriefCard}>
          <div className={styles.debriefIcon}>
            <CheckCircle2 size={32} color="var(--success)" />
          </div>
          <h2>Focus Session Completed</h2>
          <p className={styles.debriefSubtitle}>
            Great job! You maintained uninterrupted concentration for {sessionMinutes} minutes.
          </p>

          <div className={styles.debriefStats}>
            <div className={styles.debriefStatItem}>
              <span className={styles.debriefVal}>{sessionMinutes}m</span>
              <span className={styles.debriefLbl}>Focus Time</span>
            </div>
            <div className={styles.debriefStatItem}>
              <span className={styles.debriefVal}>
                {activeTask?.checklist?.filter((c) => c.completed).length || 0}
              </span>
              <span className={styles.debriefLbl}>Milestones Completed</span>
            </div>
            <div className={styles.debriefStatItem}>
              <span className={styles.debriefVal}>{heldNotifications.length}</span>
              <span className={styles.debriefLbl}>Notifications Held</span>
            </div>
          </div>

          <div className={styles.debriefActions}>
            <Button variant="primary" size="md" onClick={onExitFocusMode}>
              Return to Workspace
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setSessionCompleted(false);
                handleStartSession();
              }}
            >
              Start Another Session
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
