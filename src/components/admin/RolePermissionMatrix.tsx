import React from 'react';
import { Check, X, Shield, Users, UserCheck } from 'lucide-react';
import {
  ROLE_CAPABILITIES,
  PERMISSION_LABELS,
  Permission,
  hasPermission,
} from '../../services/permissionService';
import { UserRole } from '../../types';
import { Badge } from '../ui/Badge';
import styles from './Settings.module.css';

export const RolePermissionMatrix: React.FC = () => {
  const roles: UserRole[] = ['admin', 'manager', 'member', 'client'];
  const permissions = Object.keys(PERMISSION_LABELS) as Permission[];

  return (
    <div className={styles.matrixGrid}>
      {/* Role Cards Overview */}
      <div className={styles.roleCardsRow}>
        {roles.map((r) => {
          const cap = ROLE_CAPABILITIES[r];
          return (
            <div key={r} className={styles.roleCard}>
              <div className={styles.roleCardTop}>
                <span className={styles.roleName}>{cap.label}</span>
                <Badge
                  variant={r === 'admin' ? 'intel' : r === 'manager' ? 'primary' : r === 'client' ? 'success' : 'default'}
                  size="sm"
                >
                  {r.toUpperCase()}
                </Badge>
              </div>
              <p className={styles.roleDesc}>{cap.description}</p>
            </div>
          );
        })}
      </div>

      {/* Permission Capabilities Matrix Table */}
      <div className={styles.matrixTableWrapper}>
        <table className={styles.matrixTable}>
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Workspace Permission</th>
              <th style={{ width: '15%', textAlign: 'center' }}>Admin</th>
              <th style={{ width: '15%', textAlign: 'center' }}>Manager (PM)</th>
              <th style={{ width: '15%', textAlign: 'center' }}>Member (IC)</th>
              <th style={{ width: '15%', textAlign: 'center' }}>Client</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((perm) => {
              const meta = PERMISSION_LABELS[perm];
              return (
                <tr key={perm}>
                  <td>
                    <div className={styles.permissionName}>{meta.name}</div>
                    <div className={styles.permissionCategory}>{meta.category}</div>
                  </td>
                  {roles.map((r) => {
                    const allowed = hasPermission(r, perm);
                    return (
                      <td key={r} className={styles.checkCell}>
                        {allowed ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
                            <Check size={13} strokeWidth={3} />
                          </div>
                        ) : (
                          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--gray-100)', color: 'var(--gray-400)' }}>
                            <X size={13} strokeWidth={2.5} />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
