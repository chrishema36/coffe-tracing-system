'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBags } from '../lib/api';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  GitMerge,
  Scale,
  Sparkles,
  Search,
  PlusCircle,
  Copy,
  Check,
  Package,
  SlidersHorizontal,
  Maximize2,
  Minimize2,
  MapPin,
  User,
} from 'lucide-react';
import { LogBagModal } from './LogBagModal';

export function BagsTable({ onOpenMergeModal }: { onOpenMergeModal?: () => void }) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isLogBagOpen, setIsLogBagOpen] = useState(false);

  const limit = 5; // Strict limit!

  const { data, isLoading, isError } = useQuery({
    queryKey: ['bags', page, statusFilter],
    queryFn: () => fetchBags(page, limit, statusFilter),
  });

  const allBags = data?.data || [];
  const meta = data?.pagination;

  const bags = allBags.filter((b) => {
    const matchesSearch =
      !search ||
      b.bagCode.toLowerCase().includes(search.toLowerCase()) ||
      b.variety.toLowerCase().includes(search.toLowerCase()) ||
      (b.farmer && b.farmer.name.toLowerCase().includes(search.toLowerCase()));

    const matchesProvince =
      !provinceFilter ||
      (b.farmer && b.farmer.region.toLowerCase().includes(provinceFilter.toLowerCase()));

    return matchesSearch && matchesProvince;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HARVESTED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'MERGED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'EXPORTED':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'IN_STORAGE':
      default:
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    }
  };

  const cellPadding = density === 'comfortable' ? 'px-6 py-4' : 'px-6 py-2';

  return (
    <div className="space-y-4">
      {/* Search, Filters, and Density Toolbar */}
      <div className="p-4 rounded-2xl border border-borderToken bg-surface/80 space-y-3 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5 min-w-0">
            {[
              { id: '', label: 'All Statuses' },
              { id: 'HARVESTED', label: 'Harvested (Green)' },
              { id: 'IN_STORAGE', label: 'In Storage (Purple)' },
              { id: 'MERGED', label: 'Merged (Orange)' },
              { id: 'EXPORTED', label: 'Exported (Blue)' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  setStatusFilter(st.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap shrink-0 ${
                  statusFilter === st.id
                    ? 'bg-amberAccent text-gray-950 border-amberAccent shadow-md shadow-amberAccent/10 font-bold'
                    : 'bg-background border-borderToken text-gray-400 hover:text-gray-100 hover:bg-surfaceHover'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Table Density Switcher */}
          <div className="flex items-center space-x-2 shrink-0 bg-background/80 p-1 rounded-xl border border-borderToken">
            <span className="text-[10px] font-bold text-gray-400 px-2 uppercase">Density:</span>
            <button
              onClick={() => setDensity('comfortable')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                density === 'comfortable'
                  ? 'bg-surface text-amberAccent border border-amberAccent/30 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Maximize2 className="w-3 h-3" />
              <span>Comfortable</span>
            </button>
            <button
              onClick={() => setDensity('compact')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                density === 'compact'
                  ? 'bg-surface text-amberAccent border border-amberAccent/30 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Minimize2 className="w-3 h-3" />
              <span>Compact</span>
            </button>
          </div>
        </div>

        {/* Filter Inputs & Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-borderToken/60">
          <div className="flex items-center space-x-2 w-full sm:w-auto flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search code, variety, farmer..."
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-background border border-borderToken text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amberAccent transition-all"
              />
            </div>

            <div className="relative w-44">
              <MapPin className="w-3.5 h-3.5 text-amberAccent absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={provinceFilter}
                onChange={(e) => setProvinceFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-background border border-borderToken text-gray-200 focus:outline-none focus:border-amberAccent transition-all"
              >
                <option value="">All Provinces</option>
                <option value="Huye">Huye</option>
                <option value="Nyamagabe">Nyamagabe</option>
                <option value="Gakenke">Gakenke</option>
                <option value="Rutsiro">Rutsiro</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsLogBagOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-background border border-borderToken hover:border-amberAccent/50 text-gray-200 text-xs font-bold transition-all shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amberAccent" />
              <span>Log Bag</span>
            </button>

            {onOpenMergeModal && (
              <button
                onClick={onOpenMergeModal}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amberAccent to-amber-600 text-gray-950 text-xs font-extrabold hover:opacity-95 shadow-md shadow-amberAccent/20 transition-all shrink-0"
              >
                <GitMerge className="w-4 h-4" />
                <span>Execute Merge</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-borderToken bg-surface/90 overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-background/80 text-[11px] uppercase tracking-wider text-gray-400 border-b border-borderToken font-bold">
              <tr>
                <th className="px-6 py-4">Bag Identification</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Variety</th>
                <th className="px-6 py-4">Mass Weight</th>
                <th className="px-6 py-4">Origin / Farmer</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderToken/70">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 rounded-full border-2 border-amberAccent border-t-transparent animate-spin" />
                      <span>Loading coffee bags dataset...</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-red-400 font-medium">
                    Failed to load coffee bags. Ensure backend server is running.
                  </td>
                </tr>
              ) : bags.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No coffee bags found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                bags.map((bag) => (
                  <tr key={bag.id} className="hover:bg-surfaceHover/90 transition-all duration-150 group">
                    {/* Bag Code */}
                    <td className={cellPadding}>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-amberAccent text-xs tracking-wide">
                          {bag.bagCode}
                        </span>
                        <button
                          onClick={() => handleCopyCode(bag.bagCode)}
                          title="Copy bag code"
                          className="p-1 rounded-md text-gray-500 hover:text-gray-200 hover:bg-background transition-colors opacity-0 group-hover:opacity-100"
                        >
                          {copiedCode === bag.bagCode ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Status Badge with Distinct Colors */}
                    <td className={cellPadding}>
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider border uppercase ${getStatusBadge(
                          bag.status
                        )}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        <span>{bag.status.replace('_', ' ')}</span>
                      </span>
                    </td>

                    {/* Variety */}
                    <td className={cellPadding}>
                      <span className="text-xs text-gray-200 font-semibold">{bag.variety}</span>
                    </td>

                    {/* Weight */}
                    <td className={cellPadding}>
                      <div className="flex items-center space-x-1.5 font-mono text-xs">
                        <Scale className="w-3.5 h-3.5 text-amberAccent/80 shrink-0" />
                        <span className="text-gray-100 font-bold">{bag.currentWeightKg} kg</span>
                        <span className="text-gray-500 text-[11px]">({bag.initialWeightKg} kg init)</span>
                      </div>
                    </td>

                    {/* Origin / Farmer */}
                    <td className={`${cellPadding} text-xs`}>
                      {bag.farmer ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-md bg-amberAccent/10 border border-amberAccent/30 flex items-center justify-center text-amberAccent font-bold text-[10px]">
                            {bag.farmer.name[0]}
                          </div>
                          <div>
                            <span className="text-gray-100 font-medium">{bag.farmer.name}</span>
                            <p className="text-[10px] text-gray-500">{bag.farmer.region}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amberAccent/10 border border-amberAccent/30 text-amberAccent text-[11px] font-bold">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Composite Merged Lot</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className={`${cellPadding} text-right`}>
                      <Link
                        href={`/trace/${bag.bagCode}`}
                        className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl border border-borderToken bg-surfaceHover text-amberAccent hover:border-amberAccent hover:bg-amberAccent hover:text-gray-950 text-xs font-bold transition-all shadow-sm"
                      >
                        <GitMerge className="w-3.5 h-3.5" />
                        <span>Trace Lineage</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginated Footer */}
        {meta && (
          <div className="px-6 py-4 border-t border-borderToken bg-background/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
            <div>
              Showing Page <span className="font-bold text-gray-100">{meta.page}</span> of{' '}
              <span className="font-bold text-gray-100">{meta.totalPages}</span> ({meta.totalRecords} Total Coffee Bags)
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-[11px] font-bold text-amberAccent bg-amberAccent/10 px-3 py-1 rounded-lg border border-amberAccent/20">
                5 per page (Strict Limit)
              </span>

              <div className="flex items-center space-x-1.5">
                <button
                  disabled={!meta.hasPrevPage}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-2 rounded-xl border border-borderToken bg-surface hover:bg-surfaceHover disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-300 hover:text-gray-100"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={!meta.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-xl border border-borderToken bg-surface hover:bg-surfaceHover disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-300 hover:text-gray-100"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <LogBagModal isOpen={isLogBagOpen} onClose={() => setIsLogBagOpen(false)} />
    </div>
  );
}
