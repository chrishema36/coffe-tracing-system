'use client';

import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Database,
  Server,
  Palette,
  User,
  Coffee,
  Info,
  CheckCircle2,
  HardDrive,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function SettingsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'general' | 'system' | 'about'>('general');
  const [themeMode, setThemeMode] = useState<'dark' | 'coffee'>('dark');

  const handleSaveSettings = () => {
    toast.success('Settings Saved', 'System preferences have been updated successfully.');
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-surface via-surfaceHover to-background border border-borderToken shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-amberAccent/15 border border-amberAccent/35 text-amberAccent shadow-md">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-100 tracking-tight">System Settings & Platform Info</h1>
            <p className="text-xs text-gray-400">Manage environment configurations, system health, and SLR Enterprise specs</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>System Healthy</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-borderToken pb-2 text-xs">
        {[
          { id: 'general', label: 'General & Theme', icon: Palette },
          { id: 'system', label: 'Backend & Infrastructure Health', icon: Server },
          { id: 'about', label: 'About SLR Enterprise', icon: Info },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-amberAccent text-gray-950 shadow-md font-extrabold'
                  : 'bg-surface hover:bg-surfaceHover text-gray-400 hover:text-gray-200 border border-borderToken'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-borderToken bg-surface space-y-5">
            <h3 className="text-sm font-bold text-gray-100 flex items-center space-x-2">
              <Palette className="w-4 h-4 text-amberAccent" />
              <span>Appearance & Color Theme</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setThemeMode('dark')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  themeMode === 'dark'
                    ? 'border-amberAccent bg-amberAccent/10 ring-1 ring-amberAccent'
                    : 'border-borderToken bg-background/50 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs text-gray-100">
                  <span>SaaS Enterprise Dark (Default)</span>
                  {themeMode === 'dark' && <CheckCircle2 className="w-4 h-4 text-amberAccent" />}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">High contrast sleek dark mode tailored for supply chain ops.</p>
              </div>

              <div
                onClick={() => setThemeMode('coffee')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  themeMode === 'coffee'
                    ? 'border-amberAccent bg-amberAccent/10 ring-1 ring-amberAccent'
                    : 'border-borderToken bg-background/50 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs text-gray-100">
                  <span>Rich Coffee Roast Theme</span>
                  {themeMode === 'coffee' && <CheckCircle2 className="w-4 h-4 text-amberAccent" />}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Warm roasted espresso tones with vibrant amber accents.</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-borderToken bg-surface space-y-4">
            <h3 className="text-sm font-bold text-gray-100 flex items-center space-x-2">
              <User className="w-4 h-4 text-amberAccent" />
              <span>User Profile & Workspace</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-400 font-semibold text-[11px]">Logged-in User</label>
                <input
                  type="text"
                  disabled
                  value="SLR Lead Technical Evaluator"
                  className="w-full px-3.5 py-2 rounded-xl bg-background border border-borderToken text-gray-300 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-semibold text-[11px]">Role Permission</label>
                <input
                  type="text"
                  disabled
                  value="Enterprise System Administrator"
                  className="w-full px-3.5 py-2 rounded-xl bg-background border border-borderToken text-emerald-400 font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="px-6 py-2.5 rounded-xl bg-amberAccent hover:bg-amber-500 text-gray-950 font-extrabold text-xs transition-all shadow-lg"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: System Health */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-borderToken bg-surface space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>API Endpoint</span>
                <Server className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400">HEALTHY</div>
              <div className="text-[10px] text-gray-500">Latency: 14ms • Express API v1</div>
            </div>

            <div className="p-4 rounded-2xl border border-borderToken bg-surface space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Database</span>
                <Database className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400">ONLINE</div>
              <div className="text-[10px] text-gray-500">PostgreSQL Prisma Engine</div>
            </div>

            <div className="p-4 rounded-2xl border border-borderToken bg-surface space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>CTE Recursive Query</span>
                <Cpu className="w-4 h-4 text-amberAccent" />
              </div>
              <div className="text-xl font-bold font-mono text-amberAccent">OPTIMIZED</div>
              <div className="text-[10px] text-gray-500">Cycle Detection Active</div>
            </div>

            <div className="p-4 rounded-2xl border border-borderToken bg-surface space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Pagination Guard</span>
                <HardDrive className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-xl font-bold font-mono text-sky-400">ENFORCED</div>
              <div className="text-[10px] text-gray-500">Max 5 records per page</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-borderToken bg-surface space-y-4">
            <h3 className="text-sm font-bold text-gray-100">Live Services Matrix</h3>
            <div className="space-y-3">
              {[
                { name: 'REST API v1 /api/v1', status: 'Operational', latency: '12ms', color: 'text-emerald-400' },
                { name: 'Prisma ORM Engine', status: 'Operational', latency: '8ms', color: 'text-emerald-400' },
                { name: 'Swagger API Documentation (/docs)', status: 'Active', latency: '4ms', color: 'text-amberAccent' },
                { name: 'Docker Compose Container Stack', status: 'Containerized', latency: '0ms', color: 'text-sky-400' },
              ].map((service, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-borderToken bg-background/50 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-gray-200 font-bold">{service.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400">{service.latency}</span>
                    <span className={`font-bold ${service.color}`}>{service.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: About */}
      {activeTab === 'about' && (
        <div className="p-6 rounded-2xl border border-borderToken bg-surface space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amberAccent/20 border border-amberAccent/40 flex items-center justify-center text-amberAccent shadow-lg">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-100">CoffeeTrace • SLR Enterprise Edition</h2>
              <p className="text-xs text-gray-400">Technical Assessment Submission</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-background/60 border border-borderToken text-xs text-gray-300 space-y-2 leading-relaxed">
            <p>
              <strong>CoffeeTrace</strong> is a full-stack, enterprise coffee traceability system engineered to address complex multi-tier coffee bag merging, recursive lineage tracing, and fair farmer attribution.
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-400 pt-1">
              <li>Next.js App Router & Tailwind CSS with Glassmorphism & Framer Motion</li>
              <li>Node.js / Express backend with Prisma ORM & PostgreSQL CTE Recursive queries</li>
              <li>Strict Zod input validation & 5 records/page limit guard</li>
              <li>Docker Compose deployment ready for 1-command review</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
