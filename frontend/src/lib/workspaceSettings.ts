export const SETTINGS_STORAGE_KEY = 'coffeetrace_settings';

export type WorkspaceSettings = {
  displayName: string;
  email: string;
  confirmDestructive: boolean;
  compactTables: boolean;
};

export const DEFAULT_SETTINGS: WorkspaceSettings = {
  displayName: 'Operations Lead',
  email: '',
  confirmDestructive: true,
  compactTables: false,
};

export function loadWorkspaceSettings(): WorkspaceSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function applyUiPrefs(settings: WorkspaceSettings) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.compact = settings.compactTables ? 'true' : 'false';
}
