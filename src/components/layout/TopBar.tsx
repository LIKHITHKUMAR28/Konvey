import React, { useState } from 'react';
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  Sparkles,
  Zap,
  Activity,
  LogOut,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import styles from './TopBar.module.css';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import { Drawer } from '../ui/Drawer';
import { Badge } from '../ui/Badge';

interface TopBarProps {
  onToggleMobileMenu?: () => void;
  onOpenCreateTask?: () => void;
  onOpenSearch?: () => void;
  onOpenContextRecovery?: () => void;
  onOpenTour?: () => void;
  onNavigateToDashboard?: () => void;
  onOpenMetaPage?: (page: 'brand' | 'security' | 'privacy' | 'terms' | 'sitemap') => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenCreateTask,
  onOpenSearch,
  onOpenContextRecovery,
  onOpenTour,
  onNavigateToDashboard,
  onOpenMetaPage,
}) => {
  const { currentUser, logout, role } = useAuth();
  const { organization, notifications, activeFocusSession, markNotificationAsRead } = useOrg();
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const isClient = role === 'client';

  // Unread notifications for current user
  const userNotifications = notifications.filter((n) => n.recipientId === currentUser.id);
  const unreadCount = userNotifications.filter((n) => !n.isRead && !n.isHeld).length;
  const heldCount = userNotifications.filter((n) => n.isHeld).length;

  return (
    <>
      <div className={styles.floatingTopbarContainer} aria-label="Floating Application Header">
        <header className={styles.topbar}>
          {/* Left: Brand & Workspace */}
          <div className={styles.leftSection}>
            <div
              className={styles.brandLogo}
              onClick={onNavigateToDashboard}
              title="Konvey Home"
              role="button"
              tabIndex={0}
            >
              <div className={styles.logoFrame}>
                <img
                  src="/logo.png"
                  alt="Konvey"
                  className={styles.brandLogoImg}
                />
              </div>
              <span className={styles.brandName}>Konvey</span>
            </div>

            <span className={styles.brandSlash}>/</span>

            <div className={styles.workspacePill} title="Current Workspace">
              <span className={styles.orgDot} />
              <span className={styles.orgName}>{organization.name}</span>
            </div>

            {isClient && (
              <span className={styles.clientPortalBadge}>
                <Badge variant="intel" size="sm">
                  Roy Global Client Portal
                </Badge>
              </span>
            )}
          </div>

          {/* Center: Search Capsule for Internal Team, Executive Badge for Client */}
          <div className={styles.centerSection}>
            {isClient ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Client Executive Workspace
                </span>
              </div>
            ) : (
              <button
                type="button"
                className={styles.searchBar}
                onClick={onOpenSearch}
                aria-label="Search projects, tasks, or jump to page"
              >
                <Search size={14} className={styles.searchIcon} />
                <span className={styles.searchPlaceholder}>Search or jump to...</span>
                <span className={styles.searchKbd}>
                  <kbd>⌘K</kbd>
                </span>
              </button>
            )}
          </div>

          {/* Right: Actions & User */}
          <div className={styles.rightSection}>
            {/* Context Catch Up - Only for internal team */}
            {!isClient && onOpenContextRecovery && (
              <button
                type="button"
                className={styles.subtleActionBtn}
                onClick={onOpenContextRecovery}
                title="Catch up on recent workspace updates"
              >
                <Activity size={14} />
                <span>Catch Up</span>
              </button>
            )}

            {/* Product Tour - Only for internal team */}
            {!isClient && onOpenTour && (
              <button
                type="button"
                className={styles.subtleActionBtn}
                onClick={onOpenTour}
                title="Interactive product walkthrough"
              >
                <Sparkles size={14} />
                <span>Tour</span>
              </button>
            )}

            {/* Active Focus Session Pill - Only for internal team */}
            {!isClient && activeFocusSession && (
              <div className={styles.focusIndicatorBadge} title="Focus Mode Active">
                <Zap size={12} className={styles.focusZap} />
                <span>Focus On</span>
              </div>
            )}

            {/* Search Icon Button for Tablet/Mobile */}
            {!isClient && onOpenSearch && (
              <button
                type="button"
                className={`${styles.iconButton} ${styles.mobileSearchBtn}`}
                onClick={onOpenSearch}
                aria-label="Search"
                title="Search"
              >
                <Search size={15} />
              </button>
            )}

            {/* Notifications Bell */}
            <button
              type="button"
              className={`${styles.iconButton} ${unreadCount > 0 ? styles.bellHasUnread : ''}`}
              onClick={() => setIsNotifDrawerOpen(true)}
              aria-label={`Notifications (${unreadCount} unread)`}
              title="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && <span className={styles.notifBadge}>{unreadCount}</span>}
              {heldCount > 0 && <span className={styles.heldIndicator} title={`${heldCount} notifications paused`} />}
            </button>

            {/* User Persona Profile Pill (Clean, no dropdown) */}
            <div className={styles.personaBtn} title={`${currentUser.name} (${currentUser.role})`}>
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className={styles.personaAvatar}
              />
              <span className={styles.personaName}>
                {currentUser.name.split(' ')[0]}
              </span>
              <span className={styles.roleChip}>
                {currentUser.role}
              </span>
            </div>

            {/* Dedicated Sign Out Button */}
            <button
              type="button"
              className={styles.signOutBtn}
              onClick={logout}
              title="Sign out to Auth Launchpad"
              aria-label="Sign out"
            >
              <LogOut size={15} />
            </button>

            {/* New Task CTA - Internal Team Only */}
            {!isClient && onOpenCreateTask && (
              <button
                type="button"
                className={styles.primaryCtaBtn}
                onClick={onOpenCreateTask}
              >
                <Plus size={15} strokeWidth={2.4} />
                <span>New Task</span>
              </button>
            )}
          </div>
        </header>
      </div>

      {/* Notifications Drawer */}
      <Drawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} color="var(--primary-600)" />
            <span>Activity & Notifications</span>
            {unreadCount > 0 && <Badge variant="primary" size="sm">{unreadCount} new</Badge>}
          </div>
        }
      >
        <div className={styles.notifDrawerBody}>
          {userNotifications.length === 0 ? (
            <div className={styles.emptyNotifs}>All caught up! No new notifications.</div>
          ) : (
            userNotifications.map((n) => (
              <div
                key={n.id}
                className={`${styles.notifItem} ${n.isRead ? styles.readItem : ''} ${n.isHeld ? styles.heldItem : ''}`}
                onClick={() => markNotificationAsRead(n.id)}
              >
                <div className={styles.notifHeader}>
                  <Badge variant={n.type === 'blocker' ? 'critical' : n.type === 'decision' ? 'intel' : 'primary'} size="sm">
                    {n.type.toUpperCase()}
                  </Badge>
                  <span className={styles.notifTime}>
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={styles.notifTitle}>{n.title}</div>
                <div className={styles.notifMessage}>{n.message}</div>
              </div>
            ))
          )}
        </div>
      </Drawer>
    </>
  );
};
