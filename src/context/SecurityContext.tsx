import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, type SessionContext } from '../backend/api';
import type { Workspace } from '../types/security';

interface AppSecurityContextType {
  session: SessionContext;
  currentWorkspace: Workspace | undefined;
  workspaces: Workspace[];
  setWorkspaceId: (workspaceId: string) => void;
  setUserRole: (role: SessionContext['userRole']) => void;
  createLiveWorkspace: (name: string) => Workspace;
}

const AppSecurityContext = createContext<AppSecurityContextType | null>(null);

export function AppSecurityProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionContext>(() => api.getDefaultSession());
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => api.getWorkspaces(session.orgId));

  const currentWorkspace = api.getWorkspace(session.workspaceId);

  const setWorkspaceId = (workspaceId: string) => {
    setSession((prev) => ({ ...prev, workspaceId }));
  };

  const setUserRole = (userRole: SessionContext['userRole']) => {
    setSession((prev) => ({ ...prev, userRole }));
  };

  const createLiveWorkspace = (name: string) => {
    const newWs = api.createLiveWorkspace(session, name);
    setWorkspaces(api.getWorkspaces(session.orgId));
    setSession((prev) => ({ ...prev, workspaceId: newWs.id }));
    return newWs;
  };

  return (
    <AppSecurityContext.Provider
      value={{
        session,
        currentWorkspace,
        workspaces,
        setWorkspaceId,
        setUserRole,
        createLiveWorkspace,
      }}
    >
      {children}
    </AppSecurityContext.Provider>
  );
}

export function useAppSecurity() {
  const ctx = useContext(AppSecurityContext);
  if (!ctx) {
    throw new Error('useAppSecurity must be used within an AppSecurityProvider');
  }
  return ctx;
}
