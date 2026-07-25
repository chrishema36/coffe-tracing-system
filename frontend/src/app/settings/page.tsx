'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Database,
  Server,
  User,
  Coffee,
  Info,
  RefreshCw,
  CheckCircle2,
  Bell,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { fetchDashboardSummary } from '../../lib/api';
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  WorkspaceSettings,
  applyUiPrefs,
  loadWorkspaceSettings,
} from '../../lib/workspaceSettings';
import { ProductCatalogue } from '../documentation/ProductCatalogue';

type SettingsTab = 'general' | 'system' | 'about' | 'documentation';

const VALID_TABS: SettingsTab[] = ['general', 'system', 'about', 'documentation'];

function SettingsPageInner() {
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialTab: SettingsTab =
    tabParam && VALID_TABS.includes(tabParam as SettingsTab) ? (tabParam as SettingsTab) : 'general';

  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [form, setForm] = useState<WorkspaceSettings>(DEFAULT_SETTINGS);
  const [dirty, setDirty] = useState(false);

  const {
    data: healthResponse,
    isFetching,
    isError,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['settings-health'],
    queryFn: fetchDashboardSummary,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const summary = healthResponse?.data;

  useEffect(() => {
    const saved = loadWorkspaceSettings();
    setForm(saved);
    applyUiPrefs(saved);
  }, []);

  useEffect(() => {
    if (tabParam && VALID_TABS.includes(tabParam as SettingsTab)) {
      setActiveTab(tabParam as SettingsTab);
    }
  }, [tabParam]);

  const selectTab = (tab: SettingsTab) => {
    setActiveTab(tab);
    const url = tab === 'general' ? '/settings' : `/settings?tab=${tab}`;
    router.replace(url, { scroll: false });
  };

  const updateField = <K extends keyof WorkspaceSettings>(key: K, value: WorkspaceSettings[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(form));
    applyUiPrefs(form);
    setDirty(false);
    toast.success('Settings saved', 'Your workspace preferences are stored in this browser.');
  };

  const handleReset = () => {
    setForm(DEFAULT_SETTINGS);
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    applyUiPrefs(DEFAULT_SETTINGS);
    setDirty(false);
    toast.info('Reset complete', 'Preferences restored to defaults.');
  };

  const apiOnline = Boolean(summary) && !isError;
  const checkedAt = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'n/a';

  return (
    <div
      className={`space-y-6 animate-fadeIn mx-auto ${
        activeTab === 'documentation' ? 'max-w-6xl' : 'max-w-5xl'
      }`}
    >
      <div className="p-6 rounded-2xl bg-gradient-to-r from-surface via-surfaceHover to-background border border-borderToken shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="p-3 rounded-2xl bg-amberAccent/15 border border-amberAccent/35 text-amberAccent shadow-md shrink-0">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-black text-gray-100 tracking-tight">Settings</h1>
            <p className="text-xs text-gray-400 truncate">
              {activeTab === 'documentation'
                ? 'Product catalogue & terminology guide'
                : `Workspace preferences for ${form.displayName || 'this browser'}`}
            </p>
          </div>
        </div>

        <div
          className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
            apiOnline
              ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400'
              : 'bg-rose-500/15 border-rose-500/35 text-rose-400'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{apiOnline ? 'API Connected' : 'API Unreachable'}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2 border-b border-borderToken pb-2 text-xs overflow-x-auto">
        {[
          { id: 'general' as const, label: 'Workspace', icon: User },
          { id: 'system' as const, label: 'System Health', icon: Server },
          { id: 'documentation' as const, label: 'Documentation', icon: BookOpen },
          { id: 'about' as const, label: 'About', icon: Info },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => selectTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-amberAccent text-gray-950 shadow-md'
                  : 'bg-surface hover:bg-surfaceHover text-gray-400 hover:text-gray-200 border border-borderToken'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-borderToken bg-surface space-y-4">
            <h3 className="text-sm font-bold text-gray-100 flex items-center space-x-2">
              <User className="w-4 h-4 text-amberAccent" />
              <span>Profile</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label htmlFor="displayName" className="text-gray-400 font-semibold text-[11px]">
                  Display name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={form.displayName}
                  onChange={(e) => updateField('displayName', e.target.value)}
                  placeholder="e.g. Operations Lead"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-borderToken text-gray-100 focus:outline-none focus:border-amberAccent/60"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-gray-400 font-semibold text-[11px]">
                  Contact email
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-borderToken text-gray-100 focus:outline-none focus:border-amberAccent/60"
                />
              </div>
            </div>
            <p className="text-[11px] text-gray-500">
              Stored locally in this browser only. Not sent to the server.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-borderToken bg-surface space-y-4">
            <h3 className="text-sm font-bold text-gray-100 flex items-center space-x-2">
              <Bell className="w-4 h-4 text-amberAccent" />
              <span>Preferences</span>
            </h3>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-borderToken bg-background/50 cursor-pointer hover:border-amberAccent/40 transition-colors">
              <input
                type="checkbox"
                checked={form.confirmDestructive}
                onChange={(e) => updateField('confirmDestructive', e.target.checked)}
                className="mt-0.5 accent-amber-500"
              />
              <div>
                <div className="text-xs font-bold text-gray-100">Confirm before deleting farmers</div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Shows a confirmation step before permanent farmer deletion.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-borderToken bg-background/50 cursor-pointer hover:border-amberAccent/40 transition-colors">
              <input
                type="checkbox"
                checked={form.compactTables}
                onChange={(e) => updateField('compactTables', e.target.checked)}
                className="mt-0.5 accent-amber-500"
              />
              <div>
                <div className="text-xs font-bold text-gray-100">Compact table density</div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Tighter row spacing on farmers and bags tables.
                </p>
              </div>
            </label>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl border border-borderToken bg-surface hover:bg-surfaceHover text-gray-300 font-bold text-xs transition-all"
            >
              Reset defaults
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty}
              className="px-6 py-2.5 rounded-xl bg-amberAccent hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-gray-950 font-extrabold text-xs transition-all shadow-lg"
            >
              Save preferences
            </button>
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-gray-400">Last checked: {checkedAt}</p>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-borderToken bg-surface hover:bg-surfaceHover text-gray-300 text-xs font-bold disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-borderToken bg-surface space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>REST API</span>
                <Server className={`w-4 h-4 ${apiOnline ? 'text-emerald-400' : 'text-rose-400'}`} />
              </div>
              <div className={`text-xl font-bold font-mono ${apiOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isFetching ? 'CHECKING' : apiOnline ? 'ONLINE' : 'OFFLINE'}
              </div>
              <div className="text-[10px] text-gray-500">/api/v1/analytics/summary</div>
            </div>

            <div className="p-4 rounded-2xl border border-borderToken bg-surface space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Database</span>
                <Database className={`w-4 h-4 ${apiOnline ? 'text-emerald-400' : 'text-rose-400'}`} />
              </div>
              <div className={`text-xl font-bold font-mono ${apiOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
                {apiOnline ? 'REACHABLE' : 'UNKNOWN'}
              </div>
              <div className="text-[10px] text-gray-500">Via Prisma-backed analytics</div>
            </div>

            <div className="p-4 rounded-2xl border border-borderToken bg-surface space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Farmers in system</span>
                <CheckCircle2 className="w-4 h-4 text-amberAccent" />
              </div>
              <div className="text-xl font-bold font-mono text-amberAccent">
                {summary?.totalFarmers ?? 'n/a'}
              </div>
              <div className="text-[10px] text-gray-500">
                Bags: {summary?.totalCoffeeBags ?? 'n/a'}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documentation' && <ProductCatalogue embedded />}

      {activeTab === 'about' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl border border-borderToken bg-surface space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-amberAccent/20 border border-amberAccent/40 flex items-center justify-center text-amberAccent shadow-lg">
                <Coffee className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-100">CoffeeTrace</h2>
                <p className="text-xs text-gray-400">Multi-tier coffee bag lineage & farmer attribution</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-background/60 border border-borderToken text-xs text-gray-300 space-y-2 leading-relaxed">
              <p>
                Track harvest bags from smallholder farmers through recursive merges into export lots, with
                backward and forward lineage, weight-based farmer attribution, and printable origin certificates.
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-400 pt-1">
                <li>Next.js frontend · Express + Prisma + PostgreSQL backend</li>
                <li>Bag merge engine with cycle protection</li>
                <li>Paginated farmer and bag listings (max 5 per page)</li>
              </ul>
            </div>
          </div>

          <button
            type="button"
            onClick={() => selectTab('documentation')}
            className="w-full flex items-center justify-between gap-4 p-5 rounded-2xl border border-amberAccent/35 bg-amberAccent/10 hover:bg-amberAccent/15 transition-colors group text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-amberAccent/20 text-amberAccent shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-gray-100">Open the product catalogue</div>
                <p className="text-[11px] text-gray-400 truncate">
                  Full guide: terminology, workflows, statuses, attribution, and system rules
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amberAccent group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto p-8 text-sm text-gray-400 animate-fadeIn">Loading settings…</div>
      }
    >
      <SettingsPageInner />
    </Suspense>
  );
}
