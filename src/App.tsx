import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrgProvider } from './context/OrgContext';
import { ToastProvider } from './components/ui/Toast';
import { AppShell } from './components/layout/AppShell';
import { NavigationTab } from './components/layout/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { MyWorkView } from './components/views/MyWorkView';
import { ProjectsView } from './components/projects/ProjectsView';
import { ProjectWorkspace } from './components/projects/ProjectWorkspace';
import { TeamsView } from './components/views/TeamsView';
import { DecisionMemoryView } from './components/intelligence/DecisionMemoryView';
import { FocusModeView } from './components/intelligence/FocusModeView';
import { SettingsView } from './components/admin/SettingsView';
import { ClientPortalView } from './components/views/ClientPortalView';
import { AuthPage } from './components/auth/AuthPage';
import { LogoLoadingScreen } from './components/ui/LogoLoadingScreen';
import { MetaPagesView, MetaTab } from './components/meta/MetaPagesView';

const MainContentView: React.FC<{
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  selectedProjectId: string | null;
  onSelectProject: (id: string | null) => void;
}> = ({ currentTab, onSelectTab, selectedProjectId, onSelectProject }) => {
  const { role } = useAuth();

  // Client persona is strictly isolated to the executive Client Portal only
  if (role === 'client' || currentTab === 'client-portal') {
    return <ClientPortalView />;
  }

  if (currentTab === 'dashboard') {
    return (
      <DashboardView
        onSelectTab={onSelectTab}
        onOpenProject={(id) => {
          onSelectProject(id);
          onSelectTab('projects');
        }}
      />
    );
  }

  if (currentTab === 'my-work') {
    return <MyWorkView onEnterFocusMode={() => onSelectTab('focus-mode')} />;
  }

  if (currentTab === 'projects') {
    if (selectedProjectId) {
      return (
        <ProjectWorkspace
          projectId={selectedProjectId}
          onBackToProjects={() => onSelectProject(null)}
          onOpenCreateTask={() => {}}
        />
      );
    }
    return <ProjectsView onOpenCreateTask={() => {}} />;
  }

  if (currentTab === 'teams') {
    return <TeamsView />;
  }

  if (currentTab === 'decisions') {
    return <DecisionMemoryView />;
  }

  if (currentTab === 'focus-mode') {
    return <FocusModeView onExitFocusMode={() => onSelectTab('my-work')} />;
  }

  return <SettingsView />;
};

const WorkspaceApp: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [activeMetaTab, setActiveMetaTab] = useState<MetaTab | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const meta = params.get('meta');
      if (meta && ['brand', 'security', 'privacy', 'terms', 'sitemap'].includes(meta)) {
        return meta as MetaTab;
      }
    }
    return null;
  });
  const [currentTab, setCurrentTab] = useState<NavigationTab>(() =>
    role === 'client' ? 'client-portal' : 'dashboard'
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Auto-switch to Client Portal when switching to client persona and lock tab
  React.useEffect(() => {
    if (role === 'client') {
      setCurrentTab('client-portal');
      setSelectedProjectId(null);
    }
  }, [role]);

  const handleSelectTab = (tab: NavigationTab) => {
    if (role === 'client') {
      setCurrentTab('client-portal');
      return;
    }
    setCurrentTab(tab);
    if (tab !== 'projects') {
      setSelectedProjectId(null);
    }
  };

  // 1. Initial circular logo loading animation on link visit
  if (isInitialLoading) {
    return (
      <LogoLoadingScreen
        message="Initializing Konvey Workspace..."
        minDurationMs={1300}
        onFinish={() => setIsInitialLoading(false)}
      />
    );
  }

  // 2. Meta documentation & Favicon page (accessible unauthenticated and authenticated)
  if (activeMetaTab) {
    return (
      <MetaPagesView
        initialTab={activeMetaTab}
        onBack={() => setActiveMetaTab(null)}
      />
    );
  }

  // 3. Auth page opens first when user opens the app/link
  if (!isAuthenticated) {
    return <AuthPage onOpenMetaPage={(tab) => setActiveMetaTab(tab)} />;
  }

  // 4. Authenticated main workspace
  return (
    <AppShell
      currentTab={currentTab}
      onSelectTab={handleSelectTab}
      onOpenMetaPage={(tab) => setActiveMetaTab(tab)}
    >
      <MainContentView
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
      />
    </AppShell>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <OrgProvider>
        <ToastProvider>
          <WorkspaceApp />
        </ToastProvider>
      </OrgProvider>
    </AuthProvider>
  );
};

export default App;
