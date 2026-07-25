'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchBagForwardTrace, fetchBagTrace } from '../../../lib/api';
import { TraceabilityGraph } from '../../../components/TraceabilityGraph';
import { CertificateModal } from '../../../components/CertificateModal';
import {
  GitMerge,
  MapPin,
  Scale,
  ShieldCheck,
  ArrowLeft,
  Search,
  Copy,
  Check,
  Layers,
  Users,
  Award,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import Link from 'next/link';

export default function TraceabilityPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const bagId = params.id;
  const [searchInput, setSearchInput] = useState(bagId);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [direction, setDirection] = useState<'backward' | 'forward'>('backward');

  useEffect(() => {
    setSearchInput(bagId);
  }, [bagId]);

  const backwardQuery = useQuery({
    queryKey: ['bagTrace', bagId],
    queryFn: () => fetchBagTrace(bagId),
    enabled: direction === 'backward',
  });

  const forwardQuery = useQuery({
    queryKey: ['bagForwardTrace', bagId],
    queryFn: () => fetchBagForwardTrace(bagId),
    enabled: direction === 'forward',
  });

  const isLoading = direction === 'backward' ? backwardQuery.isLoading : forwardQuery.isLoading;
  const isError = direction === 'backward' ? backwardQuery.isError : forwardQuery.isError;
  const trace = backwardQuery.data?.data;
  const forward = forwardQuery.data?.data;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/trace/${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(bagId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-borderToken/80 pb-6">
        <div className="flex items-start sm:items-center space-x-3.5 min-w-0">
          <Link
            href="/bags"
            className="p-2.5 rounded-xl border border-borderToken bg-surface hover:bg-surfaceHover text-gray-400 hover:text-gray-100 transition-all shadow-sm shrink-0"
            aria-label="Back to Bags"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <h1 className="text-xl sm:text-2xl font-black font-mono text-amberAccent tracking-tight whitespace-nowrap flex items-center space-x-2">
                <span>{bagId}</span>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg hover:bg-surfaceHover text-gray-400 hover:text-gray-200 transition-colors"
                  title="Copy bag code"
                >
                  {copiedCode ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </h1>

              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 text-xs font-extrabold whitespace-nowrap shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{direction === 'backward' ? 'Origin Trace' : 'Downstream Trace'}</span>
              </span>
            </div>

            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              {direction === 'backward'
                ? 'Backward lineage to harvest bags and farmer mass attributions.'
                : 'Forward lineage into composite / export lots this bag contributed to.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex rounded-xl border border-borderToken overflow-hidden text-xs font-bold">
            <button
              type="button"
              onClick={() => setDirection('backward')}
              className={`px-3 py-2 inline-flex items-center gap-1.5 ${
                direction === 'backward'
                  ? 'bg-amberAccent text-gray-950'
                  : 'bg-surface text-gray-400 hover:text-gray-200'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Origin
            </button>
            <button
              type="button"
              onClick={() => setDirection('forward')}
              className={`px-3 py-2 inline-flex items-center gap-1.5 border-l border-borderToken ${
                direction === 'forward'
                  ? 'bg-amberAccent text-gray-950'
                  : 'bg-surface text-gray-400 hover:text-gray-200'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Downstream
            </button>
          </div>

          <form onSubmit={handleSearch} className="relative w-full sm:w-80 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Trace any bag / lot code..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-surface border border-borderToken text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amberAccent focus:ring-1 focus:ring-amberAccent transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-surface border border-borderToken text-xs font-bold text-gray-200 hover:border-amberAccent/50"
            >
              Go
            </button>
          </form>

          {direction === 'backward' && (
            <button
              onClick={() => setIsCertificateOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amberAccent to-amber-600 text-gray-950 font-black text-xs hover:opacity-95 shadow-md shadow-amberAccent/20 transition-all shrink-0"
            >
              <Award className="w-4 h-4" />
              <span>Generate Certificate</span>
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-gray-400 rounded-2xl border border-borderToken bg-surface shadow-2xl flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 rounded-full border-3 border-amberAccent border-t-transparent animate-spin" />
          <p className="text-sm font-semibold">
            {direction === 'backward'
              ? 'Executing backward lineage trace & computing farmer mass attributions...'
              : 'Walking forward merge edges to descendant lots...'}
          </p>
        </div>
      ) : isError || (direction === 'backward' ? !trace : !forward) ? (
        <div className="p-16 text-center text-red-400 rounded-2xl border border-borderToken bg-surface shadow-2xl space-y-2">
          <h2 className="text-base font-bold">Traceability Data Unavailable</h2>
          <p className="text-xs text-gray-400">
            Failed to resolve lineage for{' '}
            <span className="font-mono text-amberAccent">{bagId}</span>. Check the bag code and API
            connection.
          </p>
          <div className="pt-3">
            <Link
              href="/bags"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-amberAccent text-gray-950 text-xs font-bold hover:opacity-90 transition-all"
            >
              <span>View All Bags Inventory</span>
            </Link>
          </div>
        </div>
      ) : direction === 'forward' && forward ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-borderToken bg-surface border-t-2 border-t-amberAccent">
              <div className="text-[10px] uppercase font-extrabold text-gray-400">Source Bag</div>
              <div className="mt-2 font-mono font-black text-amberAccent text-lg">
                {forward.sourceBag.bagCode}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {forward.sourceBag.farmerName || 'Composite / merged lot'}
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-borderToken bg-surface border-t-2 border-t-sky-400">
              <div className="text-[10px] uppercase font-extrabold text-gray-400">Descendant Lots</div>
              <div className="mt-2 text-3xl font-black font-mono text-sky-400">
                {forward.totalDescendantLots}
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-borderToken bg-surface border-t-2 border-t-purple-400">
              <div className="text-[10px] uppercase font-extrabold text-gray-400">Graph Edges</div>
              <div className="mt-2 text-3xl font-black font-mono text-purple-400">
                {forward.graphEdges.length}
              </div>
            </div>
          </div>

          {forward.graphNodes.length > 1 && (
            <div className="space-y-3">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-gray-300 flex items-center space-x-2">
                <GitMerge className="w-4 h-4 text-amberAccent" />
                <span>Downstream Merge Graph</span>
              </h2>
              <TraceabilityGraph
                traceData={{
                  targetBag: {
                    id: forward.sourceBag.id,
                    bagCode: forward.sourceBag.bagCode,
                    currentWeightKg: forward.sourceBag.currentWeightKg,
                    initialWeightKg: forward.sourceBag.initialWeightKg,
                    status: forward.sourceBag.status,
                    variety: forward.sourceBag.variety,
                  },
                  totalOriginFarmersCount: 0,
                  farmerAttributions: [],
                  graphNodes: forward.graphNodes,
                  graphEdges: forward.graphEdges,
                }}
              />
            </div>
          )}

          <div className="rounded-2xl border border-borderToken bg-surface overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-borderToken text-xs font-bold text-gray-300">
              Lots this bag fed into
            </div>
            {forward.descendantLots.length === 0 ? (
              <p className="p-8 text-center text-xs text-gray-500">
                No downstream merges yet. This bag has not been merged into another lot.
              </p>
            ) : (
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-background/90 text-[11px] uppercase tracking-wider text-gray-400 border-b border-borderToken font-extrabold">
                  <tr>
                    <th className="px-6 py-3">Lot Code</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Depth</th>
                    <th className="px-6 py-3">Weight Received</th>
                    <th className="px-6 py-3 text-right">Trace</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderToken/70">
                  {forward.descendantLots.map((lot) => (
                    <tr key={lot.id} className="hover:bg-surfaceHover/90">
                      <td className="px-6 py-3 font-mono font-bold text-amberAccent text-xs">
                        {lot.bagCode}
                      </td>
                      <td className="px-6 py-3 text-xs">{lot.status}</td>
                      <td className="px-6 py-3 font-mono text-xs">{lot.depth}</td>
                      <td className="px-6 py-3 font-mono text-xs">{lot.weightReceivedKg} kg</td>
                      <td className="px-6 py-3 text-right">
                        <Link
                          href={`/trace/${encodeURIComponent(lot.bagCode)}`}
                          className="text-[11px] font-bold text-amberAccent hover:underline"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="group relative p-5 rounded-2xl border border-borderToken bg-gradient-to-b from-surface/90 to-surface/40 hover:to-surfaceHover/80 border-t-2 border-t-amberAccent transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                  Target Mass
                </span>
                <div className="p-2 rounded-xl bg-amberAccent/15 border border-amberAccent/30 text-amberAccent group-hover:scale-110 transition-transform">
                  <Scale className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-3xl font-black text-gray-100 font-mono tracking-tight">
                  {trace!.targetBag.currentWeightKg}
                  <span className="text-sm font-semibold text-amberAccent ml-1.5">kg</span>
                </div>
                <span className="text-[10px] font-bold text-amberAccent bg-amberAccent/10 px-2.5 py-1 rounded-md border border-amberAccent/25">
                  Export Lot
                </span>
              </div>
            </div>

            <div className="group relative p-5 rounded-2xl border border-borderToken bg-gradient-to-b from-surface/90 to-surface/40 hover:to-surfaceHover/80 border-t-2 border-t-emerald-400 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                  Farmer Origins
                </span>
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                  {trace!.farmerAttributions.length}
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/25">
                  Smallholders
                </span>
              </div>
            </div>

            <div className="group relative p-5 rounded-2xl border border-borderToken bg-gradient-to-b from-surface/90 to-surface/40 hover:to-surfaceHover/80 border-t-2 border-t-blue-400 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                  Graph Nodes
                </span>
                <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 group-hover:scale-110 transition-transform">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-3xl font-black text-blue-400 font-mono tracking-tight">
                  {trace!.graphNodes.length}
                </div>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/25">
                  Batches Logged
                </span>
              </div>
            </div>

            <div className="group relative p-5 rounded-2xl border border-borderToken bg-gradient-to-b from-surface/90 to-surface/40 hover:to-surfaceHover/80 border-t-2 border-t-purple-400 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                  Merge Edges
                </span>
                <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 group-hover:scale-110 transition-transform">
                  <GitMerge className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-3xl font-black text-purple-400 font-mono tracking-tight">
                  {trace!.graphEdges.length}
                </div>
                <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/25">
                  DAG Relations
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-gray-300 flex items-center space-x-2">
                <GitMerge className="w-4 h-4 text-amberAccent" />
                <span>Interactive Merge Lineage DAG</span>
              </h2>
              <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30">
                Zero Cycle Loop Guarantee
              </span>
            </div>
            <TraceabilityGraph traceData={trace!} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-gray-300 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Attributed Farmer Origin Breakdown</span>
              </h2>
              <span className="text-xs text-gray-400">
                Calculated recursively across all constituent harvest lots
              </span>
            </div>

            <div className="rounded-2xl border border-borderToken bg-surface overflow-hidden shadow-2xl">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-background/90 text-[11px] uppercase tracking-wider text-gray-400 border-b border-borderToken font-extrabold">
                    <tr>
                      <th className="px-6 py-4">Farmer Code</th>
                      <th className="px-6 py-4">Farmer Name</th>
                      <th className="px-6 py-4">Region & Country</th>
                      <th className="px-6 py-4">Mass Contributed</th>
                      <th className="px-6 py-4">Contribution %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-borderToken/70">
                    {trace!.farmerAttributions.map((farmer) => (
                      <tr key={farmer.farmerId} className="hover:bg-surfaceHover/90 transition-all duration-150">
                        <td className="px-6 py-4 font-mono font-bold text-amberAccent text-xs whitespace-nowrap">
                          {farmer.farmerCode}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-100">{farmer.farmerName}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1.5 text-xs text-gray-300">
                            <MapPin className="w-3.5 h-3.5 text-amberAccent shrink-0" />
                            <span>
                              {farmer.region}, {farmer.country}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-200">
                          <div className="flex items-center space-x-1.5">
                            <Scale className="w-3.5 h-3.5 text-gray-400" />
                            <span className="font-bold">{farmer.contributedWeightKg} kg</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-32 h-2.5 rounded-full bg-background overflow-hidden border border-borderToken">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                                style={{ width: `${farmer.contributionPercentage}%` }}
                              />
                            </div>
                            <span className="font-mono text-xs font-extrabold text-emerald-400">
                              {farmer.contributionPercentage}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        lotId={bagId}
        weightKg={trace?.targetBag.currentWeightKg || 250}
        farmers={trace?.farmerAttributions.map((f) => f.farmerName)}
        attributions={trace?.farmerAttributions}
        variety={trace?.targetBag.variety}
        qualityScore={trace?.targetBag.qualityScore || 95}
        moisturePercent={trace?.targetBag.moisturePercent || 10.9}
      />
    </div>
  );
}
