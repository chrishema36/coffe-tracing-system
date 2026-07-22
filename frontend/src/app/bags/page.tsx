'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBags } from '../../lib/api';
import { BagsTable } from '../../components/BagsTable';
import { MergeModal } from '../../components/MergeModal';
import { LogBagModal } from '../../components/LogBagModal';
import { Package, GitMerge, PlusCircle, Scale, Sparkles, ShieldCheck } from 'lucide-react';

export default function BagsPage() {
  const [isMergeOpen, setIsMergeOpen] = useState(false);
  const [isLogBagOpen, setIsLogBagOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ['allBagsStats'],
    queryFn: () => fetchBags(1, 100),
  });

  const allBags = data?.data || [];
  const totalBags = data?.pagination?.totalRecords || allBags.length;

  const harvestedCount = allBags.filter((b) => b.status === 'HARVESTED').length;
  const storageCount = allBags.filter((b) => b.status === 'IN_STORAGE').length;
  const mergedCount = allBags.filter((b) => b.status === 'MERGED' || b.status === 'EXPORTED').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-borderToken/70 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-amberAccent/10 border border-amberAccent/20 text-amberAccent text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Inventory & Batch Traceability</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-100 flex items-center space-x-2.5 mt-1 tracking-tight">
            <Package className="w-6 h-6 text-amberAccent" />
            <span>Coffee Bags Inventory Management</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Monitor single-farmer harvested bags, in-warehouse storage batches, and composite merged export lots.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsLogBagOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-surface hover:bg-surfaceHover border border-borderToken hover:border-amberAccent text-gray-200 font-bold text-xs transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-amberAccent" />
            <span>Log Single Bag</span>
          </button>

          <button
            onClick={() => setIsMergeOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amberAccent to-amber-600 text-gray-950 font-extrabold text-xs hover:opacity-95 shadow-lg shadow-amberAccent/20 transition-all hover:scale-[1.01]"
          >
            <GitMerge className="w-4 h-4" />
            <span>Execute Bag Merge</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-borderToken/60 bg-surface/80 shadow-md">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Inventory</span>
            <Package className="w-4 h-4 text-amberAccent" />
          </div>
          <div className="mt-2 text-2xl font-black text-gray-100 font-mono">
            {totalBags} <span className="text-xs font-normal text-gray-400">Bags</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-borderToken/60 bg-surface/80 shadow-md">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Harvested</span>
            <span className="w-2 h-2 rounded-full bg-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-blue-400 font-mono">
            {harvestedCount} <span className="text-xs font-normal text-gray-400">Batches</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-borderToken/60 bg-surface/80 shadow-md">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">In Storage</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400 font-mono">
            {storageCount} <span className="text-xs font-normal text-gray-400">Batches</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-borderToken/60 bg-surface/80 shadow-md">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Merged / Exported</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-400 font-mono">
            {mergedCount} <span className="text-xs font-normal text-gray-400">Composite Lots</span>
          </div>
        </div>
      </div>

      {/* Main Inventory Table */}
      <BagsTable onOpenMergeModal={() => setIsMergeOpen(true)} />

      {/* Modals */}
      <MergeModal isOpen={isMergeOpen} onClose={() => setIsMergeOpen(false)} />
      <LogBagModal isOpen={isLogBagOpen} onClose={() => setIsLogBagOpen(false)} />
    </div>
  );
}
