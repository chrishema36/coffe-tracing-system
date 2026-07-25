'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { fetchBags, mergeBags } from '../lib/api';
import { CoffeeBag } from '../types';
import { GitMerge, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { ModalBody, ModalFooter, ModalForm, ModalHeader, ModalShell } from './ModalShell';

interface MergeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SourceDraft = {
  bagId: string;
  bagCode: string;
  availableKg: number;
  weightUsedKg: number;
  selected: boolean;
};

export function MergeModal({ isOpen, onClose }: MergeModalProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [targetCode, setTargetCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successLot, setSuccessLot] = useState<string | null>(null);
  const [sources, setSources] = useState<SourceDraft[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['mergeEligibleBags'],
    queryFn: () => fetchBags(1, 5, '', ''),
    enabled: isOpen,
  });

  const harvestedQuery = useQuery({
    queryKey: ['mergeBagsHarvested'],
    queryFn: () => fetchBags(1, 5, 'HARVESTED'),
    enabled: isOpen,
  });
  const storageQuery = useQuery({
    queryKey: ['mergeBagsStorage'],
    queryFn: () => fetchBags(1, 5, 'IN_STORAGE'),
    enabled: isOpen,
  });

  useEffect(() => {
    if (!isOpen) return;
    const bags: CoffeeBag[] = [
      ...(harvestedQuery.data?.data || []),
      ...(storageQuery.data?.data || []),
      ...(data?.data || []),
    ].filter((b) => b.currentWeightKg > 0 && b.status !== 'MERGED' && b.status !== 'EXPORTED');

    const unique = new Map<string, CoffeeBag>();
    bags.forEach((b) => unique.set(b.id, b));

    setSources(
      Array.from(unique.values()).map((b) => ({
        bagId: b.id,
        bagCode: b.bagCode,
        availableKg: b.currentWeightKg,
        weightUsedKg: b.currentWeightKg,
        selected: false,
      }))
    );
    setErrorMsg('');
    setSuccessLot(null);
    setTargetCode('');
  }, [isOpen, harvestedQuery.data, storageQuery.data, data]);

  const selectedSources = useMemo(() => sources.filter((s) => s.selected), [sources]);
  const totalWeight = selectedSources.reduce((sum, s) => sum + Number(s.weightUsedKg || 0), 0);

  const mutation = useMutation({
    mutationFn: mergeBags,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['bags'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      const lotCode = res.data?.bagCode || targetCode;
      setSuccessLot(lotCode);
      setErrorMsg('');
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to execute bag merge operation');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSources.length < 2) {
      setErrorMsg('Select at least 2 source bags to merge.');
      return;
    }
    if (!targetCode.trim()) {
      setErrorMsg('Please enter a unique target bag code.');
      return;
    }
    for (const s of selectedSources) {
      if (!s.weightUsedKg || s.weightUsedKg <= 0) {
        setErrorMsg(`Weight for ${s.bagCode} must be greater than 0.`);
        return;
      }
      if (s.weightUsedKg > s.availableKg + 1e-9) {
        setErrorMsg(`${s.bagCode} only has ${s.availableKg} kg available.`);
        return;
      }
    }

    mutation.mutate({
      targetBagCode: targetCode.trim(),
      sources: selectedSources.map((s) => ({
        bagId: s.bagId,
        weightUsedKg: Number(s.weightUsedKg),
      })),
    });
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} maxWidthClass="max-w-xl">
      <ModalHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2 min-w-0">
            <GitMerge className="w-5 h-5 text-amberAccent shrink-0" />
            <h2 className="text-base font-bold text-gray-100 truncate">Merge Coffee Bags</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-borderToken text-gray-400 hover:text-gray-200 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </ModalHeader>

      {successLot ? (
        <>
          <ModalBody>
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Merge completed
              </div>
              <p>
                Composite lot <span className="font-mono text-amberAccent">{successLot}</span> created (
                {totalWeight.toFixed(1)} kg).
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-borderToken text-gray-400 hover:text-gray-200 text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push(`/trace/${encodeURIComponent(successLot)}`);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amberAccent text-gray-950 font-semibold text-xs"
              >
                View lineage
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </ModalFooter>
        </>
      ) : (
        <ModalForm onSubmit={handleSubmit}>
          <ModalBody className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-gray-300 font-medium mb-2">
                Source bags (select ≥ 2, set kg to use)
              </label>
              {isLoading || harvestedQuery.isLoading ? (
                <div className="text-gray-500 py-6 text-center">Loading eligible bags...</div>
              ) : sources.length === 0 ? (
                <div className="text-gray-500 py-6 text-center border border-dashed border-borderToken rounded-lg">
                  No merge-eligible bags with available weight.
                </div>
              ) : (
                <div className="space-y-2">
                  {sources.map((s) => (
                    <label
                      key={s.bagId}
                      className={`flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 rounded-lg border transition-all ${
                        s.selected
                          ? 'border-amberAccent/50 bg-amberAccent/5'
                          : 'border-borderToken bg-background/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={s.selected}
                        onChange={(e) =>
                          setSources((prev) =>
                            prev.map((row) =>
                              row.bagId === s.bagId ? { ...row, selected: e.target.checked } : row
                            )
                          )
                        }
                        className="accent-amberAccent"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-mono font-bold text-amberAccent truncate">{s.bagCode}</div>
                        <div className="text-[10px] text-gray-500">Available {s.availableKg} kg</div>
                      </div>
                      <div className="flex items-center gap-2 ml-auto">
                        <input
                          type="number"
                          min={0.1}
                          step={0.1}
                          max={s.availableKg}
                          disabled={!s.selected}
                          value={s.weightUsedKg}
                          onChange={(e) =>
                            setSources((prev) =>
                              prev.map((row) =>
                                row.bagId === s.bagId
                                  ? { ...row, weightUsedKg: Number(e.target.value) }
                                  : row
                              )
                            )
                          }
                          className="w-20 sm:w-24 px-2 py-1.5 rounded-md bg-background border border-borderToken text-gray-100 font-mono disabled:opacity-40"
                        />
                        <span className="text-gray-500">kg</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <p className="mt-2 text-[10px] text-gray-500">
                Selected total:{' '}
                <span className="text-amberAccent font-mono font-bold">{totalWeight.toFixed(1)} kg</span>
              </p>
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1">New composite lot code</label>
              <input
                type="text"
                value={targetCode}
                onChange={(e) => setTargetCode(e.target.value)}
                placeholder="e.g. COMP-EXPORT-2026-99"
                className="w-full p-3 rounded-lg bg-background border border-borderToken text-gray-100 placeholder-gray-600 font-mono text-xs focus:outline-none focus:border-amberAccent"
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-borderToken text-gray-400 hover:text-gray-200 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="px-4 py-2 rounded-lg bg-amberAccent text-gray-950 font-semibold hover:bg-amberAccent/90 disabled:opacity-50 text-xs"
              >
                {mutation.isPending ? 'Merging...' : 'Execute Merge'}
              </button>
            </div>
          </ModalFooter>
        </ModalForm>
      )}
    </ModalShell>
  );
}
