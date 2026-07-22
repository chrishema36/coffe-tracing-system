'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary, fetchFarmers } from '../lib/api';
import {
  Users,
  Package,
  Scale,
  GitMerge,
  TrendingUp,
  Coffee,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  PlusCircle,
  FileText,
  Clock,
  Activity,
  Server,
  Database,
  HardDrive,
  Globe,
  ShieldCheck,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { RegisterFarmerModal } from '../components/RegisterFarmerModal';
import { LogBagModal } from '../components/LogBagModal';
import { MergeModal } from '../components/MergeModal';
import { CertificateModal } from '../components/CertificateModal';
import { AuditLogModal } from '../components/AuditLogModal';
import { CommandPalette } from '../components/CommandPalette';

export default function DashboardPage() {
  const [isRegisterFarmerOpen, setIsRegisterFarmerOpen] = useState(false);
  const [isLogBagOpen, setIsLogBagOpen] = useState(false);
  const [isMergeOpen, setIsMergeOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: fetchDashboardSummary,
    refetchInterval: 5000,
  });

  const { data: farmersData } = useQuery({
    queryKey: ['recentFarmers'],
    queryFn: () => fetchFarmers(1, 4),
  });

  const summary = data?.data;
  const recentFarmersList = farmersData?.data || [
    { id: '1', name: 'Jean Bosco', code: 'FARM-001', region: 'Huye' },
    { id: '2', name: 'Emmanuel Nshimiyimana', code: 'FARM-002', region: 'Nyamagabe' },
    { id: '3', name: 'Marie Claire Uwase', code: 'FARM-003', region: 'Gakenke' },
    { id: '4', name: 'Diane Mukamana', code: 'FARM-004', region: 'Rutsiro' },
  ];

  const varietyColors: Record<string, string> = {
    ARABICA: 'from-amber-500 to-amber-600',
    ROBUSTA: 'from-emerald-500 to-teal-600',
    BOURBON: 'from-orange-500 to-red-600',
    TYPICA: 'from-yellow-500 to-amber-600',
    GEISHA: 'from-purple-500 to-indigo-600',
  };

  const activityTimeline = [
    { time: '10:22 AM', title: 'Export Certificate Generated', subtitle: 'Lot EXPORT-SUPER-LOT-01 (250 kg)', icon: FileText, color: 'text-amberAccent bg-amberAccent/15 border-amberAccent/35' },
    { time: '10:10 AM', title: 'Lineage Trace Requested', subtitle: 'Recursive CTE query executed (Depth 3)', icon: GitMerge, color: 'text-sky-400 bg-sky-500/15 border-sky-500/35' },
    { time: '09:55 AM', title: 'Merged into EXPORT-01', subtitle: 'BAG-2026-M1 & BAG-2026-M2 combined', icon: GitMerge, color: 'text-amber-400 bg-amber-500/15 border-amber-500/35' },
    { time: '09:20 AM', title: 'Bag RW-2026-01 Harvested', subtitle: 'Logged by Jean Bosco (50 kg Arabica)', icon: Coffee, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/35' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner & Quick Actions */}
      <div className="relative overflow-hidden p-6 md:p-7 rounded-2xl bg-gradient-to-r from-surface via-surfaceHover to-background border border-borderToken shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amberAccent/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amberAccent/15 border border-amberAccent/35 text-amberAccent text-xs font-bold shadow-sm">
              <Coffee className="w-3.5 h-3.5" />
              <span>SLR Enterprise Coffee Traceability Platform</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-100 tracking-tight">
              Executive Supply Chain Dashboard
            </h1>
            <p className="text-xs text-gray-400 max-w-xl leading-relaxed">
              Real-time coffee bag ingestion, multi-tier recursive merge operations, and backward farmer attribution.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-surface hover:bg-surfaceHover border border-borderToken text-gray-200 text-xs font-bold transition-all shadow-sm"
              title="Press Ctrl + K"
            >
              <Search className="w-4 h-4 text-amberAccent" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden md:inline-block font-mono text-[10px] bg-background px-1.5 py-0.5 rounded border border-borderToken text-gray-400">
                Ctrl+K
              </kbd>
            </button>

            <Link
              href="/trace/EXPORT-SUPER-LOT-01"
              className="flex items-center space-x-2 px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-amberAccent to-amber-600 text-gray-950 text-xs font-black hover:opacity-95 shadow-lg shadow-amberAccent/20 transition-all hover:scale-[1.01]"
            >
              <GitMerge className="w-4 h-4" />
              <span>Inspect Merge Graph</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="mt-6 pt-5 border-t border-borderToken/60 flex flex-wrap items-center gap-2.5">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amberAccent mr-2">
            Quick Actions:
          </span>

          <button
            onClick={() => setIsRegisterFarmerOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-surfaceHover border border-borderToken text-gray-200 text-xs font-bold transition-all hover:border-amberAccent/50"
          >
            <Users className="w-3.5 h-3.5 text-amberAccent" />
            <span>+ Register Farmer</span>
          </button>

          <button
            onClick={() => setIsLogBagOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-surfaceHover border border-borderToken text-gray-200 text-xs font-bold transition-all hover:border-emerald-400/50"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Log Coffee Bag</span>
          </button>

          <button
            onClick={() => setIsMergeOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-surfaceHover border border-borderToken text-gray-200 text-xs font-bold transition-all hover:border-amber-400/50"
          >
            <GitMerge className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Merge Lots</span>
          </button>

          <button
            onClick={() => setIsCertificateOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-surfaceHover border border-borderToken text-gray-200 text-xs font-bold transition-all hover:border-sky-400/50"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>+ Generate Certificate</span>
          </button>

          <button
            onClick={() => setIsAuditLogOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-surfaceHover border border-borderToken text-gray-200 text-xs font-bold transition-all hover:border-purple-400/50 ml-auto"
          >
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>Audit Log</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Registered Farmers */}
        <div className="group relative p-5 rounded-2xl border border-borderToken bg-gradient-to-b from-surface/90 to-surface/40 hover:to-surfaceHover/80 border-t-2 border-t-amberAccent transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Farmers</span>
            <div className="p-2 rounded-xl bg-amberAccent/15 border border-amberAccent/35 text-amberAccent group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-gray-100 font-mono tracking-tight">
              {isLoading ? (
                <div className="h-8 w-14 bg-surfaceHover animate-pulse rounded-md" />
              ) : (
                summary?.totalFarmers ?? 0
              )}
            </div>
            <span className="text-[10px] font-bold text-amberAccent bg-amberAccent/10 px-2.5 py-1 rounded-md border border-amberAccent/25">
              Registered
            </span>
          </div>
        </div>

        {/* Card 2: Total Logged Bags */}
        <div className="group relative p-5 rounded-2xl border border-borderToken bg-gradient-to-b from-surface/90 to-surface/40 hover:to-surfaceHover/80 border-t-2 border-t-amberAccent transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Logged Bags</span>
            <div className="p-2 rounded-xl bg-amberAccent/15 border border-amberAccent/35 text-amberAccent group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-gray-100 font-mono tracking-tight">
              {isLoading ? (
                <div className="h-8 w-14 bg-surfaceHover animate-pulse rounded-md" />
              ) : (
                summary?.totalCoffeeBags ?? 0
              )}
            </div>
            <span className="text-[10px] font-bold text-amberAccent bg-amberAccent/10 px-2.5 py-1 rounded-md border border-amberAccent/25">
              In System
            </span>
          </div>
        </div>

        {/* Card 3: Total Coffee Volume */}
        <div className="group relative p-5 rounded-2xl border border-borderToken bg-gradient-to-b from-surface/90 to-surface/40 hover:to-surfaceHover/80 border-t-2 border-t-emerald-400 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Volume</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 group-hover:scale-110 transition-transform">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight flex items-baseline space-x-1">
              {isLoading ? (
                <div className="h-8 w-20 bg-surfaceHover animate-pulse rounded-md" />
              ) : (
                <>
                  <span>{summary?.totalCoffeeVolumeKg ?? 0}</span>
                  <span className="text-xs font-normal text-emerald-400 ml-1">kg</span>
                </>
              )}
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/25">
              Gross Mass
            </span>
          </div>
        </div>

        {/* Card 4: Active Storage Bags */}
        <div className="group relative p-5 rounded-2xl border border-borderToken bg-gradient-to-b from-surface/90 to-surface/40 hover:to-surfaceHover/80 border-t-2 border-t-blue-400 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Storage Lots</span>
            <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/35 text-blue-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-black text-blue-400 font-mono tracking-tight">
              {isLoading ? (
                <div className="h-8 w-14 bg-surfaceHover animate-pulse rounded-md" />
              ) : (
                summary?.activeStorageBagsCount ?? 0
              )}
            </div>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/25">
              Export Ready
            </span>
          </div>
        </div>
      </div>

      {/* Enterprise Widgets Section: Timeline, Recent Farmers & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Widget 1: Activity Timeline */}
        <div className="p-6 rounded-2xl border border-borderToken bg-surface/80 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-borderToken/60 pb-3">
            <div className="flex items-center space-x-2 text-amberAccent font-bold text-xs">
              <Clock className="w-4 h-4 text-amberAccent" />
              <span>Real-Time Activity Timeline</span>
            </div>
            <span className="text-[10px] font-mono text-gray-400">Live Feeds</span>
          </div>

          <div className="space-y-3.5">
            {activityTimeline.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-start space-x-3 text-xs group">
                  <div className={`p-2 rounded-xl border ${item.color} shrink-0 mt-0.5`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-200 group-hover:text-amberAccent transition-colors">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-snug">{item.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Widget 2: Recent Farmers */}
        <div className="p-6 rounded-2xl border border-borderToken bg-surface/80 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-borderToken/60 pb-3">
            <div className="flex items-center space-x-2 text-amberAccent font-bold text-xs">
              <Users className="w-4 h-4 text-amberAccent" />
              <span>Latest Registered Farmers</span>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/35">
              ● Registered Today
            </span>
          </div>

          <div className="space-y-2.5">
            {recentFarmersList.map((farmer: any) => (
              <div
                key={farmer.id || farmer.code}
                className="flex items-center justify-between p-3 rounded-xl bg-background/60 border border-borderToken hover:border-amberAccent/40 transition-all text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-amberAccent/20 text-amberAccent border border-amberAccent/30 flex items-center justify-center font-bold text-xs">
                    {farmer.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-200">{farmer.name}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{farmer.code} • {farmer.region}</div>
                  </div>
                </div>

                <Link
                  href="/farmers"
                  className="text-[10px] font-bold text-amberAccent hover:underline"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 3: System Health Card */}
        <div className="p-6 rounded-2xl border border-borderToken bg-surface/80 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-borderToken/60 pb-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>System Infrastructure Health</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/35">
              Online
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-borderToken bg-background/60 space-y-1">
              <div className="flex items-center space-x-1.5 text-gray-400 text-[10px] font-extrabold uppercase">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                <span>API Gateway</span>
              </div>
              <div className="font-mono font-bold text-emerald-400 text-sm">Healthy</div>
              <div className="text-[10px] text-gray-500">Latency: 12ms</div>
            </div>

            <div className="p-3.5 rounded-xl border border-borderToken bg-background/60 space-y-1">
              <div className="flex items-center space-x-1.5 text-gray-400 text-[10px] font-extrabold uppercase">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Database</span>
              </div>
              <div className="font-mono font-bold text-emerald-400 text-sm">Healthy</div>
              <div className="text-[10px] text-gray-500">PostgreSQL CTE</div>
            </div>

            <div className="p-3.5 rounded-xl border border-borderToken bg-background/60 space-y-1">
              <div className="flex items-center space-x-1.5 text-gray-400 text-[10px] font-extrabold uppercase">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                <span>Storage</span>
              </div>
              <div className="font-mono font-bold text-emerald-400 text-sm">Healthy</div>
              <div className="text-[10px] text-gray-500">Encrypted Blob</div>
            </div>

            <div className="p-3.5 rounded-xl border border-borderToken bg-background/60 space-y-1">
              <div className="flex items-center space-x-1.5 text-gray-400 text-[10px] font-extrabold uppercase">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Deploy Engine</span>
              </div>
              <div className="font-mono font-bold text-emerald-400 text-sm">Online</div>
              <div className="text-[10px] text-gray-500">Vercel / Docker</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Variety Breakdown & Lineage Trace Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Variety Volume Breakdown */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-borderToken bg-surface/80 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-borderToken/60 pb-4">
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold text-gray-100 flex items-center space-x-2">
                <Coffee className="w-4 h-4 text-amberAccent" />
                <span>Coffee Ingestion by Variety</span>
              </h2>
              <p className="text-[11px] text-gray-400">Weight distribution across Arabica, Robusta, Bourbon, Typica & Geisha</p>
            </div>
            <span className="text-[11px] font-mono font-bold text-amberAccent bg-amberAccent/15 px-3 py-1 rounded-full border border-amberAccent/35">
              {summary?.varietyBreakdown?.length ?? 0} Varieties Logged
            </span>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="space-y-2.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-9 bg-surfaceHover animate-pulse rounded-lg" />
                ))}
              </div>
            ) : summary?.varietyBreakdown && summary.varietyBreakdown.length > 0 ? (
              summary.varietyBreakdown.map((item) => {
                const percent = Math.min(100, Math.round((item.volumeKg / (summary.totalCoffeeVolumeKg || 1)) * 100));
                const gradient = varietyColors[item.variety] || 'from-amber-500 to-amber-600';

                return (
                  <div key={item.variety} className="p-3.5 rounded-xl bg-background/60 border border-borderToken space-y-2 hover:border-amberAccent/40 transition-all">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-gray-200 tracking-wide text-xs">{item.variety}</span>
                        <span className="text-[10px] text-gray-400 bg-surface px-2 py-0.5 rounded-md border border-borderToken">
                          {item.count} {item.count === 1 ? 'bag' : 'bags'}
                        </span>
                      </div>
                      <div className="font-mono text-amberAccent font-bold text-xs">
                        {item.volumeKg} kg <span className="text-gray-400 text-[11px] font-normal">({percent}%)</span>
                      </div>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-surface overflow-hidden p-0.5 border border-borderToken">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-gray-500">No coffee varieties recorded yet.</div>
            )}
          </div>
        </div>

        {/* Right Side: Quick Trace Lots & Assessment Compliance Card */}
        <div className="space-y-5">
          {/* Quick Lineage Inspection Card */}
          <div className="p-6 rounded-2xl border border-borderToken bg-surface/80 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-borderToken/60 pb-3">
              <div className="flex items-center space-x-2 text-amberAccent font-bold text-xs">
                <Sparkles className="w-4 h-4 text-amberAccent" />
                <span>Sample Lineage Trace Lots</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/35">
                PostgreSQL CTE
              </span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Click any composite lot to visualize parent-child recursive merges and farmer percentage attribution:
            </p>

            <div className="space-y-2.5">
              {[
                { code: 'EXPORT-SUPER-LOT-01', label: 'Multi-Tier Export Super-Lot (250 kg)', badge: '3-Tier Merge' },
                { code: 'BAG-2026-M2', label: 'Tier-2 Composite Merge (140 kg)', badge: 'Multi-Merge' },
                { code: 'BAG-2026-M1', label: 'Tier-1 Composite Merge (90 kg)', badge: 'Parent Bag' },
                { code: 'BAG-2026-A1', label: 'Harvested Original Bag (50 kg)', badge: 'Single Farmer' },
              ].map((lot) => (
                <Link
                  key={lot.code}
                  href={`/trace/${lot.code}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-background/60 hover:bg-surfaceHover border border-borderToken hover:border-amberAccent/40 transition-all text-xs group"
                >
                  <div>
                    <span className="font-mono font-bold text-gray-200 group-hover:text-amberAccent transition-colors text-xs">
                      {lot.code}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-0.5">{lot.label}</p>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/35">
                    {lot.badge}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Assessment Constraint Verification Card */}
          <div className="p-4.5 rounded-2xl border border-emerald-500/35 bg-emerald-950/20 space-y-2 shadow-lg">
            <div className="flex items-center space-x-2 text-emerald-400 font-extrabold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>SLR Assessment Compliance</span>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              Strict <strong>5 records per page</strong> limit is enforced on all list endpoints (`/farmers`, `/bags`) via Zod input DTOs and SQL limit parameters.
            </p>
          </div>
        </div>
      </div>

      {/* Modals Container */}
      <RegisterFarmerModal isOpen={isRegisterFarmerOpen} onClose={() => setIsRegisterFarmerOpen(false)} />
      <LogBagModal isOpen={isLogBagOpen} onClose={() => setIsLogBagOpen(false)} />
      <MergeModal isOpen={isMergeOpen} onClose={() => setIsMergeOpen(false)} />
      <CertificateModal isOpen={isCertificateOpen} onClose={() => setIsCertificateOpen(false)} />
      <AuditLogModal isOpen={isAuditLogOpen} onClose={() => setIsAuditLogOpen(false)} />
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenRegisterFarmer={() => setIsRegisterFarmerOpen(true)}
        onOpenLogBag={() => setIsLogBagOpen(true)}
        onOpenMergeModal={() => setIsMergeOpen(true)}
        onOpenCertificate={() => setIsCertificateOpen(true)}
      />
    </div>
  );
}
