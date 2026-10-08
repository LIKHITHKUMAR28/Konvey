import React from 'react';
import {
  LayoutGrid,
  CheckSquare,
  FolderKanban,
  Users,
  GitCommit,
  Zap,
  Settings,
} from 'lucide-react';
import styles from './FloatingNavbar.module.css';
import { NavigationTab } from './Sidebar';
import { useOrg } from '../../context/OrgContext';

interface FloatingNavbarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export const FloatingNavbar: React.FC<FloatingNavbarProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const { activeFocusSession } = useOrg();

  const coreNavItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutGrid },
    { id: 'my-work' as NavigationTab, label: 'My Work', icon: CheckSquare },
    { id: 'projects' as NavigationTab, label: 'Projects', icon: FolderKanban },
    { id: 'teams' as NavigationTab, label: 'Teams', icon: Users },
    { id: 'decisions' as NavigationTab, label: 'Decisions', icon: GitCommit },
  ];

  return (
    <nav className={styles.floatingDockContainer} aria-label="Floating Navigation Dock">
      <div className={styles.dockPill}>
        {coreNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`${styles.dockItem} ${isActive ? styles.activeItem : ''}`}
              onClick={() => onSelectTab(item.id)}
              aria-label={item.label}
              title={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={styles.dockIcon}>
                <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
              </span>
              <span className={styles.dockLabel}>{item.label}</span>
              {isActive && <span className={styles.activePillGlow} />}
            </button>
          );
        })}

        <div className={styles.dockDivider} />

        {/* Intelligence / Focus Mode Item */}
        <button
          type="button"
          className={`${styles.dockItem} ${styles.focusItem} ${currentTab === 'focus-mode' ? styles.activeItem : ''}`}
          onClick={() => onSelectTab('focus-mode')}
          aria-label="Focus Mode"
          title="Enter High-Performance Focus Mode"
          aria-current={currentTab === 'focus-mode' ? 'page' : undefined}
        >
          <span className={styles.dockIcon}>
            <Zap size={16} strokeWidth={currentTab === 'focus-mode' ? 2.2 : 1.8} />
          </span>
          <span className={styles.dockLabel}>Focus</span>
          {activeFocusSession ? (
            <span className={styles.focusActiveDot} title="Focus Session Active" />
          ) : null}
        </button>

        {/* Settings Item */}
        <button
          type="button"
          className={`${styles.dockItem} ${currentTab === 'settings' ? styles.activeItem : ''}`}
          onClick={() => onSelectTab('settings')}
          aria-label="Settings"
          title="Settings & Workspace Preferences"
          aria-current={currentTab === 'settings' ? 'page' : undefined}
        >
          <span className={styles.dockIcon}>
            <Settings size={16} strokeWidth={currentTab === 'settings' ? 2.2 : 1.8} />
          </span>
          <span className={styles.dockLabel}>Settings</span>
        </button>
      </div>
    </nav>
  );
};
