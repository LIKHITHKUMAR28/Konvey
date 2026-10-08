import React from 'react';
import { Users2, FolderKanban, CheckSquare, ShieldCheck, Mail } from 'lucide-react';
import { useOrg } from '../../context/OrgContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import styles from './Teams.module.css';

export const TeamsView: React.FC = () => {
  const { teams, projects, tasks } = useOrg();
  const { users } = useAuth();

  const getUser = (id: string) => users.find((u) => u.id === id);

  return (
    <div className={styles.teamsContainer}>
      <div className={styles.header}>
        <h2>Teams & Squads</h2>
        <p className={styles.subtitle}>
          Workspace teams, leads, and active project assignments.
        </p>
      </div>

      <div className={styles.teamsGrid}>
        {teams.map((team) => {
          const teamProjects = projects.filter((p) => p.teamIds?.includes(team.id));
          const teamMembers = users.filter((u) => team.memberIds?.includes(u.id));
          const teamTasks = tasks.filter((t) => teamProjects.some((p) => p.id === t.projectId));
          const manager = team.managerIds?.[0] ? getUser(team.managerIds[0]) : null;

          return (
            <Card key={team.id} variant="default" padding="lg">
              <div className={styles.teamCardHeader}>
                <div className={styles.teamTitleRow}>
                  <div className={styles.teamIconBadge} style={{ backgroundColor: `${team.color || '#2563EB'}15`, color: team.color || '#2563EB' }}>
                    <Users2 size={20} />
                  </div>
                  <div>
                    <h3 className={styles.teamName}>{team.name}</h3>
                    <p className={styles.teamDesc}>{team.description}</p>
                  </div>
                </div>

                <Badge variant="primary" size="sm">
                  {teamMembers.length} Members
                </Badge>
              </div>

              {/* Team Stats Strip */}
              <div className={styles.statsStrip}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Team Lead</span>
                  <span className={styles.statValue}>{manager?.name || 'Unassigned'}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Active Projects</span>
                  <span className={styles.statValue}>{teamProjects.length} initiatives</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Total Tasks</span>
                  <span className={styles.statValue}>{teamTasks.length} work items</span>
                </div>
              </div>

              {/* Members Roster */}
              <div className={styles.rosterSection}>
                <div className={styles.rosterTitle}>TEAM MEMBERS</div>
                <div className={styles.membersList}>
                  {teamMembers.map((member) => (
                    <div key={member.id} className={styles.memberRow}>
                      <img src={member.avatarUrl} alt={member.name} className={styles.avatar} />
                      <div className={styles.memberInfo}>
                        <div className={styles.memberNameRow}>
                          <span className={styles.memberName}>{member.name}</span>
                          <span className={styles.memberRoleTag}>{member.role}</span>
                        </div>
                        <span className={styles.memberEmail}>
                          <Mail size={11} /> {member.email}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Associated Projects */}
              <div className={styles.projectsSection}>
                <div className={styles.rosterTitle}>ASSOCIATED INITIATIVES</div>
                <div className={styles.projectPills}>
                  {teamProjects.map((proj) => (
                    <div key={proj.id} className={styles.projectPill}>
                      <FolderKanban size={13} color="var(--primary-600)" />
                      <span>{proj.name}</span>
                      <Badge
                        variant={proj.health === 'on_track' ? 'success' : proj.health === 'at_risk' ? 'warning' : 'critical'}
                        size="sm"
                      >
                        {proj.health.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
