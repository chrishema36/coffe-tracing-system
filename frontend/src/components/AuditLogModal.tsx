'use client';

import React, { useState } from 'react';
import { X, Activity, Filter, Clock, User, Coffee, GitMerge, FileText } from 'lucide-react';
import { ModalBody, ModalFooter, ModalHeader, ModalShell } from './ModalShell';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Sample operational events for the demo UI (not a persisted audit backend). */
const sampleLogs = [
  {
    id: 'LOG-001',
    timestamp: '2026-07-22 17:45:10',
    action: 'EXPORT_CERTIFICATE_GENERATED',
    details: 'Origin certificate generated for EXPORT-SUPER-LOT-01 (250 kg)',
    actor: 'Ops Console',
    icon: FileText,
    badgeColor: 'text-amberAccent bg-amberAccent/15 border-amberAccent/35',
  },
  {
    id: 'LOG-002',
    timestamp: '2026-07-22 17:10:04',
    action: 'LINEAGE_TRACE_EXECUTION',
    details: 'Backward lineage trace for EXPORT-SUPER-LOT-01 (multi-tier DAG walk)',
    actor: 'Buyer Portal',
    icon: GitMerge,
    badgeColor: 'text-sky-400 bg-sky-500/15 border-sky-500/35',
  },
  {
    id: 'LOG-003',
    timestamp: '2026-07-22 16:30:22',
    action: 'BAGS_MERGED',
    details: 'Merged BAG-2026-M1 (90 kg) and BAG-2026-M2 (140 kg) into EXPORT-SUPER-LOT-01',
    actor: 'Warehouse Ops',
    icon: GitMerge,
    badgeColor: 'text-amber-400 bg-amber-500/15 border-amber-500/35',
  },
  {
    id: 'LOG-004',
    timestamp: '2026-07-22 15:12:00',
    action: 'BAG_LOGGED',
    details: 'Harvest bag BAG-2026-A1 registered (50 kg, Arabica) for Jean-Luc Habimana',
    actor: 'Field Registrar',
    icon: Coffee,
    badgeColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/35',
  },
  {
    id: 'LOG-005',
    timestamp: '2026-07-22 14:05:18',
    action: 'FARMER_REGISTERED',
    details: 'Registered farmer Emmanuel Nshimiyimana (FRM-RWA-003, Gakenke)',
    actor: 'System Registrar',
    icon: User,
    badgeColor: 'text-violet-400 bg-violet-500/15 border-violet-500/35',
  },
];

export function AuditLogModal({ isOpen, onClose }: AuditLogModalProps) {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredLogs = sampleLogs.filter((log) => {
    if (filterType === 'ALL') return true;
    return log.action.includes(filterType);
  });

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} maxWidthClass="max-w-3xl" zClass="z-[120]">
      <ModalHeader className="bg-surfaceHover/30">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 shrink-0">
              <Activity className="w-5 sm:w-6 h-5 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-gray-100 tracking-tight">
                Recent Activity
              </h2>
              <p className="text-xs text-gray-400 truncate">
                Sample timeline for demo review
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border border-borderToken text-gray-400 hover:text-gray-100 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </ModalHeader>

      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-borderToken bg-background/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-amberAccent" />
          <span className="font-bold text-gray-300">Filter</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'BAG', 'MERGE', 'TRACE', 'CERTIFICATE'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                filterType === type
                  ? 'bg-amberAccent text-gray-950 shadow-sm'
                  : 'bg-surface hover:bg-surfaceHover text-gray-400 hover:text-gray-200 border border-borderToken'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <ModalBody className="space-y-3">
        {filteredLogs.map((log) => {
          const Icon = log.icon;
          return (
            <div
              key={log.id}
              className="p-4 rounded-xl border border-borderToken bg-background/50 hover:border-amberAccent/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start space-x-3 min-w-0">
                <div className={`p-2.5 rounded-xl border ${log.badgeColor} shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-gray-200 break-all">{log.action}</span>
                    <span className="text-[10px] text-gray-500 font-mono">({log.id})</span>
                  </div>
                  <p className="text-gray-300 leading-snug">{log.details}</p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between text-[11px] text-gray-400 shrink-0 gap-1">
                <div className="flex items-center space-x-1 font-mono">
                  <Clock className="w-3 h-3 text-amberAccent" />
                  <span>{log.timestamp}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3 text-gray-500" />
                  <span>{log.actor}</span>
                </div>
              </div>
            </div>
          );
        })}
      </ModalBody>

      <ModalFooter>
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>Showing {filteredLogs.length} sample events</span>
          <span className="font-mono text-amberAccent text-[11px]">Demo timeline</span>
        </div>
      </ModalFooter>
    </ModalShell>
  );
}
