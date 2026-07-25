'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { SidebarProvider } from '../context/SidebarContext';
import { ToastProvider } from '../context/ToastContext';
import { applyUiPrefs, loadWorkspaceSettings } from '../lib/workspaceSettings';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    applyUiPrefs(loadWorkspaceSettings());
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <SidebarProvider>{children}</SidebarProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
