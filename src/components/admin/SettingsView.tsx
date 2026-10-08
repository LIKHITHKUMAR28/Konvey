import React, { useState } from 'react';
import {
  Building2,
  Users,
  ShieldCheck,
  History,
  Database,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  FileText,
  UserCheck,
  LogOut,
  UserPlus,
  Trash2,
} from 'lucide-react';
import { useOrg } from '../../context/OrgContext';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../services/permissionService';
import { UserRole } from '../../types';
import { useToast } from '../ui/Toast';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { RolePermissionMatrix } from './RolePermissionMatrix';
import { AuditLogTable } from './AuditLogTable';
import styles from './Settings.module.css';

export const SettingsView: React.FC = () => {
  const { users, currentUser, logout, addMember, removeMember } = useAuth();
  const { organization, exportWorkspaceData, importWorkspaceData, resetAllData } = useOrg();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'organization' | 'security' | 'audit' | 'data'>('organization');
  const [importText, setImportText] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Add Member Modal State
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<UserRole>('member');
  const [newMemberTitle, setNewMemberTitle] = useState('');
  const [newMemberPassword, setNewMemberPassword] = useState('konvey123');

  const canManageTeam = hasPermission(currentUser.role, 'CAN_MANAGE_TEAM') || currentUser.role === 'admin' || currentUser.role === 'manager';
  const canExport = hasPermission(currentUser.role, 'CAN_EXPORT_DATA');

  // Export JSON file download
  const handleExportJSON = () => {
    const jsonStr = exportWorkspaceData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `konvey-workspace-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      type: 'success',
      title: 'Workspace Backup Downloaded',
      message: 'All projects, tasks, decisions, and history exported cleanly.',
    });
  };

  // Import JSON payload
  const handleImportSubmit = () => {
    if (!importText.trim()) return;
    const success = importWorkspaceData(importText);
    if (success) {
      showToast({
        type: 'success',
        title: 'Workspace Restored',
        message: 'Imported workspace state has been successfully loaded.',
      });
      setIsImportModalOpen(false);
      setImportText('');
    } else {
      showToast({
        type: 'error',
        title: 'Import Failed',
        message: 'Invalid KONVEY workspace JSON format.',
      });
    }
  };

  return (
    <div className={styles.settingsContainer}>
      {/* Header */}
      <div className={styles.settingsHeader}>
        <div>
          <div className={styles.categoryLabel}>WORKSPACE ADMINISTRATION</div>
          <h2>Settings & Governance</h2>
          <p className={styles.subtext}>
            Manage ROY Tech solutions organization parameters, member capabilities, RBAC policies, and workspace persistence.
          </p>
        </div>

        {/* Current Admin Posture Tag */}
        <Badge variant={currentUser.role === 'admin' ? 'intel' : 'default'} size="md">
          {currentUser.role === 'admin' ? 'Organization Admin (Sameera)' : `Viewing as ${currentUser.role.toUpperCase()}`}
        </Badge>
      </div>

      {/* Tabs Row */}
      <div className={styles.tabNav}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'organization' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('organization')}
        >
          <Building2 size={14} /> Organization & Team
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'security' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <ShieldCheck size={14} /> Security & RBAC Matrix
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'audit' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <History size={14} /> System Audit Trail
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'data' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('data')}
        >
          <Database size={14} /> Data & Demo Management
        </button>
      </div>

      {/* TAB 1: ORGANIZATION & TEAM */}
      {activeTab === 'organization' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card variant="default" padding="lg">
            <div className={styles.orgProfileCard}>
              <div className={styles.orgProfileLeft}>
                <div
                  className={styles.orgLogoBadge}
                  style={{
                    background: '#ffffff',
                    padding: '6px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img src="/logo.png" alt="ROY" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div className={styles.orgDetails}>
                  <h3>{organization.name}</h3>
                  <div className={styles.orgMeta}>
                    Domain: <strong>roytech.internal</strong> • Workspace ID: <code>org-roy-tech</code>
                  </div>
                </div>
              </div>

              <div className={styles.seatsPill}>
                <Users size={18} color="var(--primary-600)" />
                <div>
                  <div className={styles.seatsNumber}>{users.length} Active Seats</div>
                  <div className={styles.seatsLabel}>Enterprise Cloud Tier</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Active Session & Auth Card */}
          <Card variant="default" padding="md">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: 650, fontSize: '14px', color: 'var(--gray-900)' }}>
                    Active Session: {currentUser.name} ({currentUser.email})
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '2px' }}>
                    Role: {currentUser.role.toUpperCase()} • Authenticated via Local Session
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<LogOut size={14} />}
                onClick={logout}
              >
                Sign Out to Auth Page
              </Button>
            </div>
          </Card>

          {/* Team Header & Add Member Action */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '4px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--gray-900)' }}>Squad & Team Governance</h3>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                {canManageTeam
                  ? 'Authorized managers and admins can provision new teammates and configure access roles.'
                  : 'Workspace membership directory and operational roles.'}
              </p>
            </div>

            {canManageTeam && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<UserPlus size={15} />}
                onClick={() => {
                  setNewMemberName('');
                  setNewMemberEmail('');
                  setNewMemberRole('member');
                  setNewMemberTitle('');
                  setIsAddMemberModalOpen(true);
                }}
              >
                + Add Member to Team
              </Button>
            )}
          </div>

          {/* Members Table */}
          <div className={styles.membersTableWrapper}>
            <table className={styles.membersTable}>
              <thead>
                <tr>
                  <th>Team Member</th>
                  <th>Title & Specialization</th>
                  <th>Workspace Role</th>
                  <th>Current Status</th>
                  {canManageTeam && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className={styles.memberUserCol}>
                        <img src={u.avatarUrl} alt={u.name} className={styles.memberAvatar} />
                        <div>
                          <div className={styles.memberName}>{u.name}</div>
                          <div className={styles.memberEmail}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{u.title || 'Specialist'}</td>
                    <td>
                      <Badge
                        variant={u.role === 'admin' ? 'intel' : u.role === 'manager' ? 'primary' : u.role === 'client' ? 'warning' : 'default'}
                        size="sm"
                      >
                        {u.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--success)', fontWeight: 600 }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
                        Active
                      </span>
                    </td>
                    {canManageTeam && (
                      <td style={{ textAlign: 'right' }}>
                        {u.id !== currentUser.id ? (
                          <button
                            type="button"
                            onClick={() => {
                              removeMember(u.id);
                              showToast({
                                type: 'info',
                                title: 'Member Removed',
                                message: `${u.name} has been removed from workspace seats.`,
                              });
                            }}
                            title={`Remove ${u.name} from organization`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 12px',
                              borderRadius: '6px',
                              border: '1px solid #fecaca',
                              backgroundColor: '#fef2f2',
                              color: '#b91c1c',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 150ms ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fee2e2';
                              e.currentTarget.style.borderColor = '#f87171';
                              e.currentTarget.style.color = '#991b1b';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#fef2f2';
                              e.currentTarget.style.borderColor = '#fecaca';
                              e.currentTarget.style.color = '#b91c1c';
                            }}
                          >
                            <Trash2 size={13} />
                            <span>Remove</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--gray-400)', fontStyle: 'italic' }}>You</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Member Modal */}
          <Modal
            isOpen={isAddMemberModalOpen}
            onClose={() => setIsAddMemberModalOpen(false)}
            title="Provision New Team Member"
            maxWidth="500px"
            footer={
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
                <Button variant="secondary" size="sm" onClick={() => setIsAddMemberModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (!newMemberName.trim() || !newMemberEmail.trim()) {
                      showToast({ type: 'warning', title: 'Fields Required', message: 'Name and email are required.' });
                      return;
                    }
                    if (!newMemberEmail.includes('@')) {
                      showToast({ type: 'warning', title: 'Invalid Email', message: 'Please provide a valid email address.' });
                      return;
                    }
                    const assignedPassword = newMemberPassword.trim() || 'konvey123';
                    if (assignedPassword.length < 6) {
                      showToast({ type: 'warning', title: 'Password Too Short', message: 'Password must be at least 6 characters.' });
                      return;
                    }
                    addMember(newMemberName.trim(), newMemberEmail.trim(), newMemberRole, newMemberTitle.trim(), assignedPassword);
                    setIsAddMemberModalOpen(false);
                    setNewMemberName('');
                    setNewMemberEmail('');
                    setNewMemberTitle('');
                    setNewMemberPassword('konvey123');
                    showToast({
                      type: 'success',
                      title: 'Teammate Provisioned',
                      message: `${newMemberName} added as ${newMemberRole.toUpperCase()} (login password: ${assignedPassword}).`,
                    });
                  }}
                >
                  Confirm & Provision Member
                </Button>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--gray-800)' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vikram Malhotra"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle, #cbd5e1)',
                    fontSize: '13.5px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--gray-800)' }}>
                  Work Email *
                </label>
                <input
                  type="email"
                  placeholder="e.g. vikram@roytech.io"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle, #cbd5e1)',
                    fontSize: '13.5px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--gray-800)' }}>
                    Role Authority *
                  </label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as UserRole)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle, #cbd5e1)',
                      fontSize: '13px',
                      background: '#ffffff',
                    }}
                  >
                    <option value="member">Member (Contributor)</option>
                    <option value="manager">Manager (Project Lead)</option>
                    <option value="admin">Admin (Organization)</option>
                    <option value="client">Client (Guest Portal)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--gray-800)' }}>
                    Job Title / Squad
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DevOps Engineer"
                    value={newMemberTitle}
                    onChange={(e) => setNewMemberTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle, #cbd5e1)',
                      fontSize: '13.5px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--gray-800)' }}>
                  Initial Sign-In Password * (Min 6 chars)
                </label>
                <input
                  type="text"
                  placeholder="e.g. konvey123"
                  value={newMemberPassword}
                  onChange={(e) => setNewMemberPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle, #cbd5e1)',
                    fontSize: '13.5px',
                    boxSizing: 'border-box',
                  }}
                />
                <span style={{ fontSize: '11.5px', color: 'var(--gray-500)', marginTop: '4px', display: 'block' }}>
                  Teammate uses this password to sign into the workspace with their email (default: <code>konvey123</code>).
                </span>
              </div>
            </div>
          </Modal>
        </div>
      )}

      {/* TAB 2: SECURITY & RBAC MATRIX */}
      {activeTab === 'security' && <RolePermissionMatrix />}

      {/* TAB 3: SYSTEM AUDIT TRAIL */}
      {activeTab === 'audit' && <AuditLogTable />}

      {/* TAB 4: DATA MANAGEMENT & DEMO CONTROLS */}
      {activeTab === 'data' && (
        <div className={styles.dataCardsGrid}>
          {/* Export Card */}
          <div className={styles.dataCard}>
            <div className={styles.dataCardIcon}>
              <Download size={20} />
            </div>
            <h4>Export Workspace State</h4>
            <p className={styles.dataCardDesc}>
              Download an offline JSON snapshot containing all current projects, tasks, checklists, dependencies, blockers, and decision memory records.
            </p>
            <Button
              variant="secondary"
              leftIcon={<Download size={14} />}
              onClick={handleExportJSON}
            >
              Download Backup (JSON)
            </Button>
          </div>

          {/* Import Card */}
          <div className={styles.dataCard}>
            <div className={styles.dataCardIcon}>
              <Upload size={20} />
            </div>
            <h4>Import Workspace Backup</h4>
            <p className={styles.dataCardDesc}>
              Restore workspace data from a previously exported KONVEY backup file. Validates schemas before state commitment.
            </p>
            <Button
              variant="secondary"
              leftIcon={<Upload size={14} />}
              onClick={() => setIsImportModalOpen(true)}
            >
              Restore from Backup
            </Button>
          </div>

          {/* Reset Demo State Card */}
          <div className={styles.dataCard}>
            <div className={`${styles.dataCardIcon} ${styles.dangerIcon}`}>
              <RotateCcw size={20} />
            </div>
            <h4>Reset to Pristine Demo State</h4>
            <p className={styles.dataCardDesc}>
              Clear local session modifications and restore default evaluation fixtures (ROY Tech solutions, Mobile App 2.0, seed blockers, and decisions).
            </p>
            <Button
              variant="destructive"
              leftIcon={<RotateCcw size={14} />}
              onClick={() => {
                if (window.confirm('Reset all demo state to pristine initial seed?')) {
                  resetAllData();
                }
              }}
            >
              Reset Demo State
            </Button>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '24px', width: '90%', maxWidth: '540px', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ marginBottom: '8px' }}>Import Workspace JSON</h3>
            <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: '16px' }}>
              Paste your exported JSON backup text below to restore your workspace.
            </p>

            <textarea
              rows={8}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='Paste {"version": "1.0.0", "projects": [...]} here'
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--gray-200)', fontFamily: 'var(--font-mono)', fontSize: '12px', resize: 'vertical', marginBottom: '16px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button variant="secondary" onClick={() => setIsImportModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleImportSubmit}>
                Confirm Import
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
