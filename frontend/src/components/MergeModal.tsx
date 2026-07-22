'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mergeBags } from '../lib/api';
import { GitMerge, X } from 'lucide-react';

interface MergeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MergeModal({ isOpen, onClose }: MergeModalProps) {
  const queryClient = useQueryClient();

  const [sourceIds, setSourceIds] = useState('');
  const [targetCode, setTargetCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const mutation = useMutation({
    mutationFn: mergeBags,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bags'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      onClose();
      setSourceIds('');
      setTargetCode('');
      setErrorMsg('');
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to execute bag merge operation');
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ids = sourceIds
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (ids.length < 2) {
      setErrorMsg('You must enter at least 2 source bag UUIDs to perform a merge.');
      return;
    }

    if (!targetCode) {
      setErrorMsg('Please enter a unique target bag code.');
      return;
    }

    mutation.mutate({
      sourceBagIds: ids,
      targetBagCode: targetCode,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-xl border border-borderToken bg-surface shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-borderToken pb-4">
          <div className="flex items-center space-x-2">
            <GitMerge className="w-5 h-5 text-amberAccent" />
            <h2 className="text-base font-bold text-gray-100">Merge Coffee Bags</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-300 font-medium mb-1">
              Source Bag UUIDs (Comma separated, min 2)
            </label>
            <textarea
              rows={3}
              value={sourceIds}
              onChange={(e) => setSourceIds(e.target.value)}
              placeholder="e.g. uuid-1, uuid-2"
              className="w-full p-3 rounded-lg bg-background border border-borderToken text-gray-100 placeholder-gray-600 font-mono text-xs focus:outline-none focus:border-amberAccent"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">
              New Composite Target Bag Code
            </label>
            <input
              type="text"
              value={targetCode}
              onChange={(e) => setTargetCode(e.target.value)}
              placeholder="e.g. COMP-EXPORT-2026-99"
              className="w-full p-3 rounded-lg bg-background border border-borderToken text-gray-100 placeholder-gray-600 font-mono text-xs focus:outline-none focus:border-amberAccent"
            />
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-borderToken">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-borderToken text-gray-400 hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 rounded-lg bg-amberAccent text-gray-950 font-semibold hover:bg-amberAccent/90 disabled:opacity-50"
            >
              {mutation.isPending ? 'Merging...' : 'Execute Merge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
