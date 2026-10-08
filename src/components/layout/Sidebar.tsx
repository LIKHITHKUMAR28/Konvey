import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Users2,
  BookOpenCheck,
  Zap,
  Settings,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Building,
} from 'lucide-react';
import styles from './Sidebar.module.css';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';

export type NavigationTab =
  | 'dashboard'
  | 'my-work'
  | 'projects'
  | 'teams'
  | 'decisions'
  | 'settings'
  | 'focus-mode'
  | 'client-portal';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { currentUser, role } = useAuth();
  const { activeFocusSession, resetAllData } = useOrg();

  const navItems = role === 'client' ? [
    { id: 'client-portal' as NavigationTab, label: 'Client Portal', icon: Building },
    { id: 'projects' as NavigationTab, label: 'Projects Directory', icon: FolderKanban },
    { id: 'decisions' as NavigationTab, label: 'Decision Memory', icon: BookOpenCheck },
  ] : [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'client-portal' as NavigationTab, label: 'Client Portal', icon: Building },
    { id: 'my-work' as NavigationTab, label: 'My Work', icon: CheckSquare },
    { id: 'projects' as NavigationTab, label: 'Projects', icon: FolderKanban },
    { id: 'teams' as NavigationTab, label: 'Teams', icon: Users2 },
    { id: 'decisions' as NavigationTab, label: 'Decision Memory', icon: BookOpenCheck },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {isMobileOpen && <div className={styles.mobileBackdrop} onClick={onCloseMobile} />}
      <aside
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${isMobileOpen ? styles.mobileOpen : ''}`}
        aria-label="Main Navigation"
      >
        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <div className={styles.brandLogo} onClick={() => handleNavClick('dashboard')}>
            <div className={styles.logoMark} style={{ background: '#ffffff', padding: '3px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)' }}>
              <img src="/logo.png" alt="Konvey" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            {!collapsed && (
              <div className={styles.brandText}>
                <span className={styles.brandName}>KONVEY</span>
                <span className={styles.brandTagline}>Keep work moving</span>
              </div>
            )}
          </div>
          <button
            type="button"
            className={styles.collapseToggle}
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Focus Mode Quick Banner */}
        {!collapsed && activeFocusSession && (
          <div className={styles.focusBanner} onClick={() => handleNavClick('focus-mode')}>
            <div className={styles.focusIndicator} />
            <div className={styles.focusInfo}>
              <span className={styles.focusTitle}>Focus Mode Active</span>
              <span className={styles.focusSub}>Notifications Held</span>
            </div>
          </div>
        )}

        {/* Primary Navigation */}
        <nav className={styles.navList}>
          <div className={styles.navSectionLabel}>{!collapsed && 'WORK'}</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={() => handleNavClick(item.id)}
                title={collapsed ? item.label : undefined}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={18} className={styles.navIcon} />
                {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
              </button>
            );
          })}

          <div className={styles.navDivider} />

          <div className={styles.navSectionLabel}>{!collapsed && 'INTELLIGENCE'}</div>
          <button
            type="button"
            className={`${styles.navItem} ${currentTab === 'focus-mode' ? styles.navItemActive : ''} ${styles.intelItem}`}
            onClick={() => handleNavClick('focus-mode')}
            title={collapsed ? 'Focus Mode' : undefined}
          >
            <Zap size={18} className={styles.intelIcon} />
            {!collapsed && (
              <span className={styles.navLabel}>
                Focus Mode
                {activeFocusSession && <span className={styles.activeDot} />}
              </span>
            )}
          </button>
        </nav>

        {/* Footer info & Profile */}
        <div className={styles.sidebarFooter}>
          <button
            type="button"
            className={`${styles.navItem} ${currentTab === 'settings' ? styles.navItemActive : ''}`}
            onClick={() => handleNavClick('settings')}
            title={collapsed ? 'Settings' : undefined}
          >
            <Settings size={18} className={styles.navIcon} />
            {!collapsed && <span className={styles.navLabel}>Settings</span>}
          </button>

          {!collapsed && (
            <button
              type="button"
              className={styles.resetBtn}
              onClick={resetAllData}
              title="Reset sample data to initial state"
            >
              <RotateCcw size={12} />
              <span>Reset Demo State</span>
            </button>
          )}

          <div className={styles.userCard}>
            <img src={currentUser.avatarUrl} alt={currentUser.name} className={styles.userAvatar} />
            {!collapsed && (
              <div className={styles.userInfo}>
                <span className={styles.userName}>{currentUser.name}</span>
                <span className={styles.userRole}>
                  {role.toUpperCase()} • {currentUser.title || 'Team Member'}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
