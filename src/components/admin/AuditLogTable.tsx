import React, { useState } from 'react';
import { History, Search, Shield, Filter, Calendar } from 'lucide-react';
import { useOrg } from '../../context/OrgContext';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import styles from './Settings.module.css';

export const AuditLogTable: React.FC = () => {
  const { activities } = useOrg();
  const { users } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const getUser = (id: string) => users.find((u) => u.id === id);

  const filtered = activities.filter((act) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const actor = getUser(act.actorId)?.name.toLowerCase() || '';
    const details = `${act.entityType} ${act.newValue || ''} ${act.previousValue || ''}`.toLowerCase();
    return (
      act.action.toLowerCase().includes(q) ||
      details.includes(q) ||
      actor.includes(q)
    );
  });

  return (
    <div className={styles.auditLogWrapper}>
      <div className={styles.auditFilters}>
        <div className={styles.auditSearch}>
          <Input
            placeholder="Search audit trail by actor, action, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={14} />}
          />
        </div>

        <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
          Showing <strong>{filtered.length}</strong> logged events (Immutable ledger)
        </span>
      </div>

      <div className={styles.auditList}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-500)', backgroundColor: 'var(--white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
            No activity matches "{searchQuery}".
          </div>
        ) : (
          filtered.map((act) => {
            const actor = getUser(act.actorId);
            return (
              <div key={act.id} className={styles.auditItem}>
                <div className={styles.auditLeft}>
                  {actor && (
                    <img
                      src={actor.avatarUrl}
                      alt={actor.name}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                      title={`${actor.name} (${actor.role})`}
                    />
                  )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={styles.auditActionTag}>{act.action.replace(/_/g, ' ')}</span>
                      <span className={styles.auditMessage}>
                        <strong>{actor?.name || 'System'}</strong>: {act.newValue ? `${act.newValue}` : `${act.action.replace(/_/g, ' ')} on ${act.entityType}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.auditMeta}>
                  <span>{new Date(act.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
