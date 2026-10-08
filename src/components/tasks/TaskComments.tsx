import React, { useState } from 'react';
import { MessageSquare, History, Send } from 'lucide-react';
import { Task, Comment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import { Button } from '../ui/Button';
import styles from './TaskDetailDrawer.module.css';

interface TaskCommentsProps {
  task: Task;
}

export const TaskComments: React.FC<TaskCommentsProps> = ({ task }) => {
  const { currentUser, users } = useAuth();
  const { activities, organization } = useOrg();
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    {
      id: `comm-1`,
      organizationId: organization.id,
      projectId: task.projectId,
      taskId: task.id,
      authorId: 'user-rahul',
      body: 'Please make sure to document any partner security compliance requirements in the task description.',
      mentionedUserIds: ['user-maya'],
      createdAt: '2026-10-04T14:30:00Z',
    },
  ]);

  // Filter activities related to this task
  const taskActivities = activities.filter((a) => a.entityId === task.id || a.projectId === task.projectId);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    // Check for @mentions
    const mentioned: string[] = [];
    users.forEach((u) => {
      const handle = `@${u.name.split(' ')[0].toLowerCase()}`;
      if (commentText.toLowerCase().includes(handle)) {
        mentioned.push(u.id);
      }
    });

    const newComment: Comment = {
      id: `comm-${Date.now().toString(36)}`,
      organizationId: organization.id,
      projectId: task.projectId,
      taskId: task.id,
      authorId: currentUser.id,
      body: commentText.trim(),
      mentionedUserIds: mentioned,
      createdAt: new Date().toISOString(),
    };

    setComments([...comments, newComment]);
    setCommentText('');
  };

  const getUser = (id: string) => users.find((u) => u.id === id);

  return (
    <div className={styles.sectionBlock}>
      {/* Sub-Tabs: Comments vs Activity Feed */}
      <div className={styles.commentTabs}>
        <button
          type="button"
          className={`${styles.commentTabBtn} ${activeTab === 'comments' ? styles.commentTabActive : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          <MessageSquare size={13} />
          <span>Comments ({comments.length})</span>
        </button>

        <button
          type="button"
          className={`${styles.commentTabBtn} ${activeTab === 'activity' ? styles.commentTabActive : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <History size={13} />
          <span>Activity Audit ({taskActivities.length})</span>
        </button>
      </div>

      {activeTab === 'comments' ? (
        <div className={styles.commentsContainer}>
          <div className={styles.commentsList}>
            {comments.map((comm) => {
              const author = getUser(comm.authorId);
              return (
                <div key={comm.id} className={styles.commentItem}>
                  <img
                    src={author?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80'}
                    alt={author?.name || 'User'}
                    className={styles.commentAvatar}
                  />
                  <div className={styles.commentBubble}>
                    <div className={styles.commentMeta}>
                      <span className={styles.commentAuthor}>{author?.name || 'Team Member'}</span>
                      <span className={styles.commentTime}>
                        {new Date(comm.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className={styles.commentBody}>{comm.body}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* New Comment Input */}
          <form onSubmit={handleAddComment} className={styles.addCommentForm}>
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className={styles.commentAvatarSmall}
            />
            <div className={styles.commentInputWrapper}>
              <textarea
                placeholder="Write a comment or update (use @rahul, @priya to mention)..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={2}
                className={styles.commentTextarea}
              />
              <div className={styles.commentActions}>
                <span className={styles.commentHint}>Press Enter or click Send</span>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={!commentText.trim()}
                  rightIcon={<Send size={12} />}
                >
                  Send
                </Button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        /* Immutable Activity History */
        <div className={styles.activityFeed}>
          {taskActivities.length === 0 ? (
            <div className={styles.depEmpty}>No historical activity recorded yet.</div>
          ) : (
            taskActivities.map((act) => {
              const actor = getUser(act.actorId);
              return (
                <div key={act.id} className={styles.activityItem}>
                  <div className={styles.activityDot} />
                  <div className={styles.activityContent}>
                    <span className={styles.activityActor}>{actor?.name || 'System'}:</span>{' '}
                    <span className={styles.activityAction}>{act.action}</span>
                    <span className={styles.activityTime}>
                      {new Date(act.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
